import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  MessageCircle,
  Bell,
  Lock,
  Reply,
  File,
  HelpCircle,
  Grid3X3,
  Package,
  Truck,
  CreditCard,
  Repeat,
  Settings,
  Plus,
  Megaphone,
  Shield,
  FileText,
  Database,
  BookOpen,
  MessageSquare,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import ChatHistoryList from "@/components/chat-history-list";
import ChatWidget from "@/components/chat-widget";

const HelpCenterPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [inquiryFile, setInquiryFile] = useState<File | null>(null);
  const [inquiryData, setInquiryData] = useState({
    title: "",
    content: "",
    type: "product",
    isPrivate: false,
  });

  // 공지사항 작성 관련 상태
  const [isWritingNotice, setIsWritingNotice] = useState(false);
  const [editingNotice, setEditingNotice] = useState<any>(null);
  const [newNotice, setNewNotice] = useState({
    title: "",
    category: "",
    content: "",
    important: false,
  });

  // Chat state
  const [chatChannelId, setChatChannelId] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChannelSelect = (id: number) => {
    setChatChannelId(id);
    setIsChatOpen(true);
  };

  const handleNewChat = () => {
    setChatChannelId(null);
    setIsChatOpen(true);
  };

  // 공지사항 조회
  const { data: noticesData, isLoading: noticesLoading } = useQuery({
    queryKey: ["/api/notices"],
    queryFn: () => fetch("/api/notices").then((res) => res.json()),
  });

  // 공지사항 생성/수정 Mutation
  const createNoticeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("공지사항 생성 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({ title: "작성 완료", description: "공지사항이 등록되었습니다." });
      setIsWritingNotice(false);
      setNewNotice({ title: "", category: "", content: "", important: false });
    },
    onError: (err) => toast({ title: "작성 실패", description: err.message, variant: "destructive" }),
  });

  const updateNoticeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("공지사항 수정 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      toast({ title: "수정 완료", description: "공지사항이 수정되었습니다." });
      setIsWritingNotice(false);
      setEditingNotice(null);
      setNewNotice({ title: "", category: "", content: "", important: false });
    },
    onError: (err) => toast({ title: "수정 실패", description: err.message, variant: "destructive" }),
  });

  const handleStartWrite = () => {
    setIsWritingNotice(true);
    setEditingNotice(null);
    setNewNotice({ title: "", category: "", content: "", important: false });
  };

  const handleEditNotice = (notice: any) => {
    setEditingNotice(notice);
    setNewNotice({
      title: notice.title,
      category: notice.category,
      content: notice.content,
      important: notice.important,
    });
    setIsWritingNotice(true);
  };

  const handleSaveNotice = () => {
    if (!newNotice.title || !newNotice.category || !newNotice.content) {
      toast({ title: "입력 오류", description: "모든 필드를 입력해주세요.", variant: "destructive" });
      return;
    }
    if (editingNotice) {
      updateNoticeMutation.mutate({ id: editingNotice.id, data: newNotice });
    } else {
      createNoticeMutation.mutate(newNotice);
    }
  };

  const handleCancelWrite = () => {
    setIsWritingNotice(false);
    setEditingNotice(null);
  };

  // 문의사항 조회 (로그인한 사용자만)
  const {
    data: inquiriesData,
    isLoading: inquiriesLoading,
    refetch: refetchInquiries,
  } = useQuery({
    queryKey: ["/api/inquiries"],
    queryFn: () =>
      fetch("/api/inquiries", {
        credentials: "include",
      }).then((res) => res.json()),
    enabled: !!user,
  });

  // 문의사항 등록 mutation
  const createInquiryMutation = useMutation({
    mutationFn: async (inquiryData: any) => {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(inquiryData),
      });

      if (!response.ok) {
        throw new Error("문의 등록에 실패했습니다.");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "문의 등록 완료",
        description:
          "문의가 성공적으로 등록되었습니다. 빠른 시일 내에 답변드리겠습니다.",
      });
      setInquiryDialogOpen(false);
      setInquiryData({
        title: "",
        content: "",
        type: "product",
        isPrivate: false,
      });
      refetchInquiries();
    },
    onError: (error: any) => {
      toast({
        title: "문의 등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = [
    { id: "all", name: "전체", icon: "grid" },
    { id: "product", name: "상품 문의", icon: "package" },
    { id: "delivery", name: "배송 문의", icon: "truck" },
    { id: "payment", name: "결제 문의", icon: "credit-card" },
    { id: "refund", name: "환불/교환", icon: "repeat" },
    { id: "account", name: "계정 관리", icon: "settings" },
    { id: "etc", name: "기타 문의", icon: "help-circle" },
  ];

  const faqs = [
    {
      id: 1,
      category: "product",
      question: "상품 구매 후 교환이나 환불은 어떻게 하나요?",
      answer:
        "상품 수령 후 7일 이내에 교환/환불 신청이 가능합니다. 상품에 하자가 있는 경우 배송비는 판매자가 부담하며, 단순 변심의 경우 왕복 배송비는 고객님 부담입니다. 마이페이지 > 주문내역에서 교환/환불 신청을 하실 수 있습니다.",
    },
    {
      id: 2,
      category: "delivery",
      question: "배송 조회는 어디서 확인할 수 있나요?",
      answer:
        "주문하신 상품의 배송 조회는 마이페이지 > 주문내역에서 확인 가능합니다. 송장번호를 클릭하시면 배송사 홈페이지로 연결되어 실시간 배송 현황을 확인하실 수 있습니다.",
    },
    {
      id: 3,
      category: "payment",
      question: "결제 방법은 어떤 것이 있나요?",
      answer:
        "신용카드, 체크카드, 무통장입금, 휴대폰 결제, 카카오페이, 네이버페이, 토스 등 다양한 결제 방법을 제공하고 있습니다. 결제 시 원하시는 방법을 선택하여 진행하시면 됩니다.",
    },
    {
      id: 4,
      category: "refund",
      question: "환불 처리 기간은 얼마나 걸리나요?",
      answer:
        "환불 신청 후 상품 회수 및 검수가 완료되면 영업일 기준 3-5일 내에 환불 처리가 진행됩니다. 카드 결제의 경우 카드사 사정에 따라 환불 금액의 실제 카드 승인 취소는 최대 7일까지 소요될 수 있습니다.",
    },
    {
      id: 5,
      category: "account",
      question: "회원 정보 수정은 어디서 할 수 있나요?",
      answer:
        "회원 정보 수정은 마이페이지 > 회원정보 수정 메뉴에서 가능합니다. 비밀번호 확인 후 연락처, 주소, 이메일 등의 정보를 수정하실 수 있습니다.",
    },
    {
      id: 6,
      category: "product",
      question: "상품의 재입고 알림을 받을 수 있나요?",
      answer:
        "네, 품절된 상품의 상세 페이지에서 '재입고 알림 신청' 버튼을 클릭하시면 해당 상품이 재입고되었을 때 알림을 받으실 수 있습니다. 알림은 회원 정보에 등록된 이메일 또는 문자메시지로 발송됩니다.",
    },
    {
      id: 7,
      category: "delivery",
      question: "해외 배송도 가능한가요?",
      answer:
        "현재 일부 국가에 한해 해외 배송 서비스를 제공하고 있습니다. 해외 배송 가능 국가 및 배송비는 상품 주문 시 배송지 선택 단계에서 확인하실 수 있습니다. 해외 배송의 경우 일반 국내 배송보다 배송 기간이 더 소요될 수 있습니다.",
    },
    {
      id: 8,
      category: "payment",
      question: "주문 후 결제 방법을 변경할 수 있나요?",
      answer:
        "주문 완료 후에는 결제 방법 변경이 불가능합니다. 결제 방법을 변경하시려면 기존 주문을 취소하신 후 새로운 주문으로 진행해 주셔야 합니다. 단, 무통장입금의 경우 입금 전이라면 고객센터로 문의 주시면 도움드리겠습니다.",
    },
  ];

  // 이용가이드 FAQ 데이터
  const guideItems = [
    {
      id: 1,
      title: "회원가입 안내",
      content: `
        <div class="space-y-4">
          <h4 class="font-semibold">1. 회원가입 절차</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>홈페이지 우상단 '로그인/회원가입' 클릭</li>
            <li>개인정보 입력 및 약관 동의</li>
            <li>이메일 인증 완료</li>
            <li>회원가입 완료</li>
          </ul>

          <h4 class="font-semibold">2. 회원 혜택</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>강의 할인 혜택</li>
            <li>포인트 적립 및 사용</li>
            <li>개인 맞춤형 강의 추천</li>
            <li>학습 진도 관리</li>
          </ul>
        </div>
      `,
    },
    {
      id: 2,
      title: "수강신청 안내",
      content: `
        <div class="space-y-4">
          <h4 class="font-semibold">1. 수강신청 방법</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>원하는 강의 선택</li>
            <li>강의 상세정보 확인</li>
            <li>'수강신청' 버튼 클릭</li>
            <li>결제 진행</li>
            <li>수강신청 완료</li>
          </ul>

          <h4 class="font-semibold">2. 수강 취소 및 환불</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>강의 시작 전: 100% 환불</li>
            <li>강의 시작 후 1/3 진행 전: 2/3 환불</li>
            <li>강의 시작 후 1/2 진행 전: 1/2 환불</li>
            <li>강의 시작 후 1/2 진행 후: 환불 불가</li>
          </ul>
        </div>
      `,
    },
    {
      id: 3,
      title: "결제 안내",
      content: `
        <div class="space-y-4">
          <h4 class="font-semibold">1. 결제 방법</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>신용카드/체크카드</li>
            <li>무통장입금</li>
            <li>휴대폰 결제</li>
            <li>간편결제 (카카오페이, 네이버페이, 토스)</li>
          </ul>

          <h4 class="font-semibold">2. 환불 정책</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>카드결제: 승인취소 (영업일 기준 3-5일)</li>
            <li>무통장입금: 계좌이체 (영업일 기준 3-5일)</li>
            <li>부분환불 시 수수료 차감될 수 있음</li>
          </ul>
        </div>
      `,
    },
    {
      id: 4,
      title: "수료증 발급",
      content: `
        <div class="space-y-4">
          <h4 class="font-semibold">1. 수료 조건</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>전체 강의의 80% 이상 수강</li>
            <li>과제 및 시험 합격 (해당 시)</li>
            <li>출석률 80% 이상 (오프라인 강의)</li>
          </ul>

          <h4 class="font-semibold">2. 수료증 발급 절차</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>수료 조건 충족 시 자동 발급</li>
            <li>마이페이지에서 수료증 다운로드</li>
            <li>필요 시 종이 수료증 별도 신청 가능</li>
          </ul>
        </div>
      `,
    },
    {
      id: 5,
      title: "모바일 이용 안내",
      content: `
        <div class="space-y-4">
          <h4 class="font-semibold">1. 모바일 접속</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>모바일 웹브라우저로 접속</li>
            <li>반응형 디자인으로 최적화</li>
            <li>모든 기능 동일하게 이용 가능</li>
          </ul>

          <h4 class="font-semibold">2. 추천 환경</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>안드로이드: Chrome 브라우저</li>
            <li>iOS: Safari 브라우저</li>
            <li>안정적인 Wi-Fi 또는 4G/5G 연결</li>
          </ul>
        </div>
      `,
    },
    {
      id: 6,
      title: "고객지원",
      content: `
        <div class="space-y-4">
          <h4 class="font-semibold">1. 고객센터 운영시간</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>평일: 09:00 - 18:00</li>
            <li>토요일: 09:00 - 13:00</li>
            <li>일요일 및 공휴일: 휴무</li>
          </ul>

          <h4 class="font-semibold">2. 문의 방법</h4>
          <ul class="list-disc list-inside space-y-1 text-sm">
            <li>1:1 문의 (24시간 접수)</li>
            <li>이메일: support@trainingplatform.com</li>
            <li>전화: 1588-1234</li>
          </ul>
        </div>
      `,
    },
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleInquirySubmit = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "문의를 등록하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    if (!inquiryData.title.trim() || !inquiryData.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createInquiryMutation.mutate(inquiryData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">답변 대기</Badge>;
      case "answered":
        return <Badge variant="default">답변 완료</Badge>;
      case "closed":
        return <Badge variant="outline">종료</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      product: "상품 문의",
      payment: "결제 문의",
      delivery: "배송 문의",
      refund: "환불/교환",
      account: "계정 관리",
      general: "일반 문의",
      etc: "기타 문의",
    };
    return typeMap[type] || type;
  };

  const renderIcon = (iconName: string) => {
    const iconProps = { className: "w-4 h-4 mr-2" };

    switch (iconName) {
      case "grid":
        return <Grid3X3 {...iconProps} />;
      case "package":
        return <Package {...iconProps} />;
      case "truck":
        return <Truck {...iconProps} />;
      case "credit-card":
        return <CreditCard {...iconProps} />;
      case "repeat":
        return <Repeat {...iconProps} />;
      case "settings":
        return <Settings {...iconProps} />;
      case "help-circle":
        return <HelpCircle {...iconProps} />;
      default:
        return <HelpCircle {...iconProps} />;
    }
  };

  const isAdmin = user?.isAdmin || user?.role === "admin" || user?.email === "admin@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onNotificationClick={() => {}} />

      {/* Hero Section - Reduced Padding (py-16 -> py-8) */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">고객센터</h2>
          <p className="text-lg mb-6">
            궁금한 것이 있으시면 언제든지 문의해 주세요
          </p>
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Input
                type="text"
                placeholder="궁금한 내용을 검색하세요"
                className="pl-4 pr-12 py-3 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-1 top-0 bottom-0 px-4">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Reduced Padding (py-8 -> py-4) */}
      <main className="container mx-auto px-4 py-4">
        
        {/* Main Menu Grid (Centered & Themed) - Reduced Margin (mb-16 -> mb-8) */}
        <div className="max-w-5xl mx-auto mb-8">
           <h3 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
             자주 찾는 메뉴
           </h3>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4"> {/* Changed to 5 columns for Chat History */}
              {/* FAQ */}
              <div 
                onClick={() => setActiveTab('faq')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all hover:shadow-lg text-center group ${activeTab === 'faq' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 bg-white hover:border-blue-300'}`}
              >
                 <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
                    <HelpCircle className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-gray-800 mb-1 text-sm">FAQ</h4>
                 <p className="text-[10px] text-gray-500">자주 묻는 질문</p>
              </div>

              {/* Chat History (NEW) */}
              <div 
                onClick={() => setActiveTab('chat-history')}
                className={`cursor-pointer p-4 rounded-2xl border transition-all hover:shadow-lg text-center group ${activeTab === 'chat-history' ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-gray-100 bg-white hover:border-pink-300'}`}
              >
                 <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform shadow-sm">
                    <MessageSquare className="w-6 h-6" />
                 </div>
                 <h4 className="font-bold text-gray-800 mb-1 text-sm">실시간 채팅 내역</h4>
                 <p className="text-[10px] text-gray-500">상담 기록 확인</p>
              </div>

              {/* Privacy */}
              <Link href="/privacy-policy">
                <div className="cursor-pointer p-4 rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:bg-green-50 transition-all hover:shadow-lg text-center group h-full">
                   <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform shadow-sm">
                      <Shield className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-gray-800 mb-1 text-sm">개인정보처리방침</h4>
                   <p className="text-[10px] text-gray-500">정보 보호 정책</p>
                </div>
              </Link>

              {/* Terms */}
              <Link href="/terms-of-service">
                <div className="cursor-pointer p-4 rounded-2xl border border-gray-100 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all hover:shadow-lg text-center group h-full">
                   <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform shadow-sm">
                      <FileText className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-gray-800 mb-1 text-sm">이용약관</h4>
                   <p className="text-[10px] text-gray-500">서비스 이용 약관</p>
                </div>
              </Link>

              {/* Cookie */}
              <Link href="/cookie-policy">
                <div className="cursor-pointer p-4 rounded-2xl border border-gray-100 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all hover:shadow-lg text-center group h-full">
                   <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform shadow-sm">
                      <Database className="w-6 h-6" />
                   </div>
                   <h4 className="font-bold text-gray-800 mb-1 text-sm">쿠키정책</h4>
                   <p className="text-[10px] text-gray-500">쿠키 수집 및 이용</p>
                </div>
              </Link>
           </div>
        </div>

        <Tabs
          defaultValue="faq"
          value={activeTab}
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-5 mb-8"> {/* Changed grid-cols-4 -> 5 */}
            <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
            <TabsTrigger value="chat-history">실시간 채팅 내역</TabsTrigger> {/* NEW Tab Trigger */}
            <TabsTrigger value="inquiry">1:1 문의</TabsTrigger>
            <TabsTrigger value="notice">공지사항</TabsTrigger>
            <TabsTrigger value="guide">이용가이드</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Categories Sidebar */}
              <div className="lg:col-span-1">
                <Card className="p-4">
                  <h3 className="font-semibold mb-4">카테고리</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${
                          selectedCategory === category.id
                            ? "bg-blue-100 text-blue-600"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <span className="flex items-center">
                          {renderIcon(category.icon)}
                          <span>{category.name}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* FAQ List */}
              <div className="lg:col-span-3">
                <div className="mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    자주 묻는 질문 ({filteredFaqs.length}건)
                  </h3>
                </div>

                <Accordion type="single" collapsible className="space-y-2">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem
                      key={faq.id}
                      value={`faq-${faq.id}`}
                      className="border border-gray-200 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {
                              categories.find((c) => c.id === faq.category)
                                ?.name
                            }
                          </Badge>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pt-4 border-t border-gray-100">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">검색 결과가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Chat History Tab Content */}
          <TabsContent value="chat-history">
             <div className="space-y-6">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-semibold">실시간 채팅 상담 내역</h3>
               </div>
               
               {!user ? (
                 <Card className="p-8 text-center bg-gray-50 border-dashed">
                   <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                   <p className="text-gray-600 mb-4">로그인 후 상담 내역을 확인할 수 있습니다.</p>
                   <Button onClick={() => (window.location.href = "/auth")}>로그인하기</Button>
                 </Card>
               ) : (
                 <div className="h-[600px]">
                   <ChatHistoryList 
                     onSelectChannel={handleChannelSelect}
                     onNewChat={handleNewChat}
                     selectedChannelId={chatChannelId}
                   />
                 </div>
               )}
             </div>
          </TabsContent>

          {/* 1:1 Inquiry Tab */}
          <TabsContent value="inquiry">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">1:1 문의</h3>
                {user && (
                  <Dialog
                    open={inquiryDialogOpen}
                    onOpenChange={setInquiryDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />새 문의 작성
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>새 문의 작성</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="inquiry-type">문의 유형</Label>
                          <Select
                            onValueChange={(value) =>
                              setInquiryData({ ...inquiryData, type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="문의 유형을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">상품 문의</SelectItem>
                              <SelectItem value="payment">결제 문의</SelectItem>
                              <SelectItem value="delivery">
                                배송 문의
                              </SelectItem>
                              <SelectItem value="refund">환불/교환</SelectItem>
                              <SelectItem value="account">계정 관리</SelectItem>
                              <SelectItem value="general">일반 문의</SelectItem>
                              <SelectItem value="etc">기타 문의</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="inquiry-title">제목</Label>
                          <Input
                            id="inquiry-title"
                            value={inquiryData.title}
                            onChange={(e) =>
                              setInquiryData({
                                ...inquiryData,
                                title: e.target.value,
                              })
                            }
                            placeholder="문의 제목을 입력하세요"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inquiry-content">내용</Label>
                          <Textarea
                            id="inquiry-content"
                            value={inquiryData.content}
                            onChange={(e) =>
                              setInquiryData({
                                ...inquiryData,
                                content: e.target.value,
                              })
                            }
                            placeholder="문의 내용을 상세히 입력해주세요"
                            className="min-h-[150px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inquiry-file">첨부파일</Label>
                          <Input
                            id="inquiry-file"
                            type="file"
                            onChange={(e) =>
                              setInquiryFile(e.target.files?.[0] || null)
                            }
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            파일 크기는 10MB 이하로 제한됩니다.
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="inquiry-private"
                            checked={inquiryData.isPrivate}
                            onChange={(e) =>
                              setInquiryData({
                                ...inquiryData,
                                isPrivate: e.target.checked,
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <Label htmlFor="inquiry-private" className="text-sm">
                            <Lock className="w-3 h-3 mr-1 text-orange-600 inline" />
                            비밀글로 작성 (관리자와 본인만 확인 가능)
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setInquiryDialogOpen(false)}
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleInquirySubmit}
                          disabled={createInquiryMutation.isPending}
                        >
                          {createInquiryMutation.isPending
                            ? "등록 중..."
                            : "문의 등록"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {!user && (
                <Card className="p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    1:1 문의를 이용하려면 로그인이 필요합니다.
                  </p>
                  <Button onClick={() => (window.location.href = "/auth")}>
                    로그인하기
                  </Button>
                </Card>
              )}

              {user && (
                <div className="space-y-4">
                  {inquiriesLoading && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        문의 내역을 불러오는 중...
                      </p>
                    </div>
                  )}

                  {inquiriesData?.inquiries?.map((inquiry: any) => (
                    <Card
                      key={inquiry.id}
                      className={`p-6 ${inquiry.isPrivate ? "border-orange-200 bg-orange-50" : ""}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(inquiry.status)}
                          <Badge variant="outline">
                            {getTypeName(inquiry.type)}
                          </Badge>
                          {inquiry.isPrivate && (
                            <Badge
                              variant="outline"
                              className="text-orange-600 border-orange-600 bg-orange-100"
                            >
                              <Lock className="w-3 h-3 mr-1" />
                              비밀글
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(inquiry.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        {inquiry.isPrivate && (
                          <Lock className="w-4 h-4 text-orange-600 mr-2" />
                        )}
                        <h4 className="font-semibold">{inquiry.title}</h4>
                      </div>
                      <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                        {inquiry.content}
                      </p>

                      {inquiry.answer && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Reply className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-600">
                              답변
                            </span>
                            <span className="text-sm text-gray-500 ml-auto">
                              {formatDate(inquiry.answeredAt)} | 관리자
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {inquiry.answer}
                          </p>
                        </div>
                      )}
                    </Card>
                  ))}

                  {inquiriesData?.inquiries?.length === 0 && (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">등록된 문의가 없습니다.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notice Tab */}
          <TabsContent value="notice">
            {isWritingNotice ? (
              /* 공지사항 작성 폼 */
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingNotice ? "공지사항 수정" : "새 공지사항 작성"}
                  </h3>
                  <Button variant="ghost" onClick={handleCancelWrite}>
                    목록으로 돌아가기
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="notice-title">제목</Label>
                      <Input
                        id="notice-title"
                        value={newNotice.title}
                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                        placeholder="공지사항 제목을 입력하세요"
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notice-category">카테고리</Label>
                      <Select
                        value={newNotice.category}
                        onValueChange={(value) => setNewNotice({ ...newNotice, category: value })}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="카테고리 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="공지">공지</SelectItem>
                          <SelectItem value="안내">안내</SelectItem>
                          <SelectItem value="이벤트">이벤트</SelectItem>
                          <SelectItem value="점검">점검</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notice-content">내용</Label>
                    <Textarea
                      id="notice-content"
                      value={newNotice.content}
                      onChange={(e) => setNewNotice({ ...newNotice, content: e.target.value })}
                      placeholder="공지사항 내용을 입력하세요"
                      className="min-h-[300px] p-4 resize-y text-base"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="notice-important"
                      checked={newNotice.important}
                      onChange={(e) => setNewNotice({ ...newNotice, important: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="notice-important" className="cursor-pointer">중요 공지사항으로 등록</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={handleCancelWrite} className="px-6">
                      취소
                    </Button>
                    <Button onClick={handleSaveNotice} className="px-6 bg-blue-600 hover:bg-blue-700">
                      {editingNotice ? "수정하기" : "등록하기"}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* 공지사항 목록 */
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">공지사항</h3>
                  {isAdmin && (
                    <Button onClick={handleStartWrite}>
                      <Megaphone className="w-4 h-4 mr-2" />
                      공지사항 관리/작성
                    </Button>
                  )}
                </div>

                {noticesLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">공지사항을 불러오는 중...</p>
                  </div>
                )}

                <Accordion type="single" collapsible className="space-y-2">
                  {noticesData?.notices?.map((notice: any) => (
                    <AccordionItem
                      key={notice.id}
                      value={`notice-${notice.id}`}
                      className="border border-gray-200 rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-4">
                          <div className="flex items-center space-x-3 overflow-hidden">
                            {notice.isImportant && (
                              <Badge className="bg-red-500 shrink-0">중요</Badge>
                            )}
                            <Badge variant="outline" className="shrink-0">{notice.category}</Badge>
                            <span className="font-medium truncate">{notice.title}</span>
                          </div>
                          <span className="text-sm text-gray-500 shrink-0 ml-2">
                            {formatDate(notice.createdAt)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 border-t border-gray-100">
                        <div className="text-gray-600 space-y-4">
                          {notice.content ? (
                            <div className="whitespace-pre-wrap">
                              {notice.content}
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">
                              내용이 없습니다.
                            </p>
                          )}
                          
                          {isAdmin && (
                            <div className="flex justify-end pt-2 border-t border-gray-50">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-xs h-8"
                                onClick={(e) => {
                                  e.stopPropagation(); // 아코디언 토글 방지
                                  handleEditNotice(notice);
                                }}
                              >
                                수정하기
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {noticesData?.notices?.length === 0 && (
                  <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* Guide Tab */}
          <TabsContent value="guide">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">이용가이드</h3>

              <Accordion type="single" collapsible className="space-y-2">
                {guideItems.map((item) => (
                  <AccordionItem
                    key={item.id}
                    value={`guide-${item.id}`}
                    className="border border-gray-200 rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center space-x-3">
                        <HelpCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 border-t border-gray-100">
                      <div dangerouslySetInnerHTML={{ __html: item.content }} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <ChatWidget 
        isOpen={isChatOpen} 
        onToggle={setIsChatOpen} 
        channelId={chatChannelId}
        onChannelSelect={setChatChannelId}
      />
    </div>
  );
};

export default HelpCenterPage;
