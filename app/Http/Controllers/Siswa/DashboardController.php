<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Menampilkan dashboard siswa
     */
    public function index()
    {
        $user = Auth::user();
        $siswa = $user->siswa;
        
        $totalTagihan = 0;
        $totalBayar = 0;
        $sisaTagihan = 0;
        $bills = [];
        if ($siswa) {
            // --- Semua SPP (lunas dan belum lunas) ---
            $sppList = \App\Models\Spp::where('is_aktif', true)->get();
            foreach ($sppList as $spp) {
                $totalTagihan += $spp->nominal;
                
                $isLunas = \App\Models\PembayaranDetail::where('siswa_id', $siswa->siswa_id)
                    ->where('spp_id', $spp->spp_id)
                    ->where('status_pembayaran', 'lunas')
                    ->exists();
                    
                if (!$isLunas) {
                    $bills[] = [
                        'id' => 'spp_' . $spp->spp_id,
                        'name' => $spp->nama,
                        'amount' => 'Rp. ' . number_format($spp->nominal, 0, ',', '.'),
                        'status' => 'belum lunas',
                    ];
                } else {
                    $bills[] = [
                        'id' => 'spp_' . $spp->spp_id,
                        'name' => $spp->nama,
                        'amount' => 'Rp. ' . number_format($spp->nominal, 0, ',', '.'),
                        'status' => 'lunas',
                    ];
                }
            }

            $ppdbList = \App\Models\Ppdb::where('is_aktif', true)
                ->where(function($q) use ($siswa) {
                    $q->whereNull('kelas')->orWhere('kelas', $siswa->kelas);
                })
                ->get();
            foreach ($ppdbList as $ppdb) {
                $totalTagihan += $ppdb->nominal;
                
                $isLunas = \App\Models\PembayaranDetail::where('siswa_id', $siswa->siswa_id)
                    ->where('ppdb_id', $ppdb->ppdb_id)
                    ->where('status_pembayaran', 'lunas')
                    ->exists();
                    
                if (!$isLunas) {
                    $bills[] = [
                        'id' => 'ppdb_' . $ppdb->ppdb_id,
                        'name' => $ppdb->nama,
                        'amount' => 'Rp. ' . number_format($ppdb->nominal, 0, ',', '.'),
                        'status' => 'belum lunas',
                    ];
                } else {
                    $bills[] = [
                        'id' => 'ppdb_' . $ppdb->ppdb_id,
                        'name' => $ppdb->nama,
                        'amount' => 'Rp. ' . number_format($ppdb->nominal, 0, ',', '.'),
                        'status' => 'lunas',
                    ];
                }
            }

            $pembayaranLunas = $siswa->pembayaran()->with(['pembayaranDetail.spp', 'pembayaranDetail.ppdb'])->where('status_pembayaran', 'lunas')->get();
            $totalBayar = $pembayaranLunas->sum('total_bayar');
            $sisaTagihan = $totalTagihan - $totalBayar;
        }

  
        $paymentHistory = [];
        $allPaymentHistory = [];
        if ($siswa) {
            $pembayaranLunas = $siswa->pembayaran()->with(['pembayaranDetail.spp', 'pembayaranDetail.ppdb'])->where('status_pembayaran', 'lunas')->get();
            foreach ($pembayaranLunas as $pembayaran) {
                $rejectionReason = $pembayaran->alasan_ditolak ?? $pembayaran->keterangan ?? null;
                $keterangan = $pembayaran->keterangan ?? $pembayaran->jenis ?? 'Pembayaran';
                $paymentHistory[] = [
                    'id' => $pembayaran->id ?? $pembayaran->pembayaran_id ?? uniqid(),
                    'name' => $keterangan,
                    'sppName' => ($pembayaran->pembayaranDetail && $pembayaran->pembayaranDetail->first() && $pembayaran->pembayaranDetail->first()->spp) ? $pembayaran->pembayaranDetail->first()->spp->nama : null,
                    'amount' => 'Rp. ' . number_format($pembayaran->total_bayar, 0, ',', '.'),
                    'date' => $pembayaran->tanggal_bayar ? date('d F Y', strtotime($pembayaran->tanggal_bayar)) : '-',
                    'approvalDate' => $pembayaran->tanggal_persetujuan ? date('d F Y', strtotime($pembayaran->tanggal_persetujuan)) : null,
                    'tanggal_bayar' => $pembayaran->tanggal_bayar,
                    'tanggal_persetujuan' => $pembayaran->tanggal_persetujuan,
                    'status' => 'lunas',
                    'photoUrl' => $pembayaran->bukti_bayar ? asset('storage/' . $pembayaran->bukti_bayar) : null,
                    'method' => $pembayaran->metode_pembayaran ?? null,
                    'receiptNumber' => $pembayaran->no_bukti ?? null,
                    'keterangan' => $keterangan,
                    'rejectionReason' => $rejectionReason,
                    'schoolYear' => $pembayaran->tahun_ajaran ?? null,
                    'paymentMonth' => $pembayaran->bulan ?? null,
                    'details' => ($pembayaran->pembayaranDetail && $pembayaran->pembayaranDetail->count()) ? $pembayaran->pembayaranDetail->map(function($detail) {
                        $amount = 0;
                        if ($detail->spp) {
                            $amount = $detail->spp->nominal;
                        } elseif ($detail->ppdb) {
                            $amount = $detail->ppdb->nominal;
                        } else {
                            $amount = $detail->nominal ?? $detail->total_bayar ?? 0;
                        }
                        return [
                            'sppName' => $detail->spp ? $detail->spp->nama : null,
                            'ppdbName' => $detail->ppdb ? $detail->ppdb->nama : null,
                            'amount' => 'Rp. ' . number_format($amount, 0, ',', '.'),
                        ];
                    })->toArray() : [],
                ];
            }
            $allPembayaran = $siswa->pembayaran()->with(['pembayaranDetail.spp', 'pembayaranDetail.ppdb'])->get();
            foreach ($allPembayaran as $pembayaran) {
                $rejectionReason = $pembayaran->alasan_ditolak ?? $pembayaran->keterangan ?? null;
                $keterangan = $pembayaran->keterangan ?? $pembayaran->jenis ?? 'Pembayaran';
                $allPaymentHistory[] = [
                    'id' => $pembayaran->id ?? $pembayaran->pembayaran_id ?? uniqid(),
                    'name' => $keterangan,
                    'sppName' => ($pembayaran->pembayaranDetail && $pembayaran->pembayaranDetail->first() && $pembayaran->pembayaranDetail->first()->spp) ? $pembayaran->pembayaranDetail->first()->spp->nama : null,
                    'amount' => 'Rp. ' . number_format($pembayaran->total_bayar, 0, ',', '.'),
                    'date' => $pembayaran->tanggal_bayar ? date('d F Y', strtotime($pembayaran->tanggal_bayar)) : '-',
                    'approvalDate' => $pembayaran->tanggal_persetujuan ? date('d F Y', strtotime($pembayaran->tanggal_persetujuan)) : null,
                    'tanggal_bayar' => $pembayaran->tanggal_bayar,
                    'tanggal_persetujuan' => $pembayaran->tanggal_persetujuan,
                    'status' => $pembayaran->status_pembayaran,
                    'photoUrl' => $pembayaran->bukti_bayar ? asset('storage/' . $pembayaran->bukti_bayar) : null,
                    'method' => $pembayaran->metode_pembayaran ?? null,
                    'receiptNumber' => $pembayaran->no_bukti ?? null,
                    'keterangan' => $keterangan,
                    'rejectionReason' => $rejectionReason,
                    'schoolYear' => $pembayaran->tahun_ajaran ?? null,
                    'paymentMonth' => $pembayaran->bulan ?? null,
                    'details' => ($pembayaran->pembayaranDetail && $pembayaran->pembayaranDetail->count()) ? $pembayaran->pembayaranDetail->map(function($detail) {
                        $amount = 0;
                        if ($detail->spp) {
                            $amount = $detail->spp->nominal;
                        } elseif ($detail->ppdb) {
                            $amount = $detail->ppdb->nominal;
                        } else {
                            $amount = $detail->nominal ?? $detail->total_bayar ?? 0;
                        }
                        return [
                            'sppName' => $detail->spp ? $detail->spp->nama : null,
                            'ppdbName' => $detail->ppdb ? $detail->ppdb->nama : null,
                            'amount' => 'Rp. ' . number_format($amount, 0, ',', '.'),
                        ];
                    })->toArray() : [],
                ];
            }
        }
        return Inertia::render('Siswa/Dashboard', [
            'user' => [
                'email' => $user->email,
                'role' => $user->role,
                'name' => $siswa ? $siswa->nama : 'Siswa',
                'nis' => $siswa ? $siswa->nis : null,
            ],
            'summary' => [
                'totalTagihan' => $totalTagihan,
                'totalBayar' => $totalBayar,
                'sisaTagihan' => $sisaTagihan,
            ],
            'bills' => $bills,
            'paymentHistory' => $paymentHistory,
            'allPaymentHistory' => $allPaymentHistory,
        ]);
    }
}
