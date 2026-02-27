import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brain,
  Zap,
  BookOpen,
  LayoutDashboard,
  CheckCircle2,
  ArrowRight,
  Layers,
  FileText,
  MonitorPlay,
  Share2,
  BarChart,
  ShieldCheck,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function ServicesPage() {
  const features = [
    {
      icon: <Brain className="h-10 w-10 text-purple-600" />,
      title: "AI 본문 분석 엔진",
      description:
        "영어, 국어 지문의 핵심 어휘, 구문, 문법적 요소를 AI가 심층 분석하여 학습에 최적화된 자료를 자동 생성합니다.",
      details: [
        "지문 구조 분석 및 핵심 문장 추출",
        "난이도별 필수 어휘 자동 정리",
        "문맥에 맞는 정확한 해석 및 주석 제공",
        "PDF, HWPX 등 다양한 포맷 지원",
      ],
    },
    {
      icon: <Zap className="h-10 w-10 text-yellow-500" />,
      title: "스마트 변형 문제 생성",
      description:
        "학습한 내용을 바탕으로 국어, 수학, 과학, 사회 등 주요 교과목의 고품질 변형 문제를 즉시 생성합니다.",
      details: [
        "학습자 수준별(초/중/고) 난이도 조절",
        "객관식, 주관식, 서술형 등 다양한 문제 유형",
        "최신 수능 및 내신 기출 경향 반영",
        "수식(LaTeX) 완벽 지원 (수학/과학)",
      ],
    },
    {
      icon: <BookOpen className="h-10 w-10 text-blue-600" />,
      title: "디지털 교재 플랫폼",
      description:
        "종이책의 한계를 넘어, 언제 어디서나 접근 가능한 인터랙티브 디지털 교재를 제공하고 관리합니다.",
      details: [
        "PC, 태블릿, 모바일 등 멀티 디바이스 지원",
        "필기, 하이라이트 등 학습 도구 내장",
        "실시간 업데이트 및 자료 공유",
        "저작권 보호 기술(DRM) 적용",
      ],
    },
    {
      icon: <LayoutDashboard className="h-10 w-10 text-green-600" />,
      title: "강사 전용 대시보드",
      description:
        "수업 준비부터 학생 관리, 수익 창출까지 선생님을 위한 올인원 솔루션을 제공합니다.",
      details: [
        "나만의 커리큘럼 및 교재 제작 도구",
        "학습 현황 및 성취도 분석 리포트",
        "자료 판매 및 구독 모델 운영",
        "커뮤니티 및 지식 공유 네트워크",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/50 to-gray-900"></div>
        </div>
        <div className="relative container mx-auto px-4 text-center z-10">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border-purple-500/50 backdrop-blur-sm px-4 py-1.5 text-sm">
            Qnova Services
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            교육의 미래를 여는 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              스마트 AI 솔루션
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            선생님에게는 수업의 효율을, 학생에게는 학습의 깊이를 더해주는 <br className="hidden md:block" />
            Qnova의 혁신적인 교육 서비스를 경험해보세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6 h-auto font-bold shadow-lg shadow-blue-900/20">
                무료 체험하기 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/help">
              <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/5 hover:bg-white/10 hover:text-white text-lg px-8 py-6 h-auto backdrop-blur-sm transition-colors">
                서비스 문의
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">핵심 서비스</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Qnova는 교육 현장에 필요한 모든 도구를 하나의 플랫폼에서 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-300">
                        {feature.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {feature.description}
                      </p>
                      <ul className="space-y-3">
                        {feature.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-700">
                            <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Process / Tabs */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              어떻게 작동하나요?
            </h2>
            <p className="text-lg text-gray-600">
              복잡한 과정 없이, 단 몇 번의 클릭으로 수업 준비를 완료하세요.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white shadow-sm rounded-xl mb-12">
                <TabsTrigger
                  value="analysis"
                  className="py-4 text-base font-medium data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg transition-all"
                >
                  1. 자료 업로드 및 분석
                </TabsTrigger>
                <TabsTrigger
                  value="generation"
                  className="py-4 text-base font-medium data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg transition-all"
                >
                  2. 콘텐츠 생성 및 편집
                </TabsTrigger>
                <TabsTrigger
                  value="distribution"
                  className="py-4 text-base font-medium data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg transition-all"
                >
                  3. 배포 및 수업 활용
                </TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-0 focus-visible:ring-0">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                      <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        모든 포맷의 자료를 <br />
                        자동으로 인식합니다
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        PDF, Word, HWP 등 가지고 계신 교재 파일을 그대로 업로드하세요.
                        Qnova AI가 텍스트, 이미지, 수식을 자동으로 분리하고 구조화하여
                        디지털 데이터로 변환합니다.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                          99% 이상의 높은 텍스트 인식률
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                          복잡한 수식 및 표 구조 완벽 분석
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-100 min-h-[300px] md:h-auto flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1555421689-d68471e189f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                        alt="Document Analysis" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="generation" className="mt-0 focus-visible:ring-0">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                      <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                        <Layers className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        원하는 유형의 문제를 <br />
                        무제한으로 만드세요
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        분석된 데이터를 바탕으로 변형 문제를 생성합니다.
                        빈칸 채우기, 문장 배열, 객관식 문제 등 수업 목적에 맞는
                        다양한 유형을 선택만 하세요.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2" />
                          클릭 한 번으로 10종 이상의 변형 문제 생성
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-purple-500 mr-2" />
                          나만의 해설 및 정답지 자동 구성
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-100 min-h-[300px] md:h-auto flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                        alt="Content Generation" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="distribution" className="mt-0 focus-visible:ring-0">
                <Card className="border-none shadow-lg overflow-hidden">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                      <div className="w-12 h-12 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-6">
                        <Share2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        온·오프라인 어디서든 <br />
                        자유롭게 활용하세요
                      </h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        생성된 자료는 PDF, HWPX로 다운로드하여 인쇄하거나,
                        디지털 교재로 변환하여 학생들의 태블릿으로 즉시 전송할 수 있습니다.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          고품질 인쇄용 파일 다운로드 지원
                        </li>
                        <li className="flex items-center text-gray-700">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          QR코드 및 링크를 통한 간편 공유
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gray-100 min-h-[300px] md:h-auto flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                        alt="Distribution" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-blue-300">50K+</div>
              <div className="text-blue-100">누적 생성 문항</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-purple-300">1.2K+</div>
              <div className="text-blue-100">활동 중인 선생님</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-green-300">98%</div>
              <div className="text-blue-100">서비스 만족도</div>
            </div>
            <div className="p-6">
              <div className="text-4xl md:text-5xl font-extrabold mb-2 text-yellow-300">24/7</div>
              <div className="text-blue-100">AI 시스템 가동</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              지금 바로 Qnova를 시작하세요
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              회원가입만으로 Qnova의 핵심 기능을 무료로 체험해보실 수 있습니다. <br />
              더 스마트한 교육, Qnova와 함께라면 가능합니다.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-lg px-10 py-6 h-auto w-full sm:w-auto font-bold shadow-lg">
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/help">
                <Button size="lg" variant="outline" className="text-gray-700 border-gray-300 hover:bg-gray-50 text-lg px-10 py-6 h-auto w-full sm:w-auto">
                  도입 문의하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

