import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// --- Types ---
export interface AnalysisToken {
  id: string;
  text: string;
  type: 'text' | 'bracket-blue' | 'bracket-green' | 'highlight-blue' | 'highlight-red' | 'highlight-blue-line' | 'highlight-red-line' | 'underline-blue' | 'underline-red' | 'bold' | 'strike' | 'box-red' | 'bg-soft' | 'oval-orange' | 'ox' | 'arrow' | 'box-green' | 'clause-blue-open' | 'clause-blue-close' | 'clause-green-open' | 'clause-green-close' | 'clause-orange-open' | 'clause-orange-close' | 'clause-purple-open' | 'clause-purple-close' | 'clause-pink-open' | 'clause-pink-close';
  bgColor?: string; // 배경색 (범위 지정용)
  note?: string; // 하단 설명
  noteColor?: 'text-blue-500' | 'text-red-500' | 'text-gray-500' | 'text-orange-500' | 'text-green-600';
  arrowTo?: string; // 화살표 연결 (추후 구현 가능)
}

export interface AnalyzedSentence {
  id: number;
  number: number;
  isTopic?: boolean; // 주제문 여부 (Legacy support)
  tags?: string[]; // 태그 배열 (예: ["주제문", "서술형", "빈칸"])
  contentTokens: AnalysisToken[];
  translation: string;
}

interface SentenceAnalysisViewerProps {
  sentences: AnalyzedSentence[];
  className?: string;
}

// --- Components ---

const TokenRenderer = ({ token }: { token: AnalysisToken }) => {
  // 사용자 요청: "단어 단위로 배경 칠 하지 마" (Continuous Highlight)
  // inline-block -> inline, mx 제거, leading 증가 (노트 겹침 방지)
  const baseStyle = "inline relative leading-[3.0rem] box-decoration-clone py-1"; 
  
  // 텍스트 스타일 결정
  const textStyle = cn(
    "text-[15px] transition-colors px-0.5", // px-0.5를 텍스트 스타일에 적용하여 배경색이 글자에 붙도록 함
    // 0. 배경색 (범위) - 둥근 모서리 제거하여 이어지게 함
    token.bgColor && token.bgColor,

    // 1. 대괄호 및 절(Clause) 스타일
    (token.type === 'bracket-blue' || token.type === 'clause-blue-open' || token.type === 'clause-blue-close') && "text-blue-600 font-bold text-lg", 
    (token.type === 'bracket-green' || token.type === 'clause-green-open' || token.type === 'clause-green-close') && "text-green-600 font-bold text-lg",
    (token.type === 'clause-orange-open' || token.type === 'clause-orange-close') && "text-orange-500 font-bold text-lg",
    (token.type === 'clause-purple-open' || token.type === 'clause-purple-close') && "text-purple-600 font-bold text-lg",
    (token.type === 'clause-pink-open' || token.type === 'clause-pink-close') && "text-pink-500 font-bold text-lg",
    
    // 2. 밑줄 스타일 (설명이 있는 경우 주로 사용)
    // Strong Highlight
    token.type === 'highlight-blue' && "text-blue-600 font-bold border-b-[2px] border-blue-500 pb-0.5", 
    token.type === 'highlight-red' && "text-red-600 font-bold border-b-[2px] border-red-500 pb-0.5",
    
    // Weak Highlight
    token.type === 'highlight-blue-line' && "text-gray-900 font-bold border-b-[2px] border-blue-500 pb-0.5",
    token.type === 'highlight-red-line' && "text-gray-900 font-bold border-b-[2px] border-red-500 pb-0.5",
    token.type === 'underline-blue' && "text-gray-900 font-bold border-b-[2px] border-blue-500 pb-0.5", 
    token.type === 'underline-red' && "text-gray-900 font-bold border-b-[2px] border-red-500 pb-0.5",

    // 3. 박스 스타일
    token.type === 'box-red' && "border-[2px] border-red-500 px-1 mx-0.5 rounded-[3px] font-bold text-gray-900 bg-transparent", 
    
    // 4. 타원 스타일
    token.type === 'oval-orange' && "border-[2px] border-orange-500 text-gray-900 font-bold px-2 py-0.5 rounded-[50px] mx-0.5",

    // NEW: 초록색 박스
    token.type === 'box-green' && "border-[2px] border-green-600 px-1 mx-0.5 rounded-[3px] font-bold text-gray-900 bg-transparent",

    // NEW: O/X 스타일
    token.type === 'ox' && "text-gray-900 font-bold border-b-[2px] border-blue-500 pb-0.5", 

    // NEW: 화살표 스타일
    token.type === 'arrow' && "text-gray-900 border-b-[1px] border-dashed border-gray-400 pb-0.5",

    // 5. 배경색 스타일 (형광펜 효과 - 개별 토큰용)
    // rounded 제거하여 끊김 방지
    token.type === 'bg-soft' && "bg-[#fff9c4]/60 text-gray-900 px-0.5 box-decoration-clone", 

    // 6. 기타
    token.type === 'bold' && "font-bold text-gray-900", 
    token.type === 'strike' && "line-through text-gray-400 decoration-red-500 decoration-2",
    token.type === 'text' && "text-gray-900"
  );

  // Render specific text for clause tokens
  let content = token.text;
  if (token.type === 'clause-blue-open' || token.type === 'clause-green-open' || token.type === 'clause-orange-open' || token.type === 'clause-purple-open' || token.type === 'clause-pink-open') content = '[';
  if (token.type === 'clause-blue-close' || token.type === 'clause-green-close' || token.type === 'clause-orange-close' || token.type === 'clause-purple-close' || token.type === 'clause-pink-close') content = ']';

  return (
    <span className={baseStyle}>
      <span className={textStyle}>
        {content}
      </span>
      
      {/* 하단 메모 (Note) */}
      {token.note && (
        <span className={cn(
          "absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-max text-[11px] font-bold leading-none px-1 py-0.5 z-10",
          token.noteColor || "text-gray-500",
          "whitespace-nowrap"
        )}>
          {token.type === 'strike' && <span className="text-red-500 font-bold mr-0.5">X</span>}
          
          {/* Note content formatting: (X), (O), ≠ in red/blue, -> in gray */}
          {token.note.split(/(\(X\)|\(O\)|≠|=|->|<-|병렬\d*)/).map((part, i) => {
            if (part === '(X)') return <span key={i} className="text-red-500 font-black mx-0.5 text-[10px]">{part}</span>; // (X) should be Red for Caution
            if (part === '≠') return <span key={i} className="text-blue-500 font-black mx-0.5">{part}</span>;
            if (part === '(O)' || part === '=') return <span key={i} className="text-blue-500 font-black mx-0.5">{part}</span>; 
            if (part === '->' || part === '<-') return <span key={i} className="text-slate-400 font-bold mx-0.5">{part}</span>;
            if (part.startsWith('병렬')) return <span key={i} className="text-slate-500 font-bold mx-0.5 bg-slate-100 rounded px-1 text-[9px]">{part}</span>;
            return <span key={i}>{part}</span>;
          })}
        </span>
      )}
    </span>
  );
};

