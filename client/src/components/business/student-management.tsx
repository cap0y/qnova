import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, Award, FileText } from "lucide-react";
import { apiRequest } from "@/lib/api";

interface StudentManagementProps {
  user: any;
}

export default function StudentManagement({ user }: StudentManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // 수강생 목록 조회
  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/business/enrollments", user?.id],
    queryFn: async () => {
      const response = await apiRequest(
        "GET",
        `/api/business/enrollments/${user?.id}`,
      );
      return response;
    },
    enabled: !!user?.id,
  });

  // 수료증 발급 mutation
  const issueCertificateMutation = useMutation({
    mutationFn: async (enrollmentId: number) => {
      const response = await apiRequest(
        "POST",
        `/api/business/issue-certificate/${enrollmentId}`,
      );
      return response;
    },
    onSuccess: (data, enrollmentId) => {
      toast({
        title: "수료증 발급 완료",
        description: "수료증이 성공적으로 발급되었습니다.",
      });
      // 수강생 목록 새로고침
      queryClient.invalidateQueries({
        queryKey: ["/api/business/enrollments", user?.id],
      });
    },
    onError: (error: any) => {
      toast({
        title: "수료증 발급 실패",
        description: error.message || "수료증 발급 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // 수료증 발급 처리
  const handleIssueCertificate = async (enrollmentId: number) => {
    try {
      await issueCertificateMutation.mutateAsync(enrollmentId);
    } catch (error) {
      console.error("Error issuing certificate:", error);
    }
  };

  // 수료증 확인 다이얼로그 열기
  const handleShowCertificate = async (enrollment: any) => {
    try {
      // 새 창에서 수료증 열기
      window.open(
        `/api/business/enrollments/${enrollment.id}/certificate`,
        "_blank",
      );
    } catch (error) {
      console.error("Error fetching certificate:", error);
      toast({
        title: "수료증 조회 실패",
        description: "수료증 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 진도율에 따른 배지 색상
  const getProgressBadge = (progress: number) => {
    if (progress >= 80)
      return <Badge className="bg-green-600">수료 가능</Badge>;
    if (progress >= 50) return <Badge className="bg-yellow-600">진행중</Badge>;
    return <Badge variant="outline">시작</Badge>;
  };

  // 수강 상태에 따른 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-blue-600">수료 완료</Badge>;
      case "in_progress":
        return <Badge className="bg-green-600">학습중</Badge>;
      case "not_started":
        return <Badge variant="outline">미시작</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="수강생 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          내보내기
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>수강생 목록</CardTitle>
          <CardDescription>
            강의별 수강생 현황과 진도율을 확인할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>수강생</TableHead>
                <TableHead>강의명</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead>진도율</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>최근 접속</TableHead>
                <TableHead>관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollmentsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    </TableCell>
                  </TableRow>
                ))
              ) : enrollments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">등록된 수강생이 없습니다.</p>
                  </TableCell>
                </TableRow>
              ) : (
                enrollments?.map((enrollment: any) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{enrollment.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {enrollment.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{enrollment.course.title}</TableCell>
                    <TableCell>
                      {new Date(enrollment.enrolledAt).toLocaleDateString(
                        "ko-KR",
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{enrollment.progress}%</span>
                        {getProgressBadge(enrollment.progress)}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                    <TableCell>
                      {enrollment.lastAccessAt
                        ? new Date(enrollment.lastAccessAt).toLocaleDateString(
                            "ko-KR",
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {enrollment.status === "completed" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShowCertificate(enrollment)}
                          className="w-24"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          수료증 확인
                        </Button>
                      ) : (
                        enrollment.progress >= 80 &&
                        enrollment.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleIssueCertificate(enrollment.id)
                            }
                            disabled={issueCertificateMutation.isPending}
                            className="w-24"
                          >
                            <Award className="mr-2 h-4 w-4" />
                            {issueCertificateMutation.isPending
                              ? "처리 중..."
                              : "수료증 발급"}
                          </Button>
                        )
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
