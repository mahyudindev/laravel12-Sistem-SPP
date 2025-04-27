import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

interface PembayaranDetailProps {
    spp: {
        spp_id: number;
        nama: string;
        nominal: number;
    };
}

interface PembayaranProps {
    pembayaran_id: number;
    siswa_id: number;
    total_bayar: number;
    total_tagihan: number;
    status_pembayaran: string;
    tanggal_bayar: string;
    created_at: string;
    tahun_ajaran: string;
    siswa: {
        siswa_id: number;
        nama: string;
        nis: string;
        kelas: string;
    };
    pembayaranDetail: PembayaranDetailProps[];
}

interface LaporanPembayaranProps {
    pembayaran?: PembayaranProps[];
    filters?: {
        dari_tanggal?: string;
        sampai_tanggal?: string;
    };
}

function LaporanPembayaran(props: any) {
    console.log('Payment report page loaded', props);

    // Safely extract props
    const pembayaran = props?.pembayaran || [];
    const filters = props?.filters || {};

    const [dariTanggal, setDariTanggal] = useState<string>(filters.dari_tanggal || '');
    const [sampaiTanggal, setSampaiTanggal] = useState<string>(filters.sampai_tanggal || '');

    const handleFilter = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/laporan/pembayaran', {
            dari_tanggal: dariTanggal,
            sampai_tanggal: sampaiTanggal,
        });
    };

    const handleDownload = () => {
        // Use the dedicated download route with the same filters
        router.get(
            '/admin/laporan/pembayaran/download-pdf',
            {
                dari_tanggal: dariTanggal,
                sampai_tanggal: sampaiTanggal,
            },
            {
                // Force a traditional GET request download by opening in new window
                onBefore: () => {
                    // Create a hidden form to submit a GET request that downloads directly
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

                    return false; // Prevent default Inertia behavior
                },
            },
        );
    };

    const handleReset = () => {
        setDariTanggal('');
        setSampaiTanggal('');
        router.get('/admin/laporan/pembayaran');
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Pembayaran Lunas', href: '/admin/laporan/pembayaran' },
    ];

    return (
        <>
            <Head title="Laporan Pembayaran Lunas" />

            {/* Page Header */}
            <div className="mb-2 flex items-center justify-between px-4 py-4">
                <h1 className="text-xl font-semibold text-white">Laporan Pembayaran Lunas</h1>
                <button
                    onClick={handleDownload}
                    className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm text-white transition duration-200 hover:bg-green-700"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                    </svg>
                    Download PDF
                </button>
            </div>

            {/* Main Content Card */}
            <div className="overflow-hidden rounded-lg border border-gray-800 bg-[#0A0A0A] shadow-lg">
                {/* Filter Section */}
                <div className="border-b border-gray-800 p-4">
                    <form onSubmit={handleFilter} className="flex flex-wrap gap-4">
                        <div className="min-w-[200px] flex-1">
                            <label htmlFor="dari_tanggal" className="mb-1 block text-sm font-medium text-gray-300">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                id="dari_tanggal"
                                value={dariTanggal}
                                onChange={(e) => setDariTanggal(e.target.value)}
                                className="w-full rounded-md border border-gray-700 bg-[#0A0A0A] px-3 py-2 text-white focus:border-gray-500 focus:ring-gray-500"
                                placeholder="mm/dd/yyyy"
                            />
                        </div>

                        <div className="min-w-[200px] flex-1">
                            <label htmlFor="sampai_tanggal" className="mb-1 block text-sm font-medium text-gray-300">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                id="sampai_tanggal"
                                value={sampaiTanggal}
                                onChange={(e) => setSampaiTanggal(e.target.value)}
                                className="w-full rounded-md border border-gray-700 bg-[#0A0A0A] px-3 py-2 text-white focus:border-gray-500 focus:ring-gray-500"
                                placeholder="mm/dd/yyyy"
                            />
                        </div>

                        <div className="flex items-end space-x-2">
                            <button
                                type="submit"
                                className="flex items-center rounded-md bg-gray-700 px-4 py-2 text-white transition duration-200 hover:bg-gray-600"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2 h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                                    />
                                </svg>
                                Filter
                            </button>

                            <button
                                type="button"
                                onClick={handleReset}
                                className="flex items-center rounded-md bg-gray-800 px-4 py-2 text-white transition duration-200 hover:bg-gray-700"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2 h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-800">
                        <thead>
                            <tr className="bg-opacity-40 bg-black">
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    No
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Tanggal
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Siswa
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Kelas
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Item Pembayaran
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Total
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {Array.isArray(pembayaran) && pembayaran.length > 0 ? (
                                pembayaran.map((p, index) => (
                                    <tr key={p.pembayaran_id} className="hover:bg-opacity-20 transition duration-150 hover:bg-black">
                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-400">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-400">{formatDate(p.tanggal_bayar)}</td>
                                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-white">
                                            {p.siswa?.nama || '-'}
                                            {p.siswa?.nis && <div className="text-xs text-gray-500">{p.siswa.nis}</div>}
                                        </td>
                                        <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-400">{p.siswa?.kelas || '-'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-400">
                                            {Array.isArray(p.pembayaranDetail) &&
                                                p.pembayaranDetail.map((detail: PembayaranDetailProps, idx: number) => (
                                                    <div key={idx}>{detail.spp?.nama || 'Item Pembayaran'}</div>
                                                ))}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap text-green-500">
                                            {formatRupiah(p.total_bayar)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex rounded-full bg-green-600 px-2 py-1 text-xs leading-5 font-semibold text-white">
                                                Lunas
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="mb-4 h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <p className="text-lg font-medium">Tidak ada data pembayaran</p>
                                            <p className="mt-1 text-sm">Ubah filter atau periksa data pembayaran</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* No summary section needed to match the screenshot */}
            </div>
        </>
    );
}

LaporanPembayaran.layout = (page: React.ReactNode) => {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Laporan', href: '#' },
        { title: 'Pembayaran Lunas', href: '/admin/laporan/pembayaran' },
    ];
    return <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
};

export default LaporanPembayaran;
