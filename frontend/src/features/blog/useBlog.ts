import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blogApi } from './blog.api'
import type {
  CreatePostRequest,
  UpdatePostRequest,
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
} from './blog.types'

export const BLOG_CATEGORIES_KEY = ['blog-categories'] as const
export const BLOG_POSTS_KEY = ['blog-posts'] as const
export const BLOG_ADMIN_POSTS_KEY = ['blog-admin-posts'] as const

// Public Queries
export function useBlogCategories() {
  return useQuery({
    queryKey: BLOG_CATEGORIES_KEY,
    queryFn: () => blogApi.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useBlogPosts(params?: { categoryId?: number; categorySlug?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...BLOG_POSTS_KEY, params],
    queryFn: () => blogApi.getPosts(params),
  })
}

export function useBlogPostDetail(slug: string) {
  return useQuery({
    queryKey: [...BLOG_POSTS_KEY, 'detail', slug],
    queryFn: () => blogApi.getPostDetail(slug),
    enabled: !!slug,
  })
}

// Admin / Teacher Management Queries & Mutations
export function useAdminBlogPosts(params?: { search?: string; categoryId?: number; isPublished?: boolean; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: [...BLOG_ADMIN_POSTS_KEY, params],
    queryFn: () => blogApi.getAdminPosts(params),
  })
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreatePostRequest) => blogApi.createPost(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_ADMIN_POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_KEY })
    },
  })
}

export function useUpdateBlogPost(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: UpdatePostRequest) => blogApi.updatePost(id, body),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BLOG_ADMIN_POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: [...BLOG_POSTS_KEY, 'detail', data.slug] })
    },
  })
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => blogApi.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_ADMIN_POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_KEY })
    },
  })
}

export function useCreateBlogCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateBlogCategoryRequest) => blogApi.createCategory(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY })
    },
  })
}

export function useUpdateBlogCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateBlogCategoryRequest }) => blogApi.updateCategory(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_ADMIN_POSTS_KEY })
    },
  })
}

export function useDeleteBlogCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => blogApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BLOG_CATEGORIES_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_POSTS_KEY })
      queryClient.invalidateQueries({ queryKey: BLOG_ADMIN_POSTS_KEY })
    },
  })
}
