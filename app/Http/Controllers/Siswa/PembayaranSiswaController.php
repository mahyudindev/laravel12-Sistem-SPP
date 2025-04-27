<?php

namespace App\Http\Controllers\Siswa;

use App\Http\Controllers\Controller;
use App\Models\Spp;
use App\Models\Ppdb;
use App\Models\Pembayaran;
use App\Models\PembayaranDetail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class PembayaranSiswaController extends Controller
{
    public function index()
    {

        $siswa = Auth::user()->load('siswa')->siswa;
        

        $pembayaran = Pembayaran::with([
                'pembayaranDetail.spp:spp_id,nama,nominal', 
                'pembayaranDetail.ppdb:ppdb_id,nama,nominal'
            ])
            ->select([
                'pembayaran_id', 'siswa_id', 'total_bayar', 'total_tagihan', 
                'status_pembayaran', 'tanggal_bayar', 'created_at', 'tahun_ajaran', 'keterangan', 'tanggal_persetujuan'
            ])
            ->where('siswa_id', $siswa->siswa_id)
            ->latest('created_at')
            ->get();
        

        $paymentsByStatus = $pembayaran->groupBy('status_pembayaran');
        $pendingPayments = $paymentsByStatus->get('pending', collect());
        $approvedPayments = $paymentsByStatus->get('lunas', collect());
        $rejectedPayments = $paymentsByStatus->get('ditolak', collect());
        
        $totalTagihan = $pendingPayments->sum('total_tagihan') + $rejectedPayments->sum('total_tagihan');
        $totalBayar = $approvedPayments->sum('total_bayar');
        
        $formattedPayments = $pembayaran->map(function($payment) {
            $items = $payment->pembayaranDetail->map(function($detail) {
                $name = null;
                $nominal = 0;
                
                if ($detail->spp) {
                    $name = $detail->spp->nama;
                    $nominal = $detail->spp->nominal;
                } elseif ($detail->ppdb) {
                    $name = $detail->ppdb->nama;
                    $nominal = $detail->ppdb->nominal;
                } else {
                    $name = 'Unknown';
                }
                
                return [
                    'id' => $detail->pembayaran_detail_id,
                    'name' => $name,
                    'amount' => $nominal ? "Rp " . number_format($nominal, 0, ',', '.') : '',
                ];
            });
            
            return [
                'id' => $payment->pembayaran_id,
                'date' => Carbon::parse($payment->created_at)->format('d M Y'),
                'totalAmount' => "Rp " . number_format($payment->total_bayar, 0, ',', '.'),
                'status' => $payment->status_pembayaran,
                'keterangan' => $payment->keterangan,
                'approvalDate' => $payment->tanggal_persetujuan ? Carbon::parse($payment->tanggal_persetujuan)->format('d M Y') : null,
                'items' => $items,
                'tahunAjaran' => $payment->tahun_ajaran,
            ];
        });
        
        return Inertia::render('Siswa/Pembayaran/Index', [
            'user' => [
                'email' => Auth::user()->email,
                'name' => $siswa->nama ?? Auth::user()->email,
                'role' => Auth::user()->role,
            ],
            'payments' => [
                'items' => $formattedPayments,
                'totalTagihan' => "Rp " . number_format($totalTagihan, 0, ',', '.'),
                'totalBayar' => "Rp " . number_format($totalBayar, 0, ',', '.'),
                'sisaTunggakan' => "Rp " . number_format($totalTagihan, 0, ',', '.'),
            ],
        ]);
    }
    
    public function create()
    {
        $siswa = Auth::user()->load('siswa')->siswa;
        
        $activeItems = DB::transaction(function() use ($siswa) {
            $allActiveSpps = Spp::where('is_aktif', true)
                ->select(['spp_id', 'nama', 'nominal', 'tahun_ajaran'])
                ->get()
                ->keyBy('spp_id');
            
            $allActivePpdbs = Ppdb::where('is_aktif', true)
                ->where(function($query) use ($siswa) {
                    $query->where('kelas', $siswa->kelas)
                        ->orWhereNull('kelas')
                        ->orWhere('kelas', '');
                })
                ->select(['ppdb_id', 'nama', 'nominal', 'tahun_ajaran', 'kelas'])
                ->get()
                ->keyBy('ppdb_id');
                
            $paidItems = DB::table('pembayaran_detail')
                ->join('pembayaran', 'pembayaran_detail.pembayaran_id', '=', 'pembayaran.pembayaran_id')
                ->where('pembayaran_detail.siswa_id', $siswa->siswa_id)
                ->whereIn('pembayaran.status_pembayaran', ['lunas', 'pending'])
                ->select([
                    'pembayaran_detail.spp_id',
                    'pembayaran_detail.ppdb_id'
                ])
                ->get();
            
            $paidSppIds = $paidItems->pluck('spp_id')
                ->filter()
                ->toArray();
                
            $paidPpdbIds = $paidItems->pluck('ppdb_id')
                ->filter()
                ->toArray();
            
            $activeSpps = $allActiveSpps->whereNotIn('spp_id', $paidSppIds)->values();
            $activePpdbs = $allActivePpdbs->whereNotIn('ppdb_id', $paidPpdbIds)->values();
            
            return [
                'activeSpps' => $activeSpps,
                'activePpdbs' => $activePpdbs
            ];
        });
        
        $activeSpps = $activeItems['activeSpps'];
        $activePpdbs = $activeItems['activePpdbs'];
        
        if ($activeSpps->isEmpty() && $activePpdbs->isEmpty()) {
            return redirect()->route('siswa.pembayaran.index')
                ->with('error', 'Tidak ada tagihan aktif saat ini.');
        }
        
        $formattedSpps = $activeSpps->map(function($spp) {
            return [
                'id' => $spp->spp_id,
                'name' => $spp->nama,
                'amount' => "Rp " . number_format($spp->nominal, 0, ',', '.'),
                'rawAmount' => $spp->nominal,
                'tahunAjaran' => $spp->tahun_ajaran,
                'type' => 'spp',
            ];
        })->values()->toArray();
        
        $formattedPpdbs = $activePpdbs->map(function($ppdb) use ($siswa) {
            $kelasInfo = $ppdb->kelas ? " - Kelas {$ppdb->kelas}" : "";
            return [
                'id' => $ppdb->ppdb_id,
                'name' => $ppdb->nama . $kelasInfo,
                'amount' => "Rp " . number_format($ppdb->nominal, 0, ',', '.'),
                'rawAmount' => $ppdb->nominal,
                'tahunAjaran' => $ppdb->tahun_ajaran,
                'type' => 'ppdb',
                'kelas' => $ppdb->kelas,
            ];
        })->values()->toArray();
        
        $allPaymentItems = array_merge($formattedSpps, $formattedPpdbs);
        
        return Inertia::render('Siswa/Pembayaran/Create', [
            'user' => [
                'email' => Auth::user()->email,
                'name' => $siswa->nama ?? Auth::user()->email,
                'role' => Auth::user()->role,
            ],
            'paymentItems' => $allPaymentItems,
        ]);
    }
    
    public function store(Request $request)
    {
        $user = Auth::user()->load('siswa');
        $siswa = $user->siswa;
        
        $validatedData = $request->validate([
            'spp_ids' => 'array',
            'ppdb_ids' => 'array',
            'total_bayar' => 'required|numeric',
            'bukti_bayar' => 'required|image|max:2048',
            'keterangan' => 'nullable|string',
        ]);
        
        return DB::transaction(function() use ($request, $siswa, $validatedData) {
            $sppItems = !empty($validatedData['spp_ids']) ? 
                Spp::whereIn('spp_id', $validatedData['spp_ids'])->select(['spp_id', 'nominal'])->get() :
                collect();
                
            $ppdbItems = !empty($validatedData['ppdb_ids']) ? 
                Ppdb::whereIn('ppdb_id', $validatedData['ppdb_ids'])->select(['ppdb_id', 'nominal'])->get() :
                collect();
            
            $totalTagihan = $sppItems->sum('nominal') + $ppdbItems->sum('nominal');
            
            $path = null;
            if ($request->hasFile('bukti_bayar')) {
                $path = $request->file('bukti_bayar')->store('bukti_pembayaran', 'public');
            }
            
            $pembayaran = Pembayaran::create([
                'siswa_id' => $siswa->siswa_id,
                'total_tagihan' => $totalTagihan,
                'total_bayar' => $validatedData['total_bayar'],
                'status_pembayaran' => 'pending',
                'tahun_ajaran' => date('Y') . '/' . (date('Y') + 1),
                'keterangan' => $validatedData['keterangan'] ?? null,
                'bukti_bayar' => $path,
                'tanggal_bayar' => now(),
            ]);
            
            $detailRecords = [];
            
            foreach ($sppItems as $spp) {
                $detailRecords[] = [
                    'pembayaran_id' => $pembayaran->pembayaran_id,
                    'siswa_id' => $siswa->siswa_id,
                    'spp_id' => $spp->spp_id,
                    'ppdb_id' => null,
                    'biaya' => $spp->nominal,
                    'jumlah_bayar' => $spp->nominal,
                    'status_pembayaran' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            foreach ($ppdbItems as $ppdb) {
                $detailRecords[] = [
                    'pembayaran_id' => $pembayaran->pembayaran_id,
                    'siswa_id' => $siswa->siswa_id,
                    'spp_id' => null,
                    'ppdb_id' => $ppdb->ppdb_id,
                    'biaya' => $ppdb->nominal,
                    'jumlah_bayar' => $ppdb->nominal,
                    'status_pembayaran' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            
            if (!empty($detailRecords)) {
                PembayaranDetail::insert($detailRecords);
            }
            
            return redirect()->route('siswa.pembayaran.index')
                ->with('success', 'Pembayaran berhasil dibuat. Mohon tunggu konfirmasi dari admin.');
        });
    }
    
    public function detail($id)
    {
        $siswa = Auth::user()->load('siswa')->siswa;
        
        $pembayaran = Pembayaran::with(['pembayaranDetail' => function($query) {
                $query->with(['spp:spp_id,nama,nominal,tahun_ajaran', 'ppdb:ppdb_id,nama,nominal,tahun_ajaran']);
            }])
            ->select([
                'pembayaran_id', 'siswa_id', 'total_bayar', 'total_tagihan', 
                'bukti_bayar', 'keterangan', 'status_pembayaran', 'tanggal_bayar', 'tanggal_persetujuan', 'tahun_ajaran'
            ])
            ->where('pembayaran_id', $id)
            ->where('siswa_id', $siswa->siswa_id)
            ->firstOrFail();
        
        $formattedItems = $pembayaran->pembayaranDetail->map(function($detail) {
            $name = null;
            $nominal = 0;
            $tahunAjaran = '';
            
            if ($detail->spp) {
                $name = $detail->spp->nama;
                $nominal = $detail->spp->nominal;
                $tahunAjaran = $detail->spp->tahun_ajaran;
                $type = 'SPP';
            } elseif ($detail->ppdb) {
                $name = $detail->ppdb->nama;
                $nominal = $detail->ppdb->nominal;
                $tahunAjaran = $detail->ppdb->tahun_ajaran;
                $type = 'PPDB';
            } else {
                $name = 'Unknown';
                $type = 'Unknown';
            }
            
            return [
                'id' => $detail->pembayaran_detail_id,
                'name' => $name,
                'type' => $type,
                'amount' => "Rp " . number_format($nominal, 0, ',', '.'),
                'tahunAjaran' => $tahunAjaran,
            ];
        });
        
        $formattedPayment = [
            'id' => $pembayaran->pembayaran_id,
            'tahunAjaran' => $pembayaran->tahun_ajaran,
            'totalTagihan' => "Rp " . number_format($pembayaran->total_tagihan, 0, ',', '.'),
            'totalBayar' => "Rp " . number_format($pembayaran->total_bayar, 0, ',', '.'),
            'buktiUrl' => asset('storage/' . $pembayaran->bukti_bayar),
            'keterangan' => $pembayaran->keterangan,
            'status' => $pembayaran->status_pembayaran,
            'tanggalBayar' => Carbon::parse($pembayaran->tanggal_bayar)->format('d F Y'),
            'approvalDate' => $pembayaran->tanggal_persetujuan ? Carbon::parse($pembayaran->tanggal_persetujuan)->format('d F Y') : null,
            'items' => $formattedItems,
        ];
        
        return Inertia::render('Siswa/Pembayaran/Detail', [
            'payment' => $formattedPayment
        ]);
    }

    public function history()
    {
        return $this->index();
    }

    public function getDetail($id)
    {
        $siswa = Auth::user()->siswa;
        
        $pembayaran = Pembayaran::with(['pembayaranDetail' => function($query) {
                $query->with(['spp' => function($query) {
                    $query->select('spp_id', 'nama', 'nominal');
                }])->with(['ppdb' => function($query) {
                    $query->select('ppdb_id', 'nama', 'nominal');
                }]);
            }])
            ->select([
                'pembayaran_id', 'siswa_id', 'total_bayar', 'total_tagihan', 
                'bukti_bayar', 'keterangan', 'status_pembayaran', 'tanggal_bayar', 'tanggal_persetujuan', 'tahun_ajaran'
            ])
            ->where('pembayaran_id', $id)
            ->where('siswa_id', $siswa->siswa_id)
            ->firstOrFail();
        

        $details = $pembayaran->pembayaranDetail->map(function($detail) {
            $itemName = null;
            $itemType = null;
            
            if ($detail->spp) {
                $itemName = $detail->spp->nama;
                $itemType = 'SPP';
            } elseif ($detail->ppdb) {
                $itemName = $detail->ppdb->nama;
                $itemType = 'PPDB';
            }
            
            return [
                'id' => $detail->pembayaran_detail_id,
                'name' => $itemName,
                'type' => $itemType,
                'amount' => "Rp " . number_format($detail->biaya, 0, ',', '.'),
                'status' => $detail->status_pembayaran
            ];
        });
            
        $formattedPayment = [
            'id' => $pembayaran->pembayaran_id,
            'tahunAjaran' => $pembayaran->tahun_ajaran,
            'totalTagihan' => "Rp " . number_format($pembayaran->total_tagihan, 0, ',', '.'),
            'totalBayar' => "Rp " . number_format($pembayaran->total_bayar, 0, ',', '.'),
            'buktiPembayaran' => $pembayaran->bukti_bayar,
            'keterangan' => $pembayaran->keterangan,
            'status' => $pembayaran->status_pembayaran,
            'tanggalBayar' => Carbon::parse($pembayaran->tanggal_bayar)->format('d F Y'),
            'approvalDate' => $pembayaran->tanggal_persetujuan ? Carbon::parse($pembayaran->tanggal_persetujuan)->format('d F Y') : null,
            'items' => $details
        ];
        
        return Inertia::render('Siswa/Pembayaran/Detail', [
            'user' => [
                'email' => Auth::user()->email,
                'name' => $siswa->nama ?? Auth::user()->email,
                'role' => Auth::user()->role,
            ],
            'payment' => $formattedPayment,
        ]);
    }
}
