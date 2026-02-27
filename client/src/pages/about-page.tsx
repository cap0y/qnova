import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Users,
  Award,
  Target,
  Calendar,
  CheckCircle,
  ArrowRight,
  Star,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Heart,
  Shield,
  Zap,
} from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Link } from "wouter";

export default function AboutPage() {
  const companyHistory = [
    {
      year: "2020",
      title: "Qnova 설립",
      description: "교육 전문 기업으로 출발, 온라인 교육 플랫폼 개발 시작",
    },
    {
      year: "2021",
      title: "교육 플랫폼 런칭",
      description: "교육과정 및 본문 분석 서비스 정식 오픈",
    },
    {
      year: "2023",
      title: "AI 기반 학습 시스템 도입",
      description: "개인화된 학습 경험 제공을 위한 AI 기술 적용",
    },
    {
      year: "2024",
      title: "종합 교육 플랫폼 완성",
      description: "통합 교육 생태계 구축 및 서비스 고도화",
    },
  ];

  const coreValues = [
    {
      icon: <Target className="h-8 w-8 text-blue-600" />,
      title: "혁신 (Innovation)",
      description:
        "최신 기술과 교육 방법론을 결합하여 지속적으로 혁신하는 교육 서비스를 제공합니다.",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "신뢰 (Trust)",
      description:
        "투명하고 정직한 운영을 통해 고객과의 신뢰 관계를 구축합니다.",
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "전문성 (Expertise)",
      description:
        "교육 분야의 전문 지식과 경험을 바탕으로 최고 품질의 서비스를 제공합니다.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "협력 (Collaboration)",
      description:
        "고객, 파트너, 임직원 모두와 함께 성장하는 상생의 가치를 추구합니다.",
    },
  ];

  const achievements = [
    { number: "10,000+", label: "누적 수강생" },
    { number: "500+", label: "교육과정" },
    { number: "50+", label: "전문 강사진" },
    { number: "95%", label: "고객 만족도" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2830&q=80&blend=1e3a8a&sat=-100&exp=15&blend-mode=multiply"
            alt="Company Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/50 backdrop-blur-sm">
              About Us
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              (주)Qnova
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              교육의 미래를 선도하는 <br className="md:hidden" />
              <span className="text-blue-400 font-semibold">혁신적인 교육 플랫폼</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-300">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-400" />
                <span>경상남도 진주시 사들로 79, 401호 (충무공동)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">회사 소개</h2>
            <p className="text-lg text-gray-600 leading-loose">
              Qnova는 2020년 설립된 교육 전문 기업으로, 혁신적인 온라인 교육 플랫폼을 통해 
              양질의 교육과정, 본문 분석 서비스를 제공하고 있습니다. 
              우리는 <span className="font-semibold text-blue-600">교육의 디지털 전환</span>을 선도하며, 
              학습자 중심의 맞춤형 교육 서비스로 개인과 조직의 성장을 지원합니다.
            </p>
          </div>

          {/* Achievements */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 border-t border-b border-gray-100 py-12">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-500 font-medium mt-2">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card className="h-full border-none shadow-lg overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-500"></div>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <Lightbulb className="h-8 w-8 text-yellow-500" />
                  <span>비전 (Vision)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xl text-gray-800 font-medium leading-relaxed mb-6">
                  "교육의 경계를 허물고,<br />
                  모든 사람이 언제 어디서나 <br />
                  <span className="text-yellow-600 font-bold">최고 품질의 교육</span>을 받을 수 있는<br /> 
                  세상을 만든다"
                </p>
                <p className="text-gray-600">
                  우리는 기술과 교육의 융합을 통해 학습의 새로운 패러다임을 제시하고, 글로벌 교육 생태계의 혁신을 이끌어가겠습니다.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full border-none shadow-lg overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <Target className="h-8 w-8 text-blue-600" />
                  <span>미션 (Mission)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-4">
                  {[
                    "개인 맞춤형 학습 경험 제공",
                    "최신 교육 기술과 콘텐츠 개발",
                    "글로벌 교육 네트워크 구축",
                    "지속가능한 교육 생태계 조성"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">핵심 가치</h2>
            <p className="text-lg text-gray-600">
              Qnova가 추구하는 4가지 핵심 가치입니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {coreValues.map((value, index) => (
              <Card
                key={index}
                className="text-center h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-gray-100"
              >
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6 p-4 bg-gray-50 rounded-full w-20 h-20 mx-auto items-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company History */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">회사 연혁</h2>
            <p className="text-lg text-gray-600">
              Qnova의 성장 여정을 소개합니다
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>

              <div className="space-y-12">
                {companyHistory.map((item, index) => (
                  <div
                    key={index}
                    className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Empty half for desktop */}
                    <div className="hidden md:block w-5/12"></div>

                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md z-10"></div>

                    {/* Content */}
                    <div className="ml-20 md:ml-0 w-full md:w-5/12">
                      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-600">
                        <CardContent className="p-5">
                          <div className="text-blue-600 font-bold text-lg mb-1">{item.year}</div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              오시는 길 & 연락처
            </h2>
            <p className="text-lg text-gray-600">
              Qnova와 함께하고 싶으시다면 언제든 연락주세요
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="h-full border-none shadow-lg bg-slate-900 text-white">
                  <CardContent className="p-8 flex flex-col justify-between h-full">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xl font-bold mb-6 flex items-center">
                          <Building2 className="mr-2 h-5 w-5 text-blue-400" />
                          (주)Qnova
                        </h3>
                        <div className="space-y-6">
                          <div className="flex items-start">
                            <MapPin className="h-5 w-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-300 text-sm mb-1">주소</p>
                              <p className="leading-relaxed">
                                경상남도 진주시 사들로 79,<br />
                                401호 (충무공동)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Phone className="h-5 w-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-300 text-sm mb-1">전화번호</p>
                              <p>02-2606-4990</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <Mail className="h-5 w-5 text-blue-400 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-gray-300 text-sm mb-1">이메일</p>
                              <p>support@qnova.com</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-gray-700">
                      <Link href="/help">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                          문의하기
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map */}
              <div className="lg:col-span-2">
                <Card className="h-full border-none shadow-lg overflow-hidden">
                  <CardContent className="p-0 h-full min-h-[400px]">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3277.2468447247894!2d128.08862431525!3d35.16094758031!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x356892c9b2c8b8a9%3A0x4b0e8e4b4b0e8e4b!2z6rK96rO87rOo64-EIOynhOyjvOyLnCDsp4Dso7zrjIDroZwgNTAx!5e0!3m2!1sko!2skr!4v1703000000000!5m2!1sko!2skr"
                      width="100%"
                      height="100%"
                      style={{ border: 0, minHeight: "400px" }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Qnova 위치"
                    ></iframe>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
