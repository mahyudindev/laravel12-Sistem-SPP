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
        title: 'Data SPP',
        href: '/admin/spp',
    },
];

interface Spp {
    spp_id: number;
    nama: string;
    tahun_ajaran: string;
    nominal: number;
    is_aktif: boolean;
    created_at: string;
}

interface SppProps {
    spp: {
        data: Spp[];
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
    };
}

export default function SppIndex({ spp, filters }: SppProps) {
    const { flash } = usePage().props as any;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState(filters.tahun_ajaran || 'all');
    
    // Ekstrak tahun ajaran unik dari data
    const uniqueTahunAjaran = useMemo(() => {
        const years = spp.data.map(item => item.tahun_ajaran);
        return ['all', ...Array.from(new Set(years))];
    }, [spp.data]);
    
    // State untuk modal create/edit
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSpp, setSelectedSpp] = useState<Spp | null>(null);
    const [processing, setProcessing] = useState(false);
    
    // State untuk form create/edit
    const [formValues, setFormValues] = useState({
        nama: '',
        tahun_ajaran: '',
        nominal: '',
        is_aktif: true,
    });
    
    // State untuk alert
    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);
    const [showErrorAlert, setShowErrorAlert] = useState(!!flash?.error);
    const [successMessage, setSuccessMessage] = useState(flash?.success || 'Operasi berhasil');
    const [errorMessage, setErrorMessage] = useState(flash?.error || 'Operasi gagal');

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setShowSuccessAlert(true);
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }

        if (flash?.error) {
            setErrorMessage(flash.error);
            setShowErrorAlert(true);
            const timer = setTimeout(() => {
                setShowErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSearch = () => {
        router.get('/admin/spp', {
            search: searchTerm,
            status: selectedStatus,
            tahun_ajaran: selectedTahunAjaran,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        router.get('/admin/spp', {
            search: searchTerm,
            status: value,
            tahun_ajaran: selectedTahunAjaran,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleTahunAjaranChange = (value: string) => {
        setSelectedTahunAjaran(value);
        router.get('/admin/spp', {
            search: searchTerm,
            status: selectedStatus,
            tahun_ajaran: value,
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
        });
        setIsCreateModalOpen(true);
    };

    const openEditModal = (spp: Spp) => {
        setSelectedSpp(spp);
        setFormValues({
            nama: spp.nama,
            tahun_ajaran: spp.tahun_ajaran,
            nominal: String(spp.nominal),
            is_aktif: spp.is_aktif,
        });
        setIsEditModalOpen(true);
    };

    const openDetailModal = (spp: Spp) => {
        setSelectedSpp(spp);
        setIsDetailModalOpen(true);
    };

    const confirmDelete = (spp: Spp) => {
        setSelectedSpp(spp);
        setIsDeleteModalOpen(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
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
        
        router.post('/admin/spp', {
            nama: formValues.nama,
            tahun_ajaran: formValues.tahun_ajaran,
            nominal: formValues.nominal,
            is_aktif: formValues.is_aktif,
        }, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setProcessing(false);
                setSuccessMessage('Data SPP berhasil ditambahkan');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 5000);
            },
            onError: () => {
                setProcessing(false);
                setErrorMessage('Gagal menambahkan data SPP');
                setShowErrorAlert(true);
                setTimeout(() => setShowErrorAlert(false), 5000);
            },
            preserveScroll: true,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!selectedSpp) return;
        
        setProcessing(true);
        
        router.put(`/admin/spp/${selectedSpp.spp_id}`, {
            nama: formValues.nama,
            tahun_ajaran: formValues.tahun_ajaran,
            nominal: formValues.nominal,
            is_aktif: formValues.is_aktif,
        }, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                setProcessing(false);
                setSuccessMessage('Data SPP berhasil diperbarui');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 5000);
            },
            onError: () => {
                setProcessing(false);
                setErrorMessage('Gagal memperbarui data SPP');
                setShowErrorAlert(true);
                setTimeout(() => setShowErrorAlert(false), 5000);
            },
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!selectedSpp) return;
        
        setProcessing(true);
        
        router.delete(`/admin/spp/${selectedSpp.spp_id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                setProcessing(false);
                setSuccessMessage('Data SPP berhasil dihapus');
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 5000);
            },
            onError: () => {
                setProcessing(false);
                setErrorMessage('Gagal menghapus data SPP');
                setShowErrorAlert(true);
                setTimeout(() => setShowErrorAlert(false), 5000);
            },
            preserveScroll: true,
        });
    };

    const toggleStatus = (spp: Spp) => {
        router.put(`/admin/spp/${spp.spp_id}/toggle-status`, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setSuccessMessage(`Status SPP ${spp.nama} berhasil diubah`);
                setShowSuccessAlert(true);
                setTimeout(() => setShowSuccessAlert(false), 5000);
            },
            onError: () => {
                setErrorMessage(`Gagal mengubah status SPP ${spp.nama}`);
                setShowErrorAlert(true);
                setTimeout(() => setShowErrorAlert(false), 5000);
            }
        });
    };

    function getStatusBadge(status: boolean) {
        return status ? (
            <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge>
        ) : (
            <Badge variant="outline" className="text-gray-500 border-gray-300 hover:bg-gray-100">
                Tidak Aktif
            </Badge>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data SPP" />
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
                        </div>
                    </div>
                )}
                
                {showErrorAlert && (
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
                                <p className="text-sm">{errorMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header & Filter */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Data SPP</h2>
                    <Button 
                        onClick={openCreateModal} 
                        variant="outline" 
                        className="bg-white text-black border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 w-full md:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah SPP
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
                                        <SelectItem key={index} value={tahunAjaran}>{tahunAjaran}</SelectItem>
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
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Nominal</TableHead>
                                    <TableHead className="py-2 px-3 text-left text-xs font-medium uppercase tracking-wider">Status</TableHead>
                                    <TableHead className="py-2 px-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {spp.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileText className="h-10 w-10 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-500">Tidak ada data SPP</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    spp.data.map((item) => (
                                        <TableRow key={item.spp_id} 
                                            className="border-b border-gray-200 dark:border-gray-700 group transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                                            <TableCell className="py-2 px-3 font-medium whitespace-nowrap">{item.nama}</TableCell>
                                            <TableCell className="py-2 px-3 whitespace-nowrap">{item.tahun_ajaran}</TableCell>
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
                {spp.last_page > 1 && (
                    <div className="flex items-center justify-center p-4">
                        <nav className="flex gap-1">
                            {/* Previous */}
                            <Link
                                href={`/admin/spp?page=${spp.current_page - 1}&search=${searchTerm}&status=${selectedStatus}&tahun_ajaran=${selectedTahunAjaran}`}
                                preserveState
                                replace
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${spp.current_page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                aria-disabled={spp.current_page === 1}
                                tabIndex={spp.current_page === 1 ? -1 : 0}
                            >
                                <span className="sr-only">Previous</span>
                                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Link>
                            {/* Page numbers */}
                            {spp.links.slice(1, -1).map((link, i) => (
                                <Link
                                    key={i}
                                    href={`/admin/spp?page=${i + 1}&search=${searchTerm}&status=${selectedStatus}&tahun_ajaran=${selectedTahunAjaran}`}
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
                                href={`/admin/spp?page=${spp.current_page + 1}&search=${searchTerm}&status=${selectedStatus}&tahun_ajaran=${selectedTahunAjaran}`}
                                preserveState
                                replace
                                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background p-0 text-muted-foreground hover:text-foreground ${spp.current_page === spp.last_page ? 'pointer-events-none opacity-50' : ''}`}
                                aria-disabled={spp.current_page === spp.last_page}
                                tabIndex={spp.current_page === spp.last_page ? -1 : 0}
                            >
                                <span className="sr-only">Next</span>
                                <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </Link>
                        </nav>
                    </div>
                )}
            </div>

            {/* Modal Create */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah SPP</DialogTitle>
                        <DialogDescription>
                            Isi form berikut untuk menambahkan data SPP baru.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label htmlFor="nama" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nama
                                </label>
                                <Input
                                    id="nama"
                                    name="nama"
                                    value={formValues.nama}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nama SPP"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="tahun_ajaran" className="text-sm font-medium">
                                    Tahun Ajaran <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="tahun_ajaran"
                                    name="tahun_ajaran"
                                    value={formValues.tahun_ajaran}
                                    onChange={handleInputChange}
                                    placeholder="Contoh: 2024/2025"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="nominal" className="text-sm font-medium">
                                    Nominal <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="nominal"
                                    name="nominal"
                                    type="number"
                                    value={formValues.nominal}
                                    onChange={handleInputChange}
                                    placeholder="Masukkan nominal SPP"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_aktif"
                                    checked={formValues.is_aktif}
                                    onCheckedChange={handleSwitchChange}
                                />
                                <label htmlFor="is_aktif" className="text-sm font-medium">
                                    SPP Aktif
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
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
                        <DialogTitle>Edit SPP</DialogTitle>
                        <DialogDescription>
                            Edit data SPP dengan mengisi form berikut
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label htmlFor="edit-nama" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Nama
                                </label>
                                <Input
                                    id="edit-nama"
                                    name="nama"
                                    type="text"
                                    value={formValues.nama}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-tahun_ajaran" className="text-sm font-medium">Tahun Ajaran <span className="text-red-500">*</span></label>
                                <Input
                                    id="edit-tahun_ajaran"
                                    name="tahun_ajaran"
                                    type="text"
                                    value={formValues.tahun_ajaran}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="edit-nominal" className="text-sm font-medium">Nominal <span className="text-red-500">*</span></label>
                                <Input
                                    id="edit-nominal"
                                    name="nominal"
                                    type="number"
                                    value={formValues.nominal}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="edit-is_aktif"
                                    checked={formValues.is_aktif}
                                    onCheckedChange={handleSwitchChange}
                                />
                                <label htmlFor="edit-is_aktif" className="text-sm font-medium">SPP Aktif</label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
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
                        <DialogTitle>Detail SPP</DialogTitle>
                        <DialogDescription>
                            Detail lengkap data SPP
                        </DialogDescription>
                    </DialogHeader>
                    {selectedSpp && (
                        <div className="space-y-4 py-2">
                            <div>
                                <div className="text-xs font-medium text-gray-500">Nama</div>
                                <div className="font-semibold text-base">{selectedSpp.nama}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Tahun Ajaran</div>
                                <div className="font-semibold text-base">{selectedSpp.tahun_ajaran}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Nominal</div>
                                <div className="font-semibold text-base">{formatRupiah(selectedSpp.nominal)}</div>
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Status</div>
                                {getStatusBadge(selectedSpp.is_aktif)}
                            </div>
                            <div>
                                <div className="text-xs font-medium text-gray-500">Dibuat Pada</div>
                                <div className="text-sm">{new Date(selectedSpp.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDetailModalOpen(false)}>
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
                            Apakah Anda yakin ingin menghapus data SPP ini? Data yang telah dihapus tidak dapat dikembalikan.
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
        </AppLayout>
    );
}