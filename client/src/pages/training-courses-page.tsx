import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
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
import { Search, Shield, AlertTriangle, FileCheck, Clock } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: number;
  discountPrice?: number;
  duration: string;
  totalHours: number;
  maxStudents: number;
  status: string;
  approvalStatus: string;
  instructorId: number;
  objectives?: string;
  requirements?: string;
  materials?: string;
  curriculum?: string;
  imageUrl?: string;
  rating?: number;
  createdAt: string;
  updatedAt?: string;
  enrolledCount?: number;
}

interface CoursesResponse {
  courses: Course[];
  total: number;
}

export default function TrainingCoursesPage() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  // 개발 편의를 위해 category가 없으면 법정의무교육을 기본값으로 설정
  const category = decodeURIComponent(
    searchParams.get("category") || "법정의무교육",
  );
  const urlSubcategory = searchParams.get("subcategory") || "all";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedLegalCategory, setSelectedLegalCategory] =
    useState(urlSubcategory);

  // 디버깅을 위한 로그
  console.log("Location:", location);
  console.log("Category:", category);
  console.log("SelectedLegalCategory:", selectedLegalCategory);

  // API 쿼리 파라미터 확인
  const queryParams = {
    category,
    search: searchQuery,
    type: selectedType === "all" ? "" : selectedType,
    level: selectedLevel === "all" ? "" : selectedLevel,
    subcategory: selectedLegalCategory === "all" ? "" : selectedLegalCategory,
  };
  console.log("API Query Params:", queryParams);

  // Fetch courses with filters
  const { data: coursesData, isLoading } = useQuery<CoursesResponse>({
    queryKey: ["/api/courses", queryParams],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (queryParams.category)
        searchParams.append("category", queryParams.category);
      if (queryParams.search) searchParams.append("search", queryParams.search);
      if (queryParams.type) searchParams.append("type", queryParams.type);
      if (queryParams.level) searchParams.append("level", queryParams.level);
      if (queryParams.subcategory)
        searchParams.append("subcategory", queryParams.subcategory);

      const url = `/api/courses?${searchParams.toString()}`;
      console.log("실제 API 요청 URL:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    },
  });

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case "법정의무교육":
        return "법정 의무교육";
      case "전문성강화교육":
        return "전문성 강화교육";
      case "자격증":
        return "자격증 과정";
      default:
        return "교육과정";
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case "법정의무교육":
        return "법령에 의해 의무적으로 이수해야 하는 안전교육 및 보건교육 과정입니다.";
      case "전문성강화교육":
        return "업무 전문성 향상과 역량 개발을 위한 심화 교육과정입니다.";
      case "자격증":
        return "국가공인 자격증 취득을 위한 체계적인 교육과정입니다.";
      default:
        return "다양한 분야의 교육과정을 제공합니다.";
    }
  };

  // 법정의무교육 카테고리
  const legalEducationCategories = [
    {
      id: "all",
      name: "전체",
      count: coursesData?.courses.length || 0,
      imageUrl: "/uploads/images/course-default.jpg",
      overlay: "bg-blue-600",
      description: "모든 법정의무교육 과정",
    },
    {
      id: "화학물질",
      name: "화학물질 안전교육",
      count:
        coursesData?.courses.filter(
          (c) => c.title.includes("화학물질") || c.title.includes("MSDS"),
        ).length || 0,
      imageUrl: "/uploads/photo0.jpg",
      overlay: "bg-red-600",
      description: "화학물질 취급 및 MSDS 관련 필수 교육",
    },
    {
      id: "산업안전",
      name: "산업안전보건교육",
      count:
        coursesData?.courses.filter(
          (c) => c.title.includes("산업안전") || c.title.includes("안전보건"),
        ).length || 0,
      imageUrl: "/uploads/photo1.jpg",
      overlay: "bg-orange-600",
      description: "산업재해 예방을 위한 안전보건 교육",
    },
    {
      id: "소방안전",
      name: "소방안전교육",
      count:
        coursesData?.courses.filter(
          (c) => c.title.includes("소방") || c.title.includes("화재"),
        ).length || 0,
      imageUrl: "/uploads/photo2.jpg",
      overlay: "bg-red-500",
      description: "화재예방 및 소방시설 관리 교육",
    },
    {
      id: "환경안전",
      name: "환경안전교육",
      count:
        coursesData?.courses.filter(
          (c) => c.title.includes("환경") || c.title.includes("폐기물"),
        ).length || 0,
      imageUrl: "/uploads/photo3.jpg",
      overlay: "bg-green-600",
      description: "환경보호 및 폐기물 관리 교육",
    },
    {
      id: "개인정보",
      name: "개인정보보호교육",
      count:
        coursesData?.courses.filter(
          (c) => c.title.includes("개인정보") || c.title.includes("정보보호"),
        ).length || 0,
      imageUrl: "/uploads/photo4.jpg",
      overlay: "bg-blue-600",
      description: "개인정보보호법 준수 의무교육",
    },
    {
      id: "성희롱예방",
      name: "성희롱예방교육",
      count:
        coursesData?.courses.filter(
          (c) => c.title.includes("성희롱") || c.title.includes("성폭력"),
        ).length || 0,
      imageUrl: "/uploads/photo5.jpg",
      overlay: "bg-purple-600",
      description: "직장 내 성희롱 예방 의무교육",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      {category === "법정의무교육" ? (
        <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/uploads/images/4.jpg"
              alt="법정의무교육 배경"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 z-10">
            <div className="max-w-3xl">
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 mr-3" />
                <h1 className="text-4xl font-bold">법정 의무교육</h1>
              </div>
              <p className="text-xl text-red-100 mb-6">
                법령에 의해 의무적으로 이수해야 하는 안전교육 및 보건교육
                과정으로 안전한 작업환경을 만들어가세요.
              </p>
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-red-600 hover:bg-gray-100"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  필수 과정 보기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-white/20 px-6 py-3 text-base font-semibold"
                >
                  교육 일정 문의
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/uploads/images/4.jpg"
              alt="교육과정 배경"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>

          {/* Content */}
          <div className="relative container mx-auto px-4 z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold mb-4">
                {getCategoryTitle(category)}
              </h1>
              <p className="text-xl text-blue-100 mb-6">
                {getCategoryDescription(category)}
              </p>
              <div className="flex space-x-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  인기 과정 보기
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-white/20 px-6 py-3 text-base font-semibold"
                >
                  교육 상담 문의
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Legal Education Categories - Only show for legal education */}
      {category === "법정의무교육" && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              법정의무교육 분야
            </h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 max-w-5xl">
                {legalEducationCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`text-center cursor-pointer group ${
                      selectedLegalCategory === category.id
                        ? "transform scale-105"
                        : ""
                    }`}
                    onClick={() => setSelectedLegalCategory(category.id)}
                  >
                    <div
                      className={`relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
                        selectedLegalCategory === category.id
                          ? "ring-4 ring-red-500"
                          : ""
                      }`}
                    >
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div
                        className={`absolute inset-0 ${category.overlay} ${
                          selectedLegalCategory === category.id
                            ? "bg-opacity-30"
                            : "bg-opacity-20 group-hover:bg-opacity-10"
                        } transition-opacity duration-300`}
                      ></div>
                    </div>
                    <div
                      className={`font-medium text-sm transition-colors ${
                        selectedLegalCategory === category.id
                          ? "text-red-600 font-semibold"
                          : "text-gray-800 group-hover:text-red-600"
                      }`}
                    >
                      {category.id === "all"
                        ? category.name
                        : category.name.replace("교육", "")}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {category.count}개 과정
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Legal Education Categories - Show for all pages */}
      {category !== "법정의무교육" && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              법정의무교육 분야
            </h2>
            <div className="flex justify-center">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl">
                {legalEducationCategories
                  .filter((cat) => cat.id !== "all")
                  .map((category) => (
                    <Link
                      key={category.id}
                      href={`/training-courses?category=법정의무교육&subcategory=${category.id}`}
                    >
                      <div className="text-center cursor-pointer group">
                        <div className="relative w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div
                            className={`absolute inset-0 ${category.overlay} bg-opacity-20 group-hover:bg-opacity-10 transition-opacity duration-300`}
                          ></div>
                        </div>
                        <div className="font-medium text-sm text-gray-800 group-hover:text-red-600 transition-colors">
                          {category.name.replace("교육", "")}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {category.count}개 과정
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Legal Education Info Cards - Only for legal education */}
        {category === "법정의무교육" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100">
              <CardContent className="p-0">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                  <h3 className="text-lg font-semibold text-red-800">
                    법정 의무사항
                  </h3>
                </div>
                <p className="text-sm text-red-700">
                  관련 법령에 따라 정기적으로 이수해야 하는 필수 교육과정입니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-0">
                <div className="flex items-center mb-3">
                  <FileCheck className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-blue-800">
                    수료증 발급
                  </h3>
                </div>
                <p className="text-sm text-blue-700">
                  교육 이수 후 법정 교육 수료증이 자동으로 발급됩니다.
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100">
              <CardContent className="p-0">
                <div className="flex items-center mb-3">
                  <Clock className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-green-800">
                    이수 기한
                  </h3>
                </div>
                <p className="text-sm text-green-700">
                  법정 교육 이수 기한을 놓치지 않도록 알림 서비스를 제공합니다.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="교육형태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="online">온라인</SelectItem>
                <SelectItem value="offline">오프라인</SelectItem>
                <SelectItem value="blended">블렌디드</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="교육수준" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="기초">기초</SelectItem>
                <SelectItem value="심화">심화</SelectItem>
                <SelectItem value="관리자">관리자</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-red-600 hover:bg-red-700">
              <Search className="h-4 w-4 mr-2" />
              검색
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-600">
            총{" "}
            <span className="font-semibold text-gray-800">
              {coursesData?.total || 0}
            </span>
            개의 과정이 있습니다.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">정렬:</span>
            <Select defaultValue="latest">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="deadline">마감임박순</SelectItem>
                <SelectItem value="popular">인기순</SelectItem>
                <SelectItem value="required">필수순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Course Grid */}
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
        ) : coursesData?.courses && coursesData.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  ...course,
                  price: course.price.toString(),
                  discountPrice: course.discountPrice?.toString(),
                  duration: course.totalHours,
                  currentStudents: course.enrolledCount || 0,
                  isActive: course.status === "active",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              등록된 법정의무교육 과정이 없습니다
            </h3>
            <p className="text-gray-500">
              새로운 교육과정이 곧 추가될 예정입니다.
            </p>
          </div>
        )}

        {/* Pagination would go here */}
        {coursesData?.total && coursesData.total > 6 && (
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-red-600 text-white"
              >
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                다음
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
