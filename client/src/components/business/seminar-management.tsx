import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
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
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  X,
  Check,
  Upload,
  FileText,
  Loader2,
  Settings,
  Download,
  Printer,
  Search,
  Key,
  Sparkles,
  ChevronRight,
  BookOpenCheck,
  Copy,
  Paperclip,
  MessageSquarePlus,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import SentenceAnalysisViewer from "@/components/learning/sentence-analysis-viewer";

interface SeminarManagementProps {
  user: any;
}

export default function SeminarManagement({ user }: SeminarManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // View State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1); // 1: Archive, 2: Select TOC, 3: Details

  // Data State for Create Flow
  const [analyzedData, setAnalyzedData] = useState<any>(null);
  const [selectedTocIds, setSelectedTocIds] = useState<string[]>([]);
  const [selectedAnalysisTypes, setSelectedAnalysisTypes] = useState<number[]>([1]); // 1: 본문분석, 2: 워크북, 3: 변형문제
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Level State for Analysis
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Preset State for AI Problem Generation
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // RAG & Custom Prompt State
  const [ragFile, setRagFile] = useState<File | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // 저장된 프롬프트 다이얼로그 상태
  const [showSavePromptDialog, setShowSavePromptDialog] = useState(false);
  const [showSavedPromptList, setShowSavedPromptList] = useState(false);
  const [savePromptName, setSavePromptName] = useState("");

  type SavedPrompt = { id: number; name: string; content: string; created_at: string };

  // 저장된 프롬프트 목록 조회
  const { data: savedPrompts, refetch: refetchSavedPrompts } = useQuery<SavedPrompt[]>({
    queryKey: ["/api/saved-prompts"],
    enabled: showSavedPromptList,
  });

  // 프롬프트 저장 뮤테이션
  const savePromptMutation = useMutation({
    mutationFn: async ({ name, content }: { name: string; content: string }) => {
      const res = await fetch("/api/saved-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      setShowSavePromptDialog(false);
      setSavePromptName("");
      refetchSavedPrompts();
      toast({ title: "저장 완료", description: "추가 지시사항이 저장되었습니다." });
    },
    onError: () => toast({ title: "저장 실패", variant: "destructive" }),
  });

  // 프롬프트 삭제 뮤테이션
  const deletePromptMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/saved-prompts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    },
    onSuccess: () => refetchSavedPrompts(),
    onError: () => toast({ title: "삭제 실패", variant: "destructive" }),
  });

  // Category State
  const [selectedCategory, setSelectedCategory] = useState<string>("analysis");
  const [searchTerm, setSearchTerm] = useState("");
  
  const subjects = [
    {
      name: "영어",
      items: [
        { id: "word", label: "단어", badge: "Free" },
        { id: "analysis", label: "본문분석" },
        { id: "workbook", label: "워크북" },
        { id: "variant", label: "변형문제" },
        { id: "school", label: "학교별 기출적중" },
      ]
    },
    {
      name: "국어",
      items: [
        { id: "variant_kr", label: "변형문제", badge: "New" },
      ]
    },
    {
      name: "수학",
      items: [
        { id: "variant_math", label: "변형문제", badge: "New" },
      ]
    },
    {
      name: "과학",
      items: [
        { id: "variant_science", label: "변형문제", badge: "New" },
      ]
    },
    {
      name: "사회",
      items: [
        { id: "variant_social", label: "변형문제", badge: "New" },
      ]
    }
  ];

  const [showUploadArea, setShowUploadArea] = useState(false);

  // Helper to count items per category
  const getCategoryCount = (categoryId: string) => {
    if (!mySeminars?.seminars) return 0;
    
    const typeMap: Record<string, string> = {
      "word": "단어",
      "analysis": "영어지문", // Updated to match new default
      "workbook": "워크북",
      "variant": "변형문제",
      "school": "기출적중",
      "variant_kr": "변형문제_국어",
      "variant_math": "변형문제_수학",
      "variant_science": "변형문제_과학",
      "variant_social": "변형문제_사회"
    };

    const tagMap: Record<string, string> = {
      "analysis": "1",
      "workbook": "2",
      "variant": "3",
      "variant_kr": "3",
      "variant_math": "3",
      "variant_science": "3",
      "variant_social": "3"
    };

    const categoryName = typeMap[categoryId];
    const tagId = tagMap[categoryId];

    return mySeminars.seminars.filter((s: any) => {
      if (s.type === categoryName) return true;
      // Legacy support for '본문분석'
      if (categoryId === 'analysis' && s.type === '본문분석') return true;
      
      if (tagId && s.tags) {
        const tags = String(s.tags).split(',').map(t => t.trim());
        if (tags.includes(tagId)) return true;
      }
      if (categoryId === "variant_kr" && s.type === "변형문제_국어") return true;
      if (categoryId === "variant_math" && s.type === "변형문제_수학") return true;
      if (categoryId === "variant_science" && s.type === "변형문제_과학") return true;
      if (categoryId === "variant_social" && s.type === "변형문제_사회") return true;
      return false;
    }).length;
  };
  
  // API Key State
  const [apiKey, setApiKey] = useState(localStorage.getItem("gemini_api_key") || "");
  const [aiModel, setAiModel] = useState(localStorage.getItem("gemini_model") || "gemini-2.5-flash");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [tempAiModel, setTempAiModel] = useState("gemini-2.5-flash");

  // Sync temp state when dialog opens
  useEffect(() => {
    if (showApiKeyDialog) {
      setTempApiKey(apiKey);
      setTempAiModel(aiModel);
    }
  }, [showApiKeyDialog, apiKey, aiModel]);

  // Effect to render math when content changes
  useEffect(() => {
    if (currentStep === 3 && (selectedCategory.includes("math") || selectedCategory.includes("science") || selectedCategory.includes("variant"))) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        if ((window as any).renderMathInElement) {
          const element = document.getElementById('analysis-content');
          const element2 = document.getElementById('analysis-content-answers');
          
          const options = {
            delimiters: [
              {left: '$$', right: '$$', display: true},
              {left: '$', right: '$', display: false},
              {left: '\\(', right: '\\)', display: false},
              {left: '\\[', right: '\\]', display: true}
            ],
            throwOnError: false
          };

          if (element) (window as any).renderMathInElement(element, options);
          if (element2) (window as any).renderMathInElement(element2, options);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentStep, analyzedData, selectedCategory]);

  // Existing states (reused for list & edit)
  const [editingSeminar, setEditingSeminar] = useState<any>(null);
  const [showSampleImages, setShowSampleImages] = useState(false);

  // Form State
  const [seminarForm, setSeminarForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    location: "",
    type: "영어지문",
    maxParticipants: "",
    imageUrl: "",
    organizer: "",
    program: "",
    benefits: "",
    requirements: "",
    price: "",
    duration: "",
    tags: "",
    contactPhone: "",
    contactEmail: "",
    programSchedule: [] as any[], 
  });

  // Queries
  const { data: mySeminars, isLoading: seminarsLoading } = useQuery<{ seminars: any[] }>({
    queryKey: [`/api/business/seminars/${user?.id}`, user?.id],
    enabled: !!user?.id,
  });

  // 프롬프트 프리셋 목록 조회 (관리자가 설정한 활성화된 유형)
  const { data: promptTemplates, isLoading: promptTemplatesLoading } = useQuery<
    Array<{ id: number; type: string; name: string }>
  >({
    queryKey: ["/api/prompt-templates"],
  });

  // Analyze Mutation
  const analyzeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", selectedCategory);
      formData.append("level", selectedLevel);
      if (selectedPreset) {
        formData.append("presetType", selectedPreset);
      }
      // RAG 참고 파일 첨부
      if (ragFile) {
        formData.append("ragFile", ragFile);
      }
      // 사용자 커스텀 프롬프트
      if (customPrompt.trim()) {
        formData.append("customPrompt", customPrompt.trim());
      }
      
      const headers: Record<string, string> = {};
      if (apiKey) {
        headers["x-gemini-api-key"] = apiKey;
        headers["x-gemini-model"] = aiModel;
      }

      const res = await fetch("/api/business/analyze-file", {
        method: "POST",
        headers,
        body: formData,
      });
      if (!res.ok) throw new Error("분석 실패");
      return res.json();
    },
    onSuccess: (data) => {
      if (!data.aiAnalysis) {
          data.aiAnalysis = {
            title: data.filename,
            sentences: [],
            structure: { summary: "", sections: [] },
            vocabulary: []
          };
      }
      
      setAnalyzedData(data);
      if (data.toc) {
        setSelectedTocIds(data.toc.map((item: any) => item.id));
      }
      setCurrentStep(2);
      setIsAnalyzing(false);
      
      const levelMap: Record<string, string> = {
        "middle1": "중1", "middle2": "중2", "middle3": "중3",
        "high1": "고1", "high2": "고2", "high3": "고3"
      };
      const prefix = levelMap[selectedLevel] ? `${levelMap[selectedLevel]} ` : "";

      // Use AI extracted title if available and valid, otherwise use filename
      let finalTitle = data.filename.split('.')[0];
      if (data.aiAnalysis?.title && 
          data.aiAnalysis.title !== "Document Title" && 
          data.aiAnalysis.title !== "문서 제목" &&
          data.aiAnalysis.title.trim() !== "") {
        finalTitle = data.aiAnalysis.title;
      }

      setSeminarForm(prev => ({
        ...prev,
        title: `${prefix}${finalTitle}`,
        description: data.aiAnalysis?.structure?.summary || "",
        program: JSON.stringify(data.aiAnalysis)
      }));
    },
    onError: () => {
      setIsAnalyzing(false);
      toast({ title: "분석 실패", description: "파일 분석 중 오류가 발생했습니다.", variant: "destructive" });
    }
  });

    const seminarMutation = useMutation({
    mutationFn: async (data: any) => {
      const seminarData = {
        ...data,
        providerId: user?.id,
        price: data.price ? parseInt(data.price) : 0,
        maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
        // Add source material info for saving to source_materials table
        sourceMaterial: analyzedData ? {
          fileName: analyzedData.filename,
          fileUrl: analyzedData.fileUrl,
          fileType: analyzedData.fileType || "file"
        } : undefined
      };

      if (editingSeminar) {
        return apiRequest("PUT", `/api/business/seminars/${editingSeminar.id}`, seminarData);
      } else {
        return apiRequest("POST", "/api/business/seminars", seminarData);
      }
    },
    onSuccess: (data: any) => {
      const newSeminar = data;
      const queryKey = [`/api/business/seminars/${user?.id}`, user?.id];
      
      // Manually update the cache to show the new item immediately
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        
        if (editingSeminar) {
          return {
            ...old,
            seminars: old.seminars.map((s: any) => s.id === newSeminar.id ? newSeminar : s)
          };
        } else {
          return {
            ...old,
            seminars: [newSeminar, ...(old.seminars || [])]
          };
        }
      });

      queryClient.invalidateQueries({ queryKey });
      toast({ title: editingSeminar ? "수정 완료" : "등록 완료", description: "자료가 성공적으로 저장되었습니다." });
      resetCreateFlow();
    },
    onError: (error) => {
      toast({ title: "저장 실패", description: error.message, variant: "destructive" });
    }
  });

  const deleteSeminarMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/business/seminars/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/business/seminars/${user?.id}`, user?.id] });
      toast({ title: "삭제 완료", description: "자료가 성공적으로 삭제되었습니다." });
    }
  });

  const resetCreateFlow = () => {
    setCurrentStep(1);
    setAnalyzedData(null);
    setUploadedFile(null);
    setRagFile(null);
    setCustomPrompt("");
    setShowAdvancedOptions(false);
    setSelectedTocIds([]);
    setSelectedAnalysisTypes([1]);
    setShowUploadArea(false);
    setEditingSeminar(null);
    
    // Reset type based on current category to prevent mismatch
    const typeMap: any = { 
      "word": "단어", "analysis": "영어지문", "workbook": "워크북", "variant": "변형문제", "school": "기출적중", 
      "variant_kr": "변형문제_국어", "variant_math": "변형문제_수학", "variant_science": "변형문제_과학", "variant_social": "변형문제_사회" 
    };
    const defaultType = typeMap[selectedCategory] || "영어지문";

    setSeminarForm({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      location: "",
      type: defaultType,
      maxParticipants: "",
      imageUrl: "",
      organizer: "",
      program: "",
      benefits: "",
      requirements: "",
      price: "",
      duration: "",
      tags: "",
      contactPhone: "",
      contactEmail: "",
      programSchedule: [],
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setUploadedFile(e.target.files[0]);
  };

  const startAnalysis = () => {
    if (!uploadedFile) return;
    setIsAnalyzing(true);
    analyzeMutation.mutate(uploadedFile);
  };

  const handleEditSeminar = (seminar: any) => {
    setEditingSeminar(seminar);
    let formattedDate = "";
    if (seminar.date) {
      try {
        const date = new Date(seminar.date);
        if (!isNaN(date.getTime())) {
          const offset = date.getTimezoneOffset() * 60000;
          formattedDate = (new Date(date.getTime() - offset)).toISOString().split('T')[0];
        }
      } catch (e) {}
    }

    setSeminarForm({
      title: seminar.title || "",
      description: seminar.description || "",
      date: formattedDate || new Date().toISOString().split('T')[0],
      location: seminar.location || "",
      type: seminar.type || "영어지문",
      maxParticipants: seminar.maxParticipants?.toString() || "",
      imageUrl: seminar.imageUrl || "",
      organizer: seminar.organizer || "",
      program: seminar.program || "",
      benefits: seminar.benefits || "",
      requirements: seminar.requirements || "",
      price: seminar.price?.toString() || "",
      duration: seminar.duration || "",
      tags: typeof seminar.tags === 'string' ? seminar.tags : Array.isArray(seminar.tags) ? seminar.tags.join(",") : "",
      contactPhone: seminar.contactPhone || "",
      contactEmail: seminar.contactEmail || "",
      programSchedule: seminar.programSchedule || [],
    });
    
    if (seminar.tags) {
      const types = String(seminar.tags).split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t));
      if (types.length > 0) setSelectedAnalysisTypes(types);
    }

    setCurrentStep(3);
    
    let aiAnalysis = null;
    if (seminar.program) {
       try {
         let current = seminar.program;
         for (let i = 0; i < 5; i++) {
           if (typeof current === 'string' && (current.trim().startsWith('{') || current.trim().startsWith('[') || current.trim().startsWith('"'))) {
             current = JSON.parse(current);
           } else break;
         }
         aiAnalysis = current;
       } catch (e) {}
    } 
    
    setAnalyzedData({
        filename: seminar.title,
        textLength: (seminar.description || "").length,
        aiAnalysis: aiAnalysis || { sentences: [], structure: { summary: "", sections: [] }, vocabulary: [] }
    });
  };

  const downloadHwpx = (analysis: any, title: string) => {
    if (!analysis) return;
    
    const sentences = analysis.sentences || [];
    const structure = analysis.structure || { summary: "", sections: [] };
    const vocabulary = analysis.vocabulary || [];

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>
      <style>
        body { font-family: 'Malgun Gothic', 'Dotum', sans-serif; line-height: 1.6; color: #333; }
        .main-title { font-size: 28pt; font-weight: bold; text-align: center; color: #1a202c; margin-bottom: 40pt; }
        .section-title { font-size: 18pt; font-weight: 800; color: #2d3748; border-bottom: 3pt solid #4a5568; padding-bottom: 8pt; margin-top: 30pt; margin-bottom: 15pt; }
        .sub-section-title { font-size: 14pt; font-weight: bold; color: #4a5568; margin-top: 20pt; margin-bottom: 10pt; }
        
        /* Summary Box */
        .summary-container { border: 1pt solid #e2e8f0; border-radius: 10pt; padding: 20pt; background-color: #f8fafc; margin-bottom: 20pt; }
        .summary-item { margin-bottom: 15pt; }
        .summary-label { display: inline-block; padding: 2pt 8pt; background-color: #edf2f7; color: #4a5568; font-size: 9pt; font-weight: bold; border-radius: 4pt; margin-bottom: 5pt; }
        .summary-content { font-size: 12pt; font-weight: bold; color: #1a202c; }
        .summary-translation { font-size: 10pt; color: #718096; margin-top: 3pt; }

        /* Structure Section */
        .structure-item { border-left: 3pt solid #3182ce; padding-left: 15pt; margin-bottom: 20pt; }
        .structure-type { font-size: 10pt; font-weight: 800; color: #3182ce; text-transform: uppercase; margin-bottom: 5pt; }
        .structure-text { font-size: 12pt; font-weight: bold; color: #2d3748; }
        .structure-translation { font-size: 10pt; color: #718096; }

        /* Sentence Analysis */
        .sentence-row { margin-bottom: 40pt; page-break-inside: avoid; }
        .sentence-num { font-size: 24pt; font-weight: 200; color: #cbd5e0; margin-bottom: 10pt; }
        
        /* Annotation Style for Sentences */
        .analysis-container { margin-bottom: 15pt; padding: 10pt 0; }
        .word-group { display: inline-block; margin: 0 2pt 15pt 2pt; text-align: center; vertical-align: bottom; }
        .word-text { font-size: 14pt; font-family: serif; border-bottom: 1pt solid #cbd5e0; padding: 0 2pt; }
        .word-annotation { font-size: 8pt; color: #a0aec0; margin-top: 2pt; }
        .bracket { font-size: 18pt; color: #4299e1; font-weight: bold; vertical-align: middle; }

        .translation-box { background-color: #f7fafc; padding: 12pt; border-radius: 8pt; margin-top: 10pt; }
        .translation-text { font-size: 12pt; font-weight: 600; color: #4a5568; }
        
        .grammar-item { font-size: 10pt; color: #718096; margin-top: 8pt; padding-left: 10pt; border-left: 2pt solid #edf2f7; }
        
        /* Vocab Table */
        table { width: 100%; border-collapse: collapse; margin-top: 15pt; }
        th { background-color: #f8fafc; text-align: left; padding: 10pt; border-bottom: 2pt solid #e2e8f0; font-size: 10pt; color: #4a5568; }
        td { padding: 10pt; border-bottom: 1pt solid #edf2f7; vertical-align: top; }
        .vocab-word { font-weight: 800; color: #2d3748; font-size: 11pt; }
        .vocab-meaning { color: #718096; font-size: 10pt; }
      </style>
      </head>
      <body>
        <div class="main-title">${title}</div>

        <div class="section-title">1. 제목, 주제 및 요약</div>
        <div class="summary-container">
          <div class="summary-item">
            <div class="summary-label">TITLE</div>
            <div class="summary-content">${structure.title || title}</div>
            <div class="summary-translation">${structure.titleTranslation || ""}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">SUBJECT</div>
            <div class="summary-content">${structure.subject || "주제 정보 없음"}</div>
            <div class="summary-translation">${structure.subjectTranslation || ""}</div>
          </div>
          <div class="summary-item" style="margin-bottom: 0;">
            <div class="summary-label">SUMMARY</div>
            <div class="summary-content">${structure.summary || "요약 정보 없음"}</div>
            <div class="summary-translation">${structure.summaryTranslation || ""}</div>
          </div>
        </div>

        <div class="section-title">2. 지문 구조 분석</div>
        <div style="margin-bottom: 30pt;">
          ${(structure.sections || []).map((sec: any) => `
            <div class="structure-item">
              <div class="structure-type">${sec.type || "SECTION"}</div>
              <div class="structure-text">${sec.text || sec.content}</div>
              <div class="structure-translation">${sec.translation || ""}</div>
            </div>
          `).join('')}
        </div>

        <div class="section-title">3. 심층 구문 분석</div>
        ${sentences.map((s: any, i: number) => {
          const parts = Array.isArray(s.analysisParts) ? s.analysisParts : [];
          return `
            <div class="sentence-row">
              <div class="sentence-num">${String(i + 1).padStart(2, '0')}</div>
              
              <div class="analysis-container">
                ${parts.length > 0 ? parts.map((part: any) => `
                  <span class="word-group">
                    ${part.bracket === 'open' ? '<span class="bracket">[</span>' : ''}
                    <div style="display: inline-block; text-align: center;">
                      <div class="word-text" style="${part.color ? `border-bottom: 2pt solid ${part.color === 'red' ? '#fc8181' : part.color === 'blue' ? '#63b3ed' : '#f6ad55'}; color: ${part.color === 'red' ? '#e53e3e' : part.color === 'blue' ? '#3182ce' : '#dd6b20'};` : ''}">
                        ${part.text}
                      </div>
                      ${part.annotation ? `<div class="word-annotation" style="${part.color ? `color: ${part.color === 'red' ? '#fc8181' : part.color === 'blue' ? '#63b3ed' : '#f6ad55'};` : ''}">${part.annotation}</div>` : ''}
                    </div>
                    ${part.bracket === 'close' ? '<span class="bracket">]</span>' : ''}
                  </span>
                `).join('') : `<div class="word-text">${s.analysis || s.original}</div>`}
              </div>

              <div class="translation-box">
                <div class="translation-text">${s.translation}</div>
                ${s.grammarPoints ? (Array.isArray(s.grammarPoints) ? s.grammarPoints : [s.grammarPoints]).map((p:string) => `
                  <div class="grammar-item">• ${p}</div>
                `).join('') : ''}
              </div>

              ${s.vocabulary && s.vocabulary.length > 0 ? `
                <div style="margin-top: 10pt; display: flex; flex-wrap: wrap; gap: 5pt;">
                  ${s.vocabulary.map((v: any) => `
                    <span style="font-size: 9pt; background-color: #f1f5f9; padding: 2pt 6pt; border-radius: 4pt; color: #475569;">
                      <strong>${v.word}</strong>: ${v.meaning}
                    </span>
                  `).join(' ')}
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}

        <div class="section-title">4. 핵심 어휘 정리</div>
        <table>
          <thead>
            <tr>
              <th width="30%">WORD</th>
              <th>MEANING / DEFINITION</th>
            </tr>
          </thead>
          <tbody>
            ${vocabulary.map((v: any) => `
              <tr>
                <td class="vocab-word">${v.word}</td>
                <td class="vocab-meaning">${v.meaning}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.hwpx`;
    link.click();
  };

  // ─── 문제 유형 프리셋 우측 패널 ────────────────────────────────────────────
  const renderPresetPanel = () => {
    const selectedTemplateName = promptTemplates?.find(
      (t) => t.type === selectedPreset
    )?.name;

    return (
      <div className="w-52 flex flex-col h-full bg-white border-l shrink-0">
        {/* 패널 헤더 */}
        <div className="p-4 pb-3 border-b bg-gradient-to-b from-purple-50/80 to-white shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-purple-100 rounded-lg">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">문제 유형</h3>
          </div>
          <p className="text-[10px] text-gray-400 mt-1.5 leading-tight">
            AI가 출제할 문제 유형을 선택하세요. 선택한 프리셋을 기반으로 균일한 품질의 문제가 생성됩니다.
          </p>
        </div>

        {/* 프리셋 목록 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* 선택 안함 옵션 */}
          <div
            onClick={() => setSelectedPreset(null)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all group ${
              selectedPreset === null
                ? "bg-gray-100 text-gray-700"
                : "hover:bg-gray-50 text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xs font-medium">선택 안함</span>
            {selectedPreset === null && (
              <Check className="w-3 h-3 text-gray-500 shrink-0" />
            )}
          </div>

          <div className="border-t border-gray-100 my-2" />

          {/* 프리셋 아이템 목록 */}
          {promptTemplatesLoading ? (
            // 로딩 스켈레톤
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : promptTemplates && promptTemplates.length > 0 ? (
            <div className="space-y-1">
              {promptTemplates.map((template) => {
                const isSelected = selectedPreset === template.type;
                return (
                  <div
                    key={template.id}
                    onClick={() =>
                      setSelectedPreset(
                        isSelected ? null : template.type
                      )
                    }
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                      isSelected
                        ? "bg-[#F3F0FF] text-[#6E49E9] shadow-sm"
                        : "hover:bg-gray-50 text-gray-700 hover:text-[#6E49E9]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* 선택 인디케이터 점 */}
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                          isSelected
                            ? "bg-[#6E49E9]"
                            : "bg-gray-200 group-hover:bg-purple-300"
                        }`}
                      />
                      <span className="text-[12px] font-semibold leading-tight truncate">
                        {template.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 text-[#6E49E9] shrink-0 ml-1" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-300 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // 프리셋 없음 안내
            <div className="flex flex-col items-center justify-center py-8 text-center px-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                등록된 문제 유형이 없습니다.
                <br />
                관리자에게 문의하세요.
              </p>
            </div>
          )}
        </div>

        {/* 선택된 프리셋 표시 (하단 고정) */}
        {selectedPreset && selectedTemplateName && (
          <div className="p-3 border-t bg-purple-50/60 shrink-0">
            <div className="bg-white border border-purple-200 rounded-xl p-3 shadow-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-1.5 h-1.5 bg-[#6E49E9] rounded-full" />
                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wide">
                  선택된 프리셋
                </p>
              </div>
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {selectedTemplateName}
              </p>
              <p className="text-[9px] text-gray-400 mt-1 leading-tight">
                파일 분석 시 이 유형으로 문제가 생성됩니다.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCategorySidebar = () => {
    return (
      <div className="w-64 flex flex-col h-full bg-white border-r shrink-0">
        <div className="p-4 pb-2">
           {subjects.map((subject, sIdx) => (
             <div key={subject.name} className={`${sIdx > 0 ? 'mt-4' : ''}`}>
               <h3 className="px-2 py-1 text-lg font-bold text-gray-900">{subject.name}</h3>
               <div className="mt-1 space-y-0.5">
                 {subject.items.map((item) => {
                   const isSelected = selectedCategory === item.id;
                   const count = getCategoryCount(item.id);
                   return (
                     <div
                       key={item.id}
                       onClick={() => {
                        setSelectedCategory(item.id);
                        setSelectedLevel("all"); // Reset level
                        setShowUploadArea(false);
                        setEditingSeminar(null);
                        setCurrentStep(1);
                        setAnalyzedData(null);
                        const typeMap: any = { 
                          "word": "단어", "analysis": "본문분석", "workbook": "워크북", "variant": "변형문제", "school": "학교별 기출적중", 
                          "variant_kr": "변형문제_국어", "variant_math": "변형문제_수학", "variant_science": "변형문제_과학", "variant_social": "변형문제_사회" 
                        };
                        setSeminarForm(prev => ({ ...prev, type: typeMap[item.id] || "기타" }));
                        if (item.id === "analysis") setSelectedAnalysisTypes([1]);
                        else if (item.id === "workbook") setSelectedAnalysisTypes([2]);
                        else if (item.id.includes("variant")) setSelectedAnalysisTypes([3]);
                       }}
                       className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${isSelected ? "bg-[#F3F0FF] text-[#6E49E9] shadow-sm" : "hover:bg-gray-50 text-gray-700"}`}
                     >
                       <div className="flex items-center gap-3">
                         <span className={`font-semibold text-[15px] ${isSelected ? "text-[#6E49E9]" : ""}`}>{item.label}</span>
                         <span className={`text-[15px] font-bold ${count > 0 ? "text-[#10B981]" : "text-gray-400"}`}>{count}</span>
                       </div>
                       {item.badge && <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${item.badge === 'Free' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FFEDD5] text-[#EA580C]'}`}>{item.badge}</span>}
                     </div>
                   );
                 })}
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  };

  const renderArchiveGridView = () => {
    const typeMap: any = { "word": "단어", "analysis": "영어지문", "workbook": "워크북", "variant": "변형문제", "school": "기출적중", "variant_kr": "변형문제_국어", "variant_math": "변형문제_수학", "variant_science": "변형문제_과학", "variant_social": "변형문제_사회" };
    const tagMap: any = { "analysis": "1", "workbook": "2", "variant": "3", "variant_kr": "3", "variant_math": "3", "variant_science": "3", "variant_social": "3" };
    const tagId = tagMap[selectedCategory];
    const categoryName = typeMap[selectedCategory] || "영어지문";

    const filteredSeminars = mySeminars?.seminars?.filter((s: any) => {
      const titleMatches = searchTerm === "" || (s.title && s.title.toLowerCase().includes(searchTerm.toLowerCase()));
      if (!titleMatches) return false;
      
      const typeMatches = s.type === categoryName || (selectedCategory === "analysis" && s.type === "본문분석"); // Include legacy check
      
      let tagMatches = false;
      if (tagId && s.tags) {
        const tags = String(s.tags).split(',').map(t => t.trim());
        tagMatches = tags.includes(tagId);
      }
      if (selectedCategory === "variant_kr" && s.type === "변형문제_국어") return true;
      if (selectedCategory === "variant_math" && s.type === "변형문제_수학") return true;
      if (selectedCategory === "variant_science" && s.type === "변형문제_과학") return true;
      if (selectedCategory === "variant_social" && s.type === "변형문제_사회") return true;
      return typeMatches || tagMatches;
    }) || [];

    const handleDownloadHwpxFromCard = (e: React.MouseEvent, s: any) => {
      e.stopPropagation();
      try {
        let program = s.program;
        // Recursive parsing for deeply stringified JSON
        for (let i = 0; i < 5; i++) {
          if (typeof program === 'string' && (program.trim().startsWith('{') || program.trim().startsWith('['))) {
            program = JSON.parse(program);
          } else break;
        }
        const analysis = program?.aiAnalysis || program;
        if (!analysis) throw new Error();
        downloadHwpx(analysis, s.title || "분석지");
      } catch (err) {
        toast({ title: "다운로드 실패", description: "분석 데이터를 찾을 수 없습니다.", variant: "destructive" });
      }
    };

    const handleDownloadPdfFromCard = (e: React.MouseEvent, s: any) => {
      e.stopPropagation();
      // To download PDF from card, we temporarily set it as editing to render it
      // then trigger the PDF generation from the existing render logic.
      handleEditSeminar(s);
      
      // Give time for the Detail View to render then trigger download
      setTimeout(() => {
        const element = document.getElementById('analysis-content');
        if (!element) return;
        const opt = {
          margin: [5, 5, 5, 5],
          filename: `${s.title || '분석지'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        // @ts-ignore
        html2pdf().from(element).set(opt).save();
      }, 500);
    };

    const getPageTitle = () => {
      if (selectedCategory === "word") return "영어 단어 보관함";
      if (selectedCategory === "analysis") return "영어 본문분석 보관함";
      if (selectedCategory === "workbook") return "영어 워크북 보관함";
      if (selectedCategory === "variant") return "영어 변형문제 보관함";
      if (selectedCategory === "school") return "영어 학교별 기출적중 보관함";
      if (selectedCategory === "variant_kr") return "국어 변형문제_국어 보관함";
      if (selectedCategory === "variant_math") return "수학 변형문제_수학 보관함";
      if (selectedCategory === "variant_science") return "과학 변형문제_과학 보관함";
      if (selectedCategory === "variant_social") return "사회 변형문제_사회 보관함";
      return "영어 본문분석 보관함";
    };

    return (
      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        <div className="p-8 pb-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h2>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" /><Input placeholder="자료명 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-64 pl-10 h-10 bg-white" /></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 분석 파일 업로드 UI 통합 카드 (슬림화) */}
            {!showUploadArea ? (
              <div 
                onClick={() => setShowUploadArea(true)} 
                className="group cursor-pointer border-2 border-dashed border-[#6E49E9]/30 rounded-2xl bg-white hover:bg-[#F3F0FF]/30 transition-all flex flex-col items-center justify-center min-h-[180px] p-4 text-center shadow-sm"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-[#6E49E9]" />
                </div>
                <p className="text-gray-600 mb-3 font-medium text-xs">나만의 {categoryName} 만들기</p>
                <Button className="bg-[#6E49E9] hover:bg-[#5A3CC7] text-white px-4 h-9 rounded-xl shadow-md text-xs">
                  새 자료 만들기
                </Button>
              </div>
            ) : (
              <Card className="rounded-2xl border-2 border-[#6E49E9] bg-white shadow-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 col-span-1 md:col-span-2">
                {/* 카드 헤더 */}
                <div className="p-2.5 border-b bg-purple-50/30 flex justify-between items-center shrink-0">
                  <span className="text-[11px] font-bold text-[#6E49E9] flex items-center gap-1.5">
                    <Upload className="w-3 h-3" /> 새 자료 만들기
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400" onClick={() => setShowApiKeyDialog(true)}>
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-red-500" onClick={() => setShowUploadArea(false)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3">
                  {/* 상단 2열: 학년 선택 + 메인 파일 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 학년 선택 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">대상 학년</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger className="h-9 text-xs bg-white border-gray-200">
                          <SelectValue placeholder="학년 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체/무관</SelectItem>
                          <SelectItem value="middle1">중1</SelectItem>
                          <SelectItem value="middle2">중2</SelectItem>
                          <SelectItem value="middle3">중3</SelectItem>
                          <SelectItem value="high1">고1</SelectItem>
                          <SelectItem value="high2">고2</SelectItem>
                          <SelectItem value="high3">고3/수능</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 메인 파일 업로드 */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">분석 파일 *</label>
                      <div className="relative h-9 border border-dashed border-[#6E49E9]/40 rounded-lg flex items-center justify-center bg-purple-50/20 cursor-pointer hover:bg-purple-50/40 transition-colors overflow-hidden">
                        <Input type="file" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full" accept=".pdf,.docx,.hwpx,.hwp" />
                        <div className="flex items-center gap-1.5 px-2 w-full">
                          <FileText className={`w-3.5 h-3.5 shrink-0 ${uploadedFile ? 'text-purple-500' : 'text-gray-300'}`} />
                          <span className="text-[10px] text-gray-500 truncate flex-1">
                            {uploadedFile ? uploadedFile.name : "PDF / DOCX / HWPX"}
                          </span>
                          {uploadedFile && (
                            <button onClick={(e) => { e.preventDefault(); setUploadedFile(null); }} className="shrink-0 text-gray-300 hover:text-red-400">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 커스텀 프롬프트 입력 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <MessageSquarePlus className="w-3 h-3" /> 추가 지시사항 (선택)
                      </label>
                      <div className="flex items-center gap-1">
                        {/* 저장된 목록 불러오기 */}
                        <button
                          onClick={() => setShowSavedPromptList(!showSavedPromptList)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                        >
                          <ChevronDown className="w-3 h-3" /> 불러오기
                        </button>
                        {/* 현재 내용 저장 */}
                        <button
                          onClick={() => { if (customPrompt.trim()) setShowSavePromptDialog(true); }}
                          disabled={!customPrompt.trim()}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-[#6E49E9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          <Save className="w-3 h-3" /> 저장
                        </button>
                      </div>
                    </div>

                    {/* 저장된 프롬프트 목록 드롭다운 */}
                    {showSavedPromptList && (
                      <div className="border border-gray-200 rounded-xl bg-white shadow-md overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-500">저장된 지시사항</span>
                          <button onClick={() => setShowSavedPromptList(false)} className="text-gray-400 hover:text-gray-600">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        {!savedPrompts || savedPrompts.length === 0 ? (
                          <div className="py-4 text-center text-[11px] text-gray-400">저장된 지시사항이 없습니다.</div>
                        ) : (
                          <div className="max-h-40 overflow-y-auto">
                            {savedPrompts.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center justify-between px-3 py-2 hover:bg-purple-50 cursor-pointer group border-b border-gray-50 last:border-b-0"
                                onClick={() => { setCustomPrompt(p.content); setShowSavedPromptList(false); }}
                              >
                                <div className="flex-1 min-w-0 mr-2">
                                  <p className="text-xs font-bold text-gray-700 truncate">{p.name}</p>
                                  <p className="text-[10px] text-gray-400 truncate">{p.content}</p>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); deletePromptMutation.mutate(p.id); }}
                                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 hover:text-red-500 transition-all"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <Textarea
                      placeholder={`예) "3번 문제는 빈칸 추론으로 만들어줘"\n"단어 난이도는 고등 수준으로 맞춰줘"\n"지문의 2~3단락에 집중해서 문제를 출제해"`}
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="text-xs resize-none bg-white border-gray-200 focus:border-[#6E49E9] min-h-[72px] placeholder:text-gray-300 leading-relaxed"
                      rows={3}
                    />
                  </div>

                  {/* 저장 이름 입력 다이얼로그 */}
                  <Dialog open={showSavePromptDialog} onOpenChange={setShowSavePromptDialog}>
                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle className="text-sm">지시사항 저장</DialogTitle>
                        <DialogDescription className="text-xs text-gray-500">
                          이 지시사항에 이름을 지정하여 저장하세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-2 space-y-3">
                        <div>
                          <label className="text-xs font-bold text-gray-600 mb-1 block">이름</label>
                          <Input
                            placeholder="예) 고등 빈칸 추론 전용"
                            value={savePromptName}
                            onChange={(e) => setSavePromptName(e.target.value)}
                            className="text-sm"
                            onKeyDown={(e) => { if (e.key === "Enter" && savePromptName.trim()) savePromptMutation.mutate({ name: savePromptName, content: customPrompt }); }}
                          />
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2 text-[11px] text-gray-500 max-h-20 overflow-y-auto whitespace-pre-wrap">
                          {customPrompt}
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setShowSavePromptDialog(false)}>취소</Button>
                        <Button
                          size="sm"
                          className="bg-[#6E49E9] text-white"
                          disabled={!savePromptName.trim() || savePromptMutation.isPending}
                          onClick={() => savePromptMutation.mutate({ name: savePromptName, content: customPrompt })}
                        >
                          {savePromptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "저장"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  {/* 고급 설정 토글 */}
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-purple-600 transition-colors w-fit"
                  >
                    {showAdvancedOptions ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    RAG 참고 자료 첨부
                    {ragFile && <span className="bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded text-[9px] font-bold">1개 첨부됨</span>}
                  </button>

                  {/* RAG 파일 첨부 (고급 설정) */}
                  {showAdvancedOptions && (
                    <div className="flex flex-col gap-1.5 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-[10px] text-amber-700 leading-relaxed">
                        <strong className="flex items-center gap-1 mb-1"><Paperclip className="w-3 h-3" /> RAG (참고 자료) 란?</strong>
                        AI가 문제를 출제할 때 함께 참고할 추가 문서입니다. 예시 문제, 교과서 해설, 정답지 등을 첨부하면 해당 자료를 기반으로 더 정확한 문제가 생성됩니다.
                      </div>
                      <div className="relative h-10 border border-dashed border-amber-300/60 rounded-lg flex items-center justify-center bg-amber-50/30 cursor-pointer hover:bg-amber-50/60 transition-colors overflow-hidden">
                        <Input
                          type="file"
                          onChange={(e) => { if (e.target.files?.[0]) setRagFile(e.target.files[0]); }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full"
                          accept=".pdf,.docx,.hwpx,.hwp,.txt"
                        />
                        <div className="flex items-center gap-1.5 px-3 w-full">
                          <Paperclip className={`w-3.5 h-3.5 shrink-0 ${ragFile ? 'text-amber-500' : 'text-gray-300'}`} />
                          <span className="text-[10px] text-gray-500 truncate flex-1">
                            {ragFile ? ragFile.name : "참고 자료 첨부 (PDF · DOCX · TXT)"}
                          </span>
                          {ragFile && (
                            <button onClick={(e) => { e.preventDefault(); setRagFile(null); }} className="shrink-0 text-gray-300 hover:text-red-400">
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 시작 버튼 */}
                  <Button
                    onClick={startAnalysis}
                    disabled={!uploadedFile || isAnalyzing}
                    className="w-full h-9 bg-[#6E49E9] hover:bg-[#5A3CC7] text-white font-bold rounded-xl text-xs mt-1 shadow-md"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-2"><Loader2 className="animate-spin h-3.5 w-3.5" /> AI 분석 중...</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        분석 시작
                        {selectedPreset && <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px]">{promptTemplates?.find(t => t.type === selectedPreset)?.name}</span>}
                      </span>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {seminarsLoading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-[180px] bg-white rounded-2xl border animate-pulse" />) : filteredSeminars.map((s: any) => (
              <Card key={s.id} className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col min-h-[180px]" onClick={() => handleEditSeminar(s)}>
                <div className="p-3 pb-0 flex justify-between items-start">
                   <div className="flex flex-col gap-1">
                     <span className="text-[9px] text-gray-400 font-medium">{new Date(s.date).toLocaleDateString("ko-KR")} 저장됨</span>
                     <Badge variant="outline" className="w-fit bg-orange-50 text-orange-600 border-none text-[9px] px-1.5 py-0">{categoryName}</Badge>
                   </div>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-300 hover:text-red-500 -mt-1 -mr-1" onClick={(e) => { e.stopPropagation(); if(confirm("삭제하시겠습니까?")) deleteSeminarMutation.mutate(s.id); }}>
                     <Trash2 className="w-3.5 h-3.5" />
                   </Button>
                </div>
                <CardHeader className="pt-2 pb-2">
                  <CardTitle className="text-[15px] font-bold line-clamp-1 leading-tight">{s.title}</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">{s.organizer || "선생님"}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto p-2 pt-2 border-t border-gray-50 bg-slate-50/30">
                  <div className="flex gap-1.5 w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-7 text-[10px] font-bold border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-lg"
                      onClick={(e) => handleDownloadPdfFromCard(e, s)}
                    >
                      <Printer className="w-2.5 h-2.5 mr-1" /> PDF
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 h-7 text-[10px] font-bold border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-lg"
                      onClick={(e) => handleDownloadHwpxFromCard(e, s)}
                    >
                      <Download className="w-2.5 h-2.5 mr-1" /> HWPX
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);
      
      try {
        const response = await fetch("/api/business/upload-course-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("이미지 업로드 실패");

        const data = await response.json();
        setSeminarForm(prev => ({ ...prev, imageUrl: data.image.url }));
        toast({ title: "업로드 성공", description: "표지 이미지가 저장되었습니다." });
      } catch (error) {
        console.error(error);
        toast({ title: "업로드 실패", description: "이미지 업로드 중 오류가 발생했습니다.", variant: "destructive" });
      }
    }
  };

  const renderTocAndDetails = () => {
    if (currentStep === 2) {
      return (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle>분석 옵션 및 목차 선택</CardTitle><CardDescription>분석할 항목과 추출된 목차를 선택하세요.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3"><Label className="font-bold">1. 분석 카테고리 선택</Label>
              <div className="flex gap-2">{[ { id: 1, label: "본문분석" }, { id: 2, label: "워크북" }, { id: 3, label: "변형문제" } ].map(t => {
                const isRelevant = (selectedCategory === "analysis" && t.id === 1) || (selectedCategory === "workbook" && t.id === 2) || (selectedCategory === "variant" && t.id === 3);
                return <Button key={t.id} variant={selectedAnalysisTypes.includes(t.id) ? "default" : "outline"} disabled={!isRelevant} onClick={() => setSelectedAnalysisTypes([t.id])} className="flex-1">{t.label}</Button>;
              })}</div>
            </div>
            <div className="space-y-3"><Label className="font-bold">2. 분석된 목차 선택</Label>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">{analyzedData?.toc?.map((item: any) => (
                <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${selectedTocIds.includes(item.id) ? "border-blue-500 bg-blue-50" : "border-gray-200"}`} onClick={() => setSelectedTocIds(prev => prev.includes(item.id) ? prev.filter(i => i !== item.id) : [...prev, item.id])}>
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedTocIds.includes(item.id) ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300 bg-white"}`}><Check className="w-3.5 h-3.5" /></div>
                  <div className="flex-1 flex justify-between"><span>{item.title}</span><span className="text-xs text-gray-400">페이지: {item.page}</span></div>
                </div>
              ))}</div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(1)}>이전</Button><Button className="bg-blue-600 px-8" onClick={() => setCurrentStep(3)}>선택 완료</Button></CardFooter>
        </Card>
      );
    }

    if (currentStep === 3) {
      return (
        <Card className="border-none shadow-sm">
          <CardHeader><CardTitle>자료 정보 수정</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2"><Label>교재명</Label><Input value={seminarForm.title} onChange={e => setSeminarForm({...seminarForm, title: e.target.value})} /></div>
              <div className="space-y-2"><Label>분류</Label>
                <Select value={seminarForm.type} onValueChange={v => setSeminarForm({...seminarForm, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="영어지문">영어지문 (본문분석)</SelectItem>
                    <SelectItem value="문학분석">문학분석</SelectItem>
                    <SelectItem value="단어">단어</SelectItem>
                    <SelectItem value="워크북">워크북</SelectItem>
                    <SelectItem value="변형문제">변형문제</SelectItem>
                    <SelectItem value="기출적중">학교별 기출적중</SelectItem>
                    <SelectItem value="변형문제_국어">국어 변형문제</SelectItem>
                    <SelectItem value="변형문제_수학">수학 변형문제</SelectItem>
                    <SelectItem value="변형문제_과학">과학 변형문제</SelectItem>
                    <SelectItem value="변형문제_사회">사회 변형문제</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>저자/선생님</Label><Input placeholder="저자명" value={seminarForm.organizer} onChange={e => setSeminarForm({...seminarForm, organizer: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2"><Label>등록일</Label><Input type="date" value={seminarForm.date} onChange={e => setSeminarForm({...seminarForm, date: e.target.value})} /></div>
              <div className="space-y-2"><Label>표지 이미지</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1 border rounded-md h-10 px-3 flex items-center text-sm text-gray-400 bg-white hover:bg-gray-50 cursor-pointer overflow-hidden">
                    <span className="truncate text-slate-600">{seminarForm.imageUrl ? (seminarForm.imageUrl.startsWith("http") ? "이미지 업로드 완료" : seminarForm.imageUrl.split('/').pop()) : "파일 선택 (클릭하여 업로드)"}</span>
                    <input type="file" accept="image/*" onChange={handleCoverImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <Button variant="outline" onClick={() => setShowSampleImages(true)}>샘플</Button>
                </div>
                {seminarForm.imageUrl && (
                  <div className="mt-2 relative w-32 aspect-[3/4] rounded-lg overflow-hidden border bg-gray-50 group shadow-sm">
                    <img src={seminarForm.imageUrl} alt="Cover" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 w-6 h-6 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setSeminarForm({...seminarForm, imageUrl: ""})}><X className="w-3 h-3" /></Button>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2"><Label>목차 (TOC)</Label><div className="border rounded-md divide-y overflow-hidden">{selectedTocIds.length > 0 ? analyzedData?.toc?.filter((t:any) => selectedTocIds.includes(t.id)).map((t:any) => (<div key={t.id} className="p-3 text-sm flex justify-between bg-gray-50/50"><span>{t.title}</span><span className="text-gray-400">페이지: {t.page}</span></div>)) : <div className="p-8 text-center text-gray-400 text-sm">선택된 목차가 없습니다.</div>}</div></div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex justify-between"><Button variant="outline" onClick={() => setCurrentStep(2)}>이전</Button><Button className="bg-[#6E49E9] hover:bg-[#5A3CC7] text-white px-8" onClick={() => seminarMutation.mutate(seminarForm)} disabled={seminarMutation.isPending}>{seminarMutation.isPending ? "저장 중..." : "등록 완료"}</Button></CardFooter>
        </Card>
      );
    }
    return null;
  };

  // ─── 프리셋 문제 결과 렌더러 ────────────────────────────────────────────────
  const renderPresetQuestionResult = (presetQuestion: any, presetName: string, presetType: string) => {
    if (!presetQuestion) return null;

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      toast({ title: "복사 완료", description: "클립보드에 복사되었습니다." });
    };

    // 문제 유형별 렌더링
    const renderQuestionContent = () => {
      // 순서 배열 유형
      if (presetType === "order" && presetQuestion.given) {
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 mb-2 uppercase tracking-wide">주어진 글</p>
              <p className="text-sm leading-relaxed text-slate-800 font-serif">{presetQuestion.given}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {["A", "B", "C"].map((key) => (
                <div key={key} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 mb-1.5">({key})</p>
                  <p className="text-xs leading-relaxed text-slate-700">{presetQuestion.paragraphs?.[key]}</p>
                </div>
              ))}
            </div>
          </div>
        );
      }
      // 요약문 완성 유형
      if (presetType === "summary" && presetQuestion.summary) {
        return (
          <div className="space-y-3">
            {presetQuestion.passage && (
              <div className="bg-slate-50 rounded-xl p-4 border text-sm leading-relaxed text-slate-700 font-serif">
                {presetQuestion.passage}
              </div>
            )}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 mb-2">요약문</p>
              <p className="text-sm font-bold text-slate-800">{presetQuestion.summary}</p>
            </div>
          </div>
        );
      }
      // 일반 지문 포함 유형 (어휘/문법/주제/빈칸)
      return (
        <div className="space-y-3">
          {presetQuestion.passage && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm leading-loose text-slate-700 font-serif whitespace-pre-wrap">
              {presetQuestion.passage}
            </div>
          )}
        </div>
      );
    };

    // 선택지 렌더링 (5지선다)
    const renderOptions = (options: string[], label?: string) => {
      if (!options || options.length === 0) return null;
      return (
        <div className="space-y-1.5">
          {label && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">{label}</p>}
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-start gap-2.5 px-3 py-2 rounded-lg bg-white border border-slate-100 hover:border-blue-200 transition-colors">
              <span className="text-sm font-bold text-slate-400 shrink-0">{["①","②","③","④","⑤"][idx]}</span>
              <span className="text-sm text-slate-700 leading-tight">{opt}</span>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="bg-white rounded-2xl border border-purple-200 shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-purple-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <BookOpenCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wide">AI 생성 문제</p>
              <h4 className="text-sm font-bold text-gray-800">{presetName}</h4>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(JSON.stringify(presetQuestion, null, 2))}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-purple-600 border border-gray-200 hover:border-purple-300 rounded-lg transition-colors"
          >
            <Copy className="w-3 h-3" /> 복사
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 문제 텍스트 */}
          {presetQuestion.question && (
            <div className="flex gap-3">
              <span className="w-5 h-5 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">Q</span>
              <p className="text-[15px] font-bold text-slate-900 leading-snug">{presetQuestion.question}</p>
            </div>
          )}

          {/* 지문 / 단락 */}
          {renderQuestionContent()}

          {/* 선택지 */}
          {presetType === "summary" ? (
            <div className="grid grid-cols-2 gap-4">
              {presetQuestion.optionsA && renderOptions(presetQuestion.optionsA, "(A)")}
              {presetQuestion.optionsB && renderOptions(presetQuestion.optionsB, "(B)")}
            </div>
          ) : (
            renderOptions(presetQuestion.options)
          )}

          {/* 정답 & 해설 */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            {presetQuestion.answer && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 w-10 shrink-0">정답</span>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-lg">{presetQuestion.answer}</span>
              </div>
            )}
            {presetQuestion.explanation && (
              <div className="flex gap-3">
                <span className="text-xs font-bold text-slate-500 w-10 shrink-0">해설</span>
                <p className="text-xs text-slate-600 leading-relaxed flex-1 bg-slate-50 p-3 rounded-xl">{presetQuestion.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTextContent = () => {
    const aiAnalysis = analyzedData?.aiAnalysis;
    if (!aiAnalysis || (currentStep !== 3 && !editingSeminar)) return null;

    // Workbook & Vocabulary & Variant Mode Check
    const isWorkbookMode = seminarForm.type === "워크북" || selectedCategory === "workbook" || (seminarForm.tags && String(seminarForm.tags).includes('2'));
    const isVocabularyMode = seminarForm.type === "단어" || selectedCategory === "word";
    const isVariantMode = seminarForm.type === "변형문제" || selectedCategory.includes("variant") || (seminarForm.tags && String(seminarForm.tags).includes('3'));

    // ─── 프리셋 문제 생성 결과가 있으면 바로 렌더링 ────────────────────────────
    if (aiAnalysis.presetQuestion) {
      return (
        <div className="flex flex-col items-center bg-slate-100/50 py-2 min-h-screen no-print">
          <div className="w-full max-w-full space-y-4">
            {renderPresetQuestionResult(
              aiAnalysis.presetQuestion,
              aiAnalysis.presetName || "AI 생성 문제",
              aiAnalysis.presetType || ""
            )}
          </div>
        </div>
      );
    }

    // 문서 참조 코드 고정 (사용자 요청)
    const refCode = "R-SV-3819960319552259548";

    // 문서 내 교재 정보 추출 로직
    const extractBookInfo = () => {
      const title = aiAnalysis.structure?.title || seminarForm.title || "";
      const info = {
        revision: "22개정",
        subject: "공통영어 1",
        publisher: "YBM - 박준언",
        lesson: "2과"
      };

      const lessonMatch = title.match(/(\d+)\s*과/);
      if (lessonMatch) info.lesson = `${lessonMatch[1]}과`;
      
      return `[${info.revision}] ${info.subject} (${info.publisher}) | ${info.lesson}`;
    };

    // Helper to render analyzed text with Solvook's Ultra-Precision Annotation Engine
    // Replaced with SentenceAnalysisViewer component

    // --- Data Transformation for Solvook Viewer ---
    const transformToAnalyzedSentences = (sentences: any[]) => {
      if (!sentences) return [];
      
      return sentences.map((s: any, idx: number) => {
        const contentTokens: any[] = [];
        
        // Use existing 'analysis' string if available, otherwise 'original'
        const textToParse = s.analysis || s.original || "";
        
        // Regex to parse [text/annotation/color/...] pattern OR (text) OR /
        // Pattern: [Text / Annotation / Color / Shape / Arrow / BG]
        // Updated Regex order: Specific clause markers first, then generic bracket pattern
        const regex = /\(\(\{|\}\)\)|<<\{|\}>>|\{\{|\}\}|\[\[\{|\}\]\]|\(\(\(\{|\}\)\)\)|\[\{|\}\]|\[([^\]\/]+)(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?\]|\(([^)]+)\)|(\/ \/ bg)|(\/)|([^\[\]\(\)\{\}\/\s]+)|(\s+)/g;
        
        let match;
        let tokenIdx = 0;
        
        while ((match = regex.exec(textToParse)) !== null) {
          const id = `tok-${idx}-${tokenIdx++}`;
          
          if (match[0] === '(({') {
             contentTokens.push({ id, text: "[", type: 'clause-blue-open' });
          } else if (match[0] === '}))') {
             contentTokens.push({ id, text: "]", type: 'clause-blue-close' });
          } else if (match[0] === '<<{') {
             contentTokens.push({ id, text: "[", type: 'clause-green-open' });
          } else if (match[0] === '}>>') {
             contentTokens.push({ id, text: "]", type: 'clause-green-close' });
          } else if (match[0] === '{{') {
             contentTokens.push({ id, text: "[", type: 'clause-orange-open' }); // Orange/Beige
          } else if (match[0] === '}}') {
             contentTokens.push({ id, text: "]", type: 'clause-orange-close' });
          } else if (match[0] === '[[{') {
             contentTokens.push({ id, text: "[", type: 'clause-purple-open' }); // Purple
          } else if (match[0] === '}]]') {
             contentTokens.push({ id, text: "]", type: 'clause-purple-close' });
          } else if (match[0] === '((({') {
             contentTokens.push({ id, text: "[", type: 'clause-pink-open' }); // Pink
          } else if (match[0] === '})))') {
             contentTokens.push({ id, text: "]", type: 'clause-pink-close' });
          } else if (match[0] === '[{') { // Fallback for malformed AI output
             contentTokens.push({ id, text: "[", type: 'clause-blue-open' });
          } else if (match[0] === '}]') { // Fallback for malformed AI output
             contentTokens.push({ id, text: "]", type: 'clause-blue-close' });
          } else if (match[8] === '/ / bg') { // Skip accidental raw bg tags
             continue; 
          } else if (match[10]) { // Plain text word
            contentTokens.push({ id, text: match[10], type: 'text' });
          } else if (match[11]) { // Whitespace
            contentTokens.push({ id, text: match[11], type: 'text' }); 
          } else if (match[7]) { // Parentheses (Old style) -> Convert to Blue Bracket
            contentTokens.push({ id, text: "(", type: 'text', note: null });
            contentTokens.push({ id: id + "-content", text: match[7], type: 'bracket-blue' });
            contentTokens.push({ id: id + "-close", text: ")", type: 'text', note: null });
          } else if (match[9]) { // Slash (Old style) -> Visual divider
             // Skip slashes to prevent clutter (user request "More weird" slashes)
             continue;
          } else { // Solvook Bracketed part [ ... ]
            const text = match[1];
            // Safety check for empty matches
            if (!text) continue;

            const annotation = match[2];
            const color = match[3]; // 'blue', 'red', etc.
            const shape = match[4]; // 'box', 'circle', etc.
            
            // Map legacy attributes to Solvook types
            let type = 'text';
            let note = annotation;
            let noteColor = undefined;
            
            // Determine type based on color/shape
            if (text.trim() === '[' || text.trim() === ']') {
               type = color === 'green' ? 'bracket-green' : 'bracket-blue';
            } else if (shape === 'box') {
               if (color === 'green') {
                 type = 'box-green'; // 초록 박스 (접속사)
                 noteColor = 'text-green-600';
               } else {
                 type = 'box-red'; // 빨간 박스 (관계사 등)
                 noteColor = 'text-red-500';
               }
            } else if (shape === 'oval' || color === 'orange') { 
               type = 'oval-orange';
               noteColor = 'text-orange-500';
            } else if (color === 'ox' || shape === 'ox') { // NEW: O/X 어법
               type = 'ox';
               noteColor = color === 'blue' ? 'text-blue-500' : 'text-red-500';
            } else if (color === 'arrow' || shape === 'arrow') { // NEW: 화살표 수식
               type = 'arrow';
               noteColor = 'text-gray-500';
            } else if (shape === 'bg' || color === 'gray' || color === 'bg') {
               type = 'bg-soft'; // 희미한 배경
            } else if (shape === 'verb' || color === 'green') { // NEW: Verb Change (Green)
               type = 'verb';
               noteColor = 'text-green-600';
            } else if (color === 'red') {
               // If shape is 'line' or 'underline', use black text + red underline
               if (shape === 'line' || shape === 'underline') type = 'underline-red';
               else type = 'highlight-red';
               noteColor = 'text-red-500';
            } else if (color === 'blue') {
               // If shape is 'line' or 'underline', use black text + blue underline
               if (shape === 'line' || shape === 'underline') type = 'underline-blue';
               else type = 'highlight-blue';
               noteColor = 'text-blue-500';
            } else if (shape === 'bold') {
               type = 'bold';
            } else if (shape === 'strike') {
               type = 'strike';
               noteColor = 'text-red-500';
            } else {
               // Default fallback
               if (color === 'blue') type = 'highlight-blue';
               else if (color === 'red') type = 'highlight-red';
            }

            contentTokens.push({
              id,
              text,
              type,
              note: note || undefined,
              noteColor
            });
          }
        }
        
        return {
          id: s.id || idx,
          number: idx + 1,
          // Handle both array and string format for tags
          tags: Array.isArray(s.tags) ? s.tags : 
                typeof s.tags === 'string' ? s.tags.split(',').map((t: string) => t.trim()) : 
                (s.isTopic || (s.tags && String(s.tags).includes('주제')) ? ['주제문'] : []),
          isTopic: false, 
          contentTokens,
          translation: s.translation
        };
      });
    };

    const analyzedSentences = transformToAnalyzedSentences(aiAnalysis.sentences);


    const structure = aiAnalysis.structure || { 
      title: "", titleTranslation: "", 
      subject: "", subjectTranslation: "", 
      summary: "", summaryTranslation: "", 
      sections: [] 
    };

    if (isVocabularyMode) {
      const vocabList = aiAnalysis.vocabulary || [];
      // ... (existing vocabulary mode code)
      // Split vocabulary into two columns
      const midPoint = Math.ceil(vocabList.length / 2);
      const leftCol = vocabList.slice(0, midPoint);
      const rightCol = vocabList.slice(midPoint);

      return (
        <div className="flex flex-col items-center bg-slate-100/50 py-2 min-h-screen no-print">
          <Card className="w-full max-w-full border-none shadow-2xl bg-white p-[20px] font-sans text-slate-900 min-h-[297mm]" id="analysis-content">
            {/* Vocabulary Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4 mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{user?.username || "YOON"}님의 단어장</h2>
                <p className="text-sm text-slate-500 font-bold mt-1">{user?.username || "YOON"} 선생님</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#FF4081]">inno</span>
              </div>
            </div>

            {/* Vocabulary List Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="flex flex-col gap-0">
                {leftCol.map((v: any, idx: number) => (
                  <div key={idx} className="flex items-center py-2.5 border-b border-slate-100 text-[13px]">
                    <span className="w-8 text-center font-bold text-slate-400">{idx + 1}</span>
                    <span className="flex-1 font-bold text-slate-800 px-2">{v.word}</span>
                    <div className="flex-[1.2] flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200 shrink-0">
                        {v.partOfSpeech || "품"}
                      </span>
                      <span className="text-slate-600 truncate">{v.meaning}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-0">
                {rightCol.map((v: any, idx: number) => (
                  <div key={idx + midPoint} className="flex items-center py-2.5 border-b border-slate-100 text-[13px]">
                    <span className="w-8 text-center font-bold text-slate-400">{idx + midPoint + 1}</span>
                    <span className="flex-1 font-bold text-slate-800 px-2">{v.word}</span>
                    <div className="flex-[1.2] flex items-center gap-2">
                      <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200 shrink-0">
                        {v.partOfSpeech || "품"}
                      </span>
                      <span className="text-slate-600 truncate">{v.meaning}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination / Footer */}
            <div className="mt-auto pt-8 flex justify-center text-xs text-slate-400 font-medium">
              1 / 4 &gt;
            </div>
          </Card>

          {/* Synonyms / Antonyms Page (Separate Card) */}
          <Card className="w-full max-w-full border-none shadow-2xl bg-white p-[20px] font-sans text-slate-900 min-h-[297mm] mt-4" id="analysis-content-2">
             <div className="flex justify-between items-center border-b-2 border-slate-200 pb-4 mb-8">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">동/반의어</h2>
                <p className="text-sm text-slate-500 font-bold mt-1">{user?.username || "YOON"} 선생님</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#FF4081]">inno</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-0">
               {vocabList.filter((v: any) => (v.synonyms?.length > 0 || v.antonyms?.length > 0)).map((v: any, idx: number) => (
                 <div key={idx} className="flex py-4 border-b border-slate-100 text-sm">
                   <div className="w-12 text-center font-bold text-slate-400 pt-1">{idx + 1}</div>
                   <div className="w-32 font-bold text-slate-800 pt-1">{v.word}</div>
                   
                   <div className="flex-1 space-y-2">
                     <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-100 text-slate-500 rounded text-[10px] font-bold border border-slate-200">
                          {v.partOfSpeech || "품"}
                        </span>
                        <span className="text-slate-700 font-medium">{v.meaning}</span>
                     </div>
                     
                     {v.synonyms?.length > 0 && (
                       <div className="flex items-start gap-2 pl-1">
                         <span className="text-xs font-bold text-blue-500 w-4">(S)</span>
                         <span className="text-slate-500 text-xs">{Array.isArray(v.synonyms) ? v.synonyms.join(", ") : v.synonyms}</span>
                       </div>
                     )}
                     
                     {v.antonyms?.length > 0 && (
                       <div className="flex items-start gap-2 pl-1">
                         <span className="text-xs font-bold text-red-500 w-4">(A)</span>
                         <span className="text-slate-500 text-xs">{Array.isArray(v.antonyms) ? v.antonyms.join(", ") : v.antonyms}</span>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>
             <div className="mt-auto pt-8 flex justify-center text-xs text-slate-400 font-medium">
              3 / 4 &gt;
            </div>
          </Card>
        </div>
      );
    }

    if (isVariantMode) {
      const questions = aiAnalysis.questions || [];
      return (
        <div className="flex flex-col items-center bg-slate-100/50 py-2 min-h-screen no-print">
          <Card className="w-full max-w-full border-none shadow-2xl bg-white p-[20px] font-sans text-slate-900 min-h-[297mm]" id="analysis-content">
            {/* Variant Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-8">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">{aiAnalysis.title || "고1 2023(3월)"} 변형문제</h2>
                <p className="text-xs text-slate-500 font-bold mt-1">{user?.username || "YOON"} 선생님</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#FF4081]">inno</span>
              </div>
            </div>

            {/* Questions Two Column Layout */}
            <div className="columns-2 gap-10 [column-fill:_balance]">
              {questions.map((q: any, idx: number) => (
                <div key={idx} className="break-inside-avoid mb-8">
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-lg font-extrabold text-slate-900 leading-none">{idx + 1}.</span>
                    <h4 className="text-[13px] font-bold text-slate-900 leading-tight pt-0.5">{q.question}</h4>
                  </div>
                  
                  {q.passage && q.passage.trim().length > 0 && (
                    <div className="border border-slate-200 p-3 mb-3 text-[11px] leading-relaxed text-justify bg-white rounded-sm whitespace-pre-wrap">
                      {q.passage}
                    </div>
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

            {/* Pagination / Footer */}
            <div className="mt-auto pt-8 flex justify-center text-xs text-slate-400 font-medium">
              1 / 4 &gt;
            </div>
          </Card>
          
          {/* Answers Page */}
          <Card className="w-full max-w-full border-none shadow-2xl bg-white p-[20px] font-sans text-slate-900 min-h-[297mm] mt-4" id="analysis-content-answers">
             <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2 mb-8">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">정답 및 해설</h2>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-[#FF4081]">inno</span>
              </div>
            </div>

            <div className="columns-2 gap-10 [column-fill:_balance]">
               {questions.map((q: any, idx: number) => (
                 <div key={idx} className="break-inside-avoid border-b border-slate-100 pb-4 mb-4">
                   <div className="flex gap-3 mb-2">
                     <span className="text-sm font-black text-slate-900">{idx + 1}.</span>
                     <span className="text-sm font-bold text-blue-600">정답: {q.answer}</span>
                   </div>
                   <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded text-justify">
                     {q.explanation || "해설이 없습니다."}
                   </p>
                 </div>
               ))}
            </div>
          </Card>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center bg-slate-100/50 py-2 min-h-screen no-print">
        <Card className="w-full max-w-full border-none shadow-2xl bg-white p-[20px] font-sans text-slate-900" id="analysis-content">
          <div className="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">{user?.username || "선생님"}님의 본문 분석</h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-300 font-bold mb-0.5">{refCode}</p>
              <p className="text-xs font-bold text-slate-500">
                {extractBookInfo()}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 섹션 1: 제목, 주제, 요약 */}
            <section className="page-break-inside-avoid">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">제목, 주제, 요약</h3>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-slate-50/10">
                <div className="flex gap-4 items-start">
                  <span className="text-red-500 font-bold w-10 shrink-0 text-xs pt-0.5">제목</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight">{structure.title || seminarForm.title}</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">{structure.titleTranslation || ""}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-slate-100 pt-2">
                  <span className="text-blue-500 font-bold w-10 shrink-0 text-xs pt-0.5">주제</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{structure.subject || "주제 정보 없음"}</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">{structure.subjectTranslation || ""}</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start border-t border-slate-100 pt-2">
                  <span className="text-emerald-500 font-bold w-10 shrink-0 text-xs pt-0.5">요약</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-[12px] leading-relaxed">{structure.summary || "요약 정보 없음"}</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">{structure.summaryTranslation || ""}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 섹션 2: 배경 지식 */}
            <section className="page-break-inside-avoid">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">배경 지식</h3>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/20">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{aiAnalysis.backgroundKnowledge?.title || "배경지식"}</h4>
                <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {aiAnalysis.backgroundKnowledge?.description || "배경지식 정보가 없습니다."}
                </p>
              </div>
            </section>

            {/* 섹션 3: 지문 구조 */}
            {!isWorkbookMode && (
            <section className="page-break-inside-avoid">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">지문 구조</h3>
              </div>
              <div className="border border-slate-200 rounded-xl p-4 relative">
                <div className="absolute left-[24px] top-6 bottom-6 w-0.5 bg-blue-50" />
                <div className="space-y-3 relative">
                  {(structure.sections && structure.sections.length > 0 ? structure.sections : []).map((section: any, idx: number) => (
                    <div key={idx} className="flex gap-3 items-start group">
                      <div className="z-10 bg-white p-0.5 mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 bg-white" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-blue-600 text-[10px] uppercase tracking-wider">{section.type || section.label}</span>
                        <p className="text-slate-800 font-bold text-[12px] leading-tight mt-0.5">{section.text || section.content}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5 leading-tight">{section.translation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 섹션 4: 핵심 단어 */}
            {!isWorkbookMode && (
            <section className="page-break-inside-avoid">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">핵심 단어</h3>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-slate-100">
                  {(aiAnalysis.vocabulary && aiAnalysis.vocabulary.length > 0 ? aiAnalysis.vocabulary : []).map((v: any, idx: number) => (
                    <div key={idx} className={`p-2.5 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0`}>
                      <div className="w-3 h-3 border border-slate-300 rounded mt-1 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-slate-800 text-[13px]">{v.word}</span>
                          <span className="text-red-400 text-[8px]">📌</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded font-bold">뜻</span>
                          <span className="text-[11px] text-slate-600">{v.meaning}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            )}

            {/* 섹션 5: 지문 읽기 (Image 1 Style) */}
            {!isWorkbookMode && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">지문 읽기</h3>
              </div>
              <div className="border border-slate-200 rounded-2xl p-6 space-y-6 bg-white">
                {aiAnalysis.sentences?.map((s: any, i: number) => (
                  <div key={i} className="space-y-2">
                    <div className="flex gap-3">
                      <span className="text-[10px] font-bold text-blue-400 mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <p className="text-[15px] text-slate-800 leading-relaxed font-serif tracking-tight">
                        {s.original}
                      </p>
                    </div>
                    <div className="pl-6">
                      <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                        {s.translation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            )}

            {/* 섹션 6: 워크북 (어휘, 어법, 동사형) 또는 문장별 분석 */}
            {(seminarForm.type === "워크북" || selectedCategory === "workbook" || (seminarForm.tags && String(seminarForm.tags).includes('2'))) ? (
              <>
                <section className="page-break-inside-avoid">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-slate-800">1. 어휘 선택</h3>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6">
                    {analyzedSentences.map((s: any, i: number) => (
                      <div key={`vocab-${i}`} className="space-y-2">
                        <div className="flex gap-3">
                          <span className="text-[10px] font-bold text-blue-400 mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          <p className="text-[15px] text-slate-800 leading-relaxed font-serif tracking-tight">
                            {s.contentTokens.map((token: any, tIdx: number) => {
                              if (token.type === 'text') return <span key={tIdx}>{token.text}</span>;
                              
                              // Handle clause open/close - just render brackets for workbook? or hide?
                              // Usually workbooks just show text. Let's keep text.
                              if (token.type.includes('clause-') && token.type.includes('-open')) return null; 
                              if (token.type.includes('clause-') && token.type.includes('-close')) return null;

                              // Vocabulary Choice Logic
                              if ((token.type.includes('highlight-blue') || token.type.includes('box-blue') || token.noteColor === 'text-blue-500') && token.text.trim().length > 1) {
                                let distractor = "???";
                                if (token.note && token.note.includes('≠')) {
                                  distractor = token.note.split('≠')[1].trim();
                                } else {
                                  // If no explicit distractor, try to use antonym from vocab list if available (complex)
                                  // Or just generic blank
                                  // For now, if no distractor, just show the word to avoid broken UI
                                  return <span key={tIdx}>{token.text}</span>;
                                }
                                return (
                                  <span key={tIdx} className="font-bold text-slate-900 mx-1">
                                    [{token.text} / {distractor}]
                                  </span>
                                );
                              }
                              return <span key={tIdx}>{token.text}</span>;
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="page-break-inside-avoid mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-sm font-bold text-slate-800">2. 어법 선택</h3>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-6">
                    {analyzedSentences.map((s: any, i: number) => (
                      <div key={`grammar-${i}`} className="space-y-2">
                        <div className="flex gap-3">
                          <span className="text-[10px] font-bold text-blue-400 mt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          <p className="text-[15px] text-slate-800 leading-relaxed font-serif tracking-tight">
                            {s.contentTokens.map((token: any, tIdx: number) => {
                              if (token.type === 'text') return <span key={tIdx}>{token.text}</span>;
                              if (token.type.includes('clause-')) return null;

                              // Grammar Choice Logic (O/X)
                              if (token.type === 'ox') {
                                const wrong = token.note ? token.note.replace('(X)', '').replace(/\(.*\)/g, '').trim() : "wrong";
                                return (
                                  <span key={tIdx} className="font-bold text-slate-900 mx-1">
                                    [{token.text} / {wrong}]
                                  </span>
                                );
                              }
                              // Red Box/Underline - treat as important grammar
                              if (token.type.includes('red') || token.noteColor === 'text-red-500') {
                                // If it's a grammar term, we can't easily make a choice without a distractor.
                                // But sometimes the note has "vs something".
                                if (token.note && token.note.includes('vs')) {
                                   const parts = token.note.split('vs');
                                   return (
                                     <span key={tIdx} className="font-bold text-slate-900 mx-1">
                                       [{token.text} / {parts[1].trim()}]
                                     </span>
                                   );
                                }
                              }

                              return <span key={tIdx}>{token.text}</span>;
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="page-break-inside-avoid mt-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-6 h-6 rounded-full bg-[#6E49E9] text-white flex items-center justify-center font-bold text-sm">3</div>
                    <h3 className="text-lg font-bold text-slate-900">동사 바꾸기 <span className="text-sm font-normal text-slate-500 ml-2">문장의 동사를 어법상 적절한 형태로 고치시오.</span></h3>
                  </div>
                  
                  <div className="space-y-8">
                    {analyzedSentences.map((s: any, i: number) => (
                       <div key={`verb-${i}`} className="relative page-break-inside-avoid">
                        <div className="mb-2">
                          <div className="flex gap-3 items-start">
                            <div className="flex flex-col items-center gap-1 shrink-0">
                              <span className="text-xl font-bold text-slate-400 leading-none mt-0.5">{String(i + 1).padStart(2, '0')}</span>
                              {(s.tags?.includes('주제문') || s.tags?.includes('서술형')) && (
                                <span className="bg-green-500 text-white text-[9px] font-bold px-1 py-0.5 rounded leading-none">중요</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed break-keep mt-0.5">
                              {s.translation}
                            </p>
                          </div>
                        </div>

                        <div className="border border-slate-300 p-4 rounded-sm bg-white">
                          <p className="text-[15px] text-slate-800 leading-loose font-serif tracking-tight">
                            {s.contentTokens.map((token: any, tIdx: number) => {
                              if (token.type.includes('clause-')) return null;

                              // Verb Change Logic
                              if (token.type === 'verb') { // New dedicated type
                                return (
                                  <span key={tIdx} className="font-bold text-slate-900 mx-1">
                                    ({token.note || token.text})
                                  </span>
                                );
                              }

                              // Fallback Logic
                              const isVerbGrammar = token.note && (
                                token.note.includes('부정사') || 
                                token.note.includes('동명사') || 
                                token.note.includes('분사') || 
                                token.note.includes('수동태') || 
                                token.note.includes('시제') ||
                                token.note.includes('동사')
                              );

                              if ((token.type.includes('red') || token.type.includes('blue')) && isVerbGrammar) {
                                 return (
                                  <span key={tIdx} className="font-bold text-slate-900 mx-1">
                                    ({token.text})
                                  </span>
                                );
                              }
                              
                              return <span key={tIdx}>{token.text}</span>;
                            })}
                          </p>
                        </div>

                        <div className="mt-2 pl-1">
                           <span className="inline-flex items-center justify-center border border-slate-300 rounded-full px-3 py-0.5 text-[11px] text-slate-500 font-bold bg-white">
                             정답
                           </span>
                        </div>
                        
                        <div className="border-b border-slate-200 mt-6 mx-1" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* 정답 및 해설 */}
                <section className="page-break-inside-avoid mt-12 pt-8 border-t-2 border-slate-800">
                  <div className="flex items-center gap-2 mb-6">
                    <h3 className="text-lg font-bold text-slate-900">정답 및 해설</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {analyzedSentences.map((s: any, i: number) => {
                      const answers = s.contentTokens
                        .filter((t: any) => 
                          // Vocab answers
                          ((t.type.includes('highlight-blue') || t.type.includes('box-blue') || t.noteColor === 'text-blue-500') && t.text.trim().length > 1) || 
                          // Grammar answers
                          (t.type === 'ox' || t.type.includes('red') || t.noteColor === 'text-red-500') || 
                          // Verb answers
                          (t.type === 'verb' || (t.type.includes('green') || (t.note && (t.note.includes('부정사') || t.note.includes('동명사') || t.note.includes('분사') || t.note.includes('동사')))))
                        )
                        .map((t: any) => t.text);
                      
                      if (answers.length === 0) return null;

                      return (
                        <div key={i} className="flex gap-4 text-sm">
                          <span className="font-bold text-slate-900 w-6 text-right">{String(i + 1).padStart(2, '0')}</span>
                          <div className="flex flex-wrap gap-2 text-slate-600">
                            {answers.map((ans: string, idx: number) => (
                              <span key={idx} className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{ans}</span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </>
            ) : (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-bold text-slate-800">문장별 분석</h3>
              </div>
              
              {/* Solvook Style applied via SentenceAnalysisViewer */}
              <div className="not-prose font-sans">
                <SentenceAnalysisViewer sentences={analyzedSentences} className="border-none shadow-none p-0 w-full max-w-none" />
              </div>
            </section>
            )}
          </div>

          {/* Solvook Style Paper Footer */}
          <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-bold">
            <div>{refCode}</div>
            <div className="flex items-center gap-1">
               <span className="text-lg">⚠️</span> 이 자료는 저작권의 보호를 받는 합법저작물로 무단 배포 및 재판매할 수 없습니다.
            </div>
            <div>8 / 12</div>
          </div>

          <div className="fixed bottom-10 right-10 flex gap-2 no-print">
            {/* 세부 화면 전용 플로팅 버튼 제거 (카드 버튼으로 통합) */}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { 
          body * { visibility: hidden; } 
          #analysis-content, #analysis-content * { visibility: visible; } 
          #analysis-content { position: absolute !important; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; } 
          nav, header, footer, .shrink-0, .no-print { display: none !important; } 
        }
        .page-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
      ` }} />
      <div className="flex bg-white rounded-2xl border shadow-sm overflow-hidden h-[calc(100vh-180px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderCategorySidebar()}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]">
          {/* 문제 유형 프리셋 가로 선택바 */}
          <div className="shrink-0 px-4 py-2 bg-white border-b flex items-center gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap">문제 유형</span>
            </div>
            <div className="w-px h-4 bg-gray-200 shrink-0" />
            <div className="flex items-center gap-1.5 flex-nowrap">
              <button
                onClick={() => setSelectedPreset(null)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedPreset === null
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                }`}
              >
                선택 안함
              </button>
              {promptTemplatesLoading ? (
                [1,2,3,4].map(i => (
                  <div key={i} className="h-6 w-20 bg-gray-100 rounded-full animate-pulse" />
                ))
              ) : promptTemplates?.map((template) => {
                const isSelected = selectedPreset === template.type;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedPreset(isSelected ? null : template.type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-[#6E49E9] text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-purple-50 hover:text-[#6E49E9]"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {template.name}
                  </button>
                );
              })}
            </div>
          </div>
          {/* 메인 콘텐츠 */}
          <div className="flex-1 overflow-y-auto">
            {currentStep === 1 ? (
              renderArchiveGridView()
            ) : (
              <div className="p-2 space-y-4">{renderTocAndDetails()}{renderTextContent()}</div>
            )}
          </div>
        </div>
      </div>
      <Dialog open={showSampleImages} onOpenChange={setShowSampleImages}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>샘플 이미지 선택</DialogTitle>
          </DialogHeader>
          <div className="max-h-[500px] overflow-y-auto pr-2">
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({length:14}, (_,i)=>({url:`/images/BOOKS/${i+1}.png`, name:`샘플 ${i+1}`})).map((img, i) => (
                <div key={i} className="cursor-pointer hover:opacity-80 group border rounded-xl overflow-hidden transition-all hover:border-[#6E49E9] bg-white p-2" onClick={()=>{setSeminarForm({...seminarForm, imageUrl:img.url}); setShowSampleImages(false);}}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
                    <img src={img.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-center text-xs mt-2 font-bold text-gray-500 group-hover:text-[#6E49E9]">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gemini API 키 설정</DialogTitle>
            <DialogDescription>
              본문 분석 기능을 사용하기 위해 Google Gemini API 키가 필요합니다.
              <br />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 mt-1">
                API 키 발급받기 <Key className="w-3 h-3" />
              </a>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="AIza..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>AI 모델 선택</Label>
              <Select value={tempAiModel} onValueChange={setTempAiModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash (경제적)</SelectItem>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (표준/추천)</SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro (고성능)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                문서 분석에 사용할 AI 모델을 선택하세요.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>취소</Button>
            <Button onClick={() => {
              setApiKey(tempApiKey);
              setAiModel(tempAiModel);
              localStorage.setItem("gemini_api_key", tempApiKey);
              localStorage.setItem("gemini_model", tempAiModel);
              setShowApiKeyDialog(false);
            }}>저장</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
