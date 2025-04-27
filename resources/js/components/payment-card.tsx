'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type React from 'react';

interface PaymentCardProps {
    title: string;
    amount: string;
    icon?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function PaymentCard({ title, amount, icon, className, onClick }: PaymentCardProps) {
    return (
        <Card
            className={cn('overflow-hidden transition-all hover:shadow-md', onClick && 'hover:border-primary/50 cursor-pointer', className)}
            onClick={onClick}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="bg-primary/10 text-primary rounded-full p-1.5">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{amount}</div>
            </CardContent>
        </Card>
    );
}
