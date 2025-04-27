<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Pembayaran;
use App\Models\Siswa;
use App\Models\PembayaranDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Helpers\FonnteWhatsApp;
use App\Services\SisaTagihanService;

class PembayaranController extends Controller
{
    public function index()
    {
        $pembayaran = Pembayaran::with(['siswa', 'pembayaranDetail.spp', 'pembayaranDetail.ppdb'])
            ->orderBy('created_at', 'desc')
            ->get();
        
        $totalPembayaranLunas = Pembayaran::where('status_pembayaran', 'lunas')->sum('total_bayar');
        
        $totalPembayaranPending = Pembayaran::where('status_pembayaran', 'pending')->sum('total_bayar');
        
        $dataPembayaran = $pembayaran->map(function ($item) {
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
                'photoUrl' => $item->bukti_bayar ? asset('storage/' . $item->bukti_bayar) : null,
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
        
        return Inertia::render('Admin/Pembayaran/Index', [
            'pembayaran' => $dataPembayaran,
            'totalPembayaranLunas' => 'Rp. ' . number_format($totalPembayaranLunas, 0, ',', '.'),
            'totalPembayaranPending' => 'Rp. ' . number_format($totalPembayaranPending, 0, ',', '.'),
        ]);
    }
    
    public function approve(Request $request, $id)
    {
        try {
            DB::beginTransaction();
            
            $pembayaran = Pembayaran::findOrFail($id);

            $pembayaran->status_pembayaran = 'lunas';
            $pembayaran->keterangan = null; 
            $pembayaran->tanggal_persetujuan = now(); 
            $saved = $pembayaran->save();
            
            if (!$saved) {
                throw new \Exception('Gagal menyimpan pembayaran utama');
            }

            $updated = PembayaranDetail::where('pembayaran_id', $id)->update([
                'status_pembayaran' => 'lunas'
            ]);
            
            if ($updated === false) {
                throw new \Exception('Gagal update detail pembayaran');
            }
            
            DB::commit();

            // Kirim WhatsApp ke siswa
            $siswa = $pembayaran->siswa;
            if ($siswa && $siswa->no_hp) {
                $nomor = preg_replace('/[^0-9]/', '', $siswa->no_hp);
                if (strpos($nomor, '0') === 0) {
                    $nomor = '62' . substr($nomor, 1);
                }
                // Ambil detail pembayaran terbaru
                $detail = PembayaranDetail::where('pembayaran_id', $pembayaran->pembayaran_id)
                    ->orderByDesc('pembayaran_detail_id')
                    ->first();
                $jenis = $detail && $detail->spp ? 'SPP' : ($detail && $detail->ppdb ? 'PPDB' : 'Lainnya');
                $nama = $detail && $detail->spp ? $detail->spp->nama : ($detail && $detail->ppdb ? $detail->ppdb->nama : '-');
                $nominal = $detail ? $detail->jumlah_bayar : 0;

                $totalTagihan = SisaTagihanService::getTotalTagihanSiswa($siswa->siswa_id);
                $totalDibayar = SisaTagihanService::getTotalDibayarSiswa($siswa->siswa_id);
                $sisaTagihan = SisaTagihanService::getSisaTagihanSiswa($siswa->siswa_id);
                $pesan = "Pembayaran {$jenis} \"{$nama}\" sebesar Rp. " . number_format($nominal, 0, ',', '.') .
                    " telah DISETUJUI.\nTotal tagihan Anda sebesar Rp. " . number_format($totalTagihan, 0, ',', '.') .
                    ".\nTotal yang sudah dibayar: Rp. " . number_format($totalDibayar, 0, ',', '.') .
                    ".\nSisa tagihan Anda: Rp. " . number_format($sisaTagihan, 0, ',', '.') . ".";
                FonnteWhatsApp::send($nomor, $pesan);
            }

            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Pembayaran berhasil disetujui']);
            }
            
            return redirect()->back()->with('message', 'Pembayaran berhasil disetujui');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error in approve method: ' . $e->getMessage());
            
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
            }
            
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
    
    public function reject(Request $request, $id)
    {

        $request->validate([
            'alasan_ditolak' => 'required|string|max:255',
        ]);
        
        try {
            DB::beginTransaction();
            
            $pembayaran = Pembayaran::findOrFail($id);

            $pembayaran->status_pembayaran = 'ditolak';
            $pembayaran->keterangan = $request->alasan_ditolak; 
            $pembayaran->tanggal_persetujuan = now(); 
            $saved = $pembayaran->save();
            
            if (!$saved) {
                throw new \Exception('Gagal menyimpan pembayaran utama');
            }

            $updated = PembayaranDetail::where('pembayaran_id', $id)->update([
                'status_pembayaran' => 'ditolak'
            ]);
            
            if ($updated === false) {
                throw new \Exception('Gagal update detail pembayaran');
            }
            
            DB::commit();

            // Kirim WhatsApp ke siswa
            $siswa = $pembayaran->siswa;
            if ($siswa && $siswa->no_hp) {
                $nomor = preg_replace('/[^0-9]/', '', $siswa->no_hp);
                if (strpos($nomor, '0') === 0) {
                    $nomor = '62' . substr($nomor, 1);
                }
                // Ambil detail pembayaran terbaru
                $detail = PembayaranDetail::where('pembayaran_id', $pembayaran->pembayaran_id)
                    ->orderByDesc('pembayaran_detail_id')
                    ->first();
                $jenis = $detail && $detail->spp ? 'SPP' : ($detail && $detail->ppdb ? 'PPDB' : 'Lainnya');
                $nama = $detail && $detail->spp ? $detail->spp->nama : ($detail && $detail->ppdb ? $detail->ppdb->nama : '-');
                $nominal = $detail ? $detail->jumlah_bayar : 0;

                $totalTagihan = SisaTagihanService::getTotalTagihanSiswa($siswa->siswa_id);
                $totalDibayar = SisaTagihanService::getTotalDibayarSiswa($siswa->siswa_id);
                $sisaTagihan = SisaTagihanService::getSisaTagihanSiswa($siswa->siswa_id);
                $pesan = "Pembayaran {$jenis} \"{$nama}\" sebesar Rp. " . number_format($nominal, 0, ',', '.') .
                    " DITOLAK.\nAlasan: {$pembayaran->keterangan}.\nTotal tagihan Anda sebesar Rp. " . number_format($totalTagihan, 0, ',', '.') .
                    ".\nTotal yang sudah dibayar: Rp. " . number_format($totalDibayar, 0, ',', '.') .
                    ".\nSisa tagihan Anda: Rp. " . number_format($sisaTagihan, 0, ',', '.') . ".";
                FonnteWhatsApp::send($nomor, $pesan);
            }

            if ($request->wantsJson()) {
                return response()->json(['success' => true, 'message' => 'Pembayaran berhasil ditolak']);
            }
            
            return redirect()->back()->with('message', 'Pembayaran berhasil ditolak');
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error in reject method: ' . $e->getMessage());
            
            if ($request->wantsJson()) {
                return response()->json(['success' => false, 'message' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
            }
            
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
    
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status_pembayaran' => 'required|in:pending,lunas,ditolak,belum_bayar',
            'alasan_ditolak' => 'nullable|string|required_if:status_pembayaran,ditolak'
        ]);

        try {
            DB::beginTransaction();
            
            $pembayaran = Pembayaran::findOrFail($id);
            $pembayaran->status_pembayaran = $request->status_pembayaran;
            
            if ($request->status_pembayaran === 'lunas') {
                $pembayaran->keterangan = null; 
                $pembayaran->tanggal_persetujuan = now(); 
            } 
            else if ($request->status_pembayaran === 'ditolak') {
                if (!$request->filled('alasan_ditolak')) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Alasan penolakan harus diisi'
                    ], 422);
                }
                $pembayaran->keterangan = $request->alasan_ditolak; 
                $pembayaran->tanggal_persetujuan = now(); 
            }
            
            $saved = $pembayaran->save();
            if (!$saved) {
                throw new \Exception('Gagal menyimpan pembayaran utama');
            }
            
            $updateData = [
                'status_pembayaran' => $request->status_pembayaran
            ];
            
            $updated = PembayaranDetail::where('pembayaran_id', $id)->update($updateData);
            
            if ($updated === false) {
                throw new \Exception('Gagal update detail pembayaran');
            }
            
            DB::commit();

            // Kirim WhatsApp ke siswa jika status lunas/ditolak
            if (in_array($request->status_pembayaran, ['lunas', 'ditolak'])) {
                $siswa = $pembayaran->siswa;
                if ($siswa && $siswa->no_hp) {
                    $nomor = preg_replace('/[^0-9]/', '', $siswa->no_hp);
                    if (strpos($nomor, '0') === 0) {
                        $nomor = '62' . substr($nomor, 1);
                    }
                    // Ambil detail pembayaran terbaru
                    $detail = PembayaranDetail::where('pembayaran_id', $pembayaran->pembayaran_id)
                        ->orderByDesc('pembayaran_detail_id')
                        ->first();
                    $jenis = $detail && $detail->spp ? 'SPP' : ($detail && $detail->ppdb ? 'PPDB' : 'Lainnya');
                    $nama = $detail && $detail->spp ? $detail->spp->nama : ($detail && $detail->ppdb ? $detail->ppdb->nama : '-');
                    $nominal = $detail ? $detail->jumlah_bayar : 0;

                    $totalTagihan = SisaTagihanService::getTotalTagihanSiswa($siswa->siswa_id);
                    $totalDibayar = SisaTagihanService::getTotalDibayarSiswa($siswa->siswa_id);
                    $sisaTagihan = SisaTagihanService::getSisaTagihanSiswa($siswa->siswa_id);
                    if ($request->status_pembayaran === 'lunas') {
                        $pesan = "Pembayaran {$jenis} \"{$nama}\" sebesar Rp. " . number_format($nominal, 0, ',', '.') .
                            " telah DISETUJUI.\nTotal tagihan Anda sebesar Rp. " . number_format($totalTagihan, 0, ',', '.') .
                            ".\nTotal yang sudah dibayar: Rp. " . number_format($totalDibayar, 0, ',', '.') .
                            ".\nSisa tagihan Anda: Rp. " . number_format($sisaTagihan, 0, ',', '.') . ".";
                    } else {
                        $pesan = "Pembayaran {$jenis} \"{$nama}\" sebesar Rp. " . number_format($nominal, 0, ',', '.') .
                            " DITOLAK.\nAlasan: {$pembayaran->keterangan}.\nTotal tagihan Anda sebesar Rp. " . number_format($totalTagihan, 0, ',', '.') .
                            ".\nTotal yang sudah dibayar: Rp. " . number_format($totalDibayar, 0, ',', '.') .
                            ".\nSisa tagihan Anda: Rp. " . number_format($sisaTagihan, 0, ',', '.') . ".";
                    }
                    FonnteWhatsApp::send($nomor, $pesan);
                }
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => $request->status_pembayaran === 'lunas' ? 
                        'Pembayaran berhasil disetujui' : 
                        ($request->status_pembayaran === 'ditolak' ? 'Pembayaran berhasil ditolak' : 'Status pembayaran berhasil diperbarui')
                ]);
            }
            
            return redirect()->back()->with('message', $request->status_pembayaran === 'lunas' ? 
                'Pembayaran berhasil disetujui' : 
                ($request->status_pembayaran === 'ditolak' ? 'Pembayaran berhasil ditolak' : 'Status pembayaran berhasil diperbarui'));
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error in updateStatus method: ' . $e->getMessage());
            
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Terjadi kesalahan: ' . $e->getMessage()
                ], 500);
            }
            
            return redirect()->back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
