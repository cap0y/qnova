import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Plus, Clock, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useConfirm } from "@/contexts/confirm-context";

interface ChatChannel {
  id: number;
  lastMessage: string;
  lastMessageAt: string;
  createdAt: string;
  status?: string; // active, closed
}

interface ChatHistoryListProps {
  onSelectChannel: (channelId: number) => void;
  onNewChat: () => void;
  selectedChannelId?: number | null;
}

export default function ChatHistoryList({ onSelectChannel, onNewChat, selectedChannelId }: ChatHistoryListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  
  const { data: channels, isLoading } = useQuery<ChatChannel[]>({
    queryKey: ["/api/chat/channels"],
    refetchInterval: 3000, // 3초마다 갱신하여 새 방 생성 확인
  });

  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: number) => {
      const response = await fetch(`/api/chat/channels/${channelId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("삭제에 실패했습니다.");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/channels"] });
      toast({
        title: "삭제 완료",
        description: "채팅방이 삭제되었습니다.",
      });
      // 현재 선택된 채널이 삭제되었다면 선택 해제는 부모 컴포넌트에서 처리하거나 여기서 콜백 호출 필요할 수 있음
      // 하지만 onSelectChannel(null) 같은 기능은 없으므로 일단 놔둠.
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "채팅방 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = async (e: React.MouseEvent, channelId: number) => {
    e.stopPropagation();
    const isConfirmed = await confirm({
      title: "채팅방 삭제",
      description: "정말 이 채팅방을 삭제하시겠습니까? 삭제된 내역은 복구할 수 없습니다.",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
    });

    if (isConfirmed) {
      deleteChannelMutation.mutate(channelId);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full border border-gray-100 shadow-sm bg-white flex flex-col">
        <CardHeader className="pb-3 border-b border-gray-50 bg-white sticky top-0 z-10">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">실시간 채팅 상담 내역</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 flex-1">
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-50 rounded-lg animate-pulse border border-gray-100" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 최신순 정렬
  const sortedChannels = channels ? [...channels].sort((a, b) => {
    const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
    const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
    return timeB - timeA;
  }) : [];

  return (
    <Card className="h-full border border-gray-200 shadow-sm bg-white flex flex-col overflow-hidden">
      <CardHeader className="pb-4 pt-5 px-5 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
        <CardTitle className="text-base font-bold flex items-center justify-between text-gray-900">
          <div className="flex items-center gap-2">
            <span>실시간 채팅 상담 내역</span>
          </div>
          <Button 
            size="sm" 
            className="h-8 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-3"
            onClick={onNewChat}
          >
            <Plus className="w-3.5 h-3.5" /> 새 상담
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative bg-gray-50/50">
        <ScrollArea className="h-full absolute inset-0">
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {sortedChannels.length > 0 ? (
              sortedChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className={`group relative bg-white rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md hover:border-blue-200 ${
                    selectedChannelId === channel.id 
                      ? "border-blue-500 ring-1 ring-blue-500 shadow-sm z-10" 
                      : "border-gray-200"
                  }`}
                >
                  {selectedChannelId === channel.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl" />
                  )}
                  
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-pink-50 text-pink-600 hover:bg-pink-100 border-pink-100 font-medium px-2 py-0.5 h-6">
                      채팅상담
                    </Badge>
                    <div className="flex items-center text-xs text-gray-400 gap-1.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(channel.lastMessageAt || channel.createdAt), "yyyy-MM-dd HH:mm")}
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-1 pr-16 text-[15px]">
                    {channel.lastMessage || "새로운 상담"}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <UserIcon />
                      <span>상담원: AI 챗봇</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-200 font-normal">
                      상담종료
                    </Badge>
                  </div>

                  {/* Hover effect arrow & Delete button */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={(e) => handleDelete(e, channel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <ChevronRight className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-1 md:col-span-3 flex flex-col items-center justify-center py-16 text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">아직 상담 내역이 없습니다.</p>
                <p className="text-xs text-gray-400 mt-1">궁금한 점이 있다면 새 상담을 시작해보세요.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={onNewChat}
                >
                  첫 상담 시작하기
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
