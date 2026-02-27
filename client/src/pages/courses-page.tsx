import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FileText, Download, Printer, Star } from "lucide-react";
// @ts-ignore
import html2pdf from 'html2pdf.js';
import ChatWidget from "@/components/chat-widget";
import { useAlert } from "@/contexts/alert-context";
import SentenceAnalysisViewer from "@/components/learning/sentence-analysis-viewer";
import { transformToAnalyzedSentences } from "@/lib/sentence-parser";

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: number; // 스키마에 맞춰 number로 수정
  discountPrice?: number;
  duration: string;
  enrolledCount: number;
  maxStudents: number;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  isActive: boolean;
  rating?: number;
  reviewCount?: number;
  instructorName?: string;
  curriculum?: string; // program 데이터가 들어올 수 있음
  analysisMaterials?: any[] | null;
}

interface CoursesResponse {
  courses: Course[];
  total: number;
}

// Analysis Preview Component (Reuse logic from seminar-management)
const AnalysisPreview = ({ analysis, isSample = false }: { analysis: any, isSample?: boolean }) => {
  if (!analysis) return null;
  
  // 1. Data Extraction & Sampling
  let sentences = analysis.sentences || [];
  let vocabulary = analysis.vocabulary || [];
  let questions = analysis.questions || [];

  if (isSample) {
    if (sentences.length > 0) sentences = sentences.slice(0, 3);
    if (vocabulary.length > 0) vocabulary = vocabulary.slice(0, 10);
    if (questions.length > 0) questions = questions.slice(0, 1); // Sample 1 question
  }

  const hasSentences = sentences.length > 0;
  const hasVocab = vocabulary.length > 0;
  const hasQuestions = questions.length > 0;
  // 구조 분석은 샘플이 아닐 때만 표시 (전체 맥락 파악용이므로)
  const hasStructure = !isSample && analysis.structure;

  // Transform only if needed
  const analyzedSentences = hasSentences ? transformToAnalyzedSentences(sentences) : [];
  
  const structure = analysis.structure || { summary: "", sections: [] };

  return (
    <div className="space-y-8">
      {/* 1. Sentence Analysis */}
      {hasSentences && (
        <section>
          <h4 className="text-lg font-bold border-b-2 border-gray-800 pb-2 mb-4">
            지문 읽기 및 분석 {isSample && "(샘플 미리보기)"}
          </h4>
          <SentenceAnalysisViewer sentences={analyzedSentences} />
        </section>
      )}

      {/* 2. Questions (Variant Problems) */}
      {hasQuestions && (
         <section>
            <h4 className="text-lg font-bold border-b-2 border-gray-800 pb-2 mb-4">
               실전 변형 문제 {isSample && "(샘플 미리보기)"}
            </h4>
            <div className="space-y-6">
               {questions.map((q: any, i: number) => (
                  <div key={i} className="bg-white border rounded-lg p-5 shadow-sm">
                     <div className="flex gap-3 mb-3">
                        <span className="font-bold text-lg text-gray-700 font-serif">Q{i + 1}.</span>
                        <div className="font-medium text-gray-900 text-lg leading-relaxed">
                           {q.question}
                        </div>
                     </div>
                     
                     {q.choices && q.choices.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pl-8 mt-2">
                           {q.choices.map((choice: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-gray-700 hover:bg-gray-50 p-2 rounded cursor-pointer">
                                 <div className="w-5 h-5 mt-0.5 rounded-full border border-gray-300 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                                    {idx + 1}
                                 </div>
                                 <span className="text-sm">{choice}</span>
                              </div>
                           ))}
                        </div>
                     )}

                     {!isSample && q.answer && (
                        <div className="mt-4 ml-8 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                           <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">정답</Badge>
                              <span className="font-bold">{q.answer}</span>
                           </div>
                           {q.explanation && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                 <span className="font-bold text-gray-500 mr-2">[해설]</span>
                                 {q.explanation}
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </section>
      )}

      {/* 3. Vocabulary (Word List) */}
      {hasVocab && (
        <section>
          <h4 className="text-lg font-bold border-b-2 border-gray-800 pb-2 mb-4">
            핵심 단어장 {isSample && "(샘플 미리보기)"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vocabulary.map((v: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded-lg bg-gray-50/50 hover:bg-white hover:shadow-sm hover:border-blue-200 transition-all">
                <span className="font-bold text-gray-800">{v.word}</span>
                <span className="text-gray-600 text-sm">{v.meaning}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Structure (Analysis only) */}
      {hasStructure && (
        <section>
          <h4 className="text-lg font-bold border-b-2 border-gray-800 pb-2 mb-4">지문 구조</h4>
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <div className="text-xs font-bold text-gray-400 uppercase mb-2">전체 요약</div>
            <p className="text-gray-700 leading-relaxed">{structure.summary}</p>
          </div>
          <div className="space-y-3">
            {structure.sections?.map((sec: any, i: number) => (
              <div key={i} className="flex gap-4 border-l-4 border-gray-200 pl-4">
                <div className="font-bold text-blue-600 min-w-[80px]">{sec.label}</div>
                <div className="text-gray-600">{sec.content}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default function CoursesPage() {
  const [location, setLocation] = useLocation();
  const { showAlert } = useAlert();
  const [filters, setFilters] = useState({
    category: "english",
    type: "all",
    level: "all",
    credit: "all",
    search: "",
    page: 1,
    limit: 12,
  });

  const [previewData, setPreviewData] = useState<{ analysis: any, title: string, isSample: boolean, materials?: any[] } | null>(null);

  // Sync filters with URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category") || "english";
    const search = params.get("search") || "";

    setFilters((prev) => {
      if (prev.category === category && prev.search === search) {
        return prev;
      }
      return {
        ...prev,
        category,
        search,
        page: 1,
      };
    });
  }, [location]);

  const { data: coursesData, isLoading } = useQuery<CoursesResponse>({
    queryKey: ["/api/courses", filters],
    queryFn: async ({ queryKey }) => {
      const [_url, filterObj] = queryKey as [string, any];
      const params = new URLSearchParams();
      
      Object.entries(filterObj).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all") {
          params.append(key, String(value));
        }
      });
      
      const queryString = params.toString();
      const finalUrl = queryString ? `${_url}?${queryString}` : _url;
      
      const res = await fetch(finalUrl, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    }
  });

  const [timeLeft] = useState("08시간 52분 43초");

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const totalPages = Math.ceil((coursesData?.total || 0) / filters.limit);

  const handlePreview = async (course: Course, isSample: boolean) => {
    if (!course.curriculum && (!course.analysisMaterials || course.analysisMaterials.length === 0)) {
      showAlert("분석 데이터나 샘플 자료가 없는 항목입니다.");
      return;
    }
    try {
      let analysisData = null;
      
      if (course.curriculum) {
        // Handle linked seminar reference
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
            console.error("Error fetching linked seminar:", err);
          }
        } else if (typeof course.curriculum === 'string' && course.curriculum.startsWith('linked_source:')) {
          // Handle linked source reference (from dropdown load)
          const sourceId = course.curriculum.split(':')[1];
          // We could fetch source material here if needed, but usually curriculum already has parsedText
        } else {
          // Handle potential double stringification
          let curriculumData = course.curriculum;
          if (typeof curriculumData === 'string' && curriculumData.startsWith('"')) {
            try { curriculumData = JSON.parse(curriculumData); } catch(e) {}
          }
          
          if (typeof curriculumData === 'string' && (curriculumData.startsWith('{') || curriculumData.startsWith('['))) {
            try { analysisData = JSON.parse(curriculumData); } catch(e) {}
          } else {
            // Raw text or not JSON
          }
        }
      }

      setPreviewData({ 
        analysis: analysisData, 
        title: course.title, 
        isSample,
        materials: course.analysisMaterials || []
      });
    } catch (e) {
      console.error("Failed to parse preview data", e);
      showAlert("데이터를 읽는 중 오류가 발생했습니다.");
    }
  };

  const downloadPdf = (analysis: any, title: string) => {
    if (!analysis) return;
    
    const sentences = analysis.sentences || [];
    const structure = analysis.structure || { summary: "", sections: [] };
    const vocabulary = analysis.vocabulary || [];

    const htmlContent = `
      <div style="font-family: 'Malgun Gothic', sans-serif; padding: 10px; color: #333; background: white;">
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1a365d; padding-bottom: 15px;">
          <h1 style="font-size: 24px; color: #1a365d; margin: 0;">${title}</h1>
          <p style="font-size: 11px; color: #666; margin-top: 8px;">분석 보고서 | 생성일: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h2 style="font-size: 20px; border-left: 5px solid #3182ce; padding-left: 15px; margin-bottom: 20px; color: #2d3748;">1. 지문 읽기 및 분석</h2>
        ${sentences.map((s: any, i: number) => `
          <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
            <div style="background: #f8fafc; padding: 10px 15px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #4a5568;">
              Sentence #${i+1}
            </div>
            <div style="padding: 20px;">
              <div style="margin-bottom: 15px;">
                <div style="font-size: 10px; color: #a0aec0; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Original & Analysis</div>
                <div style="font-size: 16px; line-height: 1.6; color: #2d3748; font-family: 'Times New Roman', serif;">${s.analysis || s.original}</div>
              </div>
              <div style="margin-bottom: 15px;">
                <div style="font-size: 10px; color: #a0aec0; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Translation</div>
                <div style="font-size: 14px; line-height: 1.6; color: #4a5568;">${s.translation}</div>
              </div>
              ${s.grammarPoint ? `
                <div style="background: #ebf8ff; padding: 12px; border-radius: 4px; border-left: 4px solid #4299e1;">
                  <div style="font-size: 10px; color: #3182ce; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Grammar Points</div>
                  <div style="font-size: 13px; color: #2b6cb0; line-height: 1.5;">${s.grammarPoint.replace(/\n/g, '<br/>')}</div>
                </div>
              ` : ''}
              ${s.paraphrasing ? `
                <div style="margin-top: 15px; border-top: 1px dashed #e2e8f0; padding-top: 15px;">
                   <div style="font-size: 10px; color: #a0aec0; text-transform: uppercase; font-weight: bold; margin-bottom: 5px;">Paraphrasing</div>
                   <div style="font-size: 13px; color: #2d3748; font-style: italic;">${s.paraphrasing.english || (typeof s.paraphrasing === 'string' ? s.paraphrasing : '')}</div>
                   <div style="font-size: 13px; color: #718096; margin-top: 5px;">${s.paraphrasing.korean || ''}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}

        <div style="page-break-before: always;"></div>
        <h2 style="font-size: 20px; border-left: 5px solid #3182ce; padding-left: 15px; margin-bottom: 20px; margin-top: 40px; color: #2d3748;">2. 지문 구조 분석</h2>
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; border: 1px solid #edf2f7; margin-bottom: 25px;">
          <div style="font-size: 10px; color: #a0aec0; text-transform: uppercase; font-weight: bold; margin-bottom: 10px;">전체 요약</div>
          <div style="font-size: 14px; line-height: 1.7; color: #4a5568;">${structure.summary}</div>
        </div>
        ${(structure.sections || []).map((sec: any) => `
          <div style="margin-bottom: 20px; padding-left: 15px; border-left: 3px solid #cbd5e0;">
            <div style="font-weight: bold; color: #2d3748; margin-bottom: 5px; font-size: 15px;">${sec.label}</div>
            <div style="font-size: 14px; color: #4a5568; line-height: 1.6;">${sec.content}</div>
          </div>
        `).join('')}

        <h2 style="font-size: 20px; border-left: 5px solid #3182ce; padding-left: 15px; margin-bottom: 20px; margin-top: 40px; color: #2d3748;">3. 핵심 어휘</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${vocabulary.map((v: any) => `
            <div style="border-bottom: 1px solid #edf2f7; padding: 10px 5px; display: flex;">
              <div style="width: 40%; font-weight: bold; color: #2d3748;">${v.word}</div>
              <div style="width: 60%; color: #718096; font-size: 13px;">${v.meaning}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const worker = document.createElement('div');
    worker.innerHTML = htmlContent;
    document.body.appendChild(worker);

    const opt = {
      margin: [10, 8],
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
    
    const sentences = analysis.sentences || [];
    const structure = analysis.structure || { summary: "", sections: [] };
    const vocabulary = analysis.vocabulary || [];

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>
      <style>
        body { font-family: 'Malgun Gothic', 'Dotum', sans-serif; }
        .title { font-size: 24pt; font-weight: bold; text-align: center; margin-bottom: 30pt; }
        .section-header { font-size: 16pt; font-weight: bold; color: #2b6cb0; border-bottom: 2pt solid #2b6cb0; padding-bottom: 5pt; margin-top: 20pt; }
        .sentence-box { border: 1pt solid #cbd5e0; padding: 10pt; margin-bottom: 15pt; }
        .label { font-size: 9pt; color: #718096; font-weight: bold; }
        .content-text { font-size: 12pt; margin-bottom: 5pt; }
        .grammar-box { background: #f0f9ff; border-left: 3pt solid #3182ce; padding: 8pt; margin-top: 5pt; }
        table { width: 100%; border-collapse: collapse; }
        td { border-bottom: 0.5pt solid #e2e8f0; padding: 8pt; }
      </style>
      </head>
      <body>
        <div class="title">${title}</div>
        <div class="section-header">1. 지문 읽기 및 분석</div>
        ${sentences.map((s: any, i: number) => `
          <div class="sentence-box">
            <div class="label">Sentence #${i+1}</div>
            <div class="content-text" style="font-family: serif; font-size: 14pt;">${s.analysis || s.original}</div>
            <div class="label">해석</div>
            <div class="content-text">${s.translation}</div>
            ${s.grammarPoint ? `<div class="grammar-box"><div class="label">문법 포인트</div><div>${s.grammarPoint.replace(/\n/g, '<br/>')}</div></div>` : ''}
          </div>
        `).join('')}
        <div class="section-header">2. 지문 구조</div>
        <div style="background: #f7fafc; padding: 10pt; margin-bottom: 15pt;">
          <div class="label">전체 요약</div>
          <div>${structure.summary}</div>
        </div>
        ${(structure.sections || []).map((sec: any) => `
          <div style="margin-bottom: 10pt;">
            <strong>${sec.label}</strong>: ${sec.content}
          </div>
        `).join('')}
        <div class="section-header">3. 핵심 단어</div>
        <table>
          ${vocabulary.map((v: any) => `
            <tr>
              <td width="30%"><strong>${v.word}</strong></td>
              <td>${v.meaning}</td>
            </tr>
          `).join('')}
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

  const handleDirectDownload = async (course: Course, format: 'pdf' | 'hwpx') => {
    if (!course.curriculum) return;
    try {
      let analysisData = null;

      // Handle linked seminar reference
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
        try {
          if (typeof curriculumData === 'string') {
             // Handle double encoded JSON
             if (curriculumData.startsWith('"')) {
                try {
                  curriculumData = JSON.parse(curriculumData);
                } catch (e) {
                  // Ignore double parse error, try direct parse next
                }
             }
             
             // Check if it looks like a valid JSON
             if (typeof curriculumData === 'string' && (curriculumData.startsWith('{') || curriculumData.startsWith('['))) {
                analysisData = JSON.parse(curriculumData);
             } else {
                analysisData = curriculumData;
             }
          } else {
             analysisData = curriculumData;
          }
        } catch (parseErr) {
          console.error("JSON Parse Error in handleDirectDownload:", parseErr);
          // If JSON is truncated/invalid, we can't download analysis data.
          // But maybe we can pass empty structure or partial data?
          // For now, just log it.
          return;
        }
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

  const categoryTitles: Record<string, string> = {
    english: "영어",
    korean: "국어",
    math: "수학",
    science: "과학",
    social: "사회",
    mock: "모의고사",
    all: "전체 강의",
  };

  const currentTitle = categoryTitles[filters.category] || "과목";

  const getBadgeInfo = (course: Course) => {
    const title = course.title || "";
    let label = "분석 자료";
    let colorClass = "text-blue-600 border-blue-200 bg-blue-50";

    // 1. Title based detection (Initial guess)
    if (title.includes("단어장")) {
      label = "단어장";
      colorClass = "text-emerald-600 border-emerald-200 bg-emerald-50";
    } else if (title.includes("워크북")) {
      label = "워크북";
      colorClass = "text-orange-600 border-orange-200 bg-orange-50";
    } else if (title.includes("변형문제")) {
      label = "변형문제";
      colorClass = "text-purple-600 border-purple-200 bg-purple-50";
    } else if (title.includes("본문분석")) {
      label = "본문분석";
      colorClass = "text-blue-600 border-blue-200 bg-blue-50";
    }
    
    // 2. Curriculum content based detection (Refinement/Correction)
    if (course.curriculum) {
      try {
        let data = null;
        if (typeof course.curriculum === 'string' && (course.curriculum.trim().startsWith('{') || course.curriculum.trim().startsWith('['))) {
           data = JSON.parse(course.curriculum);
           // Handle double stringification
           if (typeof data === 'string') {
             try { data = JSON.parse(data); } catch(e) {}
           }
        }

        if (data) {
           const item = Array.isArray(data) ? data[0] : data;
           if (item) {
             // Priority 1: Questions -> Variant
             if (item.questions && item.questions.length > 0) {
               label = "변형문제";
               colorClass = "text-purple-600 border-purple-200 bg-purple-50";
             } 
             // Priority 2: Structure OR (Sentences AND NOT Workbook) -> Analysis
             // Analysis usually has structure. Vocabulary doesn't.
             else if (item.structure || (item.sentences && item.sentences.length > 0 && !item.title?.includes("워크북") && item.type !== "workbook")) {
               label = "본문분석";
               colorClass = "text-blue-600 border-blue-200 bg-blue-50";
             } 
             // Priority 3: Sentences AND Workbook -> Workbook
             else if (item.sentences && (item.title?.includes("워크북") || item.type === "workbook")) {
               label = "워크북";
               colorClass = "text-orange-600 border-orange-200 bg-orange-50";
             } 
             // Priority 4: Vocabulary AND NO Sentences -> Word List
             else if (item.vocabulary && (!item.sentences || item.sentences.length === 0)) {
               label = "단어장";
               colorClass = "text-emerald-600 border-emerald-200 bg-emerald-50";
             }
           }
        }
      } catch (e) {}
    }

    return { label, colorClass };
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-6">{currentTitle}</h1>

              {/* Accordion Menu */}
              <div className="w-full">
                <div 
                  className={`py-3 px-0 cursor-pointer text-sm font-medium border-b border-gray-200 transition-colors ${
                    filters.level === 'all' && filters.type === 'all' && !filters.search 
                      ? "text-blue-600 font-bold" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setFilters(prev => ({ ...prev, level: 'all', type: 'all', search: '', page: 1 }))}
                >
                  전체리스트
                </div>
                
                <Accordion type="single" collapsible className="w-full" defaultValue="middle">
                  <AccordionItem value="middle" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3 text-gray-600 hover:text-gray-900 data-[state=open]:text-gray-900 font-normal">
                      중등교과서
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-1 pl-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, level: 'beginner', type: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.level === 'beginner' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          1학년
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, level: 'intermediate', type: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.level === 'intermediate' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          2학년
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, level: 'advanced', type: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.level === 'advanced' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          3학년
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="high" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3 text-gray-600 hover:text-gray-900 data-[state=open]:text-gray-900 font-normal">
                      고등교과서
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-1 pl-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, level: 'high1', type: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.level === 'high1' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          1학년
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, level: 'high2', type: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.level === 'high2' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          2학년
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, level: 'high3', type: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.level === 'high3' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          3학년
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="ebs" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3 text-gray-600 hover:text-gray-900 data-[state=open]:text-gray-900 font-normal">
                      EBS
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-1 pl-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, type: 'suneung', level: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.type === 'suneung' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          수능특강
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, type: 'completion', level: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.type === 'completion' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          수능완성
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="mock" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3 text-gray-600 hover:text-gray-900 data-[state=open]:text-gray-900 font-normal">
                      모의고사/수능
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-1 pl-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, search: '2025년 모의고사', level: 'all', type: 'all', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.search === '2025년 모의고사' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          2025년 모의고사
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="ref" className="border-b-0">
                    <AccordionTrigger className="hover:no-underline py-3 text-gray-600 hover:text-gray-900 data-[state=open]:text-gray-900 font-normal">
                      참고서
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-col space-y-1 pl-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, type: 'grammar', level: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.type === 'grammar' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          문법
                        </Button>
                        <Button 
                          variant="ghost" 
                          onClick={() => setFilters(prev => ({ ...prev, type: 'reading', level: 'all', search: '', page: 1 }))} 
                          className={`justify-start h-9 px-2 text-sm hover:bg-transparent ${filters.type === 'reading' ? 'text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          독해
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div className="text-gray-500 text-sm">
                총 <span className="text-gray-900 font-bold">{coursesData?.total || 0}</span>개
              </div>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[100px] border-none shadow-none text-gray-600 h-8 focus:ring-0">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="popular">인기순</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-0">
              {isLoading ? (
                <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : coursesData?.courses?.map((course) => (
                <div
                  key={course.id}
                  className="flex gap-4 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                >
                  <div 
                    className="w-20 h-28 flex-shrink-0 bg-gray-100 rounded overflow-hidden border border-gray-200 relative cursor-pointer"
                    onClick={() => setLocation(`/courses/${course.id}`)}
                  >
                    <img 
                      src={course.imageUrl && course.imageUrl !== "/api/placeholder/400/250" ? course.imageUrl : "/uploads/images/1.jpg"} 
                      alt={course.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = "/uploads/images/1.jpg";
                      }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Qnova패스 {categoryTitles[course.category] || '자료'}
                      </div>
                      <h3 
                        className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight"
                        onClick={() => setLocation(`/courses/${course.id}`)}
                      >
                        {course.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="font-medium text-gray-700">{course.instructorName || "김영철"}</span>
                        <span className="text-gray-300">|</span>
                        <div className="flex items-center text-yellow-400">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-gray-900 ml-1 font-bold">{course.rating || 4.8}</span>
                        </div>
                        <span className="text-gray-400">({course.reviewCount || 0}개 후기)</span>
                      </div>

                      <div className="text-gray-900 text-sm font-medium">
                        {course.price === 0 ? "무료 제공" : `${course.price?.toLocaleString()}원`}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between py-1 min-w-[100px]">
                    {(() => {
                      const badgeInfo = getBadgeInfo(course);
                      return (
                        <Badge variant="outline" className={badgeInfo.colorClass}>
                          {badgeInfo.label}
                        </Badge>
                      );
                    })()}
                    <div className="flex flex-col gap-2 w-full mt-auto">
                      <Button
                        variant="outline"
                        className="w-full h-7 text-xs hover:bg-gray-100 border-gray-300 px-2"
                        onClick={() => handlePreview(course, true)}
                      >
                        샘플 보기
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewData} onOpenChange={(open) => !open && setPreviewData(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 mb-4">
            <DialogTitle className="text-xl">{previewData?.title}</DialogTitle>
            {!previewData?.isSample && (
              <div className="flex gap-2 mr-8">
                <Button variant="outline" size="sm" onClick={() => downloadPdf(previewData?.analysis, previewData?.title || "")} className="gap-1">
                  <Printer className="w-4 h-4" /> PDF 다운
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadHwpx(previewData?.analysis, previewData?.title || "")} className="gap-1">
                  <Download className="w-4 h-4" /> HWPX 다운
                </Button>
              </div>
            )}
          </DialogHeader>
          
          <AnalysisPreview analysis={previewData?.analysis} isSample={previewData?.isSample} />

          {(!previewData?.analysis || previewData.isSample) && previewData?.materials && previewData.materials.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h4 className="text-lg font-bold mb-4 flex items-center">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                샘플 자료 (첨부 파일)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {previewData.materials.map((file: any) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 group hover:bg-white hover:border-blue-200 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded shadow-sm group-hover:bg-blue-50">
                        <FileText className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    </div>
                    {file.url ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white hover:bg-blue-600 hover:text-white border-blue-200"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        자료 보기
                      </Button>
                    ) : (
                      <Badge variant="secondary">준비 중</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <ChatWidget />
    </div>
  );
}
