'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Download, Filter, Search, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/utils';
import { toast, Toaster } from 'sonner';

interface DetailItem {
  id: string;
  sppName: string | null;
  ppdbName: string | null;
  amount: string;
}

interface PembayaranProps {
  id: number | string;
  name: string;
  status: string;
  amount: string;
  sisaTagihan?: string;
  date: string;
  method?: string;
  receiptNumber?: string;
  keterangan?: string;
  approvalDate?: string | null;
  tahun_ajaran?: string;
  photoUrl?: string | null;
  siswa: {
    id: number | string | null;
    name: string;
    kelas: string;
    nis: string;
  };
  details: DetailItem[];
}

interface LaporanPembayaranProps {
  pembayaran?: PembayaranProps[];
  filters?: {
    dari_tanggal?: string;
    sampai_tanggal?: string;
  };
  totalBayar?: number;
}

function LaporanPemasukan(props: any) {
  // Safely extract props
  const pembayaran = props?.pembayaran || [];
  const filters = props?.filters || {};
  const totalBayar = props?.totalBayar || 0;
  
  // Debug data structure
  useEffect(() => {
    console.log('Pembayaran data:', pembayaran);
  }, [pembayaran]);
  
  const [dariTanggal, setDariTanggal] = useState<string>(filters.dari_tanggal || '');
  const [sampaiTanggal, setSampaiTanggal] = useState<string>(filters.sampai_tanggal || '');
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PembayaranProps | null>(null);
  const [countNominal, setCountNominal] = useState<number>(0);
  
  // Set up animation for the total nominal
  useEffect(() => {
    if (totalBayar) {
      const duration = 1500;
      const steps = 30;
      const stepTime = duration / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        
        const progress = 1 - Math.pow(1 - currentStep / steps, 3);
        
        setCountNominal(Math.floor(totalBayar * progress));
        
        if (currentStep >= steps) {
          clearInterval(timer);
          setCountNominal(totalBayar);
        }
      }, stepTime);
      
      return () => clearInterval(timer);
    }
  });

  const handleFilter = (e: FormEvent) => {
    e.preventDefault();
    router.get('/admin/laporan/pembayaran', {
      dari_tanggal: dariTanggal,
      sampai_tanggal: sampaiTanggal,
    });
  };

  const handleDownload = () => {
    // Force a traditional GET request download by opening in new window
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = '/admin/laporan/pembayaran/download-pdf';
    form.target = '_blank';
    
    // Add the filter parameters
    if (dariTanggal) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'dari_tanggal';
      input.value = dariTanggal;
      form.appendChild(input);
    }
    
    if (sampaiTanggal) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'sampai_tanggal';
      input.value = sampaiTanggal;
      form.appendChild(input);
    }
    
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  const handleReset = () => {
    setDariTanggal('');
    setSampaiTanggal('');
    router.get('/admin/laporan/pembayaran');
  };
  
  const handleDetail = (payment: PembayaranProps) => {
    setSelectedPayment(payment);
    setDetailDialogOpen(true);
  };

  return (
    <>
      <Head title="Laporan Pemasukan" />
      <Toaster />
      
      <div className="container mx-auto px-4 space-y-6">

        <div className="bg-white dark:bg-[#0A0A0A] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Laporan Pemasukan</h2>
            
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          
          {/* Filter Form */}
          <div className="p-4 mb-6 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <form onSubmit={handleFilter} className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="dari_tanggal" className="text-sm font-medium mb-1.5">
                  Dari Tanggal
                </Label>
                <Input
                  id="dari_tanggal"
                  type="date"
                  value={dariTanggal}
                  onChange={(e) => setDariTanggal(e.target.value)}
                  className="w-full border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white focus-visible:ring-blue-500"
                />
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="sampai_tanggal" className="text-sm font-medium mb-1.5">
                  Sampai Tanggal
                </Label>
                <Input
                  id="sampai_tanggal"
                  type="date"
                  value={sampaiTanggal}
                  onChange={(e) => setSampaiTanggal(e.target.value)}
                  className="w-full border-zinc-200 dark:border-zinc-800 bg-zinc-900 text-white focus-visible:ring-blue-500"
                />
              </div>
              
              <div className="flex items-end space-x-2">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                
                <Button
                  type="button"
                  onClick={handleReset}
                  variant="outline"
                  className="border-zinc-300 dark:border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-100 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
          </div>
          
          <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Kelas</TableHead>
                  <TableHead>Item Pembayaran</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(pembayaran) && pembayaran.length > 0 ? (
                  pembayaran.map((p, index) => (
                    <TableRow 
                      key={p.pembayaran_id}
                      className="hover:bg-muted cursor-pointer"
                      onClick={() => handleDetail(p)}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell>
                        <div className="font-medium">{p.siswa?.name || '-'}</div>
                        <div className="text-xs text-muted-foreground">{p.siswa?.nis || '-'}</div>
                      </TableCell>
                      <TableCell>{p.siswa?.kelas || '-'}</TableCell>
                      <TableCell>
                        {p.details && p.details.length > 0 ? (
                          <div className="flex flex-col">
                            {p.details.length === 1 ? (
                              <p className="font-medium">
                                {p.details[0]?.sppName || 
                                 p.details[0]?.ppdbName || 
                                 '-'}
                              </p>
                            ) : (
                              <>
                                <p className="font-medium">
                                  {p.details[0]?.sppName || 
                                   p.details[0]?.ppdbName || 
                                   '-'}
                                  <span className="text-muted-foreground"> +{p.details.length - 1} lainnya</span>
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="font-medium">-</div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-green-500">{p.amount}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Sudah Bayar
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      <div className="flex flex-col items-center">
                        <svg className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-lg font-medium">Tidak ada data pembayaran</p>
                        <p className="mt-1 text-sm">Silakan ubah filter atau periksa data pembayaran</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Summary Footer */}
          {Array.isArray(pembayaran) && pembayaran.length > 0 && (
            <div className="mt-4 flex justify-end">
              <div className="max-w-sm w-full rounded-lg bg-zinc-100/60 dark:bg-zinc-900/40 p-4 border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <span className="text-gray-400">Total Pembayaran:</span>
                  <span className="font-medium text-white">{pembayaran.length}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-gray-400">Total Nominal:</span>
                  <span className="font-medium text-green-500">
                    {formatRupiah(pembayaran.reduce((sum, item) => sum + (parseInt(String(item.amount).replace(/[^0-9]/g, '')) || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
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
                    <p className="font-medium">{selectedPayment.siswa?.name || '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedPayment.siswa?.kelas || '-'} / {selectedPayment.siswa?.nis || '-'}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      Sudah Bayar
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">Tanggal: {selectedPayment.date}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Item Pembayaran</h4>
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {selectedPayment.details && selectedPayment.details.length > 0 ? (
                    selectedPayment.details.map((detail, index) => (
                      <li key={index} className="flex justify-between text-sm py-2">
                        <span className="font-medium">{detail.sppName || detail.ppdbName || "-"}</span>
                        <span className="text-right">{detail.amount}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex justify-between text-sm py-2">
                      <span className="font-medium">SPP {selectedPayment.tahun_ajaran || '-'}</span>
                      <span className="text-right">{selectedPayment.amount}</span>
                    </li>
                  )}
                </ul>
                <div className="flex justify-between font-bold mt-3 pt-3 border-t border-zinc-300 dark:border-zinc-700 text-base">
                  <span>Total</span>
                  <span className="text-white">{selectedPayment.amount}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-100/60 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800 border-green-300/50 dark:border-green-800/50">
                <h4 className="text-sm font-medium text-green-400">Status Pembayaran</h4>
                <p className="font-medium text-green-500">Pembayaran disetujui</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col space-y-2 sm:space-y-0 mt-4">
            <Button variant="secondary" onClick={() => setDetailDialogOpen(false)} className="w-full sm:w-40 mx-auto">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

LaporanPemasukan.layout = (page: React.ReactNode) => <AppLayout children={page} />;

export default LaporanPemasukan;
