import { useState } from 'react'
import { BookOpen, Plus, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Modal, EmptyState, LoadingState, Pagination } from '@/shared/components'
import { SettingsCollectionHeader } from '../SettingsCollectionHeader'
import { LimitedTextInput } from '../LimitedTextInput'
import { TruncatedName } from '../TruncatedName'
import { TEMPLATE_NAME_MAX, TEMPLATE_DESC_MAX, SETTINGS_PAGE_SIZE, type SettingsViewMode } from '../../settings.constants'
import { paginateItems } from '../../utils/paginate'
import {
  useCurriculumTemplates, useCreateCurriculumTemplate,
  useDeleteCurriculumTemplate,
} from '@/features/classes/useClasses'
import { classesApi } from '@/features/classes/classes.api'
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog'
import { toast } from '@/shared/utils/toast'
import { getApiErrorMessage, getUploadFileError } from '@/shared/utils/upload'

type TemplateDoc = { title: string; fileUrl: string; fileType: string; fileSizeKb: number }
type TemplateUnit = { sessionNumber: number; topic: string; note: string; documents: TemplateDoc[] }
type CurriculumTemplate = { id: string; name: string; description?: string; createdAt: string; units?: unknown[] }

function getFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image'
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx'].includes(ext)) return 'doc'
  if (['xls', 'xlsx'].includes(ext)) return 'xls'
  if (['ppt', 'pptx'].includes(ext)) return 'ppt'
  return 'other'
}

