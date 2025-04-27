import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { LayoutGrid, CreditCard } from 'lucide-react';
import AppLogo from './app-logo';


const studentNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/siswa/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Pembayaran',
        href: '/siswa/pembayaran/create',
        icon: CreditCard,
    },
];

export function StudentSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="scrollbar-none overflow-hidden">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/siswa/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-hidden">
                <NavMain items={studentNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
