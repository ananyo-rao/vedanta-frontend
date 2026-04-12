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
