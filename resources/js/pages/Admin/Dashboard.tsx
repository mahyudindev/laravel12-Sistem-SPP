'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bell, CheckCircle, Clock, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

type Stats = {
    pembayaranLunas?: number;
    menungguValidasi?: number;
    pembayaranDitolak?: number;
    totalSiswa?: number;
    siswaLunas?: number;
    siswaMenunggak?: number;
    monthlyData?: Array<{
        month: string;
        total: number;
        lunas: number;
        ppdb: number;
    }>;
};

export default function AdminDashboard({ user, role, stats, latestPayments }: { user: any; role: string; stats?: Stats; latestPayments?: any[] }) {
    const _stats = {
        pembayaranLunas: stats?.pembayaranLunas ?? 0,
        menungguValidasi: stats?.menungguValidasi ?? 0,
        pembayaranDitolak: stats?.pembayaranDitolak ?? 0,
        totalSiswa: stats?.totalSiswa ?? 0,
        siswaLunas: stats?.siswaLunas ?? 0,
        monthlyData: stats?.monthlyData ?? [],
    };

    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAlert(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const persentaseLunas = _stats.totalSiswa > 0 ? Math.round((_stats.siswaLunas / _stats.totalSiswa) * 100) : 0;

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const getMonthlyData = () => {
        // If we have actual data from the database, use it
        if (_stats.monthlyData && _stats.monthlyData.length > 0) {
            // Filter dan urutkan agar selalu Januari-Desember
            const monthOrder = months;
            return monthOrder
                .map(m => _stats.monthlyData.find(item => item.month === m) || { month: m, total: _stats.totalSiswa || 0, lunas: 0, ppdb: 0 });
        }
        // Fallback dummy data
        return months.map(month => ({
            month: month,
            total: _stats.totalSiswa || 0,
            lunas: 0,
            ppdb: 0
        }));
    };

    const calculateTrend = () => {
        const data = getMonthlyData();
        const currentMonth = new Date().getMonth(); 
        const previousMonth = currentMonth > 0 ? currentMonth - 1 : 11; 

        if (data[previousMonth].lunas === 0) return 0;

        const change = data[currentMonth].lunas - data[previousMonth].lunas;
        const percentChange = (change / data[previousMonth].lunas) * 100;

        return percentChange.toFixed(1);
    };

    const transactions =
        latestPayments && latestPayments.length > 0
            ? latestPayments.slice(0, 5).map((item) => ({
                  id: item.pembayaran_id,
                  name: item.siswa?.nama ?? 'Unknown',
                  nis: item.siswa?.nis ?? '-',
                  amount: Number(item.total_bayar),
                  status: item.status_pembayaran,
              }))
            : [];


    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'lunas':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    label: 'Lunas',
                    icon: <CheckCircle className="mr-1 h-3 w-3" />,
                };
            case 'pending':
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    label: 'Pending',
                    icon: <Clock className="mr-1 h-3 w-3" />,
                };
            case 'ditolak':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    label: 'Ditolak',
                    icon: <XCircle className="mr-1 h-3 w-3" />,
                };
            default:
                return {
                    bg: 'bg-gray-100',
                    text: 'text-gray-800',
                    label: status,
                    icon: null,
                };
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="absolute top-4 right-4 flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 select-none">
                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <div
                    className="relative cursor-pointer"
                    onClick={() => router.visit('/admin/pembayaran')}
                    title="Lihat pembayaran pending"
                    tabIndex={0}
                    role="button"
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.visit('/admin/pembayaran'); }}
                >
                    {_stats.menungguValidasi > 0 ? (
                        <Bell className="h-6 w-6 text-yellow-500 fill-yellow-100 animate-bounce" />
                    ) : (
                        <Bell className="h-6 w-6 text-gray-400" />
                    )}
                    <span className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full ${_stats.menungguValidasi > 0 ? 'bg-yellow-500' : 'bg-gray-300'} text-xs text-white`}>
                        {_stats.menungguValidasi}
                    </span>
                </div>
            </div>
            <Head title="Dashboard Admin" />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
                {showAlert && (
                    <div className={`transition-all duration-500 ease-out ${showAlert ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`}>
                        <Alert className="font-inter mb-4 border border-gray-300 bg-white text-gray-900 shadow-md">
                            <Bell className="h-4 w-4" />
                            <AlertTitle>Selamat datang!</AlertTitle>
                            <AlertDescription>Administrator, Anda memiliki 3 notifikasi baru yang belum dibaca.</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Kartu Status Pembayaran - Hanya 3 kartu */}
                <div className="grid gap-4 md:grid-cols-3">
                    {/* Total Semua Siswa */}
                    <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-1 text-lg font-bold text-black">Total Semua Siswa</div>
                        <div className="flex w-full items-center justify-between">
                            <div className="text-5xl font-bold text-black">{_stats.totalSiswa}</div>
                            <Users className="h-10 w-10 text-gray-700" />
                        </div>
                    </div>

                    {/* Menunggu Validasi */}
                    <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-1 text-lg font-bold text-black">Menunggu Validasi</div>
                        <div className="flex w-full items-center justify-between">
                            <div className="text-5xl font-bold text-black">{_stats.menungguValidasi}</div>
                            <Clock className="h-10 w-10 text-gray-700" />
                        </div>
                    </div>

                    {/* Pembayaran Lunas - Changed to white */}
                    <div className="flex flex-col items-center rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
                        <div className="mb-1 text-lg font-bold text-black">Pembayaran Lunas</div>
                        <div className="flex w-full items-center justify-between">
                            <div className="text-5xl font-bold text-black">{_stats.pembayaranLunas}</div>
                            <CheckCircle className="h-10 w-10 text-gray-700" />
                        </div>
                    </div>
                </div>

                {/* Bagian bawah: kiri = chart, kanan = tabel transaksi terakhir */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {/* Line Chart */}
                    <Card className="border border-gray-100 bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white">Overview</CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">Januari - Desember 2025</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={
                                    {
                                        total: {
                                            label: 'Total Siswa',
                                            color: 'hsl(0, 0%, 0%)', // Black for light mode, will be overridden by CSS
                                        },
                                        lunas: {
                                            label: 'SPP Lunas',
                                            color: 'hsl(210, 100%, 50%)', // Blue
                                        },
                                        ppdb: {
                                            label: 'PPDB',
                                            color: 'hsl(145, 80%, 50%)', // Green
                                        },
                                    } satisfies ChartConfig
                                }
                            >
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={getMonthlyData()}
                                            margin={{
                                                left: 40,
                                                right: 8,
                                                top: 20,
                                                bottom: 0,
                                            }}
                                        >
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
                                            <XAxis
                                                dataKey="month"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={5}
                                                tickFormatter={(value) => value.slice(0, 3)}
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                scale="point"
                                            />
                                            <YAxis
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={5}
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                domain={[0, 'dataMax']}
                                                hide={true}
                                            />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                            <Line
                                                dataKey="total"
                                                type="monotone"
                                                stroke="var(--color-total)"
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#fff', stroke: 'var(--color-total)', strokeWidth: 2 }}
                                            />
                                            <Line
                                                dataKey="lunas"
                                                type="monotone"
                                                stroke="var(--color-lunas)"
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#fff', stroke: 'var(--color-lunas)', strokeWidth: 2 }}
                                            />
                                            <Line
                                                dataKey="ppdb"
                                                type="monotone"
                                                stroke="var(--color-ppdb)"
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#fff', stroke: 'var(--color-ppdb)', strokeWidth: 2 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </ChartContainer>
                        </CardContent>
                    </Card>
                    {/* Transaksi Terakhir - With status column */}
                    <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-md">
                        <CardHeader>
                            <CardTitle>Transaksi Terakhir</CardTitle>
                            <CardDescription>Anda memiliki {transactions.length} transaksi bulan ini.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {transactions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">Belum ada transaksi pembayaran bulan ini.</div>
                                ) : (
                                    transactions.map((transaction) => {
                                        const statusBadge = getStatusBadge(transaction.status);
                                        return (
                                            <div
                                                key={transaction.id}
                                                className="flex flex-col justify-between gap-3 rounded-lg p-2 hover:bg-gray-50 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-semibold text-gray-700">
                                                        {transaction.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm leading-none font-medium">{transaction.name}</p>
                                                        <p className="text-xs text-gray-500">NIS: {transaction.nis}</p>
                                                    </div>
                                                </div>
                                                <div className="ml-12 flex flex-wrap items-center gap-2 sm:ml-0">
                                                    <div
                                                        className={`flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}
                                                    >
                                                        {statusBadge.icon}
                                                        {statusBadge.label}
                                                    </div>
                                                    <div className="rounded-full bg-black px-3 py-1 text-xs font-medium whitespace-nowrap text-white">
                                                        {transaction.status === 'lunas' ? '+' : ''}
                                                        Rp{transaction.amount.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
