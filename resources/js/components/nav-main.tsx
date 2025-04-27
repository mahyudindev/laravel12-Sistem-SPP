import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

// Fungsi untuk memeriksa apakah item adalah NavGroup
function isNavGroup(item: NavItem | NavGroup): item is NavGroup {
    return 'items' in item;
}

// Komponen untuk menampilkan item navigasi
function NavItemComponent({ item }: { item: NavItem }) {
    const page = usePage();
    return (
        <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
                asChild
                isActive={item.href === page.url}
                tooltip={{ children: item.title }}
            >
                <Link href={item.href} prefetch>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

// Komponen untuk menampilkan grup navigasi
function NavGroupComponent({ group }: { group: NavGroup }) {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <SidebarMenuItem>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full justify-between">
                        <div className="flex items-center">
                            {group.icon && <group.icon className="mr-2" />}
                            <span>{group.title}</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    {/* Ganti div menjadi SidebarMenu agar nested <li> valid */}
                    <SidebarMenu className="ml-6 mt-1 space-y-1">
                        {group.items.map((subItem) => (
                            <NavItemComponent key={subItem.title} item={subItem} />
                        ))}
                    </SidebarMenu>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

export function NavMain({ items = [] }: { items: (NavItem | NavGroup)[] }) {
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>--------------------------------------</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item, index) => (
                    isNavGroup(item) ? 
                        <NavGroupComponent key={`group-${index}`} group={item} /> : 
                        <NavItemComponent key={`item-${index}`} item={item} />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
