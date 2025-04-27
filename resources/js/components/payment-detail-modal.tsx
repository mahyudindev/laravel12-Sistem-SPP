'use client';

import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export interface PaymentHistoryItem {
    details?: { sppName?: string; ppdbName?: string; amount: string }[];
    id: string;
    name: string;
    amount: string;
    date: string;
    status: 'lunas' | 'pending' | 'ditolak';
    photoUrl?: string;
    approvalDate?: string;
    keterangan?: string;
    rejectionReason?: string;
    method?: string;
    receiptNumber?: string;
    schoolYear?: string;
    paymentMonth?: string;
    sppName?: string;
}

export function PaymentDetailModal({
    open,
    onClose,
    payment,
    isLoading = false,
}: {
    open: boolean;
    onClose: () => void;
    payment: PaymentHistoryItem | null;
    isLoading?: boolean;
}) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden p-0">
                <DialogHeader className="bg-background flex items-center border-b p-4">
                    <DialogTitle className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2"
                        >
                            <rect width="20" height="14" x="2" y="5" rx="2" />
                            <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        Detail Pembayaranbb
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Informasi detail pembayaran siswa
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <svg className="text-foreground h-8 w-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                        </svg>
                    </div>
                ) : payment ? (
                    <div
                        className="hide-scrollbar max-h-[calc(85vh-60px)] overflow-y-auto p-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        <div className="bg-muted mb-4 rounded-md p-4">
                            <div className="mb-2 flex items-center justify-between">
                                <h3 className="font-medium">Informasi Pembayaran</h3>
                                <Badge
                                    variant={payment.status === 'lunas' ? 'default' : payment.status === 'pending' ? 'outline' : 'destructive'}
                                    className={
                                        payment.status === 'lunas'
                                            ? 'bg-green-500 text-white'
                                            : payment.status === 'pending'
                                              ? 'bg-yellow-500 text-white'
                                              : 'bg-red-500 text-white'
                                    }
                                >
                                    {payment.status === 'lunas' ? 'Lunas' : payment.status === 'pending' ? 'Pending' : 'Ditolak'}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-muted-foreground text-sm">Tahun Ajaran</p>
                                    <p className="font-medium">{payment.schoolYear || '2025/2026'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Tanggal Bayar</p>
                                    <p className="font-medium">{payment.date}</p>
                                </div>
                                {payment.approvalDate && (
                                    <div>
                                        <p className="text-muted-foreground text-sm">Tanggal Disetujui</p>
                                        <p className="font-medium">{payment.approvalDate}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Tagihan</p>
                                    <p className="font-medium">{payment.amount}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground text-sm">Total Bayar</p>
                                    <p className="font-medium">{payment.amount}</p>
                                </div>
                            </div>
                        </div>

                        {payment.details && payment.details.length > 0 && (
                            <div className="mb-4">
                                <h3 className="mb-2 font-medium">Detail Pembayaran</h3>
                                <div className="rounded-md border">
                                    {payment.details.map((detail, idx) => (
                                        <div key={idx} className="flex justify-between border-b p-3 last:border-b-0">
                                            <div>
                                                <p>{detail.sppName ? `${detail.sppName}` : detail.ppdbName ? `${detail.ppdbName}` : '-'}</p>
                                            </div>
                                            <p className="font-medium">{detail.amount}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {payment.keterangan && payment.status === 'ditolak' && (
                            <div className="mb-4 bg-red-500/10 p-3 rounded-md border border-red-500/20">
                                <h3 className="mb-2 font-medium text-red-500">Alasan Penolakan</h3>
                                <p className="text-red-400">{payment.keterangan}</p>
                                {payment.approvalDate && (
                                    <p className="text-xs text-red-400/80 mt-2">Ditolak pada: {payment.approvalDate}</p>
                                )}
                            </div>
                        )}

                        {payment.status === 'ditolak' && (
                            <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800 border-red-800/50 mb-4">
                                <h4 className="text-sm font-medium text-red-400">Alasan Ditolak</h4>
                                <p className="text-red-500 font-medium">
                                    {payment.keterangan || (payment as any).rejectionReason || 'Pembayaran ditolak'}
                                </p>
                                {payment.approvalDate && (
                                    <p className="text-xs text-red-400 mt-1">Tanggal penolakan: {payment.approvalDate}</p>
                                )}
                            </div>
                        )}

                        {payment.status === 'lunas' && (
                            <div className="mb-4 bg-green-500/10 p-3 rounded-md border border-green-500/20">
                                <h3 className="mb-2 font-medium text-green-500">Status Pembayaran</h3>
                                <p className="text-green-400">Pembayaran telah disetujui</p>
                                {payment.approvalDate && (
                                    <p className="text-xs text-green-400/80 mt-2">Disetujui pada: {payment.approvalDate}</p>
                                )}
                            </div>
                        )}

                        {payment.photoUrl && (
                            <div className="mb-4">
                                <h3 className="mb-2 font-medium">Bukti Pembayaran</h3>
                                <div className="overflow-hidden rounded-md border">
                                    <div className="p-1">
                                        <img
                                            src={payment.photoUrl}
                                            alt="Bukti Pembayaran"
                                            className="mx-auto max-h-[300px] w-auto rounded object-contain"
                                            onClick={() => window.open(payment.photoUrl, '_blank')}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
