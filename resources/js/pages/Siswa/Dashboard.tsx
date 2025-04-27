'use client';

import { BillsModal } from '@/components/bills-modal';
import { PaymentHistoryModal } from '@/components/payment-history-modal';
import { PaymentCard } from '@/components/payment-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BanknoteIcon, CreditCardIcon, ImageIcon, WalletIcon } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Siswa Dashboard',
        href: '/siswa/dashboard',
    },
];

export default function SiswaDashboard({
    user,
    summary,
    bills,
    paymentHistory,
    allPaymentHistory,
}: {
    user: any;
    summary: any;
    bills: any[];
    paymentHistory: any[];
    allPaymentHistory: any[];
}) {
    const [billsModalOpen, setBillsModalOpen] = useState(false);
    const [paymentHistoryModalOpen, setPaymentHistoryModalOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);

    const handleDetail = (payment: any) => {
        setSelectedPayment(payment);
        setDetailDialogOpen(true);
    };

    const handleShowImage = (payment: any) => {
        if (payment.photoUrl) {
            setSelectedPayment(payment);
            setImageDialogOpen(true);
        }
    };

    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Siswa Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">
                        {user.name} / {user.nis}
                    </h1>
                    <div className="rounded-lg bg-green-100 px-4 py-2 dark:bg-green-900">
                        <p className="text-green-700 dark:text-green-300">
                            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Payment Cards */}
                <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
                    <PaymentCard
                        title="Total Tagihan"
                        amount={summary?.totalTagihan !== undefined ? `Rp. ${summary.totalTagihan.toLocaleString('id-ID')}` : '-'}
                        icon={<BanknoteIcon className="h-4 w-4" />}
                        onClick={() => setBillsModalOpen(true)}
                    />
                    <PaymentCard
                        title="Total Bayar"
                        amount={summary?.totalBayar !== undefined ? `Rp. ${summary.totalBayar.toLocaleString('id-ID')}` : '-'}
                        icon={<WalletIcon className="h-4 w-4" />}
                        onClick={() => setPaymentHistoryModalOpen(true)}
                    />
                    <PaymentCard
                        title="Sisa Tagihan"
                        amount={summary?.sisaTagihan !== undefined ? `Rp. ${summary.sisaTagihan.toLocaleString('id-ID')}` : '-'}
                        icon={<CreditCardIcon className="h-4 w-4" />}
                    />
                </div>

                {/* Payment History */}
                <Card className="overflow-hidden border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0A0A0A]">
                    <CardHeader className="bg-card/5 px-6">
                        <CardTitle>History Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Mobile View - Card Layout */}
                        <div className="md:hidden space-y-4 px-2 py-3 dark:text-white">
                            {allPaymentHistory.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">Belum ada riwayat pembayaran</p>
                                </div>
                            ) : (
                                allPaymentHistory.map((payment) => (
                                    <div 
                                        key={payment.id} 
                                        className="bg-gray-50 border border-gray-200 dark:bg-zinc-900/80 dark:border-zinc-800 rounded-lg p-4 cursor-pointer" 
                                        onClick={() => handleDetail(payment)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                    {payment.details && payment.details.length > 0 
                                                        ? (payment.details[0].sppName || payment.details[0].ppdbName) 
                                                        : payment.name || 'Pembayaran'}
                                                </h4>
                                                {payment.details && payment.details.length > 1 && (
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        dan {payment.details.length - 1} item lainnya
                                                    </p>
                                                )}
                                            </div>
                                            <Badge
                                                variant={
                                                    payment.status === 'lunas'
                                                        ? 'default'
                                                        : payment.status === 'pending'
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                                className={
                                                    payment.status === 'lunas'
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : payment.status === 'pending'
                                                        ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                        : 'bg-red-500 hover:bg-red-600'
                                                }
                                            >
                                                {payment.status === 'pending' ? 'pending' : payment.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="text-gray-400">
                                                {payment.tanggal_bayar
                                                    ? new Date(payment.tanggal_bayar).toLocaleDateString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : '-'}
                                            </div>
                                            <div className="font-semibold text-primary-400">
                                                {payment.amount || payment.totalAmount}
                                            </div>
                                        </div>
                                        
                                        {(payment.status === 'ditolak' || payment.status === 'lunas') && (
                                            <div className={`mt-2 text-xs ${payment.status === 'ditolak' ? 'text-red-400' : 'text-green-400'}`}>
                                                {payment.status === 'ditolak' 
                                                    ? (payment.keterangan || 'Pembayaran ditolak') 
                                                    : 'Disetujui'}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {/* Desktop View - Table Layout */}
                        <div className="hidden md:block">
                            <div className="rounded-md overflow-auto">
                                <Table className="[&_tbody_tr:last-child]:border-0 [&_thead_th]:text-gray-600 [&_tbody_td]:text-gray-700 [&_tbody_tr:hover]:bg-gray-100/80 dark:[&_thead_th]:text-zinc-400 dark:[&_tbody_td]:text-zinc-300 dark:[&_tbody_tr:hover]:bg-zinc-800/50">
                                    <TableHeader className="border-gray-200 bg-gray-50/80 dark:border-zinc-800 dark:bg-zinc-900/50">
                                        <TableRow className="border-gray-200 dark:border-zinc-800">
                                            <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                                            <TableHead className="whitespace-nowrap">Item Pembayaran</TableHead>
                                            <TableHead className="whitespace-nowrap">Total</TableHead>
                                            <TableHead className="whitespace-nowrap">Status</TableHead>
                                            <TableHead className="whitespace-nowrap">Keterangan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allPaymentHistory.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    <p className="text-muted-foreground">Belum ada riwayat pembayaran</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            allPaymentHistory.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    className="border-gray-200 hover:bg-gray-100/80 dark:border-zinc-800 dark:hover:bg-zinc-800/50 cursor-pointer"
                                                    onClick={() => handleDetail(payment)}
                                                >
                                                    <TableCell className="whitespace-nowrap">
                                                        {payment.tanggal_bayar
                                                            ? new Date(payment.tanggal_bayar).toLocaleDateString('id-ID', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="max-w-[250px] truncate">
                                                        {payment.details && payment.details.length > 0 ? (
                                                            <div>
                                                                <span className="font-medium">
                                                                    {payment.details[0].sppName || payment.details[0].ppdbName || payment.name}
                                                                </span>
                                                                {payment.details.length > 1 && (
                                                                    <span className="ml-1 text-xs text-muted-foreground">
                                                                        dan {payment.details.length - 1} item lainnya
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            payment.name || payment.keterangan || 'Pembayaran'
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap">{payment.amount || payment.totalAmount}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                payment.status === 'lunas'
                                                                    ? 'default'
                                                                    : payment.status === 'pending'
                                                                    ? 'secondary'
                                                                    : 'destructive'
                                                            }
                                                            className={
                                                                payment.status === 'lunas'
                                                                    ? 'bg-green-500 hover:bg-green-600'
                                                                    : payment.status === 'pending'
                                                                    ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                                    : 'bg-red-500 hover:bg-red-600'
                                                            }
                                                        >
                                                            {payment.status === 'pending' ? 'pending' : payment.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        {payment.status === 'ditolak' ? (
                                                            <div className="font-medium text-red-500">{payment.keterangan || 'Pembayaran ditolak'}</div>
                                                        ) : payment.status === 'lunas' ? (
                                                            <div className="text-green-500">Disetujui</div>
                                                        ) : (
                                                            ''
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bills Modal */}
                <BillsModal
                    isOpen={billsModalOpen}
                    onClose={() => setBillsModalOpen(false)}
                    bills={bills}
                    totalAmount={summary?.totalTagihan !== undefined ? `Rp. ${summary.totalTagihan.toLocaleString('id-ID')}` : '-'}
                />

                {/* Payment History Modal */}
                <PaymentHistoryModal
                    isOpen={paymentHistoryModalOpen}
                    onClose={() => setPaymentHistoryModalOpen(false)}
                    payments={allPaymentHistory.map(payment => ({
                        id: payment.id?.toString() || Math.random().toString(),
                        name: payment.name || 'Pembayaran',
                        amount: payment.amount || payment.totalAmount || '-',
                        date: payment.tanggal_bayar
                            ? new Date(payment.tanggal_bayar).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })
                            : '-',
                        method: payment.metode_pembayaran || 'Transfer Bank',
                        receiptNumber: payment.receipt_number || `INV-${payment.id}`,
                        status: payment.status as 'lunas' | 'pending' | 'ditolak',
                        details: payment.details || [
                            {
                                sppName: payment.name || 'Pembayaran SPP',
                                amount: payment.amount || payment.totalAmount || '-'
                            }
                        ]
                    }))}
                    totalAmount={summary?.totalBayar !== undefined ? `Rp. ${summary.totalBayar.toLocaleString('id-ID')}` : '-'}
                />

                {/* Detail Dialog */}
                <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                    <DialogContent className="hide-scrollbar max-h-[80vh] w-[95vw] overflow-y-auto border-zinc-800 bg-[#0A0A0A] sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Detail Pembayaran</DialogTitle>
                            <DialogDescription className="sr-only">Informasi detail pembayaran siswa</DialogDescription>
                        </DialogHeader>
                        {selectedPayment && (
                            <div className="space-y-6">
                                <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                                    <div className="flex flex-col gap-2">
                                        <div>
                                            <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-0.5">Tanggal Bayar</h4>
                                            <p className="font-medium text-base">
                                                {selectedPayment.tanggal_bayar
                                                    ? new Date(selectedPayment.tanggal_bayar).toLocaleDateString('id-ID', {
                                                          day: '2-digit',
                                                          month: 'long',
                                                          year: 'numeric',
                                                      })
                                                    : '-'}
                                            </p>
                                        </div>
                                        {selectedPayment.status === 'lunas' && (
                                            <div>
                                                <h4 className="text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-0.5">Tanggal Persetujuan</h4>
                                                <p className="font-medium text-base">
                                                    {selectedPayment.tanggal_persetujuan
                                                        ? new Date(selectedPayment.tanggal_persetujuan).toLocaleDateString('id-ID', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        })
                                                        : selectedPayment.approvalDate
                                                            ? selectedPayment.approvalDate
                                                            : <span className="italic text-zinc-400">Belum ada tanggal persetujuan</span>
                                                    }
                                                </p>
                                            </div>
                                        )}
                                        <div className="self-end text-right">
                                            <h4 className="text-muted-foreground mb-1 text-sm font-medium">Status</h4>
                                            <Badge
                                                variant={
                                                    selectedPayment.status === 'lunas'
                                                        ? 'default'
                                                        : selectedPayment.status === 'pending'
                                                        ? 'secondary'
                                                        : 'destructive'
                                                }
                                                className={
                                                    selectedPayment.status === 'lunas'
                                                        ? 'bg-green-500 hover:bg-green-600'
                                                        : selectedPayment.status === 'pending'
                                                        ? 'bg-yellow-400 text-black hover:bg-yellow-500'
                                                        : 'bg-red-500 hover:bg-red-600'
                                                }
                                            >
                                                {selectedPayment.status === 'pending' ? 'pending' : selectedPayment.status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {selectedPayment.photoUrl && (
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                                        <div className="mb-2 flex items-center justify-between">
                                            <h4 className="text-muted-foreground text-sm font-medium">Bukti Pembayaran</h4>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 text-xs"
                                                onClick={() => handleShowImage(selectedPayment)}
                                            >
                                                Lihat Penuh <ImageIcon className="ml-1 h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="flex justify-center">
                                            <img
                                                src={selectedPayment.photoUrl}
                                                alt="Bukti Pembayaran"
                                                className="max-h-[120px] cursor-pointer rounded-lg border border-zinc-700 object-contain"
                                                onClick={() => handleShowImage(selectedPayment)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedPayment.details && selectedPayment.details.length > 0 && (
                                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
                                        <h4 className="text-muted-foreground mb-3 text-sm font-medium">Item Pembayaran</h4>
                                        <ul className="divide-y divide-zinc-800">
                                            {selectedPayment.details.map((detail: any, index: number) => (
                                                <li key={index} className="flex justify-between py-2 text-sm">
                                                    <span className="font-medium">{detail.sppName || detail.ppdbName || '-'}</span>
                                                    <span className="text-right">{detail.amount}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-3 flex justify-between border-t border-zinc-700 pt-3 text-base font-bold">
                                            <span>Total</span>
                                            <span className="text-white">{selectedPayment.amount || selectedPayment.totalAmount}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedPayment.status === 'lunas' && (
                                    <div className="rounded-lg border border-green-800/50 border-zinc-800 bg-zinc-900/40 p-4">
                                        <h4 className="text-sm font-medium text-green-400">Status Pembayaran</h4>
                                        <p className="font-medium text-green-500">Pembayaran disetujui</p>
                                        {selectedPayment.approvalDate && (
                                            <p className="mt-1 text-xs text-green-400">Tanggal persetujuan: {selectedPayment.approvalDate}</p>
                                        )}
                                    </div>
                                )}

                                {selectedPayment.status === 'ditolak' && (
                                    <div className="rounded-lg border border-red-800/50 border-zinc-800 bg-zinc-900/40 p-4">
                                        <h4 className="text-sm font-medium text-red-400">Alasan Ditolak</h4>
                                        <p className="font-medium text-red-500">{selectedPayment.keterangan || 'Pembayaran ditolak'}</p>
                                        {selectedPayment.approvalDate && (
                                            <p className="mt-1 text-xs text-red-400">Tanggal penolakan: {selectedPayment.approvalDate}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <DialogFooter className="mt-4 flex-col space-y-2 sm:space-y-0">
                            <Button variant="secondary" onClick={() => setDetailDialogOpen(false)} className="mx-auto w-full sm:w-40">
                                Tutup
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Image Dialog */}
                <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogContent className="hide-scrollbar max-h-[80vh] w-[95vw] overflow-y-auto border-zinc-800 bg-[#0A0A0A] sm:max-w-[70vw]">
                        <DialogHeader>
                            <DialogTitle>Bukti Pembayaran</DialogTitle>
                            <DialogDescription className="sr-only">Bukti pembayaran siswa</DialogDescription>
                        </DialogHeader>
                        {selectedPayment && selectedPayment.photoUrl && (
                            <div className="flex justify-center">
                                <div className="relative mx-auto w-auto max-w-xl overflow-hidden" style={{ cursor: 'move' }}>
                                    <img
                                        src={selectedPayment.photoUrl}
                                        alt="Bukti Pembayaran"
                                        className="mx-auto max-w-full transform-gpu rounded-md"
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
                                    <div className="bg-opacity-70 absolute bottom-4 left-4 rounded bg-black px-2 py-1 text-xs text-white">
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
            </div>
        </AppLayout>
    );
}
