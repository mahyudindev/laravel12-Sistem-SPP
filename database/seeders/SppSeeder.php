<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class SppSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tahunAjaran = date('Y') . '/' . (date('Y') + 1); // e.g. 2025/2026
        $now = now();
        $data = [];
        $bulan = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        foreach ($bulan as $nama) {
            $data[] = [
                'nama' => 'SPP - ' . $nama,
                'tahun_ajaran' => $tahunAjaran,
                'nominal' => 105000,
                'is_aktif' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        DB::table('spp')->insert($data);
    }
}
