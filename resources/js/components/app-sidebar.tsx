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
                title: 'Laporan Siswa Sudah Bayar',
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
    const userRole = auth?.user?.role;

    // Filter nav items based on user role
    const filteredNavItems = mainNavItems.filter((item) => {
        // For kepsek, only show the 'Dashboard' and 'Laporan' menus
        if (userRole === 'kepsek') {
            const title = (item as NavItem).title;
            return title === 'Dashboard' || title === 'Laporan';
        }

        // For other non-admin roles, hide specific menus
        if (userRole !== 'admin') {
            if ((item as NavItem).title === 'Pengelolaan Akun') return false;
            if ((item as ExtendedNavGroup).title === 'Data Master') return false;
            if ((item as ExtendedNavGroup).title === 'Laporan') return false;
        }

        // Admin can see everything
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
