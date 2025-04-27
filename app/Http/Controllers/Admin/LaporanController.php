<?php

namespace App\Http\Controllers\Admin;

use App\Exports\PembayaranExport;
use App\Exports\SiswaLunasExport;
use App\Http\Controllers\Controller;
use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use App\Models\Siswa;
use App\Models\Spp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Response;
use Inertia\Inertia;
use PDF;

class LaporanController extends Controller
{
    public function pembayaran(Request $request)
    {
        $query = Pembayaran::with([
            'siswa:siswa_id,nama,nis,kelas', 
            'pembayaranDetail' => function($query) {
                $query->with(['spp:spp_id,nama,nominal', 'ppdb:ppdb_id,nama,nominal']);
            }
        ])
        ->where('status_pembayaran', 'lunas');
        
        if ($request->filled('dari_tanggal')) {
            $query->whereDate('tanggal_bayar', '>=', $request->dari_tanggal);
        }
        
        if ($request->filled('sampai_tanggal')) {
            $query->whereDate('tanggal_bayar', '<=', $request->sampai_tanggal);
        }
        
        $pembayaranRows = $query->latest('tanggal_bayar')->get();
        
        if ($request->download) {
            $dataForPdf = $pembayaranRows->map(function ($item) {
                $itemPembayaran = [];
                if ($item->pembayaranDetail && $item->pembayaranDetail->count() > 0) {
                    foreach ($item->pembayaranDetail as $detail) {
                        if ($detail->spp) {
                            $itemPembayaran[] = $detail->spp->nama;
                        } elseif ($detail->ppdb) {
                            $itemPembayaran[] = $detail->ppdb->nama;
                        } else {
                            $itemPembayaran[] = 'SPP ' . $item->tahun_ajaran;
                        }
                    }
                } else {
                    $itemPembayaran[] = 'SPP ' . $item->tahun_ajaran; 
                }
                
                return [
                    'pembayaran_id' => $item->pembayaran_id,
                    'tanggal_bayar' => $item->tanggal_bayar,
                    'total_bayar' => $item->total_bayar,
                    'tahun_ajaran' => $item->tahun_ajaran,
                    'nama_siswa' => $item->siswa ? $item->siswa->nama : 'Tidak diketahui',
                    'kelas_siswa' => $item->siswa ? $item->siswa->kelas : '-',
                    'nis_siswa' => $item->siswa ? $item->siswa->nis : '-',
                    'item_pembayaran' => $itemPembayaran
                ];
            });
            
            $pdf = PDF::loadView('admin.laporan.pembayaran_pdf', ['pembayaran' => $dataForPdf]);
            
            $filename = 'laporan-pembayaran-' . date('YmdHis') . '.pdf';
            $tempFile = storage_path('app/public/' . $filename);
            
            file_put_contents($tempFile, $pdf->output());
            
            if (ob_get_level()) ob_end_clean();
            
            ini_set('output_buffering', 'off');
            ini_set('zlib.output_compression', false);
            
            header('Content-Description: File Transfer');
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Transfer-Encoding: binary');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            header('Content-Length: ' . filesize($tempFile));
            
            flush();
            

            readfile($tempFile);
            

            unlink($tempFile);
            

            exit;
        }
        

        $pembayaran = $pembayaranRows->map(function ($item) {
            return [
                'id' => $item->pembayaran_id,
                'name' => $item->keterangan ?? 'Pembayaran',
                'status' => $item->status_pembayaran,
                'amount' => 'Rp. ' . number_format($item->total_bayar, 0, ',', '.'),
                'sisaTagihan' => 'Rp. ' . number_format(max(0, $item->total_tagihan - $item->total_bayar), 0, ',', '.'),
                'date' => $item->tanggal_bayar ? date('d F Y', strtotime($item->tanggal_bayar)) : '-',
                'method' => $item->metode_pembayaran ?? '-',
                'receiptNumber' => $item->no_bukti ?? '-',
                'keterangan' => $item->keterangan,
                'approvalDate' => $item->tanggal_persetujuan ? date('d F Y', strtotime($item->tanggal_persetujuan)) : null,
                'tahun_ajaran' => $item->tahun_ajaran, // Keep additional fields needed for the report
                'siswa' => [
                    'id' => $item->siswa ? $item->siswa->siswa_id : null,
                    'name' => $item->siswa ? $item->siswa->nama : 'Tidak diketahui',
                    'kelas' => $item->siswa ? $item->siswa->kelas : '-',
                    'nis' => $item->siswa ? $item->siswa->nis : '-',
                ],
                'details' => $item->pembayaranDetail ? $item->pembayaranDetail->map(function ($detail) {
                    $amount = 0;
                    if ($detail->spp) {
                        $amount = $detail->spp->nominal;
                    } elseif ($detail->ppdb) {
                        $amount = $detail->ppdb->nominal;
                    } else {
                        $amount = $detail->biaya ?? $detail->jumlah_bayar ?? 0;
                    }
                    
                    return [
                        'id' => $detail->pembayaran_detail_id,
                        'sppName' => $detail->spp ? $detail->spp->nama : null,
                        'ppdbName' => $detail->ppdb ? $detail->ppdb->nama : null,
                        'amount' => 'Rp. ' . number_format($amount, 0, ',', '.'),
                    ];
                })->toArray() : [],
            ];
        });
        
        // Calculate total amount
        $totalBayar = $pembayaranRows->sum('total_bayar');
        
        return Inertia::render('Admin/Laporan/pembayaran', [
            'pembayaran' => $pembayaran,
            'filters' => [
                'dari_tanggal' => $request->dari_tanggal,
                'sampai_tanggal' => $request->sampai_tanggal,
            ],
            'totalBayar' => $totalBayar
        ]);
    }
    
