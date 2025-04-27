'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';

interface BillItem {
    id: string;
    name: string;
    amount: string;
    dueDate: string;
    status: 'lunas' | 'belum lunas';
}

interface BillsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bills: BillItem[];
    totalAmount: string;
}

export function BillsModal({ isOpen, onClose, bills, totalAmount }: BillsModalProps) {
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
            <DialogContent className="hide-scrollbar max-h-[70vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader className="border-b p-4">
                    <DialogTitle className="flex items-center text-xl">
                        Detail Tagihan
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Detail tagihan siswa yang belum dibayar
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-muted mb-4 flex items-center justify-between rounded-lg p-3">
                    <span className="font-medium">Total Tagihan</span>
                    <span className="text-lg font-bold">{totalAmount}</span>
                </div>

                {isMobile ? (
                    <div className="space-y-3">
                        {bills.map((bill) => (
                            <Card key={bill.id} className="p-4 shadow-sm">
                                <div className="grid gap-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-medium">{bill.name}</h3>
                                        <Badge
                                            variant={bill.status === 'lunas' ? 'default' : 'destructive'}
                                            className={bill.status === 'lunas' ? 'bg-green-500 hover:bg-green-600' : ''}
                                        >
                                            {bill.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Jumlah</span>
                                        <span className="font-medium">{bill.amount}</span>
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
                                    <TableHead>Nama Tagihan</TableHead>
                                    <TableHead>Jumlah</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bills.map((bill) => (
                                    <TableRow key={bill.id}>
                                        <TableCell className="font-medium">{bill.name}</TableCell>
                                        <TableCell>{bill.amount}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={bill.status === 'lunas' ? 'default' : 'destructive'}
                                                className={bill.status === 'lunas' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            >
                                                {bill.status}
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