export function CurriculumTemplatesTab() {
  const { ask, close, setLoading, confirmDialog } = useConfirmDialog()
  const { data: templates = [], isLoading: loadingTemplates } = useCurriculumTemplates()
  const { mutate: createTemplate, isPending: creatingTemplate } = useCreateCurriculumTemplate()
  const { mutate: deleteTemplate } = useDeleteCurriculumTemplate()

  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [templateDesc, setTemplateDesc] = useState('')
  const [templateDocs, setTemplateDocs] = useState<TemplateDoc[]>([])
  const [templateUnits, setTemplateUnits] = useState<TemplateUnit[]>([
    { sessionNumber: 1, topic: '', note: '', documents: [] },
  ])
  const [templatesView, setTemplatesView] = useState<SettingsViewMode>('card')
  const [templatesPage, setTemplatesPage] = useState(1)

  const paginatedTemplates = paginateItems(templates as CurriculumTemplate[], templatesPage, SETTINGS_PAGE_SIZE)

  const openTemplateDialog = () => {
    setTemplateName('')
    setTemplateDesc('')
    setTemplateDocs([])
    setTemplateUnits([{ sessionNumber: 1, topic: '', note: '', documents: [] }])
    setShowTemplateModal(true)
  }

  const handleAddTemplateUnit = () => {
    setTemplateUnits((prev) => [
      ...prev,
      { sessionNumber: prev.length + 1, topic: '', note: '', documents: [] },
    ])
  }

  const handleRemoveTemplateUnit = (idx: number) => {
    if (templateUnits.length <= 1) return
    const filtered = templateUnits.filter((_, i) => i !== idx)
    const mapped = filtered.map((u, i) => ({ ...u, sessionNumber: i + 1 }))
    setTemplateUnits(mapped)
  }

  const handleTemplateUnitChange = (idx: number, field: 'topic' | 'note', val: string) => {
    setTemplateUnits((prev) => prev.map((u, i) => (i === idx ? { ...u, [field]: val } : u)))
  }

  const handleUploadTemplateDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return

    const sizeError = getUploadFileError(file)
    if (sizeError) {
      toast.error(sizeError)
      input.value = ''
      return
    }

    try {
      const res = await classesApi.uploadFile(file)
      setTemplateDocs((prev) => [
        ...prev,
        {
          title: res.fileName,
          fileUrl: res.fileUrl,
          fileType: getFileType(res.fileName),
          fileSizeKb: Math.round(file.size / 1024),
        },
      ])
      toast.success('Tải tài liệu lên thành công')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Tải file lên thất bại'))
    } finally {
      input.value = ''
    }
  }

  const handleRemoveTemplateDoc = (docIndex: number) => {
    setTemplateDocs((prev) => prev.filter((_, i) => i !== docIndex))
  }

  const handleUploadUnitDoc = async (unitIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return

    const sizeError = getUploadFileError(file)
    if (sizeError) {
      toast.error(sizeError)
      input.value = ''
      return
    }

    try {
      const res = await classesApi.uploadFile(file)
      setTemplateUnits((prev) =>
        prev.map((u, idx) => {
          if (idx !== unitIndex) return u
          return {
            ...u,
            documents: [
              ...u.documents,
              {
                title: res.fileName,
                fileUrl: res.fileUrl,
                fileType: getFileType(res.fileName),
                fileSizeKb: Math.round(file.size / 1024),
              },
            ],
          }
        })
      )
      toast.success('Tải tài liệu lên thành công')
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Tải file lên thất bại'))
    } finally {
      input.value = ''
    }
  }

  const handleRemoveUnitDoc = (unitIndex: number, docIndex: number) => {
    setTemplateUnits((prev) =>
      prev.map((u, idx) => {
        if (idx !== unitIndex) return u
        return {
          ...u,
          documents: u.documents.filter((_, i) => i !== docIndex),
        }
      })
    )
  }

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!templateName.trim()) {
      toast.error('Vui lòng nhập tên khung giáo trình')
      return
    }
    if (templateName.length > TEMPLATE_NAME_MAX) {
      toast.error(`Tên khung giáo trình tối đa ${TEMPLATE_NAME_MAX} ký tự`)
      return
    }
    if (templateDesc.length > TEMPLATE_DESC_MAX) {
      toast.error(`Mô tả tối đa ${TEMPLATE_DESC_MAX} ký tự`)
      return
    }

    const payload = {
      name: templateName.trim(),
      description: templateDesc.trim() || null,
      documents: templateDocs,
      units: templateUnits.map((u) => ({
        sessionNumber: u.sessionNumber,
        topic: u.topic.trim() || `Buổi học ${u.sessionNumber}`,
        note: u.note.trim() || null,
        documents: u.documents,
      })),
    }

    createTemplate(payload, {
      onSuccess: () => {
        setShowTemplateModal(false)
        toast.success('Tạo khung giáo trình mẫu thành công!')
      },
      onError: (err: unknown) => {
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        toast.error(msg || 'Tạo khung giáo trình thất bại')
      },
    })
  }

  const handleDeleteTemplate = (id: string, name: string) => {
    ask({
      title: 'Xóa khung giáo trình mẫu',
      description: `Bạn có chắc chắn muốn xóa khung giáo trình "${name}"? Các lớp học đã tạo sẽ không bị ảnh hưởng.`,
      confirmLabel: 'Xóa',
      onConfirm: () => {
        setLoading(true)
        deleteTemplate(id, {
          onSuccess: () => {
            toast.success('Xóa khung giáo trình thành công!')
            close()
          },
          onError: (err: unknown) => {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
            toast.error(msg || 'Xóa khung giáo trình thất bại')
          },
          onSettled: () => setLoading(false),
        })
      },
    })
  }

  return (
    <div>
      <SettingsCollectionHeader
        title="Khung giáo trình mẫu"
        description="Quản lý lộ trình học mẫu của trung tâm để import nhanh khi tạo lớp học mới"
        addLabel="Tạo khung mới"
        onAdd={openTemplateDialog}
        viewMode={templatesView}
        onViewModeChange={(mode) => {
          setTemplatesView(mode)
          setTemplatesPage(1)
        }}
      />

      {loadingTemplates ? (
        <LoadingState variant={templatesView === 'card' ? 'skeleton-cards' : 'skeleton-rows'} rows={2} />
      ) : templates.length === 0 ? (
        <EmptyState title="Chưa có khung giáo trình nào" description="Hãy tạo khung giáo trình đầu tiên của trung tâm!" />
      ) : templatesView === 'card' ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {paginatedTemplates.items.map((tpl) => (
              <div
                key={tpl.id}
                className="group relative flex flex-col gap-4 rounded border border-border bg-background p-5 shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary-50 text-primary-600 shadow-sm">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <TruncatedName name={tpl.name} as="h4" className="text-sm font-extrabold text-ink-900" />
                      <span className="text-xs text-muted-foreground">
                        Tạo ngày: {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Xoá giáo trình mẫu"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <p
                  className="text-xs leading-relaxed text-muted-foreground line-clamp-2"
                  title={tpl.description || 'Không có mô tả chi tiết.'}
                >
                  {tpl.description || 'Không có mô tả chi tiết.'}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
                  <span className="rounded border border-primary-100 bg-primary-50 px-2 py-0.5 font-extrabold text-primary-600">
                    {tpl.units?.length ?? 0} buổi học
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Syllabus
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={paginatedTemplates.activePage}
            totalPages={paginatedTemplates.totalPages}
            totalCount={paginatedTemplates.totalCount}
            pageSize={SETTINGS_PAGE_SIZE}
            onPageChange={setTemplatesPage}
            itemLabel="khung giáo trình"
          />
        </>
      ) : (
        <div className="overflow-hidden rounded border border-border bg-background">
          <div className="grid grid-cols-12 bg-muted px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="col-span-5">Tên khung</span>
            <span className="col-span-3">Buổi học</span>
            <span className="col-span-2">Ngày tạo</span>
            <span className="col-span-2 text-right">Hành động</span>
          </div>
          <div className="divide-y divide-gray-100">
            {paginatedTemplates.items.map((tpl) => (
              <div key={tpl.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-muted/50">
                <div className="col-span-5 min-w-0 pr-4">
                  <TruncatedName name={tpl.name} className="text-sm font-semibold text-ink-900" />
                </div>
                <div className="col-span-3 text-sm text-muted-foreground">{tpl.units?.length ?? 0} buổi</div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {new Date(tpl.createdAt).toLocaleDateString('vi-VN')}
                </div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                    title="Xoá"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            page={paginatedTemplates.activePage}
            totalPages={paginatedTemplates.totalPages}
            totalCount={paginatedTemplates.totalCount}
            pageSize={SETTINGS_PAGE_SIZE}
            onPageChange={setTemplatesPage}
            itemLabel="khung giáo trình"
            bordered
          />
        </div>
      )}

      <Modal
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        title="Tạo khung chương trình mẫu mới"
        description="Xây dựng giáo trình khung chuẩn của trung tâm để tái sử dụng"
        size="lg"
        footer={
          <>
            <Button type="button" variant="secondary" className="flex-1 rounded text-xs font-bold" onClick={() => setShowTemplateModal(false)}>
              Huỷ bỏ
            </Button>
            <Button type="submit" form="template-form" loading={creatingTemplate} className="flex-1 text-xs font-bold">
              Lưu lại
            </Button>
          </>
        }
      >
        <form id="template-form" onSubmit={handleSaveTemplate} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-sm">Tên khung giáo trình <span className="text-red-500">*</span></label>
            <LimitedTextInput
              value={templateName}
              onValueChange={setTemplateName}
              maxLength={TEMPLATE_NAME_MAX}
              placeholder="VD: Tiếng Anh Giao Tiếp 12 Buổi, IELTS Target 6.5..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm">Mô tả ngắn gọn</label>
            <Textarea
              value={templateDesc}
              onChange={(e) => setTemplateDesc(e.target.value.slice(0, TEMPLATE_DESC_MAX))}
              maxLength={TEMPLATE_DESC_MAX}
              placeholder="Mô tả mục tiêu lộ trình, đối tượng học viên..."
              className="min-h-[60px]"
            />
            <p className="text-right text-xs text-muted-foreground">
              {templateDesc.length}/{TEMPLATE_DESC_MAX}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span>Tài liệu & Giáo trình dùng chung</span>
              <label className="flex cursor-pointer select-none items-center gap-1 text-xs text-primary-600 hover:text-primary-700">
                <Plus className="h-3.5 w-3.5" /> Tải lên tài liệu chung
                <input type="file" onChange={handleUploadTemplateDoc} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">Tối đa 5MB / file</p>
            {templateDocs.length === 0 ? (
              <p className="rounded-[8px] border border-dashed border-border bg-muted/50 p-3 text-center text-xs font-semibold italic text-muted-foreground">
                Không có tài liệu dùng chung nào.
              </p>
            ) : (
              <div className="max-h-[120px] space-y-1.5 overflow-y-auto pr-1">
                {templateDocs.map((doc, dIdx) => (
                  <div key={dIdx} className="flex items-center justify-between rounded-[8px] border border-border bg-muted p-2 text-xs font-bold text-foreground">
                    <span className="max-w-[80%] truncate">{doc.title} ({doc.fileSizeKb} KB)</span>
                    <button type="button" onClick={() => handleRemoveTemplateDoc(dIdx)} className="px-1.5 font-bold text-red-500 hover:text-red-700">
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-sm font-extrabold text-foreground">
                <Sparkles className="h-4 w-4 text-primary-500" />
                Danh sách các Buổi học (Units)
              </h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTemplateUnit}
                className="h-8 gap-1 rounded text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                Thêm buổi học
              </Button>
            </div>

            <div className="max-h-[300px] space-y-3 overflow-y-auto pr-1">
              {templateUnits.map((u, idx) => (
                <div key={idx} className="relative space-y-3 rounded-[8px] border border-border bg-muted/50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-[8px] border border-primary-100 bg-primary-50 px-2 py-0.5 text-xs font-extrabold text-primary-700">
                      Buổi #{u.sessionNumber}
                    </span>
                    {templateUnits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTemplateUnit(idx)}
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Xóa buổi học này"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-xs uppercase">Chủ đề học (Topic) <span className="text-red-500">*</span></label>
                      <Input
                        value={u.topic}
                        onChange={(e) => handleTemplateUnitChange(idx, 'topic', e.target.value)}
                        placeholder="VD: Phát âm chuẩn IPA, Nói về sở thích..."
                        required
                        className="h-8 rounded text-xs font-semibold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs uppercase">Ghi chú / Nội dung chính</label>
                      <Input
                        value={u.note}
                        onChange={(e) => handleTemplateUnitChange(idx, 'note', e.target.value)}
                        placeholder="VD: Luyện phát âm 44 nguyên âm, phụ âm..."
                        className="h-8 rounded text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-border/50 pt-2 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider">Tài liệu riêng của buổi</span>
                      <label className="flex cursor-pointer select-none items-center gap-0.5 text-xs text-primary-600 hover:text-primary-700">
                        <Plus className="h-3 w-3" /> Tải lên tài liệu buổi học
                        <input type="file" onChange={(e) => handleUploadUnitDoc(idx, e)} className="hidden" />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">Tối đa 5MB / file</p>
                    {u.documents.length === 0 ? (
                      <p className="text-xs font-semibold italic text-muted-foreground">Không có tài liệu riêng cho buổi này.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {u.documents.map((doc, dIdx) => (
                          <div key={dIdx} className="flex items-center gap-1.5 rounded-[8px] border border-border bg-background py-1 pl-2 pr-1.5 text-xs font-bold text-muted-foreground shadow-sm">
                            <span className="max-w-[120px] truncate" title={doc.title}>{doc.title}</span>
                            <button type="button" onClick={() => handleRemoveUnitDoc(idx, dIdx)} className="px-0.5 font-extrabold text-red-500 hover:text-red-700">
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {confirmDialog}
    </div>
  )
}