    public function downloadPembayaranPdf(Request $request)
    {
        $query = Pembayaran::with([
            'siswa:siswa_id,nama,nis,kelas', 
            'pembayaranDetail' => function($query) {
                $query->with(['spp:spp_id,nama,nominal', 'ppdb:ppdb_id,nama,nominal']);
            }
        ])
        ->where('status_pembayaran', 'lunas');
        
        // Apply date filters
        if ($request->filled('dari_tanggal')) {
            $query->whereDate('tanggal_bayar', '>=', $request->dari_tanggal);
        }
        
        if ($request->filled('sampai_tanggal')) {
            $query->whereDate('tanggal_bayar', '<=', $request->sampai_tanggal);
        }
        
        // Get the latest payments first (newest to oldest)
        $pembayaranRows = $query->latest('tanggal_bayar')->get();
        
        // Format data for PDF, ensuring it matches the expected format in the template
        $formattedData = $pembayaranRows->map(function ($item) {
            $itemPembayaran = [];
            if ($item->pembayaranDetail && $item->pembayaranDetail->count() > 0) {
                foreach ($item->pembayaranDetail as $detail) {
                    if ($detail->spp) {
                        $itemPembayaran[] = $detail->spp->nama;
                    } elseif ($detail->ppdb) {
                        $itemPembayaran[] = $detail->ppdb->nama;
                    } else {
                        $itemPembayaran[] = 'SPP ' . $item->tahun_ajaran;
                    }
                }
            } else {
                $itemPembayaran[] = 'SPP ' . $item->tahun_ajaran; 
            }
            
            return [
                'pembayaran_id' => $item->pembayaran_id,
                'tanggal_bayar' => $item->tanggal_bayar,
                'total_bayar' => $item->total_bayar,
                'tahun_ajaran' => $item->tahun_ajaran,
                'nama_siswa' => $item->siswa ? $item->siswa->nama : 'Tidak diketahui',
                'kelas_siswa' => $item->siswa ? $item->siswa->kelas : '-',
                'nis_siswa' => $item->siswa ? $item->siswa->nis : '-',
                'item_pembayaran' => $itemPembayaran,
                'status_pembayaran' => 'Lunas'
            ];
        });
        
        $data = [
            'title' => 'Laporan Pembayaran Lunas',
            'date' => date('d-m-Y'),
            'filters' => [
                'dari_tanggal' => $request->dari_tanggal ? date('d-m-Y', strtotime($request->dari_tanggal)) : '-',
                'sampai_tanggal' => $request->sampai_tanggal ? date('d-m-Y', strtotime($request->sampai_tanggal)) : '-',
            ],
            'pembayaran' => $formattedData,
        ];
        
        // Generate PDF with the data
        $pdf = PDF::loadView('admin.laporan.pembayaran_pdf', $data);
        
        // Set PDF options for better readability
        $pdf->setPaper('a4', 'landscape');
        
        // Generate filename based on date range
        $filename = 'laporan-pembayaran';
        if ($request->filled('dari_tanggal') && $request->filled('sampai_tanggal')) {
            $filename .= '-' . date('dmY', strtotime($request->dari_tanggal)) . '-' . date('dmY', strtotime($request->sampai_tanggal));
        } else {
            $filename .= '-' . date('dmY');
        }
        $filename .= '.pdf';
        
        // Return the PDF for download
        return $pdf->download($filename);
    }
    
