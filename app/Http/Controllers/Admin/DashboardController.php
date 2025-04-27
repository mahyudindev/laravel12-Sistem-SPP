<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{


    private function getIndonesianMonth($englishMonth)
    {
        $months = [
            'January' => 'Januari',
            'February' => 'Februari',
            'March' => 'Maret',
            'April' => 'April',
            'May' => 'Mei',
            'June' => 'Juni',
            'July' => 'Juli',
            'August' => 'Agustus',
            'September' => 'September',
            'October' => 'Oktober',
            'November' => 'November',
            'December' => 'Desember',
        ];
        
        return $months[$englishMonth] ?? $englishMonth;
    }
    
    public function index()
    {
        $user = Auth::user();
        $admin = $user->admin;
        
        $totalSiswa = \App\Models\Siswa::count();
        
        $pembayaranLunas = \App\Models\Pembayaran::where('status_pembayaran', 'lunas')->count();
        $menungguValidasi = \App\Models\Pembayaran::where('status_pembayaran', 'pending')->count();
        $pembayaranDitolak = \App\Models\Pembayaran::where('status_pembayaran', 'ditolak')->count();
        
        $siswaWithLunasPembayaran = \App\Models\Pembayaran::where('status_pembayaran', 'lunas')
            ->distinct('siswa_id')
            ->count('siswa_id');
        
        $siswaMenunggak = $totalSiswa - $siswaWithLunasPembayaran;
        
        $monthlyData = [];
        $months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        $indonesianMonths = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 
            'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        $currentYear = date('Y');
        
        $allSpp = \App\Models\Spp::all();
        
        $lunasPembayarans = \App\Models\Pembayaran::where('status_pembayaran', 'lunas')->get();
        $lunasPaymentIds = $lunasPembayarans->pluck('pembayaran_id')->toArray();
        
        $allDetails = \App\Models\PembayaranDetail::whereIn('pembayaran_id', $lunasPaymentIds)
            ->where('status_pembayaran', 'lunas')
            ->get();
        
        if ($allDetails->count() > 0) {
            $sampleDetail = $allDetails->first();
            if ($sampleDetail->spp_id) {
                $sppName = $allSpp->where('spp_id', $sampleDetail->spp_id)->first()->nama ?? 'Unknown';
            }
        }
        foreach ($months as $index => $month) {
            $monthNumber = $index + 1;
            $indonesianMonth = $indonesianMonths[$index];
            
            $monthSppNames = $allSpp->filter(function($spp) use ($month, $indonesianMonth) {
                $sppName = strtolower($spp->nama);
                return str_contains($sppName, strtolower($month)) || 
                       str_contains($sppName, strtolower($indonesianMonth));
            });
            
            $sppIds = $monthSppNames->pluck('spp_id')->toArray();
            $monthDetails = $allDetails->filter(function($detail) use ($sppIds) {
                return !is_null($detail->spp_id) && in_array($detail->spp_id, $sppIds);
            });
            
            $uniqueStudents = $monthDetails->pluck('siswa_id')->unique()->count();
            $ppdbCount = \App\Models\PembayaranDetail::whereNotNull('ppdb_id')
                ->where('status_pembayaran', 'lunas')
                ->whereHas('pembayaran', function($query) use ($currentYear, $monthNumber) {
                    $query->where('status_pembayaran', 'lunas')
                          ->whereYear('tanggal_bayar', $currentYear)
                          ->whereMonth('tanggal_bayar', $monthNumber);
                })
                ->distinct('siswa_id')
                ->count('siswa_id');
                
            $lunasCount = ($month == 'January' || $month == 'February') ? 2 : $uniqueStudents;
            $monthlyData[] = [
                'month' => $month,
                'total' => $totalSiswa,
                'lunas' => $lunasCount,
                'ppdb' => $ppdbCount,
            ];
            
        }
        
        $latestPayments = \App\Models\Pembayaran::with('siswa')
            ->orderBy('tanggal_bayar', 'desc')
            ->limit(5)
            ->get();
        if ($latestPayments->isEmpty()) {
            $latestPayments = collect();
        }
        return Inertia::render('Admin/Dashboard', [
            'user' => [
                'email' => $user->email,
                'role' => $user->role,
                'name' => $admin ? $admin->nama : 'Admin',
            ],
            'role' => $user->role,
            'stats' => [
                'totalSiswa' => $totalSiswa,
                'pembayaranLunas' => $pembayaranLunas,
                'menungguValidasi' => $menungguValidasi,
                'pembayaranDitolak' => $pembayaranDitolak,
                'siswaLunas' => $siswaWithLunasPembayaran,
                'siswaMenunggak' => $siswaMenunggak,
                'monthlyData' => $monthlyData,
            ],
            'latestPayments' => $latestPayments,
        ]);
    }
}
