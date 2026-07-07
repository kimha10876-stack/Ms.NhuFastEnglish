import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { PaginatedResponse } from '@/features/classes/classes.types'
import type {
  BlogCategory,
  BlogPost,
  CreatePostRequest,
  UpdatePostRequest,
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
} from './blog.types'

export const blogApi = {
  // Public
  getCategories: () =>
    api.get<ApiResponse<BlogCategory[]>>('/blog/categories').then((r) => r.data.data!),

  getPosts: (params?: { categoryId?: number; categorySlug?: string; page?: number; pageSize?: number }) =>
    api
      .get<ApiResponse<PaginatedResponse<BlogPost>>>('/blog/posts', { params })
      .then((r) => r.data.data!),

  getPostDetail: (slug: string) =>
    api.get<ApiResponse<BlogPost>>(`/blog/posts/${slug}`).then((r) => r.data.data!),

  // Admin / Teacher Management
  getAdminPosts: (params?: { search?: string; categoryId?: number; isPublished?: boolean; page?: number; pageSize?: number }) =>
    api
      .get<ApiResponse<PaginatedResponse<BlogPost>>>('/blog/admin/posts', { params })
      .then((r) => r.data.data!),

  createPost: (body: CreatePostRequest) =>
    api.post<ApiResponse<BlogPost>>('/blog/admin/posts', body).then((r) => r.data.data!),

  updatePost: (id: string, body: UpdatePostRequest) =>
    api.put<ApiResponse<BlogPost>>(`/blog/admin/posts/${id}`, body).then((r) => r.data.data!),

  deletePost: (id: string) =>
    api.delete<ApiResponse<null>>(`/blog/admin/posts/${id}`).then((r) => r.data),

  createCategory: (body: CreateBlogCategoryRequest) =>
    api.post<ApiResponse<BlogCategory>>('/blog/admin/categories', body).then((r) => r.data.data!),

  updateCategory: (id: number, body: UpdateBlogCategoryRequest) =>
    api.put<ApiResponse<BlogCategory>>(`/blog/admin/categories/${id}`, body).then((r) => r.data.data!),

  deleteCategory: (id: number) =>
    api.delete<ApiResponse<null>>(`/blog/admin/categories/${id}`).then((r) => r.data),
}
