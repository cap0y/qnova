import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2, BookCheck, Search, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function WorkbookManagementAdmin() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedWorkbook, setSelectedWorkbook] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 전체 문제집 리스트 조회 (슈퍼 관리자용)
  const { data: workbooks, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/overseas"],
  });

  const handlePreview = (workbook: any) => {
    setSelectedWorkbook(workbook);
    setIsPreviewOpen(true);
  };

  // 문제집 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/business/overseas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/admin/overseas"],
      });
      toast({
        title: "삭제 완료",
        description: "문제집이 성공적으로 삭제되었습니다.",
      });
      setIsDeleting(null);
    },
    onError: (error: Error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
      setIsDeleting(null);
    },
  });

  const handleDelete = (id: number) => {
    setIsDeleting(id);
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredWorkbooks = workbooks?.filter((workbook) =>
    workbook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workbook.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (workbook.category && workbook.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">전체 문제집 관리</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="문제집 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookCheck className="h-5 w-5 text-blue-600" />
            등록된 모든 문제집 ({filteredWorkbooks.length})
          </CardTitle>
          <CardDescription>플랫폼에 등록된 모든 문제집을 조회하고 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkbooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    등록된 문제집이 없거나 검색 결과가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkbooks.map((workbook) => (
                  <TableRow key={workbook.id}>
                    <TableCell className="font-medium">{workbook.title}</TableCell>
                    <TableCell>{workbook.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{workbook.category || "미지정"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={workbook.isActive ? "bg-green-500" : "bg-gray-400"}>
                        {workbook.isActive ? "운영중" : "비활성"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(workbook.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handlePreview(workbook)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          샘플보기
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>문제집 삭제</AlertDialogTitle>
                              <AlertDialogDescription>
                                정말로 이 문제집을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.
                                (ID: {workbook.id})
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>취소</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(workbook.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deleteMutation.isPending && isDeleting === workbook.id}
                              >
                                {deleteMutation.isPending && isDeleting === workbook.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : null}
                                삭제
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedWorkbook?.title} - 샘플보기</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {selectedWorkbook?.imageUrl && (
              <div className="rounded-lg overflow-hidden border">
                <img
                  src={selectedWorkbook.imageUrl}
                  alt={selectedWorkbook.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <BookCheck className="h-5 w-5 text-blue-600" />
                문제집 상세 정보
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                <div>
                  <p className="text-gray-500">과목/유형</p>
                  <p className="font-medium">{selectedWorkbook?.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">카테고리</p>
                  <Badge variant="outline">{selectedWorkbook?.category || "미지정"}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">교육비</p>
                  <p className="font-medium text-blue-600">
                    {selectedWorkbook?.price?.toLocaleString()}원
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">교육지/대상</p>
                  <p className="font-medium">{selectedWorkbook?.destination}</p>
                </div>
                <div>
                  <p className="text-gray-500">제공자 ID</p>
                  <p className="font-medium">{selectedWorkbook?.providerId}</p>
                </div>
              </div>

              {selectedWorkbook?.program && (
                <div className="mt-6 border-t pt-6">
                  <h4 className="font-bold mb-3">교육 프로그램 안내</h4>
                  <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                    {selectedWorkbook.program}
                  </div>
                </div>
              )}
            </div>

            {selectedWorkbook?.programSchedule && (
              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-bold mb-4">교육 일정 요약</h4>
                <div className="space-y-4">
                  {typeof selectedWorkbook.programSchedule === 'string' ? (
                    <p className="text-sm text-gray-600">{selectedWorkbook.programSchedule}</p>
                  ) : Array.isArray(selectedWorkbook.programSchedule) ? (
                    selectedWorkbook.programSchedule.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 border-b pb-3 last:border-0">
                        <div className="min-w-[80px] font-bold text-blue-600">{item.day || `D-${idx+1}`}</div>
                        <div className="text-sm">{item.activity || item.title || item.content}</div>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

