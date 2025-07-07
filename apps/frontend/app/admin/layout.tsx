import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-white dark:bg-gradient-to-br dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 transition-colors">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto bg-white dark:bg-dark-900 transition-colors ml-64">
        {children}
      </main>
    </div>
  )
} 
 
 
 