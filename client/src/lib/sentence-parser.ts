import { AnalyzedSentence, AnalysisToken } from "@/components/learning/sentence-analysis-viewer";

export const transformToAnalyzedSentences = (sentences: any[]): AnalyzedSentence[] => {
  if (!sentences) return [];
  
  return sentences.map((s: any, idx: number) => {
    const contentTokens: AnalysisToken[] = [];
    
    // Use existing 'analysis' string if available, otherwise 'original'
    const textToParse = typeof s === 'string' ? s : (s.analysis || s.original || s.content || "");
    
    if (!textToParse) {
         return { id: idx, number: idx + 1, contentTokens: [], translation: "" };
    }
    
    // Regex to parse [text/annotation/color/...] pattern OR (text) OR /
    // Updated Regex for robustness against messy AI output
    // This regex matches:
    // 1-6. [text/anno/color/shape/...] Solvook style
    // 7. (({ or })) or <<{ or }>> or {{ or }} or [[{ or }]] or ((({ or }))) -> Clause brackets
    // 8. (text) -> Old style parentheses
    // 9. / / bg -> Raw background tag (to skip)
    // 10. / -> Slash
    // 11. word -> Plain text
    // 12. whitespace
    const regex = /\[([^\]\/]+)(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?(?:\/([^\]\/]*))?\]|(\(\(\{|\}\)\)|<<\{|\}>>|\{\{|\}\}|\[\[\{|\}\]\]|\(\(\(\{|\}\)\)\))|\(([^)]+)\)|(\/ \/ bg)|(\/)|([^\[\]\(\)\{\}\/\s]+)|(\s+)/g;
    
    let match;
    let tokenIdx = 0;
    
    while ((match = regex.exec(textToParse)) !== null) {
      const id = `tok-${idx}-${tokenIdx++}`;
      const fullMatch = match[0];

      if (match[7]) { // Clause Brackets
          if (fullMatch === '(({') {
             contentTokens.push({ id, text: "[", type: 'clause-blue-open' });
          } else if (fullMatch === '}))') {
             contentTokens.push({ id, text: "]", type: 'clause-blue-close' });
          } else if (fullMatch === '<<{') {
             contentTokens.push({ id, text: "[", type: 'clause-green-open' });
          } else if (fullMatch === '}>>') {
             contentTokens.push({ id, text: "]", type: 'clause-green-close' });
          } else if (fullMatch === '{{') {
             contentTokens.push({ id, text: "[", type: 'clause-orange-open' }); 
          } else if (fullMatch === '}}') {
             contentTokens.push({ id, text: "]", type: 'clause-orange-close' });
          } else if (fullMatch === '[[{') {
             contentTokens.push({ id, text: "[", type: 'clause-purple-open' }); 
          } else if (fullMatch === '}]]') {
             contentTokens.push({ id, text: "]", type: 'clause-purple-close' });
          } else if (fullMatch === '((({') {
             contentTokens.push({ id, text: "[", type: 'clause-pink-open' }); 
          } else if (fullMatch === '})))') {
             contentTokens.push({ id, text: "]", type: 'clause-pink-close' });
          }
      } else if (match[9] === '/ / bg') { // Skip accidental raw bg tags
         continue; 
      } else if (match[11]) { // Plain text word
        contentTokens.push({ id, text: match[11], type: 'text' });
      } else if (match[12]) { // Whitespace
        contentTokens.push({ id, text: match[12], type: 'text' }); 
      } else if (match[8]) { // Parentheses (Old style) -> Convert to Blue Bracket
        contentTokens.push({ id, text: "(", type: 'text', note: null });
        contentTokens.push({ id: id + "-content", text: match[8], type: 'bracket-blue' });
        contentTokens.push({ id: id + "-close", text: ")", type: 'text', note: null });
      } else if (match[10]) { // Slash (Old style) -> Visual divider
        continue; // Skip slashes
      } else if (match[1]) { // Solvook Bracketed part [ ... ]
        const text = match[1];
        if (!text) continue;

        const annotation = match[2];
        const color = match[3]; 
        const shape = match[4]; 
        
        let type: AnalysisToken['type'] = 'text';
        let note = annotation;
        let noteColor: AnalysisToken['noteColor'] = undefined;
        let bgColor: string | undefined = undefined;
        
        if (text.trim() === '[' || text.trim() === ']') {
           type = color === 'green' ? 'bracket-green' : 'bracket-blue';
        } else if (shape === 'box') {
           if (color === 'green') { type = 'box-green'; noteColor = 'text-green-600'; } 
           else { type = 'box-red'; noteColor = 'text-red-500'; }
        } else if (shape === 'oval' || color === 'orange') { 
           type = 'oval-orange'; noteColor = 'text-orange-500';
        } else if (color === 'ox' || shape === 'ox') { 
           type = 'ox'; noteColor = color === 'blue' ? 'text-blue-500' : 'text-red-500';
        } else if (color === 'arrow' || shape === 'arrow') { 
           type = 'arrow'; noteColor = 'text-gray-500';
        } else if (shape === 'bg' || color === 'gray' || color === 'bg') {
           type = 'bg-soft'; 
        } else if (shape === 'verb' || color === 'green') { 
           type = 'text'; // Verb handling logic might need refinement, defaulting to text with green note
           noteColor = 'text-green-600';
        } else if (color === 'red') {
           if (shape === 'line' || shape === 'underline') type = 'underline-red';
           else type = 'highlight-red';
           noteColor = 'text-red-500';
        } else if (color === 'blue') {
           if (shape === 'line' || shape === 'underline') type = 'underline-blue';
           else type = 'highlight-blue';
           noteColor = 'text-blue-500';
        } else if (shape === 'bold') { type = 'bold'; } 
        else if (shape === 'strike') { type = 'strike'; }
        else {
           // Default fallback
           type = 'text';
        }

        contentTokens.push({
            id,
            text,
            type,
            note,
            noteColor,
            bgColor
        });
      }
    }
    
    return {
      id: idx,
      number: idx + 1,
      contentTokens,
      translation: s.translation || "",
      tags: s.tags || []
    };
  });
};

