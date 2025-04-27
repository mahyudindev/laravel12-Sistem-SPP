import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';

type NavDivider = { divider: boolean; component?: () => JSX.Element };
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, CreditCard, Users, Database, FileText, UserPlus, School, BarChart3 } from 'lucide-react';
import AppLogo from './app-logo';
import { JSX } from 'react';

// Define extended types with collapsible property
type ExtendedNavGroup = NavGroup & { collapsible?: boolean };

const mainNavItems: (NavItem | ExtendedNavGroup | NavDivider)[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },

    {
        title: 'Pengelolaan Akun',
        href: '/admin/users',
        icon: Users,
    },

    {
        title: 'Pembayaran',
        href: '/admin/pembayaran',
        icon: CreditCard,
    },

    {
        divider: true,
    },

    {
        title: 'Data Master',
        icon: Database,
        collapsible: true,
        items: [
            {
                title: 'SPP',
                href: '/admin/spp',
                icon: Database,
            },
            {
                title: 'PPDB',
                href: '/admin/ppdb',
                icon: School,
            },
            {
                title: 'Data Siswa',
                href: '/admin/siswa',
                icon: Users,
            },
        ],
    },
    {
        title: 'Laporan',
        icon: FileText,
        collapsible: true,
        items: [
            {
                title: 'Laporan Pembayaran',
                href: '/admin/laporan/pembayaran',
                icon: BarChart3,
            },
            {
                title: 'Laporan Siswa Lunas',
                href: '/admin/laporan/siswa-lunas',
                icon: FileText,
            },
            {
                title: 'Laporan Siswa Menunggak',
                href: '/admin/laporan/siswa-menunggak',
                icon: FileText,
            },
        ],
    },
];

export function AppSidebar() {
    // Mengambil data user dari usePage
    const { auth } = usePage().props as any;
    const isAdmin = auth?.user?.role === 'admin';
    console.log('Current user role:', auth?.user?.role);
    console.log('Sidebar loaded, checking routes');
    
    // Filter item yang hanya boleh dilihat oleh admin
    const filteredNavItems = mainNavItems.filter(item => {
        if (!isAdmin) {
            // Jika bukan admin, sembunyikan menu Pengelolaan Akun, Data Master, dan Laporan
            if ((item as NavItem).title === 'Pengelolaan Akun') return false;
            if ((item as ExtendedNavGroup).title === 'Data Master') return false;
            if ((item as ExtendedNavGroup).title === 'Laporan') return false;
        }
        return true;
    });
    
    return (
        <Sidebar collapsible="icon" variant="inset" className="scrollbar-none overflow-hidden">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-hidden">
                <NavMain 
                    items={filteredNavItems.map(item => 
                        'divider' in item 
                            ? { ...item, component: () => <div className="my-2 mx-3 border-t border-gray-200 dark:border-gray-700" /> }
                            : item
                    ) as any} 
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
