import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Trash2, Loader2, BookCheck, Plus, Eye, Save, Edit, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";

export default function WorkbookManagement({ user }: { user: any }) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedWorkbook, setSelectedWorkbook] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkbook, setEditingWorkbook] = useState<any>(null);
  const [showSampleImages, setShowSampleImages] = useState(false);
  const [sampleImages, setSampleImages] = useState<any[]>([]);

  // 문제집 폼 상태
  const [workbookForm, setWorkbookForm] = useState({
    title: "",
    type: "어학",
    category: "english",
    destination: "",
    price: 0,
    description: "",
    imageUrl: "",
    program: "",
    analysisMaterials: [] as any[],
  });

  const loadSampleImages = () => {
    const bookSamples = Array.from({ length: 14 }, (_, i) => ({
      url: `/images/BOOKS/${i + 1}.png`,
      name: `도서 샘플 ${i + 1}`,
    }));
    setSampleImages(bookSamples);
    setShowSampleImages(true);
  };

  // 문제집 리스트 조회
  const { data, isLoading } = useQuery<{ overseas: any[]; total: number }>({
    queryKey: [`/api/business/overseas/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 본문 분석 자료 목록 조회
  const { data: sourceMaterialsData } = useQuery<{ materials: any[] }>({
    queryKey: ["/api/business/source-materials", "workbook"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/business/source-materials?target=workbook");
      return (await res.json()) as { materials: any[] };
    },
    enabled: !!user?.id,
  });

  const handlePreview = (workbook: any) => {
    setSelectedWorkbook(workbook);
    setIsPreviewOpen(true);
  };

  const handleEdit = (workbook: any) => {
    setEditingWorkbook(workbook);
    setWorkbookForm({
      title: workbook.title,
      type: workbook.type || "어학",
      category: workbook.category || "english",
      destination: workbook.destination || "",
      price: workbook.price || 0,
      description: workbook.description || "",
      imageUrl: workbook.imageUrl || "",
      program: workbook.program || "",
      analysisMaterials: workbook.analysisMaterials || [],
    });
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingWorkbook(null);
    setWorkbookForm({
      title: "",
      type: "어학",
      category: "english",
      destination: "",
      price: 0,
      description: "",
      imageUrl: "",
      program: "",
      analysisMaterials: [],
    });
    setIsFormOpen(true);
  };

  // 문제집 등록/수정 뮤테이션
  const formMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingWorkbook) {
        return await apiRequest("PUT", `/api/business/overseas/${editingWorkbook.id}`, data);
      } else {
        return await apiRequest("POST", "/api/business/overseas", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/overseas/${user?.id}`],
      });
      toast({
        title: editingWorkbook ? "수정 완료" : "등록 완료",
        description: editingWorkbook 
          ? "문제집 정보가 성공적으로 수정되었습니다."
          : "새 문제집이 성공적으로 등록되었습니다.",
      });
      setIsFormOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: editingWorkbook ? "수정 실패" : "등록 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!workbookForm.title || !workbookForm.destination) {
      toast({
        title: "입력 오류",
        description: "제목과 교육지/대상은 필수 입력 항목입니다.",
        variant: "destructive",
      });
      return;
    }
    formMutation.mutate(workbookForm);
  };

  // 문제집 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/business/overseas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/overseas/${user?.id}`],
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

  const workbooks = data?.overseas || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-blue-600" />
              등록된 문제집 관리
            </CardTitle>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            새 문제집 등록
          </Button>
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
              {workbooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    등록된 문제집이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                workbooks.map((workbook) => (
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => handleEdit(workbook)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          수정
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

      {/* 문제집 등록/수정 다이얼로그 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingWorkbook ? <Edit className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-blue-600" />}
              {editingWorkbook ? "문제집 정보 수정" : "새 문제집 등록"}
            </DialogTitle>
            <DialogDescription>
              {editingWorkbook ? "기존 문제집 정보를 수정합니다." : "새로운 문제집 정보를 입력하여 등록하세요."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 본문 분석 자료 불러오기 섹션 */}
            <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <Label className="text-blue-700 font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                본문 분석 자료 불러오기
              </Label>
              <Select
                onValueChange={(value) => {
                  const material = sourceMaterialsData?.materials?.find((m: any) => m.id.toString() === value);
                  if (material) {
                    setWorkbookForm((prev) => ({
                      ...prev,
                      title: material.fileName.replace(/\.[^/.]+$/, ""), // 확장자 제거
                      description: material.source === "seminar" 
                        ? `AI 분석 자료: ${material.fileName}`
                        : `${material.fileName} 분석 자료 기반 문제집`,
                      program: material.parsedText || "", // AI 분석 결과(JSON) 또는 텍스트 저장
                      imageUrl: material.fileUrl || prev.imageUrl, // 분석 자료의 이미지(표지) 자동 입력
                      analysisMaterials: material.source === "seminar"
                        ? [{
                            id: material.id.toString(),
                            name: material.fileName,
                            size: 0,
                            type: "analysis",
                            url: "", 
                            filename: material.fileName
                          }]
                        : [{
                            id: material.id.toString(),
                            name: material.fileName,
                            size: 0,
                            type: material.fileType,
                            url: material.fileUrl,
                            filename: material.fileName
                          }]
                    }));
                    toast({
                      title: "자료 불러오기 완료",
                      description: "분석 자료 정보가 자동으로 입력되었습니다.",
                    });
                  }
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={sourceMaterialsData?.materials?.length ? "등록된 분석 자료 선택..." : "등록된 분석 자료가 없습니다"} />
                </SelectTrigger>
                <SelectContent>
                  {!sourceMaterialsData?.materials || sourceMaterialsData.materials.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      등록된 분석 자료가 없습니다.
                    </div>
                  ) : (
                    sourceMaterialsData.materials.map((m: any) => (
                      <SelectItem key={m.id} value={m.id.toString()}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                          <span className="truncate max-w-[200px]">{m.fileName}</span>
                          {m.source === "seminar" && <Badge variant="outline" className="text-[10px] h-4">분석자료</Badge>}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-600/70">
                선택하면 분석된 제목, 설명, 분석 내용이 자동으로 입력됩니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">문제집 제목</Label>
              <Input
                id="title"
                placeholder="예: 2024 수능 대비 핵심 기출 문제집"
                value={workbookForm.title}
                onChange={(e) => setWorkbookForm({ ...workbookForm, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">과목 카테고리</Label>
                <Select
                  value={workbookForm.category}
                  onValueChange={(val) => setWorkbookForm({ ...workbookForm, category: val })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">영어</SelectItem>
                    <SelectItem value="korean">국어</SelectItem>
                    <SelectItem value="math">수학</SelectItem>
                    <SelectItem value="science">과학</SelectItem>
                    <SelectItem value="social">사회</SelectItem>
                    <SelectItem value="mock">모의고사</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">유형</Label>
                <Select
                  value={workbookForm.type}
                  onValueChange={(val) => setWorkbookForm({ ...workbookForm, type: val })}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>중등교과서</SelectLabel>
                      <SelectItem value="중등-1학년">1학년</SelectItem>
                      <SelectItem value="중등-2학년">2학년</SelectItem>
                      <SelectItem value="중등-3학년">3학년</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>고등교과서</SelectLabel>
                      <SelectItem value="고등-1학년">1학년</SelectItem>
                      <SelectItem value="고등-2학년">2학년</SelectItem>
                      <SelectItem value="고등-3학년">3학년</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>EBS</SelectLabel>
                      <SelectItem value="수능특강">수능특강</SelectItem>
                      <SelectItem value="수능완성">수능완성</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>모의고사/수능</SelectLabel>
                      <SelectItem value="2025년 모의고사">2025년 모의고사</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>참고서</SelectLabel>
                      <SelectItem value="문법">문법</SelectItem>
                      <SelectItem value="독해">독해</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">교육지/대상</Label>
                <Input
                  id="destination"
                  placeholder="예: 고3, 수험생"
                  value={workbookForm.destination}
                  onChange={(e) => setWorkbookForm({ ...workbookForm, destination: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">판매 가격 (원)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0 (무료인 경우 0 입력)"
                  value={workbookForm.price}
                  onChange={(e) => setWorkbookForm({ ...workbookForm, price: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">간략 설명</Label>
              <Input
                id="description"
                placeholder="검색 결과 등에 표시될 짧은 설명"
                value={workbookForm.description}
                onChange={(e) => setWorkbookForm({ ...workbookForm, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">상세 설명 / 본문 분석 내용</Label>
              <Textarea
                id="program"
                placeholder="문제집의 상세한 특징이나 분석된 본문 내용을 입력하세요."
                className="min-h-[150px]"
                value={workbookForm.program}
                onChange={(e) => setWorkbookForm({ ...workbookForm, program: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>표지 이미지</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="이미지 URL"
                  value={workbookForm.imageUrl}
                  onChange={(e) => setWorkbookForm({ ...workbookForm, imageUrl: e.target.value })}
                  className="flex-1"
                />
                <Button variant="outline" size="sm" onClick={loadSampleImages}>샘플 이미지 선택</Button>
              </div>
              {workbookForm.imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden border w-32 aspect-[3/4] shadow-sm bg-gray-50">
                  <img src={workbookForm.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>취소</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 gap-2" 
              onClick={handleSubmit}
              disabled={formMutation.isPending}
            >
              {formMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingWorkbook ? "수정완료" : "등록하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSampleImages} onOpenChange={setShowSampleImages}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>샘플 이미지 선택</DialogTitle>
            <DialogDescription>
              아래 샘플 이미지 중에서 문제집 표지로 사용할 이미지를 선택하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto p-2">
            {sampleImages.map((img, i) => (
              <div 
                key={i} 
                className="group cursor-pointer border rounded-lg hover:border-blue-500 overflow-hidden bg-white shadow-sm transition-all hover:shadow-md aspect-[3/4] relative" 
                onClick={() => {
                  setWorkbookForm({ ...workbookForm, imageUrl: img.url });
                  setShowSampleImages(false);
                }}
              >
                <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={img.name} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t p-2">
                  <p className="text-center text-[10px] font-medium text-gray-600 truncate">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

