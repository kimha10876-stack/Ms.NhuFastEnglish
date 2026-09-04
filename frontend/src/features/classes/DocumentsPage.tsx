import { useState, useEffect } from 'react'
import {
  Folder, FileText, ExternalLink, Trash2, Upload, Link2, Info, LayoutGrid, List,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useAuthStore } from '@/features/auth/auth.store'
import { useClasses, useAllDocuments, useCreateGlobalDocument, useDeleteGlobalDocument } from './useClasses'
import { classesApi } from './classes.api'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { ClassSession } from './classes.types'
import { cn } from '@/shared/utils/cn'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { toast } from '@/shared/utils/toast'
import { getApiErrorMessage } from '@/shared/utils/upload'
import {
  ScrollablePageLayout,
  PageHeader,
  EmptyState,
  LoadingState,
  SearchInput,
  Pagination,
  DataTable,
  type DataTableColumn,
} from '@/shared/components'
import {
  AddGlobalDocumentModal,
  GoogleDriveIcon,
  type DocumentAddMode,
} from './components/documents/AddGlobalDocumentModal'

type DocumentViewMode = 'card' | 'list'

type DocumentItem = {
  id: string
  title: string
  fileUrl: string
  fileType: string
  fileSizeKb: number
  uploadedBy: string
  uploadedByName: string
  createdAt: string
  className?: string
  sessionTopic?: string | null
  sessionNumber?: number | null
}

