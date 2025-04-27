'use client';

import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Table, 
    TableBody, 
    TableCaption, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, ImageIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { toast, Toaster } from 'sonner';

interface PembayaranDetailItem {
    id: string;
    sppName: string | null;
    ppdbName: string | null;
    amount: string;
}

interface PembayaranItem {
    id: string | number;
    name: string;
    status: string;
    amount: string;
    date: string;
    method: string;
    keterangan?: string;
    receiptNumber?: string;
    photoUrl?: string | null;
    rejectionReason?: string | null;
    approvalDate?: string | null;
    siswa: {
        id: string | number | null;
        name: string;
        kelas: string;
        nis: string;
    };
    details: PembayaranDetailItem[];
}

interface Siswa {
    id: string | number | null;
    name: string;
    kelas: string;
    nis: string;
}

interface Props {
    pembayaran: PembayaranItem[];
    totalPembayaranLunas: string;
    totalPembayaranPending: string;
}

function PembayaranAdmin({ pembayaran, totalPembayaranLunas, totalPembayaranPending }: Props) {
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<PembayaranItem | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [approvalNote, setApprovalNote] = useState('');
    const [processing, setProcessing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('semua');
    const [filteredData, setFilteredData] = useState<PembayaranItem[]>(pembayaran);
    const [paymentData, setPaymentData] = useState<PembayaranItem[]>(pembayaran);
    
    const [countLunas, setCountLunas] = useState<number>(0);
    const [countPending, setCountPending] = useState<number>(0);
    
    const [paymentIdToApprove, setPaymentIdToApprove] = useState<string | number | null>(null);
    const [paymentIdToReject, setPaymentIdToReject] = useState<string | number | null>(null);
    
    const parseNominal = (nominal: string): number => {
        return parseInt(nominal.replace(/[^0-9]/g, '')) || 0;
    };
    
    const formatRupiah = (value: number): string => {
        return `Rp. ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
    };

    useEffect(() => {
        if (filterStatus === 'semua') {
            setFilteredData(paymentData);
        } else {
            setFilteredData(paymentData.filter(item => item.status === filterStatus));
        }
    }, [filterStatus, paymentData]);
    
    useEffect(() => {
        const totalLunas = parseNominal(totalPembayaranLunas);
        const totalPending = parseNominal(totalPembayaranPending);
        const duration = 1500;
        const steps = 30;
        const stepTime = duration / steps;
        
        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            
            const progress = 1 - Math.pow(1 - currentStep / steps, 3);
            
            setCountLunas(Math.floor(totalLunas * progress));
            setCountPending(Math.floor(totalPending * progress));
            
            if (currentStep >= steps) {
                clearInterval(timer);
                setCountLunas(totalLunas);
                setCountPending(totalPending);
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [totalPembayaranLunas, totalPembayaranPending]);

    const handleDetail = (payment: PembayaranItem) => {
        setSelectedPayment(payment);
        setDetailDialogOpen(true);
    };

    const handleShowImage = (payment: PembayaranItem) => {
        if (payment.photoUrl) {
            setSelectedPayment(payment);
            setImageDialogOpen(true);
        } else {
            toast.error('Bukti pembayaran tidak tersedia', {
                position: 'top-center',
                duration: 3000
            });
        }
    };

    const openRejectDialog = (payment: PembayaranItem) => {
        if (!payment) {
            toast.error('Tidak dapat menolak pembayaran: Data tidak valid', {
                position: 'top-center',
                duration: 3000
            });
            return;
        }
        
        if (!payment.id) {
            toast.error('Tidak dapat menolak pembayaran: ID tidak ditemukan', {
                position: 'top-center', 
                duration: 3000
            });
            return;
        }
        
        setPaymentIdToReject(payment.id);
        setSelectedPayment(payment);
        setRejectionReason('');
        setRejectionDialogOpen(true);
    };

    const openApproveDialog = (payment: PembayaranItem) => {
        if (!payment) {
            toast.error('Tidak dapat menyetujui pembayaran: Data tidak valid', {
                position: 'top-center',
                duration: 3000
            });
            return;
        }
        
        if (!payment.id) {
            toast.error('Tidak dapat menyetujui pembayaran: ID tidak ditemukan', {
                position: 'top-center',
                duration: 3000
            });
            return;
        }
        
        setPaymentIdToApprove(payment.id);
        setSelectedPayment(payment);
        setApprovalNote('');
        setApprovalDialogOpen(true);
    };

    const updatePaymentStatus = (paymentId: string | number, status: 'lunas' | 'ditolak', rejectionReason?: string) => {
        if (!paymentId) {
            toast.error('ID pembayaran tidak valid', {
                position: 'top-center',
                duration: 3000
            });
            return;
        }
        
        setProcessing(true);
        
        const data: any = {
            status_pembayaran: status
        };
        
        if (status === 'ditolak') {
            if (!rejectionReason) {
                toast.error('Alasan penolakan harus diisi', {
                    position: 'top-center',
                    duration: 3000
                });
                setProcessing(false);
                return;
            }
            data.alasan_ditolak = rejectionReason;
        }
        
        const endpoint = status === 'lunas' 
            ? `/admin/pembayaran/${paymentId}/approve` 
            : `/admin/pembayaran/${paymentId}/reject`;
        
        router.post(endpoint, data, {
            onSuccess: (response) => {
                setApprovalDialogOpen(false);
                setRejectionDialogOpen(false);
                setDetailDialogOpen(false);
                setProcessing(false);
                
                const updatedPaymentData = paymentData.map(payment => {
                    if (payment.id === paymentId) {
                        const statusDate = new Date().toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                        });
                        
                        return {
                            ...payment,
                            status: status,
                            keterangan: status === 'lunas' 
                                ? `Disetujui pada ${statusDate}` 
                                : `Ditolak: ${rejectionReason}`
                        };
                    }
                    return payment;
                });
                
                setPaymentData(updatedPaymentData);
                
                toast.success(status === 'lunas' ? 'Pembayaran berhasil disetujui' : 'Pembayaran berhasil ditolak', {
                    position: 'top-center',
                    duration: 3000
                });
            },
            onError: (errors) => {
                setProcessing(false);
                toast.error('Gagal memperbarui status pembayaran: ' + (errors.message || 'Unknown error'), {
                    position: 'top-center',
                    duration: 3000
                });
            },
            preserveState: true
        });
    };

    const approvePayment = (paymentId: string | number) => {
        if (!paymentId) {
            toast.error('ID pembayaran tidak valid', {
                position: 'top-center',
                duration: 3000
            });
            return;
        }
        

        if (!selectedPayment || selectedPayment.id !== paymentId) {
            setProcessing(true);
            
            router.post(`/admin/pembayaran/${paymentId}/approve`, {}, {
                onSuccess: (response) => {
                    setProcessing(false);
                    
                    const updatedPaymentData = paymentData.map(payment => {
                        if (payment.id === paymentId) {
                            const statusDate = new Date().toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            });
                            
                            return {
                                ...payment,
                                status: 'lunas',
                                keterangan: `Disetujui pada ${statusDate}`
                            };
                        }
                        return payment;
                    });
                    
                    setPaymentData(updatedPaymentData);
                    
                    toast.success('Pembayaran berhasil disetujui', {
                        position: 'top-center',
                        duration: 3000
                    });
                },
                onError: (errors) => {
                    setProcessing(false);
                    toast.error('Gagal menyetujui pembayaran: ' + (errors.message || 'Unknown error'), {
                        position: 'top-center',
                        duration: 3000
                    });
                },
                preserveState: true
            });
            return;
        }
        

        updatePaymentStatus(paymentId, 'lunas');
    };
    

    const rejectPayment = (paymentId: string | number, reason: string) => {
        if (!reason) {
            toast.error('Alasan penolakan harus diisi', {
                position: 'top-center',
                duration: 3000
            });
            return;
        }
        

        if (!selectedPayment || selectedPayment.id !== paymentId) {
            setProcessing(true);
            
            const data = {
                alasan_ditolak: reason
            };
            
            router.post(`/admin/pembayaran/${paymentId}/reject`, data, {
                onSuccess: (response) => {
                    setProcessing(false);
                    
                    const updatedPaymentData = paymentData.map(payment => {
                        if (payment.id === paymentId) {
                            const statusDate = new Date().toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                            });
                            
                            return {
                                ...payment,
                                status: 'ditolak',
                                keterangan: `Ditolak: ${reason}`
                            };
                        }
                        return payment;
                    });
                    
                    setPaymentData(updatedPaymentData);
                    
                    toast.success('Pembayaran berhasil ditolak', {
                        position: 'top-center',
                        duration: 3000
                    });
                },
                onError: (errors) => {
                    setProcessing(false);
                    toast.error('Gagal menolak pembayaran: ' + (errors.message || 'Unknown error'), {
                        position: 'top-center',
                        duration: 3000
                    });
                },
                preserveState: true
            });
            return;
        }
        
        updatePaymentStatus(paymentId, 'ditolak', reason);
    };

    return (
        <>
            <Head title="Pembayaran" />
            <Toaster />
            
            <div className="container mx-auto px-4 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <Card className="p-6 flex-1 bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-muted-foreground mb-2">Total Pembayaran Lunas</h3>
                        <p className="text-2xl font-bold transition-all duration-300">{formatRupiah(countLunas)}</p>
                    </Card>
                    <Card className="p-6 flex-1 bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800">
                        <h3 className="text-muted-foreground mb-2">Total Pembayaran Pending</h3>
                        <p className="text-2xl font-bold transition-all duration-300">{formatRupiah(countPending)}</p>
                    </Card>
                </div>

                <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">Daftar Pembayaran</h2>
                        <div className="flex gap-2">
                            <Button 
                                variant={filterStatus === 'semua' ? 'default' : 'outline'} 
                                onClick={() => setFilterStatus('semua')}
                                size="sm"
                            >
                                Semua
                            </Button>
                            <Button 
                                variant={filterStatus === 'pending' ? 'default' : 'outline'} 
                                onClick={() => setFilterStatus('pending')}
                                size="sm"
                                className={filterStatus === 'pending' ? 'bg-yellow-400 text-black hover:bg-yellow-500' : ''}
                            >
                                Pending
                            </Button>
                            <Button 
                                variant={filterStatus === 'lunas' ? 'default' : 'outline'} 
                                onClick={() => setFilterStatus('lunas')}
                                size="sm"
                                className={filterStatus === 'lunas' ? 'bg-green-500 hover:bg-green-600' : ''}
                            >
                                Lunas
                            </Button>
                            <Button 
                                variant={filterStatus === 'ditolak' ? 'default' : 'outline'} 
                                onClick={() => setFilterStatus('ditolak')}
                                size="sm"
                                className={filterStatus === 'ditolak' ? 'bg-red-500 hover:bg-red-600' : ''}
                            >
                                Ditolak
                            </Button>
                        </div>
                    </div>
                    
                    <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Siswa</TableHead>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Bukti</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-6">
                                            Tidak ada data pembayaran
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredData.map((payment) => (
                                        <TableRow 
                                            key={payment.id}
                                            className="hover:bg-muted cursor-pointer"
                                            onClick={() => handleDetail(payment)}
                                        >
                                            <TableCell>
                                                <div className="font-medium">{payment.siswa.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {payment.siswa.kelas} / {payment.siswa.nis}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {payment.details && payment.details.length > 0 ? (
                                                    <div className="flex flex-col">
                                                        <p className="font-medium">
                                                            {payment.details.length === 1 ? (
                                                                payment.details[0].sppName || payment.details[0].ppdbName || payment.name
                                                            ) : (
                                                                <>
                                                                    {payment.details
                                                                        .slice(0, 1)
                                                                        .map((detail) => detail.sppName || detail.ppdbName)
                                                                        .join(', ')}
                                                                    <span className="text-muted-foreground">
                                                                        {' '}
                                                                        +{payment.details.length - 1} lainnya
                                                                    </span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    payment.name
                                                )}
                                            </TableCell>
                                            <TableCell>{payment.amount}</TableCell>
                                            <TableCell>{payment.date}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        payment.status === 'lunas' ? 'default' : 
                                                        payment.status === 'pending' ? 'secondary' : 
                                                        'destructive'
                                                    }
                                                    className={
                                                        payment.status === 'lunas' ? 'bg-green-500 hover:bg-green-600' : 
                                                        payment.status === 'pending' ? 'bg-yellow-400 text-black hover:bg-yellow-500' :
                                                        'bg-red-500 hover:bg-red-600'
                                                    }
                                                >
                                                    {payment.status === 'pending' ? 'pending' : payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {payment.photoUrl ? (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShowImage(payment);
                                                        }}
                                                    >
                                                        <ImageIcon className="h-5 w-5" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {payment.status === 'pending' && (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="default"
                                                            className="bg-green-500 hover:bg-green-600"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                approvePayment(payment.id);
                                                            }}
                                                        >
                                                            <Check className="h-4 w-4 mr-1" /> Setujui
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                openRejectDialog(payment);
                                                            }}
                                                        >
                                                            <X className="h-4 w-4 mr-1" /> Tolak
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>

            {/* Detail Dialog */}
            <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[80vh] overflow-y-auto hide-scrollbar bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Detail Pembayaran</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && (
                        <div className="space-y-6">
                            <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Siswa</h4>
                                        <p className="font-medium">{selectedPayment.siswa.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{selectedPayment.siswa.kelas} / {selectedPayment.siswa.nis}</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                                        <Badge
                                            variant={
                                                selectedPayment.status === 'lunas' ? 'default' : 
                                                selectedPayment.status === 'pending' ? 'secondary' : 
                                                'destructive'
                                            }
                                            className={
                                                selectedPayment.status === 'lunas' ? 'bg-green-500 hover:bg-green-600' : 
                                                selectedPayment.status === 'pending' ? 'bg-yellow-400 text-black hover:bg-yellow-500' :
                                                'bg-red-500 hover:bg-red-600'
                                            }
                                        >
                                            {selectedPayment.status === 'pending' ? 'pending' : selectedPayment.status}
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-2">Tanggal: {selectedPayment.date}</p>
                                    </div>
                                </div>
                            </div>

                            {selectedPayment.photoUrl && (
                                <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-muted-foreground">Bukti Pembayaran</h4>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 text-xs"
                                            onClick={() => handleShowImage(selectedPayment)}
                                        >
                                            Lihat Penuh <ImageIcon className="h-3.5 w-3.5 ml-1" />
                                        </Button>
                                    </div>
                                    <div className="flex justify-center">
                                        <img 
                                            src={selectedPayment.photoUrl} 
                                            alt="Bukti Pembayaran"
                                            className="border border-zinc-300 dark:border-zinc-700 rounded-lg max-h-[120px] object-contain cursor-pointer"
                                            onClick={() => handleShowImage(selectedPayment)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Item Pembayaran</h4>
                                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {selectedPayment.details.map((detail, index) => (
                                        <li key={index} className="flex justify-between text-sm py-2">
                                            <span className="font-medium">{detail.sppName || detail.ppdbName || "-"}</span>
                                            <span className="text-right">{detail.amount}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex justify-between font-bold mt-3 pt-3 border-t border-zinc-300 dark:border-zinc-700 text-base">
                                    <span>Total</span>
                                    <span className="text-white">{selectedPayment.amount}</span>
                                </div>
                            </div>

                            {selectedPayment && selectedPayment.status === 'lunas' && (
                                <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800 border-green-300/50 dark:border-green-800/50">
                                    <h4 className="text-sm font-medium text-green-400">Status Pembayaran</h4>
                                    <p className="font-medium text-green-500">Pembayaran disetujui</p>
                                    {selectedPayment.approvalDate && (
                                        <p className="text-xs text-green-400 mt-1">Tanggal persetujuan: {selectedPayment.approvalDate}</p>
                                    )}
                                </div>
                            )}

                            {selectedPayment && selectedPayment.status === 'ditolak' && (
                                <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800 border-red-300/50 dark:border-red-800/50">
                                    <h4 className="text-sm font-medium text-red-400">Alasan Ditolak</h4>
                                    <p className="text-red-500 font-medium">{selectedPayment.keterangan || 'Pembayaran ditolak'}</p>
                                    {selectedPayment.approvalDate && (
                                        <p className="text-xs text-red-400 mt-1">Tanggal penolakan: {selectedPayment.approvalDate}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter className="flex-col space-y-2 sm:space-y-0 mt-4">
                        {selectedPayment && selectedPayment.status === 'pending' && (
                            <div className="flex space-x-2 w-full justify-center mb-2">
                                <Button 
                                    className="bg-green-500 hover:bg-green-600 w-full sm:w-40"
                                    onClick={() => {
                                        setDetailDialogOpen(false);
                                        if (selectedPayment) { 
                                            openApproveDialog(selectedPayment);
                                        }
                                    }}
                                >
                                    <Check className="h-4 w-4 mr-1" /> Setujui
                                </Button>
                                <Button 
                                    variant="destructive"
                                    className="w-full sm:w-40"
                                    onClick={() => {
                                        setDetailDialogOpen(false);
                                        setTimeout(() => openRejectDialog(selectedPayment), 100);
                                    }}
                                >
                                    <X className="h-4 w-4 mr-1" /> Tolak
                                </Button>
                            </div>
                        )}
                        <Button variant="secondary" onClick={() => setDetailDialogOpen(false)} className="w-full sm:w-40 mx-auto">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Dialog */}
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                <DialogContent className="sm:max-w-[70vw] w-[95vw] max-h-[80vh] overflow-y-auto hide-scrollbar bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Bukti Pembayaran</DialogTitle>
                    </DialogHeader>
                    {selectedPayment && selectedPayment.photoUrl && (
                        <div className="flex justify-center">
                            <div className="relative w-auto max-w-xl mx-auto overflow-hidden" style={{ cursor: 'move' }}>
                                <img 
                                    src={selectedPayment.photoUrl} 
                                    alt="Bukti Pembayaran" 
                                    className="max-w-full rounded-md transform-gpu mx-auto" 
                                    style={{ maxHeight: '70vh', maxWidth: '100%' }}
                                    id="zoomableImage"
                                    onMouseMove={(e) => {
                                        const image = document.getElementById('zoomableImage') as HTMLImageElement;
                                        if (image) {
                                            const bounds = image.getBoundingClientRect();
                                            const x = e.clientX - bounds.left;
                                            const y = e.clientY - bounds.top;
                                            const xPercent = (x / bounds.width) * 100;
                                            const yPercent = (y / bounds.height) * 100;
                                            image.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                                        }
                                    }}
                                    onMouseEnter={(e) => {
                                        const image = e.currentTarget as HTMLImageElement;
                                        image.style.transform = 'scale(2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        const image = e.currentTarget as HTMLImageElement;
                                        image.style.transform = 'scale(1)';
                                    }}
                                />
                                <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-xs text-white px-2 py-1 rounded">
                                    Gunakan mouse untuk melihat detail
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="flex justify-center">
                        <Button variant="secondary" onClick={() => setImageDialogOpen(false)} className="w-full sm:w-40">
                            Tutup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
                <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[80vh] overflow-y-auto hide-scrollbar bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Tolak Pembayaran</DialogTitle>
                        <DialogDescription>
                            Berikan alasan mengapa pembayaran ini ditolak.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="rejectionReason">Alasan Penolakan</Label>
                            <Textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                                placeholder="Masukkan alasan penolakan"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-center">
                        <Button 
                            variant="secondary" 
                            onClick={() => setRejectionDialogOpen(false)} 
                            disabled={processing}
                            className="w-full sm:w-40"
                        >
                            Batal
                        </Button>
                        <Button 
                            variant="destructive"
                            onClick={() => selectedPayment && rejectPayment(selectedPayment.id, rejectionReason)}
                            disabled={!rejectionReason || processing || !selectedPayment}
                            className="w-full sm:w-40"
                        >
                            {processing ? "Memproses..." : "Tolak Pembayaran"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Approve Dialog */}
            <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
                <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[80vh] overflow-y-auto hide-scrollbar bg-white dark:bg-[#0A0A0A] border-zinc-200 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle>Setujui Pembayaran</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin akan menyetujui pembayaran ini?
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayment ? (
                        <div className="mb-4 p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">ID Pembayaran:</span>
                                    <span className="text-sm font-medium">{selectedPayment.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Siswa:</span>
                                    <span className="text-sm font-medium">{selectedPayment.siswa?.name || '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Jumlah:</span>
                                    <span className="text-sm font-medium">{selectedPayment.amount || '-'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 p-4 bg-red-100/50 dark:bg-red-950/20 rounded-lg border border-red-200/30 dark:border-red-900/30 text-red-400 text-sm">
                            Data pembayaran tidak ditemukan
                        </div>
                    )}
                    <DialogFooter className="flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-center">
                        <Button 
                            variant="secondary" 
                            onClick={() => setApprovalDialogOpen(false)} 
                            disabled={processing}
                            className="w-full sm:w-40"
                        >
                            Batal
                        </Button>
                        <Button 
                            className="bg-green-500 hover:bg-green-600 w-full sm:w-40"
                            onClick={() => selectedPayment && approvePayment(selectedPayment.id)}
                            disabled={processing || !selectedPayment}
                        >
                            {processing ? "Memproses..." : "Setujui Pembayaran"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

PembayaranAdmin.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default PembayaranAdmin;
