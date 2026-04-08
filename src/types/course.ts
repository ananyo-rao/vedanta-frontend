export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  course_type: string;
  teacher_name: string | null;
  status: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}