export const SentenceAnalysisViewer = ({ sentences, className }: SentenceAnalysisViewerProps) => {
  return (
    <div className={cn("flex flex-col gap-3 w-full p-0 bg-white rounded-xl", className)}>
      {sentences.map((sentence) => {
        // Pre-process tokens to add background colors for clauses
        const processedTokens: AnalysisToken[] = [];
        const bgStack: string[] = [];
        
        sentence.contentTokens.forEach(token => {
          // Handle Open Clause - Fainter Colors (bg-*-50) for softer look
          // box-decoration-clone handles line breaks
          if (token.type === 'clause-blue-open') {
             bgStack.push('bg-blue-50 box-decoration-clone px-0.5');
          } else if (token.type === 'clause-green-open') {
             bgStack.push('bg-green-50 box-decoration-clone px-0.5');
          } else if (token.type === 'clause-orange-open') {
             bgStack.push('bg-orange-50 box-decoration-clone px-0.5'); 
          } else if (token.type === 'clause-purple-open') {
             bgStack.push('bg-purple-50 box-decoration-clone px-0.5'); 
          } else if (token.type === 'clause-pink-open') {
             bgStack.push('bg-pink-50 box-decoration-clone px-0.5'); 
          }

          // Apply current background from stack top
          const currentBg = bgStack.length > 0 ? bgStack[bgStack.length - 1] : undefined;
          
          processedTokens.push({
            ...token,
            bgColor: currentBg
          });

          // Handle Close Clause (AFTER applying bg to the closing bracket)
          if (token.type === 'clause-blue-close' || token.type === 'clause-green-close' || token.type === 'clause-orange-close' || token.type === 'clause-purple-close' || token.type === 'clause-pink-close') {
             bgStack.pop();
          }
        });

        return (
          <div key={sentence.id} className="flex gap-2 group border-b border-gray-100 pb-3 last:border-0">
            {/* Left: Number & Single Tag */}
            <div className="flex flex-col items-center min-w-[2.5rem] pt-1 gap-1">
              <span className="text-2xl font-bold text-gray-800 font-serif leading-none">
                {String(sentence.number).padStart(2, '0')}
              </span>
              {/* Tag: Only ONE tag displayed (Priority: Topic > Narrative > Blank > Grammar > Vocab) */}
              {sentence.tags && sentence.tags.length > 0 && (() => {
                const tags = sentence.tags || [];
                const priority = ['주제문', '서술형', '빈칸', '어법', '어휘'];
                const mainTag = tags.sort((a, b) => priority.indexOf(a) - priority.indexOf(b))[0] || tags[0];
                
                return (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px] px-1 py-0 h-4 min-w-[36px] justify-center whitespace-nowrap border-0 font-bold rounded-sm shadow-sm",
                      mainTag === '주제문' && "bg-orange-500 text-white", 
                      mainTag === '서술형' && "bg-blue-600 text-white",
                      mainTag === '빈칸' && "bg-emerald-600 text-white", 
                      mainTag === '어법' && "bg-purple-600 text-white", 
                      mainTag === '어휘' && "bg-pink-500 text-white",
                      !['주제문', '서술형', '빈칸', '어법', '어휘'].includes(mainTag) && "bg-gray-600 text-white"
                    )}
                  >
                    {mainTag}
                  </Badge>
                );
              })()}
            </div>

            {/* Center: English Content */}
            <div className="flex-1 space-y-1 pt-0.5">
              <div className="leading-[2.2rem] tracking-wide break-words text-[15px] font-serif text-slate-900">
                {processedTokens.map((token, idx) => (
                  <TokenRenderer key={`${sentence.id}-${idx}`} token={token} />
                ))}
              </div>
            </div>

            {/* Right: Korean Translation */}
            <div className="hidden md:block w-[28%] min-w-[150px] bg-slate-50/50 p-2 rounded-lg text-[11px] text-gray-600 leading-relaxed self-start mt-1 border border-slate-100">
              {sentence.translation}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SentenceAnalysisViewer;
