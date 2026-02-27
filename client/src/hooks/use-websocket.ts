import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";
import { useToast } from "./use-toast";

interface WebSocketMessage {
  type: string;
  title?: string;
  message?: string;
  data?: any;
  timestamp?: string;
}

export function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.hostname;
      const isLocal = host === "localhost" || host === "127.0.0.1";
      const port = window.location.port || (isLocal ? "5000" : "");
      const wsUrl = port ? `${protocol}//${host}:${port}/ws` : `${protocol}//${host}/ws`;

      console.log("Connecting to WebSocket:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Authenticate user
        if (user) {
          ws.send(
            JSON.stringify({
              type: "auth",
              userId: user.id,
              isAdmin: user.isAdmin,
            }),
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          // Handle different message types
          if (message.type === "admin_notification" && user?.isAdmin) {
            // Show toast notification for admins
            toast({
              title: message.title || "새 알림",
              description: message.message,
            });

            // Add to notifications list
            setNotifications((prev) => [message, ...prev.slice(0, 19)]); // Keep only 20 recent notifications
          } else if (message.type === "user_notification") {
            // Show toast notification for users
            toast({
              title: message.title || "알림",
              description: message.message,
            });

            setNotifications((prev) => [message, ...prev.slice(0, 19)]);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          console.log(
            `Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current})`,
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.log("Max reconnection attempts reached");
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      setSocket(ws);
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [user?.id]);

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    socket,
    isConnected,
    notifications,
    sendMessage,
    clearNotifications,
  };
}
