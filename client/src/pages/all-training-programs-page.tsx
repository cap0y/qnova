import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Star, Users, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function AllTrainingProgramsPage() {
  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    level: "all",
    search: "",
    page: 1,
    limit: 12,
  });

  const { data: programsData, isLoading } = useQuery({
    queryKey: ["/api/courses", filters],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const totalPages = Math.ceil((programsData?.total || 0) / filters.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/uploads/images/793162f170a23aca2107c017272194c2_1750405130303.jpg"
            alt="All Training Programs"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">전체 교육 프로그램</h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              모든 분야의 전문 교육 프로그램을 한 곳에서 찾아보세요. 체계적인
              학습 과정으로 전문성을 향상시키실 수 있습니다.
            </p>
            <div className="text-lg font-medium">
              총 {programsData?.total || 0}개 프로그램
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분야
                </label>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="education">교육학</SelectItem>
                    <SelectItem value="psychology">심리학</SelectItem>
                    <SelectItem value="teaching">교수법</SelectItem>
                    <SelectItem value="policy">교육정책</SelectItem>
                    <SelectItem value="evaluation">교육평가</SelectItem>
                    <SelectItem value="safety">안전교육</SelectItem>
                    <SelectItem value="management">관리감독</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로그램 형태
                </label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="online">온라인</SelectItem>
                    <SelectItem value="offline">오프라인</SelectItem>
                    <SelectItem value="blended">블렌디드</SelectItem>
                    <SelectItem value="seminar">세미나</SelectItem>
                    <SelectItem value="workshop">워크숍</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  난이도
                </label>
                <Select
                  value={filters.level}
                  onValueChange={(value) => handleFilterChange("level", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="beginner">초급</SelectItem>
                    <SelectItem value="intermediate">중급</SelectItem>
                    <SelectItem value="advanced">고급</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  프로그램 검색
                </label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="프로그램명, 강사명 검색"
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                  />
                  <Button
                    onClick={() => handleFilterChange("search", filters.search)}
                  >
                    검색
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Program Tabs */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">전체 프로그램</TabsTrigger>
            <TabsTrigger value="mandatory">법정 의무교육</TabsTrigger>
            <TabsTrigger value="professional">전문성 강화</TabsTrigger>
            <TabsTrigger value="certificate">자격증 과정</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-8">
            {/* Programs Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <CardContent className="p-6 space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : programsData?.courses?.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500 mb-4">
                  검색 조건을 변경해서 다시 시도해보세요.
                </p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setFilters({
                      category: "all",
                      type: "all",
                      level: "all",
                      search: "",
                      page: 1,
                      limit: 12,
                    })
                  }
                >
                  전체 프로그램 보기
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {programsData?.courses?.map((program) => (
                  <Card
                    key={program.id}
                    className="group hover:shadow-lg transition-shadow"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={
                          program.imageUrl ||
                          "/uploads/images/5c3b6edcb4dc90068fe0fa39e6431805_1750405130302.jpg"
                        }
                        alt={program.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 left-2">
                        <Badge
                          variant={
                            program.type === "online" ? "default" : "secondary"
                          }
                        >
                          {program.type}
                        </Badge>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="bg-white">
                          {program.level}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {program.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {program.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {program.rating}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({program.students}명)
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {program.duration}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {program.maxStudents
                            ? `${program.students}/${program.maxStudents}명`
                            : `${program.students}명 수강`}
                        </div>
                        {program.credit && (
                          <Badge variant="outline">{program.credit}학점</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          {program.discountPrice ? (
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-500 line-through">
                                {program.price?.toLocaleString()}원
                              </span>
                              <span className="text-lg font-bold text-blue-600">
                                {program.discountPrice?.toLocaleString()}원
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              {program.price?.toLocaleString()}원
                            </span>
                          )}
                        </div>
                        <Link href={`/courses/${program.id}`}>
                          <Button size="sm">자세히 보기</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mandatory">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                법정 의무교육 프로그램
              </h3>
              <p className="text-gray-500 mb-4">
                법령에 의해 의무적으로 이수해야 하는 교육 과정들입니다.
              </p>
              <Link href="/training-courses">
                <Button>법정 의무교육 보기</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="professional">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                전문성 강화교육
              </h3>
              <p className="text-gray-500 mb-4">
                업무 전문성 향상과 역량 개발을 위한 심화 교육과정입니다.
              </p>
              <Link href="/professional-development">
                <Button>전문성 강화교육 보기</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="certificate">
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                자격증 취득 과정
              </h3>
              <p className="text-gray-500 mb-4">
                국가공인 자격증 취득을 위한 체계적인 교육과정입니다.
              </p>
              <Link href="/certificate-courses">
                <Button>자격증 과정 보기</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationPrevious
                  onClick={() =>
                    handlePageChange(Math.max(1, filters.page - 1))
                  }
                  className={
                    filters.page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => handlePageChange(page)}
                        isActive={filters.page === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationNext
                  onClick={() =>
                    handlePageChange(Math.min(totalPages, filters.page + 1))
                  }
                  className={
                    filters.page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
