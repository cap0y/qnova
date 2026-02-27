import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Clock, Award, TrendingUp, Play, 
  CheckCircle, Star, Target, Zap 
} from "lucide-react";

interface CourseProgressWidgetProps {
  courseId: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  totalDuration: number; // in minutes
  timeSpent: number; // in minutes
  lastActivity?: Date;
  isActive?: boolean;
  onContinue?: () => void;
}

export default function CourseProgressWidget({
  courseId,
  courseName,
  totalLessons,
  completedLessons,
  totalDuration,
  timeSpent,
  lastActivity,
  isActive = false,
  onContinue
}: CourseProgressWidgetProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const timeProgressPercentage = totalDuration > 0 ? (timeSpent / totalDuration) * 100 : 0;
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progressPercentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [progressPercentage]);

  const getProgressColor = () => {
    if (progressPercentage >= 100) return "from-green-500 to-emerald-600";
    if (progressPercentage >= 75) return "from-blue-500 to-cyan-600";
    if (progressPercentage >= 50) return "from-purple-500 to-pink-600";
    if (progressPercentage >= 25) return "from-orange-500 to-red-600";
    return "from-gray-400 to-gray-500";
  };

  const getStatusBadge = () => {
    if (progressPercentage >= 100) {
      return <Badge className="bg-green-500 text-white"><Award className="h-3 w-3 mr-1" />완료</Badge>;
    }
    if (isActive) {
      return <Badge className="bg-blue-500 text-white"><Play className="h-3 w-3 mr-1" />학습 중</Badge>;
    }
    if (progressPercentage > 0) {
      return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />진행 중</Badge>;
    }
    return <Badge variant="secondary">시작 전</Badge>;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const getLastActivityText = () => {
    if (!lastActivity) return "아직 시작하지 않음";
    
    const now = new Date();
    const diff = now.getTime() - lastActivity.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return "방금 전";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="relative"
    >
      <Card className={`overflow-hidden transition-all duration-300 ${
        isActive 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      }`}>
        {/* Active Indicator */}
        {isActive && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8 }}
          />
        )}

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                {courseName}
              </h3>
              <div className="text-sm text-gray-500">
                {getLastActivityText()}
              </div>
            </div>
            <div className="ml-2">
              {getStatusBadge()}
            </div>
          </div>

          {/* Progress Circle and Stats */}
          <div className="flex items-center space-x-4 mb-4">
            {/* Circular Progress */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 32 32">
                {/* Background Circle */}
                <circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress Circle */}
                <motion.circle
                  cx="16"
                  cy="16"
                  r="14"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-blue-500"
                  strokeLinecap="round"
                  strokeDasharray={87.96}
                  initial={{ strokeDashoffset: 87.96 }}
                  animate={{ strokeDashoffset: 87.96 - (87.96 * animatedProgress) / 100 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gray-900">
                  {Math.round(animatedProgress)}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">강의 진행</span>
                <span className="font-medium">{completedLessons}/{totalLessons}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">학습 시간</span>
                <span className="font-medium">{formatDuration(timeSpent)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">예상 시간</span>
                <span className="font-medium">{formatDuration(totalDuration)}</span>
              </div>
            </div>
          </div>

          {/* Linear Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">전체 진행률</span>
              <span className="text-xs text-gray-600">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="relative">
              <Progress value={progressPercentage} className="h-2" />
              <motion.div
                className={`absolute top-0 left-0 h-2 bg-gradient-to-r ${getProgressColor()} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${animatedProgress}%` }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Achievement Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {progressPercentage >= 25 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                </motion.div>
              )}
              {progressPercentage >= 50 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Target className="h-4 w-4 text-blue-500" />
                </motion.div>
              )}
              {progressPercentage >= 75 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </motion.div>
              )}
              {progressPercentage >= 100 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  <Award className="h-4 w-4 text-purple-500" />
                </motion.div>
              )}
            </div>

            {/* Continue Button */}
            {onContinue && progressPercentage < 100 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                <Play className="h-3 w-3" />
                <span>계속 학습</span>
              </motion.button>
            )}

            {progressPercentage >= 100 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 text-green-600 text-sm font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                <span>완료!</span>
              </motion.div>
            )}
          </div>

          {/* Real-time Activity Pulse */}
          {isActive && (
            <motion.div
              className="absolute top-2 right-2"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}