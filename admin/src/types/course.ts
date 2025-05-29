export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  instructorName?: string;
  capacity: number;
  enrolledCount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseRequest {
  name: string;
  code: string;
  description?: string;
  credits: number;
  instructorName?: string;
  capacity: number;
  startDate: string;
  endDate: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  isActive?: boolean;
}

export interface CourseFilters {
  search?: string;
  isActive?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  credits?: number;
}
