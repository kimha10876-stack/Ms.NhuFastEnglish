import { useState, useEffect } from 'react'
import {
  Folder, FileText, ExternalLink, Trash2, Search,
  PlusCircle, Link2, Check, ChevronLeft,
  ChevronRight, Loader2, Info
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useAuthStore } from '@/features/auth/auth.store'
import { useClasses, useAllDocuments, useCreateGlobalDocument, useDeleteGlobalDocument } from './useClasses'
import { classesApi } from './classes.api'
import { CustomDropdown } from '@/shared/components/ui/CustomDropdown'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/client'
import type { ApiResponse } from '@/shared/api/types'
import type { ClassSession } from './classes.types'

export default function DocumentsPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.roles.includes('Admin') ?? false
  const isTeacher = user?.roles.includes('Teacher') ?? false
  const isStudent = user?.roles.includes('Student') ?? false
  const isStaff = isAdmin || isTeacher

  const [searchQuery, setSearchQuery] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Fetch all documents
  const { data: documents = [], isLoading: loadingDocs, refetch: refetchDocs } = useAllDocuments({
    search: searchQuery
  })

  // Mutations
  const createDocMutation = useCreateGlobalDocument()
  const deleteDocMutation = useDeleteGlobalDocument()

  // Add Doc Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState('') // empty means general document
  const [docForm, setDocForm] = useState({
    title: '',
    fileUrl: '',
    fileType: 'drive', // defaults to drive
    fileSizeKb: 0
  })
  const [shareClassIds, setShareClassIds] = useState<string[]>([])

  // Fetch active classes for dropdown (Teacher/Admin)
  const { data: classesData } = useClasses({
    status: 'active',
    pageSize: 100
  })
  const staffClasses = classesData?.items ?? []

  // Fetch student classes
  const { data: studentClassesData } = useQuery<any[]>({
    queryKey: ['my-classes'],
    queryFn: () => api.get<ApiResponse<any[]>>('/classes/my-classes').then((r) => r.data.data!),
    enabled: isStudent,
  })
  const studentActiveClasses = (studentClassesData ?? []).filter((cls) => cls.status === 'active')

  const availableClassesForUpload = isStudent ? studentActiveClasses : staffClasses

  const normalizedClasses = availableClassesForUpload.map((c: any) => ({
    id: c.classId || c.id,
    name: c.className || c.name
  }))

  // Fetch sessions dynamically when class is selected in upload modal
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

  // Automatically detect google drive links when fileUrl changes
  useEffect(() => {
    if (docForm.fileUrl.includes('drive.google.com')) {
      setDocForm(prev => ({ ...prev, fileType: 'drive' }))
    } else if (docForm.fileUrl) {
      const ext = docForm.fileUrl.split('.').pop()?.toLowerCase() || ''
      if (ext === 'pdf') {
        setDocForm(prev => ({ ...prev, fileType: 'pdf' }))
      } else if (['doc', 'docx'].includes(ext)) {
        setDocForm(prev => ({ ...prev, fileType: 'word' }))
      } else if (['ppt', 'pptx'].includes(ext)) {
        setDocForm(prev => ({ ...prev, fileType: 'ppt' }))
      } else {
        setDocForm(prev => ({ ...prev, fileType: 'other' }))
      }
    }
  }, [docForm.fileUrl])

  // Filter documents
  const filteredDocs = documents.filter((doc) => {
    if (fileTypeFilter === 'all') return true
    if (fileTypeFilter === 'drive') return doc.fileType === 'drive' || doc.fileUrl.includes('drive.google.com')
    if (fileTypeFilter === 'pdf') return doc.fileType === 'pdf'
    if (fileTypeFilter === 'word') return doc.fileType === 'word'
    if (fileTypeFilter === 'ppt') return doc.fileType === 'ppt'
    return doc.fileType === 'other'
  })

  // Paginated documents
  const totalCount = filteredDocs.length
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  const activePage = Math.min(currentPage, totalPages)
  const paginatedDocs = filteredDocs.slice((activePage - 1) * pageSize, activePage * pageSize)

  // Quick stats
  const totalDocsCount = documents.length
  const googleDriveCount = documents.filter(d => d.fileType === 'drive' || d.fileUrl.includes('drive.google.com')).length
  const pdfCount = documents.filter(d => d.fileType === 'pdf').length
  const otherCount = totalDocsCount - googleDriveCount - pdfCount

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClassId) {
      alert('Vui lòng chọn lớp học!')
      return
    }
    if (!docForm.fileUrl) {
      alert('Vui lòng nhập đường dẫn tài liệu!')
      return
    }

    createDocMutation.mutate({
      classId: selectedClassId,
      body: {
        title: docForm.title,
        fileUrl: docForm.fileUrl,
        fileType: docForm.fileType,
        fileSizeKb: docForm.fileSizeKb || 0,
        sessionId: selectedSessionId || undefined,
        shareClassIds: shareClassIds.length > 0 ? shareClassIds : undefined
      }
    }, {
      onSuccess: () => {
        setShowAddModal(false)
        setSelectedClassId('')
        setSelectedSessionId('')
        setShareClassIds([])
        setDocForm({
          title: '',
          fileUrl: '',
          fileType: 'drive',
          fileSizeKb: 0
        })
        refetchDocs()
      },
      onError: (err) => {
        console.error(err)
        alert('Thêm tài liệu thất bại!')
      }
    })
  }

  const handleDeleteDoc = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return
    deleteDocMutation.mutate(id, {
      onSuccess: () => {
        refetchDocs()
      },
      onError: (err) => {
        console.error(err)
        alert('Xóa tài liệu thất bại!')
      }
    })
  }

  // Google Drive custom brand icon component (looks extremely premium)
  const GoogleDriveIcon = () => (
    <svg className="h-9 w-9 shrink-0" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.6 52.8l13.9-24h53.7l-13.9 24H6.6z" fill="#0066DA"/>
      <path d="M29.5 28.8l13.9-24h43.9l-13.9 24H29.5z" fill="#00AA47"/>
      <path d="M57 28.8L78 65.2H49.9L29 28.8H57z" fill="#FFBA00"/>
    </svg>
  )

  const getFileIcon = (fileType: string, url: string) => {
    const isDrive = fileType === 'drive' || url.includes('drive.google.com')
    if (isDrive) {
      return <GoogleDriveIcon />
    }
    
    if (fileType === 'pdf') {
      return (
        <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 shrink-0 shadow-xs">
          <FileText className="h-5 w-5" />
        </div>
      )
    }

    if (fileType === 'word') {
      return (
        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0 shadow-xs">
          <FileText className="h-5 w-5" />
        </div>
      )
    }

    if (fileType === 'ppt') {
      return (
        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
          <FileText className="h-5 w-5" />
        </div>
      )
    }

    return (
      <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-150 flex items-center justify-center text-gray-500 shrink-0 shadow-xs">
        <Link2 className="h-5 w-5" />
      </div>
    )
  }

  const getFileBadge = (fileType: string, url: string) => {
    const isDrive = fileType === 'drive' || url.includes('drive.google.com')
    if (isDrive) {
      return <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-150 tracking-wider">Drive Link</span>
    }
    if (fileType === 'pdf') {
      return <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-red-50 text-red-600 border border-red-100 tracking-wider">PDF File</span>
    }
    if (fileType === 'word') {
      return <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100 tracking-wider">Word</span>
    }
    if (fileType === 'ppt') {
      return <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-amber-50 text-amber-600 border border-amber-100 tracking-wider">PowerPoint</span>
    }
    return <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-gray-100 text-gray-600 border border-gray-200 tracking-wider">Link ngoài</span>
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 flex-wrap gap-4">
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Tài nguyên học tập</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Folder className="h-6 w-6 text-amber-500" />
            {isStaff ? 'Kho tài liệu tập trung' : 'Tài liệu học tập của tôi'}
          </h1>
        </div>

        {isStaff && (
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-1.5 rounded-xl font-bold text-xs h-9.5 bg-amber-500 hover:bg-amber-600 text-gray-900 shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            Thêm tài liệu Google Drive
          </Button>
        )}
      </div>

      {/* ── Thống kê nhanh ── */}
      {documents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs text-left hover:border-gray-300 transition-all">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tất cả tài liệu</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{totalDocsCount}</p>
          </div>
          <div className="bg-amber-50/30 border border-amber-200/50 rounded-2xl p-4 shadow-xs text-left hover:border-amber-200 transition-all flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Liên kết Google Drive</p>
              <p className="text-2xl font-extrabold text-amber-900 mt-1">{googleDriveCount}</p>
            </div>
            <GoogleDriveIcon />
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs text-left hover:border-gray-300 transition-all">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tài liệu PDF / Định dạng khác</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-1">{pdfCount + otherCount}</p>
          </div>
        </div>
      )}

      {/* ── Thanh tìm kiếm & bộ lọc ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Tìm kiếm tài liệu học tập theo tên..."
            className="pl-9 rounded-xl text-xs h-9.5"
          />
        </div>
        
        <div className="w-full sm:w-56 shrink-0 text-left">
          <CustomDropdown
            value={fileTypeFilter}
            options={[
              { id: 'all', name: 'Tất cả định dạng' },
              { id: 'drive', name: 'Google Drive Link' },
              { id: 'pdf', name: 'Tài liệu PDF (.pdf)' },
              { id: 'word', name: 'Tài liệu Word' },
              { id: 'ppt', name: 'Tài liệu PowerPoint' },
              { id: 'other', name: 'Định dạng khác' }
            ]}
            onChange={(val) => {
              setFileTypeFilter(val)
              setCurrentPage(1)
            }}
            placeholder="Định dạng tệp"
          />
        </div>
      </div>

      {/* ── Danh sách tài liệu ── */}
      {loadingDocs ? (
        <div className="bg-white border rounded-2xl p-20 flex justify-center items-center shadow-xs">
          <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-16 text-center shadow-xs">
          <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900 text-sm">Chưa có tài liệu nào</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {isStaff 
              ? 'Hệ thống chưa ghi nhận tài liệu học tập nào được đưa lên. Vui lòng bấm "Thêm tài liệu Google Drive" ở góc trên để bắt đầu.'
              : 'Lớp học của bạn hiện tại chưa được giảng viên đính kèm tài liệu học nào.'}
          </p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white border rounded-2xl p-12 text-center shadow-xs">
          <Info className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-bold">Không tìm thấy tài liệu phù hợp với điều kiện lọc.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
            {paginatedDocs.map((doc) => {
              const uploaderName = doc.uploadedByName || 'Giáo viên';
              const displayDate = new Date(doc.createdAt).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })

              return (
                <div
                  key={doc.id}
                  className="bg-white border border-gray-150 rounded-2xl p-4.5 shadow-xs hover:shadow-md hover:border-amber-400/50 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-2.5 items-start min-w-0 flex-1">
                        {getFileIcon(doc.fileType, doc.fileUrl)}
                        <div className="min-w-0 text-left">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-gray-800 text-xs hover:text-amber-600 transition-colors line-clamp-2 leading-relaxed"
                            title={doc.title}
                          >
                            {doc.title}
                          </a>
                          <p className="text-[10px] text-gray-400 font-semibold mt-1">
                            Người đăng: <span className="text-gray-600 font-bold">{uploaderName}</span> • {displayDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {getFileBadge(doc.fileType, doc.fileUrl)}
                      
                      {doc.fileSizeKb > 0 && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-gray-50 text-gray-500 border border-gray-150">
                          {doc.fileSizeKb.toLocaleString('vi-VN')} KB
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between text-[10px] font-semibold text-gray-400">
                    <div className="text-left min-w-0 flex-1 pr-2">
                      <p className="text-gray-900 font-bold truncate">Lớp: {doc.className || 'Tài liệu chung'}</p>
                      {doc.sessionTopic ? (
                        <p className="text-gray-400 font-medium truncate mt-0.5">
                          Unit {doc.sessionNumber}: {doc.sessionTopic}
                        </p>
                      ) : (
                        <p className="text-gray-400 font-medium truncate mt-0.5">Tài liệu học tập chung</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Mở tài liệu / Tải xuống"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      
                      {isStaff && (isAdmin || user?.id === doc.uploadedBy) && (
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Xóa tài liệu"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
              <p className="text-xs font-semibold text-gray-500 text-left">
                Hiển thị tài liệu từ <span className="font-bold text-gray-900">{((activePage - 1) * pageSize) + 1}</span> đến{' '}
                <span className="font-bold text-gray-900">
                  {Math.min(activePage * pageSize, totalCount)}
                </span>{' '}
                trong tổng số <span className="font-bold text-gray-900">{totalCount}</span> tài liệu
              </p>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={activePage === 1}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1
                  return (
                    <Button
                      key={pNum}
                      variant={activePage === pNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pNum)}
                      className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all ${
                        activePage === pNum
                          ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600 hover:text-white'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {pNum}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={activePage === totalPages}
                  className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Thêm tài liệu mới ── */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 animate-in fade-in duration-200"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-extrabold text-lg text-gray-900 mb-1 text-left">Đăng tài liệu học tập</h2>
            <p className="text-xs text-gray-400 mb-4 text-left">
              Hệ thống hỗ trợ lưu tài liệu dưới dạng link ngoài (Google Drive, Dropbox...). Chừa dung lượng máy chủ lưu bài tập.
            </p>

            <form onSubmit={handleSaveDoc} className="space-y-4 text-left">
              {/* Chọn lớp học */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Lớp học gán tài liệu *</label>
                <CustomDropdown
                  value={selectedClassId}
                  options={normalizedClasses}
                  onChange={(val) => {
                    setSelectedClassId(val)
                    setSelectedSessionId('')
                  }}
                  placeholder="Chọn lớp học tương ứng..."
                />
              </div>

              {/* Chọn buổi học (chỉ hiển thị khi đã chọn lớp) */}
              {selectedClassId && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Buổi học (Session/Unit)</label>
                  {loadingSessions ? (
                    <div className="flex items-center gap-2 p-2 border border-gray-150 rounded-xl bg-gray-50 text-xs text-gray-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                      Đang tải danh sách buổi học...
                    </div>
                  ) : (
                    <CustomDropdown
                      value={selectedSessionId}
                      options={[
                        { id: '', name: 'Tài liệu chung của lớp (Không gắn buổi cụ thể)' },
                        ...sessions.map((s) => ({
                          id: s.id,
                          name: `Buổi ${s.sessionNumber}: ${s.topic || 'Không có chủ đề'}`
                        }))
                      ]}
                      onChange={(val) => setSelectedSessionId(val)}
                      placeholder="Chọn buổi học tương ứng (tùy chọn)..."
                    />
                  )}
                </div>
              )}

              {/* URL */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Đường dẫn tài liệu (Link Google Drive) *</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    value={docForm.fileUrl}
                    onChange={(e) => setDocForm({ ...docForm, fileUrl: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                    className="pl-9 rounded-xl text-xs h-10"
                  />
                </div>
                {docForm.fileUrl.includes('drive.google.com') && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <Check className="h-3.5 w-3.5" />
                    Đã nhận dạng liên kết Google Drive!
                  </p>
                )}
              </div>

              {/* Tiêu đề */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Tiêu đề tài liệu *</label>
                <Input
                  value={docForm.title}
                  onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                  placeholder="Ví dụ: Tài liệu bổ trợ Nghe Nói IPA"
                  required
                  className="rounded-xl text-xs h-10"
                />
              </div>

              {/* Định dạng ngầm định và kích thước */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Loại tệp</label>
                  <CustomDropdown
                    value={docForm.fileType}
                    options={[
                      { id: 'drive', name: 'Google Drive' },
                      { id: 'pdf', name: 'Tài liệu PDF' },
                      { id: 'word', name: 'Tài liệu Word' },
                      { id: 'ppt', name: 'PowerPoint' },
                      { id: 'other', name: 'Link ngoài khác' }
                    ]}
                    onChange={(val) => setDocForm({ ...docForm, fileType: val })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Dung lượng ước lượng (KB)</label>
                  <Input
                    type="number"
                    min="0"
                    value={docForm.fileSizeKb}
                    onChange={(e) => setDocForm({ ...docForm, fileSizeKb: Number(e.target.value) })}
                    placeholder="Không bắt buộc"
                    className="rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* Chia sẻ lớp học khác */}
              {isStaff && staffClasses.length > 1 && (
                <div className="space-y-1.5 border-t border-gray-100 pt-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Đồng thời chia sẻ tài liệu với lớp khác</label>
                  <div className="max-h-[100px] overflow-y-auto space-y-2 border border-gray-150 rounded-xl p-2.5 bg-gray-50/50">
                    {staffClasses
                      .filter((c) => c.id !== selectedClassId)
                      .map((c) => {
                        const checked = shareClassIds.includes(c.id);
                        return (
                          <label key={c.id} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                if (checked) {
                                  setShareClassIds(shareClassIds.filter((id) => id !== c.id));
                                } else {
                                  setShareClassIds([...shareClassIds, c.id]);
                                }
                              }}
                              className="rounded text-amber-500 focus:ring-amber-500/20 w-3.5 h-3.5"
                            />
                            <span className="truncate">{c.name}</span>
                          </label>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Nút submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1 rounded-xl font-bold text-xs h-10"
                  onClick={() => setShowAddModal(false)}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  disabled={createDocMutation.isPending}
                  className="flex-1 rounded-xl font-bold text-xs h-10 bg-amber-500 hover:bg-amber-600 text-gray-900"
                >
                  {createDocMutation.isPending ? 'Đang tạo...' : 'Đăng tài liệu'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
