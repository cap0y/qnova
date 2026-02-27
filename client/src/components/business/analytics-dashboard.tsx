import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  DollarSign,
  Award,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface AnalyticsProps {
  user: any;
}

interface AnalyticsData {
  monthlyData: Array<{
    month: string;
    enrollments: number;
    revenue: number;
    date: string;
  }>;
  courseStats: Array<{
    courseId: number;
    title: string;
    category: string;
    enrollments: number;
    revenue: number;
    averageRating: number;
    completionRate: number;
  }>;
  categoryStats: Array<{
    category: string;
    enrollments: number;
    revenue: number;
    courses: number;
  }>;
  topPerformingCourses: Array<{
    courseId: number;
    title: string;
    enrollments: number;
    revenue: number;
  }>;
  summary: {
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageEnrollmentPerCourse: number;
    thisMonthGrowth: number;
  };
}

const COLORS = [
  "#3B82F6",
  "#EF4444",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
];

export default function AnalyticsDashboard({ user }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState("12months");
  const { toast } = useToast();

  // 분석 데이터 조회
  const { data: analyticsData, isLoading } = useQuery<AnalyticsData>({
    queryKey: [`/api/business/analytics/${user?.id}`, user?.id, timeRange],
    enabled: !!user?.id,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">분석 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              분석 데이터 없음
            </h3>
            <p className="text-gray-500">
              아직 분석할 수 있는 데이터가 없습니다.
              <br />
              강의를 등록하고 수강생이 생기면 통계를 확인할 수 있습니다.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summary = analyticsData?.summary || {
    totalEnrollments: 0,
    thisMonthGrowth: 0,
    totalRevenue: 0,
    totalCourses: 0,
    activeStudents: 0,
    completionRate: 0,
  };

  const {
    monthlyData = [],
    courseStats = [],
    categoryStats = [],
    topPerformingCourses = [],
  } = analyticsData || {};

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            매출 및 수강 통계
          </h2>
          <p className="text-gray-600">
            선생님의 성과와 트렌드를 한눈에 확인하세요
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">최근 3개월</SelectItem>
              <SelectItem value="6months">최근 6개월</SelectItem>
              <SelectItem value="12months">최근 12개월</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summary.totalEnrollments)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {summary.thisMonthGrowth > 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">
                    +{summary.thisMonthGrowth}%
                  </span>
                </>
              ) : summary.thisMonthGrowth < 0 ? (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  <span className="text-red-600">
                    {summary.thisMonthGrowth}%
                  </span>
                </>
              ) : (
                <span>변화 없음</span>
              )}
              <span className="ml-1">전월 대비</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 매출</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">누적 매출액</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">운영 강의</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summary.totalCourses)}
            </div>
            <p className="text-xs text-muted-foreground">등록된 강의 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 수강생</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summary.averageEnrollmentPerCourse)}
            </div>
            <p className="text-xs text-muted-foreground">강의당 평균</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">성과 지수</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalEnrollments > 100
                ? "A+"
                : summary.totalEnrollments > 50
                  ? "A"
                  : summary.totalEnrollments > 20
                    ? "B"
                    : "C"}
            </div>
            <p className="text-xs text-muted-foreground">전체 등급</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 메뉴 */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">트렌드 분석</TabsTrigger>
          <TabsTrigger value="courses">강의별 성과</TabsTrigger>
          <TabsTrigger value="categories">카테고리 분석</TabsTrigger>
          <TabsTrigger value="performance">성과 순위</TabsTrigger>
        </TabsList>

        {/* 트렌드 분석 */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 월별 수강생 추이 */}
            <Card>
              <CardHeader>
                <CardTitle>월별 수강생 추이</CardTitle>
                <CardDescription>
                  최근 12개월간 수강생 등록 현황
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        `${formatNumber(value as number)}명`,
                        name === "enrollments" ? "수강생" : "매출",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 월별 매출 추이 */}
            <Card>
              <CardHeader>
                <CardTitle>월별 매출 추이</CardTitle>
                <CardDescription>최근 12개월간 매출 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={monthlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value) =>
                        `${(value / 1000000).toFixed(1)}M`
                      }
                      width={80}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "매출",
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 통합 트렌드 */}
          <Card>
            <CardHeader>
              <CardTitle>수강생 vs 매출 비교</CardTitle>
              <CardDescription>수강생 등록과 매출의 상관관계</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" width={60} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "enrollments"
                        ? `${formatNumber(value as number)}명`
                        : formatCurrency(value as number),
                      name === "enrollments" ? "수강생" : "매출",
                    ]}
                  />
                  <Legend
                    payload={[
                      { value: "수강생", type: "line", color: "#3B82F6" },
                      { value: "매출", type: "line", color: "#10B981" },
                    ]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="수강생"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="매출"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 강의별 성과 */}
        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>강의별 상세 성과</CardTitle>
              <CardDescription>
                각 강의의 수강생, 매출, 완료율 분석
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courseStats.slice(0, 10).map((course, index) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium">{course.title}</h4>
                          <p className="text-sm text-gray-600">
                            {course.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-blue-600">
                          {formatNumber(course.enrollments)}
                        </div>
                        <div className="text-xs text-gray-500">수강생</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {formatCurrency(course.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">매출</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {course.completionRate}%
                        </div>
                        <div className="text-xs text-gray-500">완료율</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span
                              key={i}
                              className={`text-xs ${i < Math.floor(course.averageRating) ? "text-yellow-400" : "text-gray-300"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500">평점</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 카테고리 분석 */}
        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 카테고리별 수강생 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>카테고리별 수강생 분포</CardTitle>
                <CardDescription>강의 카테고리별 수강생 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, enrollments, percent }) =>
                        `${category}\n${enrollments}명 (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="enrollments"
                      fontSize={11}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        `${formatNumber(value as number)}명`,
                        "수강생",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 카테고리별 매출 분포 */}
            <Card>
              <CardHeader>
                <CardTitle>카테고리별 매출 분포</CardTitle>
                <CardDescription>강의 카테고리별 매출 현황</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, revenue, percent }) =>
                        `${category}\n${formatCurrency(revenue)} (${(percent * 100).toFixed(1)}%)`
                      }
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="revenue"
                      fontSize={11}
                    >
                      {categoryStats.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value as number),
                        "매출",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 카테고리별 상세 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>카테고리별 상세 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((category, index) => (
                  <div
                    key={category.category}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{category.category}</h4>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">강의 수</span>
                        <span className="font-medium">
                          {category.courses}개
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">수강생</span>
                        <span className="font-medium">
                          {formatNumber(category.enrollments)}명
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">매출</span>
                        <span className="font-medium">
                          {formatCurrency(category.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          강의당 평균
                        </span>
                        <span className="font-medium">
                          {Math.round(category.enrollments / category.courses)}
                          명
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 성과 순위 */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* TOP 강의 - 수강생 기준 */}
            <Card>
              <CardHeader>
                <CardTitle>인기 강의 TOP 5</CardTitle>
                <CardDescription>수강생 수 기준 상위 강의</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformingCourses.map((course, index) => (
                    <div
                      key={course.courseId}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-amber-600"
                                  : "bg-blue-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">
                            {course.title}
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-blue-600">
                          {formatNumber(course.enrollments)}명
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(course.revenue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* TOP 강의 - 매출 기준 */}
            <Card>
              <CardHeader>
                <CardTitle>수익 강의 TOP 5</CardTitle>
                <CardDescription>매출액 기준 상위 강의</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...topPerformingCourses]
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((course, index) => (
                      <div
                        key={course.courseId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                              index === 0
                                ? "bg-green-500"
                                : index === 1
                                  ? "bg-emerald-400"
                                  : index === 2
                                    ? "bg-teal-600"
                                    : "bg-cyan-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">
                              {course.title}
                            </h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">
                            {formatCurrency(course.revenue)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatNumber(course.enrollments)}명
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 성과 비교 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>상위 10개 강의 성과 비교</CardTitle>
              <CardDescription>수강생 수와 매출을 동시에 비교</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={courseStats.slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="title"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis yAxisId="left" width={60} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "enrollments"
                        ? `${formatNumber(value as number)}명`
                        : formatCurrency(value as number),
                      name === "enrollments" ? "수강생" : "매출",
                    ]}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="enrollments"
                    fill="#3B82F6"
                    name="수강생"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    fill="#10B981"
                    name="매출"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
