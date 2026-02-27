import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  User,
  LogOut,
  Menu,
  X,
  Mail,
  BookOpen,
  HeadphonesIcon,
  FileText,
  PenTool,
  HelpCircle,
  Building2,
  Shield,
  ShoppingCart,
  Zap,
  Download,
  Handshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MessagePanel from "@/components/messages/message-panel";

const mainMenuItems = [
  {
    name: "카테고리",
    href: "/categories",
    icon: <FileText className="w-5 h-5 text-blue-600" />,
  },
  {
    name: "영어",
    href: "/courses?category=english",
    icon: <BookOpen className="w-5 h-5 text-green-600" />,
  },
  {
    name: "국어",
    href: "/courses?category=korean",
    icon: <BookOpen className="w-5 h-5 text-purple-600" />,
  },
  {
    name: "수학",
    href: "/courses?category=math",
    icon: <BookOpen className="w-5 h-5 text-orange-600" />,
  },
  {
    name: "과학",
    href: "/courses?category=science",
    icon: <BookOpen className="w-5 h-5 text-red-600" />,
  },
  {
    name: "사회",
    href: "/courses?category=social",
    icon: <BookOpen className="w-5 h-5 text-yellow-600" />,
  },
];

interface MegaMenuItem {
  name: string;
  href: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const megaMenuItems: Array<{
  title: string;
  icon: React.ReactElement;
  items: MegaMenuItem[];
}> = [
  {
    title: "과목별 자료",
    icon: <BookOpen className="w-6 h-6 text-green-600 mb-2" />,
    items: [
      {
        name: "영어",
        href: "/courses?category=english",
        icon: <BookOpen className="w-4 h-4 text-green-600" />,
      },
      {
        name: "국어",
        href: "/courses?category=korean",
        icon: <BookOpen className="w-4 h-4 text-green-600" />,
      },
      {
        name: "수학",
        href: "/courses?category=math",
        icon: <BookOpen className="w-4 h-4 text-green-600" />,
      },
      {
        name: "과학",
        href: "/courses?category=science",
        icon: <BookOpen className="w-4 h-4 text-green-600" />,
      },
      {
        name: "사회",
        href: "/courses?category=social",
        icon: <BookOpen className="w-4 h-4 text-green-600" />,
      },
    ],
  },
  {
    title: "소개",
    icon: <Building2 className="w-6 h-6 text-blue-600 mb-2" />,
    items: [
      {
        name: "회사 소개",
        href: "/support/about",
        icon: <Building2 className="w-4 h-4 text-blue-600" />,
      },
      {
        name: "서비스 소개",
        href: "/services",
        icon: <Zap className="w-4 h-4 text-blue-600" />,
      },
      {
        name: "채용",
        href: "/careers",
        icon: <User className="w-4 h-4 text-blue-600" />,
      },
    ],
  },
  {
    title: "솔루션",
    icon: <Zap className="w-6 h-6 text-purple-600 mb-2" />,
    items: [
      {
        name: "Qnova 마켓",
        href: "/courses",
        icon: <ShoppingCart className="w-4 h-4 text-purple-600" />,
      },
      {
        name: "자료 보관함",
        href: "/mypage?tab=materials",
        icon: <Download className="w-4 h-4 text-purple-600" />,
      },
    ],
  },
  {
    title: "고객지원",
    icon: <HeadphonesIcon className="w-6 h-6 text-orange-600 mb-2" />,
    items: [
      {
        name: "FAQ",
        href: "/help",
        icon: <HelpCircle className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "개인정보처리방침",
        href: "/privacy-policy",
        icon: <Shield className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "이용약관",
        href: "/terms-of-service",
        icon: <FileText className="w-4 h-4 text-orange-600" />,
      },
      {
        name: "쿠키정책",
        href: "/cookie-policy",
        icon: <FileText className="w-4 h-4 text-orange-600" />,
      },
    ],
  },
  {
    title: "문의",
    icon: <Mail className="w-6 h-6 text-red-600 mb-2" />,
    items: [
      {
        name: "사업 제휴",
        href: "/business-partnership",
        icon: <Handshake className="w-4 h-4 text-red-600" />,
      },
      {
        name: "저자 신청",
        href: "/author-application",
        icon: <PenTool className="w-4 h-4 text-red-600" />,
      },
    ],
  },
];

export default function Header({
  onNotificationClick: _onNotificationClick,
}: {
  onNotificationClick?: () => void;
}) {
  const { user, logoutMutation } = useAuth();
  const { itemCount } = useCart();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [showMessagePanel, setShowMessagePanel] = useState(false);

  // 읽지 않은 쪽지 수 조회
  const { data: unreadMessageCount } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread/count"],
    enabled: !!user,
    refetchInterval: 30000, // 30초마다 갱신
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleMessageClick = () => {
    if (user) {
      setShowMessagePanel(true);
    } else {
      setLocation("/auth");
    }
  };

  return (
    <>
      <header className="relative z-50 animate-in slide-in-from-top duration-700 ease-out">
        {/* Top Bar - Gradient Bottom Border */}
        <div className="bg-white py-0.5 relative overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs">
              {/* QNOVA 및 선생님/학생 */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center relative group">
                  <div className="absolute -inset-2 bg-blue-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img 
                    src="/images/logo2.png" 
                    alt="QNOVA" 
                    className="h-10 w-auto relative z-10 transition-transform duration-500 hover:rotate-[360deg] hover:scale-110" 
                  />
                </Link>
              </div>
              
              {/* 검색 바 */}
              <form onSubmit={handleSearch} className="hidden md:block w-full max-w-md group">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500" />
                  <div className="relative bg-white rounded-full">
                    <Input
                      type="text"
                      placeholder="문제, 교재, 브랜드 검색"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-full text-gray-900 text-sm border border-gray-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              </form>
              
              {/* 쪽지 및 장바구니 */}
              <div className="flex items-center space-x-6">
              <button
                onClick={handleMessageClick}
                className="flex items-center text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors space-x-1 md:space-x-1"
              >
                {user && unreadMessageCount && unreadMessageCount.count > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-red-500 text-white border-none"
                  >
                    {unreadMessageCount.count}
                  </Badge>
                )}
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">쪽지</span>
              </button>
              <Link
                href="/cart"
                className="flex items-center text-sm text-gray-700 hover:text-gray-900 space-x-1 md:space-x-1"
              >
                {itemCount > 0 && (
                  <Badge
                    variant="outline"
                    className="bg-red-500 text-white border-none"
                  >
                    {itemCount}
                  </Badge>
                )}
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">장바구니</span>
              </Link>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900 text-sm">
                      <User className="h-4 w-4 mr-1" />
                      <span>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="mt-1">
                          관리자
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={user.userType === "business" ? "/business-dashboard" : "/mypage"} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        {user.userType === "business" ? "선생님 대시보드" : "마이페이지"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMessageClick}>
                      <Mail className="mr-2 h-4 w-4" />
                      쪽지함
                      {unreadMessageCount && unreadMessageCount.count > 0 && (
                        <Badge
                          variant="destructive"
                          className="ml-auto text-xs"
                        >
                          {unreadMessageCount.count}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/super-admin" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-red-600" />
                          슈퍼 관리자
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={logoutMutation?.isPending}
                      className="text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation?.isPending
                        ? "로그아웃 중..."
                        : "로그아웃"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button variant="ghost" className="text-gray-700 hover:text-gray-900 text-sm">
                    로그인
                  </Button>
                </Link>
              )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation - 가운데 정렬 */}
        <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-40 transition-all duration-300 animate-in fade-in zoom-in-95 duration-500 delay-100">
          <div className="container mx-auto px-4">
            <div className="hidden md:flex justify-center items-center space-x-2 mx-auto py-1">
              {mainMenuItems.map((item) => {
                // 메가 메뉴 매핑
                const getMegaMenuTitle = (name: string) => {
                  if (name === "카테고리") return "카테고리";
                  if (["영어", "국어", "수학", "과학", "사회"].includes(name)) return "과목별 자료";
                  return null;
                };
                
                const megaMenuTitle = getMegaMenuTitle(item.name);
                
                return (
                  <div
                    key={item.name}
                    className="relative group"
                    onMouseEnter={() => megaMenuTitle && setHoveredMenu(megaMenuTitle)}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300" />
                    <Link href={item.href}>
                      <button className="relative px-4 py-2.5 text-gray-600 hover:text-blue-600 font-medium flex items-center justify-center space-x-2 whitespace-nowrap transition-colors group-hover:scale-105 transform duration-200">
                        <span className="relative z-10 transition-transform group-hover:-translate-y-0.5 duration-200">{item.icon}</span>
                        <span className="relative z-10">{item.name}</span>
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Mega Menu - 가운데 정렬 */}
        {hoveredMenu && (
          <div
            className="absolute w-full bg-white/95 backdrop-blur-xl shadow-xl border-t border-blue-100/50 z-40 left-0 transition-all duration-300 ease-in-out transform origin-top"
            onMouseEnter={() => setHoveredMenu(hoveredMenu)}
            onMouseLeave={() => setHoveredMenu(null)}
            style={{ top: "100%" }}
          >
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-5 gap-8">
                  {megaMenuItems.map((menu, index) => (
                    <div
                      key={menu.title}
                      className={cn(
                        "space-y-4 text-center group/column relative p-4 rounded-xl transition-all duration-300 hover:bg-slate-50/50",
                        hoveredMenu === "카테고리" || hoveredMenu === menu.title ? "opacity-100 scale-100" : "opacity-60 scale-95 blur-[1px]",
                        index < megaMenuItems.length - 1
                          ? "after:content-[''] after:absolute after:right-0 after:top-1/4 after:bottom-1/4 after:w-[1px] after:bg-gradient-to-b after:from-transparent after:via-gray-200 after:to-transparent"
                          : "",
                      )}
                    >
                      <div className="flex flex-col items-center space-y-3 mb-2 relative group/icon">
                        <div className="absolute -inset-4 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-xl opacity-0 group-hover/icon:opacity-100 transition duration-500" />
                        <div className="relative w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center group-hover/icon:scale-110 group-hover/icon:rotate-3 transition-all duration-300 z-10">
                          {menu.icon}
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover/column:from-blue-600 group-hover/column:to-purple-600 transition-all duration-300">
                          {menu.title}
                        </h3>
                      </div>
                      <ul className="space-y-1">
                        {menu.items.map(
                          (item) =>
                            (!item.adminOnly ||
                              (item.adminOnly && user?.isAdmin)) &&
                            (!item.superAdminOnly ||
                              (item.superAdminOnly &&
                                user?.role === "admin")) && (
                              <li key={item.name}>
                                <Link href={item.href}>
                                  <div className="relative px-3 py-2 rounded-lg group/item overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-transparent translate-x-[-100%] group-hover/item:translate-x-0 transition-transform duration-300" />
                                    <div className="relative flex items-center justify-center space-x-2 text-sm text-gray-500 group-hover/item:text-blue-600 transition-colors">
                                      <span className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-xs">
                                        {item.icon}
                                      </span>
                                      <span>{item.name}</span>
                                    </div>
                                  </div>
                                </Link>
                              </li>
                            ),
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <button
          className="md:hidden fixed top-8 right-4 z-50 bg-white p-2 rounded-full shadow-lg"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-y-0 bg-white z-40 md:hidden overflow-y-auto pt-16 w-1/2 shadow-lg">
            <div className="px-4 py-4">
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="교육과정 검색"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
              </form>
              <div className="space-y-4">
                {megaMenuItems.map((menu) => (
                  <div key={menu.title} className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      {menu.icon}
                      <h3 className="font-semibold text-base">{menu.title}</h3>
                    </div>
                    <ul className="space-y-2 pl-8">
                      {menu.items.map(
                        (item) =>
                          (!item.adminOnly ||
                            (item.adminOnly && user?.isAdmin)) &&
                          (!item.superAdminOnly ||
                            (item.superAdminOnly &&
                              user?.role === "admin")) && (
                            <li key={item.name}>
                              <Link href={item.href}>
                                <div
                                  className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                >
                                  <span>{item.name}</span>
                                </div>
                              </Link>
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Message Panel Modal */}
      {showMessagePanel && (
        <MessagePanel onClose={() => setShowMessagePanel(false)} />
      )}
    </>
  );
}

