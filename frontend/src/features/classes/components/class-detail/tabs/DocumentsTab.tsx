import { BookOpen, Download, FileText, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { ClassSession, ClassDocument } from '@/features/classes/classes.types'
import { getFileIcon } from '../utils'

interface DocumentsTabProps {
  generalDocuments: ClassDocument[]
  sessions: ClassSession[]
  isStaff: boolean
  setSelectedSessionForDoc: (sessionId: string | null) => void
  setShowAddDoc: (show: boolean) => void
  handleDeleteDoc: (docId: string) => void
}

export function DocumentsTab({
  generalDocuments,
  sessions,
  isStaff,
  setSelectedSessionForDoc,
  setShowAddDoc,
  handleDeleteDoc,
}: DocumentsTabProps) {
  // Aggregate all docs in class (both general and session-specific)
  const allDocs = [...generalDocuments]
  sessions.forEach((s) => {
    if (s.documents) {
      allDocs.push(...s.documents)
    }
  })
  const sortedDocs = [...allDocs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const latestDoc = sortedDocs.length > 0 ? sortedDocs[0] : null

  return (
    <div className="space-y-6 text-left">
      {/* Latest Document Alert */}
      {latestDoc && (
        <div className="bg-primary-50 border border-primary-200/60 rounded p-4 flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-primary-100/80 text-primary-700 rounded">
              <BookOpen className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-left">
              <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider">
                Tài liệu chuẩn bị cho buổi học tiếp theo
              </h4>
              <p className="text-sm font-bold text-ink-900 mt-0.5 truncate">{latestDoc.title}</p>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                Được chia sẻ lúc: {new Date(latestDoc.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <a
            href={latestDoc.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 h-9 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-ink-900 text-xs font-bold rounded transition-all duration-200 shrink-0 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Xem / Tải xuống
          </a>
        </div>
      )}

      {/* General Class Documents */}
      <div className="bg-background border border-border/80 rounded p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-ink-900 text-base flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-primary-500" />
              Tài liệu & Giáo trình chung của lớp
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Kho tài liệu dùng chung cho toàn bộ khóa học (Ebook, link Google Drive, bài nghe Audio...)
            </p>
          </div>
          {isStaff && (
            <Button
              size="sm"
              onClick={() => {
                setSelectedSessionForDoc(null)
                setShowAddDoc(true)
              }}
              className="gap-1.5 text-xs font-bold rounded bg-primary-500 hover:bg-primary-600 text-ink-900"
            >
              <Plus className="h-4 w-4" />
              Thêm tài liệu chung
            </Button>
          )}
        </div>

        {generalDocuments.length === 0 ? (
          <div className="py-8 text-center border border-dashed border-border rounded bg-muted/50">
            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">Lớp học chưa có tài liệu chung.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {generalDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 bg-muted/50 border border-border/70 rounded hover:bg-background hover:shadow-sm hover:border-gray-300 transition-all duration-200 group"
              >
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 min-w-0 flex-1 hover:text-primary-600 transition-colors"
                >
                  {getFileIcon(doc.fileType)}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-ink-900 truncate leading-snug">{doc.title}</p>
                    <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                      {doc.fileSizeKb} KB • {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </a>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded text-muted-foreground hover:text-primary-500 hover:bg-muted transition-colors"
                    title="Xem tài liệu"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {isStaff && (
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      className="p-1.5 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="Xóa tài liệu"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Session/Unit Documents Overview */}
      {sessions.some((s) => s.documents && s.documents.length > 0) && (
        <div className="bg-background border border-border/80 rounded p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-ink-900 text-base">Tài liệu theo từng Buổi học (Unit)</h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              Tổng hợp tài liệu đính kèm theo từng bài học cụ thể
            </p>
          </div>

          <div className="space-y-4">
            {sessions
              .filter((s) => s.documents && s.documents.length > 0)
              .map((s) => (
                <div key={s.id} className="border border-border rounded p-4 bg-muted/30 space-y-2.5">
                  <span className="text-xs font-extrabold text-primary-700 bg-primary-50 border border-primary-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Unit {s.sessionNumber}: {s.topic || 'Không có chủ đề'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                    {s.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-background border border-border/60 rounded hover:shadow-sm transition-all duration-200 group/doc"
                      >
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 min-w-0 flex-1 hover:text-primary-600 transition-colors"
                        >
                          {getFileIcon(doc.fileType)}
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate leading-snug">{doc.title}</p>
                            <p className="text-xs text-muted-foreground font-semibold mt-0.5">{doc.fileSizeKb} KB</p>
                          </div>
                        </a>
                        <div className="flex items-center shrink-0 ml-1">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded text-muted-foreground hover:text-primary-500 hover:bg-muted transition-colors"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                          {isStaff && (
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/doc:opacity-100 transition-colors"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