    public function siswaLunas(Request $request)
    {
        $kelasList = Siswa::select('kelas')
            ->distinct()
            ->where('is_aktif', true)
            ->orderBy('kelas')
            ->pluck('kelas');
            
        // Get all active SPPs for the filter dropdown
        $sppList = Spp::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['spp_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        // Get all active PPDBs for the filter dropdown
        $ppdbList = \App\Models\Ppdb::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['ppdb_id', 'nama', 'tahun_ajaran', 'nominal']);
        
        // Check if any filter is applied, if not, return empty result
        if (!$request->filled('kelas') && !$request->filled('spp_id') && !$request->filled('ppdb_id')) {
            return Inertia::render('laporan/siswa-lunas', [
                'siswa' => [],
                'kelasList' => $kelasList,
                'sppList' => $sppList,
                'ppdbList' => $ppdbList,
                'filters' => [
                    'kelas' => null,
                    'spp_id' => null,
                    'ppdb_id' => null,
                ],
                'showEmptyMessage' => true  // This flag will show a message to select filters
            ]);
        }
            
        // Get data from database based on filters
        // Start with a query of payment details that have "lunas" status
        $lunasQuery = DB::table('pembayaran_detail')
            ->join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
            ->join('siswa', 'pembayaran_detail.siswa_id', '=', 'siswa.siswa_id')
            ->leftJoin('users', 'siswa.user_id', '=', 'users.user_id')
            ->where('pembayaran.status_pembayaran', 'lunas')
            ->where('siswa.is_aktif', true);
        
        // Apply class filter if provided
        if ($request->filled('kelas')) {
            $lunasQuery->where('siswa.kelas', $request->kelas);
        }
        
        // Apply SPP filter if provided
        if ($request->filled('spp_id')) {
            $lunasQuery->where('pembayaran_detail.spp_id', $request->spp_id);
        }
        
        // Apply PPDB filter if provided  
        if ($request->filled('ppdb_id')) {
            $lunasQuery->where('pembayaran_detail.ppdb_id', $request->ppdb_id);
        }
        
        // Get unique student IDs who have paid
        $paidStudentIds = $lunasQuery->select('siswa.siswa_id')
            ->distinct()
            ->pluck('siswa.siswa_id')
            ->toArray();
        
        // Get unpaid student IDs
        $unpaidQuery = DB::table('pembayaran_detail')
            ->join('siswa', 'pembayaran_detail.siswa_id', '=', 'siswa.siswa_id')
            ->where('siswa.is_aktif', true)
            ->where(function($query) {
                $query->where('pembayaran_detail.status_pembayaran', '!=', 'lunas')
                      ->orWhereNull('pembayaran_detail.status_pembayaran');
            });
        
        // Apply class filter if provided
        if ($request->filled('kelas')) {
            $unpaidQuery->where('siswa.kelas', $request->kelas);
        }
        
        // Apply SPP filter if provided
        if ($request->filled('spp_id')) {
            $unpaidQuery->where('pembayaran_detail.spp_id', $request->spp_id);
        }
        
        // Apply PPDB filter if provided  
        if ($request->filled('ppdb_id')) {
            $unpaidQuery->where('pembayaran_detail.ppdb_id', $request->ppdb_id);
        }
        
        // Get unique student IDs who have unpaid items
        $unpaidStudentIds = $unpaidQuery->select('siswa.siswa_id')
            ->distinct()
            ->pluck('siswa.siswa_id')
            ->toArray();
        
        // Get students who have payment records and haven't missed any payments
        $studentsWithAllPaid = array_diff($paidStudentIds, $unpaidStudentIds);
        
        // Get the student details for those who have paid all required fees
        $siswaLunas = Siswa::with('user:user_id,email')
            ->select(['siswa_id', 'user_id', 'nama', 'nis', 'kelas', 'tanggal_masuk'])
            ->where('is_aktif', true)
            ->whereIn('siswa_id', $studentsWithAllPaid);
        
        // Apply class filter if provided
        if ($request->filled('kelas')) {
            $siswaLunas->where('kelas', $request->kelas);
        }
        
        // Get the final results
        $siswaLunasResults = $siswaLunas->orderBy('kelas')->orderBy('nama')->get();
        
        return Inertia::render('laporan/siswa-lunas', [
            'siswa' => $siswaLunasResults,
            'kelasList' => $kelasList,
            'sppList' => $sppList,
            'ppdbList' => $ppdbList,
            'filters' => [
                'kelas' => $request->kelas,
                'spp_id' => $request->spp_id ? (int) $request->spp_id : null,
                'ppdb_id' => $request->ppdb_id ? (int) $request->ppdb_id : null,
            ],
            'showEmptyMessage' => false
        ]);
    }
    
