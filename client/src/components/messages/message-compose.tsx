import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, ArrowLeft, Send, Search } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MessageComposeProps {
  onClose: () => void;
  onBack: () => void;
  replyTo?: {
    receiverId: number;
    receiverName: string;
    originalSubject: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  userType: string;
  organizationName?: string;
}

export default function MessageCompose({
  onClose,
  onBack,
  replyTo,
}: MessageComposeProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState<User | null>(
    replyTo
      ? {
          id: replyTo.receiverId,
          name: replyTo.receiverName,
          email: "",
          userType: "",
        }
      : null,
  );
  const [subject, setSubject] = useState(
    replyTo
      ? replyTo.originalSubject.startsWith("Re: ")
        ? replyTo.originalSubject
        : `Re: ${replyTo.originalSubject}`
      : "",
  );
  const [content, setContent] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(!replyTo);

  // 사용자 검색
  const { data: searchResults } = useQuery<User[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) return [];
      const res = await apiRequest(
        "GET",
        `/api/users/search?q=${encodeURIComponent(searchQuery)}`,
      );
      return await res.json();
    },
    enabled: !!searchQuery.trim() && showUserSearch,
  });

  // 쪽지 보내기
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: {
      receiverId: number;
      subject: string;
      content: string;
    }) => {
      const res = await apiRequest("POST", "/api/messages", messageData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/unread/count"],
      });
      toast({
        title: "쪽지 전송 완료",
        description: "쪽지가 성공적으로 전송되었습니다.",
      });
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: "전송 실패",
        description:
          error?.response?.data?.message || "쪽지 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSelectReceiver = (receiver: User) => {
    setSelectedReceiver(receiver);
    setShowUserSearch(false);
    setSearchQuery("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReceiver) {
      toast({
        title: "받는 사람 선택",
        description: "받는 사람을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim()) {
      toast({
        title: "제목 입력",
        description: "제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "내용 입력",
        description: "내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    sendMessageMutation.mutate({
      receiverId: selectedReceiver.id,
      subject: subject.trim(),
      content: content.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>쪽지 쓰기</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 받는 사람 */}
            <div className="space-y-2">
              <Label>받는 사람</Label>
              {selectedReceiver ? (
                <div className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{selectedReceiver.name}</span>
                    {selectedReceiver.organizationName && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({selectedReceiver.organizationName})
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedReceiver(null);
                      setShowUserSearch(true);
                    }}
                  >
                    변경
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      placeholder="이름 또는 이메일로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>

                  {searchResults && searchResults.length > 0 && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => handleSelectReceiver(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{user.name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {user.email}
                              </span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {user.userType === "business" ? "선생님" : "개인"}
                            </Badge>
                          </div>
                          {user.organizationName && (
                            <div className="text-xs text-gray-500 mt-1">
                              {user.organizationName}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery &&
                    searchResults &&
                    searchResults.length === 0 && (
                      <div className="text-sm text-gray-500 p-2">
                        검색 결과가 없습니다.
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="subject">제목</Label>
              <Input
                id="subject"
                placeholder="제목을 입력해주세요"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={100}
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                placeholder="내용을 입력해주세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                maxLength={2000}
              />
              <div className="text-xs text-gray-500 text-right">
                {content.length}/2000
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onBack}>
                취소
              </Button>
              <Button
                type="submit"
                disabled={sendMessageMutation.isPending || !selectedReceiver}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMessageMutation.isPending ? "전송 중..." : "전송"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