export default function DocumentsPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.roles.includes('Admin') ?? false
  const isTeacher = user?.roles.includes('Teacher') ?? false
  const isStudent = user?.roles.includes('Student') ?? false
  const isStaff = isAdmin || isTeacher

  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')
  const [viewMode, setViewMode] = useState<DocumentViewMode>('card')

  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  const { data: documents = [], isLoading: loadingDocs, refetch: refetchDocs } = useAllDocuments({
    search: searchQuery,
  })

  const createDocMutation = useCreateGlobalDocument()
  const deleteDocMutation = useDeleteGlobalDocument()
  const { ask, close, setLoading, confirmDialog } = useConfirmDialog()

  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalMode, setAddModalMode] = useState<DocumentAddMode>('upload')
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('')
  const [docForm, setDocForm] = useState({
    title: '',
    fileUrl: '',
    fileType: 'drive',
    fileSizeKb: 0,
  })
  const [shareClassIds, setShareClassIds] = useState<string[]>([])
  const resetDocForm = () => {
    setSelectedClassId('')
    setSelectedSessionId('')
    setShareClassIds([])
    setDocForm({
      title: '',
      fileUrl: '',
      fileType: 'drive',
      fileSizeKb: 0,
    })
  }

  const openAddModal = (mode: DocumentAddMode) => {
    resetDocForm()
    setAddModalMode(mode)
    setShowAddModal(true)
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    resetDocForm()
  }

  const { data: classesData } = useClasses({
    status: 'active',
    pageSize: 100,
  })
  const staffClasses = classesData?.items ?? []

  const { data: studentClassesData } = useQuery<any[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<any[]>>('/classes/my-classes').then((r) => r.data.data!),
    enabled: isStudent,
  })
  const studentActiveClasses = (studentClassesData ?? []).filter((cls) => cls.status === 'active')

  const availableClassesForUpload = isStudent ? studentActiveClasses : staffClasses

  const normalizedClasses = availableClassesForUpload.map((c: any) => ({
    id: c.classId || c.id,
    name: c.className || c.name,
  }))

  const [sessions, setSessions] = useState<ClassSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    if (!selectedClassId) {
      setSessions([])
      setSelectedSessionId('')
      return
    }

    setLoadingSessions(true)
    classesApi.getSessions(selectedClassId)
      .then((res) => {
        setSessions(res.sessions ?? [])
      })
      .catch((err) => {
        console.error('Error fetching sessions', err)
      })
      .finally(() => {
        setLoadingSessions(false)
      })
  }, [selectedClassId])

  useEffect(() => {
    if (docForm.fileUrl.includes('drive.google.com')) {
      setDocForm((prev) => ({ ...prev, fileType: 'drive' }))
    } else if (docForm.fileUrl) {
      const ext = docForm.fileUrl.split('.').pop()?.toLowerCase() || ''
      if (ext === 'pdf') {
        setDocForm((prev) => ({ ...prev, fileType: 'pdf' }))
      } else if (['doc', 'docx'].includes(ext)) {
        setDocForm((prev) => ({ ...prev, fileType: 'word' }))
      } else if (['ppt', 'pptx'].includes(ext)) {
        setDocForm((prev) => ({ ...prev, fileType: 'ppt' }))
      } else {
        setDocForm((prev) => ({ ...prev, fileType: 'other' }))
      }
    }
  }, [docForm.fileUrl])

  const filteredDocs = documents.filter((doc) => {
    if (fileTypeFilter === 'all') return true
    if (fileTypeFilter === 'drive') return doc.fileType === 'drive' || doc.fileUrl.includes('drive.google.com')
    if (fileTypeFilter === 'pdf') return doc.fileType === 'pdf'
    if (fileTypeFilter === 'word') return doc.fileType === 'word'
    if (fileTypeFilter === 'ppt') return doc.fileType === 'ppt'
    return doc.fileType === 'other'
  })

  const totalCount = filteredDocs.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const activePage = Math.min(currentPage, totalPages)
  const paginatedDocs = filteredDocs.slice((activePage - 1) * pageSize, activePage * pageSize)

  const totalDocsCount = documents.length
  const googleDriveCount = documents.filter((d) => d.fileType === 'drive' || d.fileUrl.includes('drive.google.com')).length
  const pdfCount = documents.filter((d) => d.fileType === 'pdf').length
  const otherCount = totalDocsCount - googleDriveCount - pdfCount

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId) {
      toast.error('Vui lòng chọn lớp học!')
      return
    }
    if (!docForm.fileUrl) {
      toast.error(addModalMode === 'upload' ? 'Vui lòng chọn file tài liệu!' : 'Vui lòng nhập đường dẫn Google Drive!')
      return
    }

    createDocMutation.mutate(
      {
        classId: selectedClassId,
        body: {
          title: docForm.title,
          fileUrl: docForm.fileUrl,
          fileType: docForm.fileType,
          fileSizeKb: docForm.fileSizeKb || 0,
          sessionId: selectedSessionId || undefined,
          shareClassIds: shareClassIds.length > 0 ? shareClassIds : undefined,
        },
      },
      {
        onSuccess: () => {
          handleCloseAddModal()
          refetchDocs()
          toast.success('Tải lên tài liệu thành công')
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Thêm tài liệu thất bại'))
        },
      }
    )
  }

  const handleDeleteDoc = (doc: DocumentItem) => {
    ask({
      title: 'Xóa tài liệu',
      description: (
        <>
          Bạn có chắc chắn muốn xóa tài liệu{' '}
          <strong className="text-foreground">{doc.title}</strong>? Hành động này không thể hoàn tác.
        </>
      ),
      confirmLabel: 'Xóa tài liệu',
      cancelLabel: 'Huỷ',
      onConfirm: () => {
        setLoading(true)
        deleteDocMutation.mutate(doc.id, {
          onSuccess: () => {
            toast.success('Xóa tài liệu thành công')
            close()
            refetchDocs()
          },
          onError: (err) => {
            toast.error(getApiErrorMessage(err, 'Xóa tài liệu thất bại'))
          },
          onSettled: () => setLoading(false),
        })
      },
    })
  }

  const getFileIcon = (fileType: string, url: string) => {
    const isDrive = fileType === 'drive' || url.includes('drive.google.com')
    if (isDrive) {
      return <GoogleDriveIcon className="h-9 w-9 shrink-0" />
    }

    if (fileType === 'pdf') {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-red-100 bg-red-50 text-red-500 shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
      )
    }

    if (fileType === 'word') {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-blue-100 bg-blue-50 text-blue-500 shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
      )
    }

    if (fileType === 'ppt') {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-primary-100 bg-primary-50 text-primary-500 shadow-sm">
          <FileText className="h-5 w-5" />
        </div>
      )
    }

    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-muted text-muted-foreground shadow-sm">
        <Link2 className="h-5 w-5" />
      </div>
    )
  }

  const getFileBadge = (fileType: string, url: string) => {
    const isDrive = fileType === 'drive' || url.includes('drive.google.com')
    if (isDrive) {
      return <span className="rounded border border-primary-200 bg-primary-50 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary-700">Drive Link</span>
    }
    if (fileType === 'pdf') {
      return <span className="rounded border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-red-600">PDF File</span>
    }
    if (fileType === 'word') {
      return <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-blue-600">Word</span>
    }
    if (fileType === 'ppt') {
      return <span className="rounded border border-primary-100 bg-primary-50 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-primary-600">PowerPoint</span>
    }
    return <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Link ngoài</span>
  }

  const documentTableColumns: DataTableColumn<DocumentItem>[] = [
    {
      key: 'title',
      header: 'Tài liệu',
      className: 'px-4 py-3',
      headerClassName: 'px-4 py-2.5',
      render: (doc) => (
        <div className="flex min-w-0 items-center gap-2.5">
          {getFileIcon(doc.fileType, doc.fileUrl)}
          <div className="min-w-0">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary-600"
              title={doc.title}
            >
              {doc.title}
            </a>
            {doc.fileSizeKb > 0 && (
              <p className="text-xs text-muted-foreground">{doc.fileSizeKb.toLocaleString('vi-VN')} KB</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'fileType',
      header: 'Định dạng',
      className: 'whitespace-nowrap px-4 py-3',
      headerClassName: 'px-4 py-2.5',
      render: (doc) => getFileBadge(doc.fileType, doc.fileUrl),
    },
    {
      key: 'className',
      header: 'Lớp học',
      className: 'px-4 py-3 text-sm text-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (doc) => doc.className || 'Tài liệu chung',
    },
    {
      key: 'session',
      header: 'Buổi học',
      className: 'max-w-[180px] px-4 py-3 text-xs text-muted-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (doc) =>
        doc.sessionTopic
          ? `Unit ${doc.sessionNumber}: ${doc.sessionTopic}`
          : 'Tài liệu chung',
    },
    {
      key: 'uploader',
      header: 'Người đăng',
      className: 'whitespace-nowrap px-4 py-3 text-xs text-muted-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (doc) => doc.uploadedByName || 'Giáo viên',
    },
    {
      key: 'createdAt',
      header: 'Ngày đăng',
      className: 'whitespace-nowrap px-4 py-3 text-xs text-muted-foreground',
      headerClassName: 'px-4 py-2.5',
      render: (doc) =>
        new Date(doc.createdAt).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      className: 'px-4 py-3 text-right',
      headerClassName: 'px-4 py-2.5 text-right',
      render: (doc) => (
        <div className="flex justify-end gap-1">
          <a
            href={doc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded p-1.5 text-muted-foreground transition-all hover:bg-primary-50 hover:text-primary-600"
            title="Mở tài liệu"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          {isStaff && (isAdmin || user?.id === doc.uploadedBy) && (
            <button
              type="button"
              onClick={() => handleDeleteDoc(doc)}
              className="rounded p-1.5 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500"
              title="Xóa tài liệu"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  const renderDocumentCard = (doc: DocumentItem) => {
    const uploaderName = doc.uploadedByName || 'Giáo viên'
    const displayDate = new Date(doc.createdAt).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

    return (
      <div
        key={doc.id}
        className="group flex flex-col justify-between rounded border border-border bg-background p-4 shadow-sm transition-all hover:border-primary-400/50 hover:shadow-md"
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-2.5">
              {getFileIcon(doc.fileType, doc.fileUrl)}
              <div className="min-w-0 text-left">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 text-xs font-bold leading-relaxed text-foreground transition-colors hover:text-primary-600"
                  title={doc.title}
                >
                  {doc.title}
                </a>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">
                  Người đăng: <span className="font-bold text-muted-foreground">{uploaderName}</span> • {displayDate}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {getFileBadge(doc.fileType, doc.fileUrl)}
            {doc.fileSizeKb > 0 && (
              <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-bold text-muted-foreground">
                {doc.fileSizeKb.toLocaleString('vi-VN')} KB
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs font-semibold text-muted-foreground">
          <div className="min-w-0 flex-1 pr-2 text-left">
            <p className="truncate font-bold text-ink-900">Lớp: {doc.className || 'Tài liệu chung'}</p>
            {doc.sessionTopic ? (
              <p className="mt-0.5 truncate font-medium text-muted-foreground">
                Unit {doc.sessionNumber}: {doc.sessionTopic}
              </p>
            ) : (
              <p className="mt-0.5 truncate font-medium text-muted-foreground">Tài liệu học tập chung</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded p-1.5 text-muted-foreground transition-all hover:bg-primary-50 hover:text-primary-600"
              title="Mở tài liệu / Tải xuống"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            {isStaff && (isAdmin || user?.id === doc.uploadedBy) && (
              <button
                type="button"
                onClick={() => handleDeleteDoc(doc)}
                className="rounded p-1.5 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500"
                title="Xóa tài liệu"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <ScrollablePageLayout
      header={
        <>
          <PageHeader
            eyebrow="Tài nguyên học tập"
            title={isStaff ? 'Kho tài liệu tập trung' : 'Tài liệu học tập của tôi'}
            icon={Folder}
            actions={
              isStaff ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={() => openAddModal('upload')}
                    className="h-9 gap-1.5 rounded bg-primary-500 text-xs font-bold text-ink-900 shadow-sm hover:bg-primary-600"
                  >
                    <Upload className="h-4 w-4" />
                    Tải lên tài liệu
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => openAddModal('drive')}
                    className="h-9 gap-1.5 rounded border-border bg-background text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <GoogleDriveIcon className="h-4 w-4 shrink-0" />
                    Kết nối Google Drive
                  </Button>
                </div>
              ) : undefined
            }
          />

          {documents.length > 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded border border-border bg-background p-4 text-left shadow-sm transition-all hover:border-gray-300">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tất cả tài liệu</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900">{totalDocsCount}</p>
              </div>
              <div className="flex items-center justify-between rounded border border-primary-200/50 bg-primary-50/30 p-4 text-left shadow-sm transition-all hover:border-primary-200">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-800">Liên kết Google Drive</p>
                  <p className="mt-1 text-2xl font-extrabold text-primary-900">{googleDriveCount}</p>
                </div>
                <GoogleDriveIcon className="h-9 w-9 shrink-0" />
              </div>
              <div className="rounded border border-border bg-background p-4 text-left shadow-sm transition-all hover:border-gray-300">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tài liệu PDF / Định dạng khác</p>
                <p className="mt-1 text-2xl font-extrabold text-ink-900">{pdfCount + otherCount}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 rounded border border-border bg-background p-4 shadow-sm xl:flex-row xl:items-center">
            <div className="min-w-0 flex-1">
              <SearchInput
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                onClear={() => setSearchQuery('')}
                placeholder="Tìm kiếm tài liệu học tập theo tên..."
              />
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <div className="flex items-center rounded border border-border bg-muted p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded transition-colors',
                    viewMode === 'card'
                      ? 'bg-background text-ink-900 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label="Xem dạng thẻ"
                  title="Xem dạng thẻ"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded transition-colors',
                    viewMode === 'list'
                      ? 'bg-background text-ink-900 shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label="Xem dạng bảng"
                  title="Xem dạng bảng"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <div className="w-44 shrink-0 sm:w-56">
                <CustomDropdown
                  value={fileTypeFilter}
                  options={[
                    { id: 'all', name: 'Tất cả định dạng' },
                    { id: 'drive', name: 'Google Drive Link' },
                    { id: 'pdf', name: 'Tài liệu PDF (.pdf)' },
                    { id: 'word', name: 'Tài liệu Word' },
                    { id: 'ppt', name: 'Tài liệu PowerPoint' },
                    { id: 'other', name: 'Định dạng khác' },
                  ]}
                  onChange={(val) => {
                    setFileTypeFilter(val)
                    setCurrentPage(1)
                  }}
                  placeholder="Định dạng tệp"
                />
              </div>
            </div>
          </div>
        </>
      }
    >
      {loadingDocs ? (
        <LoadingState variant={viewMode === 'card' ? 'skeleton-cards' : 'skeleton-table'} rows={6} />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Chưa có tài liệu nào"
          description={
            isStaff
              ? 'Hệ thống chưa ghi nhận tài liệu học tập nào được đưa lên. Vui lòng bấm "Tải lên tài liệu" hoặc "Kết nối Google Drive" để bắt đầu.'
              : 'Lớp học của bạn hiện tại chưa được giảng viên đính kèm tài liệu học nào.'
          }
        />
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={Info}
          title="Không tìm thấy tài liệu phù hợp"
          description="Không tìm thấy tài liệu phù hợp với điều kiện lọc."
        />
      ) : (
        <div className="space-y-6">
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 animate-in fade-in duration-200">
              {paginatedDocs.map((doc) => renderDocumentCard(doc as DocumentItem))}
            </div>
          ) : (
            <DataTable
              columns={documentTableColumns}
              data={paginatedDocs as DocumentItem[]}
              keyExtractor={(doc) => doc.id}
            />
          )}

          <Pagination
            page={activePage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            itemLabel="tài liệu"
            bordered
          />
        </div>
      )}

    </ScrollablePageLayout>

      <AddGlobalDocumentModal
        show={showAddModal}
        mode={addModalMode}
        onClose={handleCloseAddModal}
        selectedClassId={selectedClassId}
        setSelectedClassId={setSelectedClassId}
        selectedSessionId={selectedSessionId}
        setSelectedSessionId={setSelectedSessionId}
        docForm={docForm}
        setDocForm={setDocForm}
        shareClassIds={shareClassIds}
        setShareClassIds={setShareClassIds}
        normalizedClasses={normalizedClasses}
        sessions={sessions}
        loadingSessions={loadingSessions}
        isStaff={isStaff}
        staffClasses={staffClasses}
        onSave={handleSaveDoc}
        isPending={createDocMutation.isPending}
      />
      {confirmDialog}
    </>
  )
}
