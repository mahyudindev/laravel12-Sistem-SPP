import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ReactNode } from 'react';

interface ConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    onConfirm: () => void;
    icon?: ReactNode;
}

export function ConfirmationDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Konfirmasi',
    cancelText = 'Batal',
    confirmVariant = 'destructive',
    onConfirm,
    icon,
}: ConfirmationDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-[#0A0A0A] border border-gray-800 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {icon && <span>{icon}</span>}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border border-gray-700 text-white hover:bg-gray-800 hover:text-white">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                        className={`${
                            confirmVariant === 'destructive'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : confirmVariant === 'secondary'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
