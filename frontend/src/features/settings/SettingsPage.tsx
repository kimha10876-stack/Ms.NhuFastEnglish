import { useSearchParams } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { ScrollablePageLayout, PageHeader } from '@/shared/components'
import { SettingsTabNav, type SettingsTabId } from './components/SettingsTabNav'
import {
  SystemTab,
  ClassCategoriesTab,
  UserRolesTab,
  BlogCategoriesTab,
  CurriculumTemplatesTab,
} from './components/tabs'

const VALID_TABS = new Set<SettingsTabId>([
  'system',
  'categories',
  'roles',
  'blog-categories',
  'curriculum-templates',
])

function parseTabParam(tab: string | null): SettingsTabId {
  if (tab && VALID_TABS.has(tab as SettingsTabId)) return tab as SettingsTabId
  return 'system'
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = parseTabParam(searchParams.get('tab'))

  const handleTabChange = (tab: SettingsTabId) => {
    setSearchParams({ tab }, { replace: true })
  }

  return (
    <ScrollablePageLayout
      header={
        <>
          <PageHeader
            eyebrow="Quản trị viên"
            title="Cấu hình hệ thống"
            icon={Settings}
          />
          <SettingsTabNav activeTab={activeTab} onChange={handleTabChange} />
        </>
      }
    >
      <div className="rounded border border-border bg-background p-6 shadow-sm">
        {activeTab === 'system' && <SystemTab />}
        {activeTab === 'categories' && <ClassCategoriesTab />}
        {activeTab === 'roles' && <UserRolesTab />}
        {activeTab === 'blog-categories' && <BlogCategoriesTab />}
        {activeTab === 'curriculum-templates' && <CurriculumTemplatesTab />}
      </div>
    </ScrollablePageLayout>
  )
}
