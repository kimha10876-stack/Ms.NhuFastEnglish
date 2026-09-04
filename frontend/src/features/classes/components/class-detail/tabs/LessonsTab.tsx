import React from 'react'
import {
  BookOpen, Plus, Trash2, Sparkles, Loader2, Calendar, Clock, Edit2, ChevronDown, Download
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { ClassSession } from '@/features/classes/classes.types'
import { getFileIcon } from '../utils'
import { SessionAttendance } from '../SessionAttendance'

interface LessonsTabProps {
  classId: string
  sessions: ClassSession[]
  loadingSessions: boolean
  isStaff: boolean
  isStudent: boolean
  expandedSessions: Record<string, boolean>
  toggleSession: (sessionId: string) => void
  setExpandedSessions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  setSelectedSessionForDoc: (sessionId: string | null) => void
  setShowAddDoc: (show: boolean) => void
  handleDeleteDoc: (docId: string) => void
  setShowImportModal: (show: boolean) => void
  handleOpenAddSession: () => void
  handleOpenEditSession: (session: ClassSession) => void
  handleDeleteSession: (sessionId: string) => void
}

export function LessonsTab({
  classId,
  sessions,
  loadingSessions,
  isStaff,
  isStudent,
  expandedSessions,
  toggleSession,
  setExpandedSessions,
  setSelectedSessionForDoc,
  setShowAddDoc,
  handleDeleteDoc,
  setShowImportModal,
  handleOpenAddSession,
  handleOpenEditSession,
  handleDeleteSession,
}: LessonsTabProps) {
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateDiff = new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    if (dateDiff !== 0) return dateDiff
    return b.sessionNumber - a.sessionNumber
  })
  const isAllExpanded = sortedSessions.length > 0 && sortedSessions.every((s) => expandedSessions[s.id])

  return (
    <div className="space-y-6 text-left">
      {/* Sessions/Units Timeline */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-bold text-ink-900 text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary-500" />
            Lộ trình học theo từng Buổi (Unit)
          </h3>
          <div className="flex items-center gap-2">
            {sortedSessions.length > 0 && (
              <button
                onClick={() => {
                  if (isAllExpanded) {
                    setExpandedSessions({})
                  } else {
                    const all: Record<string, boolean> = {}
                    sortedSessions.forEach((s) => {
                      all[s.id] = true
                    })
                    setExpandedSessions(all)
                  }
                }}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 select-none mr-2"
              >
                {isAllExpanded ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
              </button>
            )}
            {isStaff && (
              <>
                {sortedSessions.length === 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowImportModal(true)}
                    className="gap-1.5 text-xs font-semibold rounded"
                  >
                    <BookOpen className="h-4 w-4 text-primary-600" />
                    Nhập từ Khung giáo trình
                  </Button>
                )}
                <Button size="sm" onClick={handleOpenAddSession} className="gap-1.5 text-xs font-semibold rounded">
                  <Plus className="h-4 w-4" />
                  Thêm buổi học (Unit)
                </Button>
              </>
            )}
          </div>
        </div>

        {loadingSessions ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded bg-muted/50">
            <BookOpen className="h-8 w-8 text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-muted-foreground">Chưa có nội dung buổi học nào</p>
            <p className="text-xs text-muted-foreground mt-0.5">Vui lòng quay lại sau hoặc liên hệ giáo viên</p>
          </div>
        ) : (
          <div className="relative border-l border-border ml-4 pl-6 space-y-8">
            {sortedSessions.map((s) => (
              <div key={s.id} className="relative group/timeline animate-in fade-in duration-300">
                {/* Circle marker */}
                <div className="absolute -left-[35px] top-1.5 w-6 h-6 rounded-full bg-primary-500 border-4 border-white shadow-sm flex items-center justify-center text-xs font-bold text-white group-hover/timeline:bg-primary-600 transition-colors">
                  {s.sessionNumber}
                </div>

                {/* Session content card */}
                <div
                  onClick={() => toggleSession(s.id)}
                  className="bg-background border border-border/80 rounded p-5 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    <div>
                      <h4 className="font-extrabold text-ink-900 text-sm leading-snug group-hover/timeline:text-primary-600 transition-colors flex items-center gap-1.5">
                        Unit {s.sessionNumber}: {s.topic || 'Chưa cập nhật chủ đề'}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {new Date(s.sessionDate).toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {s.startTime} - {s.endTime}
                        </span>
                        {s.guestTeacherName && (
                          <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded text-xs font-bold">
                            GV thay thế: {s.guestTeacherName}
                          </span>
                        )}
                        {isStudent && (
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold border ${
                              s.attendanceStatus === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                : s.attendanceStatus === 'absent'
                                ? 'bg-red-50 text-red-700 border-red-150'
                                : 'bg-muted text-muted-foreground border-border'
                            }`}
                          >
                            {s.attendanceStatus === 'present'
                              ? 'Có mặt'
                              : s.attendanceStatus === 'absent'
                              ? 'Vắng mặt'
                              : 'Chưa điểm danh'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isStaff && (
                        <div
                          className="flex items-center gap-1.5 opacity-0 group-hover/timeline:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenEditSession(s)}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-ink-900 transition-all"
                            title="Sửa buổi học"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSession(s.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-all"
                            title="Xóa buổi học"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                          expandedSessions[s.id] ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedSessions[s.id] && (
                    <div
                      className="mt-3 pt-3 border-t border-border space-y-4 animate-in fade-in slide-in-from-top-1 duration-200"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Lesson notes */}
                      {s.note && (
                        <p className="text-xs text-muted-foreground leading-relaxed font-semibold p-3 bg-muted rounded border border-border">
                          {s.note}
                        </p>
                      )}

                      {/* Session Documents list */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Tài liệu đính kèm ({s.documents.length})
                          </p>
                          {isStaff && (
                            <button
                              onClick={() => {
                                setSelectedSessionForDoc(s.id)
                                setShowAddDoc(true)
                              }}
                              className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
                            >
                              <Plus className="h-3 w-3" />
                              Thêm tài liệu
                            </button>
                          )}
                        </div>
                        {s.documents.length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            Chưa có tài liệu đính kèm cho buổi học này.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {s.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-2.5 bg-muted/50 border border-border/50 rounded hover:bg-background hover:border-border hover:shadow-sm transition-all duration-200 group/doc"
                              >
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 min-w-0 flex-1 hover:text-primary-600 transition-colors"
                                >
                                  {getFileIcon(doc.fileType)}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-foreground truncate leading-snug">
                                      {doc.title}
                                    </p>
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
                        )}
                      </div>
                      {isStaff && <SessionAttendance classId={classId} sessionId={s.id} />}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
