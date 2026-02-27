import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Bell, Calendar, BookOpen } from "lucide-react";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const notifications = [
    {
      id: 1,
      type: "course",
      title: "새로운 교육과정이 개설되었습니다",
      message: "AI 시대의 교육 혁신 과정이 8월 15일에 시작됩니다.",
      time: "2시간 전",
      unread: true,
    },
    {
      id: 2,
      type: "seminar",
      title: "세미나 신청 마감 안내",
      message: "디지털 교육혁신 컨퍼런스 신청이 내일 마감됩니다.",
      time: "1일 전",
      unread: true,
    },
    {
      id: 3,
      type: "system",
      title: "수료증 발급 완료",
      message:
        "2025 교육과정 개정안 이해와 적용 과정의 수료증이 발급되었습니다.",
      time: "3일 전",
      unread: false,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <Card className="w-96 max-h-[80vh] overflow-hidden shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>알림</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                  notification.unread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {notification.type === "course" && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                    )}
                    {notification.type === "seminar" && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                    {notification.type === "system" && (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Bell className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <span className="text-xs text-gray-400">
                      {notification.time}
                    </span>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-gray-50">
            <Button variant="outline" className="w-full" size="sm">
              모든 알림 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
