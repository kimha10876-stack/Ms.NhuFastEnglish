export interface BlogCategory {
  id: number
  name: string
  slug: string
  sortOrder: number
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  thumbnailUrl?: string
  summary: string
  content: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  viewCount: number
  authorId: string
  authorName: string
  categoryId?: number
  categoryName?: string
  categorySlug?: string
}

export interface CreatePostRequest {
  title: string
  thumbnailUrl?: string
  summary: string
  content: string
  isPublished: boolean
  categoryId?: number
}

export interface UpdatePostRequest {
  title: string
  thumbnailUrl?: string
  summary: string
  content: string
  isPublished: boolean
  categoryId?: number
}

export interface CreateBlogCategoryRequest {
  name: string
  slug?: string
  sortOrder: number
}

export interface UpdateBlogCategoryRequest {
  name: string
  slug?: string
  sortOrder: number
}
