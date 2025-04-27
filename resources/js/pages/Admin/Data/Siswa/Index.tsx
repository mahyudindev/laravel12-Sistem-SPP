import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, Calendar, Download, Eye, FileText, Loader2, Pencil, Search, Trash2, UserPlus, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Data Siswa',
        href: '/admin/siswa',
    },
];

interface Siswa {
    siswa_id: number;
    nama: string;
    nis: string;
    kelas: string;
    jenis_kelamin?: string;
    alamat?: string;
    no_hp?: string;
    tanggal_lahir?: string;
    tanggal_masuk?: string;
    is_aktif: boolean;
    user_id?: number;
    email?: string;
}

interface SiswaProps {
    siswa: {
        data: Siswa[];
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
        search?: string;
        kelas?: string;
        status?: string;
    };
    kelasList: string[];
}

export default function SiswaIndex({ siswa, filters, kelasList }: SiswaProps) {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [siswaToDelete, setSiswaToDelete] = useState<Siswa | null>(null);

    const confirmDelete = (siswa: Siswa) => {
        setSiswaToDelete(siswa);
        setIsDeleteModalOpen(true);
    };

    const handleExportPDF = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(`/admin/siswa/export-pdf?search=${searchTerm}&kelas=${selectedKelas}&status=${selectedStatus}`, '_blank');
    };
    
    const handleExportExcel = (e: React.MouseEvent) => {
        e.preventDefault();
        window.open(`/admin/siswa/export-excel?search=${searchTerm}&kelas=${selectedKelas}&status=${selectedStatus}`, '_blank');
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

    const deleteSiswa = () => {
        if (!siswaToDelete) return;

        setIsDeleting(true);
        setDeleteError(null);

        router.delete(`/admin/siswa/${siswaToDelete.siswa_id}`, {
            onSuccess: () => {
                setIsDeleting(false);
                setIsDeleteModalOpen(false);
                setSiswaToDelete(null);
            },
            onError: (errors) => {
                console.error('Error:', errors);
                setIsDeleting(false);
                setDeleteError('Terjadi kesalahan saat menghapus data siswa');
            },
        });
    };

    const handleSearch = () => {
        router.get(
            '/admin/siswa',
            {
                search: searchTerm,
                kelas: selectedKelas,
                status: selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleKelasChange = (value: string) => {
        setSelectedKelas(value);
        router.get(
            '/admin/siswa',
            {
                search: searchTerm,
                kelas: value,
                status: selectedStatus,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        router.get(
            '/admin/siswa',
            {
                search: searchTerm,
                kelas: selectedKelas,
                status: value,
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const getJenisKelaminBadge = (jk?: string) => {
        if (!jk) return '-';
        
        switch (jk) {
            case 'L':
                return <Badge className="bg-blue-500 hover:bg-blue-600">Laki-laki</Badge>;
            case 'P':
                return <Badge className="bg-pink-500 hover:bg-pink-600">Perempuan</Badge>;
            default:
                return <Badge className="bg-gray-500 hover:bg-gray-600">{jk}</Badge>;
        }
    };

    const getStatusBadge = (status: boolean) => {
        return status ? 
            <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge> : 
            <Badge className="bg-gray-500 hover:bg-gray-600">Tidak Aktif</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Siswa" />
            <div className="font-inter flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 transition-colors duration-300 dark:bg-[#171717]">
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
                <div className="rounded-lg bg-white/80 p-4 sm:p-6 shadow-md backdrop-blur-sm dark:bg-[#171717]/90">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:w-auto flex-grow">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Cari berdasarkan nama atau NIS..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Select value={selectedKelas} onValueChange={handleKelasChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Semua Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kelas</SelectItem>
                                    {kelasList.map((kelas) => (
                                        <SelectItem key={kelas} value={kelas}>
                                            {kelas}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Semua Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="aktif">Aktif</SelectItem>
                                    <SelectItem value="nonaktif">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleSearch} className="bg-indigo-600 hover:bg-indigo-700">
                                <Search className="mr-2 h-4 w-4" />
                                Cari
                            </Button>

                            <Button onClick={handleExportPDF} className="bg-red-600 hover:bg-red-700" title="Export PDF">
                                <FileText className="mr-2 h-4 w-4" />
                                PDF
                            </Button>

                            <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700" title="Export Excel">
                                <Download className="mr-2 h-4 w-4" />
                                Excel
                            </Button>

                            <Button asChild className="bg-green-600 hover:bg-green-700">
                                <Link href="/admin/siswa/create">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Tambah Siswa
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-100 bg-white/80 shadow-md backdrop-blur-sm dark:border-gray-800 dark:bg-[#171717]/90">
                    {/* Petunjuk scroll di mobile */}
                    <div className="block sm:hidden px-3 pt-2 pb-0 text-xs text-gray-500">Geser tabel ke kanan untuk melihat semua kolom</div>
                    <div className="overflow-x-auto p-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
                        <div className="min-w-[700px] md:min-w-0">
                            <Table className="min-w-full overflow-hidden rounded-lg text-base border-collapse">
                                <TableHeader className="bg-gray-100 dark:bg-gray-800/70 [&_th]:py-2 [&_th]:px-3">
                                    <TableRow className="border-b border-gray-200 dark:border-gray-800 text-base font-medium">
                                        <TableHead className="rounded-l-lg text-left whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">NIS</TableHead>
                                        <TableHead className="text-left whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">Nama</TableHead>
                                        <TableHead className="text-left whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">Jenis Kelamin</TableHead>
                                        <TableHead className="text-left whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">Kelas</TableHead>
                                        <TableHead className="text-left whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">Status</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 bg-white/70 backdrop-blur-sm dark:divide-gray-800 dark:bg-gray-800/20 text-base [&_td]:py-2 [&_td]:px-3">
                                    {siswa.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 rounded-lg text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg className="mb-2 h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                                        />
                                                    </svg>
                                                    <p className="text-sm text-gray-500">Tidak ada data siswa</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        siswa.data.map((item) => (
                                            <TableRow
                                                key={item.siswa_id}
                                                className="group transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/20"
                                            >
                                                <TableCell className="rounded-l-lg whitespace-nowrap text-base py-2 px-3">{item.nis}</TableCell>
                                                <TableCell className="whitespace-nowrap font-medium text-base py-2 px-3">{item.nama}</TableCell>
                                                <TableCell className="whitespace-nowrap py-2 px-3">{getJenisKelaminBadge(item.jenis_kelamin)}</TableCell>
                                                <TableCell className="whitespace-nowrap py-2 px-3">{item.kelas}</TableCell>
                                                <TableCell className="whitespace-nowrap py-2 px-3">{getStatusBadge(item.is_aktif)}</TableCell>
                                                <TableCell className="rounded-r-lg text-center whitespace-nowrap py-2 px-3">
                                                    <div className="flex flex-row flex-wrap items-center justify-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 border-yellow-500 p-0 text-yellow-500"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/siswa/${item.siswa_id}/edit`}>
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                <span className="sr-only">Edit</span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 border-blue-500 p-0 text-blue-500"
                                                            asChild
                                                        >
                                                            <Link href={`/admin/siswa/${item.siswa_id}`}>
                                                                <Eye className="h-3.5 w-3.5" />
                                                                <span className="sr-only">Detail</span>
                                                            </Link>
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 w-7 border-red-500 p-0 text-red-500"
                                                            onClick={() => confirmDelete(item)}
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

                    {siswa.last_page > 1 && (
                        <div className="flex items-center justify-center p-4">
                            <nav className="flex gap-1">
                                {/* Previous */}
                                <Link
                                    href={`/admin/siswa?page=${siswa.current_page - 1}&search=${searchTerm}&kelas=${selectedKelas}&status=${selectedStatus}`}
                                    preserveState
                                    replace
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${siswa.current_page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                    aria-disabled={siswa.current_page === 1}
                                    tabIndex={siswa.current_page === 1 ? -1 : 0}
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Link>
                                {/* Page numbers */}
                                {siswa.links.slice(1, -1).map((link, i) => (
                                    <Link
                                        key={i}
                                        href={`/admin/siswa?page=${i + 1}&search=${searchTerm}&kelas=${selectedKelas}&status=${selectedStatus}`}
                                        preserveState
                                        replace
                                        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${link.active ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}`}
                                        aria-current={link.active ? 'page' : undefined}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                {/* Next */}
                                <Link
                                    href={`/admin/siswa?page=${siswa.current_page + 1}&search=${searchTerm}&kelas=${selectedKelas}&status=${selectedStatus}`}
                                    preserveState
                                    replace
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${siswa.current_page === siswa.last_page ? 'pointer-events-none opacity-50' : ''}`}
                                    aria-disabled={siswa.current_page === siswa.last_page}
                                    tabIndex={siswa.current_page === siswa.last_page ? -1 : 0}
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </Link>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Dialog Konfirmasi Delete */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="w-[95vw] sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-center text-xl font-semibold text-gray-900 dark:text-white">
                                Konfirmasi Hapus Siswa
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                <div className="mt-4 flex flex-col items-center justify-center gap-4">
                                    <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium text-gray-700 dark:text-gray-300">
                                            Anda akan menghapus data siswa{' '}
                                            <span className="font-semibold">{siswaToDelete ? siswaToDelete.nama : ''}</span>
                                        </p>
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data yang terkait dengan siswa ini.
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
                                onClick={deleteSiswa}
                                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menghapus...
                                    </>
                                ) : (
                                    'Hapus Siswa'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
