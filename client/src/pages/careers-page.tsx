import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Briefcase,
  Users,
  Smile,
  Coffee,
  Clock,
  Laptop,
  Heart,
  Rocket,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Mail,
  Phone,
  FileText,
  Upload,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";

export default function CareersPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    portfolioUrl: "",
    introduction: "",
  });

  const applicationMutation = useMutation({
    mutationFn: async (_data: typeof formData) => {
      // API integration placeholder
      // await apiRequest("POST", "/api/applications", data);
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
    onSuccess: () => {
      toast({
        title: "지원서가 접수되었습니다.",
        description: "담당자가 검토 후 빠른 시일 내에 연락드리겠습니다.",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
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
    if (!formData.position) {
      toast({
        title: "지원 분야 선택",
        description: "지원하실 포지션을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    applicationMutation.mutate(formData);
  };

  const benefits = [
    {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: "유연한 근무제",
      description: "시차출퇴근제 운영으로 자신의 라이프스타일에 맞춰 근무 시간을 조정할 수 있습니다.",
    },
    {
      icon: <Laptop className="h-6 w-6 text-purple-500" />,
      title: "최신 장비 지원",
      description: "업무 효율을 위해 최고 사양의 맥북/노트북 및 모니터, 소프트웨어를 지원합니다.",
    },
    {
      icon: <Coffee className="h-6 w-6 text-yellow-600" />,
      title: "무제한 간식 & 커피",
      description: "당 충전이 필요할 때 언제든 즐길 수 있는 다양한 간식과 고급 커피가 준비되어 있습니다.",
    },
    {
      icon: <Smile className="h-6 w-6 text-green-500" />,
      title: "자유로운 연차 사용",
      description: "눈치 보지 않고 당일 연차 사용 가능! 충분한 휴식을 통해 업무 집중도를 높입니다.",
    },
    {
      icon: <Heart className="h-6 w-6 text-red-500" />,
      title: "경조사 지원",
      description: "기쁜 일은 축하하고 슬픈 일은 위로하며, 본인 및 가족의 경조사를 지원합니다.",
    },
    {
      icon: <Rocket className="h-6 w-6 text-indigo-500" />,
      title: "성장 지원",
      description: "도서 구매, 온/오프라인 강의 수강 등 업무 역량 강화를 위한 비용을 아낌없이 지원합니다.",
    },
  ];

  const jobOpenings = [
    {
      id: "frontend",
      title: "Frontend Developer (React)",
      department: "Development",
    },
    {
      id: "backend",
      title: "Backend Developer (Node.js)",
      department: "Development",
    },
    {
      id: "content",
      title: "영어 콘텐츠 기획자",
      department: "Content",
    },
    {
      id: "marketing",
      title: "퍼포먼스 마케터",
      department: "Marketing",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2850&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply"
            alt="Office Culture"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/50 backdrop-blur-sm">
            We are hiring!
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Qnova와 함께 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              교육의 미래를 혁신할
            </span>
            <br />
            동료를 찾습니다
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            우리는 기술로 교육 불평등을 해소하고, <br className="hidden sm:block" />
            누구나 양질의 교육을 받을 수 있는 세상을 만들어갑니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto font-bold"
              onClick={() => document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              지금 지원하기 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Culture & Benefits */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              복지 및 혜택
            </h2>
            <p className="text-lg text-gray-600">
              구성원들이 업무에 몰입하고 성장할 수 있도록 최고의 환경을 지원합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="application-form" className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">Apply Now</Badge>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                입사 지원하기
              </h2>
              <p className="mt-4 text-gray-600">
                Qnova와 함께 성장하고 싶다면 지금 바로 지원해주세요. <br />
                모든 지원서는 신중하게 검토됩니다.
              </p>
            </div>

            <Card className="shadow-xl border-gray-100 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardContent className="p-8 md:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-semibold text-gray-700">이름</label>
                      <div className="relative">
                        <Input
                          id="name"
                          placeholder="홍길동"
                          className="pl-10"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-semibold text-gray-700">연락처</label>
                      <div className="relative">
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="010-1234-5678"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700">이메일</label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="position" className="text-sm font-semibold text-gray-700">지원 분야</label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="지원하실 포지션을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobOpenings.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            [{job.department}] {job.title}
                          </SelectItem>
                        ))}
                        <SelectItem value="pool">인재풀 등록 (상시 채용)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="portfolioUrl" className="text-sm font-semibold text-gray-700">이력서/포트폴리오 URL</label>
                    <div className="relative">
                      <Input
                        id="portfolioUrl"
                        placeholder="Notion, LinkedIn, Google Drive 링크 등"
                        className="pl-10"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                        required
                      />
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">* 접근 권한이 공개로 설정되어 있는지 확인해주세요.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="introduction" className="text-sm font-semibold text-gray-700">자기소개 및 지원동기</label>
                    <Textarea
                      id="introduction"
                      placeholder="자유롭게 본인을 소개해주세요."
                      className="min-h-[150px] resize-none"
                      value={formData.introduction}
                      onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
                      required
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start space-x-2 mb-6">
                      <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-500">
                        개인정보 수집 및 이용에 동의합니다. 제출된 정보는 채용 절차 진행을 위해서만 사용되며, 
                        채용 확정 후 180일간 보관 후 파기됩니다.
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold shadow-lg transition-all hover:scale-[1.01]"
                      disabled={applicationMutation.isPending}
                    >
                      {applicationMutation.isPending ? "지원서 제출 중..." : "지원서 제출하기"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-center text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <Mail className="h-4 w-4 text-blue-500" />
                <span>채용 문의: recruit@qnova.com</span>
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>근무지: 경남 진주시 사들로 79, 401호</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
