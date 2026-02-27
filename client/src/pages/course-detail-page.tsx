import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { apiRequest } from "@/lib/api";
import { Loader2, Eye, Printer, Download, BookOpen } from "lucide-react";
// @ts-ignore
import html2pdf from 'html2pdf.js';
// @ts-ignore
import html2canvas from 'html2canvas';
import SentenceAnalysisViewer from "@/components/learning/sentence-analysis-viewer";

// Analysis Viewer Component
const AnalysisViewer = ({ seminarId, title }: { seminarId: string; title: string }) => {
  const { data: seminar } = useQuery<any>({
    queryKey: [`/api/seminars/${seminarId}`],
    enabled: !!seminarId
  });

  if (!seminar) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

  let content = null;
  try {
    if (seminar.program && seminar.program.startsWith("{")) {
       const analysis = JSON.parse(seminar.program);
       content = (
         <div className="space-y-4">
            {analysis.sentences?.map((s: any, i: number) => (
               <div key={i} className="bg-white p-3 rounded border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="flex gap-2">
                    <span className="font-bold text-gray-300 text-sm w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="font-serif text-lg mb-2 text-gray-800">{s.analysis || s.original}</p>
                      <p className="text-gray-600 text-sm bg-gray-50 p-2 rounded">{s.translation}</p>
                      {s.grammarPoint && (
                        <p className="text-xs text-blue-600 mt-1 font-medium">💡 {s.grammarPoint}</p>
                      )}
                    </div>
                  </div>
               </div>
            ))}
         </div>
       );
    } else {
       content = <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{seminar.description}</pre>;
    }
  } catch (e) {
    content = <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{seminar.description}</pre>;
  }

  return (
    <div className="mb-4 border rounded-lg bg-white overflow-hidden shadow-sm">
      <div className="py-2 px-3 bg-gray-50 border-b flex justify-between items-center">
        <h5 className="font-semibold text-sm text-gray-800">{title}</h5>
        <Badge variant="outline" className="text-xs">분석자료</Badge>
      </div>
      <div className="p-3">
        {content}
      </div>
    </div>
  );
};

