export const courseKeys = {
  all: ["courses"] as const,
  lists: () => [...courseKeys.all, "list"] as const,
  list: (filters: { status?: string }) =>
    [...courseKeys.lists(), filters] as const,
  details: () => [...courseKeys.all, "detail"] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  pages: (courseId: string) =>
    [...courseKeys.detail(courseId), "pages"] as const,
  page: (courseId: string, pageId: string) =>
    [...courseKeys.pages(courseId), pageId] as const,
  progress: (courseId: string) =>
    [...courseKeys.detail(courseId), "progress"] as const,
  adminList: () => [...courseKeys.all, "admin-list"] as const,
  responses: (courseId: string) =>
    [...courseKeys.detail(courseId), "responses"] as const,
};

export const yogaKeys = {
  all: ["yoga"] as const,
  profile: () => [...yogaKeys.all, "profile"] as const,
  recommendations: () => [...yogaKeys.all, "recommendations"] as const,
  courses: () => [...yogaKeys.all, "courses"] as const,
  courseList: (filters?: Record<string, unknown>) =>
    [...yogaKeys.courses(), "list", filters] as const,
  courseDetail: (id: string) =>
    [...yogaKeys.courses(), "detail", id] as const,
  courseProgress: (courseId: string) =>
    [...yogaKeys.courses(), "progress", courseId] as const,
  feedback: (courseId: string, week: number) =>
    [...yogaKeys.courses(), "feedback", courseId, week] as const,
  liveSessions: (courseId: string) =>
    [...yogaKeys.courses(), "live-sessions", courseId] as const,
  enrollments: () => [...yogaKeys.all, "enrollments"] as const,
  adminCourses: () => [...yogaKeys.all, "admin-courses"] as const,
  adminCourseList: (filters?: Record<string, unknown>) =>
    [...yogaKeys.adminCourses(), "list", filters] as const,
  adminCourseDetail: (id: string) =>
    [...yogaKeys.adminCourses(), "detail", id] as const,
  elements: () => [...yogaKeys.all, "elements"] as const,
  adminProfiles: () => [...yogaKeys.all, "admin-profiles"] as const,
};

export const habitKeys = {
  all: ["habits"] as const,
  list: () => [...habitKeys.all, "list"] as const,
  detail: (id: string) => [...habitKeys.all, "detail", id] as const,
  checkins: (id: string) => [...habitKeys.all, "checkins", id] as const,
  stats: (id: string) => [...habitKeys.all, "stats", id] as const,
};
