import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";

export default function BusinessPartnershipPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    type: "",
    content: "",
  });

  const partnershipMutation = useMutation({
    mutationFn: async (_data: typeof formData) => {
      // 실제 API 엔드포인트가 있다면 여기에 연결
      // 현재는 문의(inquiries) API나 별도 엔드포인트 사용 가능
      // 여기서는 일반 문의로 처리하거나, 추후 백엔드 구현 필요
      // 임시로 성공 처리
      return new Promise((resolve) => setTimeout(resolve, 1000)); 
    },
    onSuccess: () => {
      toast({
        title: "제휴 문의가 접수되었습니다.",
        description: "담당자가 검토 후 빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        type: "",
        content: "",
      });
    },
    onError: () => {
      toast({
        title: "접수 실패",
        description: "오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type) {
      toast({
        title: "제휴 유형 선택",
        description: "제휴 유형을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    partnershipMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
            alt="Business Partnership Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-400 mb-6 backdrop-blur-sm">
            <Handshake className="mr-2 h-4 w-4" />
            Partnership
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
            Qnova와 함께 성장할 <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              최고의 파트너
            </span>
            를 찾습니다
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            교육 콘텐츠, 기술, 마케팅 등 다양한 분야에서 시너지를 낼 수 있는 기업 및 단체의 제안을 기다립니다.
            Qnova와 함께 교육의 미래를 만들어가세요.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              onClick={() => document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              제휴 제안하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              제휴 혜택
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Qnova와 파트너가 되면 다양한 혜택을 누릴 수 있습니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-blue-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>비즈니스 확장</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Qnova의 방대한 사용자 풀을 활용하여 귀사의 서비스와 콘텐츠를 효과적으로 알리고 비즈니스를 확장할 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-purple-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 text-purple-600">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>공동 마케팅</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  온/오프라인 채널을 통한 공동 프로모션 및 마케팅 활동을 지원하여 브랜드 인지도를 높일 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-green-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 text-green-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <CardTitle>기술 및 인프라 지원</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  안정적인 서비스 운영을 위한 기술 지원과 플랫폼 인프라를 공유하여 서비스 품질을 향상시킬 수 있습니다.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              제휴 절차
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              체계적이고 신속한 절차를 통해 파트너십을 맺습니다.
            </p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { step: "01", title: "제휴 문의 접수", desc: "홈페이지를 통해 제안서 제출" },
                { step: "02", title: "담당자 검토", desc: "제휴 내용 및 적합성 검토" },
                { step: "03", title: "미팅 및 협의", desc: "구체적인 조건 및 일정 협의" },
                { step: "04", title: "계약 및 런칭", desc: "계약 체결 후 서비스 시작" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center bg-gray-50 relative z-10 md:bg-transparent">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-600 text-blue-600 font-bold text-xl flex items-center justify-center mb-4 shadow-sm">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section id="inquiry-form" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">Contact Us</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                제휴 문의하기
              </h2>
              <p className="mt-4 text-gray-600">
                제휴 관련 궁금한 점이나 제안하실 내용이 있다면 언제든 문의해주세요.
              </p>
            </div>

            <Card className="shadow-lg border-gray-100">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="text-sm font-medium text-gray-700">기업/단체명</label>
                      <Input
                        id="companyName"
                        placeholder="(주)Qnova"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="contactPerson" className="text-sm font-medium text-gray-700">담당자명</label>
                      <Input
                        id="contactPerson"
                        placeholder="홍길동"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-gray-700">연락처</label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="010-1234-5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium text-gray-700">제휴 유형</label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="제휴 유형을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">콘텐츠 제휴</SelectItem>
                        <SelectItem value="tech">기술 제휴</SelectItem>
                        <SelectItem value="marketing">마케팅 제휴</SelectItem>
                        <SelectItem value="investment">투자 관련</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="content" className="text-sm font-medium text-gray-700">문의 내용</label>
                    <Textarea
                      id="content"
                      placeholder="제휴 제안 내용이나 문의사항을 자세히 적어주세요."
                      className="min-h-[150px]"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm text-gray-500">
                        개인정보 수집 및 이용에 동의합니다. (문의 처리를 위해 필요한 최소한의 정보만 수집합니다.)
                      </p>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold"
                      disabled={partnershipMutation.isPending}
                    >
                      {partnershipMutation.isPending ? "접수 중..." : "문의 접수하기"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-12 text-center space-y-2 text-gray-500">
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> partner@qnova.com
              </p>
              <p className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" /> 02-1234-5678 (평일 09:00 - 18:00)
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

