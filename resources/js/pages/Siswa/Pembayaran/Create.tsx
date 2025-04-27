'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentGuideDialog } from '@/components/payment-guide-dialog';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import AppLayout from '@/layouts/app-layout';

import type { BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { BanknoteIcon, CreditCard, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/siswa/dashboard',
    },
    {
        title: 'Pembayaran',
        href: '/siswa/pembayaran',
    },
    {
        title: 'Buat Pembayaran',
        href: '/siswa/pembayaran/create',
    },
];



type PaymentItem = {
    id: string;
    name: string;
    amount: string;
    rawAmount: number;
    tahunAjaran: string;
    type: 'spp' | 'ppdb';
    sppName?: string;
    ppdbName?: string;
};

type CreatePembayaranProps = {
    user: {
        email: string;
        name?: string;
        role: string;
    };
    paymentItems: PaymentItem[];
};

export default function CreatePembayaran({ user, paymentItems }: CreatePembayaranProps) {
    const [selectedItems, setSelectedItems] = useState<PaymentItem[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [step, setStep] = useState<'select' | 'upload'>('select');
    const [copySuccess, setCopySuccess] = useState(false);


    const { data, setData, post, processing, errors, reset } = useForm<{
        spp_ids: string[];
        ppdb_ids: string[];
        bukti_bayar: File | null;
        total_bayar?: string;
    }>({
        spp_ids: [],
        ppdb_ids: [],
        bukti_bayar: null,
    });
    


    const handleItemSelect = (item: PaymentItem, checked: boolean) => {
        let newSelectedItems;
        
        if (checked) {
            console.log('Adding item:', item);
            console.log('Raw amount type:', typeof item.rawAmount);
            console.log('Raw amount value:', item.rawAmount);
            newSelectedItems = [...selectedItems, item];
        } else {
            newSelectedItems = selectedItems.filter((i) => !(i.id === item.id && i.type === item.type));
        }
        
        setSelectedItems(newSelectedItems);
        
        let newTotal = 0;
        newSelectedItems.forEach(item => {
            if (typeof item.rawAmount === 'string') {
                const numericString = (item.rawAmount as string).replace(/[^0-9.-]+/g,"");
                const parsed = parseFloat(numericString);
                newTotal += !isNaN(parsed) ? parsed : 0;
            } else if (typeof item.rawAmount === 'number' && !isNaN(item.rawAmount)) {
                newTotal += item.rawAmount;
            } else {
                const amountString = item.amount.replace(/[^0-9.-]+/g,"");
                const parsed = parseFloat(amountString);
                if (!isNaN(parsed)) {
                    newTotal += parsed;
                    item.rawAmount = parsed;
                }
            }
        });
        
        console.log('Calculated total:', newTotal);
        setTotalAmount(newTotal);
        
        // Update form data for SPP and PPDB IDs and total_bayar
        const sppIds = newSelectedItems.filter(item => item.type === 'spp').map(item => item.id);
        const ppdbIds = newSelectedItems.filter(item => item.type === 'ppdb').map(item => item.id);
        
        setData('spp_ids', sppIds);
        setData('ppdb_ids', ppdbIds);
        setData('total_bayar', newTotal.toString());
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            setData('bukti_bayar', file);
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNextStep = () => {
        if (selectedItems.length === 0) {
            alert('Silakan pilih minimal satu item pembayaran.');
            return;
        }
        
        setStep('upload');
    };
    
    const handleBackStep = () => {
        setStep('select');
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        });
    };
    
    const copyAmount = () => {
        const amountText = totalAmount.toString();
        copyToClipboard(amountText);
    };
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (!data.bukti_bayar) {
            alert('Silakan unggah bukti pembayaran.');
            return;
        }
        
        post('/siswa/pembayaran/store', {
            onSuccess: () => {
                toast.success('Pembayaran berhasil terkirim!', {
                    description: 'Anda akan dialihkan ke dashboard',
                    position: 'top-center',
                    duration: 3000,
                });
                
                setTimeout(() => {
                    router.visit('/siswa/dashboard');
                }, 3000);
                
                reset();
                setSelectedItems([]);
                setTotalAmount(0);
                setPreviewImage(null);
                setStep('select');
            },
            forceFormData: true,
        });
    };

    const formatCurrency = (value: number | undefined | null) => {
        const safeValue = (typeof value === 'number' && !isNaN(value)) ? value : 0;
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(safeValue);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Pembayaran" />
            <Toaster />
            
            {/* Tambahkan komponen Panduan Pembayaran */}
            <PaymentGuideDialog />
            <div className="w-full bg-white dark:bg-[#0A0A0A] transition-colors">
                {/* Minimalist Header */}
                <div className="py-4 md:py-6 mb-4 md:mb-6 bg-white dark:bg-[#0A0A0A] border-b border-zinc-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-3 md:px-4">
                        <div className="w-full">
                            <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-white flex items-center">
                                <BanknoteIcon className="h-5 w-5 md:h-6 md:w-6 text-primary-500 dark:text-primary-400 mr-1.5 md:mr-2 flex-shrink-0" />
                                Form Pembayaran
                            </h1>
                            <p className="text-sm md:text-base text-gray-600 dark:text-zinc-500 dark:text-gray-400 mt-0.5 md:mt-1">Lakukan pembayaran SPP dengan mengisi form berikut</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:gap-6 mb-6 md:mb-8 px-3 md:px-4">
                    {/* Payment Form */}
                    <div>
                        <Card className="rounded-xl shadow-sm border border-zinc-200 dark:border-gray-800 dark:border-zinc-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-[#0A0A0A]">
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                                    {step === 'select' ? (
                                        <>
                                            <h3 className="font-medium text-zinc-600 dark:text-gray-300 mb-4 flex items-center text-base border-b border-zinc-200 dark:border-gray-800 pb-2">
                                                <CreditCard className="mr-2 h-4 w-4 text-primary-500" />
                                                Pilih Tagihan
                                            </h3>
                                            {paymentItems.length > 0 ? (
                                                    <div className="space-y-6">
                                                        <div>
                                                            <h4 className="font-medium text-primary-400 mb-2 text-xs border-l-2 border-primary-500 pl-2">SPP - Sumbangan Pembinaan Pendidikan</h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                {paymentItems
                                                                    .filter(item => item.type === 'spp')
                                                                    .map((item) => (
                                                                        <div key={`${item.type}-${item.id}`} className="border border-zinc-200 dark:border-gray-800 bg-zinc-100/60 dark:bg-gray-900/60 rounded-md p-3 hover:bg-zinc-200/50 dark:bg-gray-800/50 transition-colors">
                                                                            <div className="flex items-start mb-1">
                                                                                <Checkbox
                                                                                    id={`${item.type}-${item.id}`}
                                                                                    checked={selectedItems.some((i) => i.id === item.id && i.type === item.type)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        handleItemSelect(item, checked as boolean);
                                                                                    }}
                                                                                    className="h-4 w-4 rounded border-zinc-300 dark:border-gray-700 mr-2 mt-1"
                                                                                />
                                                                                <div className="flex-1">
                                                                                    <Label
                                                                                        htmlFor={`${item.type}-${item.id}`}
                                                                                        className="cursor-pointer text-base font-medium text-zinc-900 dark:text-white block"
                                                                                    >
                                                                                        {item.sppName || item.ppdbName || item.name}
                                                                                    </Label>
                                                                                    <div className="flex justify-between mt-1">
                                                                                        <span className="text-sm font-medium text-primary-400">
                                                                                            {item.amount}
                                                                                        </span>
                                                                                        <span className="text-sm text-zinc-500 dark:text-gray-400">{item.tahunAjaran}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                        
                                                        <div>
                                                            <h4 className="font-medium text-primary-400 mb-2 text-xs border-l-2 border-primary-500 pl-2">PPDB - Item PPDB</h4>
                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                {paymentItems
                                                                    .filter(item => item.type === 'ppdb')
                                                                    .map((item) => (
                                                                        <div key={`${item.type}-${item.id}`} className="border border-zinc-200 dark:border-gray-800 bg-zinc-100/60 dark:bg-gray-900/60 rounded-md p-3 hover:bg-zinc-200/50 dark:bg-gray-800/50 transition-colors">
                                                                            <div className="flex items-start mb-1">
                                                                                <Checkbox
                                                                                    id={`${item.type}-${item.id}`}
                                                                                    checked={selectedItems.some((i) => i.id === item.id && i.type === item.type)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        handleItemSelect(item, checked as boolean);
                                                                                    }}
                                                                                    className="h-4 w-4 rounded border-zinc-300 dark:border-gray-700 mr-2 mt-1"
                                                                                />
                                                                                <div className="flex-1">
                                                                                    <Label
                                                                                        htmlFor={`${item.type}-${item.id}`}
                                                                                        className="cursor-pointer text-base font-medium text-zinc-900 dark:text-white block"
                                                                                    >
                                                                                        {item.sppName || item.ppdbName || item.name}
                                                                                    </Label>
                                                                                    <div className="flex justify-between mt-1">
                                                                                        <span className="text-sm font-medium text-primary-400">
                                                                                            {item.amount}
                                                                                        </span>
                                                                                        <span className="text-sm text-zinc-500 dark:text-gray-400">{item.tahunAjaran}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-zinc-500 dark:text-gray-400 p-2">Tidak ada item pembayaran yang tersedia</p>
                                                )}

                                            <div className="space-y-2 bg-zinc-100/40 dark:bg-gray-900/30 p-4 rounded-lg border border-primary-800/30">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-white">Total Tagihan Terpilih:</span>
                                                    <span className="font-semibold text-lg text-primary-500">{formatCurrency(totalAmount || 0)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <Button 
                                                    type="button" 
                                                    className="w-full py-6 text-base font-medium rounded-lg transition-all" 
                                                    onClick={handleNextStep}
                                                    disabled={selectedItems.length === 0}
                                                >
                                                    Proses Pembayaran
                                                </Button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="bg-zinc-100/40 dark:bg-gray-900/30 p-5 rounded-lg border border-zinc-200 dark:border-gray-800">
                                                <h3 className="font-medium text-zinc-600 dark:text-gray-300 mb-4 flex items-center text-base border-b border-zinc-200 dark:border-gray-800 pb-2">
                                                    <CreditCard className="mr-2 h-4 w-4 text-primary-500" />
                                                    Informasi Pembayaran
                                                </h3>
                                                
                                                <div className="p-4 rounded-lg mb-4 border border-gray-300 dark:border-zinc-300 dark:border-gray-700 bg-white dark:bg-zinc-200/50 dark:bg-gray-800/50">
                                                    <p className="mb-3 text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-white">Silahkan transfer dengan jumlah:</p>
                                                    <div className="flex justify-between items-center p-3 rounded-md mb-3 bg-white dark:bg-gray-900">
                                                        <span className="font-semibold text-lg text-primary-500">{formatCurrency(totalAmount || 0)}</span>
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-xs" 
                                                            onClick={copyAmount}
                                                        >
                                                            {copySuccess ? 'Tersalin!' : 'Salin'}
                                                        </Button>
                                                    </div>
                                                    
                                                    <p className="mb-3 text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-white">Ke rekening berikut:</p>
                                                    <div className="flex justify-between items-center p-3 rounded-md bg-white dark:bg-gray-900">
                                                        <div>
                                                            <p className="text-xs text-zinc-900 dark:text-white dark:text-zinc-500 dark:text-gray-400">Bank BCA</p>
                                                            <p className="font-medium text-zinc-900 dark:text-white dark:text-zinc-900 dark:text-white">5402181206</p>
                                                            <p className="text-sm text-zinc-900 dark:text-white dark:text-zinc-500 dark:text-gray-400">a.n. TK PARADISE</p>
                                                        </div>
                                                        <Button     
                                                            type="button"   
                                                            variant="outline" 
                                                            size="sm" 
                                                            className="text-xs" 
                                                            onClick={() => copyToClipboard('5402181206')}
                                                        >
                                                            {copySuccess ? 'Tersalin!' : 'Salin'}
                                                        </Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 mt-6">
                                                    <Label htmlFor="bukti_bayar">Upload Bukti Pembayaran</Label>
                                                    <p className="text-xs text-red-500 dark:text-red-400">*Pastikan Nominal yang di transfer sama dengan jumlah tagihan</p>
                                                    <div
                                                        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-zinc-200 dark:border-gray-800 dark:border-zinc-300 dark:border-gray-700 bg-zinc-50 dark:bg-gray-900/40 dark:bg-gray-900/50 p-8 transition-colors hover:border-gray-300 dark:hover:border-gray-600"
                                                        onClick={() => fileInputRef.current?.click()}
                                                    >
                                                        {previewImage ? (
                                                            <div className="mb-4">
                                                                <img
                                                                    src={previewImage}
                                                                    alt="Preview"
                                                                    className="max-h-32 max-w-xs rounded-lg object-contain"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <Upload className="mb-2 h-10 w-10 text-zinc-500 dark:text-gray-400" />
                                                        )}
                                                        <p className="mb-1 font-medium">Klik untuk mengunggah bukti</p>
                                                        <p className="text-sm text-gray-500">
                                                            Format: JPG, PNG (Max 2MB)
                                                        </p>
                                                        <Input
                                                            ref={fileInputRef}
                                                            id="bukti_bayar"
                                                            name="bukti_bayar"
                                                            type="file"
                                                            accept="image/jpeg, image/png, image/jpg"
                                                            className="hidden"
                                                            onChange={handleFileChange}
                                                        />
                                                    </div>
                                                    {errors.bukti_bayar && (
                                                        <p className="text-sm text-red-500">{errors.bukti_bayar}</p>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-4 mt-8">
                                                <Button 
                                                    type="button" 
                                                    variant="outline"
                                                    className="flex-1 py-6 text-base font-medium rounded-lg transition-all" 
                                                    onClick={handleBackStep}
                                                >
                                                    Kembali
                                                </Button>
                                                <Button 
                                                    type="submit" 
                                                    className="flex-1 py-6 text-base font-medium rounded-lg transition-all" 
                                                    disabled={processing || !data.bukti_bayar}
                                                >
                                                    {processing ? (
                                                        <span className="flex items-center justify-center">
                                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-900 dark:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Mengirim...
                                                        </span>
                                                    ) : 'Kirim Pembayaran'}
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
