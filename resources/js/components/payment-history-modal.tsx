'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';

interface PaymentHistoryItem {
    id: string;
    name: string;
    amount: string;
    date: string;
    method: string;
    receiptNumber: string;
    status: 'lunas' | 'pending' | 'ditolak';
    details?: {
        sppName?: string;
        ppdbName?: string;
        amount: string;
    }[];
}

interface PaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    payments: PaymentHistoryItem[];
    totalAmount: string;
}

export function PaymentHistoryModal({ isOpen, onClose, payments, totalAmount }: PaymentHistoryModalProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkIfMobile = () => {
                setIsMobile(window.innerWidth < 640);
            };
            checkIfMobile();
            window.addEventListener('resize', checkIfMobile);
            return () => window.removeEventListener('resize', checkIfMobile);
        }
    }, []);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[95%] sm:max-w-[700px] max-h-[90vh] overflow-y-auto hide-scrollbar mx-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <DialogHeader className="border-b p-4">
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
                        Riwayat Pembayaran
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Daftar riwayat pembayaran siswa
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted mb-4 flex items-center justify-between rounded-lg p-3">
                    <span className="font-medium">Total Pembayaran (Lunas)</span>
                    <span className="text-lg font-bold">
                        {(() => {
                            const totalLunas = payments
                                .filter((item) => item.status === 'lunas')
                                .reduce((sum, item) => {
                                    const num = Number(item.amount.replace(/[^0-9,-]+/g, '').replace(',', '.'));
                                    return sum + num;
                                }, 0);
                            return `Rp. ${totalLunas.toLocaleString('id-ID')}`;
                        })()}
                    </span>
                </div>

                {isMobile ? (
                    <div className="space-y-3">
                        {payments
                            .filter((payment) => payment.status === 'lunas')
                            .map((payment) => (
                                <Card key={payment.id} className="p-4 shadow-sm">
                                    <div className="grid gap-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">
                                                {payment.details && payment.details.length > 0 ? (
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium text-base">
                                                            {payment.details.length === 1 ? (
                                                                payment.details[0].sppName || payment.details[0].ppdbName || payment.name
                                                            ) : (
                                                                <>
                                                                    {payment.details
                                                                        .slice(0, 1)
                                                                        .map((detail) => detail.sppName || detail.ppdbName)
                                                                        .join(', ')}
                                                                    <span className="text-muted-foreground"> +{payment.details.length - 1} lainnya</span>
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : payment.name}
                                            </h3>
                                            <Badge
                                                variant={payment.status === 'lunas' ? 'default' : 'destructive'}
                                                className={payment.status === 'lunas' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            >
                                                {payment.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Jumlah</span>
                                            <span className="font-medium">{payment.amount}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">Tanggal</span>
                                            <span>{payment.date}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Pembayaran</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments
                                    .filter((payment) => payment.status === 'lunas')
                                    .map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-medium">
                                                {payment.details && payment.details.length > 0 ? (
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium">
                                                            {payment.details.length === 1 ? (
                                                                payment.details[0].sppName || payment.details[0].ppdbName || payment.name
                                                            ) : (
                                                                <>
                                                                    {payment.details
                                                                        .slice(0, 1)
                                                                        .map((detail) => detail.sppName || detail.ppdbName)
                                                                        .join(', ')}
                                                                    <span className="text-muted-foreground"> +{payment.details.length - 1} lainnya</span>
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                ) : payment.name}
                                            </TableCell>
                                            <TableCell>{payment.amount}</TableCell>
                                            <TableCell>{payment.date}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={payment.status === 'lunas' ? 'default' : 'destructive'}
                                                    className={payment.status === 'lunas' ? 'bg-green-500 hover:bg-green-600' : ''}
                                                >
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