    /**
     * Generate and download PDF for paid students report.
     */
    public function downloadSiswaLunasPdf(Request $request)
    {
        $kelasList = Siswa::select('kelas')
            ->distinct()
            ->where('is_aktif', true)
            ->orderBy('kelas')
            ->pluck('kelas');
            
        // Get all active SPPs for filtering
        $sppList = Spp::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['spp_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        // Get all active PPDBs for filtering
        $ppdbList = \App\Models\Ppdb::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['ppdb_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        // Get data from database based on filters
        // Start with a query of payment details that have "lunas" status
        $lunasQuery = DB::table('pembayaran_detail')
            ->join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
            ->join('siswa', 'pembayaran_detail.siswa_id', '=', 'siswa.siswa_id')
            ->leftJoin('users', 'siswa.user_id', '=', 'users.user_id')
            ->where('pembayaran.status_pembayaran', 'lunas')
            ->where('siswa.is_aktif', true);
        
        // Apply class filter if provided
        if ($request->filled('kelas')) {
            $lunasQuery->where('siswa.kelas', $request->kelas);
        }
        
        // Apply SPP filter if provided
        if ($request->filled('spp_id')) {
            $lunasQuery->where('pembayaran_detail.spp_id', $request->spp_id);
        }
        
        // Apply PPDB filter if provided  
        if ($request->filled('ppdb_id')) {
            $lunasQuery->where('pembayaran_detail.ppdb_id', $request->ppdb_id);
        }
        
        // Get unique student IDs who have paid
        $paidStudentIds = $lunasQuery->select('siswa.siswa_id')
            ->distinct()
            ->pluck('siswa.siswa_id')
            ->toArray();
        
        // Get unpaid student IDs
        $unpaidQuery = DB::table('pembayaran_detail')
            ->join('siswa', 'pembayaran_detail.siswa_id', '=', 'siswa.siswa_id')
            ->where('siswa.is_aktif', true)
            ->where(function($query) {
                $query->where('pembayaran_detail.status_pembayaran', '!=', 'lunas')
                      ->orWhereNull('pembayaran_detail.status_pembayaran');
            });
        
        // Apply class filter if provided
        if ($request->filled('kelas')) {
            $unpaidQuery->where('siswa.kelas', $request->kelas);
        }
        
        // Apply SPP filter if provided
        if ($request->filled('spp_id')) {
            $unpaidQuery->where('pembayaran_detail.spp_id', $request->spp_id);
        }
        
        // Apply PPDB filter if provided  
        if ($request->filled('ppdb_id')) {
            $unpaidQuery->where('pembayaran_detail.ppdb_id', $request->ppdb_id);
        }
        
        // Get unique student IDs who have unpaid items
        $unpaidStudentIds = $unpaidQuery->select('siswa.siswa_id')
            ->distinct()
            ->pluck('siswa.siswa_id')
            ->toArray();
        
        // Get students who have payment records and haven't missed any payments
        $studentsWithAllPaid = array_diff($paidStudentIds, $unpaidStudentIds);
        
        // Get the student details for those who have paid all required fees
        $siswaLunas = Siswa::with('user:user_id,email')
            ->select(['siswa_id', 'user_id', 'nama', 'nis', 'kelas', 'tanggal_masuk'])
            ->where('is_aktif', true)
            ->whereIn('siswa_id', $studentsWithAllPaid);
        
        // Apply class filter if provided
        if ($request->filled('kelas')) {
            $siswaLunas->where('kelas', $request->kelas);
        }
        
        // Get the final results
        $siswaLunasResults = $siswaLunas->orderBy('kelas')->orderBy('nama')->get();
        
        // Prepare filter labels for the PDF
        $filterLabels = [
            'kelas' => $request->kelas ? $request->kelas : 'Semua Kelas',
            'spp' => $request->filled('spp_id') ? 
                $sppList->where('spp_id', $request->spp_id)->first()->nama . ' - ' . $sppList->where('spp_id', $request->spp_id)->first()->tahun_ajaran : 'Semua SPP',
            'ppdb' => $request->filled('ppdb_id') ? 
                $ppdbList->where('ppdb_id', $request->ppdb_id)->first()->nama . ' - ' . $ppdbList->where('ppdb_id', $request->ppdb_id)->first()->tahun_ajaran : 'Semua PPDB',
        ];
        
        // Format data for PDF
        $data = [
            'title' => 'Laporan Siswa Lunas',
            'date' => date('d-m-Y'),
            'kelas' => $filterLabels['kelas'], // Extract kelas for the blade template
            'spp' => $filterLabels['spp'],     // Extract spp for the blade template
            'ppdb' => $filterLabels['ppdb'],   // Extract ppdb for the blade template
            'filters' => $filterLabels,
            'siswa' => $siswaLunasResults,
        ];
        
        // Generate PDF with the data
        $pdf = PDF::loadView('admin.laporan.siswa_lunas_pdf', $data);
        
        // Set PDF options for better readability
        $pdf->setPaper('a4', 'landscape');
        
        // Generate filename based on filters
        $filename = 'laporan-siswa-lunas';
        if ($request->filled('kelas')) {
            $filename .= '-kelas-' . str_replace(' ', '-', $request->kelas);
        }
        if ($request->filled('spp_id')) {
            $filename .= '-spp-' . $request->spp_id;
        }
        if ($request->filled('ppdb_id')) {
            $filename .= '-ppdb-' . $request->ppdb_id;
        }
        $filename .= '-' . date('dmY') . '.pdf';
        
        // Return the PDF for download
        return $pdf->download($filename);
    }
    
    public function siswaMenunggak(Request $request)
    {
        $kelasList = Siswa::select('kelas')
            ->distinct()
            ->orderBy('kelas')
            ->pluck('kelas');
            
        // Get all active SPPs for the filter dropdown
        $sppList = Spp::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['spp_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        // Get all active PPDBs for the filter dropdown
        $ppdbList = \App\Models\Ppdb::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['ppdb_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        $query = Siswa::with('user:user_id,email')
            ->select(['siswa_id', 'user_id', 'nama', 'nis', 'kelas', 'tanggal_masuk'])
            ->where('is_aktif', true);
            
        if ($request->filled('kelas')) {
            $query->where('kelas', $request->kelas);
        }
        
        $siswa = $query->orderBy('kelas')->orderBy('nama')->get();
        
        // Determine if SPP filter is active
        $hasSppFilter = $request->filled('spp_id');
        
        // Determine if PPDB filter is active
        $hasPpdbFilter = $request->filled('ppdb_id');
        
        // Get all active SPPs
        $activeSpps = Spp::where('is_aktif', true);
        
        // Option to filter by specific SPP item
        if ($hasSppFilter) {
            $activeSpps = $activeSpps->where('spp_id', $request->spp_id);
        }
        
        // Get SPP items
        $activeSpps = $activeSpps->get();
        $activeSppIds = $activeSpps->pluck('spp_id')->toArray();
        
        // Get all active PPDBs
        $activePpdbs = \App\Models\Ppdb::where('is_aktif', true);
        
        // Option to filter by specific PPDB item
        if ($hasPpdbFilter) {
            $activePpdbs = $activePpdbs->where('ppdb_id', $request->ppdb_id);
        }
        
        // Get PPDB items
        $activePpdbs = $activePpdbs->get();
        $activePpdbIds = $activePpdbs->pluck('ppdb_id')->toArray();
        
        // Get all students who have not paid based on selected filters
        $siswaMenunggak = [];
        $tunggakanDetails = [];
        
        foreach ($siswa as $s) {
            $shouldIncludeStudent = false;
            $tunggakanItems = collect();
            $totalTunggakan = 0;
            
            // Only check SPP if an SPP filter is applied or no filters are applied at all
            if ($hasSppFilter || (!$hasSppFilter && !$hasPpdbFilter)) {
                // Get all paid SPPs for this student
                $paidSppIds = PembayaranDetail::join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
                    ->where('pembayaran_detail.siswa_id', $s->siswa_id)
                    ->where('pembayaran.status_pembayaran', 'lunas')
                    ->pluck('pembayaran_detail.spp_id')
                    ->toArray();
                
                $unpaidSppIds = array_diff($activeSppIds, $paidSppIds);
                
                if ($hasSppFilter) {
                    // If specific SPP is selected, check if it's unpaid
                    $isUnpaidSpp = in_array($request->spp_id, $unpaidSppIds);
                    if ($isUnpaidSpp) {
                        $shouldIncludeStudent = true;
                        // Add the specific unpaid SPP to tunggakan
                        $unpaidSpps = $activeSpps->where('spp_id', $request->spp_id);
                        $tunggakanItems = $tunggakanItems->merge($unpaidSpps);
                        $totalTunggakan += $unpaidSpps->sum('nominal');
                    }
                } elseif (!$hasPpdbFilter && !empty($unpaidSppIds)) {
                    // No specific filter selected, include if any SPP is unpaid
                    $shouldIncludeStudent = true;
                    // Add all unpaid SPPs to tunggakan
                    $unpaidSpps = $activeSpps->whereIn('spp_id', $unpaidSppIds);
                    $tunggakanItems = $tunggakanItems->merge($unpaidSpps);
                    $totalTunggakan += $unpaidSpps->sum('nominal');
                }
            }
            
            // Only check PPDB if a PPDB filter is applied or no filters are applied at all
            if ($hasPpdbFilter || (!$hasSppFilter && !$hasPpdbFilter)) {
                // Get all paid PPDBs for this student
                $paidPpdbIds = PembayaranDetail::join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
                    ->where('pembayaran_detail.siswa_id', $s->siswa_id)
                    ->where('pembayaran.status_pembayaran', 'lunas')
                    ->pluck('pembayaran_detail.ppdb_id')
                    ->toArray();
                
                $unpaidPpdbIds = array_diff($activePpdbIds, $paidPpdbIds);
                
                if ($hasPpdbFilter) {
                    // If specific PPDB is selected, check if it's unpaid
                    $isUnpaidPpdb = in_array($request->ppdb_id, $unpaidPpdbIds);
                    if ($isUnpaidPpdb) {
                        $shouldIncludeStudent = true;
                        // Add the specific unpaid PPDB to tunggakan
                        $unpaidPpdbs = $activePpdbs->where('ppdb_id', $request->ppdb_id);
                        $tunggakanItems = $tunggakanItems->merge($unpaidPpdbs);
                        $totalTunggakan += $unpaidPpdbs->sum('nominal');
                    }
                } elseif (!$hasSppFilter && !empty($unpaidPpdbIds)) {
                    // No specific filter selected, include if any PPDB is unpaid
                    $shouldIncludeStudent = true;
                    // Add all unpaid PPDBs to tunggakan
                    $unpaidPpdbs = $activePpdbs->whereIn('ppdb_id', $unpaidPpdbIds);
                    $tunggakanItems = $tunggakanItems->merge($unpaidPpdbs);
                    $totalTunggakan += $unpaidPpdbs->sum('nominal');
                }
            }
            
            if ($shouldIncludeStudent) {
                $siswaMenunggak[] = $s;
                $tunggakanDetails[$s->siswa_id] = [
                    'items' => $tunggakanItems,
                    'total' => $totalTunggakan
                ];
            }
        }
        
        if ($request->download) {
            $kelas = $request->kelas ?? 'Semua';
            $sppName = $request->filled('spp_id') ? 
                $sppList->where('spp_id', $request->spp_id)->first()->nama : 'Semua SPP';
            $ppdbName = $request->filled('ppdb_id') ? 
                $ppdbList->where('ppdb_id', $request->ppdb_id)->first()->nama : 'Semua PPDB';
                
            $pdf = PDF::loadView('admin.laporan.siswa_menunggak_pdf', [
                'siswa' => $siswaMenunggak,
                'tunggakanDetails' => $tunggakanDetails,
                'kelas' => $kelas,
                'spp' => $sppName,
                'ppdb' => $ppdbName
            ]);
            
            // Use readfile approach for direct download
            $filename = 'laporan-siswa-menunggak-' . date('YmdHis') . '.pdf';
            $tempFile = storage_path('app/public/' . $filename);
            
            // Save PDF to temporary file
            file_put_contents($tempFile, $pdf->output());
            
            // Make sure nothing has been output yet
            if (ob_get_level()) ob_end_clean();
            
            // Disable output buffering
            ini_set('output_buffering', 'off');
            // Turn off output compression
            ini_set('zlib.output_compression', false);
            
            // Set appropriate headers
            header('Content-Description: File Transfer');
            header('Content-Type: application/pdf');
            header('Content-Disposition: attachment; filename="' . $filename . '"');
            header('Content-Transfer-Encoding: binary');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            header('Content-Length: ' . filesize($tempFile));
            
            // Clear system output buffer
            flush();
            
            // Read file directly to output
            readfile($tempFile);
            
            // Delete file after sending
            unlink($tempFile);
            
            // End script execution
            exit;
        }
        
        return Inertia::render('laporan/siswa-menunggak', [
            'siswa' => $siswaMenunggak,
            'tunggakanDetails' => $tunggakanDetails,
            'kelasList' => $kelasList,
            'sppList' => $sppList,
            'ppdbList' => $ppdbList,
            'filters' => [
                'kelas' => $request->kelas,
                'spp_id' => $request->spp_id,
                'ppdb_id' => $request->ppdb_id,
            ]
        ]);
    }

    /**
     * Direct binary PDF download for laporan siswa menunggak
     *
     * @param Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadSiswaMenunggakPdf(Request $request)
    {
        // Get all classes for the filter
        $kelasList = Siswa::select('kelas')
            ->distinct()
            ->orderBy('kelas')
            ->pluck('kelas');
            
        // Get all active SPPs for the filter dropdown
        $sppList = Spp::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['spp_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        // Get all active PPDBs for the filter dropdown
        $ppdbList = \App\Models\Ppdb::where('is_aktif', true)
            ->orderBy('nama')
            ->get(['ppdb_id', 'nama', 'tahun_ajaran', 'nominal']);
            
        $query = Siswa::with('user:user_id,email')
            ->select(['siswa_id', 'user_id', 'nama', 'nis', 'kelas', 'tanggal_masuk'])
            ->where('is_aktif', true);
            
        if ($request->filled('kelas')) {
            $query->where('kelas', $request->kelas);
        }
        
        $siswa = $query->orderBy('kelas')->orderBy('nama')->get();
        
        // Determine if SPP filter is active
        $hasSppFilter = $request->filled('spp_id');
        
        // Determine if PPDB filter is active
        $hasPpdbFilter = $request->filled('ppdb_id');
        
        // Get all active SPPs
        $activeSpps = Spp::where('is_aktif', true);
        
        // Option to filter by specific SPP item
        if ($hasSppFilter) {
            $activeSpps = $activeSpps->where('spp_id', $request->spp_id);
        }
        
        // Get SPP items
        $activeSpps = $activeSpps->get();
        $activeSppIds = $activeSpps->pluck('spp_id')->toArray();
        
        // Get all active PPDBs
        $activePpdbs = \App\Models\Ppdb::where('is_aktif', true);
        
        // Option to filter by specific PPDB item
        if ($hasPpdbFilter) {
            $activePpdbs = $activePpdbs->where('ppdb_id', $request->ppdb_id);
        }
        
        // Get PPDB items
        $activePpdbs = $activePpdbs->get();
        $activePpdbIds = $activePpdbs->pluck('ppdb_id')->toArray();
        
        // Get all students who have not paid based on selected filters
        $siswaMenunggak = [];
        $tunggakanDetails = [];
        
        foreach ($siswa as $s) {
            $shouldIncludeStudent = false;
            $tunggakanItems = collect();
            $totalTunggakan = 0;
            
            // Only check SPP if an SPP filter is applied or no filters are applied at all
            if ($hasSppFilter || (!$hasSppFilter && !$hasPpdbFilter)) {
                // Get all paid SPPs for this student
                $paidSppIds = PembayaranDetail::join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
                    ->where('pembayaran_detail.siswa_id', $s->siswa_id)
                    ->where('pembayaran.status_pembayaran', 'lunas')
                    ->pluck('pembayaran_detail.spp_id')
                    ->toArray();
                
                $unpaidSppIds = array_diff($activeSppIds, $paidSppIds);
                
                if ($hasSppFilter) {
                    // If specific SPP is selected, check if it's unpaid
                    $isUnpaidSpp = in_array($request->spp_id, $unpaidSppIds);
                    if ($isUnpaidSpp) {
                        $shouldIncludeStudent = true;
                        // Add the specific unpaid SPP to tunggakan
                        $unpaidSpps = $activeSpps->where('spp_id', $request->spp_id);
                        $tunggakanItems = $tunggakanItems->merge($unpaidSpps);
                        $totalTunggakan += $unpaidSpps->sum('nominal');
                    }
                } elseif (!$hasPpdbFilter && !empty($unpaidSppIds)) {
                    // No specific filter selected, include if any SPP is unpaid
                    $shouldIncludeStudent = true;
                    // Add all unpaid SPPs to tunggakan
                    $unpaidSpps = $activeSpps->whereIn('spp_id', $unpaidSppIds);
                    $tunggakanItems = $tunggakanItems->merge($unpaidSpps);
                    $totalTunggakan += $unpaidSpps->sum('nominal');
                }
            }
            
            // Only check PPDB if a PPDB filter is applied or no filters are applied at all
            if ($hasPpdbFilter || (!$hasSppFilter && !$hasPpdbFilter)) {
                // Get all paid PPDBs for this student
                $paidPpdbIds = PembayaranDetail::join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
                    ->where('pembayaran_detail.siswa_id', $s->siswa_id)
                    ->where('pembayaran.status_pembayaran', 'lunas')
                    ->pluck('pembayaran_detail.ppdb_id')
                    ->toArray();
                
                $unpaidPpdbIds = array_diff($activePpdbIds, $paidPpdbIds);
                
                if ($hasPpdbFilter) {
                    // If specific PPDB is selected, check if it's unpaid
                    $isUnpaidPpdb = in_array($request->ppdb_id, $unpaidPpdbIds);
                    if ($isUnpaidPpdb) {
                        $shouldIncludeStudent = true;
                        // Add the specific unpaid PPDB to tunggakan
                        $unpaidPpdbs = $activePpdbs->where('ppdb_id', $request->ppdb_id);
                        $tunggakanItems = $tunggakanItems->merge($unpaidPpdbs);
                        $totalTunggakan += $unpaidPpdbs->sum('nominal');
                    }
                } elseif (!$hasSppFilter && !empty($unpaidPpdbIds)) {
                    // No specific filter selected, include if any PPDB is unpaid
                    $shouldIncludeStudent = true;
                    // Add all unpaid PPDBs to tunggakan
                    $unpaidPpdbs = $activePpdbs->whereIn('ppdb_id', $unpaidPpdbIds);
                    $tunggakanItems = $tunggakanItems->merge($unpaidPpdbs);
                    $totalTunggakan += $unpaidPpdbs->sum('nominal');
                }
            }
            
            if ($shouldIncludeStudent) {
                $siswaMenunggak[] = $s;
                $tunggakanDetails[$s->siswa_id] = [
                    'items' => $tunggakanItems,
                    'total' => $totalTunggakan
                ];
            }
        }
        
        $kelas = $request->kelas ?? 'Semua';
        $sppName = $request->filled('spp_id') ? 
            $sppList->where('spp_id', $request->spp_id)->first()->nama : 'Semua SPP';
        $ppdbName = $request->filled('ppdb_id') ? 
            $ppdbList->where('ppdb_id', $request->ppdb_id)->first()->nama : 'Semua PPDB';
            
        $pdf = PDF::loadView('admin.laporan.siswa_menunggak_pdf', [
            'siswa' => $siswaMenunggak,
            'tunggakanDetails' => $tunggakanDetails,
            'kelas' => $kelas,
            'spp' => $sppName,
            'ppdb' => $ppdbName
        ]);
        
        // Generate file with unique name to avoid caching issues
        $fileName = 'laporan-siswa-menunggak-' . date('YmdHis') . '.pdf';
        $tempPath = storage_path('app/public/' . $fileName);
        
        // Save PDF to file
        file_put_contents($tempPath, $pdf->output());
        
        // Use Symfony's direct file response for binary safety
        return Response::download($tempPath, $fileName, [
            'Content-Type' => 'application/pdf',
        ])->deleteFileAfterSend();
    }

    /**
     * Send WhatsApp notification to student with unpaid bills via Fonnte API
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function sendWhatsAppNotification(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswa,siswa_id',
            'total_tunggakan' => 'required|numeric',
            'item_name' => 'required|string'
        ]);
        
        // Get student data
        $siswa = Siswa::findOrFail($request->siswa_id);
        
        // Format total tunggakan
        $formattedTotal = 'Rp ' . number_format($request->total_tunggakan, 0, ',', '.');
        
        // Get the phone number from siswa
        $phone = $siswa->no_hp;
        
        // If no phone number is available, return an Inertia response with an error
        if (!$phone) {
            return back()->with('error', 'Nomor telepon tidak ditemukan');
        }
        
        // Format phone number (ensure it starts with country code without + symbol)
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (substr($phone, 0, 1) === '0') {
            $phone = '62' . substr($phone, 1);
        }
        
        // Use the item name passed from the frontend
        $itemName = $request->item_name;
        
        // Prepare message content with the requested format
        $message = "Haloo *{$siswa->nama}*\n\n";
        $message .= "Kami Meningatkan bahwa Anda memiliki Tunggakan *{$itemName}* dengan nominal *{$formattedTotal}*.\n\n";
        $message .= "Dimohon Agar Segera Melakukan Pembayaran\n\n";
        $message .= "Terimakasih,\nBendahara";
        
        try {
            // Send WhatsApp message via FonnteWhatsApp helper
            $result = \App\Helpers\FonnteWhatsApp::send($phone, $message);
            
            // Log the result to Laravel's log
            \Log::info('WhatsApp notification sent to Siswa ID: ' . $siswa->siswa_id, [
                'success' => $result['success'],
                'response' => $result['response']
            ]);
            
            if ($result['success']) {
                return back()->with('message', 'Notifikasi WhatsApp berhasil dikirim');
            } else {
                return back()->with('error', 'Gagal mengirim notifikasi WhatsApp');
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send WhatsApp notification: ' . $e->getMessage());
            return back()->with('error', 'Gagal mengirim notifikasi WhatsApp: ' . $e->getMessage());
        }
    }
}
