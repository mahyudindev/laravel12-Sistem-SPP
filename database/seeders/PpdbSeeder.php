<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PpdbSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tahunAjaran = date('Y') . '/' . (date('Y') + 1); // e.g. 2025/2026
        $now = now();
        $data = [
            [
                'nama' => 'PPDB - Pendaftaran',
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 110000,
                'kelas' => null,
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'PPDB - KBM 1 Tahun',
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 980000,
                'kelas' => null,
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'PPDB - Seragam 4 Stel & Tas',
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 986000,
                'kelas' => null,
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'PPDB - Kesiswaan',
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 1022000,
                'kelas' => null,
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'PPDB - Bangunan Kelas A',
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 968000,
                'kelas' => 'TK A',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'nama' => 'PPDB - Bangunan Kelas B',
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 847000,
                'kelas' => 'TK B',
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];
        DB::table('ppdb')->insert($data);
    }
}
