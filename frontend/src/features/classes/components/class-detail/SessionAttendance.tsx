import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from '@/shared/utils/toast'
import { useClassAttendance, useUpdateAttendance } from '../../useClasses'

interface SessionAttendanceProps {
  classId: string
  sessionId: string
}

export function SessionAttendance({ classId, sessionId }: SessionAttendanceProps) {
  const { data: attendanceList = [], isLoading: loadingAttendance } = useClassAttendance(classId, sessionId)
  const updateAttendanceMutation = useUpdateAttendance(classId, sessionId)
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null)

  const handleToggle = (studentId: string, currentStatus: string | null, targetStatus: string) => {
    if (currentStatus === targetStatus) return
    setSavingStudentId(studentId)
    updateAttendanceMutation.mutate(
      { studentId, status: targetStatus },
      {
        onSuccess: () => setSavingStudentId(null),
        onError: () => {
          setSavingStudentId(null)
          toast.error('Cập nhật điểm danh thất bại!')
        },
      }
    )
  }

  if (loadingAttendance) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
      </div>
    )
  }

  const presentCount = attendanceList.filter((a) => a.status === 'present' || a.status === null).length
  const absentCount = attendanceList.filter((a) => a.status === 'absent').length

  return (
    <div className="mt-4 border-t border-border pt-4 text-left">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h5 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            Điểm danh học viên
          </h5>
          <p className="text-xs text-muted-foreground font-semibold mt-0.5">Tích chọn trạng thái đi học của học viên</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded border border-border animate-in fade-in duration-300">
          <span className="text-emerald-600">Đi học: {presentCount}</span>
          <span>•</span>
          <span className="text-red-500">Vắng: {absentCount}</span>
        </div>
      </div>

      {attendanceList.length === 0 ? (
        <div className="text-center py-4 bg-muted/50 rounded border border-dashed border-border">
          <p className="text-xs text-muted-foreground font-medium italic">Không có học viên nào trong danh sách lớp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {attendanceList.map((att) => {
            const isPresent = att.status === 'present' || att.status === null
            const isAbsent = att.status === 'absent'
            const isSaving = savingStudentId === att.studentId

            return (
              <div
                key={att.studentId}
                className="flex items-center justify-between p-2.5 border border-border rounded bg-muted/20 hover:bg-muted/60 transition-all"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-xs font-extrabold text-ink-900 truncate leading-snug">{att.fullName}</p>
                  <p className="text-xs text-gray-450 font-medium truncate">{att.email}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isSaving ? (
                    <div className="px-5 py-1">
                      <Loader2 className="h-3 w-3 animate-spin text-primary-500" />
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleToggle(att.studentId, att.status, 'present')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                          isPresent
                            ? 'bg-emerald-500 border-emerald-500 text-white font-extrabold shadow-sm'
                            : 'bg-background border-border text-gray-450 hover:bg-muted'
                        }`}
                      >
                        Đi học
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggle(att.studentId, att.status, 'absent')}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all border ${
                          isAbsent
                            ? 'bg-red-500 border-red-500 text-white font-extrabold shadow-sm'
                            : 'bg-background border-border text-gray-450 hover:bg-muted'
                        }`}
                      >
                        Vắng
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
