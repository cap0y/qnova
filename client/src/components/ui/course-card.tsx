import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Users, Clock, BookOpen } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description?: string;
  category: string;
  type: string;
  level: string;
  credit: number;
  price: string;
  discountPrice?: string;
  duration: number;
  currentStudents: number;
  maxStudents?: number;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const discountRate = course.discountPrice 
    ? Math.round((1 - Number(course.discountPrice) / Number(course.price)) * 100)
    : 0;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'online':
        return '온라인';
      case 'offline':
        return '오프라인';
      case 'blended':
        return '블렌디드';
      default:
        return type;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return '초급';
      case 'intermediate':
        return '중급';
      case 'advanced':
        return '고급';
      default:
        return level;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 course-card group">
      <CardContent className="p-0">
        {/* Course Image */}
        <div className="relative h-48 bg-gradient-to-r from-primary to-secondary overflow-hidden">
          {course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <BookOpen className="h-16 w-16 opacity-50" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col space-y-2">
            <Badge 
              variant={course.type === 'online' ? 'default' : 'secondary'}
              className="bg-white bg-opacity-90 text-gray-800"
            >
              {getTypeLabel(course.type)}
            </Badge>
            {discountRate > 0 && (
              <Badge className="bg-red-500 text-white">
                {discountRate}% 할인
              </Badge>
            )}
          </div>

          {/* Level Badge */}
          <div className="absolute top-4 right-4">
            <Badge variant="outline" className="bg-white bg-opacity-90 text-gray-800">
              {getLevelLabel(course.level)}
            </Badge>
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6">
          {/* Category */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
            <div className="flex items-center text-yellow-500 text-sm">
              <Star className="h-4 w-4 mr-1 fill-current" />
              <span className="font-medium">4.8</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {course.title}
          </h3>

          {/* Description */}
          {course.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {course.description}
            </p>
          )}

          {/* Course Info */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-primary" />
              <span>{course.duration}시간</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1 text-primary" />
              <span>{course.currentStudents}명</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1 text-primary" />
              <span>{course.credit}학점</span>
            </div>
            <div className="flex items-center">
              <Badge variant="outline" className="text-xs">
                {course.isActive ? '모집중' : '마감'}
              </Badge>
            </div>
          </div>

          {/* Duration */}
          {course.startDate && course.endDate && (
            <div className="text-sm text-gray-500 mb-4">
              {new Date(course.startDate).toLocaleDateString('ko-KR')} - {new Date(course.endDate).toLocaleDateString('ko-KR')}
            </div>
          )}

          {/* Price and Action */}
          <div className="flex justify-between items-center">
            <div className="text-right">
              {course.discountPrice ? (
                <div>
                  <div className="text-sm text-gray-400 line-through">
                    {Number(course.price).toLocaleString()}원
                  </div>
                  <div className="text-lg font-bold text-primary">
                    {Number(course.discountPrice).toLocaleString()}원
                  </div>
                </div>
              ) : (
                <div className="text-lg font-bold text-primary">
                  {Number(course.price).toLocaleString()}원
                </div>
              )}
            </div>
            
            <Link href={`/courses/${course.id}`}>
              <Button 
                size="sm" 
                className="bg-primary hover:bg-blue-700 text-white"
                disabled={!course.isActive}
              >
                {course.isActive ? '자세히 보기' : '마감됨'}
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
