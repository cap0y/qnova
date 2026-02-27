import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Upload,
  X,
  ImageIcon,
  Download,
  User,
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CourseManagementProps {
  user: any;
}

export default function CourseManagement({ user }: CourseManagementProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [previewCourse, setPreviewCourse] = useState<any>(null);

  // 저자 정보 관리 상태
  const [showInstructorDialog, setShowInstructorDialog] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<any>(null);
  const [instructorForm, setInstructorForm] = useState({
    name: "",
    position: "",
    expertise: "",
    profile: "",
    imageUrl: "",
  });

  // 강의 편집 폼 상태
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    discountPrice: "",
    duration: "",
    instructorId: "",
    curriculum: "",
    objectives: "",
    requirements: "",
    materials: "",
    assessmentMethod: "",
    certificateType: "",
    instructorName: "",
    instructorProfile: "",
    instructorExpertise: "",
    targetAudience: "",
    tags: "",
    features: "",
    recommendations: "",
    totalHours: "",
    enrollmentDeadline: "",
    completionDeadline: "",
    prerequisites: "",
    learningMethod: "",
    learningMaterials: [] as {
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
      filename?: string;
    }[],
    analysisMaterials: [] as {
      id: string;
      name: string;
      size: number;
      type: string;
      url: string;
      filename?: string;
    }[],
    imageUrl: "",
  });

  const [sampleImages, setSampleImages] = useState<any[]>([]);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [imageSelectorType, setImageSelectorType] = useState<"course" | "instructor">("course");

  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      category: "",
      price: "",
      discountPrice: "",
      duration: "",
      instructorId: "",
      curriculum: "",
      objectives: "",
      requirements: "",
      materials: "",
      assessmentMethod: "",
      certificateType: "",
      instructorName: "",
      instructorProfile: "",
      instructorExpertise: "",
      targetAudience: "",
      tags: "",
      features: "",
      recommendations: "",
      totalHours: "",
      enrollmentDeadline: "",
      completionDeadline: "",
      prerequisites: "",
    learningMethod: "",
    learningMaterials: [],
    analysisMaterials: [],
    imageUrl: "",
  });
  setEditingCourse(null);
};

  // 내 강의 목록 조회
  const { data: myCourses, isLoading: coursesLoading } = useQuery<{
    courses: any[];
    total: number;
  }>({
    queryKey: [`/api/business/courses/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 저자(강사) 목록 조회
  const { data: myInstructors } = useQuery<{ instructors: any[] }>({
    queryKey: [`/api/business/instructors/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 내 분석 자료 목록 조회
  const { data: sourceMaterialsData } = useQuery<{ materials: any[] }>({
    queryKey: [`/api/business/source-materials`, "course", user?.id],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/business/source-materials?target=course");
      return (await res.json()) as { materials: any[] };
    },
    enabled: !!user?.id,
  });

  // 저자 등록/수정 mutation
  const instructorMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editingInstructor) {
        return apiRequest("PUT", `/api/business/instructors/${editingInstructor.id}`, data);
      } else {
        return apiRequest("POST", "/api/business/instructors", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/business/instructors/${user?.id}`] });
      toast({ title: editingInstructor ? "저자 정보 수정 완료" : "저자 정보 등록 완료" });
      setShowInstructorDialog(false);
      resetInstructorForm();
    },
  });

  const resetInstructorForm = () => {
    setInstructorForm({
      name: "",
      position: "",
      expertise: "",
      profile: "",
      imageUrl: "",
    });
    setEditingInstructor(null);
  };

  // 강의 생성/수정 mutation
  const courseMutation = useMutation({
    mutationFn: async (data: any) => {
      const courseData = {
        ...data,
        providerId: user?.id,
        price: parseInt(data.price) || 0,
        discountPrice: data.discountPrice ? parseInt(data.discountPrice) : null,
        credit: parseInt(data.credit) || 1,
        maxStudents: data.maxStudents ? parseInt(data.maxStudents) : null,
        learningMaterials: data.learningMaterials || [],
      };

      if (editingCourse) {
        return apiRequest(
          "PUT",
          `/api/business/courses/${editingCourse.id}`,
          courseData,
        );
      } else {
        return apiRequest("POST", "/api/business/courses", courseData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/courses/${user?.id}`, user?.id],
      });
      toast({
        title: editingCourse ? "교재 수정 완료" : "교재 등록 완료",
        description: editingCourse
          ? "교재 정보가 수정되었습니다."
          : "새로운 교재가 등록되었습니다.",
      });
      setShowCourseDialog(false);
      resetCourseForm();
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 강의 삭제 mutation
  const deleteMutation = useMutation({
    mutationFn: async (courseId) => {
      return apiRequest("DELETE", `/api/business/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/business/courses/${user?.id}`, user?.id],
      });
      toast({
        title: "강의 삭제 완료",
        description: "강의가 삭제되었습니다.",
      });
      setShowDeleteDialog(false);
      setDeleteTarget(null);
    },
    onError: (error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      price: course.price?.toString() || "",
      discountPrice: course.discountPrice?.toString() || "",
      duration: course.duration || "",
      instructorId: course.instructorId?.toString() || "",
      curriculum: course.curriculum || "",
      objectives: course.objectives || "",
      requirements: course.requirements || "",
      materials: course.materials || "",
      assessmentMethod: course.assessmentMethod || "",
      certificateType: course.certificateType || "",
      instructorName: course.instructorName || "",
      instructorProfile: course.instructorProfile || "",
      instructorExpertise: course.instructorExpertise || "",
      targetAudience: course.targetAudience || "",
      tags: Array.isArray(course.tags)
        ? course.tags.join(", ")
        : course.tags || "",
      features: course.features || "",
      recommendations: course.recommendations || "",
      totalHours: course.totalHours?.toString() || "",
      enrollmentDeadline: course.enrollmentDeadline
        ? new Date(course.enrollmentDeadline).toISOString().split("T")[0]
        : "",
      completionDeadline: course.completionDeadline
        ? new Date(course.completionDeadline).toISOString().split("T")[0]
        : "",
      prerequisites: course.prerequisites || "",
      learningMethod: course.learningMethod || "",
      learningMaterials: course.learningMaterials || [],
      analysisMaterials: course.analysisMaterials || [],
      imageUrl: course.imageUrl || "",
    });

    setShowCourseDialog(true);
  };

  const handleDelete = (course: any) => {
    setDeleteTarget(course);
    setShowDeleteDialog(true);
  };

  const handlePreviewCourse = (course: any) => {
    setPreviewCourse(course);
    setShowPreviewDialog(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id);
    }
  };

  const handleAnalysisMaterialUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/business/upload-course-material", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("파일 업로드에 실패했습니다.");
      }

      const result = await response.json();
      
      setCourseForm(prev => ({
        ...prev,
        analysisMaterials: [...prev.analysisMaterials, {
          id: Date.now().toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.url,
          filename: result.filename
        }]
      }));

      toast({
        title: "자료 업로드 완료",
        description: "본문 분석 자료가 추가되었습니다."
      });
    } catch (error) {
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "오류가 발생했습니다.",
        variant: "destructive"
      });
    }
    event.target.value = "";
  };

  const removeAnalysisMaterial = (id: string) => {
    setCourseForm(prev => ({
      ...prev,
      analysisMaterials: prev.analysisMaterials.filter(m => m.id !== id)
    }));
  };

  const getStatusBadge = (course: any) => {
    if (course.status === "active") {
      return (
        <Badge variant="default">
          <CheckCircle className="h-3 w-3 mr-1" />
          운영 중
        </Badge>
      );
    }
    return <Badge variant="secondary">비활성</Badge>;
  };

  // 이미지 업로드 함수
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "파일 크기 초과",
        description: "이미지는 5MB 이하만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/business/upload-course-image", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }

      const result = await response.json();

      setCourseForm((prev) => ({
        ...prev,
        imageUrl: result.image.url,
      }));

      toast({
        title: "이미지 업로드 완료",
        description: "강의 이미지가 업로드되었습니다.",
        variant: "default",
      });
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      toast({
        title: "업로드 실패",
        description:
          error instanceof Error
            ? error.message
            : "이미지 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }

    event.target.value = "";
  };

  // 샘플 이미지 로드 함수
  const loadSampleImages = async (type: "course" | "instructor") => {
    setImageSelectorType(type);
    if (type === "course") {
      const bookSamples = Array.from({ length: 14 }, (_, i) => ({
        id: `book-${i + 1}`,
        url: `/images/BOOKS/${i + 1}.png`,
        name: `도서 샘플 이미지 ${i + 1}`,
      }));
      setSampleImages(bookSamples);
    } else {
      const profileSamples = Array.from({ length: 10 }, (_, i) => ({
        id: `profile-${i + 1}`,
        url: `/images/profile/${i + 1}.png`,
        name: `프로필 샘플 이미지 ${i + 1}`,
      }));
      setSampleImages(profileSamples);
    }
    setShowImageSelector(true);
  };

  // 샘플 이미지 선택 함수
  const selectSampleImage = (imageUrl: string) => {
    if (imageSelectorType === "course") {
      setCourseForm((prev) => ({
        ...prev,
        imageUrl: imageUrl,
      }));
    } else {
      setInstructorForm((prev) => ({
        ...prev,
        imageUrl: imageUrl,
      }));
    }
    setShowImageSelector(false);

    toast({
      title: "이미지 선택 완료",
      description: "샘플 이미지가 선택되었습니다.",
      variant: "default",
    });
  };

  // 이미지 제거 함수
  const removeImage = () => {
    setCourseForm((prev) => ({
      ...prev,
      imageUrl: "",
    }));
  };

  // 컴포넌트 마운트 시 초기화 (필요시)
  useEffect(() => {
    // 초기 로드는 버튼 클릭 시 수행하도록 변경됨
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="courses">교재/자료 목록</TabsTrigger>
          <TabsTrigger value="instructors">저자 정보 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="교재 검색..."
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
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => {
              resetCourseForm();
              setShowCourseDialog(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Plus className="h-4 w-4 mr-2" />새 교재 등록
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>교재명</TableHead>
              <TableHead>분야</TableHead>
              <TableHead>형태</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>학습자</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coursesLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : myCourses?.courses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-3">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        등록된 교재가 없습니다
                      </h3>
                      <p className="text-gray-500 mt-1">
                        첫 번째 교재를 등록해보세요.
                      </p>
                    </div>
                    {/* 등록된 강의가 없을 때 버튼 항상 표시 */}
                    <Button
                      onClick={() => {
                        resetCourseForm();
                        setShowCourseDialog(true);
                      }}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      교재 등록하기
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              myCourses?.courses
                ?.filter((course) =>
                  course.title
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
                .map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {course.discountPrice ? (
                        <div className="flex flex-col">
                          <span className="line-through text-gray-500">
                            {course.price?.toLocaleString()}원
                          </span>
                          <span className="text-red-600 font-medium">
                            {course.discountPrice?.toLocaleString()}원
                          </span>
                        </div>
                      ) : (
                        <span>{course.price?.toLocaleString()}원</span>
                      )}
                    </TableCell>
                    <TableCell>{course.students || 0}명</TableCell>
                    <TableCell>{getStatusBadge(course)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handlePreviewCourse(course)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            보기
                          </DropdownMenuItem>
                          {course.status !== "deleted" && (
                            <DropdownMenuItem
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              수정
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(course)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Card>
    </TabsContent>

    <TabsContent value="instructors" className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">저자 정보 관리</h2>
        <Button
          onClick={() => {
            resetInstructorForm();
            setShowInstructorDialog(true);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" /> 새 저자 등록
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>프로필</TableHead>
              <TableHead>성함</TableHead>
              <TableHead>직함/소속</TableHead>
              <TableHead>전문 분야</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!myInstructors?.instructors || myInstructors.instructors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  등록된 저자 정보가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              myInstructors.instructors.map((instructor) => (
                <TableRow key={instructor.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                      {instructor.imageUrl ? (
                        <img 
                          src={instructor.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt={instructor.name}
                        />
                      ) : (
                        <User className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{instructor.name}</TableCell>
                  <TableCell>{instructor.position}</TableCell>
                  <TableCell>{instructor.expertise}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingInstructor(instructor);
                          setInstructorForm({
                            name: instructor.name,
                            position: instructor.position || "",
                            expertise: instructor.expertise || "",
                            profile: instructor.profile || "",
                            imageUrl: instructor.imageUrl || "",
                          });
                          setShowInstructorDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={async () => {
                          if (confirm("정말로 삭제하시겠습니까?")) {
                            await apiRequest("DELETE", `/api/business/instructors/${instructor.id}`);
                            queryClient.invalidateQueries({ queryKey: [`/api/business/instructors/${user?.id}`] });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </TabsContent>
  </Tabs>

      {/* 강의 등록/수정 다이얼로그 */}
      <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? "교재 수정" : "새 교재 등록"}
            </DialogTitle>
            <DialogDescription>
              {editingCourse
                ? "교재 정보를 수정하세요."
                : "새로운 교재를 등록하세요."}
            </DialogDescription>
          </DialogHeader>

          {/* 본문 분석 자료 불러오기 섹션 */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
              <Label className="text-blue-700 font-medium">본문 분석 자료 불러오기</Label>
              <Select
                onValueChange={(value) => {
                  const material = sourceMaterialsData?.materials?.find((m: any) => m.id.toString() === value);
                  if (material) {
                    setCourseForm((prev) => ({
                      ...prev,
                      title: material.fileName.replace(/\.[^/.]+$/, ""), // 확장자 제거
                      description: material.source === "seminar" 
                        ? `AI 분석 자료: ${material.fileName}`
                        : `${material.fileName} 분석 자료 기반 교재`,
                      curriculum: material.parsedText || "", // AI 분석 결과(JSON) 또는 텍스트 저장
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
                      description: "분석 자료 정보가 입력되었습니다.",
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
              <p className="text-xs text-gray-500">
                선택하면 교재명, 설명, 분석 자료가 자동으로 입력/첨부됩니다.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 기본 정보 섹션 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">교재명 *</Label>
                <Input
                  id="title"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="교재명을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select
                  value={courseForm.category}
                  onValueChange={(value) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="영어">영어</SelectItem>
                    <SelectItem value="국어">국어</SelectItem>
                    <SelectItem value="수학">수학</SelectItem>
                    <SelectItem value="과학">과학</SelectItem>
                    <SelectItem value="사회">사회</SelectItem>
                    <SelectItem value="모의고사">모의고사</SelectItem>
                    <SelectItem value="기타">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">정가 *</Label>
                <Input
                  id="price"
                  type="number"
                  value={courseForm.price}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      price: e.target.value,
                    }))
                  }
                  placeholder="정가를 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">할인가격</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  value={courseForm.discountPrice}
                  onChange={(e) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      discountPrice: e.target.value,
                    }))
                  }
                  placeholder="할인가격 (선택사항)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">교재 유형 *</Label>
                <Select
                  value={courseForm.duration}
                  onValueChange={(val) =>
                    setCourseForm((prev) => ({
                      ...prev,
                      duration: val,
                    }))
                  }
                >
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="교재 유형을 선택하세요" />
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

              <div className="space-y-2">
                <Label htmlFor="instructorSelect">저자 선택 *</Label>
                <Select
                  value={courseForm.instructorId}
                  onValueChange={(value) => {
                    const inst = myInstructors?.instructors?.find(i => i.id.toString() === value);
                    if (inst) {
                      setCourseForm((prev) => ({ 
                        ...prev, 
                        instructorId: value,
                        instructorName: inst.name,
                        instructorProfile: inst.profile || "",
                        instructorExpertise: inst.expertise || "",
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="저자를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {myInstructors?.instructors?.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id.toString()}>
                        {inst.name} ({inst.position})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-gray-500">
                  * 먼저 '저자 정보 관리' 탭에서 저자를 등록해주세요.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">교재 소개 *</Label>
              <Textarea
                id="description"
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="교재에 대한 상세한 소개를 입력하세요"
                rows={3}
              />
            </div>

            {/* 본문 분석 자료 & 표지 이미지 2열 배치 */}
            <div className="grid grid-cols-2 gap-6">
              {/* 본문 분석 자료 첨부 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  본문 분석 자료
                  <span className="text-[10px] text-gray-500 font-normal">(교재 본문을 분석한 AI 자료 등)</span>
                </Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="p-3 bg-white rounded-full shadow-sm">
                      <Upload className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">분석 자료 업로드</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, HWP, DOCX 등</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("analysisFileUpload")?.click()}
                    >
                      파일 선택
                    </Button>
                    <input
                      id="analysisFileUpload"
                      type="file"
                      className="hidden"
                      onChange={handleAnalysisMaterialUpload}
                    />
                  </div>
                </div>

                {courseForm.analysisMaterials.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {courseForm.analysisMaterials.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm group"
                      >
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="p-2 bg-blue-50 rounded text-blue-600 shrink-0">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAnalysisMaterial(file.id)}
                          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 표지 이미지 */}
              <div className="space-y-2">
                <Label>교재 표지 이미지</Label>
                <div className="flex gap-2 mb-2">
                   <div className="relative flex-1 border rounded-md h-10 px-3 flex items-center text-sm text-gray-400 bg-white hover:bg-gray-50 cursor-pointer overflow-hidden" onClick={() => document.getElementById("courseImageUpload")?.click()}>
                     <span className="truncate text-slate-600">
                       {courseForm.imageUrl ? (courseForm.imageUrl.startsWith("http") ? "이미지 업로드 완료" : courseForm.imageUrl.split('/').pop()) : "파일 선택 (클릭하여 업로드)"}
                     </span>
                     <input type="file" id="courseImageUpload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                   </div>
                   <Button variant="outline" onClick={() => loadSampleImages("course")}>샘플</Button>
                </div>

                {courseForm.imageUrl ? (
                  <div className="relative group w-32 aspect-[3/4] rounded-lg overflow-hidden border bg-gray-50 shadow-sm">
                    <img
                      src={courseForm.imageUrl}
                      className="w-full h-full object-cover"
                      alt="미리보기"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={removeImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 aspect-[3/4] bg-slate-50 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs">이미지가 없습니다</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowCourseDialog(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                // 태그를 배열로 변환
                const formDataWithTags = {
                  ...courseForm,
                  tags: courseForm.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0),
                  // 본문 분석 자료 데이터 추가
                  analysisMaterials: courseForm.analysisMaterials,
                };
                courseMutation.mutate(formDataWithTags);
              }}
              disabled={
                courseMutation.isPending ||
                !courseForm.title ||
                !courseForm.category ||
                !courseForm.price ||
                !courseForm.duration ||
                !courseForm.instructorId
              }
            >
              {courseMutation.isPending
                ? "처리 중..."
                : editingCourse
                  ? "수정 완료"
                  : "교재 등록"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>교재 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말로 "{deleteTarget?.title}" 교재를 삭제하시겠습니까? 이 작업은
              되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 강의 미리보기 다이얼로그 */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>교재 미리보기</DialogTitle>
            <DialogDescription>
              등록된 교재 정보를 확인하세요.
            </DialogDescription>
          </DialogHeader>

          {previewCourse && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">{previewCourse.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>{previewCourse.category}</span>
                  <span>•</span>
                  <span>{previewCourse.type}</span>
                  <span>•</span>
                  <span>{previewCourse.level}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">가격 정보</h4>
                  <div className="space-y-1">
                    {previewCourse.discountPrice ? (
                      <>
                        <div className="line-through text-gray-500">
                          {previewCourse.price?.toLocaleString()}원
                        </div>
                        <div className="text-red-600 font-medium text-lg">
                          {previewCourse.discountPrice?.toLocaleString()}원
                        </div>
                      </>
                    ) : (
                      <div className="font-medium text-lg">
                        {previewCourse.price?.toLocaleString()}원
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">교재 정보</h4>
                  <div className="space-y-1 text-sm">
                    <div>
                      학습 기간: {previewCourse.duration || "제한 없음"}
                    </div>
                    <div>
                      최대 학습자: {previewCourse.maxStudents || "제한 없음"}명
                    </div>
                    <div>학점: {previewCourse.credit || 1}학점</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">교재 소개</h4>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {previewCourse.description}
                </p>
              </div>

              {previewCourse.analysisMaterials && previewCourse.analysisMaterials.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">본문 분석 자료 (샘플)</h4>
                  <div className="space-y-2">
                    {previewCourse.analysisMaterials.map((file: any) => (
                      <div
                        key={file.id}
                        className="p-3 bg-blue-50 border border-blue-100 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                          {file.url ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 bg-white"
                              onClick={() => window.open(file.url, "_blank")}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              자료 보기
                            </Button>
                          ) : (
                            <Badge variant="secondary">분석 텍스트</Badge>
                          )}
                        </div>
                        {/* URL이 없는 분석 자료의 경우 상세 내용 표시 (추후 고도화 가능) */}
                        {!file.url && (
                          <div className="text-xs text-gray-600 bg-white/50 p-2 rounded border border-blue-50">
                            AI에 의해 분석된 본문 요약 및 구조 정보가 포함되어 있습니다.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 샘플 이미지 선택 다이얼로그 */}
      <Dialog open={showImageSelector} onOpenChange={setShowImageSelector}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>샘플 이미지 선택</DialogTitle>
            <DialogDescription>
              미리 준비된 교육용 이미지 중에서 선택하세요.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {sampleImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all aspect-[3/4]"
                onClick={() => selectSampleImage(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/BOOKS/1.png"; // Use a real fallback from the BOOKS folder
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    선택
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                  <p className="text-xs font-medium">{image.name}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImageSelector(false)}
            >
              취소
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 저자 등록/수정 다이얼로그 */}
      <Dialog open={showInstructorDialog} onOpenChange={setShowInstructorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingInstructor ? "저자 정보 수정" : "새 저자 등록"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>성함 *</Label>
                <Input 
                  value={instructorForm.name} 
                  onChange={(e) => setInstructorForm({...instructorForm, name: e.target.value})}
                  placeholder="성함을 입력하세요"
                />
              </div>
              <div className="space-y-2">
                <Label>직함/소속</Label>
                <Input 
                  value={instructorForm.position} 
                  onChange={(e) => setInstructorForm({...instructorForm, position: e.target.value})}
                  placeholder="예: 강사, 대표, ○○학원"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>전문 분야</Label>
              <Input 
                value={instructorForm.expertise} 
                onChange={(e) => setInstructorForm({...instructorForm, expertise: e.target.value})}
                placeholder="예: 고등 영어, 수능 전문"
              />
            </div>
            <div className="space-y-2">
              <Label>한줄 소개</Label>
              <Textarea 
                value={instructorForm.profile} 
                onChange={(e) => setInstructorForm({...instructorForm, profile: e.target.value})}
                placeholder="간략한 소개를 입력하세요"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>프로필 이미지</Label>
              <div className="flex flex-col gap-4">
                {instructorForm.imageUrl && (
                  <div className="w-24 h-24 rounded-full overflow-hidden border bg-gray-100 flex items-center justify-center">
                    <img 
                      src={instructorForm.imageUrl} 
                      className="w-full h-full object-cover" 
                      alt="프로필 미리보기"
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <Input 
                    value={instructorForm.imageUrl} 
                    onChange={(e) => setInstructorForm({...instructorForm, imageUrl: e.target.value})}
                    placeholder="이미지 URL을 입력하거나 샘플을 선택하세요"
                  />
                  <Button variant="outline" onClick={() => loadSampleImages("instructor")}>샘플</Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInstructorDialog(false)}>취소</Button>
            <Button 
              onClick={() => instructorMutation.mutate(instructorForm)}
              disabled={!instructorForm.name || instructorMutation.isPending}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
