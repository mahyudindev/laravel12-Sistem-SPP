import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Eye, Loader2, Pencil, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Pengelolaan Akun',
        href: '/admin/users',
    },
];

interface User {
    user_id: number;
    email: string;
    role: string;
    created_at: string;
    siswa?: {
        nama: string;
        nis: string;
        kelas: string;
        is_aktif?: boolean | number;
    };
    admin?: {
        nama: string;
        no_telp?: string;
        alamat?: string;
    };
}

interface UsersProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    filters: {
        role?: string;
        search?: string;
    };
}

export default function Users({ users, filters }: UsersProps) {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const handleSearch = () => {
        router.get(
            '/admin/users',
            {
                search: searchTerm,
                role: selectedRole,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        router.get(
            '/admin/users',
            {
                search: searchTerm,
                role: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const confirmDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);
    const [showErrorAlert, setShowErrorAlert] = useState(!!flash?.error);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccessAlert(true);
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }

        if (flash?.error) {
            setShowErrorAlert(true);
            const timer = setTimeout(() => {
                setShowErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const deleteUser = () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        setDeleteError(null);

        router.delete(`/admin/users/${userToDelete.user_id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            },
            onError: (errors) => {
                console.error('Error:', errors);
                setIsDeleting(false);
                setDeleteError('Terjadi kesalahan saat menghapus akun');
            },
        });
    };

    const openDetailModal = (user: User) => {
        setSelectedUser(user);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        if (!isDetailModalOpen) {
            setSelectedUser(null);
        }
    }, [isDetailModalOpen]);

    const getUserName = (user: User) => {
        if (user.role === 'siswa' && user.siswa) {
            return user.siswa.nama;
        } else if ((user.role === 'admin' || user.role === 'kepsek') && user.admin) {
            return user.admin.nama;
        }
        return user.email;
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-indigo-500 hover:bg-indigo-600">Admin</Badge>;
            case 'kepsek':
                return <Badge className="bg-green-500 hover:bg-green-600">Kepala Sekolah</Badge>;
            case 'siswa':
                return <Badge className="bg-purple-500 hover:bg-purple-600">Siswa</Badge>;
            default:
                return <Badge className="bg-gray-500 hover:bg-gray-600">{role}</Badge>;
        }
    };

    const handleExportPDF = () => {
        window.open('/admin/users/export-pdf', '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengelolaan Akun" />
            <div className="font-inter flex h-full flex-1 flex-col gap-6 p-4 transition-colors duration-300 sm:p-6 dark:bg-[#171717]">
                {showSuccessAlert && flash?.success && (
                    <div className="rounded-lg border border-green-100 bg-green-50/90 p-4 text-green-700 shadow-sm backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-600 dark:text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">Berhasil!</h3>
                                <p className="text-sm">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {showErrorAlert && flash?.error && (
                    <div className="rounded-lg border border-red-100 bg-red-50/90 p-4 text-red-700 shadow-sm backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-600 dark:text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-7a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">Gagal!</h3>
                                <p className="text-sm">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 dark:bg-[#171717]/90">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full flex-grow sm:w-auto">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari berdasarkan nama..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Select value={selectedRole} onValueChange={handleRoleChange}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Semua Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Role</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="kepsek">Kepala Sekolah</SelectItem>
                                    <SelectItem value="siswa">Siswa</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                                <Search className="mr-2 h-4 w-4" />
                                Cari
                            </Button>

                            <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700">
                                Export PDF Akun
                            </Button>

                            <Button asChild className="bg-green-600 hover:bg-green-700">
                                <Link href="/admin/users/create">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Tambah Akun
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md dark:border-gray-800 dark:bg-[#171717]/90">
                    {/* Petunjuk scroll di mobile */}
                    <div className="block px-3 pt-2 pb-0 text-xs text-gray-500 sm:hidden">Geser tabel ke kanan untuk melihat semua kolom</div>
                    <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 overflow-x-auto p-1">
                        <div className="min-w-[700px] md:min-w-0">
                            <Table className="min-w-full border-collapse overflow-hidden rounded-lg text-base">
                                <TableHeader className="bg-gray-100 dark:bg-gray-800/70 [&_th]:px-3 [&_th]:py-2">
                                    <TableRow className="border-b border-gray-200 text-base font-medium dark:border-gray-800">
                                        <TableHead className="rounded-l-lg text-left font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            Nama
                                        </TableHead>
                                        <TableHead className="text-left font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            Email
                                        </TableHead>
                                        <TableHead className="text-left font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            Role
                                        </TableHead>
                                        <TableHead className="text-left font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            Dibuat Pada
                                        </TableHead>
                                        <TableHead className="text-center font-semibold whitespace-nowrap text-gray-700 dark:text-gray-300">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 bg-white/70 text-base backdrop-blur-sm dark:divide-gray-800 dark:bg-gray-800/20 [&_td]:px-3 [&_td]:py-2">
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 rounded-lg text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg
                                                        className="mb-2 h-10 w-10 text-gray-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                        />
                                                    </svg>
                                                    <p className="text-sm text-gray-500">Tidak ada data akun</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user) => (
                                            <TableRow
                                                key={user.user_id}
                                                className="group transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/20"
                                            >
                                                <TableCell className="rounded-l-lg px-3 py-2 text-base font-medium whitespace-nowrap">
                                                    {getUserName(user)}
                                                </TableCell>
                                                <TableCell className="px-3 py-2 text-base whitespace-nowrap">{user.email}</TableCell>
                                                <TableCell className="px-3 py-2 whitespace-nowrap">{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="px-3 py-2 whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </TableCell>
                                                <TableCell className="rounded-r-lg px-3 py-2 text-center whitespace-nowrap">
                                                    <div className="flex flex-row flex-wrap items-center justify-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 border-yellow-500 p-0 text-yellow-500"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/users/${user.user_id}/edit`}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 border-blue-500 p-0 text-blue-500"
                                                            onClick={() => openDetailModal(user)}
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            <span className="sr-only">Detail</span>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 border-red-500 p-0 text-red-500"
                                                            onClick={() => confirmDelete(user)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            <span className="sr-only">Hapus</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>

                    {users.last_page > 1 && (
                        <div className="flex items-center justify-center p-4">
                            <nav className="flex gap-1">
                                {/* Previous */}
                                <Link
                                    href={`/admin/users?page=${users.current_page - 1}&search=${searchTerm}&role=${selectedRole}`}
                                    preserveState
                                    replace
                                    className={`border-input bg-background text-muted-foreground hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border p-0 ${users.current_page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                    aria-disabled={users.current_page === 1}
                                    tabIndex={users.current_page === 1 ? -1 : 0}
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M15 18l-6-6 6-6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </Link>
                                {/* Page numbers */}
                                {users.links.slice(1, -1).map((link, i) => (
                                    <Link
                                        key={i}
                                        href={`/admin/users?page=${i + 1}&search=${searchTerm}&role=${selectedRole}`}
                                        preserveState
                                        replace
                                        className={`border-input bg-background text-muted-foreground hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border p-0 ${link.active ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}`}
                                        aria-current={link.active ? 'page' : undefined}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                {/* Next */}
                                <Link
                                    href={`/admin/users?page=${users.current_page + 1}&search=${searchTerm}&role=${selectedRole}`}
                                    preserveState
                                    replace
                                    className={`border-input bg-background text-muted-foreground hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md border p-0 ${users.current_page === users.last_page ? 'pointer-events-none opacity-50' : ''}`}
                                    aria-disabled={users.current_page === users.last_page}
                                    tabIndex={users.current_page === users.last_page ? -1 : 0}
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path
                                            d="M9 6l6 6-6 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Modal Detail User */}
                {selectedUser && (
                    <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                        <DialogContent className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto sm:max-w-xl md:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-white">
                                    <div className="rounded-full bg-indigo-100 p-1.5 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        {selectedUser.role === 'siswa' ? (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    Detail Akun: {getUserName(selectedUser)}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-2">
                                <div className="rounded-lg border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm dark:border-gray-800 dark:bg-gray-800/50">
                                    <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Informasi Akun
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nama</span>
                                            <p className="text-sm font-medium">{getUserName(selectedUser)}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Email</span>
                                            <p className="text-sm">{selectedUser.email}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Role</span>
                                            <div>{getRoleBadge(selectedUser.role)}</div>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Dibuat Pada</span>
                                            <p className="text-sm">
                                                {new Date(selectedUser.created_at).toLocaleDateString('id-ID', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedUser.role === 'siswa' && selectedUser.siswa && (
                                    <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-purple-900/30 dark:bg-purple-900/10">
                                        <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 text-purple-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
                                                />
                                            </svg>
                                            Informasi Siswa
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nama Siswa</span>
                                                <p className="text-sm font-medium">{selectedUser.siswa.nama}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">NIS</span>
                                                <p className="font-mono text-sm">{selectedUser.siswa.nis}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Kelas</span>
                                                <p className="text-sm">{selectedUser.siswa.kelas}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</span>
                                                <p className="text-sm">
                                                    {Boolean(selectedUser.siswa.is_aktif) ? (
                                                        <Badge className="bg-green-500">Aktif</Badge>
                                                    ) : (
                                                        <Badge className="bg-gray-500">Tidak Aktif</Badge>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(selectedUser.role === 'admin' || selectedUser.role === 'kepsek') && selectedUser.admin && (
                                    <div
                                        className={`rounded-lg border p-4 shadow-sm backdrop-blur-sm ${selectedUser.role === 'admin' ? 'border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/30 dark:bg-indigo-900/10' : 'border-green-100 bg-green-50/50 dark:border-green-900/30 dark:bg-green-900/10'}`}
                                    >
                                        <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className={`h-4 w-4 ${selectedUser.role === 'admin' ? 'text-indigo-500' : 'text-green-500'}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                />
                                            </svg>
                                            {selectedUser.role === 'admin' ? 'Informasi Admin' : 'Informasi Kepala Sekolah'}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nama</span>
                                                <p className="text-sm font-medium">{selectedUser.admin.nama}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Nomor Telepon</span>
                                                <p className="font-mono text-sm">{selectedUser.admin.no_telp || '-'}</p>
                                            </div>
                                            <div className="col-span-1 space-y-1 sm:col-span-2">
                                                <span className="text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Alamat</span>
                                                <p className="text-sm">{selectedUser.admin.alamat || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="flex justify-between sm:justify-between">
                                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                                    <X className="mr-2 h-4 w-4" />
                                    Tutup
                                </Button>
                                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                    <Link href={`/admin/users/${selectedUser.user_id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Dialog Konfirmasi Delete */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="w-[95vw] sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
                                Konfirmasi Hapus Akun
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                <div className="mt-4 flex flex-col items-center justify-center gap-4">
                                    <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                            Anda akan menghapus akun{' '}
                                            <span className="font-semibold">{userToDelete ? getUserName(userToDelete) : ''}</span>
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data yang terkait dengan akun ini.
                                        </p>
                                        {deleteError && <p className="mt-3 text-sm font-medium text-red-600 dark:text-red-400">{deleteError}</p>}
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-row justify-center gap-3 sm:justify-center">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={deleteUser}
                                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menghapus...
                                    </>
                                ) : (
                                    'Hapus Akun'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
