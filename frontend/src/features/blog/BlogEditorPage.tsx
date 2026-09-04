import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadingState } from '@/shared/components'
import { toast } from '@/shared/utils/toast'
import { getApiErrorMessage } from '@/shared/utils/upload'
import {
  useAdminBlogPostDetail,
  useCreateBlogPost,
  useUpdateBlogPost,
  useBlogCategories,
} from './useBlog'
import { htmlToBlocks, blocksToHtml } from './utils/blockConverter'
import { useBlockEditor } from './hooks/useBlockEditor'
import {
  EditorToolbar,
  BlockEditor,
  PostSettingsPanel,
  BlogPostPreview,
} from './components/editor'

export default function BlogEditorPage() {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [title, setTitle] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [summary, setSummary] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [categoryId, setCategoryId] = useState<number | ''>('')

  const {
    blocks,
    setBlocks,
    addBlock,
    updateBlockContent,
    updateBlockAlign,
    changeBlockType,
    deleteBlock,
    moveBlock,
  } = useBlockEditor()

  const { data: categories = [] } = useBlogCategories()
  const { data: post, isLoading: loadingPost } = useAdminBlogPostDetail(id)

  const createPostMutation = useCreateBlogPost()
  const updatePostMutation = useUpdateBlogPost(id)

  useEffect(() => {
    if (post && isEdit) {
      setTitle(post.title)
      setThumbnailUrl(post.thumbnailUrl || '')
      setSummary(post.summary)
      setIsPublished(post.isPublished)
      setCategoryId(post.categoryId ?? '')
      setBlocks(htmlToBlocks(post.content))
    }
  }, [post, isEdit, setBlocks])

  const handleSave = () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài viết!')
      return
    }
    if (!summary.trim()) {
      toast.error('Vui lòng nhập tóm tắt bài viết!')
      return
    }

    const htmlContent = blocksToHtml(blocks)
    if (!htmlContent.trim()) {
      toast.error('Nội dung bài viết không được để trống!')
      return
    }

    const payload = {
      title: title.trim(),
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      summary: summary.trim(),
      content: htmlContent,
      isPublished,
      categoryId: categoryId === '' ? undefined : Number(categoryId),
    }

    const callbacks = {
      onSuccess: () => {
        toast.success(isEdit ? 'Cập nhật bài viết thành công' : 'Tạo bài viết thành công')
        navigate('/blog-management')
      },
      onError: (err: unknown) => {
        toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi lưu bài viết!'))
      },
    }

    if (isEdit) {
      updatePostMutation.mutate(payload, callbacks)
    } else {
      createPostMutation.mutate(payload, callbacks)
    }
  }

  if (isEdit && loadingPost) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted">
        <LoadingState variant="spinner" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh select-none flex-col bg-muted font-sans">
      <EditorToolbar
        isEdit={isEdit}
        activeTab={activeTab}
        isPublished={isPublished}
        isSaving={createPostMutation.isPending || updatePostMutation.isPending}
        onTabChange={setActiveTab}
        onPublishChange={setIsPublished}
        onSave={handleSave}
      />

      <div className="flex flex-1 overflow-hidden">
        {activeTab === 'editor' ? (
          <>
            <BlockEditor
              title={title}
              blocks={blocks}
              onTitleChange={setTitle}
              onAddBlock={addBlock}
              onMoveBlock={moveBlock}
              onChangeBlockType={changeBlockType}
              onChangeBlockAlign={updateBlockAlign}
              onChangeBlockContent={updateBlockContent}
              onDeleteBlock={deleteBlock}
            />
            <PostSettingsPanel
              isEdit={isEdit}
              postId={id}
              thumbnailUrl={thumbnailUrl}
              summary={summary}
              categoryId={categoryId}
              isPublished={isPublished}
              categories={categories}
              onThumbnailChange={setThumbnailUrl}
              onSummaryChange={setSummary}
              onCategoryChange={setCategoryId}
            />
          </>
        ) : (
          <BlogPostPreview
            title={title}
            summary={summary}
            thumbnailUrl={thumbnailUrl}
            contentHtml={blocksToHtml(blocks)}
            categoryId={categoryId}
            categories={categories}
            authorName={post?.authorName}
            viewCount={post?.viewCount}
          />
        )}
      </div>
    </div>
  )
}
