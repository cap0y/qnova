import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Mail, Send, Trash2, MailOpen, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MessageCompose from "./message-compose";
import MessageDetail from "./message-detail";

interface MessagePanelProps {
  onClose: () => void;
}

interface PrivateMessage {
  id: number;
  senderId: number;
  receiverId: number;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  senderName?: string;
  senderEmail?: string;
  receiverName?: string;
  receiverEmail?: string;
}

export default function MessagePanel({ onClose }: MessagePanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("received");
  const [selectedMessage, setSelectedMessage] = useState<PrivateMessage | null>(
    null,
  );
  const [showCompose, setShowCompose] = useState(false);

  // 받은 쪽지 조회
  const { data: receivedMessages, isLoading: receivedLoading } = useQuery<
    PrivateMessage[]
  >({
    queryKey: ["/api/messages", "received"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages?type=received");
      return await res.json();
    },
    enabled: !!user,
  });

  // 보낸 쪽지 조회
  const { data: sentMessages, isLoading: sentLoading } = useQuery<
    PrivateMessage[]
  >({
    queryKey: ["/api/messages", "sent"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages?type=sent");
      return await res.json();
    },
    enabled: !!user,
  });

  // 읽지 않은 쪽지 수 조회
  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
    refetchInterval: 30000, // 30초마다 갱신
  });

  // 쪽지 읽음 처리
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PATCH", `/api/messages/${messageId}/read`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/unread/count"],
      });
    },
  });

  // 쪽지 삭제
  const deleteMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      type,
    }: {
      messageId: number;
      type: "sender" | "receiver";
    }) => {
      const res = await apiRequest(
        "DELETE",
        `/api/messages/${messageId}?type=${type}`,
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      toast({
        title: "쪽지 삭제 완료",
        description: "쪽지가 삭제되었습니다.",
      });
      setSelectedMessage(null);
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "쪽지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / (24 * 60))}일 전`;
    }
  };

  const handleMessageClick = (message: PrivateMessage) => {
    setSelectedMessage(message);

    // 받은 메시지이고 읽지 않았다면 읽음 처리
    if (message.receiverId === user?.id && !message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    if (!selectedMessage) return;

    const type = selectedMessage.senderId === user?.id ? "sender" : "receiver";
    deleteMessageMutation.mutate({ messageId, type });
  };

  if (showCompose) {
    return (
      <MessageCompose
        onClose={() => setShowCompose(false)}
        onBack={() => setShowCompose(false)}
      />
    );
  }

  if (selectedMessage) {
    return (
      <MessageDetail
        message={selectedMessage}
        onClose={onClose}
        onBack={() => setSelectedMessage(null)}
        onDelete={handleDeleteMessage}
        currentUserId={user?.id || 0}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl h-[80vh] max-h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            쪽지함
            {unreadCount && unreadCount.count > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount.count}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompose(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              쪽지 쓰기
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="received" className="flex items-center gap-2">
                <MailOpen className="h-4 w-4" />
                받은 쪽지
                {unreadCount && unreadCount.count > 0 && (
                  <Badge variant="destructive" className="ml-1 text-xs">
                    {unreadCount.count}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                보낸 쪽지
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                {receivedLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : !receivedMessages || receivedMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    받은 쪽지가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {receivedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                          !message.isRead ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-sm font-medium ${!message.isRead ? "font-semibold" : ""}`}
                              >
                                {message.senderName}
                              </span>
                              {!message.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <h4
                              className={`text-sm ${!message.isRead ? "font-semibold" : ""} truncate`}
                            >
                              {message.subject}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {message.content.substring(0, 50)}...
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {formatTimeAgo(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="sent" className="flex-1 mt-4">
              <ScrollArea className="h-full">
                {sentLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">로딩 중...</div>
                  </div>
                ) : !sentMessages || sentMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    보낸 쪽지가 없습니다.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {message.receiverName}
                              </span>
                              {message.isRead && (
                                <Badge variant="outline" className="text-xs">
                                  읽음
                                </Badge>
                              )}
                            </div>
                            <h4 className="text-sm truncate">
                              {message.subject}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {message.content.substring(0, 50)}...
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {formatTimeAgo(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
