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
  PenTool,
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  MonitorPlay,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function AuthorApplicationPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    experience: "",
    portfolioUrl: "",
    introduction: "",
  });

  const applicationMutation = useMutation({
    mutationFn: async (_data: typeof formData) => {
      // 실제 API 엔드포인트 연결 (추후 구현)
      // 예: await apiRequest("POST", "/api/inquiries", { type: "author", ...data });
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "저자 신청이 접수되었습니다.",
        description: "담당자가 검토 후 빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        experience: "",
        portfolioUrl: "",
        introduction: "",
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
    if (!formData.subject) {
      toast({
        title: "전문 과목 선택",
        description: "전문 과목/분야를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    applicationMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
            alt="Author Application Background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-400 mb-6 backdrop-blur-sm">
            <PenTool className="mr-2 h-4 w-4" />
            Become an Author
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl mb-6">
            당신의 지식이 <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              세상을 바꾸는 힘
            </span>
            이 됩니다
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300 max-w-2xl mx-auto">
            Qnova의 저자가 되어보세요. 당신만의 노하우와 콘텐츠로 학생들의 성장을 돕고,
            지속적인 수익 창출과 퍼스널 브랜딩을 실현할 수 있습니다.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-lg px-8"
              onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              저자 신청하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              저자 혜택
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Qnova 저자만이 누릴 수 있는 특별한 혜택을 소개합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-purple-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4 text-purple-600">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <CardTitle>높은 수익 창출</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  판매된 콘텐츠에 대해 업계 최고 수준의 로열티를 제공합니다. 당신의 지적 자산이 지속적인 수입원이 됩니다.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-pink-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4 text-pink-600">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle>퍼스널 브랜딩</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  Qnova 플랫폼을 통해 전국 수많은 학생과 선생님에게 당신의 이름과 전문성을 알리고 브랜드 가치를 높이세요.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-indigo-50/50">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600">
                  <MonitorPlay className="h-6 w-6" />
                </div>
                <CardTitle>편리한 저작 도구</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600">
                  콘텐츠 제작부터 판매 관리까지, 복잡한 과정 없이 오직 콘텐츠 생산에만 집중할 수 있는 최적의 환경을 제공합니다.
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
              신청 절차
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              간단한 절차를 통해 Qnova의 저자가 될 수 있습니다.
            </p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { step: "01", title: "신청서 제출", desc: "온라인 신청 양식 작성" },
                { step: "02", title: "심사 및 인터뷰", desc: "전문성 및 적합성 검토" },
                { step: "03", title: "계약 체결", desc: "저자 계약 및 활동 가이드 안내" },
                { step: "04", title: "활동 시작", desc: "콘텐츠 등록 및 판매 시작" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center bg-gray-50 relative z-10 md:bg-transparent">
                  <div className="w-16 h-16 rounded-full bg-white border-4 border-purple-600 text-purple-600 font-bold text-xl flex items-center justify-center mb-4 shadow-sm">
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

      {/* Application Form Section */}
      <section id="application-form" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-200">Apply Now</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                저자 신청하기
              </h2>
              <p className="mt-4 text-gray-600">
                아래 양식을 작성해주시면 담당자가 검토 후 연락드립니다.
              </p>
            </div>

            <Card className="shadow-lg border-gray-100">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700">이름</label>
                      <Input
                        id="name"
                        placeholder="홍길동"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">이메일</label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-gray-700">전문 분야/과목</label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="전문 과목을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">영어</SelectItem>
                        <SelectItem value="korean">국어</SelectItem>
                        <SelectItem value="math">수학</SelectItem>
                        <SelectItem value="science">과학</SelectItem>
                        <SelectItem value="social">사회/역사</SelectItem>
                        <SelectItem value="other">기타</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium text-gray-700">주요 경력/약력</label>
                    <Textarea
                      id="experience"
                      placeholder="관련 강의 경력, 집필 경험 등을 간단히 적어주세요."
                      className="min-h-[100px]"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="portfolioUrl" className="text-sm font-medium text-gray-700">포트폴리오/샘플 자료 (선택)</label>
                    <Input
                      id="portfolioUrl"
                      placeholder="블로그, 유튜브, 구글 드라이브 링크 등 URL을 입력해주세요."
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="introduction" className="text-sm font-medium text-gray-700">소개 및 지원 동기</label>
                    <Textarea
                      id="introduction"
                      placeholder="본인 소개와 저자 지원 동기를 자유롭게 적어주세요."
                      className="min-h-[150px]"
                      value={formData.introduction}
                      onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600 mt-0.5" />
                      <p className="text-sm text-gray-500">
                        개인정보 수집 및 이용에 동의합니다. (신청 처리를 위해 필요한 최소한의 정보만 수집합니다.)
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg font-bold"
                      disabled={applicationMutation.isPending}
                    >
                      {applicationMutation.isPending ? "접수 중..." : "저자 신청하기"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-12 text-center space-y-2 text-gray-500">
              <p className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" /> author@qnova.com
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

