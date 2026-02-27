import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "../shared/schema.js";

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    try {
      const url = new URL(request.url!, `http://${request.headers.host || "localhost"}`);
      if (url.pathname === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      }
    } catch (err) {
      console.error("WebSocket upgrade error:", err);
    }
  });

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("New WebSocket connection established");

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("message", async (data: string) => {
      try {
        const message = JSON.parse(data);

        if (message.type === "auth") {
          // Store user authentication info
          (ws as any).userId = message.userId;
          (ws as any).isAdmin = message.isAdmin;
          console.log(
            `User ${message.userId} authenticated, admin: ${message.isAdmin}`,
          );
        } else if (message.type === "chat") {
          let channelId = message.channelId;
          const userId = message.userId;

          // 채널 ID가 없으면 새로 생성 (사용자인 경우)
          if (!channelId && userId) {
            const newChannel = await storage.createChatChannel(userId);
            channelId = newChannel.id;

            // 클라이언트에게 새 채널 정보 전송
            ws.send(
              JSON.stringify({
                type: "channel_created",
                data: newChannel,
              }),
            );
          }

          if (!channelId) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Channel ID is required",
              }),
            );
            return;
          }

          // Validate and save chat message
          const chatMessage = insertChatMessageSchema.parse({
            channelId: channelId,
            userId: message.userId,
            message: message.message,
            isAdmin: message.isAdmin || false,
          });

          const savedMessage = await storage.createChatMessage(chatMessage);

          // Broadcast to relevant clients
          const broadcastData = JSON.stringify({
            type: "chat",
            data: savedMessage,
            channelId: channelId,
          });

          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              const clientUserId = (client as any).userId;
              const clientIsAdmin = (client as any).isAdmin;

              // 관리자이거나 메시지 당사자에게 전송
              // (실제로는 채널 소유자 확인이 더 정확하지만, 여기서는 메시지 보낸 사람이 소유자라고 가정)
              if (clientIsAdmin || clientUserId === userId) {
                try {
                  client.send(broadcastData);
                } catch (sendError) {
                  console.error("Failed to send message to client:", sendError);
                }
              }
            }
          });
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        try {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid message format",
            }),
          );
        } catch (sendError) {
          console.error("Failed to send error message:", sendError);
        }
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    // Send welcome message
    try {
      ws.send(
        JSON.stringify({
          type: "connected",
          message: "WebSocket connection established",
        }),
      );
    } catch (error) {
      console.error("Failed to send welcome message:", error);
    }
  });

  return wss;
}

// Send notification to all admin users
export function sendAdminNotification(notification: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  if (!wss) return;

  const adminNotification = {
    ...notification,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && (client as any).isAdmin) {
      client.send(JSON.stringify(adminNotification));
    }
  });
}

// Send notification to specific user
export function sendUserNotification(
  userId: number,
  notification: {
    type: string;
    title: string;
    message: string;
    data?: any;
  },
) {
  if (!wss) return;

  const userNotification = {
    ...notification,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      (client as any).userId === userId
    ) {
      client.send(JSON.stringify(userNotification));
    }
  });
}
