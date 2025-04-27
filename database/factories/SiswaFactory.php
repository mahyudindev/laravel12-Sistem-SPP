<?php

namespace Database\Factories;

use App\Models\Siswa;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class SiswaFactory extends Factory
{
    protected $model = Siswa::class;

    public function definition()
    {
        return [
            'user_id' => User::factory()->state([
                // Email max 20 karakter
                'email' => $this->faker->unique()->bothify('s####@a.id'),
                'password' => bcrypt('123'),
                'role' => 'siswa',
                'is_aktif' => true,
            ]),
            // Nama khas Indonesia
            'nama' => function() {
                $depan = ['Budi', 'Siti', 'Agus', 'Dewi', 'Rizki', 'Putri', 'Andi', 'Sri', 'Joko', 'Ani', 'Eka', 'Dian', 'Rina', 'Bayu', 'Lia', 'Rina', 'Fajar', 'Wulan', 'Hendra', 'Yuni'];
                $belakang = ['Santoso', 'Wati', 'Saputra', 'Saputri', 'Pratama', 'Utami', 'Wijaya', 'Permata', 'Rahmawati', 'Setiawan', 'Nugroho', 'Purnama', 'Hidayat', 'Susanti', 'Kurniawan', 'Mulyani', 'Susilo', 'Anggraini', 'Ramadhan', 'Putra'];
                $nama = $depan[array_rand($depan)] . ' ' . $belakang[array_rand($belakang)];
                return substr($nama, 0, 25);
            },
            'nis' => $this->faker->unique()->numerify('##########'),
            'kelas' => null, // diisi manual di seeder
            'jenis_kelamin' => $this->faker->randomElement(['L', 'P']),
            'tanggal_lahir' => $this->faker->date('Y-m-d', '-12 years'),
            'alamat' => $this->faker->address(),
            'no_hp' => $this->faker->numerify('08##########'),
            'tanggal_masuk' => $this->faker->date('Y-m-d', '-6 years'),
            'is_aktif' => true,
        ];
    }
}
