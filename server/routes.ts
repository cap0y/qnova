import type { Express } from "express";
import { storage } from "./storage";

import {sendAdminNotification} from "./websocket";
import { registerAdminRoutes } from "./routes/admin";

import {
  insertCourseSchema,
  insertInstructorSchema,
  insertEnrollmentSchema,
  insertSeminarSchema,
  insertNoticeSchema,
  insertReviewSchema,
  insertPaymentSchema,
  insertInquirySchema,
  insertAuthorApplicationSchema,
  insertBusinessPartnershipSchema,
  insertCareerApplicationSchema,
} from "../shared/schema.js";
import multer from "multer";
import path from "path";
import express from "express";
import { uploadToCloudinary } from "./cloudinary";
import mammoth from "mammoth";
import JSZip from "jszip";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";

// Use createRequire to import CommonJS module pdf-parse
const require = createRequire(import.meta.url);

// Cloudinary 업로드를 위해 메모리 스토리지 사용
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|hwpx|hwp|xls|xlsx|ppt|pptx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export function registerRoutes(app: Express): void {
  // Setup admin routes
  registerAdminRoutes(app);

  // Static file serving for uploads
  app.use("/uploads", express.static("uploads"));

  // File analysis endpoint for problem creation
  app.post("/api/business/analyze-file", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      let extractedText = "";
      const { category, level } = req.body; // 카테고리 및 레벨 정보 수신
      
      // 파일명이 깨지는 문제 해결 (Latin1 -> UTF-8 변환)
      const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
      const fileType = path.extname(originalName).toLowerCase();
      
      // AI Analysis (Gemini) - Educational Content Analysis
      let aiAnalysis = null;
      const apiKey = (req.headers['x-gemini-api-key'] as string) || process.env.GEMINI_API_KEY;
      const modelName = (req.headers['x-gemini-model'] as string) || "gemini-1.5-flash";

      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              maxOutputTokens: 24000, 
              temperature: 0.2,
              responseMimeType: "application/json", // Enforce valid JSON output natively
            }
          });
          
          let parts: any[] = [];
          
          // PDF의 경우 파일을 직접 Gemini에 전달 (OCR 및 멀티모달 분석)
          if (fileType === ".pdf") {
            const base64Data = req.file.buffer.toString("base64");
            parts = [
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "application/pdf",
                },
              },
            ];
          } 
          // Word 파일은 텍스트 추출 후 전달
          else if (fileType === ".docx") {
            try {
              const result = await mammoth.extractRawText({ buffer: req.file.buffer });
              extractedText = result.value;
              parts = [{ text: extractedText }];
            } catch (err) {
              console.error("Word Parse Error:", err);
            }
          }
          // HWPX 파일은 Zip 구조의 XML에서 텍스트 추출
          else if (fileType === ".hwpx" || fileType === ".hwp") {
            try {
              // ZIP 매직 넘버(PK) 확인
              if (req.file.buffer.slice(0, 2).toString() === "PK") {
                const zip = await JSZip.loadAsync(req.file.buffer);
                let hwpxText = "";
                
                // Contents 폴더 내의 section0.xml, section1.xml ... 들을 찾아 텍스트 추출
                const sectionFiles = Object.keys(zip.files).filter(name => 
                  (name.startsWith("Contents/section") || name.startsWith("Section")) && name.endsWith(".xml")
                ).sort();
                
                for (const fileName of sectionFiles) {
                  const content = await zip.files[fileName].async("text");
                  // <hp:t> (HWPX) 또는 <t> (일반 XML) 태그 안의 텍스트 추출
                  const textMatches = content.match(/<hp:t>([\s\S]*?)<\/hp:t>/g) || content.match(/<t>([\s\S]*?)<\/t>/g);
                  if (textMatches) {
                    hwpxText += textMatches.map(match => 
                      match.replace(/<[^>]+>/g, "") // 모든 태그 제거
                           .replace(/&lt;/g, "<")
                           .replace(/&gt;/g, ">")
                           .replace(/&amp;/g, "&")
                           .replace(/&quot;/g, '"')
                           .replace(/&apos;/g, "'")
                    ).join(" ") + "\n";
                  }
                }
                
                if (hwpxText.trim()) {
                  extractedText = hwpxText;
                  parts = [{ text: extractedText }];
                  console.log("HWPX text extracted successfully, length:", extractedText.length);
                }
              } else {
                console.log("Not a ZIP/HWPX format (possibly old HWP binary). Trying fallback analysis...");
                // ZIP이 아닌 경우(이전 HWP 바이너리 등)는 텍스트 추출이 매우 어려우므로 
                // Gemini에게 직접 파일의 일부를 텍스트로 읽어보라고 시도하거나 에러 메시지 반환
                // Remove null bytes and other non-printable characters to avoid JSON issues
                extractedText = req.file.buffer.toString('utf-8', 0, 5000).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
                parts = [{ text: "이 파일은 바이너리 형식이 포함된 문서입니다. 가능한 한 텍스트를 추출하여 분석해주세요: " + extractedText }];
              }
            } catch (err) {
              console.error("HWPX/HWP Parse Error:", err);
            }
          }
          // 기타 텍스트 기반 파일 (HWP는 지원 안 함)
          else {
             // For older HWP or others, we skip for now
          }

          if (parts.length > 0) {
            let prompt = "";
            let levelInstruction = "";

            if (level && level !== "all") {
                const levelMap: Record<string, string> = {
                    "middle1": "Middle School Year 1 (Korean standard)",
                    "middle2": "Middle School Year 2 (Korean standard)",
                    "middle3": "Middle School Year 3 (Korean standard)",
                    "high1": "High School Year 1 (Korean standard)",
                    "high2": "High School Year 2 (Korean standard)",
                    "high3": "High School Year 3 / CSAT (Korean standard)"
                };
                const targetLevel = levelMap[level] || level;
                levelInstruction = `\n\n**IMPORTANT - TARGET AUDIENCE LEVEL**: ${targetLevel}\nPlease strictly adjust the difficulty of vocabulary, sentence structure, and problem logic to match this level.`;
            }
            
            if (category === "word") {
              prompt = `
                Act as an expert English teacher creating a **VOCABULARY LIST** from the provided text.
                
                **REQUIRED JSON STRUCTURE**:
                {
                  "title": "Document Title",
                  "vocabulary": [
                    {
                      "id": 1,
                      "word": "example",
                      "meaning": "예시",
                      "partOfSpeech": "명", 
                      "synonyms": ["sample", "instance"],
                      "antonyms": ["counterexample"]
                    }
                  ]
                }

                **INSTRUCTIONS**:
                1. Extract **ALL** distinct vocabulary words from the text (up to 60 words).
                2. **partOfSpeech**: Use Korean Single Character Abbreviations ONLY:
                   - Noun -> "명"
                   - Verb -> "동"
                   - Adjective -> "형"
                   - Adverb -> "부"
                   - Preposition -> "전"
                   - Conjunction -> "접"
                3. **meaning**: Concise Korean meaning fitting the context.
                4. **synonyms/antonyms**: Provide 1-2 items if available.
              `;
            } else if (category === "variant") {
              prompt = `
                Act as an expert English teacher creating **EXAM VARIANT PROBLEMS** (변형문제) based on the provided text.
                
                **REQUIRED JSON STRUCTURE**:
                {
                  "title": "Document Title",
                  "questions": [
                    {
                      "id": 1,
                      "type": "Subject", 
                      "question": "다음 글의 주제로 가장 적절한 것은?",
                      "passage": "Passage text...",
                      "choices": ["Choice 1", "Choice 2", "Choice 3", "Choice 4", "Choice 5"],
                      "answer": 3,
                      "explanation": "Explanation in Korean"
                    }
                  ]
                }

                **INSTRUCTIONS**:
                1. Create **28-32 high-quality multiple choice questions** based on the text. (Maximize the number of questions to around 30).
                2. **Question Types** (Mix these):
                   - **Subject/Title**: "다음 글의 주제/제목으로 가장 적절한 것은?"
                   - **Grammar**: "다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?" (CRITICAL: In the 'passage', mark the target parts with (1)~(5) or use <u>tags</u>. Choices should be (1), (2), etc.)
                   - **Incorrect Sentence**: "다음 중 어법상 어색한 문장은?" (In this case, 'passage' can be empty if choices are full independent sentences. OTHERWISE, provide the full text in 'passage' and number the sentences).
                   - **Vocabulary**: "문맥상 낱말의 쓰임이 적절하지 않은 것은?"
                   - **Blank**: "다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오."
                   - **Order**: "주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?" (A)-(B)-(C) format.
                3. **Passage**: 
                   - **CRITICAL**: Include the English text necessary to solve the question. 
                   - **NEVER** leave 'passage' empty unless the choices themselves are the passage (e.g., picking an awkward sentence from a list).
                   - If it's a "Blank" question, include the '_____' marker in the passage.
                4. **Choices**: Must have exactly 5 options.
                5. **Answer**: 1-based index (1, 2, 3, 4, 5).
              `;
            } else if (category === "variant_kr") {
              prompt = `
                국어 선생님으로서 주어진 텍스트를 바탕으로 **국어 변형문제**를 출제해 주세요.
                
                **필수 JSON 구조**:
                {
                  "title": "문서 제목",
                  "questions": [
                    {
                      "id": 1,
                      "type": "주제", 
                      "question": "윗글의 주제로 가장 적절한 것은?",
                      "passage": "지문 내용...",
                      "choices": ["선택지 1", "선택지 2", "선택지 3", "선택지 4", "선택지 5"],
                      "answer": 3,
                      "explanation": "해설 내용"
                    }
                  ]
                }

                **지시사항**:
                1. 텍스트 내용을 바탕으로 **20~30개의 고품질 객관식 문제**를 만드세요.
                2. **문제 유형** (골고루 섞어서):
                   - **내용 일치**: "윗글의 내용과 일치하지 않는 것은?"
                   - **주제/제목**: "윗글의 주제로 가장 적절한 것은?"
                   - **빈칸 추론**: "빈칸 (A)에 들어갈 말로 적절한 것은?"
                   - **어휘**: "문맥상 ㉠의 의미와 가장 유사한 것은?"
                   - **순서 배열**: "다음 문장이 들어갈 위치로 적절한 곳은?"
                3. **지문(Passage)**:
                   - 문제를 푸는 데 필요한 지문을 포함하세요.
                   - 전체 지문이 너무 길면 해당 부분만 발췌하거나, 필요한 경우 전체를 넣으세요.
                4. **선택지**: 반드시 5개의 선택지를 만드세요.
                5. **정답**: 1~5 사이의 숫자로 표시하세요.
              `;
            } else if (category === "variant_math") {
              prompt = `
                수학 선생님으로서 주어진 텍스트(개념 설명 또는 문제)를 바탕으로 **수학 변형문제**를 출제해 주세요.
                
                **필수 JSON 구조**:
                {
                  "title": "문서 제목",
                  "questions": [
                    {
                      "id": 1,
                      "type": "계산/개념", 
                      "question": "다음 문제를 푸시오.",
                      "passage": "문제 설명 또는 수식...",
                      "choices": ["1", "2", "3", "4", "5"],
                      "answer": 3,
                      "explanation": "풀이 과정"
                    }
                  ]
                }

                **지시사항**:
                1. 텍스트에 포함된 개념이나 문제 유형을 바탕으로 **15~20개의 객관식 변형문제**를 만드세요. (숫자나 조건을 바꾼 유사 문제)
                2. **수식 표현**: 
                   - JSON 문자열 내에서 역슬래시(\\)를 사용할 경우 반드시 **이중 역슬래시(\\\\)**로 이스케이프해야 합니다. (예: \\\\alpha, \\\\frac{a}{b})
                   - 가능한 한 일반 텍스트로 표현하되, 필요한 경우 LaTeX를 쓰세요.
                3. **문제 유형**:
                   - 단순 계산보다는 개념 이해를 묻거나 응용력을 테스트하는 문제를 포함하세요.
                4. **선택지**: 5개의 선택지를 만드세요.
                5. **정답**: 1~5 사이의 숫자로 표시하세요.
              `;
            } else if (category === "variant_science") {
              prompt = `
                과학 선생님으로서 주어진 텍스트를 바탕으로 **과학 변형문제**를 출제해 주세요.
                
                **필수 JSON 구조**:
                {
                  "title": "문서 제목",
                  "questions": [
                    {
                      "id": 1,
                      "type": "개념확인", 
                      "question": "다음 설명 중 옳지 않은 것은?",
                      "passage": "지문 또는 자료...",
                      "choices": ["선택지 1", "선택지 2", "선택지 3", "선택지 4", "선택지 5"],
                      "answer": 3,
                      "explanation": "해설"
                    }
                  ]
                }

                **지시사항**:
                1. 텍스트 내용을 바탕으로 **20~25개의 객관식 문제**를 만드세요.
                2. **문제 유형**:
                   - **개념 이해**: 용어 정의나 현상에 대한 이해를 묻는 문제.
                   - **자료 해석**: (텍스트에 데이터가 있다면) 데이터를 해석하는 문제.
                   - **적용/추론**: 원리를 새로운 상황에 적용하는 문제.
                3. **선택지**: 5지 선다형으로 만드세요.
              `;
            } else if (category === "variant_social") {
              prompt = `
                사회/역사 선생님으로서 주어진 텍스트를 바탕으로 **사회 변형문제**를 출제해 주세요.
                
                **필수 JSON 구조**:
                {
                  "title": "문서 제목",
                  "questions": [
                    {
                      "id": 1,
                      "type": "개념/사실", 
                      "question": "다음 글의 내용과 일치하는 것은?",
                      "passage": "지문...",
                      "choices": ["선택지 1", "선택지 2", "선택지 3", "선택지 4", "선택지 5"],
                      "answer": 3,
                      "explanation": "해설"
                    }
                  ]
                }

                **지시사항**:
                1. 텍스트 내용을 바탕으로 **20~25개의 객관식 문제**를 만드세요.
                2. **문제 유형**:
                   - **사실 확인**: 사건, 인물, 개념에 대한 정확한 지식을 묻는 문제.
                   - **인과 관계**: 원인과 결과를 묻는 문제.
                   - **비교/대조**: 서로 다른 개념이나 시대를 비교하는 문제.
                3. **선택지**: 5지 선다형으로 만드세요.
              `;
            } else if (category === "workbook") {
              prompt = `
                Act as an expert English teacher creating a **WORKBOOK**.
                Analyze the provided text and generate a JSON response suitable for creating student exercises.

                **CRITICAL**: Analyze EVERY SINGLE SENTENCE.

                **REQUIRED JSON STRUCTURE**:
                {
                  "title": "Document Title",
                  "tableOfContents": [{"chapter": "Ch1", "page": 1}],
                  "structure": {
                    "title": "English Title", "titleTranslation": "Korean Title",
                    "subject": "English Subject", "subjectTranslation": "Korean Subject",
                    "summary": "English Summary", "summaryTranslation": "Korean Summary",
                    "sections": []
                  },
                  "backgroundKnowledge": { "title": "...", "description": "..." },
                  "vocabulary": [ { "word": "word", "meaning": "meaning", "partOfSpeech": "n", "synonyms": [], "antonyms": [], "isImportant": true } ],
                  "sentences": [
                    {
                      "id": 1,
                      "original": "Original English sentence (CLEAN).",
                      "analysis": "English sentence with WORKBOOK MARKUP.",
                      "tags": ["주제문", "서술형"],
                      "translation": "Korean translation."
                    }
                  ]
                }

                **WORKBOOK MARKUP SYNTAX (Strictly for Exercises)**:

                1. **Vocabulary Choice ([A / B])**:
                   - Target: Important content words (verbs, nouns, adjectives).
                   - Format: \`[correct_word/≠distractor/blue]\`
                   - **CRITICAL**: You MUST provide a '≠distractor' (confusing word or antonym).
                   - Example: \`[accessible/≠assessable/blue]\`, \`[adopt/≠adapt/blue]\`
                   - **MANDATORY**: Mark at least one word per sentence.

                2. **Grammar Choice ([A / B])**:
                   - Target: Key grammar points (tense, relative pronouns, switches).
                   - Format: \`[correct_form/wrong_form(X)/red/ox]\`
                   - **CRITICAL**: You MUST provide a 'wrong_form(X)'.
                   - Example: \`[which/what(X)/red/ox]\`, \`[surprising/surprised(X)/red/ox]\`
                   - **MANDATORY**: Mark at least one grammar point per sentence.

                3. **Verb Transformation ( ________ (root) )**:
                   - Target: Main verbs, participles, infinitives.
                   - Format: \`[conjugated_verb/root_verb/green/verb]\`
                   - **CRITICAL**: Provide the **ROOT (Base) FORM** in the annotation.
                   - **MANDATORY**: You MUST mark at least ONE verb in EVERY sentence. If no complex verb exists, mark the main verb.
                   - Example: \`[went/go/green/verb]\`, \`[studying/study/green/verb]\`, \`[is/be/green/verb]\`

                **INSTRUCTIONS**:
                - **original**: Clean English text. NO markup.
                - **analysis**: Apply the markup above.
                  - **Every sentence** MUST have markup for all 3 types (Vocabulary, Grammar, Verb) if physically possible. 
                  - **DO NOT** skip sentences. Even simple sentences have verbs and vocabulary.
                  - **PRIORITIZE** Verb Transformation (Green) for EVERY sentence.
                - **vocabulary**: Standard vocabulary list.
                - **translation**: Korean translation.
              `;
            } else {
              // Default Analysis Prompt (Solvook Style)
              prompt = `
                Act as an expert English teacher. Analyze the provided text and generate a JSON response.
                
                **CRITICAL**: Analyze EVERY SINGLE SENTENCE.

                **REQUIRED JSON STRUCTURE**:
                {
                  "title": "Document Title",
                  "tableOfContents": [{"chapter": "Ch1", "page": 1}],
                  "structure": {
                    "title": "English Title of the text",
                    "titleTranslation": "Korean Title",
                    "subject": "English Topic/Subject",
                    "subjectTranslation": "Korean Topic",
                    "summary": "English Summary",
                    "summaryTranslation": "Korean Summary",
                    "sections": [
                      {
                        "label": "Intro/Body/Conclusion (or Logical Flow)", 
                        "labelTranslation": "도입/전개/결론 (Korean Label)",
                        "content": "English Content Summary", 
                        "translation": "Korean Content Translation"
                      }
                    ]
                  },
                  "backgroundKnowledge": { "title": "...", "description": "..." },
                  "vocabulary": [
                    {
                      "word": "word",
                      "meaning": "korean meaning",
                      "partOfSpeech": "n/v/adj",
                      "synonyms": ["syn1", "syn2"],
                      "antonyms": ["ant1", "ant2"],
                      "isImportant": true
                    }
                  ],
                  "sentences": [
                    {
                      "id": 1,
                      "original": "Original English sentence (CLEAN, NO SLASHES).",
                      "analysis": "English sentence with markup (NO SLASHES).",
                      "tags": ["주제문", "서술형", "어법", "빈칸"],
                      "translation": "Korean translation."
                    }
                  ]
                }

                **MARKUP SYNTAX (Visual & Educational)**:
                
                1. **Background Highlighting (Clauses) - Use VARIOUS colors**:
                   - **Soft Orange/Beige**: Enclose in \`{{ ... }}\`. (e.g. Topic sentences)
                   - **Soft Blue**: Enclose in \`(({ ... }))\`. (e.g. Noun clauses)
                   - **Soft Green**: Enclose in \`<<{ ... }>>\`. (e.g. Adverbial clauses)
                   - **Soft Purple**: Enclose in \`[[{ ... }]]\`. (e.g. Relative clauses)
                   - **Soft Pink**: Enclose in \`((({ ... })))\`. (e.g. Participle phrases)
                   - **Important**: Vary these colors to distinguish different parts of the sentence structure.

                2. **Grammar & Emphasis (Red)**:
                   - **Grammar Focus**: \`[word/grammar_term/red/line]\`
                     - Black text + Red Underline.
                     - Example: \`[to use/형용사적 용법/red/line]\`
                   - **Grammar Trap (Caution)**: \`[correct_word/wrong_word (X)/red/ox]\`
                     - Black text + Red Underline + **Red Note** with (X).
                     - Example: \`[that/what (X)/red/ox]\`

                3. **Vocabulary Distinctions (Blue) - NO SIMPLE MEANINGS**:
                   - **Do NOT mark simple meanings** (e.g. apple/사과).
                   - **ONLY mark Confusing Words / Antonyms**.
                   - Format: \`[word/≠ antonym (meaning)/blue]\`
                   - Blue text + Blue Underline.
                   - Example: \`[requirement/≠ acquirement (습득)/blue]\`, \`[accessible/≠ assessable (평가가능)/blue]\`

                4. **Connectors (Orange)**:
                   - **Format**: \`[word/ /orange/oval]\`
                   - Example: \`[Thus/ /orange/oval]\`

                **INSTRUCTIONS**:
                - **original**: The raw English sentence ONLY. **ABSOLUTELY NO MARKUP.** **NO SLASHES.** **NO TRANSLATION.**
                - **analysis**: The English sentence **WITH MARKUP**. **DO NOT USE SLASHES (/) FOR CHUNKING.** Only use slashes inside the \`[text/annotation/...]\` markup.
                  - **Wrap the ENTIRE Sentence** or **Major Clauses** in background tags (\`{{...}}\`, \`(({...}))\`).
                  - **NO simple vocabulary definitions.** Only mark distinctive/confusing words.
                  - **Focus on Grammar Traps (X)** and **Core Grammar**.
                  - **MUST** use Korean for grammar terms.
                - **vocabulary**: 
                  - Generate 8-12 key words.
                  - Include synonyms and antonyms.
                  - Mark \`isImportant\` for 3-4 key words.
                  - Use abbreviations for partOfSpeech (e.g. n, v, adj, adv).
                - **tags**: Identify "주제문", "서술형".
                - **translation**: Natural Korean translation.
              `;
            }

            
            // Add level instruction to prompt
            if (levelInstruction) {
                prompt += levelInstruction;
            }

            // Add prompt to parts
            parts.push({ text: prompt });

            const result = await model.generateContent(parts);
            const response = await result.response;
            const text = response.text();
            
            // Extract JSON from markdown code block if present
            const jsonMatch = text.match(/```json\s*(\{[\s\S]*\})\s*```/) || text.match(/\{[\s\S]*\}/);
            
            if (jsonMatch) {
               try {
                 // Try to remove newlines inside strings to avoid parse errors (risky but often needed for messy LLM output)
                 // let cleanJson = (jsonMatch[1] || jsonMatch[0]).replace(/\n/g, "\\n"); // This breaks pretty printing, use with caution.
                 // Better: Use the raw match first.
                 
                 aiAnalysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
               } catch (e: any) {
                 console.log("JSON parse failed, trying to repair: " + e.message); // Changed to log, not error
                 try {
                  let fixedJson = jsonMatch[1] || jsonMatch[0];
                  
                  // 0. Pre-fix common escape issues (The "Bad escaped character" fix)
                  // 0.1 Fix invalid unicode escapes (e.g. \u not followed by 4 hex chars)
                  fixedJson = fixedJson.replace(/\\u(?![0-9a-fA-F]{4})/g, "\\\\u");

                  // 0.2 Replace single backslashes that are NOT valid escapes with double backslashes
                  // Valid escapes in JSON: \" \\ \/ \b \f \n \r \t \uXXXX
                  // We remove b, f, t from the list because in LaTeX context, \beta, \frac, \times are common.
                  // We want to turn \beta -> \\beta, \frac -> \\frac, \times -> \\times
                  // We also use a capturing group (^|[^\\]) to avoid double-escaping already valid backslashes (\\)
                  fixedJson = fixedJson.replace(/(^|[^\\])\\([^"\\\/nru])/g, "$1\\\\$2");

                   // 1. Remove trailing commas before closing brackets/braces
                   fixedJson = fixedJson.replace(/,\s*([\]}])/g, '$1');

                   // 1.5. Fix missing commas between objects (common AI error)
                   // e.g. } {  -> } , {
                   fixedJson = fixedJson.replace(/}\s*{/g, '},{');
                   // e.g. "string" "next" -> "string", "next" (less common in valid structure but possible)
                   fixedJson = fixedJson.replace(/}\s*"/g, '},"');
                   
                   // 2. Stack-based repair for correct nesting
                   const stack: string[] = [];
                   let inString = false;
                   let isEscaped = false;
                   
                   // Process the existing string to find what's missing
                   for (let i = 0; i < fixedJson.length; i++) {
                     const char = fixedJson[i];
                     
                     if (inString) {
                       if (char === '\\' && !isEscaped) {
                         isEscaped = true;
                       } else if (char === '"' && !isEscaped) {
                         inString = false;
                       } else {
                         isEscaped = false;
                       }
                     } else {
                       if (char === '"') {
                         inString = true;
                       } else if (char === '{') {
                         stack.push('}');
                       } else if (char === '[') {
                         stack.push(']');
                       } else if (char === '}') {
                         if (stack.length > 0 && stack[stack.length - 1] === '}') {
                           stack.pop();
                         }
                       } else if (char === ']') {
                         if (stack.length > 0 && stack[stack.length - 1] === ']') {
                           stack.pop();
                         }
                       }
                     }
                   }
                   
                   // Close open string
                   if (inString) fixedJson += '"';
                   
                   // Close remaining open structures in reverse order
                   while (stack.length > 0) {
                     fixedJson += stack.pop();
                   }
                   
                   aiAnalysis = JSON.parse(fixedJson);
                 } catch (e2) {
                   console.error("JSON repair failed:", e2);
                   // Fallback to text if JSON fails
                   extractedText = "AI Analysis Error: " + text.substring(0, 500) + "..."; 
                 }
               }
            } else {
               try {
                 aiAnalysis = JSON.parse(text);
               } catch (e) {
                 console.error("Direct JSON parse failed:", e);
               }
            }
          }
        } catch (error) {
          console.error("AI Analysis failed:", error);
          // Continue without AI analysis if it fails
        }
      }

      // 3. 목차 생성 로직
      let mockToc: any[] = [];
      
      // 1. AI Analysis Result (High Priority)
      if (aiAnalysis && aiAnalysis.tableOfContents && Array.isArray(aiAnalysis.tableOfContents) && aiAnalysis.tableOfContents.length > 0) {
         mockToc = aiAnalysis.tableOfContents.map((item: any, index: number) => ({
           id: `chapter-${index}`,
           title: item.chapter || item.title || `Chapter ${index + 1}`,
           page: typeof item.page === 'number' ? item.page : 1,
           selected: true
         }));
      }

      // 2. Fallback: Simple text splitting (Low Priority - mainly for docx)
      if (mockToc.length === 0 && extractedText && extractedText.length > 50 && fileType !== ".hwp") {
         const lines = extractedText.split('\n')
           .map(line => line.trim())
           .filter(line => line.length > 2 && line.length < 80);
         
         mockToc = lines.slice(0, 15).map((line, index) => ({
           id: `chapter-${index}`,
           title: line,
           page: Math.floor(index / 3) + 1,
           selected: true
         }));
      }

      // 기본 목차 (분석 실패 또는 HWP)
      if (mockToc.length === 0) {
        mockToc = [
            { id: "1", title: "제1장 서론 (직접 입력 필요)", page: 1, selected: true },
            { id: "2", title: "제2장 본론 (직접 입력 필요)", page: 5, selected: true },
            { id: "3", title: "제3장 결론 (직접 입력 필요)", page: 10, selected: true }
        ];
        
        if (!extractedText && !aiAnalysis) {
            extractedText = "텍스트를 추출할 수 없거나 AI 분석에 실패했습니다. (PDF/이미지 분석은 AI 모델 설정이 필요합니다)";
        }
      }

      // AI 분석이 성공하거나 텍스트가 추출된 경우 source_materials 테이블에도 저장하여 나중에 불러올 수 있게 함
      try {
        if (req.isAuthenticated()) {
          // Cloudinary에 업로드 (원본 보관용) - URL만 획득하고 DB 저장은 나중에 (사용자가 저장 버튼 누를 때)
          const uploadResult = await uploadToCloudinary(req.file.buffer, {
            folder: "training-platform/source-materials",
            resourceType: "raw",
          });
          
          // 분석 시점에는 source_materials에 저장하지 않음 (사용자 요청 반영)
          
          res.json({
            message: "File analyzed successfully",
            filename: originalName,
            textLength: extractedText.length || (aiAnalysis ? 1000 : 0),
            toc: mockToc,
            rawText: extractedText.substring(0, 10000), 
            aiAnalysis: aiAnalysis,
            fileType: fileType,
            fileUrl: uploadResult.url // URL 반환하여 클라이언트가 저장 시점에 사용할 수 있게 함
          });
        }
      } catch (saveErr) {
        console.error("Failed to upload/save source material:", saveErr);
        // 오류가 나도 분석 결과는 반환 (URL 없이)
        if (!res.headersSent) {
          res.json({
            message: "File analyzed successfully (Upload failed)",
            filename: originalName,
            textLength: extractedText.length || (aiAnalysis ? 1000 : 0),
            toc: mockToc,
            rawText: extractedText.substring(0, 10000), 
            aiAnalysis: aiAnalysis,
            fileType: fileType
          });
        }
      }
    } catch (error) {
      console.error("File analysis error:", error);
      res.status(500).json({ message: "Error analyzing file" });
    }
  });

  // Image upload endpoint (Cloudinary)
  app.post("/api/upload/image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Cloudinary에 이미지 업로드
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "training-platform/uploads",
        resourceType: "image",
      });

      res.json({ imageUrl: result.url });
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(500).json({ message: "Error uploading image" });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const { category, type, level, search, page, limit, subcategory } =
        req.query;

      console.log("API /api/courses 요청 파라미터:");
      console.log("- category:", category);
      console.log("- type:", type);
      console.log("- level:", level);
      console.log("- search:", search);
      console.log("- subcategory:", subcategory);
      console.log("- page:", page);
      console.log("- limit:", limit);

      const result = await storage.getCourses({
        category: category as string,
        type: type as string,
        level: level as string,
        search: search as string,
        subcategory: subcategory as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      console.log("필터링 결과:", result.courses.length, "개 과정");
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching courses" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ message: "Error fetching course" });
    }
  });

  app.post("/api/courses", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const courseData = {
        ...req.body,
        providerId: req.user.id,
        enrolledCount: 0,
        isActive: true,
        approvalStatus: "approved",
      };

      const course = await storage.createCourse(courseData);

      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Error creating course" });
    }
  });

  // Update course
  app.put("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const courseId = parseInt(req.params.id);

    // For admin users, allow editing any course
    if (req.user.isAdmin) {
      try {
        const updatedCourse = await storage.updateCourse(courseId, req.body);
        if (!updatedCourse) {
          return res.status(404).json({ message: "Course not found" });
        }
        res.json(updatedCourse);
        return;
      } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ message: "Error updating course" });
        return;
      }
    }

    // For non-admin users, check if they own the course
    const existingCourse = await storage.getCourse(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isOwner = existingCourse.providerId === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied - not owner" });
    }

    try {
      const updatedCourse = await storage.updateCourse(courseId, req.body);
      if (!updatedCourse) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Error updating course" });
    }
  });

  // Delete course
  app.delete("/api/courses/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const courseId = parseInt(req.params.id);

    // For admin users, allow deleting any course
    if (req.user.isAdmin) {
      try {
        await storage.deleteCourse(courseId);
        res.json({ message: "Course deleted successfully" });
        return;
      } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Error deleting course" });
        return;
      }
    }

    // For non-admin users, check if they own the course
    const existingCourse = await storage.getCourse(courseId);
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isOwner = existingCourse.providerId === req.user.id;
    if (!isOwner) {
      return res.status(403).json({ message: "Access denied - not owner" });
    }

    try {
      await storage.deleteCourse(courseId);
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Error deleting course" });
    }
  });

  // Instructor routes
  app.get("/api/instructors", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      res.json(instructors);
    } catch (error) {
      res.status(500).json({ message: "Error fetching instructors" });
    }
  });

  // Popular brands (instructors) for home page
  app.get("/api/popular-brands", async (req, res) => {
    try {
      const instructors = await storage.getInstructors();
      const brandsWithMaterials = await Promise.all(
        instructors.map(async (instructor) => {
          const courses = await storage.getCoursesByProvider(instructor.providerId || 0);
          // Only take top 5 materials for each brand
          const materials = courses.slice(0, 5).map(c => ({
            id: c.id,
            title: c.title,
            price: c.price > 0 ? `${c.price.toLocaleString()}원` : "무료",
            imageUrl: c.imageUrl,
            category: c.category
          }));
          return {
            id: instructor.id,
            name: instructor.name,
            logo: instructor.name.slice(0, 2),
            logoColor: "bg-blue-500",
            subscribers: instructor.subscribers || 0,
            imageUrl: instructor.imageUrl,
            materials: materials
          };
        })
      );
      // Sort by subscribers desc
      res.json(brandsWithMaterials.sort((a, b) => b.subscribers - a.subscribers));
    } catch (error) {
      console.error("Error fetching popular brands:", error);
      res.status(500).json({ message: "Error fetching popular brands" });
    }
  });

  app.get("/api/instructors/:id", async (req, res) => {
    try {
      const instructor = await storage.getInstructor(parseInt(req.params.id));
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      res.json(instructor);
    } catch (error) {
      res.status(500).json({ message: "Error fetching instructor" });
    }
  });

  app.post("/api/instructors", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const instructor = insertInstructorSchema.parse(req.body);
      const newInstructor = await storage.createInstructor(instructor);
      res.status(201).json(newInstructor);
    } catch (error) {
      res.status(400).json({ message: "Invalid instructor data" });
    }
  });

  // Subscription routes
  app.post("/api/instructors/:id/subscribe", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const instructorId = parseInt(req.params.id);
    if (isNaN(instructorId)) return res.sendStatus(400);

    try {
      const existing = await storage.getSubscription(req.user!.id, instructorId);
      
      if (existing) {
        await storage.deleteSubscription(req.user!.id, instructorId);
        res.json({ subscribed: false });
      } else {
        await storage.createSubscription(req.user!.id, instructorId);
        res.json({ subscribed: true });
      }
    } catch (error) {
      console.error("Subscription error:", error);
      res.status(500).json({ message: "Subscription error" });
    }
  });

  app.get("/api/instructors/:id/subscription-status", async (req, res) => {
    const instructorId = parseInt(req.params.id);
    if (isNaN(instructorId)) return res.sendStatus(400);

    if (!req.isAuthenticated()) return res.json({ subscribed: false });

    try {
      const existing = await storage.getSubscription(req.user!.id, instructorId);
      res.json({ subscribed: !!existing });
    } catch (error) {
      console.error("Subscription status error:", error);
      res.status(500).json({ message: "Subscription status error" });
    }
  });

  // Enrollment routes
  app.get("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { courseId } = req.query;
      const enrollments = await storage.getEnrollments(
        req.user.id,
        courseId ? parseInt(courseId as string) : undefined,
      );

      // 각 등록에 대해 강의 정보를 가져와서 type 필드 추가
      const enrichedEnrollments = await Promise.all(
        enrollments.map(async (enrollment) => {
          try {
            // 세미나 타입인 경우 세미나 정보를 가져옴
            if (enrollment.type === "seminar" || enrollment.subtype === "seminar") {
              const seminar = await storage.getSeminar(enrollment.courseId);
              return {
                ...enrollment,
                course: seminar
                  ? {
                      id: seminar.id,
                      title: seminar.title,
                      category: "세미나", // 카테고리 고정
                      type: "seminar",
                      price: seminar.price,
                      description: seminar.description,
                      imageUrl: seminar.imageUrl,
                      // Course 타입 호환성을 위한 추가 필드들
                      credit: 0,
                      progress: 0,
                      level: "전체",
                      duration: seminar.duration,
                      status: "active",
                      approvalStatus: "approved",
                      isActive: true,
                      createdAt: seminar.createdAt,
                      updatedAt: seminar.createdAt,
                    }
                  : null,
              };
            }

            const course = await storage.getCourse(enrollment.courseId);
            return {
              ...enrollment,
              course: course
                ? {
                    ...course,
                    type: course.type, // type 필드를 직접 사용
                  }
                : null,
            };
          } catch (error) {
            console.error(
              `Error fetching course/seminar ${enrollment.courseId}:`,
              error,
            );
            return enrollment;
          }
        }),
      );

      res.json(enrichedEnrollments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching enrollments" });
    }
  });

  // 수강 신청 취소/삭제 API
  app.delete("/api/enrollments/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const enrollmentId = parseInt(req.params.id);
      const enrollment = await storage.getEnrollment(enrollmentId);

      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }

      // 본인 확인
      if (enrollment.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteEnrollment(enrollmentId);
      
      // 세미나인 경우 세미나 등록 정보도 삭제 (필요한 경우)
      if (enrollment.type === "seminar") {
        // seminarRegistrations 테이블에서도 삭제하는 로직이 필요할 수 있지만, 
        // 현재는 enrollments 삭제만으로 충분할 수 있음. 
        // 만약 완전한 동기화가 필요하다면 storage.deleteSeminarRegistration(userId, seminarId) 구현 필요
      }

      res.json({ message: "Enrollment deleted successfully" });
    } catch (error) {
      console.error("Error deleting enrollment:", error);
      res.status(500).json({ message: "Error deleting enrollment" });
    }
  });

  app.post("/api/enrollments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const enrollment = insertEnrollmentSchema.parse({
        ...req.body,
        userId: req.user.id,
        type: "course",
      });
      const newEnrollment = await storage.createEnrollment(enrollment);
      res.status(201).json(newEnrollment);
    } catch (error) {
      res.status(400).json({ message: "Invalid enrollment data" });
    }
  });

  // Seminar routes
  app.get("/api/seminars", async (req, res) => {
    try {
      const seminars = await storage.getSeminars();
      res.json(seminars);
    } catch (error) {
      res.status(500).json({ message: "Error fetching seminars" });
    }
  });

  app.get("/api/seminars/:id", async (req, res) => {
    try {
      const seminar = await storage.getSeminar(parseInt(req.params.id));
      if (!seminar) {
        return res.status(404).json({ message: "Seminar not found" });
      }
      res.json(seminar);
    } catch (error) {
      res.status(500).json({ message: "Error fetching seminar" });
    }
  });

  app.post("/api/seminars", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const seminar = insertSeminarSchema.parse(req.body);
      const newSeminar = await storage.createSeminar(seminar);
      res.status(201).json(newSeminar);
    } catch (error) {
      res.status(400).json({ message: "Invalid seminar data" });
    }
  });

  app.post("/api/seminars/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const seminarId = parseInt(req.params.id);
      const userId = req.user.id;

      // 세미나 존재 여부 확인
      const seminar = await storage.getSeminar(seminarId);
      if (!seminar) {
        return res.status(404).json({ error: "세미나를 찾을 수 없습니다." });
      }

      // 이미 신청했는지 확인
      const isAlreadyRegistered = await storage.isSeminarRegistered(
        userId,
        seminarId,
      );
      if (isAlreadyRegistered) {
        return res.status(400).json({ error: "이미 신청한 세미나입니다." });
      }

      // 정원 확인
      if (
        seminar.maxParticipants &&
        seminar.currentParticipants &&
        seminar.currentParticipants >= seminar.maxParticipants
      ) {
        return res.status(400).json({ error: "세미나 정원이 마감되었습니다." });
      }

      // 세미나 신청 등록
      await storage.registerForSeminar(userId, seminarId);

      // enrollments 테이블에도 등록 (세미나 타입 유지)
      const enrollment = await storage.createEnrollment({
        userId,
        courseId: seminarId,
        status: "enrolled",
        progress: 0,
        type: "seminar", // 타입을 'seminar'로 통일
        subtype: seminar.type, // 원래 타입을 subtype으로 저장
      });

      console.log(
        `User ${userId} successfully registered for seminar ${seminarId}`,
      );

      res.json({
        success: true,
        message: "세미나 신청이 완료되었습니다.",
        seminarId,
        userId,
      });
    } catch (error) {
      console.error("Seminar registration error:", error);
      res.status(500).json({ error: "세미나 신청 중 오류가 발생했습니다." });
    }
  });

  // Notice routes
  app.get("/api/notices", async (req, res) => {
    try {
      const { category, page, limit } = req.query;
      const result = await storage.getNotices(
        category as string,
        page ? parseInt(page as string) : undefined,
        limit ? parseInt(limit as string) : undefined,
      );
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notices" });
    }
  });

  // Chat API
  app.get("/api/chat/channels", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const channels = await storage.getUserChatChannels(req.user.id);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching chat channels:", error);
      res.status(500).json({ message: "채팅 목록을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/chat/channels/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const channelId = parseInt(req.params.id);
      const messages = await storage.getChatMessagesByChannel(channelId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "채팅 메시지를 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.delete("/api/chat/channels/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const channelId = parseInt(req.params.id);
      
      // 채널 소유권 확인 또는 관리자 권한 확인
      const channels = await storage.getUserChatChannels(req.user.id);
      const isOwner = channels.some(c => c.id === channelId);
      
      if (!isOwner && !req.user.isAdmin) {
        return res.status(403).json({ message: "삭제 권한이 없습니다." });
      }

      await storage.deleteChatChannel(channelId);
      
      res.json({ message: "채팅방이 삭제되었습니다." });
    } catch (error) {
      console.error("Error deleting chat channel:", error);
      res.status(500).json({ message: "채팅방 삭제 중 오류가 발생했습니다." });
    }
  });

  app.get("/api/notices/:id", async (req, res) => {
    try {
      const notice = await storage.getNotice(parseInt(req.params.id));
      if (!notice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      res.json(notice);
    } catch (error) {
      res.status(500).json({ message: "Error fetching notice" });
    }
  });

  app.post("/api/notices", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const notice = insertNoticeSchema.parse({
        ...req.body,
        authorId: req.user.id,
      });
      const newNotice = await storage.createNotice(notice);
      res.status(201).json(newNotice);
    } catch (error) {
      res.status(400).json({ message: "Invalid notice data" });
    }
  });

  // Update notice
  app.put("/api/notices/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    console.log("Update notice - User:", req.user);
    console.log("Update notice - Is Admin:", req.user?.isAdmin);

    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const noticeId = parseInt(req.params.id);
      const updatedNotice = await storage.updateNotice(noticeId, req.body);
      if (!updatedNotice) {
        return res.status(404).json({ message: "Notice not found" });
      }
      res.json(updatedNotice);
    } catch (error) {
      console.error("Error updating notice:", error);
      res.status(500).json({ message: "Error updating notice" });
    }
  });

  // Delete notice
  app.delete("/api/notices/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const noticeId = parseInt(req.params.id);
      await storage.deleteNotice(noticeId);
      res.json({ message: "Notice deleted successfully" });
    } catch (error) {
      console.error("Error deleting notice:", error);
      res.status(500).json({ message: "Error deleting notice" });
    }
  });

  // Increment notice views
  app.post("/api/notices/:id/views", async (req, res) => {
    try {
      const noticeId = parseInt(req.params.id);
      await storage.incrementNoticeViews(noticeId);
      res.json({ message: "Views incremented successfully" });
    } catch (error) {
      console.error("Error incrementing views:", error);
      res.status(500).json({ message: "Error incrementing views" });
    }
  });

  // Review routes
  app.get("/api/courses/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews(parseInt(req.params.id));
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  app.post("/api/courses/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const review = insertReviewSchema.parse({
        ...req.body,
        userId: req.user.id,
        courseId: parseInt(req.params.id),
      });
      const newReview = await storage.createReview(review);
      res.status(201).json(newReview);
    } catch (error) {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const payments = await storage.getPayments(req.user.id);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const payment = insertPaymentSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      const newPayment = await storage.createPayment(payment);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // File upload route (Cloudinary)
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      // 이미지인지 문서인지에 따라 리소스 타입 결정
      const isImage = /jpeg|jpg|png|gif|webp/.test(req.file.mimetype);
      const result = await uploadToCloudinary(req.file.buffer, {
        folder: "training-platform/uploads",
        resourceType: isImage ? "image" : "raw",
      });

      res.json({
        message: "File uploaded successfully",
        filename: result.publicId,
        originalName: req.file.originalname,
        size: result.bytes,
        url: result.url,
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  });

  // Statistics route for admin dashboard
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }

    try {
      const [coursesResult, seminarsResult, paymentsResult] = await Promise.all(
        [storage.getCourses(), storage.getSeminars(), storage.getPayments()],
      );

      res.json({
        totalCourses: coursesResult.total,
        totalSeminars: seminarsResult.length,
        totalPayments: paymentsResult.length,
        // Add more statistics as needed
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });

  // Overseas Programs public routes
  app.get("/api/overseas-programs", async (req, res) => {
    try {
      const { search, category, country, level } = req.query;

      console.log("API /api/overseas-programs 요청 파라미터:");
      console.log("- search:", search);
      console.log("- category:", category);
      console.log("- country:", country);
      console.log("- level:", level);

      const allPrograms = await storage.getOverseasPrograms();

      // 필터링 적용
      let filteredPrograms = allPrograms.filter(
        (program) =>
          program.status === "active" &&
          program.approvalStatus === "approved" &&
          program.isActive,
      );

      // 검색 필터
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredPrograms = filteredPrograms.filter(
          (program) =>
            program.title.toLowerCase().includes(searchTerm) ||
            program.destination.toLowerCase().includes(searchTerm) ||
            (program.description &&
              program.description.toLowerCase().includes(searchTerm)),
        );
      }

      // 카테고리 필터
      if (category && category !== "all") {
        filteredPrograms = filteredPrograms.filter(
          (program) => program.type === category,
        );
      }

      // 국가/교육지 필터
      if (country && country !== "전체") {
        filteredPrograms = filteredPrograms.filter((program) =>
          program.destination.includes(country as string),
        );
      }

      // 기간 필터 (duration 기반)
      if (level && level !== "전체") {
        if (level === "단기") {
          filteredPrograms = filteredPrograms.filter((program) => {
            const match = program.duration?.match(/(\d+)/);
            const days = match ? parseInt(match[1]) : 0;
            return days >= 1 && days <= 5;
          });
        } else if (level === "중기") {
          filteredPrograms = filteredPrograms.filter((program) => {
            const match = program.duration?.match(/(\d+)/);
            const days = match ? parseInt(match[1]) : 0;
            return days >= 6 && days <= 10;
          });
        } else if (level === "장기") {
          filteredPrograms = filteredPrograms.filter((program) => {
            const match = program.duration?.match(/(\d+)/);
            const days = match ? parseInt(match[1]) : 0;
            return days >= 11;
          });
        }
      }

      console.log(
        "필터링 결과:",
        filteredPrograms.length,
        "개 해외교육 프로그램",
      );

      res.json({
        programs: filteredPrograms,
        total: filteredPrograms.length,
      });
    } catch (error) {
      console.error("Error fetching overseas programs:", error);
      res.status(500).json({ message: "Error fetching overseas programs" });
    }
  });

  app.get("/api/overseas-programs/:id", async (req, res) => {
    try {
      const program = await storage.getOverseasProgram(parseInt(req.params.id));
      if (!program) {
        return res.status(404).json({ message: "Overseas program not found" });
      }

      // Only return active and approved programs
      if (
        program.status !== "active" ||
        program.approvalStatus !== "approved" ||
        !program.isActive
      ) {
        return res.status(404).json({ message: "Overseas program not found" });
      }

      res.json(program);
    } catch (error) {
      console.error("Error fetching overseas program:", error);
      res.status(500).json({ message: "Error fetching overseas program" });
    }
  });

  // Overseas program registration
  app.post("/api/overseas-programs/:id/register", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const programId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if program exists and is active
      const program = await storage.getOverseasProgram(programId);
      if (
        !program ||
        program.status !== "active" ||
        program.approvalStatus !== "approved"
      ) {
        return res
          .status(404)
          .json({ message: "Program not found or not available" });
      }

      // Check if user is already registered
      const isRegistered = await storage.isOverseasRegistered(
        userId,
        programId,
      );
      if (isRegistered) {
        return res
          .status(400)
          .json({ error: "이미 신청한 해외교육 프로그램입니다." });
      }

      // Check if program is full
      if (
        program.maxParticipants &&
        program.currentParticipants &&
        program.currentParticipants >= program.maxParticipants
      ) {
        return res
          .status(400)
          .json({ error: "해외교육 프로그램 정원이 마감되었습니다." });
      }

      // Register user for the program
      await storage.registerForOverseasProgram(userId, programId);

      res.json({ message: "해외교육 프로그램 신청이 완료되었습니다." });
    } catch (error) {
      console.error("Error registering for overseas program:", error);
      res.status(500).json({ error: "신청 처리 중 오류가 발생했습니다." });
    }
  });

  // Course enrollment
  app.post("/api/courses/:id/enroll", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.id;

      // Check if course exists
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollments(userId, courseId);
      if (existingEnrollment.length > 0) {
        return res
          .status(400)
          .json({ message: "Already enrolled in this course" });
      }

      // Create enrollment
      const enrollment = await storage.createEnrollment({
        userId: req.user.id,
        courseId: courseId,
        status: "enrolled",
        progress: 0,
        type: "course",
      });

      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "Error enrolling in course" });
    }
  });

  // 세미나 등록 데이터 마이그레이션 (관리자 전용)
  app.post("/api/admin/migrate-seminar-registrations", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "관리자 권한이 필요합니다." });
    }

    try {
      // storage.ts에는 이 메소드가 없을 수도 있으니 확인 필요
      // await storage.migrateSeminarRegistrations();
      res.json({
        message: "세미나 등록 데이터 마이그레이션 기능은 현재 지원되지 않습니다.",
      });
    } catch (error) {
      console.error("Migration error:", error);
      res.status(500).json({ message: "마이그레이션 중 오류가 발생했습니다." });
    }
  });

  // Overseas registrations routes
  app.get("/api/overseas-registrations", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.id;
      const registrations = await storage.getOverseasRegistrations(
        undefined,
        userId,
      );

      // 각 등록에 대한 해외교육 프로그램 정보 추가
      const enrichedRegistrations = await Promise.all(
        registrations.map(async (registration) => {
          const program = await storage.getOverseasProgram(
            registration.overseasId,
          );
          return {
            ...registration,
            overseas_program: program,
          };
        }),
      );

      res.json(enrichedRegistrations);
    } catch (error) {
      console.error("Error fetching overseas registrations:", error);
      res
        .status(500)
        .json({ message: "Error fetching overseas registrations" });
    }
  });

  // 진도율 업데이트 API
  app.put("/api/enrollments/:id/progress", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const enrollmentId = parseInt(req.params.id);
      const { progress } = req.body;

      // 진도율 유효성 검사
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "유효하지 않은 진도율입니다." });
      }

      // 등록 정보 확인
      const enrollment = await storage.getEnrollment(enrollmentId);
      if (!enrollment) {
        return res
          .status(404)
          .json({ message: "수강 정보를 찾을 수 없습니다." });
      }

      // 사용자 권한 확인
      if (enrollment.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "진도율을 업데이트할 권한이 없습니다." });
      }

      // 진도율 업데이트
      const updatedEnrollment = await storage.updateEnrollment(enrollmentId, {
        progress,
        // 100% 완료시 상태 업데이트
        status: progress >= 100 ? "completed" : enrollment.status,
        completedAt: progress >= 100 ? new Date() : enrollment.completedAt,
        type: enrollment.type,
      });

      res.json(updatedEnrollment);
    } catch (error) {
      console.error("Error updating enrollment progress:", error);
      res
        .status(500)
        .json({ message: "진도율 업데이트 중 오류가 발생했습니다." });
    }
  });

  // 수강 정보 조회 API
  app.get("/api/enrollments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const enrollmentId = parseInt(req.params.id);
      const enrollment = await storage.getEnrollment(enrollmentId);

      if (!enrollment) {
        return res
          .status(404)
          .json({ message: "수강 정보를 찾을 수 없습니다." });
      }

      // 본인의 수강 정보만 조회 가능
      if (enrollment.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "수강 정보를 조회할 권한이 없습니다." });
      }

      res.json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment:", error);
      res
        .status(500)
        .json({ message: "수강 정보 조회 중 오류가 발생했습니다." });
    }
  });

  // Cart API routes
  // 장바구니 목록 조회
  app.get("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const items = await storage.getCartItems(req.user.id);
      res.json({ items });
    } catch (error) {
      console.error("Error fetching cart items:", error);
      res
        .status(500)
        .json({ message: "장바구니 조회 중 오류가 발생했습니다." });
    }
  });

  // 장바구니에 추가
  app.post("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const { courseId, type = "course" } = req.body;

      if (!courseId) {
        return res.status(400).json({ message: "과정 ID가 필요합니다." });
      }

      // 과정이 존재하는지 확인
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "과정을 찾을 수 없습니다." });
      }

      // 이미 장바구니에 있는지 확인
      const isAlreadyInCart = await storage.isInCart(req.user.id, courseId);
      if (isAlreadyInCart) {
        return res
          .status(400)
          .json({ message: "이미 장바구니에 있는 상품입니다." });
      }

      await storage.addToCart(req.user.id, courseId, type);
      res.json({ message: "장바구니에 추가되었습니다." });
    } catch (error) {
      console.error("Error adding to cart:", error);
      res
        .status(500)
        .json({ message: "장바구니 추가 중 오류가 발생했습니다." });
    }
  });

  // 장바구니에서 제거
  app.delete("/api/cart/items/:itemId", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const itemId = parseInt(req.params.itemId);
      await storage.removeFromCart(req.user.id, itemId);
      res.json({ message: "장바구니에서 제거되었습니다." });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res
        .status(500)
        .json({ message: "장바구니 제거 중 오류가 발생했습니다." });
    }
  });

  // 장바구니 비우기
  app.delete("/api/cart/items", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      await storage.clearCart(req.user.id);
      res.json({ message: "장바구니가 비워졌습니다." });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res
        .status(500)
        .json({ message: "장바구니 비우기 중 오류가 발생했습니다." });
    }
  });

  // 장바구니 상태 확인
  app.get("/api/cart/items/status", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "로그인이 필요합니다." });
      }

      const { courseId } = req.query;
      if (!courseId) {
        return res.status(400).json({ message: "과정 ID가 필요합니다." });
      }

      const isInCart = await storage.isInCart(
        req.user.id,
        parseInt(courseId as string),
      );
      res.json({ isInCart });
    } catch (error) {
      console.error("Error checking cart status:", error);
      res
        .status(500)
        .json({ message: "장바구니 상태 확인 중 오류가 발생했습니다." });
    }
  });

  // Private Messages routes (쪽지 시스템)
  app.get("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { type = "received" } = req.query;
      const messages = await storage.getPrivateMessages(
        req.user.id,
        type as "received" | "sent",
      );
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Error fetching messages" });
    }
  });

  app.get("/api/messages/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getPrivateMessage(messageId, req.user.id);

      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      // 받은 메시지이고 아직 읽지 않았다면 읽음 처리
      if (message.receiverId === req.user.id && !message.isRead) {
        await storage.markMessageAsRead(messageId, req.user.id);
      }

      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Error fetching message" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageData = {
        senderId: req.user.id,
        receiverId: parseInt(req.body.receiverId),
        subject: req.body.subject,
        content: req.body.content,
      };

      const message = await storage.createPrivateMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Error creating message" });
    }
  });

  app.patch("/api/messages/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageId = parseInt(req.params.id);
      await storage.markMessageAsRead(messageId, req.user.id);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Error marking message as read" });
    }
  });

  app.delete("/api/messages/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const messageId = parseInt(req.params.id);
      const { type } = req.query; // 'sender' 또는 'receiver'

      await storage.deleteMessage(
        messageId,
        req.user.id,
        type as "sender" | "receiver",
      );
      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Error deleting message" });
    }
  });

  app.get("/api/messages/unread/count", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const count = await storage.getUnreadMessageCount(req.user.id);
      res.json({ count });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ message: "Error fetching unread count" });
    }
  });

  // User search for message recipients
  app.get("/api/users/search", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const { q } = req.query;
      if (!q || typeof q !== "string") {
        return res.json([]);
      }

      const allUsers = await storage.getAllUsers();
      const filteredUsers = allUsers
        .filter(
          (user) =>
            user.id !== req.user.id && // 자기 자신 제외
            (user.name.toLowerCase().includes(q.toLowerCase()) ||
              user.email.toLowerCase().includes(q.toLowerCase())),
        )
        .slice(0, 10) // 최대 10명
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          organizationName: user.organizationName,
        }));

      res.json(filteredUsers);
    } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Error searching users" });
    }
  });

  // Inquiry routes (문의사항 관리)
  app.get("/api/inquiries", async (req, res) => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.role === "admin";
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // 관리자가 아닌 경우 본인 문의만 조회
      const queryUserId = isAdmin ? undefined : userId;

      const result = await storage.getInquiries(
        queryUserId,
        status,
        page,
        limit,
      );

      // 비밀글 필터링: 관리자가 아닌 경우 본인 문의가 아닌 비밀글은 제외
      if (!isAdmin) {
        result.inquiries = result.inquiries.filter(
          (inquiry) => !inquiry.isPrivate || inquiry.userId === userId,
        );
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Error fetching inquiries" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const inquiry = await storage.getInquiry(parseInt(req.params.id));
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      const isAdmin = req.user?.role === "admin";
      const isOwner = inquiry.userId === req.user?.id;

      // 권한 확인: 본인 문의이거나 관리자인 경우만 조회 가능
      // 비밀글인 경우 추가 권한 체크
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (inquiry.isPrivate && !isAdmin && !isOwner) {
        return res.status(403).json({ message: "This is a private inquiry" });
      }

      res.json(inquiry);
    } catch (error) {
      console.error("Error fetching inquiry:", error);
      res.status(500).json({ message: "Error fetching inquiry" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        userId: req.user.id,
      });

      const newInquiry = await storage.createInquiry(inquiryData);
      res.status(201).json(newInquiry);
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(400).json({ message: "Invalid inquiry data" });
    }
  });

  // 관리자 전용: 문의사항 답변
  app.put("/api/inquiries/:id/answer", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const inquiryId = parseInt(req.params.id);
      const { answer } = req.body;

      if (!answer || answer.trim() === "") {
        return res.status(400).json({ message: "Answer is required" });
      }

      const updatedInquiry = await storage.answerInquiry(
        inquiryId,
        answer,
        req.user.id,
      );
      if (!updatedInquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }

      res.json(updatedInquiry);
    } catch (error) {
      console.error("Error answering inquiry:", error);
      res.status(500).json({ message: "Error answering inquiry" });
    }
  });

  // 관리자 전용: 문의사항 삭제
  app.delete("/api/inquiries/:id", async (req, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const inquiryId = parseInt(req.params.id);
      await storage.deleteInquiry(inquiryId);
      res.json({ message: "Inquiry deleted successfully" });
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({ message: "Error deleting inquiry" });
    }
  });

  // Application Routes (Author, Business, Career)
  
  // Author Applications
  app.get("/api/author-applications", async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    try {
      const apps = await storage.getAuthorApplications();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Error fetching author applications" });
    }
  });

  app.post("/api/author-applications", async (req, res) => {
    try {
      const app = insertAuthorApplicationSchema.parse({
        ...req.body,
        userId: req.user?.id, // Optional
      });
      const newApp = await storage.createAuthorApplication(app);
      res.status(201).json(newApp);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.patch("/api/author-applications/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    try {
      const updated = await storage.updateAuthorApplication(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
    }
  });

  // Business Partnerships
  app.get("/api/business-partnerships", async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    try {
      const apps = await storage.getBusinessPartnerships();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Error fetching partnerships" });
    }
  });

  app.post("/api/business-partnerships", async (req, res) => {
    try {
      const app = insertBusinessPartnershipSchema.parse(req.body);
      const newApp = await storage.createBusinessPartnership(app);
      res.status(201).json(newApp);
    } catch (error) {
      res.status(400).json({ message: "Invalid partnership data" });
    }
  });

  app.patch("/api/business-partnerships/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    try {
      const updated = await storage.updateBusinessPartnership(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating partnership" });
    }
  });

  // Career Applications
  app.get("/api/career-applications", async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    try {
      const apps = await storage.getCareerApplications();
      res.json(apps);
    } catch (error) {
      res.status(500).json({ message: "Error fetching career applications" });
    }
  });

  app.post("/api/career-applications", async (req, res) => {
    try {
      const app = insertCareerApplicationSchema.parse({
        ...req.body,
        userId: req.user?.id, // Optional
      });
      const newApp = await storage.createCareerApplication(app);
      res.status(201).json(newApp);
    } catch (error) {
      res.status(400).json({ message: "Invalid application data" });
    }
  });

  app.patch("/api/career-applications/:id", async (req, res) => {
    if (!req.user?.isAdmin) return res.status(403).json({ message: "Admin access required" });
    try {
      const updated = await storage.updateCareerApplication(parseInt(req.params.id), req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating application" });
    }
  });

  // Server instance is created and managed in index.ts
}
