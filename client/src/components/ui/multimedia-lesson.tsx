import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  Volume2, 
  SkipForward, 
  FileQuestion,
  CheckCircle2,
  Clock,
  Download,
  FileText
} from "lucide-react";

interface MultimediaLessonProps {
  lesson: {
    id: string;
    title: string;
    duration: number;
    type: 'video' | 'quiz' | 'practice' | 'document';
    description: string;
    thumbnail?: string;
    questions?: Array<{
      id: string;
      question: string;
      options: string[];
      correct: number;
    }>;
    materials?: Array<{
      name: string;
      type: string;
      size: string;
    }>;
  };
  onComplete?: (lessonId: string) => void;
}

export function MultimediaLesson({ lesson, onComplete }: MultimediaLessonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResults, setQuizResults] = useState<Record<string, boolean>>({});

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // Simulate video progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            onComplete?.(lesson.id);
            return 100;
          }
          return prev + 1;
        });
      }, lesson.duration * 10); // Simulate progress over duration
    }
  };

  const handleQuizSubmit = (questionId: string) => {
    const question = lesson.questions?.find(q => q.id === questionId);
    if (question && selectedAnswers[questionId] !== undefined) {
      const isCorrect = selectedAnswers[questionId] === question.correct;
      setQuizResults(prev => ({ ...prev, [questionId]: isCorrect }));
      
      // Check if all questions are answered correctly
      const allAnswered = lesson.questions?.every(q => 
        quizResults[q.id] === true || (q.id === questionId && isCorrect)
      );
      if (allAnswered) {
        onComplete?.(lesson.id);
      }
    }
  };

  const renderVideoContent = () => (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        {lesson.thumbnail ? (
          <img 
            src={lesson.thumbnail} 
            alt={lesson.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Play className="h-16 w-16 text-white opacity-80" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <Button 
            size="lg"
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4"
            onClick={handlePlay}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </Button>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-white text-sm mb-2">
            <span className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{lesson.duration}분</span>
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1 bg-white bg-opacity-20" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Volume2 className="h-4 w-4 mr-2" />
            음성 조절
          </Button>
          <Button variant="outline" size="sm">
            <SkipForward className="h-4 w-4 mr-2" />
            10초 앞으로
          </Button>
        </div>
        <Badge variant={progress === 100 ? "default" : "outline"}>
          {progress === 100 ? "완료" : "진행중"}
        </Badge>
      </div>
    </div>
  );

  const renderQuizContent = () => (
    <div className="space-y-6">
      {lesson.questions?.map((question, index) => (
        <Card key={question.id} className="p-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h4 className="font-medium">Q{index + 1}. {question.question}</h4>
              {quizResults[question.id] !== undefined && (
                <Badge variant={quizResults[question.id] ? "default" : "destructive"}>
                  {quizResults[question.id] ? "정답" : "오답"}
                </Badge>
              )}
            </div>
            
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                  <input
                    type="radio"
                    name={question.id}
                    value={optIndex}
                    onChange={(e) => setSelectedAnswers(prev => ({
                      ...prev,
                      [question.id]: parseInt(e.target.value)
                    }))}
                    className="w-4 h-4"
                    disabled={quizResults[question.id] !== undefined}
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            
            {quizResults[question.id] === undefined && (
              <Button 
                onClick={() => handleQuizSubmit(question.id)}
                disabled={selectedAnswers[question.id] === undefined}
                size="sm"
              >
                정답 확인
              </Button>
            )}
            
            {quizResults[question.id] !== undefined && (
              <div className={`text-sm p-2 rounded ${
                quizResults[question.id] 
                  ? 'bg-green-50 text-green-700' 
                  : 'bg-red-50 text-red-700'
              }`}>
                {quizResults[question.id] 
                  ? '✓ 정답입니다! 잘 이해하고 계십니다.' 
                  : `✗ 틀렸습니다. 정답은 "${question.options[question.correct]}"입니다.`
                }
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  const renderPracticeContent = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">실습 과제</h4>
        <p className="text-blue-800 text-sm">{lesson.description}</p>
      </div>
      
      {lesson.materials && (
        <div className="space-y-3">
          <h5 className="font-medium">실습 자료</h5>
          {lesson.materials.map((material, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">{material.name}</p>
                  <p className="text-xs text-gray-500">{material.type} • {material.size}</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <Button className="w-full" onClick={() => onComplete?.(lesson.id)}>
        실습 완료 표시
      </Button>
    </div>
  );

  const renderDocumentContent = () => (
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-2">학습 자료</h4>
        <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
        
        {lesson.materials && (
          <div className="space-y-2">
            {lesson.materials.map((material, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{material.name}</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Button className="w-full" onClick={() => onComplete?.(lesson.id)}>
        학습 완료
      </Button>
    </div>
  );

  const getIcon = () => {
    switch (lesson.type) {
      case 'video': return Play;
      case 'quiz': return FileQuestion;
      case 'practice': return CheckCircle2;
      case 'document': return FileText;
      default: return Play;
    }
  };

  const Icon = getIcon();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">{lesson.title}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{lesson.duration}분</span>
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {lesson.type === 'video' ? '동영상' : 
                     lesson.type === 'quiz' ? '퀴즈' :
                     lesson.type === 'practice' ? '실습' : '자료'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          {lesson.type === 'video' && renderVideoContent()}
          {lesson.type === 'quiz' && renderQuizContent()}
          {lesson.type === 'practice' && renderPracticeContent()}
          {lesson.type === 'document' && renderDocumentContent()}
        </div>
      </CardContent>
    </Card>
  );
}

export default MultimediaLesson;