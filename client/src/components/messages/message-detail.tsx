import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ArrowLeft, Reply, Trash2, User } from "lucide-react";
import MessageCompose from "./message-compose";

interface MessageDetailProps {
  message: {
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
  };
  onClose: () => void;
  onBack: () => void;
  onDelete: (messageId: number) => void;
  currentUserId: number;
}

export default function MessageDetail({
  message,
  onClose,
  onBack,
  onDelete,
  currentUserId,
}: MessageDetailProps) {
  const [showReply, setShowReply] = useState(false);

  const isReceived = message.receiverId === currentUserId;
  const isSent = message.senderId === currentUserId;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    if (confirm("이 쪽지를 삭제하시겠습니까?")) {
      onDelete(message.id);
    }
  };

  if (showReply) {
    return (
      <MessageCompose
        onClose={onClose}
        onBack={() => setShowReply(false)}
        replyTo={{
          receiverId: message.senderId,
          receiverName: message.senderName || "알 수 없음",
          originalSubject: message.subject,
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl h-[80vh] max-h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg">쪽지 상세</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {isReceived && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReply(true)}
              >
                <Reply className="h-4 w-4 mr-1" />
                답장
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              삭제
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* 메시지 헤더 */}
            <div className="space-y-4 pb-4 border-b">
              {/* 제목 */}
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  {message.subject}
                </h2>
                <div className="flex items-center gap-2">
                  {!message.isRead && isReceived && (
                    <Badge variant="destructive" className="text-xs">
                      새 메시지
                    </Badge>
                  )}
                  {message.isRead && isSent && (
                    <Badge variant="outline" className="text-xs">
                      읽음
                    </Badge>
                  )}
                </div>
              </div>

              {/* 발송자/수신자 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {isReceived ? "보낸 사람" : "받는 사람"}
                    </span>
                  </div>
                  <div className="pl-6">
                    <div className="font-medium">
                      {isReceived ? message.senderName : message.receiverName}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {isReceived ? message.senderEmail : message.receiverEmail}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-600 mb-1">
                    전송 시간
                  </div>
                  <div className="pl-0">
                    <div>{formatDateTime(message.createdAt)}</div>
                    {message.readAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        읽음: {formatDateTime(message.readAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 메시지 내용 */}
            <div className="flex-1 py-4">
              <ScrollArea className="h-full">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* 하단 액션 버튼 */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-xs text-gray-500">쪽지 ID: {message.id}</div>
              <div className="flex gap-2">
                {isReceived && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setShowReply(true)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    답장하기
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
