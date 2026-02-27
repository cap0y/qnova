import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Star, Clock, Award } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor?: string;
  duration?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  rating?: number;
  students?: number;
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  // 실제 업로드된 이미지가 있으면 사용하고, 없으면 기본 이미지 사용
  const getImageUrl = () => {
    // DB에서 실제 이미지 URL이 있고 placeholder가 아닌 경우
    if (course.imageUrl && course.imageUrl !== "/api/placeholder/400/250") {
      return course.imageUrl;
    }
    // 샘플 이미지 중 랜덤 선택
    const sampleImages = [
      "/uploads/images/1.jpg",
      "/uploads/images/4.jpg",
      "/uploads/images/5.jpg",
      "/uploads/images/6.jpg",
      "/uploads/images/12.jpg",
    ];
    return sampleImages[Math.floor(Math.random() * sampleImages.length)];
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={getImageUrl()}
          alt={course.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // 이미지 로드 실패 시 다른 샘플 이미지로 대체
            const fallbackImages = [
              "/uploads/images/1.jpg",
              "/uploads/images/4.jpg",
              "/uploads/images/5.jpg",
              "/uploads/images/6.jpg",
              "/uploads/images/12.jpg",
            ];
            const randomFallback =
              fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
            e.currentTarget.src = randomFallback;
          }}
        />
        {course.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-white/90">
              {course.category}
            </Badge>
          </div>
        )}
        {course.price && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-blue-600 text-white">
              {course.price.toLocaleString()}원
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {course.title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {course.description}
        </p>

        {course.instructor && (
          <p className="text-sm text-gray-500 mb-3">
            강사: {course.instructor}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            {course.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{course.duration}</span>
              </div>
            )}
            {course.students && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{course.students}명</span>
              </div>
            )}
            {course.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{course.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button className="w-full">상세보기</Button>
          </Link>
          <Button variant="outline" size="icon">
            <BookOpen className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
