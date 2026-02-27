import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageCircle, Phone, Mail, Clock, User, FileText, Send } from "lucide-react";

export default function EnhancedHelpCenterPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: "assistant",
      message: "안녕하세요! 무엇을 도와드릴까요?",
      time: "09:00"
    }
  ]);

  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    type: "general",
    title: "",
    content: "",
  });

  const categories = [
    { id: "all", name: "전체", icon: Search },
    { id: "course", name: "과정 문의", icon: FileText },
    { id: "payment", name: "결제 문의", icon: FileText },
    { id: "technical", name: "기술 지원", icon: FileText },
    { id: "account", name: "계정 관리", icon: User },
    { id: "general", name: "일반 문의", icon: MessageCircle },
  ];

  const faqs = [
    {
      id: 1,
      category: "course",
      question: "교육과정 신청은 어떻게 하나요?",
      answer: "교육과정 신청은 로그인 후 원하는 과정을 선택하여 '수강 신청' 버튼을 클릭하시면 됩니다. 결제 완료 후 수강이 가능합니다.",
    },
    {
      id: 2,
      category: "course",
      question: "수료증은 언제 발급되나요?",
      answer: "과정 이수 기준(출석률 80% 이상)을 충족하시면 과정 종료 후 7일 이내에 이메일로 수료증이 발송됩니다.",
    },
    {
      id: 3,
      category: "payment",
      question: "결제 방법은 어떤 것이 있나요?",
      answer: "신용카드, 계좌이체, 카카오페이, 네이버페이 등 다양한 결제 방법을 지원합니다.",
    },
    {
      id: 4,
      category: "payment",
      question: "환불 정책은 어떻게 되나요?",
      answer: "과정 시작 전 100% 환불, 과정 진행률 30% 미만 시 70% 환불, 30% 이상 시 환불 불가합니다.",
    },
    {
      id: 5,
      category: "technical",
      question: "동영상이 재생되지 않아요.",
      answer: "브라우저를 최신 버전으로 업데이트하거나 다른 브라우저를 사용해보세요. 문제가 지속되면 고객센터로 문의해주세요.",
    },
    {
      id: 6,
      category: "account",
      question: "비밀번호를 잊었어요.",
      answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하여 등록된 이메일로 재설정 링크를 받으실 수 있습니다.",
    },
    {
      id: 7,
      category: "general",
      question: "교육과정 수강 기간은 얼마나 되나요?",
      answer: "과정별로 다르며, 대부분 4주~12주 과정으로 구성되어 있습니다. 각 과정 상세 페이지에서 확인하실 수 있습니다.",
    },
    {
      id: 8,
      category: "general",
      question: "모바일에서도 수강이 가능한가요?",
      answer: "네, 모바일 웹브라우저 및 전용 앱을 통해 언제 어디서나 수강하실 수 있습니다.",
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMessage = {
      id: chatMessages.length + 1,
      type: "user",
      message: chatMessage.trim(),
      time: timeString
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage("");

    // Simulate assistant response
    setTimeout(() => {
      const responses = [
        "네, 어떤 도움이 필요하신가요?",
        "자세한 내용을 알려주시면 도와드리겠습니다.",
        "잠시만 기다려주시면 확인 후 답변 드리겠습니다.",
        "교육 관련 문의사항이신가요?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const assistantMessage = {
        id: chatMessages.length + 2,
        type: "assistant",
        message: randomResponse,
        time: timeString
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleInquirySubmit = () => {
    // Handle inquiry submission
    console.log("Inquiry submitted:", inquiryForm);
    setInquiryDialogOpen(false);
    setInquiryForm({
      name: "",
      email: "",
      phone: "",
      type: "general",
      title: "",
      content: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="/uploads/images/83405899f54facf86cd4873ea587cce2_1750405130302.jpg" 
            alt="Help Center"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">도움말 센터</h1>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              궁금한 점이 있으시면 언제든지 문의해주세요. 친절하고 전문적인 상담을 제공합니다.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="궁금한 내용을 검색해보세요"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-3 text-black"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setChatDialogOpen(true)}>
            <CardContent className="p-6">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">실시간 채팅</h3>
              <p className="text-gray-600 text-sm">실시간으로 상담원과 채팅하세요</p>
              <p className="text-blue-600 text-sm mt-2">평일 09:00-18:00</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">전화 상담</h3>
              <p className="text-gray-600 text-sm">055-772-2226</p>
              <p className="text-green-600 text-sm mt-2">평일 09:00-18:00</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setInquiryDialogOpen(true)}>
            <CardContent className="p-6">
              <Mail className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">1:1 문의</h3>
              <p className="text-gray-600 text-sm">개별 문의사항을 남겨주세요</p>
              <p className="text-purple-600 text-sm mt-2">24시간 접수</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
            <TabsTrigger value="guides">이용 가이드</TabsTrigger>
            <TabsTrigger value="notices">공지사항</TabsTrigger>
          </TabsList>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center space-x-2"
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </Button>
              ))}
            </div>

            {/* FAQ List */}
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFaqs.map((faq) => (
                    <AccordionItem key={faq.id} value={`faq-${faq.id}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === faq.category)?.name}
                          </Badge>
                          <span>{faq.question}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {filteredFaqs.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-500">다른 검색어나 카테고리로 다시 시도해보세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Guides Tab */}
          <TabsContent value="guides" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>회원가입 가이드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">회원가입부터 로그인까지 단계별 안내</p>
                  <Button variant="outline" size="sm">자세히 보기</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>수강신청 가이드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">교육과정 신청 및 결제 방법 안내</p>
                  <Button variant="outline" size="sm">자세히 보기</Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>학습 진행 가이드</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">효과적인 온라인 학습 방법 소개</p>
                  <Button variant="outline" size="sm">자세히 보기</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notices Tab */}
          <TabsContent value="notices" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">시스템 정기 점검 안내</h3>
                      <p className="text-sm text-gray-500">2025.06.20</p>
                    </div>
                    <Badge variant="destructive">중요</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">새로운 교육과정 추가 안내</h3>
                      <p className="text-sm text-gray-500">2025.06.18</p>
                    </div>
                    <Badge variant="outline">안내</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">모바일 앱 업데이트 안내</h3>
                      <p className="text-sm text-gray-500">2025.06.15</p>
                    </div>
                    <Badge variant="outline">업데이트</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Dialog */}
      <Dialog open={chatDialogOpen} onOpenChange={setChatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>실시간 채팅 상담</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <div className="space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="메시지를 입력하세요..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inquiry Dialog */}
      <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>1:1 문의하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="이름을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  value={inquiryForm.phone}
                  onChange={(e) => setInquiryForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="연락처를 입력하세요"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">문의 유형</Label>
              <Select value={inquiryForm.type} onValueChange={(value) => setInquiryForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반 문의</SelectItem>
                  <SelectItem value="course">과정 문의</SelectItem>
                  <SelectItem value="payment">결제 문의</SelectItem>
                  <SelectItem value="technical">기술 지원</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={inquiryForm.title}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="문의 제목을 입력하세요"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">문의 내용</Label>
              <Textarea
                id="content"
                value={inquiryForm.content}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="문의 내용을 자세히 입력하세요"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInquiryDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={handleInquirySubmit}>
              문의 제출
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}