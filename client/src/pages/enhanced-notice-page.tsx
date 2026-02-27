import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Calendar,
  Pin,
  MessageSquare,
  Bell,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Notice 타입 정의
interface Notice {
  id: string;
  title: string;
  content?: string;
  category: string;
  date: string;
  author?: string;
  isImportant: boolean;
  attachments?: { name: string }[];
}

interface NoticesResponse {
  notices: Notice[];
}

export default function EnhancedNoticePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showNoticeDetail, setShowNoticeDetail] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const { data: notices, isLoading } = useQuery<NoticesResponse>({
    queryKey: ["/api/notices"],
  });

  const categories = [
    { id: "all", name: "전체", count: notices?.notices?.length || 0 },
    {
      id: "notice",
      name: "공지사항",
      count:
        notices?.notices?.filter((n: Notice) => n.category === "notice")
          .length || 0,
    },
    {
      id: "announcement",
      name: "안내",
      count:
        notices?.notices?.filter((n: Notice) => n.category === "announcement")
          .length || 0,
    },
    {
      id: "update",
      name: "업데이트",
      count:
        notices?.notices?.filter((n: Notice) => n.category === "update")
          .length || 0,
    },
    {
      id: "event",
      name: "이벤트",
      count:
        notices?.notices?.filter((n: Notice) => n.category === "event")
          .length || 0,
    },
  ];

  const filteredNotices =
    notices?.notices?.filter((notice: Notice) => {
      const matchesCategory =
        selectedCategory === "all" || notice.category === selectedCategory;
      const matchesSearch =
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.content?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }) || [];

  const importantNotices =
    notices?.notices?.filter((notice: Notice) => notice.isImportant) || [];

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowNoticeDetail(true);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "notice":
        return "default";
      case "announcement":
        return "secondary";
      case "update":
        return "outline";
      case "event":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "notice":
        return Bell;
      case "announcement":
        return MessageSquare;
      case "update":
        return FileText;
      case "event":
        return Calendar;
      default:
        return FileText;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/uploads/images/0825ee8fe975553a161b23b57dd9773f_1750405130302.jpg"
            alt="Notice Board"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">공지사항</h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              플랫폼의 최신 소식과 중요한 안내사항을 확인하세요.
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="공지사항 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-black"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Important Notices */}
        {importantNotices.length > 0 && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <Pin className="h-5 w-5" />
                <span>중요 공지</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {importantNotices.slice(0, 3).map((notice: Notice) => (
                  <div
                    key={notice.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200 cursor-pointer hover:bg-red-50"
                    onClick={() => handleNoticeClick(notice)}
                  >
                    <div className="flex items-center space-x-3">
                      <Pin className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-800">
                        {notice.title}
                      </span>
                    </div>
                    <span className="text-sm text-red-600">{notice.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>카테고리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "ghost"
                      }
                      className="w-full justify-between"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="outline" className="ml-auto">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>빠른 메뉴</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setChatDialogOpen(true)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  1:1 문의
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  FAQ
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  이벤트
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="제목이나 내용으로 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500">
                총 {filteredNotices.length}개의 공지사항
              </div>
            </div>

            {/* Notice List */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="space-y-4 p-6">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : filteredNotices.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      검색 결과가 없습니다
                    </h3>
                    <p className="text-gray-500">
                      다른 검색어나 카테고리로 다시 시도해보세요.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredNotices.map((notice: Notice) => {
                      const CategoryIcon = getCategoryIcon(notice.category);
                      return (
                        <div
                          key={notice.id}
                          className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleNoticeClick(notice)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <CategoryIcon className="h-4 w-4 text-gray-500" />
                                <Badge
                                  variant={getCategoryBadgeColor(
                                    notice.category,
                                  )}
                                >
                                  {notice.category}
                                </Badge>
                                {notice.isImportant && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    중요
                                  </Badge>
                                )}
                              </div>

                              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                {notice.title}
                              </h3>

                              {notice.content && (
                                <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                  {notice.content.substring(0, 150)}...
                                </p>
                              )}

                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{notice.date}</span>
                                </div>
                                {notice.author && (
                                  <span>작성자: {notice.author}</span>
                                )}
                              </div>
                            </div>

                            <div className="ml-4 text-right">
                              <Button variant="outline" size="sm">
                                자세히 보기
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={showNoticeDetail} onOpenChange={setShowNoticeDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedNotice && (
            <>
              <DialogHeader>
                <div className="flex items-center space-x-3 mb-4">
                  <Badge
                    variant={getCategoryBadgeColor(selectedNotice.category)}
                  >
                    {selectedNotice.category}
                  </Badge>
                  {selectedNotice.isImportant && (
                    <Badge variant="destructive">중요</Badge>
                  )}
                </div>
                <DialogTitle className="text-xl">
                  {selectedNotice.title}
                </DialogTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>작성일: {selectedNotice.date}</span>
                  {selectedNotice.author && (
                    <span>작성자: {selectedNotice.author}</span>
                  )}
                </div>
              </DialogHeader>

              <Separator className="my-4" />

              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedNotice.content || "공지사항 내용이 없습니다."}
                </div>
              </div>

              {selectedNotice.attachments &&
                selectedNotice.attachments.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h4 className="font-medium mb-3">첨부파일</h4>
                      <div className="space-y-2">
                        {selectedNotice.attachments.map(
                          (file: { name: string }, index: number) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2 p-2 border rounded"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <Button variant="outline" size="sm">
                                다운로드
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </>
                )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>1:1 문의</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inquiry-message">문의 내용</Label>
              <Textarea
                id="inquiry-message"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="문의하실 내용을 입력해주세요"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChatDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                // Handle message submission
                setChatDialogOpen(false);
                setChatMessage("");
              }}
            >
              문의 제출
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
