import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Download,
  ArrowRight,
  ChevronRight,
  Trophy,
  Printer,
  Tag,
  Megaphone,
  ThumbsUp,
} from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ChatWidget from "@/components/chat-widget";
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { useAlert } from "@/contexts/alert-context";

// Analysis Preview Component (Reuse logic from courses-page)
const AnalysisPreview = ({ analysis, isSample = false }: { analysis: any, isSample?: boolean }) => {
  if (!analysis) return null;
  
  let sentences = analysis.sentences || [];
  if (isSample && sentences.length > 0) {
    sentences = [sentences[0]]; // Show only 1st sentence for sample
  }
  
  const structure = analysis.structure || {};
  const backgroundKnowledge = analysis.backgroundKnowledge;
  const vocabulary = analysis.vocabulary || [];

  return (
    <div className="space-y-8 p-4">
      {/* 1. 제목, 주제, 요약 */}
      {structure && (
        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-3">제목, 주제, 요약</h3>
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
            <div className="flex gap-4 items-start">
              <span className="text-red-500 font-bold w-10 shrink-0 text-xs pt-0.5">제목</span>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{structure.title || "제목 정보 없음"}</h4>
                <p className="text-slate-500 text-[11px] mt-1">{structure.titleTranslation}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start border-t border-slate-50 pt-3">
              <span className="text-blue-500 font-bold w-10 shrink-0 text-xs pt-0.5">주제</span>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{structure.subject || "주제 정보 없음"}</h4>
                <p className="text-slate-500 text-[11px] mt-1">{structure.subjectTranslation}</p>
              </div>
            </div>
            <div className="flex gap-4 items-start border-t border-slate-50 pt-3">
              <span className="text-emerald-500 font-bold w-10 shrink-0 text-xs pt-0.5">요약</span>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-[13px] leading-relaxed">{structure.summary || "요약 정보 없음"}</h4>
                <p className="text-slate-500 text-[11px] mt-1">{structure.summaryTranslation}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. 배경 지식 */}
      {backgroundKnowledge && (
        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-3">배경 지식</h3>
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <h4 className="font-bold text-slate-900 text-sm mb-2">{backgroundKnowledge.title}</h4>
            <p className="text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">{backgroundKnowledge.description}</p>
          </div>
        </section>
      )}

      {/* 3. 핵심 단어 */}
      {vocabulary.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-900 mb-3">핵심 단어</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vocabulary.slice(0, isSample ? 4 : undefined).map((v: any, i: number) => (
              <div key={i} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex items-start gap-3">
                 <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center mt-0.5 shrink-0">
                   <div className="w-3 h-3 bg-slate-100 rounded-sm"></div>
                 </div>
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-bold text-slate-900">{v.word}</span>
                     {v.partOfSpeech && <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 rounded">{v.partOfSpeech}</span>}
                   </div>
                   <p className="text-sm text-slate-600 mb-2">{v.meaning}</p>
                   <div className="space-y-1">
                     {v.synonyms && (
                       <div className="text-[11px] flex gap-2">
                         <span className="text-blue-500 font-bold w-3">=</span>
                         <span className="text-slate-500">{Array.isArray(v.synonyms) ? v.synonyms.join(", ") : v.synonyms}</span>
                       </div>
                     )}
                     {v.antonyms && (
                       <div className="text-[11px] flex gap-2">
                         <span className="text-red-500 font-bold w-3">↔</span>
                         <span className="text-slate-500">{Array.isArray(v.antonyms) ? v.antonyms.join(", ") : v.antonyms}</span>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            ))}
          </div>
          {isSample && vocabulary.length > 4 && (
            <p className="text-center text-sm text-slate-400 mt-4">... 샘플 보기에서는 일부 단어만 표시됩니다 ...</p>
          )}
        </section>
      )}

      {/* 4. 지문 읽기 및 분석 */}
      <section>
        <h3 className="text-sm font-bold text-slate-900 mb-3">지문 읽기 및 분석 {isSample && "(샘플 - 1문장만 표시)"}</h3>
        <div className="space-y-6">
          {sentences.map((s: any, i: number) => (
            <div key={i} className="border border-slate-200 rounded-2xl p-6 bg-white shadow-sm">
              <div className="text-xs font-bold text-blue-500 mb-3">Sentence #{String(i + 1).padStart(2, '0')}</div>
              <p className="font-serif text-lg mb-4 leading-loose text-slate-800">{s.analysis || s.original}</p>
              <div className="bg-slate-50 p-4 rounded-xl text-slate-700 text-sm leading-relaxed">{s.translation}</div>
              {s.grammarPoint && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Grammar Point</span>
                   <p className="text-sm text-blue-600 leading-relaxed">{s.grammarPoint}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { showAlert } = useAlert();
  const [sortType, setSortType] = useState("popular");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setProgress] = useState(0); // Progress state used for timer effect but not rendered
  const [previewData, setPreviewData] = useState<{ analysis: any, title: string, isSample: boolean } | null>(null);

  // Fetch recent courses/workbooks
  const { data: coursesData } = useQuery<{ courses: any[]; total: number }>({
    queryKey: ["/api/courses", { limit: 10 }],
    queryFn: async ({ queryKey }) => {
      const [_url, params] = queryKey as [string, any];
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
      const res = await fetch(`${_url}?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    }
  });

  const recentMaterials = coursesData?.courses || [];

  // Fetch recent notices
  const { data: noticesData } = useQuery({
    queryKey: ["/api/notices", { limit: 5 }],
    queryFn: async () => {
      const res = await fetch("/api/notices?limit=5");
      if (!res.ok) throw new Error("Failed to fetch notices");
      return res.json();
    }
  });

  const recentNotices = noticesData?.notices || [];

  // Fetch popular brands (instructors)
  const { data: popularBrandsData } = useQuery<any[]>({
    queryKey: ["/api/popular-brands"],
  });

  const popularBrands = popularBrandsData || [];

  const getCategoryImage = (category: string) => {
    const map: Record<string, string> = {
      "english": "/images/BOOKS/1.png",
      "korean": "/images/BOOKS/4.png",
      "math": "/images/BOOKS/9.png",
      "science": "/images/BOOKS/12.png",
      "social": "/images/BOOKS/13.png",
      "mock": "/images/BOOKS/14.png",
    };
    return map[category] || "/images/BOOKS/5.png";
  };

  // Helper to safely parse analysis data
  const parseAnalysisData = (data: any) => {
    if (!data) return null;
    
    try {
      // If it's already an object, return it
      if (typeof data === 'object' && data !== null) {
        return data;
      }
      
      // If it's a string, try to parse it
      if (typeof data === 'string') {
        // Handle double stringification by parsing loop
        let parsed = data;
        while (typeof parsed === 'string') {
          try {
            const temp = JSON.parse(parsed);
            // If parsed result is same as input (e.g. simple string), stop
            if (temp === parsed) break;
            parsed = temp;
          } catch (e) {
            // Stop if parsing fails
            break;
          }
        }
        return typeof parsed === 'object' ? parsed : null;
      }
      
      return null;
    } catch (e) {
      console.error("Error parsing analysis data:", e);
      return null;
    }
  };

  const handlePreview = async (material: any, isSample: boolean) => {
    // curriculum or program 필드 사용
    let rawData = material.curriculum || material.program;

    // 데이터가 없고 ID가 있는 경우 상세 정보 조회 시도
    if (!rawData && material.id) {
      try {
        const res = await fetch(`/api/courses/${material.id}`);
        if (res.ok) {
          const courseDetail = await res.json();
          rawData = courseDetail.curriculum || courseDetail.program;
        }
      } catch (e) {
        console.error("Failed to fetch course details", e);
      }
    }

    if (!rawData) {
      showAlert("분석 데이터가 없는 자료입니다.");
      return;
    }
    try {
      let analysisData = null;
      
      // Handle linked seminar reference
      if (typeof rawData === 'string' && rawData.startsWith('linked_seminar:')) {
        const seminarId = rawData.split(':')[1];
        try {
          const response = await fetch(`/api/seminars/${seminarId}`);
          if (!response.ok) throw new Error("분석 자료를 불러올 수 없습니다.");
          const seminar = await response.json();
          // Use the helper to parse seminar program
          analysisData = parseAnalysisData(seminar.program);
        } catch (err) {
          console.error("Error fetching linked seminar:", err);
          showAlert("연결된 분석 자료를 불러오는 중 오류가 발생했습니다.");
          return;
        }
      } else {
        // Use the helper to parse raw data
        analysisData = parseAnalysisData(rawData);
      }

      if (!analysisData) {
        showAlert("분석 데이터를 찾을 수 없습니다.");
        return;
      }

      setPreviewData({ analysis: analysisData, title: material.title, isSample });
    } catch (e) {
      console.error("Failed to parse analysis data", e);
      showAlert("데이터를 읽는 중 오류가 발생했습니다.");
    }
  };

  const downloadPdf = (analysis: any, title: string) => {
    if (!analysis) return;
    
    const sentences = analysis.sentences || [];
    const structure = analysis.structure || {};
    const backgroundKnowledge = analysis.backgroundKnowledge;
    const vocabulary = analysis.vocabulary || [];

    const htmlContent = `
      <div style="font-family: 'Malgun Gothic', sans-serif; padding: 20px; color: #333; background: white;">
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1a365d; padding-bottom: 20px;">
          <h1 style="font-size: 24px; color: #1a365d; margin: 0; font-weight: bold;">${title}</h1>
          <p style="font-size: 11px; color: #666; margin-top: 10px;">분석 보고서 | 생성일: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <!-- 1. 제목, 주제, 요약 -->
        ${structure ? `
          <h2 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px;">제목, 주제, 요약</h2>
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 40px;">
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <span style="color: #ef4444; font-weight: bold; font-size: 12px; width: 40px; padding-top: 2px;">제목</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 4px;">${structure.title || "제목 정보 없음"}</div>
                <div style="font-size: 11px; color: #64748b;">${structure.titleTranslation || ""}</div>
              </div>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 15px; border-top: 1px solid #f8fafc; padding-top: 15px;">
              <span style="color: #3b82f6; font-weight: bold; font-size: 12px; width: 40px; padding-top: 2px;">주제</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 4px;">${structure.subject || "주제 정보 없음"}</div>
                <div style="font-size: 11px; color: #64748b;">${structure.subjectTranslation || ""}</div>
              </div>
            </div>
            <div style="display: flex; gap: 15px; border-top: 1px solid #f8fafc; padding-top: 15px;">
              <span style="color: #10b981; font-weight: bold; font-size: 12px; width: 40px; padding-top: 2px;">요약</span>
              <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 13px; color: #0f172a; margin-bottom: 4px; line-height: 1.6;">${structure.summary || "요약 정보 없음"}</div>
                <div style="font-size: 11px; color: #64748b;">${structure.summaryTranslation || ""}</div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 2. 배경 지식 -->
        ${backgroundKnowledge ? `
          <h2 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px;">배경 지식</h2>
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 40px;">
            <div style="font-weight: bold; font-size: 14px; color: #0f172a; margin-bottom: 8px;">${backgroundKnowledge.title}</div>
            <div style="font-size: 12px; color: #475569; line-height: 1.6;">${backgroundKnowledge.description}</div>
          </div>
        ` : ''}

        <!-- 3. 핵심 단어 -->
        ${vocabulary.length > 0 ? `
          <h2 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 15px;">핵심 단어</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px;">
            ${vocabulary.map((v: any) => `
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; page-break-inside: avoid;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                  <span style="font-weight: bold; color: #0f172a; font-size: 14px;">${v.word}</span>
                  ${v.partOfSpeech ? `<span style="font-size: 10px; color: #64748b; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${v.partOfSpeech}</span>` : ''}
                </div>
                <div style="font-size: 13px; color: #475569; margin-bottom: 8px;">${v.meaning}</div>
                ${v.synonyms || v.antonyms ? `
                  <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px;">
                    ${v.synonyms ? `
                      <div style="display: flex; gap: 6px; font-size: 11px; margin-bottom: 2px;">
                        <span style="color: #3b82f6; font-weight: bold;">=</span>
                        <span style="color: #64748b;">${Array.isArray(v.synonyms) ? v.synonyms.join(", ") : v.synonyms}</span>
                      </div>
                    ` : ''}
                    ${v.antonyms ? `
                      <div style="display: flex; gap: 6px; font-size: 11px;">
                        <span style="color: #ef4444; font-weight: bold;">↔</span>
                        <span style="color: #64748b;">${Array.isArray(v.antonyms) ? v.antonyms.join(", ") : v.antonyms}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div style="page-break-before: always;"></div>
        
        <!-- 4. 지문 읽기 및 분석 -->
        <h2 style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 20px;">지문 읽기 및 분석</h2>
        ${sentences.map((s: any, i: number) => `
          <div style="margin-bottom: 30px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; page-break-inside: avoid;">
            <div style="padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
              <span style="font-size: 12px; font-weight: bold; color: #3b82f6;">Sentence #${String(i + 1).padStart(2, '0')}</span>
            </div>
            <div style="padding: 25px;">
              <div style="font-size: 16px; line-height: 1.8; color: #1e293b; font-family: 'Times New Roman', serif; margin-bottom: 20px;">
                ${s.original || s.analysis}
              </div>
              <div style="background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 13px; line-height: 1.6; color: #334155;">
                ${s.translation}
              </div>
              ${s.grammarPoint ? `
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                  <div style="font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Grammar Point</div>
                  <div style="font-size: 13px; color: #2563eb; line-height: 1.5;">${s.grammarPoint.replace(/\n/g, '<br/>')}</div>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    const worker = document.createElement('div');
    worker.innerHTML = htmlContent;
    document.body.appendChild(worker);

    const opt = {
      margin: [10, 10],
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
    const structure = analysis.structure || {};
    const backgroundKnowledge = analysis.backgroundKnowledge;
    const vocabulary = analysis.vocabulary || [];

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'>
      <style>
        body { font-family: 'Malgun Gothic', 'Dotum', sans-serif; }
        .title { font-size: 24pt; font-weight: bold; text-align: center; margin-bottom: 30pt; }
        .section-header { font-size: 14pt; font-weight: bold; color: #1e293b; margin-top: 20pt; margin-bottom: 10pt; }
        .card { border: 1pt solid #e2e8f0; padding: 15pt; margin-bottom: 15pt; border-radius: 8pt; }
        .label { font-size: 9pt; font-weight: bold; width: 40pt; }
        .red { color: #ef4444; } .blue { color: #3b82f6; } .green { color: #10b981; }
        .content-title { font-size: 11pt; font-weight: bold; color: #0f172a; margin-bottom: 3pt; }
        .content-sub { font-size: 9pt; color: #64748b; }
        .vocab-grid { width: 100%; border-collapse: collapse; }
        .vocab-cell { border: 1pt solid #e2e8f0; padding: 10pt; width: 50%; vertical-align: top; }
        .sentence-box { border: 1pt solid #e2e8f0; margin-bottom: 20pt; }
        .sentence-header { padding: 10pt; border-bottom: 1pt solid #e2e8f0; color: #3b82f6; font-weight: bold; font-size: 10pt; }
        .sentence-body { padding: 15pt; }
        .original { font-size: 13pt; margin-bottom: 15pt; font-family: serif; line-height: 150%; }
        .translation { background: #f8fafc; padding: 10pt; font-size: 10pt; color: #334155; margin-bottom: 10pt; }
        .grammar { border-top: 1pt solid #f1f5f9; padding-top: 10pt; font-size: 10pt; color: #2563eb; }
      </style>
      </head>
      <body>
        <div class="title">${title}</div>
        
        ${structure ? `
          <div class="section-header">제목, 주제, 요약</div>
          <div class="card">
            <table width="100%">
              <tr>
                <td class="label red" valign="top">제목</td>
                <td>
                  <div class="content-title">${structure.title || "제목 정보 없음"}</div>
                  <div class="content-sub">${structure.titleTranslation || ""}</div>
                </td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
              <tr>
                <td class="label blue" valign="top">주제</td>
                <td>
                  <div class="content-title">${structure.subject || "주제 정보 없음"}</div>
                  <div class="content-sub">${structure.subjectTranslation || ""}</div>
                </td>
              </tr>
              <tr><td colspan="2" height="10"></td></tr>
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
            <div class="content-sub" style="font-size: 10pt; margin-top: 5pt;">${backgroundKnowledge.description}</div>
          </div>
        ` : ''}

        ${vocabulary.length > 0 ? `
          <div class="section-header">핵심 단어</div>
          <table class="vocab-grid">
            ${vocabulary.map((v: any, i: number) => i % 2 === 0 ? `
              <tr>
                <td class="vocab-cell">
                  <div><strong>${v.word}</strong> <span style="font-size: 8pt; background: #f1f5f9; padding: 2px;">${v.partOfSpeech || ''}</span></div>
                  <div style="font-size: 10pt; color: #475569; margin-top: 3pt;">${v.meaning}</div>
                </td>
                ${vocabulary[i+1] ? `
                <td class="vocab-cell">
                  <div><strong>${vocabulary[i+1].word}</strong> <span style="font-size: 8pt; background: #f1f5f9; padding: 2px;">${vocabulary[i+1].partOfSpeech || ''}</span></div>
                  <div style="font-size: 10pt; color: #475569; margin-top: 3pt;">${vocabulary[i+1].meaning}</div>
                </td>` : '<td class="vocab-cell"></td>'}
              </tr>
            ` : '').join('')}
          </table>
        ` : ''}

        <br clear="all" style="page-break-before:always" />

        <div class="section-header">지문 읽기 및 분석</div>
        ${sentences.map((s: any, i: number) => `
          <div class="sentence-box">
            <div class="sentence-header">Sentence #${i+1}</div>
            <div class="sentence-body">
              <div class="original">${s.original || s.analysis}</div>
              <div class="translation">${s.translation}</div>
              ${s.grammarPoint ? `<div class="grammar"><strong>GRAMMAR POINT</strong><br/>${s.grammarPoint.replace(/\n/g, '<br/>')}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title}.hwpx`;
    link.click();
  };

  const handleDirectDownload = async (material: any, format: 'pdf' | 'hwpx') => {
    // curriculum or program 필드 사용
    let rawData = material.curriculum || material.program;

    // 데이터가 없고 ID가 있는 경우 상세 정보 조회 시도
    if (!rawData && material.id) {
      try {
        const res = await fetch(`/api/courses/${material.id}`);
        if (res.ok) {
          const courseDetail = await res.json();
          rawData = courseDetail.curriculum || courseDetail.program;
        }
      } catch (e) {
        console.error("Failed to fetch course details for download", e);
      }
    }

    if (!rawData) {
      showAlert("다운로드 가능한 분석 데이터가 없습니다.");
      return;
    }
    
    try {
      let analysisData = null;
      
      // Handle linked seminar reference
      if (typeof rawData === 'string' && rawData.startsWith('linked_seminar:')) {
        const seminarId = rawData.split(':')[1];
        try {
          const response = await fetch(`/api/seminars/${seminarId}`);
          if (!response.ok) throw new Error("분석 자료를 불러올 수 없습니다.");
          const seminar = await response.json();
          // Use the helper to parse seminar program
          analysisData = parseAnalysisData(seminar.program);
        } catch (err) {
          console.error("Error fetching linked seminar for download:", err);
          showAlert("연결된 분석 자료를 불러오는 중 오류가 발생했습니다.");
          return;
        }
      } else {
        // Use the helper to parse raw data
        analysisData = parseAnalysisData(rawData);
      }

      if (!analysisData) {
        showAlert("분석 데이터를 찾을 수 없습니다.");
        return;
      }
      
      if (format === 'pdf') {
        downloadPdf(analysisData, material.title);
      } else {
        downloadHwpx(analysisData, material.title);
      }
    } catch (e) {
      console.error("Direct download failed", e);
      showAlert("데이터를 읽는 중 오류가 발생했습니다.");
    }
  };

  // 슬라이드 데이터
  const slides = [
    {
      id: 0,
      title: "중고등 전방위 무제한 다운로드",
      subtitle: "수업 준비 단 1분이면 끝",
      highlight: "Qnova 하나면 끝!",
      link: "영어 Qnova패스 보러가기 >",
      tags: ["중고등 전범위", "기출 변형", "외부지문"],
      image: "/images/BOOKS/4.png",
    },
    {
      id: 1,
      title: "수업 준비 1분 완성",
      subtitle: "외부지문 대비까지 맞춤형으로",
      highlight: "Qnova 하나면 끝!",
      link: "영어 Qnova 보러가기 >",
      tags: ["중고등 전범위", "기출 변형", "외부지문"],
      image: "/images/BOOKS/5.png",
    },
    {
      id: 2,
      title: "참석만 해도 10만원 혜택 증정",
      subtitle: "특별 이벤트 진행 중",
      highlight: "지금 바로 신청하세요!",
      link: "이벤트 참여하기 >",
      tags: ["특별 혜택", "이벤트", "할인"],
      image: "/images/BOOKS/6.png",
    },
    {
      id: 3,
      title: "2026 수능 완벽 대비",
      subtitle: "최신 경향을 반영한 맞춤형 학습",
      highlight: "지금 바로 시작하세요!",
      link: "수능 자료 보러가기 >",
      tags: ["수능 대비", "최신 경향", "맞춤형 학습"],
      image: "/images/BOOKS/10.png",
    },
    {
      id: 4,
      title: "예비 고1을 위한 필수 자료",
      subtitle: "고등학교 입학 전 완벽 준비",
      highlight: "필수 자료 확인하기",
      link: "자료 보러가기 >",
      tags: ["예비 고1", "입학 준비", "필수 자료"],
      image: "/images/BOOKS/12.png",
    },
  ];

  const sidebarItems = [
    { id: 0, text: "중고등 전범위 무제한 다운로드" },
    { id: 1, text: "수업 준비 단 1분이면 끝" },
    { id: 2, text: "참석만 해도 10만원 혜택 증정" },
    { id: 3, text: "2026 수능 완벽 대비" },
    { id: 4, text: "예비 고1을 위한 필수 자료" },
  ];

  // 슬라이드 자동 전환 및 게이지 애니메이션
  useEffect(() => {
    setProgress(0); // 슬라이드 변경 시 progress 리셋
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
          return 0;
        }
        return prev + 2; // 2%씩 증가 (약 5초에 한 슬라이드)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentSlide, slides.length]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* 프로모션 배너 섹션 - 슬라이드 형태 */}
      <section className="relative bg-gray-50 pt-4 pb-0">
        <div className="container mx-auto px-0">
          <div className="max-w-5xl mx-auto grid md:grid-cols-7 gap-0 overflow-hidden rounded-2xl shadow-sm border border-gray-200 h-[320px]">
            {/* 왼쪽 메인 배너 슬라이드 */}
            <div className="md:col-span-5 relative bg-amber-50 h-full">
              <div className="relative h-full overflow-hidden">
                {slides.map((slide) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      currentSlide === slide.id ? "opacity-100 z-10" : "opacity-0 z-0"
                    }`}
                  >
                    <div className="relative h-full bg-amber-50 p-6 md:p-10 flex items-center">
                      <div className="flex-1 z-10 max-w-[60%]">
                        {/* 태그 버튼들 */}
                        <div className="flex gap-2 mb-3">
                          {slide.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-white/90 text-gray-600 rounded-md text-[10px] font-bold shadow-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* 메인 텍스트 */}
                        <div className="flex flex-col">
                          <h2 className="text-2xl md:text-3xl font-black mb-2 text-gray-900 leading-tight tracking-tight">
                            {slide.title}
                          </h2>
                          <p className="text-sm md:text-base mb-3 text-gray-600 font-medium">
                            {slide.subtitle}
                          </p>
                          <div className="bg-yellow-400/20 w-fit px-2 -ml-2 mb-6">
                            <p className="text-xl md:text-2xl font-black text-yellow-700 px-2 py-1">
                              {slide.highlight}
                            </p>
                          </div>
                          <div>
                            <Button className="bg-slate-900 text-white hover:bg-slate-800 w-fit px-8 py-5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                              {slide.link}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 이미지 */}
                      {slide.image && (
                        <div className="absolute right-12 top-1/2 -translate-y-1/2 h-[85%] w-auto flex items-center justify-center pointer-events-none perspective-1000">
                          <img 
                            src={slide.image} 
                            alt={slide.title} 
                            className="h-full w-auto object-contain drop-shadow-2xl rounded-md transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-all duration-700 ease-out" 
                            style={{ transformStyle: 'preserve-3d' }}
                          />
                        </div>
                      )}

                      {/* 슬라이드 인디케이터 */}
                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                            setProgress(0);
                          }}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                        >
                          <ChevronRight className="h-4 w-4 rotate-180" />
                        </button>
                        <span className="text-sm text-gray-600">
                          &lt; {slide.id + 1}/{slides.length} &gt;
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide((prev) => (prev + 1) % slides.length);
                            setProgress(0);
                          }}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 오른쪽 사이드바 - 리스트 형태 */}
            <div className="md:col-span-2 bg-white flex flex-col h-full">
              <div className="border-l border-gray-200 h-full flex flex-col">
                {sidebarItems.map((item, index) => {
                  const isActive = currentSlide === index;
                  const isLast = index === sidebarItems.length - 1;

                  return (
                    <div
                      key={index}
                      className={`relative px-4 cursor-pointer transition-all border-b border-gray-200 flex-1 flex items-center justify-between group ${
                        isActive 
                          ? "bg-slate-50" 
                          : "bg-white hover:bg-gray-50"
                      } ${isLast ? "border-b-0" : ""}`}
                      onClick={() => {
                        setCurrentSlide(index);
                        setProgress(0);
                      }}
                    >
                      {/* 활성 상태 표시 바 (이제 왼쪽에 위치) */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                      )}

                      <div className="flex-1 text-left pl-2">
                        <p className={`text-xs md:text-sm transition-all duration-300 ${
                          isActive ? "text-blue-600 font-bold scale-105 origin-left" : "text-gray-500 group-hover:text-gray-800"
                        }`}>{item.text}</p>
                      </div>
                      
                      {/* 뱃지 및 효과 */}
                      <div className="w-12 flex justify-center shrink-0">
                        {index === 0 && (
                          <div className="relative flex items-center justify-center w-8 h-8">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-20"></span>
                            <div className="relative flex flex-col items-center justify-center w-8 h-8 bg-orange-500 rounded-full text-white shadow-md border-2 border-white transform rotate-12">
                              <span className="text-[6px] font-bold leading-none mt-0.5">BEST</span>
                              <span className="text-[10px] font-black leading-none">1위</span>
                            </div>
                          </div>
                        )}
                        {index === 1 && (
                          <div className="relative flex items-center justify-center w-8 h-8">
                            <div className="relative flex flex-col items-center justify-center w-8 h-8 bg-blue-500 rounded-full text-white shadow-md border-2 border-white">
                              <span className="text-[6px] font-bold leading-none mt-0.5">TOP</span>
                              <span className="text-[10px] font-black leading-none">2위</span>
                            </div>
                          </div>
                        )}
                        {index === 2 && (
                          <div className="relative flex items-center justify-center w-8 h-8 animate-bounce">
                            <div className="relative flex flex-col items-center justify-center w-8 h-8 bg-red-500 rounded-full text-white shadow-md border-2 border-white">
                              <span className="text-[8px] font-bold leading-none">EVENT</span>
                            </div>
                          </div>
                        )}
                        {index === 3 && (
                           <div className="relative flex items-center justify-center w-8 h-8">
                             <div className="relative flex flex-col items-center justify-center w-8 h-8 bg-yellow-400 rounded-full text-white shadow-md border-2 border-white">
                               <span className="text-[8px] font-black leading-none text-yellow-900">NEW</span>
                             </div>
                           </div>
                        )}
                         {index === 4 && (
                           <div className="relative flex items-center justify-center w-8 h-8">
                             <div className="relative flex flex-col items-center justify-center w-8 h-8 bg-purple-500 rounded-full text-white shadow-md border-2 border-white">
                               <span className="text-[8px] font-bold leading-none">PICK</span>
                             </div>
                           </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
            
            {/* 빠른 접근 아이콘 섹션 - 슬라이드 바로 아래 */}
          <div className="bg-white border-t border-gray-200 mt-6 rounded-2xl p-2 shadow-sm border mx-auto max-w-5xl">
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  <Link href="/courses?category=english" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="/images/BOOKS/1.png" alt="영어" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">영어 Qnova패스</p>
                        <Badge className="mt-1 bg-red-500 text-white text-[10px] px-1 py-0 h-4">NEW</Badge>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/courses?category=korean" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="/images/BOOKS/4.png" alt="국어" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">국어</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/courses?category=math" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="/images/BOOKS/9.png" alt="수학" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">수학</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/courses?category=science" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="/images/BOOKS/12.png" alt="과학" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">과학</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/courses?category=social" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="/images/BOOKS/13.png" alt="사회" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">사회</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/courses?category=mock" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src="/images/BOOKS/14.png" alt="모의고사" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">모의고사</p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link href="/courses" className="text-center">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-none hover:bg-gray-50">
                      <CardContent className="p-2">
                        <div className="w-16 h-16 mx-auto mb-1 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                          <img src="/images/BOOKS/5.png" alt="전체 강의" className="w-full h-full object-cover" />
                        </div>
                        <p className="text-xs font-medium">전체 강의</p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* 브랜드 추천 섹션 */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ThumbsUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Qnova가 추천하는 이 달의 브랜드
              </h2>
            </div>
            <p className="text-gray-600 mb-8">새학기, 이 브랜드로 시작해보세요.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {popularBrands.slice(0, 3).map((brand, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow overflow-hidden rounded-2xl cursor-pointer"
                  onClick={() => {
                    const material = brand.materials?.[0];
                    if (material && material.id) {
                      setLocation(`/courses/${material.id}`);
                    } else {
                      setLocation("/courses");
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full border-2 border-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={brand.imageUrl || `/images/BOOKS/${(index % 14) + 1}.png`} alt={brand.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{brand.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">수능/내신 전문가</p>
                    <p className="text-xs text-gray-500 mb-4">구독자 {brand.subscribers?.toLocaleString() || 0}명</p>
                    
                    <div className="space-y-2 mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full text-sm h-9 rounded-xl" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const material = brand.materials?.[0];
                          if (material) {
                            handlePreview(material, true);
                          } else {
                            showAlert("등록된 자료가 없습니다.");
                          }
                        }}
                      >
                        {brand.materials?.[0]?.title || "대표 자료"} 샘플보기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 인기 브랜드 자료 섹션 - 아코디언 형태 */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">인기 브랜드를 만나보세요.</p>
              <div className="flex items-center justify-center gap-2 mb-6">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  다른 선생님들은 어떤 브랜드 자료를 제일 많이 샀을까?
              </h2>
            </div>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const firstMaterialId = popularBrands[0]?.materials[0]?.id;
                    if (firstMaterialId) {
                      setLocation(`/courses/${firstMaterialId}`);
                    } else {
                      setLocation("/courses");
                    }
                  }}
                  className="rounded-full"
                >
                  브랜드 자료 전체보기 <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
                <span className="text-xs text-gray-500">
                  집계기간 2026.02.13 ~ 2026.02.20
                </span>
                </div>
              </div>

            {/* 정렬 탭 */}
            <div className="flex justify-center mb-6">
              <Tabs value={sortType} onValueChange={setSortType} className="w-auto">
                <TabsList className="rounded-full">
                  <TabsTrigger value="popular" className="rounded-full">인기순</TabsTrigger>
                  <TabsTrigger value="review" className="rounded-full">리뷰순</TabsTrigger>
                  <TabsTrigger value="subscriber" className="rounded-full">구독자순</TabsTrigger>
                </TabsList>
              </Tabs>
              </div>

            {/* 아코디언 형태의 브랜드 목록 - 첫 번째 기본 열림 */}
            <Accordion type="single" collapsible defaultValue="brand-1" className="w-full space-y-3">
              {popularBrands.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  등록된 브랜드 자료가 없습니다.
                </div>
              ) : (
                popularBrands.map((brand, bIdx) => (
                  <AccordionItem 
                    key={brand.id} 
                    value={`brand-${bIdx + 1}`} 
                    className="border border-gray-200 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <AccordionTrigger className="hover:no-underline px-6 py-4">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-md">
                            {bIdx + 1}
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border`}>
                              <img src={brand.imageUrl || `/images/BOOKS/${(bIdx % 14) + 1}.png`} alt={brand.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="font-bold text-lg text-left">{brand.name}</h3>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  asChild
                                  className="rounded-full h-6 text-xs px-2 cursor-pointer"
                                >
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const firstMaterialId = brand.materials[0]?.id;
                                      if (firstMaterialId) {
                                        setLocation(`/courses/${firstMaterialId}`);
                                      } else {
                                        setLocation("/courses");
                                      }
                                    }}
                                  >
                                    브랜드 자료 전체보기 <ArrowRight className="ml-1 h-3 w-3" />
                                  </div>
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 text-left">구독자 {brand.subscribers?.toLocaleString() || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-2">
                      {/* 자료 카드들 - 가로 스크롤 */}
                      <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <div className="flex space-x-4 min-w-max">
                          {brand.materials.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4">등록된 자료가 없습니다.</p>
                          ) : (
                            brand.materials.map((material: any, idx: number) => (
                              <Card 
                                key={idx} 
                                className="flex-shrink-0 w-60 hover:shadow-lg transition-shadow cursor-pointer border group/item flex flex-col rounded-xl"
                                onClick={() => setLocation(`/courses/${material.id}`)}
                              >
                                <CardContent className="p-4 flex-1 flex flex-col">
                                  <div className="h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center relative border border-gray-200 overflow-hidden">
                                    <img 
                                      src={material.imageUrl || `/images/BOOKS/${(idx % 14) + 1}.png`} 
                                      alt={material.title} 
                                      className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300" 
                                    />
                                    <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-white/90 rounded text-[9px] font-bold text-purple-700 border border-purple-100">
                                      BEST
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                                      <BookOpen className="w-2.5 h-2.5" />
                                      {brand.name}
                                    </div>
                                    <p className="text-sm font-bold mb-2 line-clamp-2 leading-tight h-10">
                                      {material.title}
                                    </p>
                                    <div className="flex items-center justify-between mb-3">
                                      <p className="text-base font-bold text-blue-600">
                                        {material.price > 0 ? `${material.price.toLocaleString()}원` : "무료"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-2 mt-auto">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="w-full text-xs h-8 hover:bg-gray-100 border-gray-300 rounded-lg"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePreview(material, true);
                                      }}
                                    >
                                      샘플 보기
                                    </Button>
                                    
                                    {/* 무료일 때만 다운로드 버튼 표시 */}
                                    {(!material.price || material.price === 0) && (
                                      <div className="grid grid-cols-2 gap-2">
                                        <Button
                                          variant="outline"
                                          className="h-8 text-[10px] gap-1 border-blue-600 text-blue-600 hover:bg-blue-50 px-1 rounded-lg"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDirectDownload(material, 'pdf');
                                          }}
                                        >
                                          <Printer className="w-3 h-3" /> PDF
                                        </Button>
                                        <Button
                                          variant="outline"
                                          className="h-8 text-[10px] gap-1 border-blue-600 text-blue-600 hover:bg-blue-50 px-1 rounded-lg"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDirectDownload(material, 'hwpx');
                                          }}
                                        >
                                          <Download className="w-3 h-3" /> HWPX
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          </div>
        </div>
      </section>

      {/* 공지사항 & 새로 올라온 자료 섹션 */}
      <section className="py-8 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* 공지사항 (좌측, 4 columns) */}
              <div className="lg:col-span-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">공지사항</h2>
                  </div>
                  <Link href="/announcements">
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-500 hover:text-gray-900">
                      더보기 <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 p-2">
                  {recentNotices.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                      등록된 공지사항이 없습니다.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {recentNotices.map((notice: any) => (
                        <div key={notice.id} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer group rounded-lg" onClick={() => setLocation(`/announcements`)}>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-blue-200 text-blue-600 bg-blue-50">
                              공지
                            </Badge>
                            <span className="text-xs text-gray-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                            {notice.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 새로 올라온 자료 (우측, 8 columns) */}
              <div className="lg:col-span-8 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                      새로 올라온 자료
                    </h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLocation("/courses")} className="rounded-full h-8 text-xs">
                    전체보기 <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
                
                {/* Horizontal Scroll with Auto Animation */}
                <div className="relative w-full overflow-hidden">
                  <style>{`
                    @keyframes scroll {
                      0% { transform: translateX(0); }
                      100% { transform: translateX(-50%); }
                    }
                    .animate-scroll {
                      display: flex;
                      width: max-content;
                      animation: scroll 40s linear infinite;
                    }
                    .animate-scroll:hover {
                      animation-play-state: paused;
                    }
                  `}</style>
                  
                  <div className="animate-scroll gap-4 pb-4">
                    {/* Duplicate items for seamless loop */}
                    {[...(recentMaterials && recentMaterials.length > 0 ? recentMaterials : []), ...(recentMaterials && recentMaterials.length > 0 ? recentMaterials : [])].map((material, idx) => (
                      <Card 
                        key={`${material.id}-${idx}`} 
                        className="flex-shrink-0 w-[240px] hover:shadow-lg transition-shadow cursor-pointer flex flex-col group bg-white rounded-2xl border-gray-200"
                        onClick={() => setLocation(`/courses/${material.id}`)}
                      >
                        <CardContent className="p-3 flex-1 flex flex-col">
                          <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden border border-gray-200">
                            <img 
                              src={material.imageUrl || getCategoryImage(material.category)} 
                              alt={material.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1">
                              <BookOpen className="w-2.5 h-2.5" />
                              {material.providerName || "공통"}
                            </div>
                            <p className="text-sm font-bold mb-2 line-clamp-2 leading-tight h-9">
                              {material.title}
                            </p>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-bold text-blue-600">
                                {material.price > 0 ? `${material.price.toLocaleString()}원` : "무료"}
                              </span>
                              <Badge className="bg-green-500 text-white text-[10px] h-4 px-1.5">NEW</Badge>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="mt-auto">
                            <Button
                              variant="outline"
                              className="w-full h-7 text-xs hover:bg-gray-100 border-gray-300 rounded-lg"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(material, true);
                              }}
                            >
                              샘플 보기
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {(!recentMaterials || recentMaterials.length === 0) && (
                      <div className="w-full text-center py-12 text-gray-500">
                        등록된 자료가 없습니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        </DialogContent>
      </Dialog>

      <Footer />
      <ChatWidget />
    </div>
  );
}