// 선생님의 다른 강의 목록 컴포넌트
const InstructorOtherBooks = ({ courses, currentCourseId }: { courses: Course[], currentCourseId: number }) => {
  const otherCourses = courses.filter(c => c.id !== currentCourseId);
  if (otherCourses.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-xl shadow-md p-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6">선생님의 다른 책들</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {otherCourses.slice(0, 3).map((c) => (
          <Card key={c.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-100 group">
            <Link href={`/courses/${c.id}`}>
              <div className="cursor-pointer">
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  <img src={c.imageUrl || "/uploads/images/1.jpg"} alt={c.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-blue-600/90 backdrop-blur-sm">{c.category}</Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-2 h-10 group-hover:text-blue-600 transition-colors">{c.title}</h4>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-blue-600 font-bold">{c.price?.toLocaleString()}원</span>
                    <span className="text-[10px] text-gray-500">{c.enrolledCount}명 수강중</span>
                  </div>
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Font Awesome 아이콘 지원을 위한 스타일 추가
const IconStyle = () => (
  <style>{`
    @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `}</style>
);

// 실제 스키마에 맞는 타입 정의
interface Course {
  id: number;
  title: string;
  description: string | null;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: number;
  discountPrice: number | null;
  duration: string;
  totalHours: number | null;
  maxStudents: number | null;
  enrolledCount: number;
  startDate: string | null;
  endDate: string | null;
  imageUrl: string | null;
  status: string;
  approvalStatus: string;
  instructorId: number | null;
  objectives: string | null;
  requirements: string | null;
  materials: string | null;
  curriculum: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  instructorName?: string | null;
  instructorProfile?: string | null;
  instructorExpertise?: string | null;
  instructorImageUrl?: string | null;
  curriculumItems?: any[] | null;
  learningMaterials?: any[] | null;
  analysisMaterials?: any[] | null;
}

interface Instructor {
  id: number;
  name: string;
  position: string | null;
  expertise: string | null;
  profile: string | null;
  imageUrl: string | null;
  subscribers?: number | null;
}

interface Review {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  isActive: boolean;
  userName?: string;
}

const CourseDetailPage: React.FC = () => {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const { user, isLoading: userLoading } = useAuth();
  const { addToCart, isInCart: isInCartContext } = useCart();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("intro");
  const [isSticky, setIsSticky] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [showCourseEditModal, setShowCourseEditModal] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewContent, setNewReviewContent] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // 학습 진행 상태 (진도율 관련)
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set());
  const [videoProgress, setVideoProgress] = useState<Record<string, number>>({});
  const [loadRetryCount, setLoadRetryCount] = useState(0);
  const [videoTimer, setVideoTimer] = useState<any>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);

  // 장바구니, 찜하기, 공유하기 상태
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // 커리큘럼 편집 관련 상태 추가
  const [editingQuiz, setEditingQuiz] = useState<any>(null);
  const [showQuizEditModal, setShowQuizEditModal] = useState(false);

  // 커리큘럼 아이템 상태 (business-dashboard-page와 동일)
  const [curriculumItems, setCurriculumItems] = useState<
    Array<{
      id: string;
      title: string;
      duration: string;
      description: string;
      isCompleted: boolean;
      videos: Array<{
        id: string;
        title: string;
        url: string;
        duration: string;
        type: "upload" | "youtube" | "vimeo";
      }>;
      quizzes: Array<{
        id: string;
        title: string;
        questions: Array<{
          id: string;
          question: string;
          type: "multiple" | "true-false" | "short-answer";
          options?: string[];
          correctAnswer: string;
          explanation?: string;
        }>;
      }>;
    }>
  >([]);

  const queryClient = useQueryClient();

  // 강의 정보 조회
  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        credentials: "include",
      });
      if (!response.ok) {
        // 401 에러가 아닌 경우에만 에러 던지기
        if (response.status !== 401) {
          throw new Error("Failed to fetch course");
        }
        throw new Error("Authentication required");
      }
      return response.json();
    },
    enabled: !!courseId,
    retry: (failureCount, error) => {
      // 401 에러인 경우 재시도하지 않음
      if (error.message.includes("Authentication required")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  // 강사 정보 조회 - 제거 (course 테이블의 강사 정보 사용)

  // 리뷰 조회
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["reviews", courseId],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      return response.json();
    },
    enabled: !!courseId,
  });

  // 선생님의 다른 강의 조회
  const { data: instructorCoursesData } = useQuery<{ courses: Course[] }>({
    queryKey: ["/api/courses", { instructorId: course?.instructorId, limit: 10 }],
    enabled: !!course?.instructorId,
    queryFn: async ({ queryKey }) => {
      const [_url, params] = queryKey as [string, any];
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
      const res = await fetch(`${_url}?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch instructor courses");
      return res.json();
    }
  });

  const instructorCourses = instructorCoursesData?.courses?.filter(c => c.id !== courseId) || [];

  // 저자 상세 정보 조회 (구독자 수 등)
  const { data: instructor } = useQuery<Instructor>({
    queryKey: [`/api/instructors/${course?.instructorId}`],
    enabled: !!course?.instructorId,
  });

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r: Review) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "4.8";

  // 강의 수정 뮤테이션
  const updateCourseMutation = useMutation({
    mutationFn: async (updateData: any) => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      });
      if (!response.ok) {
        throw new Error("Failed to update course");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      toast({
        title: "강의 정보가 업데이트되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "업데이트에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 강의 삭제 뮤테이션
  const deleteCourseMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to delete course");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "강의가 삭제되었습니다.",
        variant: "default",
      });
      window.location.href = "/courses";
    },
    onError: (error) => {
      toast({
        title: "삭제에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 책구매 뮤테이션
  const enrollmentMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to buy book");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
      toast({
        title: "책 구매가 완료되었습니다.",
        variant: "default",
      });
      // 구매 후 페이지 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "책 구매에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 리뷰 작성 뮤테이션
  const reviewMutation = useMutation({
    mutationFn: async (reviewData: { rating: number; comment: string }) => {
      const response = await fetch(`/api/courses/${courseId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", courseId] });
      setNewReviewContent("");
      setNewReviewRating(5);
      setShowReviewModal(false);
      toast({
        title: "리뷰가 등록되었습니다.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "리뷰 등록에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 구독하기 뮤테이션
  const subscriptionMutation = useMutation({
    mutationFn: async () => {
      if (!course?.instructorId) throw new Error("No instructor");
      const response = await fetch(`/api/instructors/${course.instructorId}/subscribe`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to ${isSubscribed ? "unsubscribe" : "subscribe"}`,
        );
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsSubscribed(data.subscribed);
      toast({
        title: data.subscribed
          ? "구독했습니다."
          : "구독을 취소했습니다.",
        variant: "default",
      });
      // Invalidate instructor query to update subscriber count
      queryClient.invalidateQueries({ queryKey: [`/api/instructors/${course?.instructorId}`] });
    },
    onError: (error) => {
      toast({
        title: "구독 처리에 실패했습니다.",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // 책구매 핸들러
  const handleEnrollment = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "책 구매를 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    enrollmentMutation.mutate();
  };

  // 결제 핸들러
  const handlePayment = () => {
    if (!selectedPaymentMethod) {
      toast({
        title: "결제 방법을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (!isAgreed) {
      toast({
        title: "이용약관에 동의해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 실제 결제 처리 로직 (결제 게이트웨이 연동)
    toast({
      title: "결제가 진행됩니다.",
      description: "잠시만 기다려주세요...",
      variant: "default",
    });

    setIsPaymentModalOpen(false);
    handleEnrollment();
  };

  // 리뷰 제출 핸들러
  const handleReviewSubmit = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "리뷰 작성을 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!newReviewContent.trim()) {
      toast({
        title: "리뷰 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    reviewMutation.mutate({
      rating: newReviewRating,
      comment: newReviewContent,
    });
  };

  // 구독하기 핸들러
  const handleSubscribe = () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "구독하기를 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }
    if (!course?.instructorId) {
      toast({
        title: "구독할 강사 정보가 없습니다.",
        variant: "destructive",
      });
      return;
    }
    subscriptionMutation.mutate();
  };

  // 장바구니 담기 핸들러
  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다.",
        description: "장바구니 이용을 위해 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart(courseId, course);
      toast({
        title: "장바구니에 추가되었습니다.",
        variant: "default",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";

      if (errorMessage.includes("이미 장바구니에 있는")) {
        toast({
          title: "이미 장바구니에 있습니다.",
          description: "장바구니에서 확인하세요.",
          variant: "default",
        });
      } else {
        toast({
          title: "장바구니 추가에 실패했습니다.",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // 공유하기 핸들러
  const handleShare = () => {
    setShowShareModal(true);
  };

  // URL 복사 핸들러
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "링크가 복사되었습니다.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "링크 복사에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // 소셜 공유 핸들러
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(course?.title || "강의");

    let shareUrl = "";

    switch (platform) {
      case "kakao":
        shareUrl = `https://sharer.kakao.com/talk/friends/?url=${url}&title=${title}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case "line":
        shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price);
  };

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      const enrollSection = document.getElementById("enroll-section");
      if (enrollSection) {
        const rect = enrollSection.getBoundingClientRect();
        setIsSticky(rect.top <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 인증 상태 확인 및 디버깅
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("CourseDetailPage - User loading:", userLoading);
      console.log("CourseDetailPage - User:", user);
      console.log("CourseDetailPage - Course ID:", courseId);
    }
  }, [user, userLoading, courseId]);

  // 사용자별 찜 목록과 장바구니 상태 확인
  useEffect(() => {
    if (user && course?.instructorId) {
      // 구독 상태 확인
      fetch(`/api/instructors/${course.instructorId}/subscription-status`, {
        credentials: "include",
      })
        .then((response) =>
          response.ok ? response.json() : { subscribed: false },
        )
        .then((data) => setIsSubscribed(data.subscribed))
        .catch(() => setIsSubscribed(false));
    }
  }, [user, course?.instructorId]);

  // 수강 정보 통합 쿼리
  const {
    data: enrollmentData,
    isLoading: enrollmentLoading,
    refetch: refetchEnrollment,
  } = useQuery<{ enrollment: any }>({
    queryKey: [`/api/user/enrollments/course/${courseId}`],
    queryFn: async () => {
      if (!courseId || !user?.id) return { enrollment: null };
      const response = await apiRequest(
        "GET",
        `/api/enrollments?userId=${user.id}&courseId=${courseId}`,
      );
      return { enrollment: response[0] || null };
    },
    enabled: !!user && !!courseId,
  });

  const enrollment = enrollmentData?.enrollment;
  const isEnrolled = !!enrollment;

  // 진도율 업데이트 요청을 추적하기 위한 Map
  const progressUpdateQueue = useRef(new Map<string, boolean>());

  const updateProgress = async (
    itemId: string,
    itemType: "video" | "quiz",
    progress: number,
  ): Promise<any> => {
    // 중복 요청 방지
    const requestKey = `${itemId}-${itemType}`;
    if (progressUpdateQueue.current.get(requestKey)) {
      return;
    }

    progressUpdateQueue.current.set(requestKey, true);

    try {
      if (!enrollment?.id) {
        throw new Error("수강 정보를 찾을 수 없습니다.");
      }

      if (!user?.id) {
        throw new Error("로그인이 필요합니다.");
      }

      console.log(`진도율 업데이트 요청: ${itemId} = ${progress}%`);

      const response = await fetch(
        `/api/user/enrollments/${enrollment.id}/progress`,
        {
          method: "POST",
          credentials: "include", // 세션 기반 인증
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId,
            itemType,
            progress,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("진도율 업데이트 API 오류:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        if (response.status === 401) {
          // 인증 오류 시 사용자 정보 갱신
          queryClient.invalidateQueries({ queryKey: ["user"] });
          throw new Error("로그인이 필요합니다.");
        }

        throw new Error(errorData.message || `서버 오류 ${response.status}`);
      }

      const result = await response.json();
      console.log(`진도율 업데이트 성공: ${itemId} = ${progress}%`);

      // 성공 시 수강 정보 새로고침
      if (result.success) {
        refetchEnrollment();
      }

      return result;
    } catch (error) {
      console.error("진도율 업데이트 실패:", error);
      throw error; // 원본 에러를 그대로 전달
    } finally {
      // 요청 완료 후 큐에서 제거
      progressUpdateQueue.current.delete(requestKey);
    }
  };

  // 네트워크 작업 재시도 유틸리티 함수
  const retryOperation = async (
    operation: () => Promise<any>,
    maxRetries = 3,
    delay = 1000,
  ) => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        console.error(`작업 실패 (시도 ${i + 1}/${maxRetries}):`, error);
        lastError = error;

        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1))); // 지수 백오프
        }
      }
    }

    throw lastError;
  };

  // 진도율 데이터 저장 (디바운싱 적용 가능)
  const saveCompletedItem = async (itemId: string) => {
    if (!user || !enrollment || !course?.id) return;

    try {
      await retryOperation(() => handleVideoProgress(itemId, 100));
    } catch (error) {
      console.error("진도율 저장 중 오류:", error);
      toast({
        title: "진도율 저장 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 완료된 항목 불러오기 함수
  const loadCompletedItems = async () => {
    if (!enrollment?.id) {
      console.log("enrollment ID가 없어서 진도율 로딩 건너뜀:", { enrollment });
      return;
    }

    if (!user?.id) {
      console.log("user ID가 없어서 진도율 로딩 건너뜀:", { user });
      return;
    }

    console.log("진도율 조회 API 호출 시작:", {
      enrollmentId: enrollment.id,
      userId: user.id,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      const response = await fetch(
        `/api/user/enrollments/${enrollment.id}/progress`,
        {
          method: "GET",
          credentials: "include", // 쿠키 기반 세션 인증 포함
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache", // 캐시 무시하고 최신 데이터 요청
          },
        },
      );

      console.log("진도율 API 응답:", {
        status: response.status,
        ok: response.ok,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("=== 서버 응답 원본 ===");
        console.log("전체 응답:", data);
        console.log("completedVideos:", data.completedVideos);
        console.log("completedQuizzes:", data.completedQuizzes);
        console.log("itemProgress 타입:", typeof data.itemProgress);
        console.log("itemProgress 원본:", data.itemProgress);
        console.log("itemProgress keys:", Object.keys(data.itemProgress || {}));

        // 완료된 항목 설정
        if (data.completedVideos && Array.isArray(data.completedVideos)) {
          setCompletedVideos(new Set(data.completedVideos));
          console.log(
            "완료된 비디오 설정:",
            data.completedVideos.length + "개",
          );
        }

        if (data.completedQuizzes && Array.isArray(data.completedQuizzes)) {
          setCompletedQuizzes(new Set(data.completedQuizzes));
          console.log("완료된 퀴즈 설정:", data.completedQuizzes.length + "개");
        }

        // 개별 항목 진도율 저장
        if (data.itemProgress && typeof data.itemProgress === "object") {
          const progressKeys = Object.keys(data.itemProgress);
          console.log("itemProgress 처리 중...", {
            keyCount: progressKeys.length,
            keys: progressKeys.slice(0, 5), // 처음 5개만 로그
            totalKeys: progressKeys.length,
          });

          if (progressKeys.length > 0) {
            console.log("진도율 데이터를 videoProgress에 설정:", {
              itemCount: progressKeys.length,
              sampleData: Object.fromEntries(
                Object.entries(data.itemProgress).slice(0, 3),
              ),
            });

            // 서버 데이터로 완전히 덮어쓰기
            setVideoProgress(data.itemProgress);

            // 상태 업데이트 확인을 위한 지연된 로깅
            setTimeout(() => {
              console.log(
                "✅ 진도율 상태 설정 완료 - 총",
                progressKeys.length,
                "개 항목",
              );
            }, 100);
          } else {
            console.log("⚠️ itemProgress에 키가 없음 - 진도율 데이터 없음");
            setVideoProgress({}); // 빈 객체로 초기화
          }
        } else {
          console.log(
            "⚠️ itemProgress가 없거나 올바른 객체가 아님:",
            data.itemProgress,
          );
          setVideoProgress({}); // 빈 객체로 초기화
        }

        console.log("✅ 진도율 데이터 로s�� 성공적으로 완료");

        return data; // 성공시 데이터 반환
      } else {
        console.error("❌ 진도율 조회 실패:", {
          status: response.status,
          statusText: response.statusText,
        });

        // 401 오류인 경우 로그인 상태 확인
        if (response.status === 401) {
          console.log("🔐 인증 오류 - 로그인 상태 확인 필요");
          // 로그인 상태 재확인을 위해 사용자 정보 다시 로드
          queryClient.invalidateQueries({ queryKey: ["user"] });
        }

        // 오류 시 빈 상태로 초기화
        setCompletedVideos(new Set());
        setCompletedQuizzes(new Set());
        setVideoProgress({});
      }
    } catch (error) {
      console.error("❌ 진도율 조회 중 네트워크 오류:", error);

      // 오류 시 빈 상태로 초기화
      setCompletedVideos(new Set());
      setCompletedQuizzes(new Set());
      setVideoProgress({});

      // 네트워크 오류시 재시도 로직 (최대 1회)
      if (loadRetryCount < 1) {
        setLoadRetryCount((prev) => prev + 1);
        console.log("🔄 3초 후 진도율 데이터 재시도...");
        setTimeout(() => {
          if (enrollment?.id && user?.id) {
            console.log("🔄 진도율 데이터 재시도 실행");
            loadCompletedItems();
          }
        }, 3000);
      } else {
        console.log("❌ 진도율 로딩 재시도 횟수 초과");
      }
    }
  };

  // 컴포넌트 마운트 시 완료된 항목 불러오기
  useEffect(() => {
    if (course?.id && enrollment?.id && user?.id) {
      console.log("🚀 진도율 데이터 로딩 시작:", {
        courseId: course.id,
        enrollmentId: enrollment.id,
        userId: user.id,
      });
      // 재시도 카운터 초기화
      setLoadRetryCount(0);
      loadCompletedItems();
    }
  }, [course?.id, enrollment?.id, user?.id]);

  // enrollment가 변경되거나 처음 로딩된 경우에도 진도율 데이터 재로딩
  useEffect(() => {
    if (enrollment?.id && !enrollmentLoading && user?.id) {
      console.log("📚 enrollment 변경으로 진도율 재로딩:", {
        enrollmentId: enrollment.id,
        isLoading: enrollmentLoading,
      });
      // 약간의 지연을 두어 enrollment 데이터가 완전히 설정된 후 호출
      setTimeout(() => {
        setLoadRetryCount(0);
        loadCompletedItems();
      }, 200);
    }
  }, [enrollment?.id, enrollmentLoading, user?.id]);

  // 사용자 로그인 상태가 변경된 경우에도 진도율 데이터 재로딩
  useEffect(() => {
    if (user?.id && enrollment?.id && !userLoading) {
      console.log("👤 사용자 로그인 후 진도율 재로딩:", {
        userId: user.id,
        enrollmentId: enrollment.id,
        userLoading,
      });

      // 로그인 후 약간의 지연을 두어 세션이 완전히 설정된 후 호출
      setTimeout(() => {
        setLoadRetryCount(0);
        loadCompletedItems();
      }, 500);
    }
  }, [user?.id, userLoading]);

  // 페이지 포커스 시 진도율 데이터 새로고침 (탭 전환 후 돌아왔을 때)
  useEffect(() => {
    const handleFocus = () => {
      if (
        user?.id &&
        enrollment?.id &&
        document.visibilityState === "visible"
      ) {
        console.log("👁️ 페이지 포커스로 인한 진도율 새로고침");
        setLoadRetryCount(0);
        loadCompletedItems();
      }
    };

    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user?.id, enrollment?.id]);

  // 비디오 시청 진도율 업데이트 핸들러
  const handleVideoProgress = async (videoId: string, progress: number) => {
    if (!user || !enrollment || !course?.id) {
      toast({
        title: "로그인 필요",
        description: "진도율을 저장하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 서버에 진도율 업데이트 요청
      const response = await updateProgress(videoId, "video", progress);

      if (response) {
        // 캐시 갱신
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });
        refetchEnrollment();

        // 90% 이상 시청 시 완료 처리
        if (progress >= 90) {
          setCompletedVideos((prev) => new Set(prev).add(videoId));
          toast({
            title: "강의 완료",
            description: "강의를 성공적으로 완료했습니다.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("진도율 업데이트 중 오류:", error);
      toast({
        title: "진도율 업데이트 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 퀴즈 완료 처리
  const handleQuizComplete = async (quizId: string, score: number) => {
    if (!user || !enrollment || !course?.id) {
      toast({
        title: "로그인 필요",
        description: "퀴즈 결과를 저장하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 서버에 진도율 업데이트 요청
      const response = await updateProgress(
        quizId,
        "quiz",
        score >= 60 ? 100 : Math.min(score, 59), // 60점 이상이면 완료 처리
      );

      if (response) {
        // 캐시 갱신
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });
        refetchEnrollment();

        if (score >= 60) {
          setCompletedQuizzes((prev) => new Set(prev).add(quizId));
          toast({
            title: "퀴즈 완료",
            description: "퀴즈를 성공적으로 완료했습니다.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("진도율 업데이트 중 오류:", error);
      toast({
        title: "진도율 업데이트 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  const handleDirectDownload = async (course: Course, format: 'pdf' | 'hwpx') => {
    if (!course.curriculum) return;
    try {
      let analysisData = null;

      if (typeof course.curriculum === 'string' && course.curriculum.startsWith('linked_seminar:')) {
        const seminarId = course.curriculum.split(':')[1];
        try {
          const response = await fetch(`/api/seminars/${seminarId}`);
          if (!response.ok) throw new Error("분석 자료를 불러올 수 없습니다.");
          const seminar = await response.json();
          if (seminar.program) {
            analysisData = typeof seminar.program === 'string' ? JSON.parse(seminar.program) : seminar.program;
          }
        } catch (err) {
          console.error("Error fetching linked seminar for download:", err);
          return;
        }
      } else {
        let curriculumData = course.curriculum;
        if (typeof curriculumData === 'string' && curriculumData.startsWith('"')) {
          curriculumData = JSON.parse(curriculumData);
        }
        analysisData = typeof curriculumData === 'string' ? JSON.parse(curriculumData) : curriculumData;
      }

      if (!analysisData) return;
      
      if (format === 'pdf') {
        downloadPdf(analysisData, course.title);
      } else {
        downloadHwpx(analysisData, course.title);
      }
    } catch (e) {
      console.error("Direct download failed", e);
    }
  };

  // Helper to render analyzed text with Solvook's Ultra-Precision Annotation Engine
  const transformToAnalyzedSentences = (sentences: any[]) => {
      if (!sentences) return [];
      
      return sentences.map((s: any, idx: number) => {
        const contentTokens: any[] = [];
        
        // Use existing 'analysis' string if available, otherwise 'original'
        const textToParse = typeof s === 'string' ? s : (s.analysis || s.original || s.content || "");
        
        if (!textToParse) {
             if (s && typeof s === 'object') {
                 const fallback = JSON.stringify(s);
                 if (fallback.length < 5) return { id: idx, number: idx + 1, contentTokens: [], isTopic: false, translation: "", tags: [] };
             }
        }
        
        const regex = /\[([^\]\/]+)(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?\]|\(\(\{|\}\)\)|<<\{|\}>>|\{\{|\}\}|\[\[\{|\}\]\]|\(\(\(\{|\}\)\)\)|\(([^)]+)\)|(\/ \/ bg)|(\/)|([^\[\]\(\)\{\}\/\s]+)|(\s+)/g;
        
        let match;
        let tokenIdx = 0;
        
        while ((match = regex.exec(textToParse)) !== null) {
          const id = `tok-${idx}-${tokenIdx++}`;
          
          if (match[0] === '(({') { contentTokens.push({ id, text: "[", type: 'clause-blue-open' }); }
          else if (match[0] === '}))') { contentTokens.push({ id, text: "]", type: 'clause-blue-close' }); }
          else if (match[0] === '<<{') { contentTokens.push({ id, text: "[", type: 'clause-green-open' }); }
          else if (match[0] === '}>>') { contentTokens.push({ id, text: "]", type: 'clause-green-close' }); }
          else if (match[0] === '{{') { contentTokens.push({ id, text: "[", type: 'clause-orange-open' }); }
          else if (match[0] === '}}') { contentTokens.push({ id, text: "]", type: 'clause-orange-close' }); }
          else if (match[0] === '[[{') { contentTokens.push({ id, text: "[", type: 'clause-purple-open' }); }
          else if (match[0] === '}]]') { contentTokens.push({ id, text: "]", type: 'clause-purple-close' }); }
          else if (match[0] === '((({') { contentTokens.push({ id, text: "[", type: 'clause-pink-open' }); }
          else if (match[0] === '})))') { contentTokens.push({ id, text: "]", type: 'clause-pink-close' }); }
          else if (match[8] === '/ / bg') { continue; }
          else if (match[10]) { contentTokens.push({ id, text: match[10], type: 'text' }); }
          else if (match[11]) { contentTokens.push({ id, text: match[11], type: 'text' }); }
          else if (match[7]) { 
            contentTokens.push({ id, text: "(", type: 'text', note: null });
            contentTokens.push({ id: id + "-content", text: match[7], type: 'bracket-blue' });
            contentTokens.push({ id: id + "-close", text: ")", type: 'text', note: null });
          } else if (match[9]) { continue; }
          else { 
            const text = match[1];
            if (!text) continue;
            const annotation = match[2];
            const color = match[3]; 
            const shape = match[4]; 
            let type = 'text';
            let note = annotation;
            let noteColor = undefined;
            if (text.trim() === '[' || text.trim() === ']') { type = color === 'green' ? 'bracket-green' : 'bracket-blue'; }
            else if (shape === 'box') { if (color === 'green') { type = 'box-green'; } else { type = 'box-red'; } }
            else if (shape === 'oval' || color === 'orange') { type = 'oval-orange'; }
            else if (color === 'ox' || shape === 'ox') { type = 'ox'; }
            else if (color === 'arrow' || shape === 'arrow') { type = 'arrow'; }
            else if (shape === 'bg' || color === 'gray' || color === 'bg') { type = 'bg-soft'; }
            else if (shape === 'verb' || color === 'green') { type = 'verb'; }
            else if (color === 'red') { if (shape === 'line' || shape === 'underline') type = 'underline-red'; else type = 'highlight-red'; }
            else if (color === 'blue') { if (shape === 'line' || shape === 'underline') type = 'underline-blue'; else type = 'highlight-blue'; }
            else if (shape === 'bold') { type = 'bold'; }
            else if (shape === 'strike') { type = 'strike'; }
            else { if (color === 'blue') type = 'highlight-blue'; else if (color === 'red') type = 'highlight-red'; }
            contentTokens.push({ id, text, type, note: note || undefined, noteColor });
          }
        }
        return { ...s, id: s.id || idx, number: idx + 1, tags: [], isTopic: false, contentTokens, translation: s.translation };
      });
  };

  const downloadPdf = (analysis: any, title: string) => {
    if (!analysis) return;
    
    // 1. Detect Type
    let type = analysis.type || "analysis";
    if (analysis.questions && analysis.questions.length > 0) {
      type = "variant";
    } else if (analysis.title?.includes("워크북") || (analysis.sentences && analysis.type === "workbook")) {
      type = "workbook";
    } else if ((analysis.sentences && analysis.sentences.length > 0) || (analysis.content && analysis.content.length > 0)) {
      type = type === "workbook" ? "workbook" : "analysis";
    } else if (analysis.vocabulary && analysis.vocabulary.length > 0) {
      type = "word";
    } else if (analysis.title?.includes("단어장")) {
      type = "word";
    } else if (analysis.title?.includes("변형문제")) {
      type = "variant";
    }

    const sentences = analysis.sentences || analysis.content || [];
    const structure = analysis.structure || {};
    const backgroundKnowledge = analysis.backgroundKnowledge;
    const vocabulary = analysis.vocabulary || [];
    const questions = analysis.questions || [];

    // Parse sentences using the shared logic
    const parsedSentences = transformToAnalyzedSentences(sentences);

    // Helper: Render tokens to HTML string
    const renderTokensToHtml = (tokens: any[]) => {
        let html = '';
        const bgStack: string[] = [];
        
        // Colors from SentenceAnalysisViewer
        const bgColors: Record<string, string> = {
            'clause-blue': '#eff6ff',   // bg-blue-50
            'clause-green': '#f0fdf4',  // bg-green-50
            'clause-orange': '#fff7ed', // bg-orange-50
            'clause-purple': '#faf5ff', // bg-purple-50
            'clause-pink': '#fdf2f8',   // bg-pink-50
        };

        if (!tokens) return "";

        tokens.forEach((token: any) => {
            // 1. Handle Clause Open (Push bg)
            if (token.type.endsWith('-open')) {
                const colorKey = token.type.replace('-open', '');
                bgStack.push(bgColors[colorKey] || '#f8fafc');
            }

            // 2. Render Content
            const currentBg = bgStack.length > 0 ? bgStack[bgStack.length - 1] : 'transparent';
            
            // Base style for text
            let style = `font-size: 13px; font-family: 'Times New Roman', serif; color: #0f172a; line-height: 1.6;`;
            // Add background if exists
            // Fix: Background overlapping text -> Use box-shadow only for slight spread, avoid large padding
            // Use linear-gradient to push background down (Highlighter effect)
            if (currentBg !== 'transparent') {
                // Start background from 60% down to 95% (Pushing it down as requested)
                style += `background: linear-gradient(to bottom, transparent 60%, ${currentBg} 60%, ${currentBg} 95%, transparent 95%); box-decoration-break: clone; -webkit-box-decoration-break: clone; padding: 1px 1px;`;
            }

            let content = token.text;
            let noteHtml = '';

            // Handle Specific Token Types
            if (token.type.includes('bracket-') || (token.type.includes('clause-') && (token.text === '[' || token.text === ']'))) {
                const color = token.type.includes('blue') ? '#2563eb' : 
                              token.type.includes('green') ? '#10b981' : 
                              token.type.includes('orange') ? '#f97316' : 
                              token.type.includes('purple') ? '#9333ea' : 
                              token.type.includes('pink') ? '#db2777' : '#2563eb';
                style += `color: ${color}; font-weight: 900; font-family: 'Helvetica', sans-serif; font-size: 1.1em; background: none;`;
            } 
            else if (token.type.includes('highlight-') || token.type.includes('underline-')) {
                const color = token.type.includes('red') ? '#ef4444' : '#2563eb';
                style += `color: ${color}; font-weight: bold; border-bottom: 2px solid ${color};`;
            }
            else if (token.type === 'bold') {
                style += `font-weight: bold;`;
            }
            else if (token.type === 'box-red' || token.type === 'box-green') {
                const color = token.type.includes('red') ? '#ef4444' : '#16a34a';
                style += `border: 2px solid ${color}; border-radius: 3px; padding: 0 1px; font-weight: bold; background: none;`;
            }
            else if (token.type === 'oval-orange') {
                style += `border: 2px solid #f97316; border-radius: 12px; padding: 0 2px; font-weight: bold; background: none;`;
            }
            else if (token.type === 'bg-soft') {
                style += `background-color: #fff9c4;`;
            }

            // Handle Note (Annotation)
            if (token.note) {
                const noteColor = token.type.includes('red') ? '#ef4444' : '#64748b';
                // Increase margin-top to push note below word level
                noteHtml = `<div style="font-size: 9px; color: ${noteColor}; font-family: 'Malgun Gothic', sans-serif; text-align: center; margin-top: 1px; line-height: 1.0; white-space: nowrap;">${token.note}</div>`;
                
                // Use vertical-align: top for inline-block, but ensure line-height is sufficient
                html += `<div style="display: inline-block; vertical-align: top; margin: 0 1px;">
                           <div style="${style}">${content}</div>
                           ${noteHtml}
                         </div>`;
            } else {
                html += `<span style="${style}">${content}</span>`;
            }

            // 3. Handle Clause Close (Pop bg)
            if (token.type.endsWith('-close')) {
                bgStack.pop();
            }
        });
        return html;
    };

    let specificContent = '';

    if (type === 'variant') {
       specificContent = `
         <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">변형문제</h2>
         <div style="column-count: 2; column-gap: 30px;">
           ${questions.map((q: any, idx: number) => `
             <div style="break-inside: avoid; margin-bottom: 20px;">
               <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                 <span style="font-weight: bold; font-size: 14px;">${idx + 1}.</span>
                 <div style="font-weight: bold; font-size: 12px; padding-top: 2px;">${q.question}</div>
               </div>
               ${q.passage ? `<div style="border: 1px solid #ddd; padding: 8px; font-size: 10px; margin-bottom: 8px; text-align: justify;">${q.passage}</div>` : ''}
               <div style="font-size: 10px;">
                 ${q.choices?.map((c: string, cIdx: number) => `
                   <div style="display: flex; gap: 5px; margin-bottom: 2px;">
                     <span style="color: #666; width: 15px;">${['①', '②', '③', '④', '⑤'][cIdx]}</span>
                     <span>${c}</span>
                   </div>
                 `).join('')}
               </div>
             </div>
           `).join('')}
         </div>
         <div style="break-before: page; margin-top: 30px;">
            <h3 style="font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 15px;">정답 및 해설</h3>
            <div style="column-count: 2; column-gap: 30px;">
              ${questions.map((q: any, idx: number) => `
                <div style="break-inside: avoid; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f5f5f5;">
                   <div style="font-size: 11px; margin-bottom: 2px;">
                     <span style="font-weight: bold;">${idx + 1}.</span>
                     <span style="font-weight: bold; color: #2563eb;">정답: ${q.answer}</span>
                   </div>
                   <div style="font-size: 10px; color: #666; background: #f8f9fa; padding: 5px; border-radius: 4px;">${q.explanation || "해설 없음"}</div>
                </div>
              `).join('')}
            </div>
         </div>
       `;
    } else if (type === 'workbook') {
        let parsedSentences = sentences;
        if (typeof parsedSentences === 'string') { try { parsedSentences = JSON.parse(parsedSentences); } catch(e) {} }
        if (typeof parsedSentences === 'string') { try { parsedSentences = JSON.parse(parsedSentences); } catch(e) {} }
        if (!Array.isArray(parsedSentences)) parsedSentences = [];
        
        const analyzedSentences = transformToAnalyzedSentences(parsedSentences);
        
        const renderTokens = (tokens: any[]) => {
            if (!tokens || tokens.length === 0) return '';
            return tokens.map(t => {
                if (t.type === 'text') return t.text;
                if (t.type.includes('clause-')) return '';
                if (t.type.includes('highlight') || t.type.includes('box') || t.type === 'verb' || t.type === 'ox' || t.type.includes('red') || t.type.includes('blue') || t.type.includes('green')) {
                   const note = t.note || t.text;
                   // For workbook, we often want [A / B] style or (verb) style
                   if (t.type === 'ox' || t.type.includes('red') || (t.type.includes('box') && t.type.includes('blue'))) {
                        // Choice style: [text / distractor]
                        const distractor = t.note?.split('≠')[1]?.trim() || "???";
                        return `<span style="font-weight: bold; margin: 0 2px;">[${t.text} / ${distractor}]</span>`;
                   }
                   if (t.type === 'verb' || t.type.includes('green')) {
                        return `<span style="font-weight: bold; margin: 0 2px;">(${t.note || t.text})</span>`;
                   }
                }
                return t.text;
            }).join('');
        };

        specificContent = `
           ${structure ? `<!-- Structure Info -->
             <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">지문 구조</h2>
             <div style="border: 1px solid #eee; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
                <div style="font-size: 11px; margin-bottom: 5px;"><span style="color: red; font-weight: bold;">제목</span> ${structure.title || ""}</div>
                <div style="font-size: 11px; margin-bottom: 5px;"><span style="color: blue; font-weight: bold;">주제</span> ${structure.subject || ""}</div>
                <div style="font-size: 11px;"><span style="color: green; font-weight: bold;">요약</span> ${structure.summary || ""}</div>
             </div>
           ` : ''}
           ${backgroundKnowledge ? `<!-- Background -->
             <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">배경 지식</h2>
             <div style="border: 1px solid #eee; padding: 10px; margin-bottom: 20px; border-radius: 5px;">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 5px;">${backgroundKnowledge.title}</div>
                <div style="font-size: 11px; color: #555;">${backgroundKnowledge.description}</div>
             </div>
           ` : ''}

           <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 10px;">1. 어휘 선택</h3>
              ${analyzedSentences.map((s: any, i: number) => `
                <div style="font-size: 12px; margin-bottom: 8px; line-height: 1.6;">
                   <span style="font-weight: bold; color: #3b82f6; margin-right: 5px;">${String(i+1).padStart(2,'0')}</span>
                   ${renderTokens(s.contentTokens)}
                </div>
              `).join('')}
           </div>

           <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 10px;">2. 어법 선택</h3>
              ${analyzedSentences.map((s: any, i: number) => `
                <div style="font-size: 12px; margin-bottom: 8px; line-height: 1.6;">
                   <span style="font-weight: bold; color: #3b82f6; margin-right: 5px;">${String(i+1).padStart(2,'0')}</span>
                   ${renderTokens(s.contentTokens)}
                </div>
              `).join('')}
           </div>
           
           <div style="margin-bottom: 20px;">
              <h3 style="font-size: 12px; font-weight: bold; margin-bottom: 10px;">3. 동사형 바꾸기</h3>
              ${analyzedSentences.map((s: any, i: number) => `
                <div style="font-size: 12px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #eee;">
                   <div style="margin-bottom: 3px; font-size: 11px; color: #666;">${s.translation}</div>
                   <div style="line-height: 1.8; background: #f9f9f9; padding: 5px; border-radius: 4px;">
                      ${renderTokens(s.contentTokens)}
                   </div>
                </div>
              `).join('')}
           </div>
        `;
    } else if (type === 'word') {
        const displayVocab = vocabulary;
        
        specificContent = `
          <h2 style="font-size: 16px; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 15px;">단어장</h2>
          
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 11px; background: #cbd5e1;">
            ${displayVocab.map((v: any, i: number) => {
               if (i % 2 !== 0) return '';
               const v2 = displayVocab[i+1];
               return `
                 <tr>
                   <td style="width: 50%; padding: 10px; vertical-align: top; background: white; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9;">
                      <div style="display: flex; align-items: flex-start;">
                        <div style="margin-right: 8px; margin-top: 4px;">
                           <div style="width: 6px; height: 6px; border-radius: 50%; border: 1px solid #cbd5e1; background: white;"></div>
                        </div>
                        <div style="flex: 1;">
                           <div style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 3px;">${v.word}</div>
                           <div style="display: flex; align-items: flex-start; gap: 4px;">
                              <span style="font-size: 9px; color: #94a3b8; font-weight: bold; padding-top: 1px;">뜻</span>
                              <span style="font-size: 11px; color: #475569; font-weight: bold;">${v.meaning}</span>
                           </div>
                           ${(v.synonyms || v.antonyms) ? `
                             <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #f1f5f9; display: flex; flex-wrap: wrap; gap: 8px;">
                                ${v.synonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #3b82f6; font-weight: bold; font-size: 9px;">S</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v.synonyms)?v.synonyms.join(', '):v.synonyms}</span></div>` : ''}
                                ${v.antonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #ef4444; font-weight: bold; font-size: 9px;">A</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v.antonyms)?v.antonyms.join(', '):v.antonyms}</span></div>` : ''}
                             </div>
                           ` : ''}
                        </div>
                      </div>
                   </td>
                   <td style="width: 50%; padding: 10px; vertical-align: top; background: white; border-bottom: 1px solid #f1f5f9;">
                      ${v2 ? `
                      <div style="display: flex; align-items: flex-start;">
                        <div style="margin-right: 8px; margin-top: 4px;">
                           <div style="width: 6px; height: 6px; border-radius: 50%; border: 1px solid #cbd5e1; background: white;"></div>
                        </div>
                        <div style="flex: 1;">
                           <div style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 3px;">${v2.word}</div>
                           <div style="display: flex; align-items: flex-start; gap: 4px;">
                              <span style="font-size: 9px; color: #94a3b8; font-weight: bold; padding-top: 1px;">뜻</span>
                              <span style="font-size: 11px; color: #475569; font-weight: bold;">${v2.meaning}</span>
                           </div>
                           ${(v2.synonyms || v2.antonyms) ? `
                             <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #f1f5f9; display: flex; flex-wrap: wrap; gap: 8px;">
                                ${v2.synonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #3b82f6; font-weight: bold; font-size: 9px;">S</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v2.synonyms)?v2.synonyms.join(', '):v2.synonyms}</span></div>` : ''}
                                ${v2.antonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #ef4444; font-weight: bold; font-size: 9px;">A</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v2.antonyms)?v2.antonyms.join(', '):v2.antonyms}</span></div>` : ''}
                             </div>
                           ` : ''}
                        </div>
                      </div>
                      ` : ''}
                   </td>
                 </tr>
               `;
            }).join('')}
          </table>
        `;
    } else {
        // Default Analysis
        specificContent = `
        <!-- 1. 지문 구조 (제목, 주제, 요약) -->
        ${structure ? `
          <h2 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">지문 구조</h2>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
              <span style="color: #ef4444; font-weight: bold; font-size: 11px; width: 30px; padding-top: 2px;">제목</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 12px; color: #0f172a; margin-bottom: 2px;">${structure.title || "제목 정보 없음"}</div>
                <div style="font-size: 10px; color: #64748b;">${structure.titleTranslation || ""}</div>
              </div>
            </div>
            <div style="display: flex; gap: 10px; margin-bottom: 10px; border-top: 1px solid #f8fafc; padding-top: 10px;">
              <span style="color: #3b82f6; font-weight: bold; font-size: 11px; width: 30px; padding-top: 2px;">주제</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 12px; color: #0f172a; margin-bottom: 2px;">${structure.subject || "주제 정보 없음"}</div>
                <div style="font-size: 10px; color: #64748b;">${structure.subjectTranslation || ""}</div>
              </div>
            </div>
            <div style="display: flex; gap: 10px; border-top: 1px solid #f8fafc; padding-top: 10px;">
              <span style="color: #10b981; font-weight: bold; font-size: 11px; width: 30px; padding-top: 2px;">요약</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 12px; color: #0f172a; margin-bottom: 2px; line-height: 1.4;">${structure.summary || "요약 정보 없음"}</div>
                <div style="font-size: 10px; color: #64748b;">${structure.summaryTranslation || ""}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2. 배경 지식 -->
        ${backgroundKnowledge ? `
          <h2 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">배경 지식</h2>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
            <div style="font-weight: bold; font-size: 12px; color: #0f172a; margin-bottom: 5px;">${backgroundKnowledge.title}</div>
            <div style="font-size: 11px; color: #475569; line-height: 1.4;">${backgroundKnowledge.description}</div>
          </div>
        ` : ''}

        <!-- 3. 핵심 단어 -->
        ${vocabulary.length > 0 ? `
          <h2 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">핵심 단어</h2>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 11px; background: #cbd5e1; margin-bottom: 20px;">
            ${vocabulary.map((v: any, i: number) => {
               if (i % 2 !== 0) return '';
               const v2 = vocabulary[i+1];
               return `
                 <tr>
                   <td style="width: 50%; padding: 10px; vertical-align: top; background: white; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9;">
                      <div style="display: flex; align-items: flex-start;">
                        <div style="margin-right: 8px; margin-top: 4px;">
                           <div style="width: 6px; height: 6px; border-radius: 50%; border: 1px solid #cbd5e1; background: white;"></div>
                        </div>
                        <div style="flex: 1;">
                           <div style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 3px;">${v.word}</div>
                           <div style="display: flex; align-items: flex-start; gap: 4px;">
                              <span style="font-size: 9px; color: #94a3b8; font-weight: bold; padding-top: 1px;">뜻</span>
                              <span style="font-size: 11px; color: #475569; font-weight: bold;">${v.meaning}</span>
                           </div>
                           ${(v.synonyms || v.antonyms) ? `
                             <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #f1f5f9; display: flex; flex-wrap: wrap; gap: 8px;">
                                ${v.synonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #3b82f6; font-weight: bold; font-size: 9px;">S</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v.synonyms)?v.synonyms.join(', '):v.synonyms}</span></div>` : ''}
                                ${v.antonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #ef4444; font-weight: bold; font-size: 9px;">A</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v.antonyms)?v.antonyms.join(', '):v.antonyms}</span></div>` : ''}
                             </div>
                           ` : ''}
                        </div>
                      </div>
                   </td>
                   <td style="width: 50%; padding: 10px; vertical-align: top; background: white; border-bottom: 1px solid #f1f5f9;">
                      ${v2 ? `
                      <div style="display: flex; align-items: flex-start;">
                        <div style="margin-right: 8px; margin-top: 4px;">
                           <div style="width: 6px; height: 6px; border-radius: 50%; border: 1px solid #cbd5e1; background: white;"></div>
                        </div>
                        <div style="flex: 1;">
                           <div style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 3px;">${v2.word}</div>
                           <div style="display: flex; align-items: flex-start; gap: 4px;">
                              <span style="font-size: 9px; color: #94a3b8; font-weight: bold; padding-top: 1px;">뜻</span>
                              <span style="font-size: 11px; color: #475569; font-weight: bold;">${v2.meaning}</span>
                           </div>
                           ${(v2.synonyms || v2.antonyms) ? `
                             <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed #f1f5f9; display: flex; flex-wrap: wrap; gap: 8px;">
                                ${v2.synonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #3b82f6; font-weight: bold; font-size: 9px;">S</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v2.synonyms)?v2.synonyms.join(', '):v2.synonyms}</span></div>` : ''}
                                ${v2.antonyms ? `<div style="display: flex; gap: 2px; align-items: center;"><span style="color: #ef4444; font-weight: bold; font-size: 9px;">A</span><span style="color: #64748b; font-size: 9px;">${Array.isArray(v2.antonyms)?v2.antonyms.join(', '):v2.antonyms}</span></div>` : ''}
                             </div>
                           ` : ''}
                        </div>
                      </div>
                      ` : ''}
                   </td>
                 </tr>
               `;
            }).join('')}
          </table>
        ` : ''}

        ${structure && structure.sections ? `
          <h2 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">지문 구조</h2>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px; position: relative; overflow: hidden;">
            <div style="position: absolute; left: 29px; top: 15px; bottom: 15px; width: 1px; background: #ebf8ff;"></div>
            ${structure.sections.map((sec: any) => `
              <div style="display: flex; gap: 15px; margin-bottom: 15px; position: relative;">
                <div style="z-index: 10; background: white; padding: 2px 0;">
                  <div style="width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid #60a5fa; background: white;"></div>
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: bold; color: #2563eb; font-size: 10px; margin-bottom: 3px; text-transform: uppercase;">${sec.labelTranslation || sec.label}</div>
                  <div style="font-weight: bold; color: #0f172a; font-size: 12px; margin-bottom: 3px;">${sec.text || sec.content}</div>
                  <div style="font-size: 11px; color: #64748b;">${sec.translation}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- 4. 지문 읽기 -->
        <h2 style="font-size: 14px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">지문 읽기</h2>
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 20px; background: white;">
           ${parsedSentences.map((s: any, i: number) => {
               const rawText = s.original || s.analysis || (s.contentTokens ? s.contentTokens.map((t:any) => t.text).join('') : "") || "";
               const cleanText = rawText
                   .replace(/\[([^\]\/]+)(?:\/[^\]]*)?\]/g, '$1')
                   .replace(/\(\(\{/g, '').replace(/\}\)\)/g, '')
                   .replace(/<<\{/g, '').replace(/\}>>/g, '')
                   .replace(/\{\{/g, '').replace(/\}\}/g, '')
                   .replace(/\[\[\{/g, '').replace(/\}\]\]/g, '')
                   .replace(/\(\(\(\{/g, '').replace(/\}\)\)\)/g, '')
                   .replace(/\/ \/ bg/g, '')
                   .replace(/<[^>]*>/g, '')
                   .replace(/\s+/g, ' ')
                   .trim();
                   
               return `
               <div style="margin-bottom: 15px;">
                   <div style="display: flex; gap: 10px; margin-bottom: 5px;">
                       <span style="font-size: 14px; font-weight: bold; color: #93c5fd; font-family: serif; padding-top: 2px;">${String(i + 1).padStart(2, '0')}</span>
                       <div style="font-size: 13px; line-height: 1.6; font-family: 'Times New Roman', serif; color: #1e293b; font-weight: 500;">
                           ${cleanText}
                       </div>
                   </div>
                   <div style="padding-left: 35px; font-size: 11px; color: #64748b; line-height: 1.5; text-align: justify;">${s.translation || "해석 없음"}</div>
               </div>
               `;
           }).join('')}
        </div>

        <div style="page-break-before: always;"></div>
        
        <h2 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 10px; border-bottom: 2px solid #334155; padding-bottom: 5px;">구문 분석</h2>
        <style>
          .analysis-table { width: 100%; border-collapse: collapse; }
          .analysis-row { border-bottom: 1px solid #f1f5f9; }
          .num-cell { width: 40px; vertical-align: top; padding: 15px 5px 0 0; }
          .content-cell { vertical-align: top; padding: 5px 15px 15px 0; }
          .trans-cell { width: 30%; vertical-align: top; padding: 10px 0 10px 5px; }
          .num-text { font-size: 20px; font-weight: 900; color: #1e293b; font-family: 'Helvetica', sans-serif; line-height: 1; }
          .eng-text { font-size: 13px; line-height: 1.8; color: #0f172a; font-family: 'Times New Roman', serif; text-align: justify; letter-spacing: 0px; word-break: keep-all; }
          .trans-box { background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 11px; line-height: 1.6; color: #334155; text-align: justify; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
          .grammar-note { margin-top: 5px; font-size: 10px; color: #2563eb; line-height: 1.3; }
        </style>
        
        <table class="analysis-table">
        ${sentences.map((s: any, i: number) => `
          <tr class="analysis-row">
            <td class="num-cell">
              <div class="num-text">${String(i + 1).padStart(2, '0')}</div>
            </td>
            <td class="content-cell">
              <div class="eng-text">
                ${renderTokensToHtml(parsedSentences[i]?.contentTokens || [])}
              </div>
            </td>
            <td class="trans-cell">
              <div class="trans-box">
                ${s.translation || "해석 없음"}
              </div>
              ${s.grammarPoint ? `
                <div class="grammar-note">
                  <strong>Point:</strong> ${s.grammarPoint}
                </div>
              ` : ''}
            </td>
          </tr>
        `).join('')}
        </table>
        `;
    }

    const htmlContent = `
      <div style="font-family: 'Malgun Gothic', sans-serif; padding: 15px; color: #333; background: white;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #1a365d; padding-bottom: 10px;">
          <h1 style="font-size: 20px; color: #1a365d; margin: 0; font-weight: bold;">${title}</h1>
          <p style="font-size: 10px; color: #666; margin-top: 5px;">${type === 'variant' ? '변형문제' : type === 'workbook' ? '워크북' : type === 'word' ? '단어장' : '분석 보고서'} | 생성일: ${new Date().toLocaleDateString()}</p>
        </div>
        ${specificContent}
      </div>
    `;

    const worker = document.createElement('div');
    worker.innerHTML = htmlContent;
    document.body.appendChild(worker);

    const opt = {
      margin: [5, 5],
      filename: `${title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    // @ts-ignore
    html2pdf().from(worker).set(opt).save().then(() => {
      document.body.removeChild(worker);
    });
  };

  const downloadHwpx = (analysis: any, title: string) => {
    if (!analysis) return;

    // Use shared parser
    const parsedSentences = transformToAnalyzedSentences(analysis.sentences || []);

    // Helper for HWPX HTML - Token Based
    const renderTokensToHwpx = (tokens: any[]) => {
        let html = '';
        const bgStack: string[] = [];
        
        // Use simpler colors for HWPX to ensure compatibility
        const bgColors: Record<string, string> = {
            'clause-blue': '#eff6ff',   // bg-blue-50
            'clause-green': '#f0fdf4',  // bg-green-50
            'clause-orange': '#fff7ed', // bg-orange-50
            'clause-purple': '#faf5ff', // bg-purple-50
            'clause-pink': '#fdf2f8',   // bg-pink-50
        };

        if (!tokens) return "";

        tokens.forEach((token: any) => {
            if (token.type.endsWith('-open')) {
                bgStack.push(bgColors[token.type.replace('-open', '')] || '#f8fafc');
            }

            const currentBg = bgStack.length > 0 ? bgStack[bgStack.length - 1] : 'transparent';
            
                // HWPX Style: Reduced font size and line height as requested
            // Changed Times New Roman to Malgun Gothic for better readability as requested
            let style = `font-size: 10pt; font-family: 'Malgun Gothic', 'Dotum', sans-serif; color: #000; line-height: 1.4;`;
            
            // HWP highlight: Use simple background color as fallback or solid color
            if (currentBg !== 'transparent') {
                style += `background-color: ${currentBg};`;
            }

            let content = token.text;
            let noteHtml = '';

            // Handle Styles
            if (token.type.includes('bracket-') || (token.type.includes('clause-') && (token.text === '[' || token.text === ']'))) {
                const color = token.type.includes('blue') ? '#2563eb' : 
                              token.type.includes('green') ? '#10b981' : 
                              token.type.includes('orange') ? '#f97316' : 
                              token.type.includes('purple') ? '#9333ea' : '#db2777';
                style += `color: ${color}; font-weight: bold; font-family: 'Arial', sans-serif;`;
            } 
            else if (token.type.includes('highlight-') || token.type.includes('underline-')) {
                const color = token.type.includes('red') ? '#ef4444' : '#2563eb';
                style += `color: ${color}; font-weight: bold; border-bottom: 2px solid ${color};`;
            }
            else if (token.type === 'bold') {
                style += `font-weight: bold;`;
            }
            else if (token.type === 'box-red' || token.type === 'box-green') {
                const color = token.type.includes('red') ? '#ef4444' : '#16a34a';
                style += `border: 2px solid ${color}; padding: 0 1px; font-weight: bold;`;
            }
            else if (token.type === 'oval-orange') {
                style += `border: 2px solid #f97316; border-radius: 10px; padding: 0 2px; font-weight: bold;`;
            }
            else if (token.type === 'bg-soft') {
                style += `background-color: #fff9c4;`;
            }

            // Handle Note (Vertical Stack) - Ensure it's below
            if (token.note) {
                const noteColor = token.type.includes('red') ? '#ef4444' : '#64748b';
                
                // Reduced margin and font size for notes
                noteHtml = `<span style="display: block; font-size: 6pt; color: ${noteColor}; text-align: center; margin-top: 0; line-height: 1.2;">${token.note}</span>`;
                
                // Use inline-block to keep words together, with note stacked below
                // Changed div to span to prevent forced line breaks in HWPX viewers
                html += `<span style="display: inline-block; vertical-align: top; margin: 0 2pt 0 0; text-align: center; white-space: normal;">
                           <span style="display: block; ${style} border-bottom: 1px solid ${token.type.includes('red') ? '#ef4444' : '#2563eb'}; padding-bottom: 0;">${content}</span>
                           ${noteHtml}
                         </span>`;
            } else {
                html += `<span style="${style} margin-right: 2pt;">${content}</span>`;
            }

            if (token.type.endsWith('-close')) {
                bgStack.pop();
            }
        });
        return html;
    };
    
    const sentences = analysis.sentences || [];
    const structure = analysis.structure || {};
    const backgroundKnowledge = analysis.backgroundKnowledge;
    const vocabulary = analysis.vocabulary || [];

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>
      <style>
        @page { size: 210mm 297mm; margin: 10mm 5mm 10mm 5mm; }
        body { font-family: 'Malgun Gothic', 'Dotum', sans-serif; margin: 0; padding: 0; }
        .wrapper { width: 180mm; margin: 0 auto; }
        .title { font-size: 18pt; font-weight: bold; text-align: center; margin-bottom: 20pt; }
        .section-header { font-size: 11pt; font-weight: bold; color: #1e293b; margin-top: 10pt; margin-bottom: 5pt; border-bottom: 1.5pt solid #334155; padding-bottom: 3pt; }
        .card { border: 1pt solid #e2e8f0; padding: 5pt; margin-bottom: 5pt; border-radius: 6pt; }
        .label { font-size: 9pt; font-weight: bold; width: 35pt; }
        .red { color: #ef4444; } .blue { color: #3b82f6; } .green { color: #10b981; }
        .content-title { font-size: 10pt; font-weight: bold; color: #0f172a; margin-bottom: 2pt; }
        .content-sub { font-size: 8pt; color: #64748b; }
        .vocab-grid { width: 180mm; border-collapse: collapse; table-layout: fixed; }
        .vocab-cell { border: 1pt solid #e2e8f0; padding: 3pt; vertical-align: top; word-break: break-all; }
        .sentence-box { border: 1pt solid #e2e8f0; margin-bottom: 15pt; }
        .sentence-header { padding: 4pt; border-bottom: 1pt solid #e2e8f0; color: #3b82f6; font-weight: bold; font-size: 9pt; }
        .sentence-body { padding: 5pt; }
        .original { font-size: 10pt; margin-bottom: 5pt; font-family: 'Malgun Gothic', 'Dotum', sans-serif; line-height: 1.5; text-align: justify; word-break: break-all; }
        .translation { background: #f8fafc; padding: 5pt; font-size: 9pt; color: #334155; margin-bottom: 5pt; word-break: break-all; }
        .grammar { border-top: 1pt solid #f1f5f9; padding-top: 8pt; font-size: 9pt; color: #2563eb; }
      </style>
      </head>
      <body>
      <div class="wrapper">
        <div class="title">${title}</div>
        
        ${structure ? `
          <div class="section-header">지문 구조</div>
          <div class="card">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td class="label red" valign="top">제목</td>
                <td>
                  <div class="content-title">${structure.title || "제목 정보 없음"}</div>
                  <div class="content-sub">${structure.titleTranslation || ""}</div>
                </td>
              </tr>
              <tr><td colspan="2" height="4"></td></tr>
              <tr>
                <td class="label blue" valign="top">주제</td>
                <td>
                  <div class="content-title">${structure.subject || "주제 정보 없음"}</div>
                  <div class="content-sub">${structure.subjectTranslation || ""}</div>
                </td>
              </tr>
              <tr><td colspan="2" height="4"></td></tr>
              <tr>
                <td class="label green" valign="top">요약</td>
                <td>
                  <div class="content-title">${structure.summary || "요약 정보 없음"}</div>
                  <div class="content-sub">${structure.summaryTranslation || ""}</div>
                </td>
              </tr>
            </table>
          </div>
        ` : ''}

        ${backgroundKnowledge ? `
          <div class="section-header">배경 지식</div>
          <div class="card">
            <div class="content-title">${backgroundKnowledge.title}</div>
            <div class="content-sub" style="font-size: 9pt; margin-top: 4pt;">${backgroundKnowledge.description}</div>
          </div>
        ` : ''}

        ${vocabulary.length > 0 ? `
          <div class="section-header">핵심 단어</div>
          <table class="vocab-grid">
            <colgroup>
              <col style="width: 90mm;" />
              <col style="width: 90mm;" />
            </colgroup>
            ${vocabulary.map((v: any, i: number) => i % 2 === 0 ? `
              <tr>
                <td class="vocab-cell">
                   <div style="margin-bottom: 2pt;">
                     <span style="font-size: 10pt; font-weight: bold; color: #0f172a;">${v.word}</span>
                   </div>
                   <div style="margin-bottom: 2pt;">
                     <span style="font-size: 8pt; color: #94a3b8; font-weight: bold; margin-right: 3pt;">뜻</span>
                     <span style="font-size: 9pt; color: #475569; font-weight: bold;">${v.meaning}</span>
                   </div>
                   ${(v.synonyms || v.antonyms) ? `
                     <div style="border-top: 1pt dashed #cbd5e0; padding-top: 2pt; margin-top: 2pt;">
                       ${v.synonyms ? `<div style="font-size: 8pt;"><span style="color: #3b82f6; font-weight: bold;">S</span> <span style="color: #64748b;">${Array.isArray(v.synonyms)?v.synonyms.join(', '):v.synonyms}</span></div>` : ''}
                       ${v.antonyms ? `<div style="font-size: 8pt;"><span style="color: #ef4444; font-weight: bold;">A</span> <span style="color: #64748b;">${Array.isArray(v.antonyms)?v.antonyms.join(', '):v.antonyms}</span></div>` : ''}
                     </div>
                   ` : ''}
                </td>
                ${vocabulary[i+1] ? `
                <td class="vocab-cell">
                   <div style="margin-bottom: 2pt;">
                     <span style="font-size: 10pt; font-weight: bold; color: #0f172a;">${vocabulary[i+1].word}</span>
                   </div>
                   <div style="margin-bottom: 2pt;">
                     <span style="font-size: 8pt; color: #94a3b8; font-weight: bold; margin-right: 3pt;">뜻</span>
                     <span style="font-size: 9pt; color: #475569; font-weight: bold;">${vocabulary[i+1].meaning}</span>
                   </div>
                   ${(vocabulary[i+1].synonyms || vocabulary[i+1].antonyms) ? `
                     <div style="border-top: 1pt dashed #cbd5e0; padding-top: 2pt; margin-top: 2pt;">
                       ${vocabulary[i+1].synonyms ? `<div style="font-size: 8pt;"><span style="color: #3b82f6; font-weight: bold;">S</span> <span style="color: #64748b;">${Array.isArray(vocabulary[i+1].synonyms)?vocabulary[i+1].synonyms.join(', '):vocabulary[i+1].synonyms}</span></div>` : ''}
                       ${vocabulary[i+1].antonyms ? `<div style="font-size: 8pt;"><span style="color: #ef4444; font-weight: bold;">A</span> <span style="color: #64748b;">${Array.isArray(vocabulary[i+1].antonyms)?vocabulary[i+1].antonyms.join(', '):vocabulary[i+1].antonyms}</span></div>` : ''}
                     </div>
                   ` : ''}
                </td>` : '<td class="vocab-cell"></td>'}
              </tr>
            ` : '').join('')}
          </table>
        ` : ''}

        ${structure && structure.sections ? `
          <div class="section-header">지문 구조</div>
          <div class="card">
          ${structure.sections.map((sec: any) => `
            <div style="margin-bottom: 8pt; border-left: 2pt solid #cbd5e0; padding-left: 6pt;">
              <div style="font-weight: bold; color: #3b82f6; font-size: 9pt; margin-bottom: 1pt;">${sec.labelTranslation || sec.label}</div>
              <div style="font-weight: bold; color: #0f172a; font-size: 10pt; margin-bottom: 1pt; line-height: 1.3;">${sec.text || sec.content}</div>
              <div style="font-size: 9pt; color: #64748b; line-height: 1.3;">${sec.translation}</div>
            </div>
          `).join('')}
          </div>
        ` : ''}

        <div class="section-header">지문 읽기</div>
        <div class="card">
           ${parsedSentences.map((s: any, i: number) => {
               const rawText = s.original || s.analysis || (s.contentTokens ? s.contentTokens.map((t:any) => t.text).join('') : "") || "";
               const cleanText = rawText
                   .replace(/\[([^\]\/]+)(?:\/[^\]]*)?\]/g, '$1')
                   .replace(/\(\(\{/g, '').replace(/\}\)\)/g, '')
                   .replace(/<<\{/g, '').replace(/\}>>/g, '')
                   .replace(/\{\{/g, '').replace(/\}\}/g, '')
                   .replace(/\[\[\{/g, '').replace(/\}\]\]/g, '')
                   .replace(/\(\(\(\{/g, '').replace(/\}\)\)\)/g, '')
                   .replace(/\/ \/ bg/g, '')
                   .replace(/<[^>]*>/g, '')
                   .replace(/\s+/g, ' ')
                   .trim();
                   
               return `
               <div style="margin-bottom: 10pt;">
                   <div style="margin-bottom: 4pt;">
                       <span style="font-size: 11pt; font-weight: bold; color: #3b82f6; margin-right: 5pt; font-family: serif;">${String(i + 1).padStart(2, '0')}</span>
                       <span style="font-size: 10pt; line-height: 1.5; font-family: 'Malgun Gothic', 'Dotum', sans-serif; color: #000; font-weight: 500;">
                           ${cleanText}
                       </span>
                   </div>
                   <div style="padding-left: 20pt; font-size: 9pt; color: #334155; line-height: 1.4; text-align: justify;">${s.translation || "해석 없음"}</div>
               </div>
               `;
           }).join('')}
        </div>

        <br clear="all" style="page-break-before:always" />

        <div class="section-header">구문 분석</div>
        <table style="width: 150mm; border-collapse: collapse; table-layout: fixed;">
        <colgroup>
          <col style="width: 10mm;" />
          <col style="width: 100mm;" />
          <col style="width: 40mm;" />
        </colgroup>
        ${sentences.map((s: any, i: number) => `
          <tr style="border-bottom: 1px dashed #e2e8f0;">
            <td style="width: 10mm; vertical-align: top; padding: 5pt 1pt 5pt 0;">
              <div style="font-size: 14pt; font-weight: bold; color: #1e293b; text-align: center;">${String(i + 1).padStart(2, '0')}</div>
            </td>
            <td style="width: 100mm; vertical-align: top; padding: 5pt 1pt 5pt 2pt; word-break: break-all;">
              <div class="original" style="font-size: 10pt; line-height: 1.6; font-family: 'Times New Roman'; text-align: justify; word-break: break-all;">
                ${renderTokensToHwpx(parsedSentences[i]?.contentTokens || [])}
              </div>
            </td>
            <td style="width: 40mm; vertical-align: top; padding: 5pt 0 5pt 1pt; word-break: break-all;">
              <div class="translation" style="background: #f8fafc; padding: 6pt; border: 1pt solid #cbd5e0; border-radius: 4pt; font-size: 8pt; color: #334155; line-height: 1.4; word-break: break-all;">
                ${s.translation || "해석 없음"}
              </div>
              ${s.grammarPoint ? `
                <div style="margin-top: 6pt; font-size: 8pt; color: #2563eb; line-height: 1.3; background: #eff6ff; padding: 4pt; border-radius: 2pt;">
                  <strong>Point:</strong> ${s.grammarPoint}
                </div>
              ` : ''}
            </td>
          </tr>
          `).join('')}
        </table>
      </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.hwpx`;
    link.click();
  };

  // 커리큘럼 파싱 - curriculumItems가 있으면 그것을 사용, 없으면 문자열 파싱
  const parsedCurriculum = useMemo(() => {
    if (!course) return [];

    if (course.curriculumItems && course.curriculumItems.length > 0) {
      return course.curriculumItems.map((item: any, index: number) => ({
        week: index + 1,
        title: item.title || `${index + 1}차시`,
        topics: item.description ? [item.description] : [],
        duration: item.duration || "3시간",
        videos: item.videos || [],
        quizzes: item.quizzes || [],
        analysisMaterials: item.analysisMaterials || [],
      }));
    }

    if (course.curriculum) {
      try {
        // JSON 형태인 경우 파싱 시도
        let jsonData = JSON.parse(course.curriculum);
        
        // 이중으로 문자열화된 경우 처리 (예: "{\"title\":...}")
        if (typeof jsonData === 'string') {
            try { jsonData = JSON.parse(jsonData); } catch(e) {}
        }

        // 1. 배열 형태인 경우
        if (Array.isArray(jsonData)) {
          return jsonData.map((item: any, index: number) => ({
            week: index + 1,
            title: item.title || item.chapter || `${index + 1}차시`,
            topics: item.topics || [],
            duration: item.duration || "1시간",
            videos: item.videos || [],
            quizzes: item.quizzes || [],
            analysisMaterials: item.analysisMaterials || [],
          }));
        }

        // 2. 단일 객체 형태 (이미지에 보이는 구조: { title, tableOfContents, ... })
        if (jsonData.tableOfContents && Array.isArray(jsonData.tableOfContents)) {
          return jsonData.tableOfContents.map((item: any, index: number) => ({
            week: index + 1,
            title: item.chapter || item.title || `${index + 1}차시`,
            topics: [],
            duration: item.duration || "1시간",
            videos: [],
            quizzes: [],
            analysisMaterials: index === 0 && (jsonData.sentences || jsonData.vocabulary || jsonData.content) ? [{
              id: "content-data",
              title: (course.type === "workbook" || course.title?.includes("워크북") || jsonData.type === "workbook") ? "워크북" : 
                     (course.type === "word" || course.title?.includes("단어장") || jsonData.type === "word") ? "단어장" : 
                     (jsonData.questions && jsonData.questions.length > 0) ? "변형문제" : "문장 분석",
              type: (course.type === "workbook" || course.title?.includes("워크북") || jsonData.type === "workbook") ? "workbook" : 
                    (course.type === "word" || course.title?.includes("단어장") || jsonData.type === "word") ? "word" : 
                    (jsonData.questions && jsonData.questions.length > 0) ? "variant" : "analysis",
              content: jsonData.sentences || jsonData.content || [],
              sentences: jsonData.sentences || jsonData.content || [],
              vocabulary: jsonData.vocabulary || [],
              questions: jsonData.questions || [],
              structure: jsonData.structure ? {
                ...jsonData.structure,
                // Fallback translations for Universal Design example
                titleTranslation: jsonData.structure.titleTranslation || (jsonData.structure.title?.includes("Universal Design") ? "유니버설 디자인: 모두를 위한 디자인" : ""),
                subjectTranslation: jsonData.structure.subjectTranslation || (jsonData.structure.subject?.includes("inclusive society") ? "모두를 위한 포용적인 사회를 만들기 위한 유니버설 디자인의 개념과 적용" : ""),
                summaryTranslation: jsonData.structure.summaryTranslation || (jsonData.structure.summary?.includes("aims to create") ? "유니버설 디자인은 모든 사람이 사용할 수 있는 제품과 환경을 만드는 것을 목표로 하며, 건축과 교통 분야에서의 그 적용은 소수자뿐만 아니라 공동체 전체에 이익을 준다." : ""),
                sections: jsonData.structure.sections?.map((s: any) => ({
                  ...s,
                  translation: s.translation || (
                    s.content?.includes("majority") ? "주로 다수를 위해 설계된 사회는 '정상' 범주에 속하지 않는 소수자들에게 불가피한 불편함을 야기한다." : 
                    s.content?.includes("principle") ? "유니버설 디자인은 모든 사람이 자신의 능력과 관계없이 접근하고 사용할 수 있는 제품과 환경을 만드는 것을 옹호하는 원칙이다." :
                    s.content?.includes("Concrete examples") ? "유니버설 디자인의 구체적인 사례는 건축, 교통, 패션과 같은 다양한 분야에서 발견되며 모두를 위한 접근성을 향상시킨다." :
                    s.content?.includes("necessary to implement") ? "더 넓은 범위의 사람들을 위해 더 공평하고 포용적인 사회를 건설하기 위해서는 유니버설 디자인을 더욱 광범위하게 실행할 필요가 있다." : ""
                  ),
                  labelTranslation: s.labelTranslation || (
                    s.label === "INTRO" ? "문제" : 
                    s.label === "ARGUMENT" ? "주장" : 
                    s.label === "EXAMPLE" ? "예시" : 
                    s.label === "SUGGESTION" ? "제언" : 
                    s.label
                  )
                }))
              } : undefined, // Add structure with robust fallbacks
              backgroundKnowledge: jsonData.backgroundKnowledge // Add background knowledge
            }] : [],
          }));
        }

        // 3. 기타 객체 형태 (단일 분석 자료, 단어장, 워크북 등)
        if (jsonData.vocabulary || jsonData.questions || jsonData.content || jsonData.sentences) {
          return [{
            week: 1,
            title: jsonData.title || "학습 자료",
            topics: [],
            duration: "1시간",
            videos: [],
            quizzes: [],
            analysisMaterials: [{
              id: "single-material",
              title: jsonData.title || "학습 자료",
              ...jsonData,
              content: jsonData.sentences || jsonData.content || [],
              sentences: jsonData.sentences || jsonData.content || [],
              type: (() => {
                if (jsonData.questions && jsonData.questions.length > 0) return "variant";
                if (jsonData.title?.includes("워크북") || (jsonData.type === "workbook")) return "workbook";
                if (jsonData.title?.includes("단어장") || (jsonData.type === "word")) return "word";
                // Analysis has sentences (and usually vocabulary). Word List has vocabulary ONLY.
                if ((jsonData.sentences && jsonData.sentences.length > 0) || (jsonData.content && jsonData.content.length > 0)) return "analysis"; 
                if (jsonData.vocabulary) return "word";
                return "analysis";
              })()
            }]
          }];
        }

        // 4. 그 외 기본 형태
        return [{
          week: 1,
          title: jsonData.title || "기본 차시",
          topics: [],
          duration: "1시간",
          videos: [],
          quizzes: [],
          analysisMaterials: [],
        }];
      } catch (e) {
        // JSON 파싱 실패 시 (잘린 JSON 등) 처리
        const rawText = course.curriculum.trim();
        
        // 1. JSON 수리(Repair) 시도
        let repairedJson = null;
        if (rawText.startsWith('{') || rawText.startsWith('[')) {
            try {
                // 스택 기반으로 닫히지 않은 괄호/따옴표 닫기
                const stack: string[] = [];
                let inString = false;
                let isEscaped = false;
                
                for (let i = 0; i < rawText.length; i++) {
                    const char = rawText[i];
                    if (inString) {
                        if (char === '\\' && !isEscaped) isEscaped = true;
                        else if (char === '"' && !isEscaped) inString = false;
                        else isEscaped = false;
                    } else {
                        if (char === '"') inString = true;
                        else if (char === '{') stack.push('}');
                        else if (char === '[') stack.push(']');
                        else if (char === '}' || char === ']') {
                            if (stack.length > 0 && stack[stack.length-1] === char) stack.pop();
                        }
                    }
                }
                
                let repaired = rawText;
                if (inString) repaired += '"'; // 닫히지 않은 문자열 닫기
                while (stack.length > 0) repaired += stack.pop(); // 남은 괄호 닫기
                
                repairedJson = JSON.parse(repaired);
            } catch (repairErr) {
                console.log("JSON Repair failed:", repairErr);
            }
        }

        // 2. 수리된 JSON 사용
        if (repairedJson) {
             const parsed = repairedJson;
             // 단일 객체인 경우 배열로 감싸기 처리 등 필요할 수 있음
             // 여기서는 구조에 맞춰 데이터 추출
             
             // 타입 추론
             const type = (() => {
                if (parsed.questions && parsed.questions.length > 0) return "variant";
                if (parsed.title?.includes("워크북") || parsed.type === "workbook") return "workbook";
                if (parsed.title?.includes("단어장") || parsed.type === "word") return "word";
                if (parsed.vocabulary && !parsed.sentences) return "word";
                return "analysis";
             })();

             return [{
                week: 1,
                title: parsed.title || "학습 자료",
                topics: [],
                duration: "1시간",
                videos: [],
                quizzes: [],
                analysisMaterials: [{
                    id: "repaired-material",
                    title: parsed.title || (type === "workbook" ? "워크북" : "학습 자료"),
                    ...parsed,
                    type: type,
                    content: parsed.sentences || parsed.content || [],
                    sentences: parsed.sentences || parsed.content || [],
                    vocabulary: parsed.vocabulary || [],
                    questions: parsed.questions || []
                }]
             }];
        }

        // 3. 수리 실패 시: 텍스트에서 타입 추론하여 Raw Text 표시
        // JSON 문자열이라도 타입 정보가 텍스트로 포함되어 있을 수 있음
        let inferredType = "analysis";
        if (rawText.includes('"type":"workbook"') || rawText.includes('워크북')) inferredType = "workbook";
        else if (rawText.includes('"type":"word"') || rawText.includes('단어장')) inferredType = "word";
        else if (rawText.includes('"questions":') || rawText.includes('변형문제')) inferredType = "variant";

        if (rawText.startsWith('{') || rawText.startsWith('[')) {
             return [{
                week: 1,
                title: "학습 자료",
                topics: [],
                duration: "1시간",
                videos: [],
                quizzes: [],
                analysisMaterials: [{
                    id: "fallback-raw",
                    title: "학습 자료 (손상됨)",
                    type: inferredType,
                    content: [rawText], 
                    sentences: [rawText]
                }]
             }];
        }

        // JSON이 아닌 경우 기존처럼 줄바꿈으로 분리
        return course.curriculum
          .split("\n")
          .filter((line: string) => line.trim())
          .map((line: string, index: number) => {
            let materialFromLine = null;
            let parsed = null;
            
            // 1. Try regular JSON parse
            try {
               if (line.trim().startsWith('{')) {
                  parsed = JSON.parse(line.trim());
               } else if (line.trim().startsWith('"') && line.trim().endsWith('"')) {
                  // Handle double stringified JSON (e.g. "{\"title\":...}")
                  try {
                    const unquoted = JSON.parse(line.trim());
                    if (typeof unquoted === 'string' && unquoted.startsWith('{')) {
                        parsed = JSON.parse(unquoted);
                    } else if (typeof unquoted === 'object') {
                        parsed = unquoted;
                    }
                  } catch(e2) {}
               }
            } catch (err) {
                // JSON parse failed. Try to salvage if it looks like JSON.
                // Fallback: Use Regex to extract title if possible
                if (line.trim().startsWith('{') && line.includes('"title":')) {
                    const titleMatch = line.match(/"title"\s*:\s*"([^"]+)"/);
                    if (titleMatch && titleMatch[1]) {
                        materialFromLine = {
                            id: `mat-${index}-fallback`,
                            title: titleMatch[1],
                            type: "analysis" // Default to analysis if we can't parse structure
                        };
                    }
                }
            }

            // 2. If successfully parsed, construct material object
            if (parsed && (parsed.vocabulary || parsed.sentences || parsed.questions || parsed.title)) {
                 materialFromLine = {
                   id: `mat-${index}`,
                   title: parsed.title || "학습 자료",
                   ...parsed,
                   type: (() => {
                    // Explicit type check
                    if (parsed.type && parsed.type !== "analysis") return parsed.type;
                    
                    // Inference
                    if (parsed.questions && parsed.questions.length > 0) return "variant";
                    if (parsed.title?.includes("워크북") || (parsed.sentences && parsed.type === "workbook")) return "workbook";
                    if ((parsed.sentences && parsed.sentences.length > 0) || (parsed.content && parsed.content.length > 0)) return "analysis"; 
                    if (parsed.vocabulary) return "word";
                    return "analysis";
                  })()
                 };
            }

            return {
              week: index + 1,
              title: materialFromLine ? (materialFromLine.title || `${index + 1}차시`) : line.trim(),
              topics: [],
              duration: "1시간",
              analysisMaterials: materialFromLine ? [materialFromLine] : [],
              videos: index === 0 ? [
                {
                  id: `video-${index}-1`,
                  title: "무료 맛보기 영상",
                  url: "dQw4w9WgXcQ",
                  duration: "10분",
                  type: "youtube",
                }
              ] : [],
              quizzes: [],
            };
          });
      }
    }

    return [];
  }, [course?.curriculum, course?.curriculumItems]);

  // 이미지 URL 처리 함수
  const getImageUrl = (
    imageUrl: string | null | undefined,
    fallbackImage: string = "/uploads/images/1.jpg",
  ) => {
    // 실제 업로드된 이미지가 있고 placeholder가 아닌 경우
    // readdy.ai 체크 제거 (사용자가 원할 수 있음)
    if (
      imageUrl &&
      imageUrl !== "/api/placeholder/400/250"
    ) {
      return imageUrl;
    }
    // 샘플 이미지 사용
    return fallbackImage;
  };


    const renderMaterialContent = (material: any, isPreview: boolean = false) => {
      // 1. Detect Type
      let type = material.type || "analysis";
      
      // Determine type more robustly based on content availability
      if (material.questions && material.questions.length > 0) {
        type = "variant";
      } else if (material.title?.includes("워크북") || (material.sentences && material.type === "workbook")) {
        type = "workbook";
      } else if ((material.sentences && material.sentences.length > 0) || (material.content && material.content.length > 0)) {
        // If sentences/content exist, it is likely Analysis (or Workbook if title matched above)
        // Ensure we don't accidentally label it as 'word' just because it has vocabulary
        type = type === "workbook" ? "workbook" : "analysis";
      } else if (material.vocabulary && material.vocabulary.length > 0) {
        // Only if NO sentences/content are present, default to 'word'
        type = "word";
      } else if (material.title?.includes("단어장")) {
        type = "word";
      } else if (material.title?.includes("변형문제")) {
        type = "variant";
      }

      // Force type if it was explicitly set in parsedCurriculum
      if (material.type && material.type !== "analysis") {
         type = material.type;
      }

      // 2. Render Variant
      if (type === "variant") {
        const questions = material.questions || [];
        const displayQuestions = isPreview ? questions.slice(0, 2) : questions;

        return (
          <div className="w-full">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-8">
                <div><h2 className="text-xl font-black tracking-tight text-slate-900">{material.title || "변형문제"}</h2></div>
                <div className="text-right"><span className="text-2xl font-black text-[#FF4081]">inno</span></div>
              </div>
              <div className="columns-1 md:columns-2 gap-10 [column-fill:_balance]">
                {displayQuestions.map((q: any, idx: number) => (
                  <div key={idx} className="break-inside-avoid mb-8">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-lg font-extrabold text-slate-900 leading-none">{idx + 1}.</span>
                      <h4 className="text-[13px] font-bold text-slate-900 leading-tight pt-0.5">{q.question}</h4>
                    </div>
                    {q.passage && q.passage.trim().length > 0 && (
                      <div className="border border-slate-200 p-3 mb-3 text-[11px] leading-relaxed text-justify bg-white rounded-sm whitespace-pre-wrap">{q.passage}</div>
                    )}
                    <div className="space-y-1.5 pl-1">
                      {q.choices?.map((choice: string, cIdx: number) => (
                        <div key={cIdx} className="flex gap-2 text-[11px] items-start">
                          <span className="w-4 text-center shrink-0 font-medium text-slate-500">{["①", "②", "③", "④", "⑤"][cIdx]}</span>
                          <span className="text-slate-700 leading-tight">{choice}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {!isPreview && (
                <div className="mt-12 pt-8 border-t-2 border-slate-900">
                   <h3 className="text-lg font-bold mb-6">정답 및 해설</h3>
                   <div className="columns-2 gap-10 [column-fill:_balance]">
                     {questions.map((q: any, idx: number) => (
                       <div key={idx} className="break-inside-avoid border-b border-slate-100 pb-4 mb-4">
                         <div className="flex gap-3 mb-2">
                           <span className="text-sm font-black text-slate-900">{idx + 1}.</span>
                           <span className="text-sm font-bold text-blue-600">정답: {q.answer}</span>
                         </div>
                         <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded text-justify">{q.explanation || "해설이 없습니다."}</p>
                       </div>
                     ))}
                  </div>
                </div>
              )}
          </div>
        );
      } 
      
      // 3. Render Workbook (Isolated Logic)
      else if (type === "workbook") {
        let rawSentences = material.sentences || material.content || [];
        
        // Robust Parsing for Workbook Data
        if (typeof rawSentences === 'string') {
             try { rawSentences = JSON.parse(rawSentences); } catch(e) { rawSentences = []; }
        }
        // Handle Double Stringification
        if (typeof rawSentences === 'string') {
             try { rawSentences = JSON.parse(rawSentences); } catch(e) { rawSentences = []; }
        }
        if (!Array.isArray(rawSentences)) rawSentences = [];

        const displaySentences = isPreview ? rawSentences.slice(0, 3) : rawSentences;
        const analyzedDisplaySentences = transformToAnalyzedSentences(displaySentences);

        return (
             <div className="w-full space-y-8">
                {material.structure && (
                   <div className="mb-6">
                 <h3 className="text-sm font-bold text-slate-900 mb-3">지문 구조</h3>
                 <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
                       <div className="flex gap-4 items-start">
                         <span className="text-red-500 font-bold w-10 shrink-0 text-xs pt-0.5">제목</span>
                         <div className="flex-1">
                           <h4 className="font-bold text-slate-900 text-sm leading-tight">{material.structure.title}</h4>
                           <p className="text-slate-500 text-[11px] mt-1">{material.structure.titleTranslation}</p>
                         </div>
                       </div>
                       <div className="flex gap-4 items-start border-t border-slate-50 pt-3">
                         <span className="text-blue-500 font-bold w-10 shrink-0 text-xs pt-0.5">주제</span>
                         <div className="flex-1">
                           <h4 className="font-bold text-slate-900 text-sm leading-snug">{material.structure.subject || "주제 정보 없음"}</h4>
                           <p className="text-slate-500 text-[11px] mt-1">{material.structure.subjectTranslation}</p>
                         </div>
                       </div>
                       <div className="flex gap-4 items-start border-t border-slate-50 pt-3">
                         <span className="text-emerald-500 font-bold w-10 shrink-0 text-xs pt-0.5">요약</span>
                         <div className="flex-1">
                           <h4 className="font-bold text-slate-900 text-[13px] leading-relaxed">{material.structure.summary || "요약 정보 없음"}</h4>
                           <p className="text-slate-500 text-[11px] mt-1">{material.structure.summaryTranslation}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}

                 {material.backgroundKnowledge && (
                   <div className="mb-6">
                     <h3 className="text-sm font-bold text-slate-900 mb-3">배경 지식</h3>
                     <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                       <h4 className="font-bold text-slate-900 text-sm mb-2">{material.backgroundKnowledge.title}</h4>
                       <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{material.backgroundKnowledge.description}</p>
                     </div>
                   </div>
                 )}

                <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6">
                  <h4 className="font-bold text-slate-900 mb-2">1. 어휘 선택</h4>
                  {analyzedDisplaySentences.map((s: any, i: number) => (
                    <div key={`vocab-${i}`} className="text-[15px] leading-relaxed font-serif text-slate-800">
                      <span className="text-xs font-bold text-blue-400 mr-2">{String(i + 1).padStart(2, '0')}</span>
                      {s.contentTokens && s.contentTokens.length > 0 ? (
                        s.contentTokens.map((token: any, tIdx: number) => {
                          if (token.type === 'text') return <span key={tIdx}>{token.text}</span>;
                          if (token.type.includes('clause-')) return null;
                          if ((token.type.includes('highlight-blue') || token.type.includes('box-blue') || token.noteColor === 'text-blue-500') && token.text.trim().length > 1) {
                            let distractor = token.note?.split('≠')[1]?.trim() || "???";
                            return <span key={tIdx} className="font-bold mx-1">[{token.text} / {distractor}]</span>;
                          }
                          return <span key={tIdx}>{token.text}</span>;
                        })
                      ) : (
                        // Fallback if tokens are empty
                        <span>{s.original || s.analysis || JSON.stringify(s)}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6">
                  <h4 className="font-bold text-slate-900 mb-2">2. 어법 선택</h4>
                  {analyzedDisplaySentences.map((s: any, i: number) => (
                    <div key={`grammar-${i}`} className="text-[15px] leading-relaxed font-serif text-slate-800">
                      <span className="text-xs font-bold text-blue-400 mr-2">{String(i + 1).padStart(2, '0')}</span>
                      {s.contentTokens && s.contentTokens.length > 0 ? (
                        s.contentTokens.map((token: any, tIdx: number) => {
                          if (token.type === 'text') return <span key={tIdx}>{token.text}</span>;
                          if (token.type.includes('clause-')) return null;
                          if (token.type === 'ox' || token.type.includes('red')) {
                             return <span key={tIdx} className="font-bold mx-1">[{token.text} / {token.note?.replace('(X)', '') || 'wrong'}]</span>;
                          }
                          return <span key={tIdx}>{token.text}</span>;
                        })
                      ) : (
                        <span>{s.original || s.analysis}</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6">
                  <h4 className="font-bold text-slate-900 mb-2">3. 동사형 바꾸기</h4>
                  {analyzedDisplaySentences.map((s: any, i: number) => (
                    <div key={`verb-${i}`} className="border-b border-gray-100 pb-4 last:border-0">
                       <div className="flex gap-2 items-center mb-1">
                          <span className="text-lg font-bold text-slate-400">{String(i + 1).padStart(2, '0')}</span>
                          {(s.tags?.includes('주제문') || s.tags?.includes('서술형')) && <span className="bg-green-500 text-white text-[9px] px-1 rounded">중요</span>}
                          <p className="text-xs text-slate-600">{s.translation}</p>
                       </div>
                       <p className="text-[15px] leading-loose font-serif text-slate-800 bg-gray-50 p-3 rounded">
                          {s.contentTokens && s.contentTokens.length > 0 ? (
                            s.contentTokens.map((token: any, tIdx: number) => {
                              if (token.type.includes('clause-')) return null;
                              if (token.type === 'verb' || (token.type.includes('green'))) {
                                 return <span key={tIdx} className="font-bold mx-1">({token.note || token.text})</span>;
                              }
                              return <span key={tIdx}>{token.text}</span>;
                            })
                          ) : (
                            <span>{s.original || s.analysis}</span>
                          )}
                       </p>
                    </div>
                  ))}
                </div>
             </div>
           );
        }

      // 4. Render Vocabulary (Isolated Logic)
      else if (type === "word") {
        let vocabList = material.vocabulary || [];
        
        // Robust Parsing for Vocabulary
        if (typeof vocabList === 'string') {
            try { vocabList = JSON.parse(vocabList); } catch(e) { vocabList = []; }
        }
        if (typeof vocabList === 'string') {
             try { vocabList = JSON.parse(vocabList); } catch(e) { vocabList = []; }
        }
        if (!Array.isArray(vocabList)) vocabList = [];

        const displayVocab = isPreview ? vocabList.slice(0, 15) : vocabList;
        const midPoint = Math.ceil(displayVocab.length / 2);
        const leftCol = displayVocab.slice(0, midPoint);
        const rightCol = displayVocab.slice(midPoint);

        return (
          <div className="w-full">
              <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4 mb-8">
                <div><h2 className="text-2xl font-black tracking-tight text-slate-900">{material.title || "단어장"}</h2></div>
                <div className="text-right"><span className="text-3xl font-black text-[#FF4081]">inno</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[leftCol, rightCol].map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-0">
                    {col.map((v: any, idx: number) => (
                      <div key={idx} className="flex items-center py-2.5 border-b border-slate-100 text-[13px]">
                        <span className="w-8 text-center font-bold text-slate-400">{idx + (colIdx * midPoint) + 1}</span>
                        <span className="flex-1 font-bold text-slate-800 px-2">{v.word}</span>
                        <div className="flex-[1.2] flex items-center gap-2">
                          <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200 shrink-0">{v.partOfSpeech || "품"}</span>
                          <span className="text-slate-600 truncate">{v.meaning}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              {!isPreview && (
                 <div className="mt-12">
                   <h3 className="text-lg font-bold mb-4 border-b pb-2">동/반의어</h3>
                   <div className="grid grid-cols-1 gap-0">
                     {vocabList.filter((v: any) => (v.synonyms?.length > 0 || v.antonyms?.length > 0)).map((v: any, idx: number) => (
                       <div key={idx} className="flex py-3 border-b border-slate-100 text-sm">
                         <div className="w-12 text-center font-bold text-slate-400 pt-1">{idx + 1}</div>
                         <div className="w-32 font-bold text-slate-800 pt-1">{v.word}</div>
                         <div className="flex-1 space-y-1">
                           {v.synonyms?.length > 0 && (<div className="flex items-start gap-2"><span className="text-xs font-bold text-blue-500 w-4">(S)</span><span className="text-slate-500 text-xs">{Array.isArray(v.synonyms) ? v.synonyms.join(", ") : v.synonyms}</span></div>)}
                           {v.antonyms?.length > 0 && (<div className="flex items-start gap-2"><span className="text-xs font-bold text-red-500 w-4">(A)</span><span className="text-slate-500 text-xs">{Array.isArray(v.antonyms) ? v.antonyms.join(", ") : v.antonyms}</span></div>)}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
              )}
          </div>
        );
      }

      // 5. Render Analysis (Default)
      else {
        const rawSentences = material.sentences || material.content || [];
        const displaySentences = isPreview ? rawSentences.slice(0, 3) : rawSentences;
        // material.content comes from parsed JSON which is raw. 
        // If material.sentences is already transformed, we shouldn't transform again.
        // However, based on parsedCurriculum logic, both .sentences and .content are raw arrays.
        const analyzedDisplaySentences = transformToAnalyzedSentences(displaySentences); 

        // Removed the nested Workbook check since it's handled above in step 3
        
        // Standard Analysis Viewer (Detailed)
        return (
          <div className="w-full">
             {material.structure && (
               <div className="mb-6">
                 <h3 className="text-sm font-bold text-slate-900 mb-3">지문 구조</h3>
                 <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
                   <div className="flex gap-4 items-start">
                     <span className="text-red-500 font-bold w-10 shrink-0 text-xs pt-0.5">제목</span>
                     <div className="flex-1">
                       <h4 className="font-bold text-slate-900 text-sm leading-tight">{material.structure.title}</h4>
                       <p className="text-slate-500 text-[11px] mt-1">{material.structure.titleTranslation}</p>
                     </div>
                   </div>
                   <div className="flex gap-4 items-start border-t border-slate-50 pt-3">
                     <span className="text-blue-500 font-bold w-10 shrink-0 text-xs pt-0.5">주제</span>
                     <div className="flex-1">
                       <h4 className="font-bold text-slate-900 text-sm leading-snug">{material.structure.subject || "주제 정보 없음"}</h4>
                       <p className="text-slate-500 text-[11px] mt-1">{material.structure.subjectTranslation}</p>
                     </div>
                   </div>
                   <div className="flex gap-4 items-start border-t border-slate-50 pt-3">
                     <span className="text-emerald-500 font-bold w-10 shrink-0 text-xs pt-0.5">요약</span>
                     <div className="flex-1">
                       <h4 className="font-bold text-slate-900 text-[13px] leading-relaxed">{material.structure.summary || "요약 정보 없음"}</h4>
                       <p className="text-slate-500 text-[11px] mt-1">{material.structure.summaryTranslation}</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {material.backgroundKnowledge && (
               <div className="mb-6">
                 <h3 className="text-sm font-bold text-slate-900 mb-3">배경 지식</h3>
                 <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
                   <h4 className="font-bold text-slate-900 text-sm mb-2">{material.backgroundKnowledge.title}</h4>
                   <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{material.backgroundKnowledge.description}</p>
                 </div>
               </div>
             )}

             {material.vocabulary && material.vocabulary.length > 0 && (
               <div className="mb-10">
                 <h3 className="text-base font-bold text-slate-900 mb-4">핵심 단어</h3>
                 <div className="bg-slate-200 border border-slate-200 rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-[1px]">
                   {material.vocabulary.map((vocab: any, vIdx: number) => (
                     <div key={vIdx} className="bg-white p-3 flex items-start hover:bg-slate-50 transition-colors">
                       <div className="mr-2.5 mt-1">
                         <div className="w-3.5 h-3.5 rounded-full border border-slate-300 bg-white"></div>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-0.5">
                           <span className="font-bold text-slate-900 text-[14px] leading-tight">{vocab.word}</span>
                         </div>
                         <div className="flex items-start gap-1.5">
                           <span className="shrink-0 text-[11px] text-slate-400 font-bold pt-0.5">뜻</span>
                           <span className="text-[13px] text-slate-700 font-medium leading-snug">{vocab.meaning}</span>
                         </div>
                         {(vocab.synonyms?.length > 0 || vocab.antonyms?.length > 0) && (
                           <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                             {vocab.synonyms?.length > 0 && (<div className="flex items-center gap-1"><span className="text-blue-500 font-bold">S</span><span className="text-slate-500">{Array.isArray(vocab.synonyms) ? vocab.synonyms.join(", ") : vocab.synonyms}</span></div>)}
                             {vocab.antonyms?.length > 0 && (<div className="flex items-center gap-1"><span className="text-rose-500 font-bold">A</span><span className="text-slate-500">{Array.isArray(vocab.antonyms) ? vocab.antonyms.join(", ") : vocab.antonyms}</span></div>)}
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <div className="mb-10">
                 <h3 className="text-base font-bold text-slate-900 mb-4">지문 읽기</h3>
                 <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
                    {analyzedDisplaySentences.map((s: any, i: number) => {
                        // Clean text for reading view - remove all bracket syntax
                        // This regex targets common syntax analysis markers like [text/note], ((text)), etc.
                        // We use a safe fallback to s.original if analysis processing fails
                        // If both original and analysis are missing, reconstruct from contentTokens
                        const rawText = s.original || s.analysis || (s.contentTokens ? s.contentTokens.map((t:any) => t.text).join('') : "") || "";
                        const cleanText = rawText
                            .replace(/\[([^\]\/]+)(?:\/[^\]]*)?\]/g, '$1') // [text/annotation] -> text
                            .replace(/\(\(\{/g, '').replace(/\}\)\)/g, '')   // (({ })) -> empty
                            .replace(/<<\{/g, '').replace(/\}>>/g, '')       // <<{ }>> -> empty
                            .replace(/\{\{/g, '').replace(/\}\}/g, '')       // {{ }} -> empty
                            .replace(/\[\[\{/g, '').replace(/\}\]\]/g, '')   // [[{ }]] -> empty
                            .replace(/\(\(\(\{/g, '').replace(/\}\)\)\)/g, '') // ((( { }))) -> empty
                            .replace(/\/ \/ bg/g, '')                        // / / bg -> empty
                            .replace(/<[^>]*>/g, '')                         // remove html tags if any
                            .replace(/\s+/g, ' ')                            // normalize spaces
                            .trim();

                        return (
                            <div key={i} className="mb-6 last:mb-0">
                                <div className="flex gap-3 mb-2">
                                    <span className="text-lg font-bold text-blue-200 font-serif shrink-0 pt-0.5">{String(i + 1).padStart(2, '0')}</span>
                                    <p className="text-[15px] leading-relaxed font-serif text-slate-800 font-medium">
                                        {cleanText}
                                    </p>
                                </div>
                                <p className="text-[13px] text-slate-500 pl-10 leading-relaxed text-justify break-keep">{s.translation}</p>
                            </div>
                        );
                    })}
                 </div>
             </div>

             <h3 className="text-sm font-bold text-slate-900 mb-3"><i className="fas fa-microscope mr-2 text-indigo-500"></i>구문 분석</h3>
             <SentenceAnalysisViewer 
               sentences={analyzedDisplaySentences}
               className="border-none shadow-none p-0 w-full max-w-none"
             />
          </div>
        );
      }
    };

    const renderGroupedMaterials = (materials: any[], isPreviewMode: boolean) => {
      if (!materials || materials.length === 0) return null;

      // Group materials by type
      const grouped = {
        word: [] as any[],
        analysis: [] as any[],
        workbook: [] as any[],
        variant: [] as any[],
        other: [] as any[]
      };

      materials.forEach(material => {
        let type = material.type || "analysis";
        
        // Robust type detection (same logic as renderMaterialContent)
        if (material.questions && material.questions.length > 0) type = "variant";
        else if (material.title?.includes("워크북") || (material.sentences && material.type === "workbook")) type = "workbook";
        else if ((material.sentences && material.sentences.length > 0) || (material.content && material.content.length > 0)) {
           type = type === "workbook" ? "workbook" : "analysis";
        }
        else if (material.vocabulary && material.vocabulary.length > 0) type = "word";
        else if (material.title?.includes("단어장")) type = "word";
        else if (material.title?.includes("변형문제")) type = "variant";
        
        // Force type if explicitly set
        if (material.type && material.type !== "analysis") type = material.type;

        if (grouped[type as keyof typeof grouped]) {
          grouped[type as keyof typeof grouped].push(material);
        } else {
          grouped.other.push(material);
        }
      });

      const renderSection = (title: string, items: any[], icon: string, color: string) => {
        if (items.length === 0) return null;
        return (
          <div className="space-y-6 mb-12 last:mb-0">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} text-white shadow-sm`}>
                <i className={`fas ${icon}`}></i>
              </div>
              <h3 className="text-xl font-black text-gray-900">{title}</h3>
              <Badge variant="outline" className="ml-auto font-bold">{items.length}개 자료</Badge>
            </div>
            <div className="space-y-8">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                   {renderMaterialContent(item, isPreviewMode)}
                </div>
              ))}
            </div>
          </div>
        );
      };

      return (
        <div className="space-y-8">
          {renderSection("단어장", grouped.word, "fa-book-open", "bg-emerald-500")}
          {renderSection("본문 분석", grouped.analysis, "fa-microscope", "bg-indigo-500")}
          {renderSection("워크북", grouped.workbook, "fa-pencil-alt", "bg-orange-500")}
          {renderSection("변형문제", grouped.variant, "fa-tasks", "bg-rose-500")}
          {renderSection("기타 학습 자료", grouped.other, "fa-folder-open", "bg-gray-500")}
        </div>
      );
    };

  if (courseLoading || userLoading || enrollmentLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {userLoading
                ? "사용자 정보를 확인하는 중..."
                : enrollmentLoading
                  ? "수강 정보를 확인하는 중..."
                  : "강의 정보를 불러오는 중..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (courseError || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              강의를 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-8">
              요청하신 강의가 존재하지 않거나 삭제되었습니다.
            </p>
            <Button onClick={() => window.history.back()}>
              이전 페이지로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 편집 권한 체크: 슈퍼 관리자이거나 강의 작성자인 경우 (비즈니스 권한은 자신이 등록한 강의만)
  const canEdit =
    user?.isAdmin || // 슈퍼 관리자는 모든 강의 편집 가능
    (user?.id && course?.instructorId === user.id) || // 강의 작성자는 자신의 강의만 편집 가능
    false;

  // 사용자 권한 타입 확인
  const userRoleType = user?.isAdmin
    ? "admin"
    : user?.role === "business"
      ? "business"
      : "user";

  // 편집 가능한 이유 확인 (UI 표시용)
  const editReason = user?.isAdmin
    ? "admin"
    : user?.id && course?.instructorId === user.id
      ? "owner"
      : null;

  // 업데이트 팩터 파라미터 추가
  // 파일 다운로드 핸들러 추가
  const handleFileDownload = async (material: any) => {
    try {
      // 실제 파일 다운로드 로직
      if (material.filename) {
        // 서버에 실제 업로드된 파일인 경우
        const downloadUrl = `/api/business/download-learning-material/${material.filename}?originalName=${encodeURIComponent(material.name)}`;
        const response = await fetch(downloadUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("파일 다운로드에 실패했습니다.");
        }

        // 파일을 blob으로 받아서 다운로드
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = material.name; // 원본 파일명 사용
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "파일 다운로드 완료",
          description: `${material.name}이(가) 다운로드되었습니다.`,
          variant: "default",
        });
      } else if (material.url && material.url !== "#") {
        // 외부 URL인 경우 새 창으로 열기
        window.open(material.url, "_blank");
      } else {
        // 샘플 데이터인 경우 (실제 파일이 없음)
        toast({
          title: "샘플 파일입니다",
          description: `${material.name}은(는) 샘플 파일입니다. 실제 강의에서는 다운로드가 가능합니다.`,
          variant: "default",
        });
      }
    } catch (error) {
      console.error("파일 다운로드 오류:", error);
      toast({
        title: "다운로드 실패",
        description:
          "파일 다운로드 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 파일 아이콘 함수
  const getFileIcon = (type: string | undefined) => {
    if (!type) return "fas fa-file text-gray-600";
    if (type.includes("pdf")) return "fas fa-file-pdf text-red-600";
    if (type.includes("word") || type.includes("document"))
      return "fas fa-file-word text-blue-600";
    if (type.includes("excel") || type.includes("spreadsheet"))
      return "fas fa-file-excel text-green-600";
    if (type.includes("powerpoint") || type.includes("presentation"))
      return "fas fa-file-powerpoint text-orange-600";
    if (type.includes("image")) return "fas fa-file-image text-purple-600";
    if (type.includes("video")) return "fas fa-file-video text-red-600";
    if (type.includes("audio")) return "fas fa-file-audio text-blue-600";
    if (type.includes("zip") || type.includes("rar"))
      return "fas fa-file-archive text-yellow-600";
    return "fas fa-file text-gray-600";
  };

  // 파일 크기 포맷팅 함수
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 퀴즈 채점 및 진도율 업데이트
  const handleQuizSubmit = async (answers: any[]) => {
    if (!selectedQuiz || !course || !enrollment) return;

    try {
      if (!selectedQuiz.questions || !enrollment?.id) {
        throw new Error("퀴즈 정보가 없거나 수강 정보를 찾을 수 없습니다.");
      }

      const totalQuestions = selectedQuiz.questions.length;
      let correctCount = 0;
      const results: any[] = [];

      // 각 문제 채점
      selectedQuiz.questions.forEach((question: any, index: number) => {
        const userAnswer = quizAnswers[`question-${index}`];
        const correctAnswer = question.correctAnswer;

        // 답안 정규화
        const normalizeAnswer = (answer: string | undefined | null) => {
          if (!answer) return "";
          return answer.toString().trim().toLowerCase().replace(/\s+/g, " ");
        };

        const normalizedUserAnswer = normalizeAnswer(userAnswer);
        const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

        let isCorrect = false;

        if (question.type === "true-false") {
          const userBool = userAnswer === "true" || userAnswer === "참";
          const correctBool =
            correctAnswer === "true" || correctAnswer === "참";
          isCorrect = userBool === correctBool;
        } else if (question.type === "short-answer") {
          isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
        } else {
          isCorrect = userAnswer === correctAnswer;
        }

        if (isCorrect) correctCount++;
        results.push({
          questionNumber: index + 1,
          question: question.question,
          userAnswer: userAnswer || "답변 없음",
          correctAnswer: correctAnswer,
          isCorrect: isCorrect,
          type: question.type,
        });
      });

      const score =
        totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = score >= 60;

      // 상세 결과 로그
      console.log("=== 퀴즈 채점 결과 ===");
      console.log("총 문제 수:", totalQuestions);
      console.log("정답 수:", correctCount);
      console.log("점수:", score);
      console.log("합격 여부:", passed);
      console.log("상세 결과:", results);
      console.log("==================");

      // 결과 표시
      toast({
        title: `퀴즈 완료! ${correctCount}/${totalQuestions} 정답`,
        description: `점수: ${Math.round(score)}점 ${passed ? "(합격 ✅)" : "(불합격 ❌ - 60점 이상 필요)"}`,
        variant: passed ? "default" : "destructive",
        duration: 5000,
      });

      // 합격 시 진도율 업데이트 및 완료 처리
      if (passed) {
        const quizKey = `${selectedQuiz.weekIndex}-${selectedQuiz.id}`;
        setCompletedQuizzes((prev) => {
          const newSet = new Set(prev).add(quizKey);
          saveCompletedItem(quizKey);
          return newSet;
        });

        // 진도율 업데이트 API 호출
        await updateProgress(quizKey, "quiz", Math.round(score));

        // 캐시 무효화
        queryClient.invalidateQueries({
          queryKey: ["enrollment", enrollment.id],
        });
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });

        toast({
          title: "축하합니다! 🎉",
          description: "퀴즈를 성공적으로 완료했습니다.",
          variant: "default",
        });
      } else {
        // 불합격 시 틀린 문제 표시
        const wrongAnswers = results.filter((r) => !r.isCorrect);
        console.log("틀린 문제 상세:", wrongAnswers);
      }

      // 퀴즈 모달 닫기
      setShowQuizModal(false);
      // 답변 초기화
      setQuizAnswers({});

      return { results, score, passed };
    } catch (error) {
      console.error("퀴즈 제출 중 오류:", error);
      toast({
        title: "오류 발생",
        description: "퀴즈 제출 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // 진도율 동기화 함수
  const syncProgress = async () => {
    if (!user || !enrollment || !course?.id) return;

    try {
      // 전체 항목 수 계산
      let totalItems = 0;
      let completedItems = 0;

      parsedCurriculum.forEach((week: any) => {
        if (week.videos?.length) totalItems += week.videos.length;
        if (week.quizzes?.length) totalItems += week.quizzes.length;
      });

      // 완료된 항목 수 계산
      completedItems = completedVideos.size + completedQuizzes.size;

      // 전체 진도율 계산
      const totalProgress =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // 서버에 진도율 업데이트
      if (totalProgress === 100) {
        // 100% 달성 시 모든 항목 완료 처리
        const allVideos = new Set<string>();
        const allQuizzes = new Set<string>();

        parsedCurriculum.forEach((week: any, weekIndex: number) => {
          week.videos?.forEach((video: any) => {
            const videoId = `${weekIndex}-${video.id}`;
            allVideos.add(videoId);
          });
          week.quizzes?.forEach((quiz: any) => {
            const quizId = `${weekIndex}-${quiz.id}`;
            allQuizzes.add(quizId);
          });
        });

        setCompletedVideos(allVideos);
        setCompletedQuizzes(allQuizzes);

        // 각 항목별로 100% 진도율 업데이트
        for (const videoId of Array.from(allVideos)) {
          await retryOperation(() => handleVideoProgress(videoId, 100));
        }
        for (const quizId of Array.from(allQuizzes)) {
          await retryOperation(() => handleQuizComplete(quizId, 100));
        }
      }

      // 캐시 갱신
      queryClient.invalidateQueries({
        queryKey: ["enrollment", enrollment.id],
      });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    } catch (error) {
      console.error("진도율 동기화 중 오류:", error);
      toast({
        title: "진도율 동기화 실패",
        description: "나중에 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <IconStyle />
      {/* 헤더 */}
      <Header />

      {/* 과정 상세 페이지 */}
      <div className="container mx-auto px-3 py-3">
        {/* 상단 네비게이션 */}
        <div className="mb-3">
          <div className="flex items-center text-sm text-gray-600">
            <a href="/courses" className="hover:text-indigo-600 cursor-pointer">
              <i className="fas fa-arrow-left mr-2"></i>
              교육과정 목록으로 돌아가기
            </a>
            <span className="mx-2">|</span>
            <span>
              <i className="fas fa-home mr-1"></i>홈
            </span>
            <span className="mx-2">&gt;</span>
            <span>교육과정</span>
            <span className="mx-2">&gt;</span>
            <span className="text-indigo-600 font-medium">
              {course?.title || "강의 상세"}
            </span>
          </div>
        </div>

        {/* 관리자/비즈니스 모드 토글 */}
        {canEdit && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
              <i
                className={`${editReason === "admin" ? "fas fa-user-shield" : "fas fa-user-edit"} text-yellow-600 mr-2`}
              ></i>
              <span className="font-medium">
                {editReason === "admin"
                  ? "슈퍼 관리자 모드"
                  : userRoleType === "business"
                    ? "선생님/사업자 편집 모드"
                    : "강의 편집 모드"}
              </span>
              <span className="text-sm text-gray-500 ml-2">
                (
                {editReason === "admin"
                  ? "모든 강의 편집 가능"
                  : "내가 등록한 강의"}
                )
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {showCourseEditModal
                  ? "편집 모드 활성화됨"
                  : "편집 모드 비활성화"}
              </span>
              <Switch
                checked={showCourseEditModal}
                onCheckedChange={setShowCourseEditModal}
                className="data-[state=checked]:bg-indigo-600"
              />
            </div>
          </div>
        )}

        {/* 과정 기본 정보 (Hero Section) */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row">
            {/* 왼쪽: 도서 이미지 */}
            <div className="lg:w-2/5 relative bg-gray-50 flex items-center justify-center p-8">
              <div className="relative group">
                <img
                  src={getImageUrl(course?.imageUrl, "/uploads/images/1.jpg")}
                  alt={course?.title || "강의 이미지"}
                  className="w-full max-w-[280px] h-auto shadow-[0_15px_40px_rgba(0,0,0,0.15)] rounded-lg transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute -bottom-3 -right-3 bg-orange-500 text-white w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold shadow-lg border-4 border-white rotate-12">
                  <span className="text-[10px]">BEST</span>
                  <span className="text-lg">1위</span>
                </div>
              </div>
            </div>

            {/* 오른쪽: 도서 정보 */}
            <div className="lg:w-3/5 p-5 lg:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-orange-100 text-orange-600 border-none px-2 py-0.5 text-xs font-bold">인기 도서</Badge>
                <Badge className="bg-blue-100 text-blue-600 border-none px-2 py-0.5 text-xs font-bold">2025 개정</Badge>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-3 leading-tight">
                {course?.title || "강의 제목"}
              </h1>

              <div className="space-y-1.5 mb-5 text-sm lg:text-base">
                <div className="flex items-center">
                  <span className="w-20 text-gray-400 font-medium">저자</span>
                  <span className="text-gray-800 font-bold">{course?.instructorName || "전문 강사진"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-gray-400 font-medium">분류</span>
                  <span className="text-gray-800">{course?.category || "교육"}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-gray-400 font-medium">난이도</span>
                  <Badge variant="outline" className="border-gray-200 text-gray-600 px-2 py-0 text-xs">{course?.level || "중급"}</Badge>
                </div>
                <div className="flex items-center">
                  <span className="w-20 text-gray-400 font-medium">리뷰</span>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2 text-xs">
                      {[...Array(5)].map((_, i) => (
                        <i key={i} className={`fas fa-star ${i < 4 ? "" : "text-gray-200"}`}></i>
                      ))}
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{averageRating}</span>
                    <span className="text-gray-400 ml-2 text-xs">({reviews?.length || 0}개 후기)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {(!course?.price || course?.price === 0) ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDirectDownload(course, 'pdf')}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-xs font-bold rounded-lg shadow-sm shadow-blue-200 transition-all active:scale-95"
                    >
                      <Printer className="mr-1.5 h-3.5 w-3.5" />
                      PDF 다운로드
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDirectDownload(course, 'hwpx')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-xs font-bold rounded-lg shadow-sm shadow-indigo-200 transition-all active:scale-95"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />
                      HWPX 다운로드
                    </Button>
                  </div>
                ) : (
                  isEnrolled ? (
                    <div className="flex gap-1.5 w-full">
                      <Button
                        onClick={() => handleDirectDownload(course, 'pdf')}
                        className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-500 px-3 h-10 text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                      >
                        <i className="fas fa-file-pdf mr-1.5"></i>
                        PDF
                      </Button>
                      <Button
                        onClick={() => handleDirectDownload(course, 'hwpx')}
                        className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-500 px-3 h-10 text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                      >
                        <i className="fas fa-file-word mr-1.5"></i>
                        HWPX
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => {
                        if (!user) {
                          toast({
                            title: "로그인이 필요합니다.",
                            description: "책 구매를 위해 로그인해주세요.",
                            variant: "destructive",
                          });
                          return;
                        }
                        setIsPaymentModalOpen(true);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg font-black rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                      <i className="fas fa-shopping-cart mr-2"></i>
                      책구매하기
                    </Button>
                  )
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSubscribe}
                    className={`w-14 h-14 rounded-xl border-2 ${isSubscribed ? "border-red-500 bg-red-50 text-red-500" : "border-gray-100 text-gray-400 hover:border-indigo-600 hover:text-indigo-600"}`}
                  >
                    <i className={`${isSubscribed ? "fas" : "far"} fa-heart text-xl`}></i>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShare}
                    className="w-14 h-14 rounded-xl border-2 border-gray-100 text-gray-400 hover:border-indigo-600 hover:text-indigo-600"
                  >
                    <i className="fas fa-share-alt text-xl"></i>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="mb-4 sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100">
          <div className="container mx-auto">
            <div className="flex justify-center space-x-6">
              {[
                { id: "intro", label: "도서소개" },
                { id: "curriculum", label: "목차" },
                { id: "instructor", label: "저자소개" },
                { id: "reviews", label: "도서후기" },
                { id: "faq", label: "FAQ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-2 py-3 text-base font-bold transition-all relative ${
                    activeTab === tab.id
                      ? "text-indigo-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 max-w-7xl mx-auto">
          {/* 메인 컨텐츠 */}
          <div className="space-y-3 w-full">
        {/* 과정 소개 */}
        {activeTab === "intro" && (
          <div className="space-y-3">
            {/* 메인 배너 - 이미지 스타일 */}
            <div className="w-full h-auto rounded-2xl overflow-hidden shadow-lg border-2 border-white">
              <div className="bg-gradient-to-r from-orange-400 to-red-500 p-8 text-center text-white relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2 px-3 py-0.5 text-sm backdrop-blur-sm">
                  NEW 2025 개정판
                </Badge>
                <h2 className="text-3xl font-black mb-4 tracking-tight drop-shadow-md">
                  {course?.title || "원리 똑똑 패스 2025"}
                </h2>
                <p className="text-lg font-bold opacity-90 max-w-xl mx-auto leading-relaxed">
                  {course?.description || "국어의 원리를 꿰뚫는 완벽한 커리큘럼으로 성적 향상의 기적을 경험하세요!"}
                </p>
                <div className="mt-6 flex justify-center space-x-3">
                  <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 text-xs border border-white/20 font-medium">
                    #수능국어1등급
                  </div>
                  <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-1 text-xs border border-white/20 font-medium">
                    #내신완벽대비
                  </div>
                </div>
              </div>
            </div>

            {/* 학습 자료 (이전 스타일 유지하되 간결하게) */}
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                <i className="fas fa-folder-open text-orange-500 mr-3"></i>
                학습 부가 자료
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(course?.learningMaterials || [
                  { id: "1", name: "2025 개정 교육과정 핵심 요약집", size: 1024 * 1024 * 5, type: "pdf" },
                  { id: "2", name: "단기 합격 시크릿 노트", size: 1024 * 1024 * 2, type: "pdf" }
                ]).map((material: any) => (
                  <div
                    key={material.id}
                    className="flex items-center p-4 border border-gray-100 rounded-xl hover:bg-orange-50/30 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white transition-colors shadow-sm">
                      <i className="fas fa-file-pdf text-red-500 text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800 group-hover:text-orange-600 transition-colors">{material.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">파일 용량: {Math.round(material.size / (1024 * 1024))}MB</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-gray-400 group-hover:text-orange-500 h-8 w-8 p-0">
                      <i className="fas fa-download text-xs"></i>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

            {/* 커리큘럼 (목차) */}
            {(activeTab === "intro" || activeTab === "curriculum") && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 mb-6">
                {!isEnrolled && (course?.price || 0) > 0 ? (
                  /* 구매 전 샘플 보기 화면 (유료 도서인 경우만) */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <h3 className="text-2xl font-black text-gray-900">도서 샘플 미리보기</h3>
                      <Badge className="bg-green-500 text-white font-bold px-3 py-1 text-xs">PREVIEW</Badge>
                    </div>
                    
                    {parsedCurriculum.length > 0 ? (
                      <div className="space-y-6">
                        {/* 샘플 챕터 정보 */}
                        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold mr-4 shadow-sm">
                              01
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">{parsedCurriculum[0].title}</h4>
                              <p className="text-sm text-indigo-600 font-medium">Chapter 01. Sample Content</p>
                            </div>
                          </div>
                          
                          {/* 샘플 분석 내용 (analysisMaterials가 있는 경우) */}
                          {parsedCurriculum[0].analysisMaterials && parsedCurriculum[0].analysisMaterials.length > 0 ? (
                            <div className="space-y-6 not-prose font-sans mt-8">
                               {renderGroupedMaterials(parsedCurriculum[0].analysisMaterials, true)}
                            </div>
                          ) : (
                            /* analysisMaterials가 없는 경우 기본 텍스트 표시 */
                            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                              <i className="fas fa-book-open text-4xl text-gray-200 mb-4"></i>
                              <p className="text-gray-500 font-medium">첫 번째 챕터의 샘플 내용을 준비 중입니다.</p>
                            </div>
                          )}
                        </div>

                        {/* 구매 유도 섹션 */}
                        <div className="bg-gray-900 rounded-2xl p-8 text-center text-white shadow-xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                          <h4 className="text-xl font-black mb-2 relative z-10">전체 내용을 확인하고 싶으신가요?</h4>
                          <p className="text-gray-400 text-sm mb-6 relative z-10">총 {parsedCurriculum.length}개의 풍부한 챕터와 상세한 분석 자료가 기다리고 있습니다.</p>
                          <Button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-6 text-lg rounded-xl shadow-lg relative z-10 transition-transform active:scale-95"
                          >
                            <i className="fas fa-shopping-cart mr-2"></i>
                            지금 바로 책 구매하기
                          </Button>
                        </div>

                        {/* 전체 목차 (잠금 표시) */}
                        <div className="pt-4">
                          <h5 className="text-sm font-bold text-gray-400 mb-4">전체 목차 요약</h5>
                          <div className="grid grid-cols-1 gap-2">
                            {parsedCurriculum.map((item: any, idx: number) => (
                              <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${idx === 0 ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                <div className="flex items-center">
                                  <span className="w-6 text-xs font-bold">{String(idx + 1).padStart(2, '0')}</span>
                                  <span className="text-sm font-bold">{item.title}</span>
                                </div>
                                {idx > 0 && <i className="fas fa-lock text-[10px]"></i>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-gray-400">등록된 목차 정보가 없습니다.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 구매 후 또는 무료 도서 전체 목차 화면 */
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-black text-gray-900">도서 목차</h3>
                      <div className="flex items-center space-x-2">
                        {(!course?.price || course?.price === 0) && (
                          <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[10px] px-2 py-0.5">FREE CONTENT</Badge>
                        )}
                        <div className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full font-bold">
                          총 {parsedCurriculum.length}개 챕터
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {parsedCurriculum.length > 0 ? (
                        parsedCurriculum.map((week: any, weekIndex: number) => (
                          <div
                            key={weekIndex}
                            className="group border border-gray-100 rounded-2xl overflow-hidden hover:border-indigo-200 transition-all bg-gray-50/30 shadow-sm"
                          >
                            {/* 챕터 헤더 */}
                            <div className="px-3 py-4 flex items-center justify-between bg-white group-hover:bg-indigo-50/30 transition-colors">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold mr-3 shadow-sm">
                                  {String(weekIndex + 1).padStart(2, '0')}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-900 text-lg">
                                    {week.title}
                                  </h4>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-400 font-medium">
                                      <i className="fas fa-clock mr-1"></i>
                                      {week.duration || "1시간"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* 진도율 표시 (구매자에게만 의미있음) */}
                              {isEnrolled && (
                                <div className="hidden md:flex items-center space-x-3">
                                  {(() => {
                                    const totalItems = (week.videos?.length || 0) + (week.quizzes?.length || 0);
                                    const completedItems = (week.videos?.filter((v: any) => completedVideos.has(`${weekIndex}-${v.id}`)).length || 0) +
                                                          (week.quizzes?.filter((q: any) => completedQuizzes.has(`${weekIndex}-${q.id}`)).length || 0);
                                    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                                    return (
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 h-1 bg-gray-100 rounded-full">
                                          <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{Math.round(progress)}%</span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>

                            {/* 챕터 상세 내용 - 무료 도서는 항상 공개 */}
                            <div className="px-3 py-4 bg-gray-50/50 border-t border-gray-50">
                              <ul className="space-y-3">
                                {(week.videos || []).map((video: any, idx: number) => {
                                  const videoKey = `${weekIndex}-${video.id}`;
                                  const isCompleted = completedVideos.has(videoKey);
                                  return (
                                    <li key={idx} 
                                        onClick={() => {
                                          setSelectedVideo({...video, weekIndex});
                                          setShowVideoModal(true);
                                        }}
                                        className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm cursor-pointer">
                                      <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm text-indigo-600'}`}>
                                          <i className={`fas ${isCompleted ? 'fa-check' : 'fa-play text-[10px]'}`}></i>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{video.title}</span>
                                      </div>
                                      <span className="text-xs text-gray-400">{video.duration}</span>
                                    </li>
                                  );
                                })}
                                {(week.quizzes || []).map((quiz: any, idx: number) => {
                                  const quizKey = `${weekIndex}-${quiz.id}`;
                                  const isCompleted = completedQuizzes.has(quizKey);
                                  return (
                                    <li key={`quiz-${idx}`} 
                                        onClick={() => {
                                          setSelectedQuiz({...quiz, weekIndex});
                                          setShowQuizModal(true);
                                        }}
                                        className="flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white hover:shadow-sm cursor-pointer border border-transparent hover:border-green-100">
                                      <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-white shadow-sm text-green-600'}`}>
                                          <i className={`fas ${isCompleted ? 'fa-check' : 'fa-question text-[10px]'}`}></i>
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{quiz.title}</span>
                                      </div>
                                      <Badge variant="outline" className="text-[10px] text-green-600 border-green-200">QUIZ</Badge>
                                    </li>
                                  );
                                })}
                                {/* 분석 자료가 있는 경우 표시 (그룹화하여 렌더링) */}
                                {week.analysisMaterials && week.analysisMaterials.length > 0 && (
                                  <li className="mt-4">
                                    {renderGroupedMaterials(week.analysisMaterials, !isEnrolled && (course?.price || 0) > 0)}
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                          <i className="fas fa-book-open text-3xl text-gray-300 mb-3"></i>
                          <p className="text-sm text-gray-500 font-medium">등록된 목차가 없습니다.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 저자 소개 */}
            {(activeTab === "intro" || activeTab === "instructor") && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 mb-6">
                <h2 className="text-2xl font-black text-gray-900 mb-6">저자 소개</h2>
                
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <div className="relative group">
                      <img
                        src={course?.instructorImageUrl || `https://i.pravatar.cc/300?u=${course?.instructorId || 'default'}`}
                        alt={course?.instructorName || "저자"}
                        className="w-full aspect-[4/5] object-cover rounded-2xl shadow-lg transition-transform group-hover:scale-[1.02]"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-lg">
                        BEST SELLER
                      </div>
                    </div>
                  </div>
                  <div className="md:w-3/4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-black text-gray-900 mb-0.5">{course?.instructorName || "전문 필진"}</h4>
                        <p className="text-indigo-600 font-bold text-sm">{course?.instructorExpertise || "학습 분석 전문가"}</p>
                      </div>
                      <Button variant="outline" className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-black rounded-xl px-4 h-9 text-xs">
                        <i className="fas fa-plus mr-1.5"></i>팔로우
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-5 mb-5 border border-gray-100">
                      <p className="text-gray-700 leading-relaxed text-sm font-medium italic">
                        "{course?.instructorProfile || "수많은 학생들의 성적을 바꿔놓은 검증된 학습 전략을 전합니다."}"
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-users text-sm"></i>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">팔로워</p>
                          <p className="text-sm font-black text-gray-900">{(instructor?.subscribers || 1200).toLocaleString()}명</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-50 flex items-center">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
                          <i className="fas fa-book text-sm"></i>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold">집필 도서</p>
                          <p className="text-sm font-black text-gray-900">{instructorCourses.length + 1}권</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 저자의 다른 책들 */}
                {instructorCourses.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-100">
                    <h5 className="text-lg font-black text-gray-900 mb-6">저자의 다른 추천 도서</h5>
                    <InstructorOtherBooks courses={instructorCourses} currentCourseId={courseId} />
                  </div>
                )}
              </div>
            )}

            {/* 수강 후기 */}
            {/* 도서 후기 */}
            {(activeTab === "intro" || activeTab === "reviews") && (
              <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-gray-900">도서 후기</h2>
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast({
                          title: "로그인이 필요합니다.",
                          description: "후기 작성을 위해 로그인해주세요.",
                          variant: "destructive",
                        });
                        return;
                      }
                      setShowReviewModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-5 text-sm shadow-md"
                  >
                    <i className="fas fa-edit mr-1.5"></i>후기 작성
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="md:col-span-1 text-center border-r border-gray-200 pr-6">
                    <p className="text-gray-400 font-bold text-xs mb-1">사용자 평점</p>
                    <div className="text-4xl font-black text-gray-900 mb-1">4.9</div>
                    <div className="flex text-yellow-400 justify-center mb-1 text-[10px]">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p className="text-[10px] text-gray-400">총 {reviews?.length || 0}개의 후기</p>
                  </div>
                  <div className="md:col-span-3">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                          <span className="w-6">{rating}점</span>
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: rating === 5 ? '85%' : rating === 4 ? '10%' : '5%' }}></div>
                          </div>
                          <span className="w-10 text-right">{rating === 5 ? '85' : rating === 4 ? '10' : '5'}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: Review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-4 last:mb-0"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <Avatar className="w-10 h-10 border border-gray-100 shadow-sm mr-3">
                              <img
                                src={`https://i.pravatar.cc/150?img=${(review.id % 70) + 1}`}
                                alt={review.userName || "구매자"}
                              />
                            </Avatar>
                            <div>
                              <h4 className="font-bold text-sm text-gray-900">
                                {review.userName || "익명"}
                              </h4>
                              <p className="text-[10px] text-gray-400 font-medium">구매자</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex text-yellow-400 justify-end mb-1 text-[10px]">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star ${i < review.rating ? "" : "text-gray-200"}`}
                                ></i>
                              ))}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">
                              {new Date(review.createdAt).toLocaleDateString(
                                "ko-KR",
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed font-medium text-sm">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-gray-400 font-medium text-sm">
                        아직 작성된 후기가 없습니다
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 자주 묻는 질문 */}
            {activeTab === "faq" && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  자주 묻는 질문
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {/* FAQ 기본 항목들 */}
                  <AccordionItem
                    value="faq-1"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-question"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          이 교육는 교육부 인정 학점이 부여되나요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            네, 본 교육는 교육부 인정 교육로 3학점이 부여됩니다.
                            교육 이수 후 교육청 및 소속 선생님에 학점 인정 신청이
                            가능합니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-2"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-clock"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          교육 기간은 얼마나 되나요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            교육 기간은 총 강의 시간과 퀴즈 시간을 기준으로
                            계산됩니다. 하루 2시간 학습을 기준으로 하며, 여유
                            있는 학습을 위해 2주의 추가 기간이 제공됩니다. 과제
                            제출은 종료 5일 전까지 가능하며, 수료증은 종료일
                            다음 날 발급됩니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-3"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          수료 기준은 어떻게 되나요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            수료를 위해서는 다음 조건을 모두 충족해야 합니다:
                            <br />
                            - 전체 진도율 80% 이상
                            <br />
                            - 모든 퀴즈의 평균 점수 60점 이상
                            <br />
                            - 과제 제출 및 평가 완료
                            <br />- 학습 기간 내 모든 과정 이수
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-4"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-mobile-alt"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          모바일에서도 수강이 가능한가요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            네, 모바일 웹과 앱에서 모든 학습 기능을 이용할 수
                            있습니다. PC와 모바일 간 진도율이 실시간으로
                            동기화되어 언제 어디서나 편리하게 학습하실 수
                            있습니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-5"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-undo"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          환불 규정은 어떻게 되나요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            환불은 진도율에 따라 차등 적용됩니다:
                            <br />
                            - 5% 미만: 100% 환불
                            <br />
                            - 5% 이상 20% 미만: 75% 환불
                            <br />
                            - 20% 이상 40% 미만: 50% 환불
                            <br />
                            - 40% 이상: 환불 불가
                            <br />* 단, 첫 수강 시작일로부터 7일 이내인 경우
                            진도율과 관계없이 전액 환불이 가능합니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-6"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-download"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          학습 자료는 다운로드가 가능한가요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            PDF 형태의 학습 자료와 실습 파일은 다운로드가
                            가능합니다. 다만, 강의 영상은 저작권 보호를 위해
                            스트리밍으로만 제공됩니다. 다운로드한 자료는 개인
                            학습 목적으로만 사용해 주시기 바랍니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-7"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-sync"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          수료 후 재수강이 가능한가요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            과정 수료 후 30일간 복습을 위한 재수강이 가능합니다.
                            재수강 기간에는 모든 강의 콘텐츠를 다시 시청할 수
                            있으나, 새로운 수료증 발급이나 퀴즈/과제 제출은
                            불가능합니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-8"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-calendar-plus"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          학습 기간 연장이 가능한가요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            1회에 한하여 2주간 연장이 가능합니다. 연장 신청은
                            학습 종료일 1주일 전부터 마이페이지에서 신청
                            가능하며, 추가 연장이 필요한 경우 고객센터로 문의해
                            주시기 바랍니다.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem
                    value="faq-9"
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 text-left">
                      <div className="flex items-center w-full">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 flex-shrink-0">
                          <i className="fas fa-headset"></i>
                        </div>
                        <h3 className="font-medium text-gray-800 flex-grow">
                          학습 중 궁금한 점은 어떻게 문의하나요?
                        </h3>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex">
                          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                            <i className="fas fa-comment-dots"></i>
                          </div>
                          <p className="text-gray-700">
                            다음과 같은 방법으로 문의하실 수 있습니다:
                            <br />
                            - 강의 내 질문 게시판 (강사 직접 답변)
                            <br />
                            - 1:1 문의하기 (24시간 이내 답변)
                            <br />
                            - 실시간 채팅 상담 (평일 09:00~18:00)
                            <br />- 유선 문의 (평일 09:00~18:00)
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}
          </div>

          {/* 사이드바 (구매 카드) */}
          <div className="lg:col-span-1">
            <div className={`transition-all duration-300 ${isSticky ? "sticky top-4" : ""} w-[300px]`}>
              <Card className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-50">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-gray-900">구매 정보</h3>
                    <Badge className="bg-orange-500 text-white border-none text-[10px]">BEST</Badge>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                    {course?.discountPrice && course.discountPrice < course.price ? (
                      <>
                        <div className="text-gray-400 text-xs line-through mb-0.5">
                          {formatPrice(course.price)}원
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black text-indigo-600">
                            {formatPrice(course.discountPrice)}원
                          </span>
                          <Badge className="bg-red-500 text-white text-sm px-1.5 py-0.5">
                            {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black text-indigo-600">
                          {(!course?.price || course?.price === 0) ? "무료" : `${formatPrice(course?.price || 0)}원`}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center mr-2.5">
                        <i className="fas fa-truck text-indigo-600 text-[10px]"></i>
                      </div>
                      <span className="text-xs font-medium">무료 배송 (내일 도착 예정)</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center mr-2.5">
                        <i className="fas fa-coins text-indigo-600 text-[10px]"></i>
                      </div>
                      <span className="text-xs font-medium">최대 {Math.round((course?.price || 0) * 0.05).toLocaleString()}원 적립</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <div className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center mr-2.5">
                        <i className="fas fa-shield-alt text-indigo-600 text-[10px]"></i>
                      </div>
                      <span className="text-xs font-medium">정품 보증 및 A/S 지원</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {(!course?.price || course?.price === 0) ? (
                      <div className="space-y-2">
                        <Button
                          onClick={() => handleDirectDownload(course, 'pdf')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-black rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95"
                        >
                          <Printer className="mr-2 h-5 w-5" />
                          PDF 다운로드
                        </Button>
                        <Button
                          onClick={() => handleDirectDownload(course, 'hwpx')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          HWPX 다운로드
                        </Button>
                      </div>
                    ) : (
                      isEnrolled ? (
                        <div className="flex gap-1.5 w-full mb-2">
                          <Button
                            onClick={() => handleDirectDownload(course, 'pdf')}
                            className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-500 py-0 h-10 text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                          >
                            <i className="fas fa-file-pdf mr-1.5"></i>
                            PDF
                          </Button>
                          <Button
                            onClick={() => handleDirectDownload(course, 'hwpx')}
                            className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border border-blue-500 py-0 h-10 text-sm font-bold rounded-lg shadow-sm transition-all active:scale-95"
                          >
                            <i className="fas fa-file-word mr-1.5"></i>
                            HWPX
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => {
                            if (!user) {
                              toast({
                                title: "로그인이 필요합니다.",
                                description: "책 구매를 위해 로그인해주세요.",
                                variant: "destructive",
                              });
                              return;
                            }
                            setIsPaymentModalOpen(true);
                          }}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                          <i className="fas fa-shopping-cart mr-2"></i>
                          책구매하기
                        </Button>
                      )
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        onClick={handleAddToCart}
                        className="py-5 rounded-xl border-gray-100 font-bold hover:bg-gray-50 text-xs"
                      >
                        장바구니
                      </Button>
                      <Button
                        variant={isSubscribed ? "default" : "outline"}
                        onClick={handleSubscribe}
                        className={`py-5 rounded-xl font-bold text-xs ${
                          isSubscribed 
                            ? "bg-red-500 hover:bg-red-600 text-white border-red-500" 
                            : "border-gray-200 hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {isSubscribed ? "구독중" : "구독하기"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 저자 미니 카드 */}
              <Card className="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-5">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-indigo-50 shadow-sm">
                    <img src={course?.instructorImageUrl || "https://i.pravatar.cc/150?u=1"} alt="저자" />
                  </Avatar>
                  <div>
                    <h4 className="font-black text-sm text-gray-900">{course?.instructorName || "전문 강사"}</h4>
                    <p className="text-[10px] text-gray-400 mt-1">저자 구독자 {instructor?.subscribers?.toLocaleString() || 0}명</p>
                    <Button variant="link" className="p-0 h-auto text-indigo-600 text-[10px] font-bold mt-1">
                      저자 소식 보기 <i className="fas fa-chevron-right ml-1"></i>
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 이런 점이 좋아요! (특징) - 사이드바 이동 */}
              <Card className="mt-4 bg-white rounded-2xl shadow-md border border-orange-50 p-5">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-orange-500 rounded-full mr-2"></span>
                  이런 점이 좋아요!
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-book-open text-orange-600 text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">핵심 원리 파악</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">핵심만 콕콕 짚어 설명합니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-pencil-alt text-blue-600 text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">실전 적용 훈련</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">단계별 훈련 시스템을 제공합니다.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-chart-line text-green-600 text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-800">성적 향상 보장</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">단기간에 확실한 실력 변화!</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* 자료 구성 미리보기 - 사이드바 이동 (이미지 제외) */}
              <Card className="mt-4 bg-white rounded-2xl shadow-md border border-indigo-50 p-5">
                <h3 className="text-base font-black text-gray-900 mb-4 flex items-center">
                  <span className="w-1 h-5 bg-indigo-600 rounded-full mr-2"></span>
                  자료 구성 미리보기
                </h3>
                <div className="space-y-5">
                  <div className="relative pl-5 border-l border-dashed border-orange-200 ml-1">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-orange-500 rounded-full border border-white"></div>
                    <h4 className="font-bold text-xs text-gray-800">STEP 01. 준비: 기초 다지기</h4>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">필수 개념 정리, 기초 예제 풀이</p>
                  </div>
                  <div className="relative pl-5 border-l border-dashed border-blue-200 ml-1">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-blue-500 rounded-full border border-white"></div>
                    <h4 className="font-bold text-xs text-gray-800">STEP 02. 실전: 심화 적용</h4>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">고난도 분석 기법, 대처 전략</p>
                  </div>
                  <div className="relative pl-5 ml-1">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-purple-500 rounded-full border border-white"></div>
                    <h4 className="font-bold text-xs text-gray-800">STEP 03. 완성: 최종 점검</h4>
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">모의고사 10회분, AI 분석 리포트</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <Footer />

      {/* 하단 고정 책구매 버튼 (모바일용) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-40">
        <div className="flex items-center justify-between mb-2">
          <div>
            {course?.discountPrice && course?.discountPrice < course?.price ? (
              <>
                <div className="text-gray-500 line-through text-sm">
                  {formatPrice(course.price)}원
                </div>
                <div className="text-xl font-bold text-indigo-600">
                  {formatPrice(course.discountPrice)}원
                </div>
              </>
            ) : (
              <div className="text-xl font-bold text-indigo-600">
                {(!course?.price || course?.price === 0) ? "무료" : `${formatPrice(course?.price || 0)}원`}
              </div>
            )}
          </div>
          {course?.discountPrice && course?.discountPrice < course?.price && (
            <Badge className="bg-red-500 hover:bg-red-600">
              {Math.round(
                ((course.price - course.discountPrice) / course.price) * 100,
              )}
              % 할인
            </Badge>
          )}
        </div>
        {(!course?.price || course?.price === 0) ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleDirectDownload(course, 'pdf')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <Printer className="mr-2 h-4 w-4" />
              PDF
            </Button>
            <Button
              onClick={() => handleDirectDownload(course, 'hwpx')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              HWPX
            </Button>
          </div>
        ) : (
          isEnrolled ? (
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <Button
                onClick={() => handleDirectDownload(course, 'pdf')}
                className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-500 py-0 h-10 !rounded-lg whitespace-nowrap cursor-pointer text-sm font-bold shadow-sm"
              >
                <i className="fas fa-file-pdf mr-1.5"></i>
                PDF
              </Button>
              <Button
                onClick={() => handleDirectDownload(course, 'hwpx')}
                className="w-full bg-white hover:bg-blue-50 text-blue-600 border border-blue-500 py-0 h-10 !rounded-lg whitespace-nowrap cursor-pointer text-sm font-bold shadow-sm"
              >
                <i className="fas fa-file-word mr-1.5"></i>
                HWPX
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                if (!user) {
                  toast({
                    title: "로그인이 필요합니다.",
                    description: "책 구매를 위해 로그인해주세요.",
                    variant: "destructive",
                  });
                  return;
                }
                setIsPaymentModalOpen(true);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 !rounded-button whitespace-nowrap cursor-pointer"
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              책구매하기
            </Button>
          )
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>결제 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">강좌명</span>
                <span className="font-medium text-right max-w-[200px] truncate">
                  {course?.title || "강의명"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {course?.discountPrice &&
                  course?.discountPrice < course?.price
                    ? "할인가"
                    : "가격"}
                </span>
                <span className="font-bold text-indigo-600">
                  {formatPrice(
                    course?.discountPrice &&
                      course?.discountPrice < course?.price
                      ? course.discountPrice
                      : course?.price || 0,
                  )}
                  원
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">결제 방법 선택</h4>
              <div className="space-y-2">
                {["신용카드", "무통장입금", "카카오페이"].map((method) => (
                  <div
                    key={method}
                    onClick={() => setSelectedPaymentMethod(method)}
                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${
                      selectedPaymentMethod === method
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedPaymentMethod === method
                          ? "border-indigo-600"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPaymentMethod === method && (
                        <div className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    {method}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="agreement"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label
                htmlFor="agreement"
                className="text-sm text-gray-600 cursor-pointer"
              >
                이용약관 및 결제 진행에 동의합니다
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              취소
            </Button>
            <Button onClick={handlePayment}>
              {formatPrice(
                course?.discountPrice && course?.discountPrice < course?.price
                  ? course.discountPrice
                  : course?.price || 0,
              )}
              원 결제하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Edit Modal */}
      <Dialog open={showQuizEditModal} onOpenChange={setShowQuizEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>퀴 �� 편집</DialogTitle>
          </DialogHeader>
          {editingQuiz && (
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  퀴즈 제목
                </Label>
                <Input
                  value={editingQuiz.title}
                  onChange={(e) =>
                    setEditingQuiz({ ...editingQuiz, title: e.target.value })
                  }
                  placeholder="퀴즈 제목을 입력하세요"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">문제 목록</Label>
                  <Button
                    onClick={() => {
                      const newQuestion = {
                        id: Date.now().toString(),
                        question: "새 문제",
                        type: "multiple" as const,
                        options: [
                          "선택지 1",
                          "선택지 2",
                          "선택지 3",
                          "선택지 4",
                        ],
                        correctAnswer: "선택지 1",
                        explanation: "",
                      };
                      setEditingQuiz({
                        ...editingQuiz,
                        questions: [...editingQuiz.questions, newQuestion],
                      });
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    문제 추가
                  </Button>
                </div>

                <div className="space-y-4">
                  {editingQuiz.questions.map(
                    (question: any, questionIndex: number) => (
                      <div
                        key={question.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">
                            문제 {questionIndex + 1}
                          </h4>
                          <Button
                            onClick={() => {
                              const updatedQuestions =
                                editingQuiz.questions.filter(
                                  (_: any, i: number) => i !== questionIndex,
                                );
                              setEditingQuiz({
                                ...editingQuiz,
                                questions: updatedQuestions,
                              });
                            }}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium mb-1 block">
                              문제
                            </Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => {
                                const updatedQuestions = [
                                  ...editingQuiz.questions,
                                ];
                                updatedQuestions[questionIndex] = {
                                  ...question,
                                  question: e.target.value,
                                };
                                setEditingQuiz({
                                  ...editingQuiz,
                                  questions: updatedQuestions,
                                });
                              }}
                              placeholder="문제를 입력하세요"
                              rows={2}
                            />
                          </div>

                          <div>
                            <Label className="text-sm font-medium mb-1 block">
                              문제 유형
                            </Label>
                            <Select
                              value={question.type}
                              onValueChange={(value) => {
                                const updatedQuestions = [
                                  ...editingQuiz.questions,
                                ];
                                updatedQuestions[questionIndex] = {
                                  ...question,
                                  type: value,
                                };
                                setEditingQuiz({
                                  ...editingQuiz,
                                  questions: updatedQuestions,
                                });
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="multiple">객관식</SelectItem>
                                <SelectItem value="true-false">
                                  참/거짓
                                </SelectItem>
                                <SelectItem value="short-answer">
                                  단답형
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {question.type === "multiple" && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                선택지
                              </Label>
                              <div className="space-y-2">
                                {question.options.map(
                                  (option: string, optionIndex: number) => (
                                    <div
                                      key={optionIndex}
                                      className="flex items-center space-x-2"
                                    >
                                      <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
                                        {optionIndex + 1}
                                      </span>
                                      <Input
                                        value={option}
                                        onChange={(e) => {
                                          const updatedQuestions = [
                                            ...editingQuiz.questions,
                                          ];
                                          const updatedOptions = [
                                            ...question.options,
                                          ];
                                          updatedOptions[optionIndex] =
                                            e.target.value;
                                          updatedQuestions[questionIndex] = {
                                            ...question,
                                            options: updatedOptions,
                                          };
                                          setEditingQuiz({
                                            ...editingQuiz,
                                            questions: updatedQuestions,
                                          });
                                        }}
                                        placeholder={`선택지 ${optionIndex + 1}`}
                                        className="flex-1"
                                      />
                                      <input
                                        type="radio"
                                        name={`correct-${questionIndex}`}
                                        checked={
                                          question.correctAnswer === option
                                        }
                                        onChange={() => {
                                          const updatedQuestions = [
                                            ...editingQuiz.questions,
                                          ];
                                          updatedQuestions[questionIndex] = {
                                            ...question,
                                            correctAnswer: option,
                                          };
                                          setEditingQuiz({
                                            ...editingQuiz,
                                            questions: updatedQuestions,
                                          });
                                        }}
                                        className="text-green-600"
                                      />
                                      <Label className="text-xs text-gray-500">
                                        정답
                                      </Label>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {question.type === "true-false" && (
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                정답
                              </Label>
                              <div className="flex space-x-4">
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`tf-${questionIndex}`}
                                    checked={question.correctAnswer === "true"}
                                    onChange={() => {
                                      const updatedQuestions = [
                                        ...editingQuiz.questions,
                                      ];
                                      updatedQuestions[questionIndex] = {
                                        ...question,
                                        correctAnswer: "true",
                                      };
                                      setEditingQuiz({
                                        ...editingQuiz,
                                        questions: updatedQuestions,
                                      });
                                    }}
                                    className="mr-2"
                                  />
                                  참
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`tf-${questionIndex}`}
                                    checked={question.correctAnswer === "false"}
                                    onChange={() => {
                                      const updatedQuestions = [
                                        ...editingQuiz.questions,
                                      ];
                                      updatedQuestions[questionIndex] = {
                                        ...question,
                                        correctAnswer: "false",
                                      };
                                      setEditingQuiz({
                                        ...editingQuiz,
                                        questions: updatedQuestions,
                                      });
                                    }}
                                    className="mr-2"
                                  />
                                  거짓
                                </label>
                              </div>
                            </div>
                          )}

                          {question.type === "short-answer" && (
                            <div>
                              <Label className="text-sm font-medium mb-1 block">
                                정답
                              </Label>
                              <Input
                                value={question.correctAnswer}
                                onChange={(e) => {
                                  const updatedQuestions = [
                                    ...editingQuiz.questions,
                                  ];
                                  updatedQuestions[questionIndex] = {
                                    ...question,
                                    correctAnswer: e.target.value,
                                  };
                                  setEditingQuiz({
                                    ...editingQuiz,
                                    questions: updatedQuestions,
                                  });
                                }}
                                placeholder="정답을 입력하세요"
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-sm font-medium mb-1 block">
                              해설 (선택사항)
                            </Label>
                            <Textarea
                              value={question.explanation || ""}
                              onChange={(e) => {
                                const updatedQuestions = [
                                  ...editingQuiz.questions,
                                ];
                                updatedQuestions[questionIndex] = {
                                  ...question,
                                  explanation: e.target.value,
                                };
                                setEditingQuiz({
                                  ...editingQuiz,
                                  questions: updatedQuestions,
                                });
                              }}
                              placeholder="문제 해설을 입력하세요"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowQuizEditModal(false)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                // 퀴즈 업데이트 로직 (실제 구현 시 API 호출)
                setShowQuizEditModal(false);
                setEditingQuiz(null);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <i className="fas fa-save mr-2"></i>
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>강의 공유하기</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(course?.imageUrl, "/uploads/images/1.jpg")}
                alt={course?.title || "강의 이미지"}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  const fallbackImages = [
                    "/uploads/images/1.jpg",
                    "/uploads/images/4.jpg",
                    "/uploads/images/5.jpg",
                  ];
                  const randomFallback =
                    fallbackImages[
                      Math.floor(Math.random() * fallbackImages.length)
                    ];
                  e.currentTarget.src = randomFallback;
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">
                  {course?.title || "강의명"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatPrice(
                    course?.discountPrice || course?.price || 0,
                  )}
                  원
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">링크 복사</h4>
              <div className="flex space-x-2">
                <Input
                  value={window.location.href}
                  readOnly
                  className="flex-1 text-sm"
                />
                <Button
                  onClick={handleCopyUrl}
                  variant="outline"
                  className="px-3"
                >
                  <i className="fas fa-copy"></i>
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4">소셜 미디어로 공유</h4>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleSocialShare("kakao")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-yellow-400 rounded"></div>
                  <span>카카오톡</span>
                </Button>
                <Button
                  onClick={() => handleSocialShare("facebook")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                  <span>페이스북</span>
                </Button>
                <Button
                  onClick={() => handleSocialShare("twitter")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-blue-400 rounded"></div>
                  <span>트위터</span>
                </Button>
                <Button
                  onClick={() => handleSocialShare("line")}
                  variant="outline"
                  className="flex items-center justify-center space-x-2 py-3"
                >
                  <div className="w-5 h-5 bg-green-500 rounded"></div>
                  <span>라인</span>
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareModal(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-[95vw] h-[90vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-video text-red-600 mr-2"></i>
              {selectedVideo?.title || "동영상"}
            </DialogTitle>
          </DialogHeader>

          {selectedVideo && (
            <div className="flex flex-1 overflow-hidden gap-6 h-full">
              <div className={`flex flex-col overflow-y-auto space-y-4 pr-2 ${
                parsedCurriculum[selectedVideo.weekIndex]?.analysisMaterials?.length > 0 
                  ? "w-2/3" 
                  : "w-full"
              }`}>
              {/* 동영상 플레이어 */}
              <div
                className="relative bg-black rounded-lg overflow-hidden"
                style={{ aspectRatio: "16/9" }}
              >
                {selectedVideo.type === "youtube" ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      selectedVideo.url.includes("youtube.com") ||
                      selectedVideo.url.includes("youtu.be")
                        ? selectedVideo.url.split("/").pop()?.split("?")[0] ||
                          selectedVideo.url.split("=")[1]?.split("&")[0]
                        : selectedVideo.url
                    }?autoplay=1&rel=0&enablejsapi=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      // 동영상 시청 시작 기록 및 실시간 진행률 타이머 설정
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;

                      // 저장된 진도율 확인 (서버에서 불러온 데이터)
                      const savedProgress = videoProgress[videoKey] || 0;
                      console.log(
                        `Vimeo 동영상 ${videoKey} 저장된 진도율: ${savedProgress}%`,
                      );

                      // 저장된 진도율로 시작
                      setVideoProgress((prev) => ({
                        ...prev,
                        [videoKey]: savedProgress,
                      }));

                      const vimeoDurationMinutes =
                        parseInt(
                          selectedVideo.duration.replace(/[^0-9]/g, ""),
                        ) || 10;
                      const vimeoDurationMs = vimeoDurationMinutes * 60 * 1000;
                      const vimeoIntervalMs = 5000; // 5초마다 업데이트
                      const vimeoTotalIntervals =
                        vimeoDurationMs / vimeoIntervalMs;

                      // 저장된 진도율에 해당하는 구간부터 시작
                      let vimeoCurrentInterval = Math.floor(
                        ((videoProgress[videoKey] || 0) / 100) *
                          vimeoTotalIntervals,
                      );

                      // 5초마다 진행률 업데이트 및 서버 저장
                      const progressTimer = setInterval(async () => {
                        vimeoCurrentInterval++;
                        const progress = Math.min(
                          (vimeoCurrentInterval / vimeoTotalIntervals) * 100,
                          100,
                        );

                        setVideoProgress((prev) => ({
                          ...prev,
                          [videoKey]: progress,
                        }));

                        // 3% 단위로 서버에 저장 (3, 6, 9, 12... 또는 95% 이상)
                        if (
                          (Math.floor(progress) % 3 === 0 &&
                            Math.floor(progress) !== 0) ||
                          progress >= 95
                        ) {
                          try {
                            await handleVideoProgress(
                              videoKey,
                              Math.round(progress),
                            );
                          } catch (error) {
                            console.error("진도율 저장 실패:", error);
                          }
                        }

                        // 90% 이상 시청시 완료 처리
                        if (progress >= 90) {
                          setCompletedVideos((prev) =>
                            new Set(prev).add(videoKey),
                          );
                          clearInterval(progressTimer);
                          toast({
                            title: "동영상 시청 완료!",
                            description: `${selectedVideo.title} 학습이 완료되었습니다.`,
                            variant: "default",
                          });
                        }
                      }, vimeoIntervalMs);

                      setVideoTimer(progressTimer);
                    }}
                  ></iframe>
                ) : selectedVideo.type === "vimeo" ? (
                  <iframe
                    src={`https://player.vimeo.com/video/${
                      selectedVideo.url.includes("vimeo.com")
                        ? selectedVideo.url.split("/").pop()
                        : selectedVideo.url
                    }?autoplay=1`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      // 동영상 시청 시작 기록 및 실시간 진행률 타이머 설정
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;

                      // 저장된 진도율 확인 (서버에서 불러온 데이터)
                      const savedProgress = videoProgress[videoKey] || 0;
                      console.log(
                        `Vimeo 동영상 ${videoKey} 저장된 진도율: ${savedProgress}%`,
                      );

                      // 저장된 진도율로 시작
                      setVideoProgress((prev) => ({
                        ...prev,
                        [videoKey]: savedProgress,
                      }));

                      const vimeoDurationMinutes =
                        parseInt(
                          selectedVideo.duration.replace(/[^0-9]/g, ""),
                        ) || 10;
                      const vimeoDurationMs = vimeoDurationMinutes * 60 * 1000;
                      const vimeoIntervalMs = 5000; // 5초마다 업데이트
                      const vimeoTotalIntervals =
                        vimeoDurationMs / vimeoIntervalMs;

                      // 저장된 진도율에 해당하는 구간부터 시작
                      let vimeoCurrentInterval = Math.floor(
                        ((videoProgress[videoKey] || 0) / 100) *
                          vimeoTotalIntervals,
                      );

                      // 5초마다 진행률 업데이트 및 서버 저장
                      const progressTimer = setInterval(async () => {
                        vimeoCurrentInterval++;
                        const progress = Math.min(
                          (vimeoCurrentInterval / vimeoTotalIntervals) * 100,
                          100,
                        );

                        setVideoProgress((prev) => ({
                          ...prev,
                          [videoKey]: progress,
                        }));

                        // 3% 단위로 서버에 저장 (3, 6, 9, 12... 또는 95% 이상)
                        if (
                          (Math.floor(progress) % 3 === 0 &&
                            Math.floor(progress) !== 0) ||
                          progress >= 95
                        ) {
                          try {
                            await handleVideoProgress(
                              videoKey,
                              Math.round(progress),
                            );
                          } catch (error) {
                            console.error("진도율 저장 실패:", error);
                          }
                        }

                        // 90% 이상 시청시 완료 처리
                        if (progress >= 90) {
                          setCompletedVideos((prev) =>
                            new Set(prev).add(videoKey),
                          );
                          clearInterval(progressTimer);
                          toast({
                            title: "동영상 시청 완료!",
                            description: `${selectedVideo.title} 학습이 완료되었습니다.`,
                            variant: "default",
                          });
                        }
                      }, vimeoIntervalMs);

                      setVideoTimer(progressTimer);
                    }}
                  ></iframe>
                ) : (
                  <video
                    controls
                    autoPlay
                    className="w-full h-full"
                    onLoadedMetadata={(e) => {
                      const video = e.target as HTMLVideoElement;
                      setVideoDuration(video.duration);

                      // 저장된 진도율 확인하여 해당 위치로 이동
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                      const savedProgress = videoProgress[videoKey] || 0;

                      if (savedProgress > 0) {
                        const savedTime =
                          (savedProgress / 100) * video.duration;
                        video.currentTime = savedTime;
                        console.log(
                          `비디오 ${videoKey} 저장된 위치로 이동: ${savedProgress}% (${savedTime.toFixed(1)}초)`,
                        );
                      }
                    }}
                    onTimeUpdate={async (e) => {
                      const video = e.target as HTMLVideoElement;
                      const actualProgress =
                        (video.currentTime / video.duration) * 100;
                      const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                      setCurrentVideoTime(video.currentTime);

                      // 실시간 진도율 업데이트
                      setVideoProgress((prev) => ({
                        ...prev,
                        [videoKey]: actualProgress,
                      }));

                      // 10초마다 또는 10% 단위로 서버에 저장
                      const currentTime = Math.floor(video.currentTime);
                      if (currentTime % 10 === 0 || actualProgress >= 90) {
                        try {
                          await handleVideoProgress(
                            videoKey,
                            Math.round(actualProgress),
                          );
                        } catch (error) {
                          console.error("진도율 저장 실패:", error);
                        }
                      }

                      // 90% 이상 시청시 완료 처리
                      if (actualProgress >= 90) {
                        setCompletedVideos((prev) =>
                          new Set(prev).add(videoKey),
                        );
                        toast({
                          title: "동영상 시청 완료!",
                          description: `${selectedVideo.title} 학습이 완료되었습니다.`,
                          variant: "default",
                        });
                      }
                    }}
                  >
                    <source src={selectedVideo.url} type="video/mp4" />
                    동영상을 재생할 수 없습니다.
                  </video>
                )}

                {/* 시청 시간 카운터 모달 */}
                <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-sm"></i>
                    <span className="text-sm font-medium">
                      {(() => {
                        const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                        const progress = videoProgress[videoKey] || 0;
                        const isCompleted = completedVideos.has(videoKey);

                        if (isCompleted) return "완료";

                        const durationMinutes =
                          parseInt(
                            selectedVideo.duration.replace(/[^0-9]/g, ""),
                          ) || 10;
                        const elapsedMinutes = Math.floor(
                          (durationMinutes * progress) / 100,
                        );
                        const remainingMinutes = Math.max(
                          0,
                          durationMinutes - elapsedMinutes,
                        );
                        const remainingSeconds =
                          Math.floor(
                            (durationMinutes * 60 * (100 - progress)) / 100,
                          ) % 60;

                        return remainingMinutes > 0
                          ? `${remainingMinutes}:${remainingSeconds.toString().padStart(2, "0")} 남음`
                          : `${remainingSeconds}초 남음`;
                      })()}
                    </span>
                  </div>

                  {/* 진행률 바 추가 */}
                  <div className="mt-2 w-32 bg-gray-600 rounded-full h-1">
                    <div
                      className="bg-white h-1 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(() => {
                          const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                          return Math.min(videoProgress[videoKey] || 0, 100);
                        })()}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 동영상 정보 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-play text-red-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedVideo.title}</h4>
                    <p className="text-sm text-gray-600">
                      재생 시간: {selectedVideo.duration}
                    </p>
                  </div>
                </div>

                {/* 진행 상황 표시 */}
                <div className="flex items-center space-x-2">
                  {(() => {
                    const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                    const progress = videoProgress[videoKey] || 0;
                    const isCompleted = completedVideos.has(videoKey);

                    return (
                      <>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${isCompleted ? "bg-green-600" : "bg-blue-600"}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(progress)}%
                        </span>
                        {isCompleted && (
                          <Badge className="bg-green-100 text-green-700">
                            완료
                          </Badge>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

              {/* Analysis Sidebar */}
              {(parsedCurriculum[selectedVideo.weekIndex]?.analysisMaterials?.length > 0 || (course?.analysisMaterials && course.analysisMaterials.length > 0)) && (
                <div className="w-1/3 bg-gray-50 border rounded-lg flex flex-col overflow-hidden h-full">
                   <div className="p-4 border-b bg-white font-bold text-lg flex items-center gap-2">
                     <i className="fas fa-book-reader text-blue-600"></i>
                     본문 분석 자료
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* 교재 공통 분석 자료 (신규) */}
                      {course?.analysisMaterials && course.analysisMaterials.map((m: any) => (
                        <div key={m.id} className="mb-4 border rounded-lg bg-white overflow-hidden shadow-sm">
                          <div className="py-2 px-3 bg-gray-50 border-b flex justify-between items-center">
                            <h5 className="font-semibold text-sm text-gray-800 truncate">{m.name}</h5>
                            <Badge variant="outline" className="text-xs">전체공통</Badge>
                          </div>
                          <div className="p-3">
                            {m.url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => window.open(m.url, "_blank")}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                자료 보기 (PDF/HWPX)
                              </Button>
                            ) : (
                              <p className="text-xs text-gray-500 text-center py-2">자료가 준비 중입니다.</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* 차시별 분석 자료 (기존) */}
                      {parsedCurriculum[selectedVideo.weekIndex]?.analysisMaterials?.map((m: any) => (
                        <div key={m.id} className="space-y-2">
                          <AnalysisViewer seminarId={m.seminarId} title={m.title} />
                          <Link href={`/analysis/${m.seminarId}`}>
                            <Button 
                              size="sm" 
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm gap-2"
                            >
                              <BookOpen className="h-4 w-4" />
                              심층 분석 뷰어로 보기
                            </Button>
                          </Link>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {/* 시청완료 표시 버튼 제거 - 시간에 따라 자동으로 완료 처리됨 */}
            <Button
              variant="outline"
              onClick={async () => {
                // 동영상 모달 닫기 전 현재 진도율 저장
                if (selectedVideo && videoProgress) {
                  const videoKey = `${selectedVideo.weekIndex}-${selectedVideo.id}`;
                  const currentProgress = videoProgress[videoKey] || 0;

                  if (currentProgress > 0) {
                    try {
                      await handleVideoProgress(
                        videoKey,
                        Math.round(currentProgress),
                      );
                      console.log(
                        `진도율 저장: ${videoKey} = ${Math.round(currentProgress)}%`,
                      );
                    } catch (error) {
                      console.error("진도율 저장 실패:", error);
                    }
                  }
                }

                // 타이머 정리
                if (videoTimer) {
                  clearInterval(videoTimer);
                  setVideoTimer(null);
                }
                setShowVideoModal(false);
              }}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quiz Modal */}
      <Dialog open={showQuizModal} onOpenChange={setShowQuizModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-question-circle text-green-600 mr-2"></i>
              {selectedQuiz?.title || "퀴즈"}
            </DialogTitle>
          </DialogHeader>

          {selectedQuiz && (
            <div className="space-y-6">
              {/* 퀴즈 정보 */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <i className="fas fa-clipboard-question text-green-600"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{selectedQuiz.title}</h4>
                    <p className="text-sm text-gray-600">
                      총 {selectedQuiz.questions?.length || 0}문제
                    </p>
                  </div>
                </div>

                {(() => {
                  const quizKey = `${selectedQuiz.weekIndex}-${selectedQuiz.id}`;
                  const isCompleted = completedQuizzes.has(quizKey);

                  return (
                    isCompleted && (
                      <Badge className="bg-green-100 text-green-700">
                        완료
                      </Badge>
                    )
                  );
                })()}
              </div>

              {/* 퀴즈 문제들 */}
              {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                <div className="space-y-6">
                  {selectedQuiz.questions.map(
                    (question: any, questionIndex: number) => (
                      <div
                        key={questionIndex}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-3 mb-4">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-1">
                            {questionIndex + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 mb-3">
                              {question.question}
                            </h4>

                            {/* 객관식 */}
                            {question.type === "multiple" &&
                              question.options && (
                                <div className="space-y-2">
                                  {question.options.map(
                                    (option: string, optionIndex: number) => (
                                      <label
                                        key={optionIndex}
                                        className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                      >
                                        <input
                                          type="radio"
                                          name={`question-${questionIndex}`}
                                          value={option}
                                          onChange={(e) => {
                                            setQuizAnswers((prev) => ({
                                              ...prev,
                                              [`question-${questionIndex}`]:
                                                e.target.value,
                                            }));
                                          }}
                                          className="text-green-600 focus:ring-green-500"
                                        />
                                        <span className="flex-1">{option}</span>
                                      </label>
                                    ),
                                  )}
                                </div>
                              )}

                            {/* 참/거짓 */}
                            {question.type === "true-false" && (
                              <div className="space-y-2">
                                <label className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`question-${questionIndex}`}
                                    value="true"
                                    onChange={(e) => {
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [`question-${questionIndex}`]:
                                          e.target.value,
                                      }));
                                    }}
                                    className="text-green-600 focus:ring-green-500"
                                  />
                                  <span>참</span>
                                </label>
                                <label className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`question-${questionIndex}`}
                                    value="false"
                                    onChange={(e) => {
                                      setQuizAnswers((prev) => ({
                                        ...prev,
                                        [`question-${questionIndex}`]:
                                          e.target.value,
                                      }));
                                    }}
                                    className="text-green-600 focus:ring-green-500"
                                  />
                                  <span>거짓</span>
                                </label>
                              </div>
                            )}

                            {/* 단답형 */}
                            {question.type === "short-answer" && (
                              <Input
                                placeholder="답을 입력하세요"
                                onChange={(e) => {
                                  setQuizAnswers((prev) => ({
                                    ...prev,
                                    [`question-${questionIndex}`]:
                                      e.target.value,
                                  }));
                                }}
                                className="mt-2"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={async () => {
                try {
                  if (!selectedQuiz?.questions) return;

                  // 답변 배열 생성
                  const answers = selectedQuiz.questions.map(
                    (_: any, index: number) => ({
                      answer: quizAnswers[`question-${index}`] || "",
                    }),
                  );

                  // 퀴즈 제출 처리
                  await handleQuizSubmit(answers);
                } catch (error) {
                  console.error("퀴즈 제출 중 오류:", error);
                }
              }}
              className="w-full"
              disabled={!Object.keys(quizAnswers).length}
            >
              제출하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              후기 작성
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 강의 정보 */}
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <img
                src={getImageUrl(course?.imageUrl, "/uploads/images/1.jpg")}
                alt={course?.title || "강의 이미지"}
                className="w-16 h-16 object-cover rounded"
                onError={(e) => {
                  const fallbackImages = [
                    "/uploads/images/1.jpg",
                    "/uploads/images/4.jpg",
                    "/uploads/images/5.jpg",
                  ];
                  const randomFallback =
                    fallbackImages[
                      Math.floor(Math.random() * fallbackImages.length)
                    ];
                  e.currentTarget.src = randomFallback;
                }}
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">
                  {course?.title || "강의명"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {course?.instructorName || "강사명"}
                </p>
              </div>
            </div>

            {/* 별점 선택 */}
            <div>
              <h4 className="font-medium mb-3">별점을 선택해주세요</h4>
              <div className="flex justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className={`text-3xl transition-colors ${
                      star <= newReviewRating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } hover:text-yellow-400`}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                {newReviewRating}점 선택됨
              </p>
            </div>

            {/* 후기 내용 */}
            <div>
              <h4 className="font-medium mb-3">후기를 작성해주세요</h4>
              <Textarea
                value={newReviewContent}
                onChange={(e) => setNewReviewContent(e.target.value)}
                placeholder="강의에 대한 솔직한 후기를 작성해주세요. 다른 수강생들에게 도움이 됩니다."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {newReviewContent.length}/500자
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReviewModal(false);
                setNewReviewContent("");
                setNewReviewRating(5);
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={!newReviewContent.trim() || reviewMutation.isPending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {reviewMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  등록 중...
                </>
              ) : (
                <>
                  <i className="fas fa-star mr-2"></i>
                  후기 등록
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
