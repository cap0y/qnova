import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, Pause, CheckCircle, Clock, BookOpen, Video, FileText, 
  Award, Star, TrendingUp, Target, Zap, RotateCcw
} from "lucide-react";

interface LessonProgress {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration: number; // in minutes
  completed: boolean;
  progress: number; // 0-100
  score?: number;
  timeSpent: number; // in minutes
}

interface LearningProgressTrackerProps {
  courseId: string;
  lessons: LessonProgress[];
  totalDuration: number;
  onProgressUpdate?: (lessonId: string, progress: number) => void;
  onLessonComplete?: (lessonId: string, score?: number) => void;
}

export default function LearningProgressTracker({
  courseId,
  lessons,
  totalDuration,
  onProgressUpdate,
  onLessonComplete
}: LearningProgressTrackerProps) {
  const [currentLesson, setCurrentLesson] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [realTimeProgress, setRealTimeProgress] = useState<Record<string, number>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [streakCount, setStreakCount] = useState(0);

  // Calculate overall progress
  const overallProgress = lessons.length > 0 
    ? (lessons.reduce((sum, lesson) => sum + lesson.progress, 0) / lessons.length)
    : 0;

  const completedLessons = lessons.filter(lesson => lesson.completed).length;
  const totalTimeSpent = lessons.reduce((sum, lesson) => sum + lesson.timeSpent, 0);

  // Simulate real-time progress updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentLesson) {
      interval = setInterval(() => {
        setRealTimeProgress(prev => {
          const current = prev[currentLesson] || 0;
          const newProgress = Math.min(current + 0.5, 100);
          
          // Update parent component
          if (onProgressUpdate) {
            onProgressUpdate(currentLesson, newProgress);
          }
          
          // Check for completion
          if (newProgress >= 100 && current < 100) {
            handleLessonComplete(currentLesson);
          }
          
          return {
            ...prev,
            [currentLesson]: newProgress
          };
        });
      }, 1000); // Update every second
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentLesson, onProgressUpdate]);

  const handleLessonComplete = (lessonId: string) => {
    setShowCelebration(true);
    setStreakCount(prev => prev + 1);
    
    if (onLessonComplete) {
      onLessonComplete(lessonId, 95); // Mock score
    }
    
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const startLesson = (lessonId: string) => {
    setCurrentLesson(lessonId);
    setIsPlaying(true);
  };

  const pauseLesson = () => {
    setIsPlaying(false);
  };

  const resumeLesson = () => {
    setIsPlaying(true);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'reading': return BookOpen;
      case 'quiz': return FileText;
      case 'assignment': return Award;
      default: return BookOpen;
    }
  };

  const getLessonColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-blue-500';
      case 'reading': return 'bg-green-500';
      case 'quiz': return 'bg-purple-500';
      case 'assignment': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <Card className="p-6 bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-2xl">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: 2 }}
                  className="w-16 h-16 mx-auto mb-4"
                >
                  <CheckCircle className="w-full h-full" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">축하합니다! 🎉</h3>
                <p className="text-lg">강의를 완료했습니다!</p>
                <Badge className="mt-2 bg-white text-blue-600">
                  연속 {streakCount}개 완료
                </Badge>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Progress Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>학습 진행 현황</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
                className="text-3xl font-bold text-blue-600 mb-1"
              >
                {Math.round(overallProgress)}%
              </motion.div>
              <div className="text-sm text-gray-600">전체 진행률</div>
            </div>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
                className="text-3xl font-bold text-green-600 mb-1"
              >
                {completedLessons}
              </motion.div>
              <div className="text-sm text-gray-600">완료한 강의</div>
            </div>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
                className="text-3xl font-bold text-purple-600 mb-1"
              >
                {Math.round(totalTimeSpent)}
              </motion.div>
              <div className="text-sm text-gray-600">학습 시간 (분)</div>
            </div>
            
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
                className="text-3xl font-bold text-orange-600 mb-1"
              >
                {streakCount}
              </motion.div>
              <div className="text-sm text-gray-600">연속 완료</div>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">전체 진행률</span>
              <span className="text-sm text-gray-500">{completedLessons}/{lessons.length} 강의</span>
            </div>
            <div className="relative">
              <Progress value={overallProgress} className="h-3" />
              <motion.div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="flex flex-wrap gap-2">
            {overallProgress >= 25 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Badge className="bg-bronze text-white">
                  <Star className="h-3 w-3 mr-1" />
                  시작자
                </Badge>
              </motion.div>
            )}
            {overallProgress >= 50 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Badge className="bg-silver text-white">
                  <Target className="h-3 w-3 mr-1" />
                  중급자
                </Badge>
              </motion.div>
            )}
            {overallProgress >= 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 }}
              >
                <Badge className="bg-gold text-white">
                  <Award className="h-3 w-3 mr-1" />
                  완주자
                </Badge>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lessons Progress List */}
      <Card>
        <CardHeader>
          <CardTitle>강의별 진행 상황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lessons.map((lesson, index) => {
              const LessonIcon = getLessonIcon(lesson.type);
              const currentProgress = realTimeProgress[lesson.id] ?? lesson.progress;
              const isCurrentLesson = currentLesson === lesson.id;
              
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    isCurrentLesson 
                      ? 'border-blue-500 bg-blue-50' 
                      : lesson.completed 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${getLessonColor(lesson.type)} rounded-full flex items-center justify-center`}>
                        <LessonIcon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.duration}분</span>
                          {lesson.completed && lesson.score && (
                            <>
                              <span>•</span>
                              <span className="text-green-600">점수: {lesson.score}%</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {lesson.completed ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-6 w-6" />
                        </motion.div>
                      ) : isCurrentLesson ? (
                        <Button
                          size="sm"
                          variant={isPlaying ? "secondary" : "default"}
                          onClick={isPlaying ? pauseLesson : resumeLesson}
                        >
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startLesson(lesson.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Current/In-Progress Lessons */}
                  {(currentProgress > 0 || isCurrentLesson) && (
                    <div className="mt-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">진행률</span>
                        <span className="text-xs text-gray-600">{Math.round(currentProgress)}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={currentProgress} className="h-2" />
                        {isCurrentLesson && isPlaying && (
                          <motion.div
                            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                            animate={{ 
                              width: `${currentProgress}%`,
                              opacity: [1, 0.7, 1]
                            }}
                            transition={{ 
                              width: { duration: 0.5 },
                              opacity: { duration: 1, repeat: Infinity }
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Real-time Activity Indicator */}
                  {isCurrentLesson && isPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 mt-2 text-sm text-blue-600"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="h-4 w-4" />
                      </motion.div>
                      <span>학습 중...</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Study Session Timer */}
      {currentLesson && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-4 right-4 z-40"
        >
          <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
            <div className="text-center">
              <div className="text-sm font-medium mb-1">현재 학습 중</div>
              <div className="text-lg font-bold">
                {lessons.find(l => l.id === currentLesson)?.title}
              </div>
              <div className="text-sm opacity-90 mt-1">
                {isPlaying ? "진행 중" : "일시정지"}
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}