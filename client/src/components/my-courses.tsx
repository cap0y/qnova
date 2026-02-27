import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Presentation, Plane } from "lucide-react";
import { Course, Enrollment } from "@/types/course";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface MyCoursesProps {
  enrollments: Enrollment[];
  seminarRegistrations: {
    id: string;
    status: "enrolled" | "completed" | "cancelled" | "pending";
    createdAt: string;
    seminarId: string;
    title: string;
    type: string;
    category: string;
    location?: string;
    startDate?: string;
    endDate?: string;
  }[];
  isLoading: boolean;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "enrolled":
      return <Badge className="bg-blue-500">수강중</Badge>;
    case "completed":
      return <Badge className="bg-green-500">수료</Badge>;
    case "cancelled":
      return <Badge variant="secondary">취소</Badge>;
    default:
      return <Badge variant="outline">대기</Badge>;
  }
};

const getCourseTypeIcon = (type: string) => {
  switch (type) {
    case "course":
      return <BookOpen className="w-6 h-6 text-blue-600" />;
    case "seminar":
      return <Presentation className="w-6 h-6 text-purple-600" />;
    case "overseas":
      return <Plane className="w-6 h-6 text-orange-600" />;
    default:
      return <BookOpen className="w-6 h-6 text-gray-600" />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "course":
      return "교육과정";
    case "seminar":
      return "세미나";
    case "overseas":
      return "해외교육";
    default:
      return "기타";
  }
};

