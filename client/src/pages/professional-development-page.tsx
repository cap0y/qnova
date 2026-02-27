import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/ui/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: string;
  discountPrice?: string;
  duration: number;
  maxStudents: number;
  enrolledCount: number;
  currentStudents: number;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  isActive: boolean;
  status: string;
  approvalStatus: string;
  createdAt: string;
}

export default function ProfessionalDevelopmentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  // Fetch courses with professional development category
  const { data: coursesData, isLoading } = useQuery<{
    courses: Course[];
    total: number;
  }>({
    queryKey: ["/api/courses", { category: "전문성강화", search: searchQuery }],
  });

  const courses = coursesData?.courses || [];

  const developmentFields = [
    {
      id: "교육혁신",
      name: "교육혁신",
      count: courses.filter(
        (c) => c.title.includes("혁신") || c.title.includes("변화"),
      ).length,
      imageUrl: "/uploads/photo1.jpg",
      overlay: "bg-blue-600",
      hoverColor: "text-blue-600",
    },
    {
      id: "디지털교육",
      name: "디지털교육",
      count: courses.filter(
        (c) =>
          c.title.includes("디지털") ||
          c.title.includes("AI") ||
          c.title.includes("온라인"),
      ).length,
      imageUrl: "/uploads/photo2.jpg",
      overlay: "bg-green-600",
      hoverColor: "text-green-600",
    },
    {
      id: "교수법",
      name: "교수법",
      count: courses.filter(
        (c) => c.title.includes("교수법") || c.title.includes("수업"),
      ).length,
      imageUrl: "/uploads/photo3.jpg",
      overlay: "bg-purple-600",
      hoverColor: "text-purple-600",
    },
    {
      id: "평가방법",
      name: "평가방법",
      count: courses.filter(
        (c) => c.title.includes("평가") || c.title.includes("측정"),
      ).length,
      imageUrl: "/uploads/photo4.jpg",
      overlay: "bg-yellow-600",
      hoverColor: "text-yellow-600",
    },
    {
      id: "학습자중심",
      name: "학습자중심",
      count: courses.filter(
        (c) => c.title.includes("학습자") || c.title.includes("학생"),
      ).length,
      imageUrl: "/uploads/photo5.jpg",
      overlay: "bg-indigo-600",
      hoverColor: "text-indigo-600",
    },
    {
      id: "융합교육",
      name: "융합교육",
      count: courses.filter(
        (c) => c.title.includes("융합") || c.title.includes("통합"),
      ).length,
      imageUrl: "/uploads/photo0.jpg",
      overlay: "bg-red-600",
      hoverColor: "text-red-600",
    },
  ];

  // Filter courses based on selected criteria
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField =
      selectedField === "" ||
      selectedField === "all" ||
      course.title.includes(selectedField) ||
      course.description.includes(selectedField);
    const matchesLevel =
      selectedLevel === "" ||
      selectedLevel === "all" ||
      course.level === selectedLevel;

    return (
      matchesSearch &&
      matchesField &&
      matchesLevel &&
      course.status === "active" &&
      course.approvalStatus === "approved"
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/uploads/images/12.jpg"
            alt="전문성 강화교육 배경"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">전문성 강화교육</h1>
            <p className="text-xl text-purple-100 mb-6">
              업무 전문성 향상과 역량 개발을 위한 심화 교육과정으로 경쟁력을
              강화하세요.
            </p>
            <div className="flex space-x-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                인기 과정 보기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white bg-white/20 px-6 py-3 text-base font-semibold"
              >
                맞춤 상담
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pb-4">
        {/* Field Navigation with Circular Images */}
        <section className="mb-2 py-8">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
            분야별 전문성 강화 과정
          </h2>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-4xl">
              {developmentFields.map((field) => (
                <Link
                  key={field.id}
                  href={`/professional-development?category=${field.id}`}
                >
                  <div className="text-center group cursor-pointer">
                    <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <img
                        src={field.imageUrl}
                        alt={field.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div
                        className={`absolute inset-0 ${field.overlay} bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300`}
                      ></div>
                    </div>
                    <div
                      className={`font-medium text-sm transition-colors text-gray-800 group-hover:${field.hoverColor}`}
                    >
                      {field.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {field.count}개 과정
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="과정명 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>

            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="전문 분야" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="교육혁신">교육혁신</SelectItem>
                <SelectItem value="디지털교육">디지털교육</SelectItem>
                <SelectItem value="교수법">교수법</SelectItem>
                <SelectItem value="평가방법">평가방법</SelectItem>
                <SelectItem value="학습자중심">학습자중심</SelectItem>
                <SelectItem value="융합교육">융합교육</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="교육 수준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="기초">기초</SelectItem>
                <SelectItem value="중급">중급</SelectItem>
                <SelectItem value="고급">고급</SelectItem>
                <SelectItem value="전문가">전문가</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-purple-600 hover:bg-purple-700">
              <i className="fas fa-search mr-2"></i>
              검색
            </Button>
          </div>
        </div>

        {/* Featured Programs */}
        <section className="mb-2">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            추천 전문성 강화 프로그램
          </h2>
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trending">인기 과정</TabsTrigger>
              <TabsTrigger value="교육혁신">교육혁신</TabsTrigger>
              <TabsTrigger value="디지털교육">디지털교육</TabsTrigger>
              <TabsTrigger value="교수법">교수법</TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-sm border animate-pulse"
                    >
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.slice(0, 6).map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="교육혁신" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      <i className="fas fa-crown mr-2 text-purple-600"></i>
                      교육혁신 핵심 과정
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 미래교육과 패러다임 전환</li>
                      <li>• 교육과정 혁신과 설계</li>
                      <li>• 창의적 교육방법론</li>
                      <li>• 교육현장 변화 관리</li>
                    </ul>
                  </CardContent>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      <i className="fas fa-users mr-2 text-blue-600"></i>
                      교육리더십 과정
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 교육리더의 역할과 사명</li>
                      <li>• 교육조직 변화 관리</li>
                      <li>• 교육성과 향상 전략</li>
                      <li>• 교육 커뮤니케이션 스킬</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="디지털교육" className="mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  <i className="fas fa-robot mr-2 text-blue-600"></i>
                  디지털 시대 교육 혁신 필수 역량
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      기초 과정
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• 디지털 교수법 기초</li>
                      <li>• 온라인 수업 설계</li>
                      <li>• 에듀테크 도구 활용</li>
                      <li>• 블렌디드 러닝 구현</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">
                      심화 과정
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• AI 활용 개인화 교육</li>
                      <li>• 빅데이터 기반 학습분석</li>
                      <li>• VR/AR 교육 콘텐츠 제작</li>
                      <li>• 디지털 교육 평가</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="교수법" className="mt-6">
              <div className="space-y-6">
                <Card className="p-6">
                  <CardContent className="p-0">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      <i className="fas fa-project-diagram mr-2 text-green-600"></i>
                      현대적 교수법 전문가 과정
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">
                          1단계: 이론
                        </h4>
                        <p className="text-sm text-green-600">
                          학습자 중심 교수법 이론과 원리 학습
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          2단계: 실습
                        </h4>
                        <p className="text-sm text-blue-600">
                          다양한 교수기법 실습과 적용
                        </p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-800 mb-2">
                          3단계: 평가
                        </h4>
                        <p className="text-sm text-purple-600">
                          교수법 역량 인증과 피드백
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Learning Path Section */}
        <section className="mb-0">
          <div className="bg-purple-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              학습 로드맵
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">역량 진단</h3>
                <p className="text-gray-600 text-sm">
                  현재 역량 수준을 정확히 파악하고 목표를 설정합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">맞춤 학습</h3>
                <p className="text-gray-600 text-sm">
                  개인별 맞춤 커리큘럼으로 체계적인 학습을 진행합니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">실무 적용</h3>
                <p className="text-gray-600 text-sm">
                  학습한 내용을 실제 업무에 적용하고 피드백을 받습니다.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">역량 인증</h3>
                <p className="text-gray-600 text-sm">
                  완료된 과정에 대한 인증서를 발급받습니다.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
