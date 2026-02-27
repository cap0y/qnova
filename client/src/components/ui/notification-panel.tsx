import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, X, Check, AlertCircle, Info, Calendar, BookOpen, CreditCard } from "lucide-react";

interface NotificationPanelProps {
  onClose: () => void;
}

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch real notifications (when API is available)
  const { data: realNotifications, isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    enabled: !!user,
    // This will fail gracefully until the API endpoint is implemented
    retry: false,
  });

  // Generate some realistic notifications based on user activity
  useEffect(() => {
    if (user) {
      const userNotifications: Notification[] = [
        {
          id: 1,
          type: 'info',
          title: '새로운 교육과정 등록',
          message: '2025 교육과정 개정안 이해와 적용 과정이 새롭게 개설되었습니다.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isRead: false,
          actionUrl: '/courses',
          actionText: '과정 보기'
        },
        {
          id: 2,
          type: 'success',
          title: '수강 신청 완료',
          message: '디지털 교육 도구 활용 워크숍 수강 신청이 완료되었습니다.',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          isRead: false,
          actionUrl: '/mypage',
          actionText: '내 과정 보기'
        },
        {
          id: 3,
          type: 'warning',
          title: '세미나 참가 알림',
          message: '내일 예정된 "교육혁신 컨퍼런스"를 잊지 마세요.',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          isRead: true,
          actionUrl: '/seminars',
          actionText: '세미나 정보'
        }
      ];

      // Add admin-specific notifications
      if (user.isAdmin) {
        userNotifications.unshift({
          id: 4,
          type: 'info',
          title: '새로운 회원 가입',
          message: '3명의 신규 회원이 가입했습니다.',
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          isRead: false,
          actionUrl: '/admin',
          actionText: '관리자 페이지'
        });
      }

      setNotifications(userNotifications);
    }
  }, [user]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / (24 * 60))}일 전`;
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="fixed top-16 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-30 notification-enter">
      <Card className="border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">알림</CardTitle>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary hover:text-blue-700 self-start p-0 h-auto"
              onClick={markAllAsRead}
            >
              모두 읽음으로 표시
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="max-h-80">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start space-x-3 p-3">
                      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">새로운 알림이 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full ${getNotificationBadgeColor(notification.type)}`}></div>
                      )}
                      
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium text-gray-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          {notification.actionUrl && notification.actionText && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-primary hover:text-blue-700 p-0 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = notification.actionUrl!;
                              }}
                            >
                              {notification.actionText}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer */}
          <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs text-gray-600 hover:text-gray-800"
              onClick={() => {
                onClose();
                // Navigate to notifications page when implemented
                // window.location.href = '/notifications';
              }}
            >
              모든 알림 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
