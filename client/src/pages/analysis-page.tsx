import React, { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  Search, 
  Bookmark, 
  Share2, 
  MoreVertical,
  BookOpen,
  Layout,
  MessageSquare,
  ChevronDown,
  Info,
  CheckCircle2,
  Printer,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

// Analysis Data Structure (Mock removed)


const AnalysisPage = () => {
  const [match, params] = useRoute("/analysis/:id");
  const id = params?.id;
  const [, setLocation] = useLocation();
  const [activeSectionId, setActiveSectionId] = useState<string | number | null>(null);
  const [selectedSentenceId, setSelectedSentenceId] = useState<number | null>(null);

  const { data: seminar, isLoading, isError } = useQuery<any>({
    queryKey: [`/api/seminars/${id}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/seminars/${id}`);
      return res.json();
    },
    enabled: !!id
  });

  const displayData = React.useMemo(() => {
    if (!seminar) return null;
    try {
      const parsed = typeof seminar.program === 'string' 
        ? JSON.parse(seminar.program) 
        : seminar.program;
      
      return {
        title: seminar.title,
        progress: 0,
        currentTime: "00:00:00",
        sections: [],
        ...parsed
      };
    } catch (e) {
      console.error("Data parsing error:", e);
      return { title: seminar.title, sections: [] };
    }
  }, [seminar]);

  // activeSectionId 초기화
  useEffect(() => {
    if (displayData?.sections?.length > 0) {
      if (!activeSectionId || !displayData.sections.find((s: any) => s.id === activeSectionId)) {
        setActiveSectionId(displayData.sections[0].id);
      }
    }
  }, [displayData, activeSectionId]);

  const handleExit = () => {
    setLocation("/courses");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !displayData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-lg font-medium text-gray-500">데이터를 불러올 수 없습니다.</p>
        <Button onClick={handleExit}>돌아가기</Button>
      </div>
    );
  }

  const activeSection = displayData.sections?.find((s: any) => s.id === activeSectionId) || displayData.sections?.[0];

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] overflow-hidden">
      {/* Top Header */}
      <header className="h-16 bg-[#1A1C1E] text-white flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleExit}
            className="text-white hover:bg-white/10"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="h-8 w-[1px] bg-white/20 mx-2" />
          <div>
            <h1 className="text-lg font-bold truncate max-w-[300px]">
              {displayData.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 mb-1">
               <Clock className="h-4 w-4 text-blue-400" />
               <span className="text-xs font-mono">{displayData.currentTime}</span>
             </div>
             <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${displayData.progress}%` }}
                />
             </div>
          </div>
          <div className="flex items-center bg-white/10 rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="px-2 text-sm font-medium border-x border-white/10">1 / 10</div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[320px] bg-white border-r flex flex-col z-10 shadow-sm">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="검색어를 입력하세요" 
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-md text-sm border-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {displayData.sections.map((section: any) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    activeSectionId === section.id 
                      ? "bg-blue-50 border-blue-100 text-blue-700 shadow-sm" 
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      activeSectionId === section.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {displayData.sections.indexOf(section) + 1}
                    </div>
                    <span className="text-sm font-medium leading-tight">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>학습 진행도</span>
              <span className="font-bold text-blue-600">{displayData.progress}%</span>
            </div>
            <Progress value={displayData.progress} className="h-2" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden relative">
          <div className="p-6 border-b flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{activeSection?.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] py-0 px-2 h-5">독해 지문</Badge>
                <Badge variant="outline" className="text-[10px] py-0 px-2 h-5">심층 분석</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Printer className="h-4 w-4" /> 출력하기
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Download className="h-4 w-4" /> 다운로드
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="max-w-[900px] mx-auto p-8 space-y-12">
              {activeSection?.type === "analysis" && activeSection.sentences?.map((sentence: any) => (
                <section 
                  key={sentence.id} 
                  className={`group transition-all duration-300 p-6 rounded-2xl border-2 ${
                    selectedSentenceId === sentence.id 
                      ? "border-blue-200 bg-blue-50/30 ring-4 ring-blue-50" 
                      : "border-transparent hover:border-gray-100 hover:bg-gray-50/50"
                  }`}
                  onClick={() => setSelectedSentenceId(sentence.id)}
                >
                  {/* Original Text with Color Coding */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                        {String(sentence.id).padStart(2, '0')}
                      </span>
                      <div className="h-[1px] flex-1 bg-gray-200" />
                    </div>
                    
                    <div className="text-2xl font-serif leading-[1.8] tracking-tight text-gray-800">
                      {sentence.analysis.map((part: any, idx: number) => (
                        <span 
                          key={idx} 
                          className={`inline-block mx-0.5 rounded px-1 transition-colors ${
                            part.color === 'blue' ? 'border-b-4 border-blue-400 font-bold text-blue-700' :
                            part.color === 'red' ? 'border-b-4 border-red-400 font-bold text-red-700' :
                            part.color === 'green' ? 'border-b-4 border-green-400 font-bold text-green-700' :
                            part.color === 'purple' ? 'border-b-4 border-purple-400 font-bold text-purple-700' :
                            part.color === 'orange' ? 'border-b-4 border-orange-400 font-bold text-orange-700' :
                            ''
                          }`}
                        >
                          {part.text}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Translation Section */}
                    <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                        <h4 className="text-sm font-bold text-gray-900">우리말 해석</h4>
                      </div>
                      <p className="text-gray-700 leading-relaxed text-[15px]">
                        {sentence.translation}
                      </p>
                    </div>

                    {/* Grammar Section */}
                    <div className="bg-white/80 p-5 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                        <h4 className="text-sm font-bold text-gray-900">구문 및 문법 해설</h4>
                      </div>
                      <ul className="space-y-2">
                        {sentence.grammarPoints.map((point: string, idx: number) => (
                          <li key={idx} className="flex gap-2 text-sm text-gray-600">
                            <span className="text-orange-500 mt-1">•</span>
                            <span className="leading-snug">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Vocabulary Section */}
                  <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="h-4 w-4 text-green-600" />
                      <h4 className="text-sm font-bold text-gray-900">핵심 어휘</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sentence.vocabulary.map((vocab: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 hover:bg-green-100 transition-colors cursor-help">
                          <span className="text-sm font-bold text-green-700">{vocab.word}</span>
                          <span className="w-1 h-1 bg-green-300 rounded-full" />
                          <span className="text-xs text-green-600">{vocab.meaning}</span>
                          <span className="text-[10px] text-green-400 uppercase font-bold">{vocab.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
              
              {activeSection?.type !== "analysis" && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Layout className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg">{activeSection?.content || "내용이 없습니다."}</p>
                </div>
              )}

              <div className="h-20" /> {/* Spacer */}
            </div>
          </ScrollArea>

          {/* Bottom Floating Menu */}
          <div className="absolute bottom-6 right-6 flex flex-col gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-12 w-12 rounded-full shadow-xl bg-blue-600 hover:bg-blue-700 text-white border-4 border-white">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">책갈피 추가</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-12 w-12 rounded-full shadow-xl bg-white hover:bg-gray-100 text-gray-600 border-4 border-white">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">질문하기</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AnalysisPage;

