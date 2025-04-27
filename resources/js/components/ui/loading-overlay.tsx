import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoadingOverlayProps {
    isLoading: boolean;
    message?: string;
}

export function LoadingOverlay({ isLoading, message = 'Sedang memproses...' }: LoadingOverlayProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isLoading) {
            setShow(true);
        } else {
            const timer = setTimeout(() => {
                setShow(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="rounded-lg bg-[#0A0A0A] p-6 shadow-xl border border-gray-800">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <p className="text-sm font-medium text-white">{message}</p>
                </div>
            </div>
        </div>
    );
}
