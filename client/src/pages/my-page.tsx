import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Calendar,
  CreditCard,
  User,
  Award,
  Clock,
  CheckCircle,
  Video,
  Eye,
  Download,
  FileText,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface Course {
  id: number;
  title: string;
  credit: number;
  progress?: number;
  category?: string;
  type?: string;
  duration?: string;
}

interface Enrollment {
  id: number;
  status: "enrolled" | "completed" | "cancelled" | "pending";
  course: Course;
  enrolledAt: string;
  progress: number;
  type?: string; // type 추가
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  course: Course;
  paymentMethod?: string;
  transactionId?: string;
  user?: {
    name?: string;
    email?: string;
  };
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

export default function MyPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // 선생님 회원인 경우 선생님 대시보드로 리다이렉트
  if (user.userType === "business") {
    return <Redirect to="/business-dashboard" />;
  }

  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  // Fetch user's enrollments
  const { data: enrollments, isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useQuery<
    Enrollment[]
  >({
    queryKey: ["/api/enrollments"],
    enabled: !!user,
  });

  // Fetch user's payments
  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    enabled: !!user,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest("PUT", `/api/users/${user?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "프로필 업데이트 완료",
        description: "성공적으로 업데이트되었습니다.",
      });
      setShowProfileDialog(false);
    },
    onError: (error) => {
      toast({
        title: "업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enrollment cancellation/deletion mutation
  const deleteEnrollmentMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      return apiRequest("DELETE", `/api/enrollments/${enrollmentId}`);
    },
    onSuccess: () => {
      refetchEnrollments();
      toast({
        title: "삭제 완료",
        description: "항목이 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteEnrollment = (enrollmentId: number) => {
    if (confirm("정말로 삭제하시겠습니까?")) {
      deleteEnrollmentMutation.mutate(enrollmentId);
    }
  };

  const getStatusBadge = (
    status: string,
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "enrolled":
        return "default";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">대기</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  const calculateStats = () => {
    const enrollmentList = enrollments || [];

    const total = enrollmentList.length;
    const completed = enrollmentList.filter(
      (e) => e.status === "completed",
    ).length;
    const inProgress = enrollmentList.filter(
      (e) => e.status === "enrolled",
    ).length;
    const totalCredits = enrollmentList
      .filter((e) => e.status === "completed")
      .reduce((sum, e) => sum + (e.course?.credit || 0), 0);

    return { total, completed, inProgress, totalCredits };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl bg-white text-primary">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {user?.name || "사용자"}님
                </h1>
                <p className="text-blue-100 mb-4">{user?.email}</p>
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="text-blue-200">가입 유형</span>
                    <div className="font-medium">
                      {user?.userType === "individual" ? "개인회원" : "선생님회원"}
                    </div>
                  </div>
                  <div>
                    <span className="text-blue-200">총 학점</span>
                    <div className="font-medium">{stats.totalCredits}학점</div>
                  </div>
                  <div>
                    <span className="text-blue-200">수료 과정</span>
                    <div className="font-medium">{stats.completed}개</div>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowProfileDialog(true)}
              >
                프로필 수정
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger
                value="dashboard"
                className="flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>대시보드</span>
              </TabsTrigger>
            <TabsTrigger
              value="courses"
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>교재 관리</span>
            </TabsTrigger>
              <TabsTrigger
                value="seminars"
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>본문 분석</span>
              </TabsTrigger>
              <TabsTrigger
                value="certificates"
                className="flex items-center space-x-2"
              >
                <Award className="h-4 w-4" />
                <span>수료증</span>
              </TabsTrigger>
              <TabsTrigger
                value="payments"
                className="flex items-center space-x-2"
              >
                <CreditCard className="h-4 w-4" />
                <span>결제 내역</span>
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    총 수강 과정
                  </CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">
                    누적 수강 과정
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">수강중</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.inProgress}
                  </div>
                  <p className="text-xs text-muted-foreground">진행중인 과정</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    수료 완료
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </div>
                  <p className="text-xs text-muted-foreground">완료된 과정</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    취득 학점
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalCredits}
                  </div>
                  <p className="text-xs text-muted-foreground">총 학점</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>최근 수강 과정</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {enrollmentsLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))
                      : enrollments?.slice(0, 3).map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">
                                {enrollment.course?.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                진행률: {enrollment.progress || 0}%
                              </p>
                            </div>
                            {getStatusBadge(enrollment.status)}
                          </div>
                        ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>학습 진행률</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(enrollments || [])
                      .filter((e) => e.status === "enrolled")
                      .slice(0, 3)
                      .map((enrollment) => (
                        <div key={enrollment.id}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              {enrollment.course?.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                          <Progress
                            value={enrollment.progress || 0}
                            className="h-2"
                          />
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses Tab (교재 관리) */}
          <TabsContent value="courses" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>교재 관리</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : enrollments?.filter(e => e.course?.type !== "seminar").length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      구매한 교재가 없습니다
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      새로운 교재를 둘러보고 학습을 시작해보세요.
                    </p>
                    <Button asChild>
                      <Link href="/courses">교재 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments
                      ?.filter(e => e.course?.type !== "seminar")
                      .map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {enrollment.course?.title || "삭제된 교재"}
                          </h3>

                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge variant={getStatusBadge(enrollment.status)}>
                              {enrollment.status === "enrolled"
                                ? "학습중"
                                : enrollment.status === "completed"
                                  ? "완료"
                                  : enrollment.status === "cancelled"
                                    ? "취소됨"
                                    : "대기중"}
                            </Badge>
                            {enrollment.course?.category && (
                              <Badge variant="outline">{enrollment.course.category}</Badge>
                            )}
                          </div>

                          <div className="text-sm text-gray-500 mb-2">
                            구매일:{" "}
                            {enrollment.enrolledAt
                              ? new Date(
                                  enrollment.enrolledAt,
                                ).toLocaleDateString("ko-KR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "날짜 없음"}
                          </div>
                          
                          <div className="flex items-center gap-2 max-w-md">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              진행률: {enrollment.progress || 0}%
                            </span>
                            <Progress
                              value={enrollment.progress || 0}
                              className="h-2 flex-1"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                          {enrollment.status === "enrolled" && enrollment.course && (
                            <Button size="sm" asChild className="flex-1 md:flex-none">
                              <a
                                href={`/courses/${enrollment.course.id}`}
                                className="no-underline"
                              >
                                학습하기
                              </a>
                            </Button>
                          )}
                          {enrollment.status === "completed" && (
                            <Button size="sm" variant="outline" asChild className="flex-1 md:flex-none">
                              <a
                                href={`/api/user/enrollments/${enrollment.id}/certificate`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                수료증
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteEnrollment(enrollment.id)}
                            className="flex-1 md:flex-none"
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seminars Tab (본문 분석) - 리스트 형태로 변경 */}
          <TabsContent value="seminars" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>본문 분석</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-6 animate-pulse"
                      >
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : enrollments?.filter(e => e.course?.type === "seminar").length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">신청한 분석 자료가 없습니다.</p>
                    <Button className="mt-4" asChild>
                        <Link href="/seminars">분석 자료 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollments
                      ?.filter(e => e.course?.type === "seminar")
                      .map((enrollment) => (
                      <div
                        key={enrollment.id}
                        className="border rounded-lg p-4 bg-white hover:border-primary transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">
                              {enrollment.course?.title || "삭제된 분석 자료"}
                            </h3>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            {/* Course 타입에는 date, location, speaker가 없으므로 description이나 duration 등 활용 */}
                            <div className="flex items-center">
                               <Clock className="h-3.5 w-3.5 mr-2 text-gray-400" />
                               <span>기간: {enrollment.course?.duration || "정보 없음"}</span>
                            </div>
                            <div className="flex items-center">
                               <Calendar className="h-3.5 w-3.5 mr-2 text-gray-400" />
                               <span>신청일: {new Date(enrollment.enrolledAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                            {/* 세미나/분석자료 링크가 있다면 여기에 추가 */}
                            <Button size="sm" asChild className="flex-1 md:flex-none">
                                <Link href={`/seminars/${enrollment.course.id}`}>
                                    상세보기
                                </Link>
                            </Button>
                            <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDeleteEnrollment(enrollment.id)}
                                className="flex-1 md:flex-none"
                            >
                                삭제
                            </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Certificates Tab */}
          <TabsContent value="certificates" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>수료증</CardTitle>
              </CardHeader>
              <CardContent>
                {enrollmentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card
                        key={i}
                        className="border-2 border-dashed border-gray-200"
                      >
                        <CardContent className="p-6 text-center animate-pulse">
                          <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto mb-4" />
                          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
                          <div className="h-8 bg-gray-200 rounded w-32 mx-auto" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : enrollments?.filter((e) => e.status === "completed")
                    .length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      아직 수료한 과정이 없습니다.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/courses">과정 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {enrollments
                      ?.filter((e) => e.status === "completed")
                      .map((enrollment) => (
                        <Card
                          key={enrollment.id}
                          className="border-2 border-dashed border-gray-200 hover:border-primary transition-colors"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <Award className="h-12 w-12 text-primary" />
                              <Badge variant="outline">
                                {enrollment.course?.credit}학점
                              </Badge>
                            </div>
                            <h3 className="font-semibold mb-2 line-clamp-2">
                              {enrollment.course?.title}
                            </h3>
                            <div className="space-y-2 mb-4 text-sm text-gray-600">
                              <p>
                                수료일:{" "}
                                {new Date(
                                  enrollment.enrolledAt,
                                ).toLocaleDateString("ko-KR")}
                              </p>
                              <p>진도율: {enrollment.progress}%</p>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                asChild
                              >
                                <a
                                  href={`/api/user/enrollments/${enrollment.id}/certificate`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  수료증 보기
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>결제 내역</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-4 animate-pulse"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                          <div className="space-y-2 text-right">
                            <div className="h-4 bg-gray-200 rounded w-24" />
                            <div className="h-3 bg-gray-200 rounded w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : payments?.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">결제 내역이 없습니다.</p>
                    <Button className="mt-4" asChild>
                      <Link href="/courses">과정 둘러보기</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {payments?.map((payment) => (
                      <Card
                        key={payment.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg">
                                {payment.course?.title || "과정명 없음"}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {payment.course?.category && (
                                  <Badge variant="outline" className="mr-2">
                                    {payment.course.category}
                                  </Badge>
                                )}
                                결제일:{" "}
                                {new Date(payment.createdAt).toLocaleDateString(
                                  "ko-KR",
                                )}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-lg">
                                {Number(payment.amount).toLocaleString()}원
                              </div>
                              <div>{getPaymentStatusBadge(payment.status)}</div>
                            </div>
                          </div>

                          <Separator className="my-4" />

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p className="font-medium mb-1">결제 정보</p>
                              <div className="space-y-1">
                                <p>
                                  결제 방식:{" "}
                                  {payment.paymentMethod || "카드 결제"}
                                </p>
                                <p>거래번호: {payment.transactionId || "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium mb-1">구매자 정보</p>
                              <div className="space-y-1">
                                <p>이름: {payment.user?.name || "-"}</p>
                                <p>이메일: {payment.user?.email || "-"}</p>
                              </div>
                            </div>
                          </div>

                          {payment.status === "completed" && (
                            <div className="mt-4 flex justify-end">
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                영수증 다운로드
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Profile Edit Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>프로필 수정</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">이름</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.email}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="phone">휴대폰 번호</Label>
              <Input
                id="phone"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProfileDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => updateProfileMutation.mutate(profileForm)}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "업데이트 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
