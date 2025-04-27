import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { StudentSidebar } from '@/components/student-sidebar';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { user } = usePage().props as any;
    const url = usePage().url;

    // Check if we're in the admin section of the application
    const isAdminSection = url.startsWith('/admin');
    
    // Only use the student sidebar if we're not in the admin section and the user is a student
    const useStudentSidebar = !isAdminSection && user?.role === 'siswa';

    return (
        <AppShell variant="sidebar">
            {useStudentSidebar ? <StudentSidebar /> : <AppSidebar />}
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
