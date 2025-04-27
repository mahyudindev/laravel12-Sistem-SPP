<?php

namespace App\Services;

use App\Models\Spp;
use App\Models\Ppdb;
use App\Models\PembayaranDetail;

class SisaTagihanService
{
    /**
     * Hitung sisa tagihan SPP/PPDB untuk seorang siswa
     *
     * @param int $siswa_id
     * @return int
     */
    public static function getSisaTagihanSiswa($siswa_id)
    {
        $totalTagihan = self::getTotalTagihanSiswa($siswa_id);

        // Jumlahkan pembayaran SPP yang sudah lunas (via detail)
        $totalBayarSpp = PembayaranDetail::where('siswa_id', $siswa_id)
            ->where('status_pembayaran', 'lunas')
            ->whereNotNull('spp_id')
            ->sum('jumlah_bayar');
        // Jumlahkan pembayaran PPDB yang sudah lunas (via detail)
        $totalBayarPpdb = PembayaranDetail::where('siswa_id', $siswa_id)
            ->where('status_pembayaran', 'lunas')
            ->whereNotNull('ppdb_id')
            ->sum('jumlah_bayar');
        $totalBayar = $totalBayarSpp + $totalBayarPpdb;

        return max(0, $totalTagihan - $totalBayar);
    }

    /**
     * Hitung total tagihan (SPP + PPDB) untuk seorang siswa
     * @param int $siswa_id
     * @return int
     */
    public static function getTotalTagihanSiswa($siswa_id)
    {
        $totalTagihanSpp = Spp::where('is_aktif', true)->sum('nominal');
        $siswa = \App\Models\Siswa::find($siswa_id);
        $kelas = $siswa ? $siswa->kelas : null;
        $totalTagihanPpdb = Ppdb::where('is_aktif', true)
            ->where(function($q) use ($kelas) {
                $q->whereNull('kelas');
                if ($kelas !== null) {
                    $q->orWhere('kelas', $kelas);
                }
            })
            ->sum('nominal');
        return $totalTagihanSpp + $totalTagihanPpdb;
    }

    /**
     * Hitung total yang sudah dibayar (SPP + PPDB) oleh siswa
     * @param int $siswa_id
     * @return int
     */
    public static function getTotalDibayarSiswa($siswa_id)
    {
        // SPP: semua pembayaran lunas
        $totalBayarSpp = PembayaranDetail::where('siswa_id', $siswa_id)
            ->where('status_pembayaran', 'lunas')
            ->whereNotNull('spp_id')
            ->sum('jumlah_bayar');
        // PPDB: filter sesuai kelas siswa
        $siswa = \App\Models\Siswa::find($siswa_id);
        $kelas = $siswa ? $siswa->kelas : null;
        $ppdbIds = Ppdb::where('is_aktif', true)
            ->where(function($q) use ($kelas) {
                $q->whereNull('kelas');
                if ($kelas !== null) {
                    $q->orWhere('kelas', $kelas);
                }
            })
            ->pluck('ppdb_id');
        $totalBayarPpdb = PembayaranDetail::where('siswa_id', $siswa_id)
            ->where('status_pembayaran', 'lunas')
            ->whereIn('ppdb_id', $ppdbIds)
            ->sum('jumlah_bayar');
        return $totalBayarSpp + $totalBayarPpdb;
    }
}
