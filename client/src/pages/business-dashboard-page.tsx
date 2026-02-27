import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  BookOpen,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Save,
  Trash2,
  Printer,
  FileSpreadsheet,
  LayoutGrid,
  Calendar,
  ListChecks,
  FileText,
  Settings,
  MoreHorizontal
} from "lucide-react";
import CourseManagement from "@/components/business/course-management";
import SeminarManagement from "@/components/business/seminar-management";
import WorkbookManagement from "@/components/business/workbook-management";
import StudentManagement from "@/components/business/student-management";
import AnalyticsDashboard from "@/components/business/analytics-dashboard";

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [location] = useLocation();

  // URL 파라미터에서 탭 확인
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get("tab") || "dashboard";

  const [activeTab, setActiveTab] = useState(initialTab);

  // 내 강의 목록 조회
  const {
    data: myCourses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery<{ courses: any[]; total: number }>({
    queryKey: [`/api/business/courses/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 수강생 통계 조회
  const {
    data: enrollmentStats,
    isLoading: enrollmentLoading,
    error: enrollmentError,
  } = useQuery<{ total: number }>({
    queryKey: [`/api/business/enrollment-stats/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 매출 통계 조회
  const {
    data: revenueStats,
    isLoading: revenueLoading,
    error: revenueError,
  } = useQuery<{ monthly: number; yearly: number; total: number }>({
    queryKey: [`/api/business/revenue-stats/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 로딩 상태 체크
  const isLoading = coursesLoading || enrollmentLoading || revenueLoading;
  const hasError = coursesError || enrollmentError || revenueError;

  // 대시보드 통계
  const stats = {
    totalCourses: myCourses?.courses?.length || 0,
    activeCourses:
      myCourses?.courses?.filter((c) => c.status === "active").length || 0,
    totalStudents: enrollmentStats?.total || 0,
    monthlyRevenue: revenueStats?.monthly || 0,
  };

  const getStatusBadge = (course: any) => {
    if (course.status === "active") {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="h-3 w-3 mr-1" />
          운영 중
        </Badge>
      );
    }
    return <Badge variant="secondary">비활성</Badge>;
  };

  // 선생님/사업자 회원이 아니면 접근 제한
  if (user?.userType !== "business") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            접근 권한이 없습니다
          </h1>
          <p className="text-gray-600 mb-6">
            이 페이지는 선생님/사업자 회원만 접근할 수 있습니다.
          </p>
          <Button onClick={() => window.history.back()}>이전 페이지로</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans">
      <Header />


      <div className="flex-1 container mx-auto px-4 py-2 max-w-7xl">
        
        {/* Main Content Area */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[800px] flex flex-col">
          
          {/* Gradient Header with Pattern */}
          <div className="relative bg-gradient-to-r from-[#00C6FB] to-[#005BEA] p-3 text-white overflow-hidden shrink-0">
            {/* Dot Pattern Overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="relative z-10 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                  <LayoutGrid className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-white drop-shadow-md">
                    선생님 대시보드
                  </h1>
                  <p className="text-blue-50 text-[10px] font-medium mt-0.5 opacity-90">
                    {user?.organizationName || user?.username} 선생님 환영합니다 | Teacher Dashboard
                  </p>
                </div>
              </div>
              <div className="hidden md:flex gap-2">
                 <Badge variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-6">
                    <Clock className="w-3 h-3 mr-1" /> {new Date().toLocaleDateString()}
                 </Badge>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
          >
            <div className="bg-gray-50/50 border-b px-4 pt-1 shrink-0">
              <TabsList className="bg-transparent h-auto p-0 gap-1 w-full justify-start flex-wrap">
                {[
                  { id: "dashboard", label: "대시보드", icon: LayoutGrid },
                  { id: "materials", label: "교재 관리", icon: BookOpen },
                  { id: "text-analysis", label: "본문 분석", icon: FileText },
                  { id: "workbooks", label: "문제집 관리", icon: ListChecks },
                  { id: "students", label: "학습자 관리", icon: Users },
                  { id: "analytics", label: "통계 및 분석", icon: BarChart3 },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-t-lg rounded-b-none px-3 py-2 h-auto gap-1.5 border border-transparent hover:text-blue-600 transition-all text-gray-600 font-medium text-xs"
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Tab Contents */}
            <div className="p-6 bg-gray-50/30 flex-1 overflow-y-auto">
              
              {/* Dashboard Tab */}
              <TabsContent value="dashboard" className="mt-0 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isLoading && (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {hasError && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm">
                    <h3 className="text-red-800 font-bold text-sm">데이터 로딩 오류</h3>
                    <p className="text-red-600 text-xs mt-1">데이터를 불러오는 중 문제가 발생했습니다.</p>
                  </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "총 교재 수", value: stats.totalCourses, icon: BookOpen, color: "bg-blue-500", sub: "등록된 교재" },
                    { label: "운영 중", value: stats.activeCourses, icon: CheckCircle, color: "bg-green-500", sub: "활성 상태" },
                    { label: "총 학습자", value: stats.totalStudents, icon: Users, color: "bg-purple-500", sub: "전체 학습자" },
                    { label: "월 매출", value: `₩${stats.monthlyRevenue.toLocaleString()}`, icon: TrendingUp, color: "bg-orange-500", sub: "이번 달" },
                  ].map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-1 overflow-hidden group">
                      <div className={`h-1.5 w-full ${stat.color}`}></div>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold text-gray-600">
                          {stat.label}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.color} bg-opacity-10 text-white group-hover:bg-opacity-20 transition-all`}>
                           <stat.icon className={`h-4 w-4 ${stat.color.replace('bg-', 'text-')}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-black text-gray-800">{stat.value}</div>
                        <p className="text-xs text-gray-400 mt-1 font-medium">{stat.sub}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent Courses List */}
                <Card className="border-none shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                      <h3 className="font-bold text-gray-800">최근 등록한 교재</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100">
                      {myCourses?.courses?.slice(0, 5).map((course) => (
                        <div key={course.id} className="p-4 hover:bg-blue-50/30 transition-colors flex items-center justify-between group cursor-pointer">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                              {course.category.slice(0, 2)}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors">{course.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{course.category}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                              </div>
                            </div>
                          </div>
                          {getStatusBadge(course)}
                        </div>
                      ))}
                      {(!myCourses?.courses || myCourses.courses.length === 0) && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          등록된 교재가 없습니다.
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Materials Management Tab */}
              <TabsContent value="materials" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-md overflow-hidden">
                   <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-800">교재 관리</h3>
                      </div>
                   </div>
                   <CardContent className="p-6">
                      <CourseManagement user={user} />
                   </CardContent>
                </Card>
              </TabsContent>

              {/* Text Analysis Tab */}
              <TabsContent value="text-analysis" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-md overflow-hidden">
                   <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-800">본문 분석 및 자료 생성</h3>
                      </div>
                   </div>
                   <CardContent className="p-0">
                      <SeminarManagement user={user} />
                   </CardContent>
                </Card>
              </TabsContent>

              {/* Workbooks Management Tab */}
              <TabsContent value="workbooks" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-md overflow-hidden">
                   <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-800">문제집 관리</h3>
                      </div>
                   </div>
                   <CardContent className="p-6">
                      <WorkbookManagement user={user} />
                   </CardContent>
                </Card>
              </TabsContent>

              {/* Students Management Tab */}
              <TabsContent value="students" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-md overflow-hidden">
                   <div className="bg-gradient-to-r from-orange-50 to-white px-6 py-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-800">학습자 관리</h3>
                      </div>
                   </div>
                   <CardContent className="p-6">
                      <StudentManagement user={user} />
                   </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-md overflow-hidden">
                   <div className="bg-gradient-to-r from-indigo-50 to-white px-6 py-4 border-b">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        <h3 className="font-bold text-gray-800">통계 및 분석</h3>
                      </div>
                   </div>
                   <CardContent className="p-6">
                      <AnalyticsDashboard user={user} />
                   </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
