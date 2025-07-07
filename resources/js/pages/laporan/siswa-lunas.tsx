import { Head, router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { formatDate, formatRupiah } from '@/lib/utils';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';

interface SiswaProps {
  siswa_id: number;
  nama: string;
  nis: string;
  kelas: string;
  user?: {
    email: string;
  };
}

interface SiswaLunasProps {
  siswa?: SiswaProps[];
  kelasList?: string[];
  sppList?: {
    spp_id: number;
    nama: string;
    tahun_ajaran: string;
    nominal: number;
  }[];
  ppdbList?: {
    ppdb_id: number;
    nama: string;
    tahun_ajaran: string;
    nominal: number;
  }[];
  filters?: {
    kelas?: string;
    spp_id?: number;
    ppdb_id?: number;
  };
  showEmptyMessage?: boolean;
}

function SiswaLunas(props: SiswaLunasProps) {
  console.log('Siswa lunas report page loaded', props);
  
  // Safely extract props
  const siswa = props?.siswa || [];
  const kelasList = props?.kelasList || [];
  const sppList = props?.sppList || [];
  const ppdbList = props?.ppdbList || [];
  const filters = props?.filters || {};
  const showEmptyMessage = props?.showEmptyMessage || false;
  
  const [kelas, setKelas] = useState<string>(filters.kelas || '');
  const [sppId, setSppId] = useState<string>(filters.spp_id?.toString() || '');
  const [ppdbId, setPpdbId] = useState<string>(filters.ppdb_id?.toString() || '');

  const handleFilter = (e: FormEvent) => {
    e.preventDefault();
    
    // Create an empty object for params
    const params: Record<string, string> = {};
    
    // Only add params if they are not empty
    if (kelas) params.kelas = kelas;
    if (sppId) params.spp_id = sppId;
    if (ppdbId) params.ppdb_id = ppdbId;
    
    router.get('/admin/laporan/siswa-lunas', params, {
      preserveState: true,
      replace: true,
      only: ['siswa']
    });
  };

  const handleDownload = () => {
    console.log('Current filters - kelas:', kelas, 'spp_id:', sppId, 'ppdb_id:', ppdbId);
    
    // Create an empty object for params
    const params: Record<string, string> = {};
    
    // Get current URL params to ensure we use exactly what the backend is currently using
    const currentParams = new URLSearchParams(window.location.search);
    
    // If current params exist in URL, use them, otherwise use the state values
    if (currentParams.has('kelas') && currentParams.get('kelas')) {
      params.kelas = currentParams.get('kelas') || '';
    } else if (kelas) {
      params.kelas = kelas;
    }
    
    if (currentParams.has('spp_id') && currentParams.get('spp_id')) {
      params.spp_id = currentParams.get('spp_id') || '';
    } else if (sppId) {
      params.spp_id = sppId;
    }
    
    if (currentParams.has('ppdb_id') && currentParams.get('ppdb_id')) {
      params.ppdb_id = currentParams.get('ppdb_id') || '';
    } else if (ppdbId) {
      params.ppdb_id = ppdbId;
    }
    
    console.log('Using filters for PDF - kelas:', params.kelas, 'spp_id:', params.spp_id, 'ppdb_id:', params.ppdb_id);
    
    // Build the URL with query parameters
    let downloadUrl = '/admin/laporan/siswa-lunas/download-pdf';
    const searchParams = new URLSearchParams();
    
    // Only add non-empty params to URL
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      downloadUrl += '?' + queryString;
    }
    
    // Open in a new tab
    window.open(downloadUrl, '_blank');
  };

  const handleReset = () => {
    setKelas('');
    setSppId('');
    setPpdbId('');
    router.get('/admin/laporan/siswa-lunas', {}, {
      preserveState: true,
      replace: true,
      only: ['siswa', 'filters']
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laporan', href: '#' },
    { title: 'Siswa Lunas', href: '/admin/laporan/siswa-lunas' },
  ];

  return (
    <>
      <Head title="Laporan Siswa Sudah Bayar" />
      
      {/* Page Header */}
      <div className="flex justify-between items-center px-4 py-4 mb-2">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">Laporan Siswa Sudah Bayar</h1>
        <button 
          onClick={handleDownload}
          className="bg-green-600 hover:bg-green-700 text-zinc-900 dark:text-white py-2 px-4 rounded-md transition duration-200 flex items-center text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </button>
      </div>
      
      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden">
        {/* Filter Section */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <form onSubmit={handleFilter} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="kelas" className="block text-sm font-medium text-zinc-600 dark:text-gray-300 mb-1">
                Kelas
              </label>
              <select
                id="kelas"
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white px-3 py-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="spp_id" className="block text-sm font-medium text-zinc-600 dark:text-gray-300 mb-1">
                SPP
              </label>
              <select
                id="spp_id"
                value={sppId}
                onChange={(e) => setSppId(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white px-3 py-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="">Semua SPP</option>
                {/* Sort SPP list by month - January to December */}
                {[...sppList]
                  .sort((a, b) => {
                    // Extract month names and convert to month numbers for sorting
                    const getMonthNumber = (name: string) => {
                      const months = {
                        'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
                        'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
                        'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
                      };
                      for (const [month, num] of Object.entries(months)) {
                        if (name.includes(month)) return num;
                      }
                      return 0; // Default if no month found
                    };
                    return getMonthNumber(a.nama) - getMonthNumber(b.nama);
                  })
                  .map((s) => (
                    <option key={s.spp_id} value={s.spp_id}>
                      {s.nama} - {s.tahun_ajaran}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="ppdb_id" className="block text-sm font-medium text-zinc-600 dark:text-gray-300 mb-1">
                PPDB
              </label>
              <select
                id="ppdb_id"
                value={ppdbId}
                onChange={(e) => setPpdbId(e.target.value)}
                className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white px-3 py-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="">Semua PPDB</option>
                {ppdbList.map((p) => (
                  <option key={p.ppdb_id} value={p.ppdb_id}>
                    {p.nama} - {p.tahun_ajaran}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end space-x-2">
              <button 
                type="submit" 
                className="bg-zinc-300 hover:bg-zinc-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-zinc-900 dark:text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              
              <button
                type="button"
                onClick={handleReset}
                className="bg-zinc-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-zinc-900 dark:text-white py-2 px-4 rounded-md transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reset
              </button>
            </div>
          </form>
        </div>
        
        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
            <thead>
              <tr className="bg-zinc-100/60 dark:bg-black dark:bg-opacity-40">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-gray-400 uppercase">No</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-gray-400 uppercase">NIS</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-gray-400 uppercase">Nama</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-gray-400 uppercase">Kelas</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-gray-400 uppercase">Email</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {Array.isArray(siswa) && siswa.length > 0 ? (
                siswa.map((s, index) => (
                  <tr key={s.siswa_id} className="hover:bg-zinc-100/40 dark:hover:bg-black dark:hover:bg-opacity-20 transition duration-150">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-gray-400">{s.nis}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-white">{s.nama}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-gray-400">{s.kelas}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-zinc-500 dark:text-gray-400">{s.user?.email || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-600 text-zinc-900 dark:text-white">
                        Lunas
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 dark:text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="h-12 w-12 text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {showEmptyMessage ? (
                        <>
                          <p className="text-lg font-medium">Silahkan pilih filter data</p>
                          <p className="mt-1 text-sm">Pilih kelas, SPP, atau PPDB untuk melihat siswa yang sudah lunas</p>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-medium">Tidak ada data siswa lunas</p>
                          <p className="mt-1 text-sm">Ubah filter atau periksa data pembayaran</p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>  
  );
}

SiswaLunas.layout = (page: React.ReactNode) => {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Laporan', href: '#' },
    { title: 'Siswa Lunas', href: '/admin/laporan/siswa-lunas' },
  ];
  return <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>;
};

export default SiswaLunas;
