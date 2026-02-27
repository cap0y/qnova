import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageCircle, X, Send, Minimize2, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id?: number;
  userId?: number;
  username?: string;
  message: string;
  isAdmin?: boolean;
  createdAt?: string;
  type?: "message" | "system";
}

interface ChatWidgetProps {
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
  channelId?: number | null;
  onChannelSelect?: (channelId: number | null) => void;
}

export default function ChatWidget({ isOpen: propIsOpen, onToggle: propOnToggle, channelId, onChannelSelect }: ChatWidgetProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // UI State
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // 외부에서 제어되는 경우(propIsOpen이 undefined가 아님)와 내부 상태 통합
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (propOnToggle) {
      propOnToggle(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Refs
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Load messages when channelId changes
  useEffect(() => {
    if (channelId) {
      fetch(`/api/chat/channels/${channelId}/messages`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setMessages(data);
          }
        })
        .catch(err => console.error("Failed to load messages:", err));
    } else {
      // New chat or default state
      setMessages([]);
    }
  }, [channelId]);

  // WebSocket Connection Logic
  const connectWebSocket = () => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    // 개발 환경 포트 처리
    const port = window.location.port || (host === "localhost" ? "5000" : "");
    const wsUrl = `${protocol}//${host}${port ? `:${port}` : ""}/ws`;

    console.log("Connecting to chat server:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log("Chat connected");
        
        // 인증 메시지 전송
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          isAdmin: user.isAdmin
        }));

        // 접속 시 안내 메시지
        setMessages(prev => [
          ...prev, 
          { message: "채팅 서버에 연결되었습니다.", type: "system" }
        ]);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === "chat") {
            setMessages(prev => [...prev, data.data]);
            if (!isOpen) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (data.type === "channel_created") {
            // 새 채널 생성 시 부모 컴포넌트에 알림
            if (onChannelSelect && data.data.id) {
              onChannelSelect(data.data.id);
            }
          } else if (data.type === "history") {
            // 채팅 기록 로드
            setMessages(data.data || []);
          }
        } catch (e) {
          console.error("Message parse error", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("Chat disconnected");
        // 재연결 시도
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.error("Chat error", err);
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.error("WebSocket create error", e);
    }
  };

  useEffect(() => {
    if (user) {
      connectWebSocket();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSendMessage = () => {
    if (!message.trim() || !wsRef.current || !isConnected) return;

    const payload = {
      type: "chat",
      message: message.trim(),
      userId: user?.id,
      username: user?.username || "User",
      channelId: channelId // Include active channel ID if exists
    };

    wsRef.current.send(JSON.stringify(payload));
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!user) return null; // 로그인한 사용자만 보임

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-700 shadow-xl flex items-center justify-center text-white transition-transform hover:scale-105 relative"
        >
          <MessageCircle className="h-7 w-7" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-[360px] shadow-2xl flex flex-col overflow-hidden border-0 ring-1 ring-black/5 transition-all duration-300 ${isMinimized ? "h-14" : "h-[500px]"}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-gray-900 text-white shrink-0 cursor-pointer" onClick={() => !isMinimized && setIsMinimized(true)}>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MessageCircle className="h-5 w-5 text-blue-400" />
              {isConnected && <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-gray-900"></span>}
            </div>
            <h3 className="font-semibold text-sm">실시간 채팅</h3>
          </div>
          <div className="flex items-center" onClick={e => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-300 hover:text-white hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 bg-gray-50 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <p>대화를 시작해보세요!</p>
                  </div>
                )}
                
                {messages.map((msg, idx) => {
                  if (msg.type === "system") {
                    return (
                      <div key={idx} className="flex justify-center my-2">
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {msg.message}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.userId === user.id;
                  
                  return (
                    <div key={idx} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                      {!isMe && (
                        <Avatar className="h-8 w-8 mt-1">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {msg.username?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`flex flex-col max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                        {!isMe && <span className="text-[10px] text-gray-500 ml-1 mb-0.5">{msg.username}</span>}
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm break-words shadow-sm ${
                            isMe
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                          }`}
                        >
                          {msg.message}
                        </div>
                        {msg.createdAt && (
                          <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isConnected ? "메시지 입력..." : "연결 중..."}
                className="flex-1 bg-gray-50 border-gray-200 focus:bg-white text-sm"
                disabled={!isConnected}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || !isConnected}
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 w-10 h-10 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
