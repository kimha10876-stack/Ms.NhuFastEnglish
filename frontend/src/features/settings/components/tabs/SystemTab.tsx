import { useState } from 'react'
import { Building, Phone, MapPin, Mail, Globe, Save } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { LoadingState } from '@/shared/components'
import { useSystemSettings, useSaveSettings } from '../../useSettings'
import { toast } from '@/shared/utils/toast'

export function SystemTab() {
  const { data: settings = [], isLoading: loadingSettings } = useSystemSettings()
  const { mutate: saveSettings, isPending: savingSettings } = useSaveSettings()
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({})
  const [initSettings, setInitSettings] = useState(false)

  if (settings.length > 0 && !initSettings) {
    const form: Record<string, string> = {}
    settings.forEach((s) => {
      form[s.key] = s.value
    })
    setSettingsForm(form)
    setInitSettings(true)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings({ settings: settingsForm }, {
      onSuccess: () => toast.success('Lưu cấu hình hệ thống thành công!'),
    })
  }

  if (loadingSettings) {
    return <LoadingState variant="spinner" />
  }

  return (
    <form onSubmit={handleSaveSettings} className="max-w-xl space-y-5">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm ">
            <Building className="h-4 w-4 text-muted-foreground" />
            Tên trung tâm
          </label>
          <Input
            value={settingsForm.CenterName ?? ''}
            onChange={(e) => setSettingsForm((p) => ({ ...p, CenterName: e.target.value }))}
            placeholder="VD: Ms Nhu Fast English"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm ">
              <Phone className="h-4 w-4 text-muted-foreground" />
              Số điện thoại Hotline
            </label>
            <Input
              value={settingsForm.Hotline ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, Hotline: e.target.value }))}
              placeholder="VD: 0905 123 456"
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm ">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email liên hệ
            </label>
            <Input
              type="email"
              value={settingsForm.Email ?? ''}
              onChange={(e) => setSettingsForm((p) => ({ ...p, Email: e.target.value }))}
              placeholder="VD: contact@msnhu.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm ">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Địa chỉ liên hệ
          </label>
          <Input
            value={settingsForm.Address ?? ''}
            onChange={(e) => setSettingsForm((p) => ({ ...p, Address: e.target.value }))}
            placeholder="VD: 123 Ba Tháng Hai, Hải Châu, Đà Nẵng"
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm ">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Liên kết Facebook Fanpage
          </label>
          <Input
            value={settingsForm.FacebookUrl ?? ''}
            onChange={(e) => setSettingsForm((p) => ({ ...p, FacebookUrl: e.target.value }))}
            placeholder="https://facebook.com/..."
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-2">
        <Button type="submit" loading={savingSettings} className="gap-1.5">
          <Save className="h-4 w-4" />
          Lưu cấu hình
        </Button>
      </div>
    </form>
  )
}
