import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertCircle, FileText, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { formatRupiah } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Data PPDB',
        href: '/admin/ppdb',
    },
];

interface Ppdb {
    ppdb_id: number;
    nama: string;
    tahun_ajaran: string;
    nominal: number;
    is_aktif: boolean;
    kelas: string;
    created_at: string;
}

interface PpdbProps {
    ppdb: {
        data: Ppdb[];
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
        status?: string;
        tahun_ajaran?: string;
        kelas?: string;
    };
}

export default function PpdbIndex({ ppdb, filters }: PpdbProps) {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(filters.tahun_ajaran || 'all');
    const [selectedKelas, setSelectedKelas] = useState(filters.kelas || 'all');
    
    // Ekstrak tahun ajaran unik dari data
    const uniqueTahunAjaran = useMemo(() => {
        const years = ppdb.data.map(item => item.tahun_ajaran);
        return ['all', ...Array.from(new Set(years))];
    }, [ppdb.data]);
    
    // Ekstrak kelas unik dari data
    const uniqueKelas = useMemo(() => {
        const kelasList = ppdb.data.map(item => item.kelas).filter(Boolean);
        return ['all', ...Array.from(new Set(kelasList))];
    }, [ppdb.data]);
    
    // State untuk modal create/edit
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPpdb, setSelectedPpdb] = useState<Ppdb | null>(null);
    const [processing, setProcessing] = useState(false);
    
    // State untuk form create/edit
    const [formValues, setFormValues] = useState({
        nama: '',
        tahun_ajaran: '',
        nominal: '',
        is_aktif: true,
        kelas: '',
    });
    
    // State untuk alert
    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);
    const [showErrorAlert, setShowErrorAlert] = useState(!!flash?.error);
    const [successMessage, setSuccessMessage] = useState(flash?.success || 'Operasi berhasil');
    const [errorMessage, setErrorMessage] = useState(flash?.error || 'Operasi gagal');
    
    // Effect untuk hide alert setelah beberapa detik
    useEffect(() => {
        let successTimer: NodeJS.Timeout;
        let errorTimer: NodeJS.Timeout;
        
        if (showSuccessAlert) {
            successTimer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 3000);
        }
        
        if (showErrorAlert) {
            errorTimer = setTimeout(() => {
                setShowErrorAlert(false);
            }, 3000);
        }
        
        return () => {
            clearTimeout(successTimer);
            clearTimeout(errorTimer);
        };
    }, [showSuccessAlert, showErrorAlert]);
    
    const handleSearch = () => {
        router.get('/admin/ppdb', {
            search: searchTerm,
            status: selectedStatus,
            tahun_ajaran: selectedTahunAjaran,
            kelas: selectedKelas,
        }, {
            preserveState: true,
            replace: true,
        });
    };
    
    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        router.get('/admin/ppdb', {
            search: searchTerm,
            status: value,
            tahun_ajaran: selectedTahunAjaran,
            kelas: selectedKelas,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTahunAjaranChange = (value: string) => {
        setSelectedTahunAjaran(value);
        router.get('/admin/ppdb', {
            search: searchTerm,
            status: selectedStatus,
            tahun_ajaran: value,
            kelas: selectedKelas,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleKelasChange = (value: string) => {
        setSelectedKelas(value);
        router.get('/admin/ppdb', {
            search: searchTerm,
            status: selectedStatus,
            tahun_ajaran: selectedTahunAjaran,
            kelas: value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const openCreateModal = () => {
        setFormValues({
            nama: '',
            tahun_ajaran: '',
            nominal: '',
            is_aktif: true,
            kelas: '',
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (ppdb: Ppdb) => {
        setSelectedPpdb(ppdb);
        setFormValues({
            nama: ppdb.nama,
            tahun_ajaran: ppdb.tahun_ajaran,
            nominal: String(ppdb.nominal),
            is_aktif: ppdb.is_aktif,
            kelas: ppdb.kelas || '',
        });
        setIsEditModalOpen(true);
    };

    const openDetailModal = (ppdb: Ppdb) => {
        setSelectedPpdb(ppdb);
        setIsDetailModalOpen(true);
    };

    const confirmDelete = (ppdb: Ppdb) => {
        setSelectedPpdb(ppdb);
        setIsDeleteModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormValues({
            ...formValues,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormValues({
            ...formValues,
            is_aktif: checked,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/admin/ppdb', {
            nama: formValues.nama,
            tahun_ajaran: formValues.tahun_ajaran,
            nominal: formValues.nominal,
            is_aktif: formValues.is_aktif,
            kelas: formValues.kelas,
        }, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setProcessing(false);
                setSuccessMessage('Data PPDB berhasil ditambahkan');
                setShowSuccessAlert(true);
            },
            onError: (errors) => {
                setProcessing(false);
                setErrorMessage('Gagal menambahkan data PPDB');
                setShowErrorAlert(true);
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPpdb) return;

        setProcessing(true);
        router.put(`/admin/ppdb/${selectedPpdb.ppdb_id}`, {
            nama: formValues.nama,
            tahun_ajaran: formValues.tahun_ajaran,
            nominal: formValues.nominal,
            is_aktif: formValues.is_aktif,
            kelas: formValues.kelas,
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setProcessing(false);
                setSuccessMessage('Data PPDB berhasil diperbarui');
                setShowSuccessAlert(true);
            },
            onError: (errors) => {
                setProcessing(false);
                setErrorMessage('Gagal memperbarui data PPDB');
                setShowErrorAlert(true);
            },
        });
    };

    const handleDelete = () => {
        if (!selectedPpdb) return;
        
        setProcessing(true);
        router.delete(`/admin/ppdb/${selectedPpdb.ppdb_id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessing(false);
                setSuccessMessage('Data PPDB berhasil dihapus');
                setShowSuccessAlert(true);
            },
            onError: (errors) => {
                setProcessing(false);
                setErrorMessage('Gagal menghapus data PPDB');
                setShowErrorAlert(true);
            },
        });
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge variant="outline" className="bg-green-500 hover:bg-green-500 text-white border-none">
                Aktif
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-gray-500 hover:bg-gray-500 text-white border-none">
                Tidak Aktif
            </Badge>
        );
    };

    // Page title component
    const pageTitle = (
        <Head title="Data PPDB" />
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            {pageTitle}
            <div className="font-inter flex h-full flex-1 flex-col gap-6 p-4 sm:p-6 transition-colors duration-300 dark:bg-[#171717]">
                {showSuccessAlert && (
                    <div className="rounded-lg border border-green-100 bg-green-50/90 p-4 text-green-700 shadow-sm backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                <svg
                                    className="h-5 w-5 text-green-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    aria-hidden="true"
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
                                <p className="text-sm">{successMessage}</p>
                            </div>
                            <button
                                type="button"
                                className="ml-auto rounded-md p-1 text-green-600 hover:bg-green-200 hover:text-green-800 dark:text-green-300 dark:hover:bg-green-800/50 dark:hover:text-green-100"
                                onClick={() => setShowSuccessAlert(false)}
                            >
                                <span className="sr-only">Tutup</span>
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {showErrorAlert && (
                    <div className="rounded-lg border border-red-100 bg-red-50/90 p-4 text-red-700 shadow-sm backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-medium">Gagal!</h3>
                                <p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header & Filter */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Data PPDB</h2>
                    <Button 
                        onClick={openCreateModal} 
                        variant="outline" 
                        className="bg-white text-black border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 w-full md:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah PPDB
                    </Button>
                </div>

                {/* Filter & Search */}
                <div className="rounded-lg bg-white/80 p-4 sm:p-6 shadow-md backdrop-blur-sm dark:bg-[#171717]/90">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:w-auto flex-grow">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Cari berdasarkan nama atau tahun ajaran..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-10"
                            />
                        </div>
                        
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <Select value={selectedStatus} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="active">Aktif</SelectItem>
                                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={selectedTahunAjaran} onValueChange={handleTahunAjaranChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Tahun Ajaran" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueTahunAjaran.map((tahunAjaran, index) => (
                                        <SelectItem key={index} value={tahunAjaran}>{tahunAjaran === 'all' ? 'Semua Tahun Ajaran' : tahunAjaran}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedKelas} onValueChange={handleKelasChange}>
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {uniqueKelas.map((kelas, index) => (
                                        <SelectItem key={index} value={kelas}>{kelas === 'all' ? 'Semua Kelas' : kelas}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Button 
                                onClick={handleSearch} 
                                variant="outline" 
                                className="bg-white text-black border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                            >
                                <Search className="mr-2 h-4 w-4" /> Cari
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg bg-white/80 shadow-md backdrop-blur-sm dark:bg-[#171717]/90">
                    <div className="overflow-x-auto">
                        <Table className="w-full border-collapse">
                            <TableHeader>
                                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Nama</TableHead>
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Tahun Ajaran</TableHead>
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Kelas</TableHead>
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Nominal</TableHead>
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="py-2 px-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ppdb.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileText className="h-10 w-10 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">Tidak ada data PPDB</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    ppdb.data.map((item) => (
                                        <TableRow key={item.ppdb_id} 
                                            className="border-b border-gray-200 dark:border-gray-700 group transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                                            <TableCell className="py-2 px-3 font-medium whitespace-nowrap">{item.nama}</TableCell>
                                            <TableCell className="py-2 px-3 whitespace-nowrap">{item.tahun_ajaran}</TableCell>
                                            <TableCell className="py-2 px-3 whitespace-nowrap">{item.kelas}</TableCell>
                                            <TableCell className="py-2 px-3 whitespace-nowrap">{formatRupiah(item.nominal)}</TableCell>
                                            <TableCell className="py-2 px-3">
                                                {getStatusBadge(item.is_aktif)}
                                            </TableCell>
                                            <TableCell className="py-2 px-3 text-center">
                                                <div className="flex justify-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 border-blue-500 p-0 text-blue-500"
                                                        onClick={() => openDetailModal(item)}
                                                    >
                                                        <span className="sr-only">Detail</span>
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 border-yellow-500 p-0 text-yellow-500"
                                                        onClick={() => openEditModal(item)}
                                                    >
                                                        <span className="sr-only">Edit</span>
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 w-7 border-red-500 p-0 text-red-500"
                                                        onClick={() => confirmDelete(item)}
                                                    >
                                                        <span className="sr-only">Hapus</span>
                                                        <Trash2 className="h-3.5 w-3.5" />
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

                {/* Pagination */}
                {ppdb.data.length > 0 && ppdb.links.length > 3 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-1">
                            {/* Previous */}
                            <Link
                                href={`/admin/ppdb?page=${ppdb.current_page - 1}&search=${searchTerm}&status=${selectedStatus}&tahun_ajaran=${selectedTahunAjaran}&kelas=${selectedKelas}`}
                                preserveState
                                replace
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${ppdb.current_page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <span className="sr-only">Go to previous page</span>
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            </Link>
                            {/* Page numbers */}
                            {ppdb.links.slice(1, -1).map((link, i) => (
                                <Link
                                    key={i}
                                    href={`/admin/ppdb?page=${i + 1}&search=${searchTerm}&status=${selectedStatus}&tahun_ajaran=${selectedTahunAjaran}&kelas=${selectedKelas}`}
                                    preserveState
                                    replace
                                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${link.active ? 'bg-primary text-primary-foreground hover:bg-primary/80' : ''}`}
                                >
                                    <span className="text-sm">{i + 1}</span>
                                </Link>
                            ))}
                            {/* Next */}
                            <Link
                                href={`/admin/ppdb?page=${ppdb.current_page + 1}&search=${searchTerm}&status=${selectedStatus}&tahun_ajaran=${selectedTahunAjaran}&kelas=${selectedKelas}`}
                                preserveState
                                replace
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${ppdb.current_page === ppdb.last_page ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                <span className="sr-only">Go to next page</span>
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </Link>
                        </nav>
                    </div>
                )}

                {/* Modal Create */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Tambah PPDB</DialogTitle>
                            <DialogDescription>
                                Isi form berikut untuk menambahkan data PPDB baru.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="nama" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nama
                                </label>
                                <Input
                                    type="text"
                                    id="nama"
                                    name="nama"
                                    value={formValues.nama}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="tahun_ajaran" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Tahun Ajaran
                                </label>
                                <Input
                                    type="text"
                                    id="tahun_ajaran"
                                    name="tahun_ajaran"
                                    value={formValues.tahun_ajaran}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    placeholder="2023/2024"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="kelas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Kelas
                                </label>
                                <Select value={formValues.kelas} onValueChange={value => setFormValues(v => ({ ...v, kelas: value }))}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="TK A">TK A</SelectItem>
                                        <SelectItem value="TK B">TK B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="nominal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nominal
                                </label>
                                <Input
                                    type="number"
                                    id="nominal"
                                    name="nominal"
                                    value={formValues.nominal}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_aktif"
                                    checked={formValues.is_aktif}
                                    onCheckedChange={handleSwitchChange}
                                />
                                <label htmlFor="is_aktif" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Aktif
                                </label>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Edit */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit PPDB</DialogTitle>
                            <DialogDescription>
                                Edit data PPDB dengan mengisi form berikut
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="edit-nama" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nama PPDB
                                </label>
                                <Input
                                    type="text"
                                    id="edit-nama"
                                    name="nama"
                                    value={formValues.nama}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-tahun_ajaran" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Tahun Ajaran
                                </label>
                                <Input
                                    type="text"
                                    id="edit-tahun_ajaran"
                                    name="tahun_ajaran"
                                    value={formValues.tahun_ajaran}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    placeholder="2023/2024"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-kelas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Kelas
                                </label>
                                <Select
                                    value={formValues.kelas || "none"}
                                    onValueChange={value => setFormValues(v => ({ ...v, kelas: value === "none" ? "" : value }))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak Ada</SelectItem>
                                        <SelectItem value="TK A">TK A</SelectItem>
                                        <SelectItem value="TK B">TK B</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-nominal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nominal
                                </label>
                                <Input
                                    type="number"
                                    id="edit-nominal"
                                    name="nominal"
                                    value={formValues.nominal}
                                    onChange={handleInputChange}
                                    className="w-full"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-is_aktif"
                                    checked={formValues.is_aktif}
                                    onCheckedChange={handleSwitchChange}
                                />
                                <label htmlFor="edit-is_aktif" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Aktif
                                </label>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Modal Detail/Show */}
                <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Detail PPDB</DialogTitle>
                            <DialogDescription>
                                Detail lengkap data PPDB
                            </DialogDescription>
                        </DialogHeader>
                        {selectedPpdb && (
                            <div className="space-y-4 py-2">
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="font-semibold">Nama PPDB</div>
                                    <div className="col-span-2">{selectedPpdb.nama}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="font-semibold">Tahun Ajaran</div>
                                    <div className="col-span-2">{selectedPpdb.tahun_ajaran}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="font-semibold">Kelas</div>
                                    <div className="col-span-2">{selectedPpdb.kelas}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="font-semibold">Nominal</div>
                                    <div className="col-span-2">{formatRupiah(selectedPpdb.nominal)}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="font-semibold">Status</div>
                                    <div className="col-span-2">{selectedPpdb.is_aktif ? 'Aktif' : 'Tidak Aktif'}</div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Delete */}
                <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus data PPDB ini? Data yang telah dihapus tidak dapat dikembalikan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                                {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
