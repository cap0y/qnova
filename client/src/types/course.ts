export interface Course {
  id: string;
  title: string;
  credit: number;
  progress?: number;
  category?: string;
  type: "course" | "seminar" | "overseas";
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface Enrollment {
  id: string;
  status: "enrolled" | "completed" | "cancelled" | "pending";
  course: Course;
  createdAt: string;
  progress: number;
  type: "course" | "seminar" | "overseas";
  subtype?: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  course: Course;
}
