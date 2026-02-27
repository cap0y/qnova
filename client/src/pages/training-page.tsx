import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

interface Course {
  id: number;
  title: string;
  description: string;
  target: string[];
  type: string;
  hours: number;
  price: number;
  priceFormatted: string;
  schedule: string[];
  imageUrl: string;
  tags: string[];
  instructor: string;
  rating: number;
  students: number;
  isRequired: boolean;
  certificate: string;
}

const TrainingPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("regular");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFaq, setShowFaq] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const courses: Course[] = [
    {
      id: 1,
      title: "관리감독자 정기교육",
      description:
        "산업안전보건법에 따른 관리감독자 대상 정기교육으로, 안전보건관리 책임과 역할, 위험성평가, 산업재해 사례 등을 학습합니다.",
      target: ["관리감독자"],
      type: "정기교육",
      hours: 16,
      price: 120000,
      priceFormatted: "120,000원",
      schedule: ["2025-07-15", "2025-08-20", "2025-09-10"],
      imageUrl: "/api/placeholder/400/250",
      tags: ["관리감독자", "법정의무교육", "정기교육"],
      instructor: "김안전 교수",
      rating: 4.8,
      students: 1245,
      isRequired: true,
      certificate: "관리감독자 정기교육 수료증",
    },
    {
      id: 2,
      title: "근로자 정기교육 (사무직)",
      description:
        "산업안전보건법에 따른 사무직 근로자 대상 정기교육으로, 사무실 안전, 응급처치, 건강관리 등 사무환경 관련 안전보건 내용을 학습합니다.",
      target: ["근로자", "사무직"],
      type: "정기교육",
      hours: 6,
      price: 60000,
      priceFormatted: "60,000원",
      schedule: ["2025-07-05", "2025-08-10", "2025-09-05"],
      imageUrl: "/api/placeholder/400/250",
      tags: ["사무직", "근로자", "법정의무교육", "정기교육"],
      instructor: "박보건 강사",
      rating: 4.6,
      students: 2356,
      isRequired: true,
      certificate: "근로자 정기교육 수료증",
    },
    {
      id: 3,
      title: "근로자 정기교육 (비사무직)",
      description:
        "산업안전보건법에 따른 비사무직 근로자 대상 정기교육으로, 작업안전수칙, 보호구 착용법, 위험기계 취급 안전 등 현장 안전 내용을 학습합니다.",
      target: ["근로자", "비사무직"],
      type: "정기교육",
      hours: 12,
      price: 80000,
      priceFormatted: "80,000원",
      schedule: ["2025-07-10", "2025-08-15", "2025-09-12"],
      imageUrl: "/api/placeholder/400/250",
      tags: ["비사무직", "근로자", "법정의무교육", "정기교육"],
      instructor: "이현장 강사",
      rating: 4.7,
      students: 1876,
      isRequired: true,
      certificate: "근로자 정기교육 수료증",
    },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTarget =
      selectedTarget === "all" || course.target.includes(selectedTarget);
    const matchesType = selectedType === "all" || course.type === selectedType;

    return matchesSearch && matchesTarget && matchesType;
  });

  const faqItems = [
    {
      question: "법정의무교육이란 무엇인가요?",
      answer:
        "산업안전보건법, 개인정보보호법 등 관련 법령에 따라 의무적으로 이수해야 하는 교육입니다.",
    },
    {
      question: "교육 수료증은 언제 발급되나요?",
      answer:
        "교육 과정을 모두 이수하고 평가를 통과하면 즉시 수료증이 발급됩니다.",
    },
    {
      question: "교육비 지원이 가능한가요?",
      answer:
        "고용보험환급과정으로 지정된 교육의 경우 교육비 환급이 가능합니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">에듀플랫폼</h1>
              <nav className="hidden md:flex space-x-6">
                <a href="/" className="text-gray-600 hover:text-blue-600">
                  홈
                </a>
                <a href="/training" className="text-blue-600 font-medium">
                  교육 프로그램
                </a>
                <a
                  href="/courses"
                  className="text-gray-600 hover:text-blue-600"
                >
                  교육과정
                </a>
                <a
                  href="/seminars"
                  className="text-gray-600 hover:text-blue-600"
                >
                  세미나
                </a>
                <a
                  href="/announcements"
                  className="text-gray-600 hover:text-blue-600"
                >
                  공지사항
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">로그인</Button>
              <Button>회원가입</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">법정의무교육 통합 플랫폼</h2>
          <p className="text-xl mb-8">
            체계적이고 전문적인 교육으로 안전한 직장 환경을 만들어보세요
          </p>
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              <Input
                type="text"
                placeholder="교육과정을 검색하세요"
                className="pl-4 pr-12 py-3 text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button className="absolute right-1 top-1 bottom-1 px-4">
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs
          defaultValue="regular"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="regular">정기교육</TabsTrigger>
            <TabsTrigger value="special">특별교육</TabsTrigger>
            <TabsTrigger value="certification">자격교육</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    대상자
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                  >
                    <option value="all">전체</option>
                    <option value="관리감독자">관리감독자</option>
                    <option value="근로자">근로자</option>
                    <option value="사무직">사무직</option>
                    <option value="비사무직">비사무직</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    교육유형
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">전체</option>
                    <option value="정기교육">정기교육</option>
                    <option value="특별교육">특별교육</option>
                    <option value="신규교육">신규교육</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    <i className="fas fa-filter mr-2"></i>
                    필터 적용
                  </Button>
                </div>
              </div>
            </div>

            {/* Course List */}
            <TabsContent value="regular" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Card
                    key={course.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                      {course.isRequired && (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          필수
                        </Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {course.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold text-lg mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {course.description}
                      </p>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>교육시간</span>
                          <span>{course.hours}시간</span>
                        </div>
                        <div className="flex justify-between">
                          <span>수강료</span>
                          <span className="font-semibold text-blue-600">
                            {course.priceFormatted}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>강사</span>
                          <span>{course.instructor}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>평점</span>
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span>{course.rating}</span>
                            <span className="text-gray-500 ml-1">
                              ({course.students}명)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          수강 신청
                        </Button>
                        <Button variant="outline" className="w-full">
                          자세히 보기
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="special">
              <div className="text-center py-12">
                <p className="text-gray-500">특별교육 과정이 준비 중입니다.</p>
              </div>
            </TabsContent>

            <TabsContent value="certification">
              <div className="text-center py-12">
                <p className="text-gray-500">자격교육 과정이 준비 중입니다.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* FAQ Section */}
        <section className="mt-16 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-2xl font-bold mb-6">자주 묻는 질문</h3>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">에듀플랫폼</h4>
              <p className="text-gray-400">
                전문적인 교육 서비스를 제공하는 온라인 플랫폼입니다.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">바로가기</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="/courses" className="hover:text-white">
                    교육과정
                  </a>
                </li>
                <li>
                  <a href="/seminars" className="hover:text-white">
                    세미나
                  </a>
                </li>
                <li>
                  <a href="/announcements" className="hover:text-white">
                    공지사항
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li>전화: 055-772-2226</li>
                <li>이메일: bkim@jinuchem.co.kr</li>
                <li>운영시간: 평일 09:00-18:00</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TrainingPage;