export default function MyCourses({
  enrollments,
  seminarRegistrations,
  isLoading,
}: MyCoursesProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!enrollments?.length) {
    return (
      <div className="text-center py-8">
        <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">수강 중인 과정이 없습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/courses">과정 둘러보기</Link>
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">전체</TabsTrigger>
        <TabsTrigger value="course">교육과정</TabsTrigger>
        <TabsTrigger value="seminar">세미나</TabsTrigger>
        <TabsTrigger value="overseas">해외교육</TabsTrigger>
      </TabsList>

      {["all", "course", "seminar", "overseas"].map((type) => (
        <TabsContent key={type} value={type}>
          <div className="space-y-4">
            {(type === "all" || type === "course") &&
              enrollments
                .filter((e) => e.course.type === "course")
                .map((enrollment) => (
                  <div key={enrollment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3">
                        {getCourseTypeIcon(enrollment.course.type)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getTypeLabel(enrollment.course.type)}
                            {enrollment.course.category &&
                              ` • ${enrollment.course.category}`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          enrollment.status === "enrolled" && "bg-blue-500",
                          enrollment.status === "completed" && "bg-green-500",
                          enrollment.status === "cancelled" && "bg-gray-500",
                        )}
                      >
                        {enrollment.status === "enrolled" && "수강중"}
                        {enrollment.status === "completed" && "수료"}
                        {enrollment.status === "cancelled" && "취소됨"}
                      </Badge>
                    </div>

                    {enrollment.course.type === "course" && (
                      <>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-600">
                            학습 진행률
                          </span>
                          <span className="text-sm font-medium">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                        <Progress
                          value={enrollment.progress || 0}
                          className="mb-3"
                        />
                      </>
                    )}

                    {(enrollment.course.type === "seminar" ||
                      enrollment.course.type === "overseas") && (
                      <div className="mb-3 text-sm text-gray-600">
                        {enrollment.course.location && (
                          <div className="mb-1">
                            장소: {enrollment.course.location}
                          </div>
                        )}
                        {enrollment.course.startDate &&
                          enrollment.course.endDate && (
                            <div>
                              일정:{" "}
                              {new Date(
                                enrollment.course.startDate,
                              ).toLocaleDateString()}{" "}
                              ~
                              {new Date(
                                enrollment.course.endDate,
                              ).toLocaleDateString()}
                            </div>
                          )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        신청일:{" "}
                        {new Date(enrollment.createdAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </div>
                      <div className="space-x-2">
                        {enrollment.status === "enrolled" && (
                          <Button size="sm" asChild>
                            <Link href={`/courses/${enrollment.course.id}`}>
                              {enrollment.course.type === "course"
                                ? "학습하기"
                                : "상세보기"}
                            </Link>
                          </Button>
                        )}
                        {enrollment.status === "completed" && (
                          <Button size="sm" variant="outline">
                            수료증 보기
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

            {(type === "all" || type === "seminar") &&
              seminarRegistrations.map((seminar) => (
                <div key={seminar.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start space-x-3">
                      <Presentation className="w-6 h-6 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {seminar.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          세미나
                          {seminar.category && ` • ${seminar.category}`}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        seminar.status === "enrolled" && "bg-blue-500",
                        seminar.status === "completed" && "bg-green-500",
                        seminar.status === "cancelled" && "bg-gray-500",
                      )}
                    >
                      {seminar.status === "enrolled" && "신청완료"}
                      {seminar.status === "completed" && "참석완료"}
                      {seminar.status === "cancelled" && "취소됨"}
                    </Badge>
                  </div>

                  <div className="mb-3 text-sm text-gray-600">
                    {seminar.location && (
                      <div className="mb-1">장소: {seminar.location}</div>
                    )}
                    {seminar.startDate && seminar.endDate && (
                      <div>
                        일정: {new Date(seminar.startDate).toLocaleDateString()}{" "}
                        ~{new Date(seminar.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      신청일:{" "}
                      {new Date(seminar.createdAt).toLocaleDateString("ko-KR")}
                    </div>
                    <div className="space-x-2">
                      {seminar.status === "enrolled" && (
                        <Button size="sm" asChild>
                          <Link href={`/seminars/${seminar.seminarId}`}>
                            상세보기
                          </Link>
                        </Button>
                      )}
                      {seminar.status === "completed" && (
                        <Button size="sm" variant="outline">
                          수료증 보기
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {(type === "all" || type === "overseas") &&
              enrollments
                .filter((e) => e.course.type === "overseas")
                .map((enrollment) => (
                  <div key={enrollment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start space-x-3">
                        {getCourseTypeIcon(enrollment.course.type)}
                        <div>
                          <h3 className="font-semibold text-lg">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getTypeLabel(enrollment.course.type)}
                            {enrollment.course.category &&
                              ` • ${enrollment.course.category}`}
                          </p>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          enrollment.status === "enrolled" && "bg-blue-500",
                          enrollment.status === "completed" && "bg-green-500",
                          enrollment.status === "cancelled" && "bg-gray-500",
                        )}
                      >
                        {enrollment.status === "enrolled" && "수강중"}
                        {enrollment.status === "completed" && "수료"}
                        {enrollment.status === "cancelled" && "취소됨"}
                      </Badge>
                    </div>

                    {(enrollment.course.type === "seminar" ||
                      enrollment.course.type === "overseas") && (
                      <div className="mb-3 text-sm text-gray-600">
                        {enrollment.course.location && (
                          <div className="mb-1">
                            장소: {enrollment.course.location}
                          </div>
                        )}
                        {enrollment.course.startDate &&
                          enrollment.course.endDate && (
                            <div>
                              일정:{" "}
                              {new Date(
                                enrollment.course.startDate,
                              ).toLocaleDateString()}{" "}
                              ~
                              {new Date(
                                enrollment.course.endDate,
                              ).toLocaleDateString()}
                            </div>
                          )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        신청일:{" "}
                        {new Date(enrollment.createdAt).toLocaleDateString(
                          "ko-KR",
                        )}
                      </div>
                      <div className="space-x-2">
                        {enrollment.status === "enrolled" && (
                          <Button size="sm" asChild>
                            <Link href={`/courses/${enrollment.course.id}`}>
                              {enrollment.course.type === "course"
                                ? "학습하기"
                                : "상세보기"}
                            </Link>
                          </Button>
                        )}
                        {enrollment.status === "completed" && (
                          <Button size="sm" variant="outline">
                            수료증 보기
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
