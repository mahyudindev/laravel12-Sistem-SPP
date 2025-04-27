<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Admin;
use App\Models\Siswa;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        \DB::table('siswa')->delete();
        \DB::table('users')->delete();
        // user admin
        $adminUser = User::create([
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'admin',
            'is_aktif' => true,
        ]);
        
        // data admin
        Admin::create([
            'user_id' => $adminUser->user_id,
            'nama' => 'Administrator',
            'no_telp' => '081234567890',
            'alamat' => 'Jl. Admin No. 1',
        ]);
        
        // user kepala sekolah
        $kepsekUser = User::create([
            'email' => 'kepsek@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'kepsek',
            'is_aktif' => true,
        ]);
        
        // data kepala sekolah
        Admin::create([
            'user_id' => $kepsekUser->user_id,
            'nama' => 'Kepala Sekolah',
            'no_telp' => '082345678901',
            'alamat' => 'Jl. Kepsek No. 1',
        ]);
                
        // user siswa
        $siswaUser = User::create([
            'email' => 'siswa@gmail.com',
            'password' => Hash::make('123'),
            'role' => 'siswa',
            'is_aktif' => true,
        ]);
        
        // data siswa
        Siswa::create([
            'user_id' => $siswaUser->user_id,
            'nama' => 'Siswa Teladan',
            'nis' => '1234567890',
            'kelas' => 'A',
            'jenis_kelamin' => 'L',
            'tanggal_lahir' => '2010-01-01',
            'alamat' => 'Jl. Siswa No. 1',
            'no_hp' => '081234567891',
            'tanggal_masuk' => '2022-07-01',
            'is_aktif' => true,
        ]);

        // Helper to ensure unique emails
        $usedEmails = [];
        function makeUniqueEmail($base, &$usedEmails) {
            $email = $base;
            $i = 1;
            while (in_array($email, $usedEmails)) {
                $email = $base . $i;
                $i++;
            }
            $usedEmails[] = $email;
            return $email;
        }

        // siswa kelas TK A dari daftar nama 
        $tkAStudents = [
            ['nama' => 'Shaqueena Hanindyira P.', 'jenis_kelamin' => 'P'],
            ['nama' => 'Alfaro Abdullah Budiman', 'jenis_kelamin' => 'L'],
            ['nama' => 'Almayra Joza Shanum', 'jenis_kelamin' => 'P'],
            ['nama' => 'Alunada Mahreen', 'jenis_kelamin' => 'P'],
            ['nama' => 'Eara Felisa', 'jenis_kelamin' => 'P'],
            ['nama' => 'Hamzah Zaidan Ahsan', 'jenis_kelamin' => 'L'],
            ['nama' => 'Jabir Ibnu Hayyan', 'jenis_kelamin' => 'L'],
            ['nama' => 'Muhammad Al Fatih', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Ali Akbar Dermawan', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Arga Ghurafa', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Izz Raziq', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Yafiq Uzair', 'jenis_kelamin' => 'L'],
            ['nama' => 'Rizqian Aditya', 'jenis_kelamin' => 'L'],
            ['nama' => 'Syadad Aliy Aisy', 'jenis_kelamin' => 'L'],
            ['nama' => 'Titian Ahmad Attaki', 'jenis_kelamin' => 'L'],
            ['nama' => 'Zeva Izz', 'jenis_kelamin' => 'L'],
        ];
        foreach ($tkAStudents as $i => $student) {
            $namaArr = explode(' ', $student['nama']);
            $first = strtolower(preg_replace('/[^a-zA-Z]/', '', $namaArr[0]));
            if (strtolower($first) === 'm' || strtolower($first) === 'm.') {
                $second = isset($namaArr[1]) ? strtolower(preg_replace('/[^a-zA-Z]/', '', $namaArr[1])) : '';
                $baseEmail = 'm.' . $second;
            } else {
                $baseEmail = $first;
            }
            $emailName = makeUniqueEmail($baseEmail, $usedEmails);
            $user = User::create([
                'email' => $emailName.'@gmail.com',
                'password' => Hash::make('123'),
                'role' => 'siswa',
                'is_aktif' => true,
            ]);
            Siswa::create([
                'user_id' => $user->user_id,
                'nama' => $student['nama'],
                'nis' => 'TKAA'.str_pad($i+1, 3, '0', STR_PAD_LEFT),
                'kelas' => 'TK A',
                'jenis_kelamin' => $student['jenis_kelamin'],
                'tanggal_lahir' => '2018-01-01',
                'alamat' => 'Alamat TK A',
                'no_hp' => '0812345678'.str_pad($i+1, 3, '0', STR_PAD_LEFT),
                'tanggal_masuk' => '2024-07-01',
                'is_aktif' => true,
            ]);
        }

        // siswa kelas TK B 
        $tkBStudents = [
            // Foto 1
            ['nama' => 'Abdullah Al Fauzan', 'jenis_kelamin' => 'L'],
            ['nama' => 'Abdurrahman Hasnim', 'jenis_kelamin' => 'L'],
            ['nama' => 'Abyan Al Habsyi Setiawan', 'jenis_kelamin' => 'L'],
            ['nama' => 'Afra Septiani Saputra', 'jenis_kelamin' => 'P'],
            ['nama' => 'Aiza Nafisha Selyn', 'jenis_kelamin' => 'P'],
            ['nama' => 'Albawin Zayn Sulaiman', 'jenis_kelamin' => 'L'],
            ['nama' => 'Arka Maulana Darmata', 'jenis_kelamin' => 'L'],
            ['nama' => 'Ashabul Kahfi Ashary', 'jenis_kelamin' => 'L'],
            ['nama' => 'Aulian Bashirah Setiana', 'jenis_kelamin' => 'P'],
            ['nama' => 'Azkiya Alfathunisa', 'jenis_kelamin' => 'P'],
            ['nama' => 'Den Sakha Al-Hafunisa', 'jenis_kelamin' => 'L'],
            ['nama' => 'Fadhil Arkhan Mahardika', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Althaf Ghifari', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Azwar Haidar', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Rizky Al-khalifi', 'jenis_kelamin' => 'L'],
            ['nama' => 'Naufal Hadi', 'jenis_kelamin' => 'L'],
            ['nama' => 'Naura Rahmi Syahidah', 'jenis_kelamin' => 'P'],
            ['nama' => 'Shafiya Azrina Sofyan', 'jenis_kelamin' => 'P'],
            ['nama' => 'Nur Aina Annasya', 'jenis_kelamin' => 'P'],
            ['nama' => 'Mikhayla Azzahra', 'jenis_kelamin' => 'P'],
            // Foto 2
            ['nama' => 'Arsakha Ilham Muzaki', 'jenis_kelamin' => 'L'],
            ['nama' => 'Ghania Arsya Qonita', 'jenis_kelamin' => 'P'],
            ['nama' => 'Ghayda Mikaeel Al Maulana', 'jenis_kelamin' => 'L'],
            ['nama' => 'Hana Lailatul Kamilah', 'jenis_kelamin' => 'P'],
            ['nama' => 'Mahira Husna Mariki', 'jenis_kelamin' => 'P'],
            ['nama' => 'Mesa Zoya Saputri', 'jenis_kelamin' => 'P'],
            ['nama' => 'Muhammad Kamil Arrasyid', 'jenis_kelamin' => 'L'],
            ['nama' => 'M. Shakeil Rafisqy', 'jenis_kelamin' => 'L'],
            ['nama' => 'Putri Aulia Rahma', 'jenis_kelamin' => 'P'],
            ['nama' => 'Rizki Fajar Dhiaurrahman', 'jenis_kelamin' => 'L'],
            ['nama' => 'Sabiru Saga', 'jenis_kelamin' => 'L'],
            ['nama' => 'Zeeyan Ulwan Shiddiq', 'jenis_kelamin' => 'L'],
        ];
        foreach ($tkBStudents as $i => $student) {
            $namaArr = explode(' ', $student['nama']);
            $first = strtolower(preg_replace('/[^a-zA-Z]/', '', $namaArr[0]));
            if (strtolower($first) === 'm' || strtolower($first) === 'm.') {
                $second = isset($namaArr[1]) ? strtolower(preg_replace('/[^a-zA-Z]/', '', $namaArr[1])) : '';
                $baseEmail = 'm.' . $second;
            } else {
                $baseEmail = $first;
            }
            $emailName = makeUniqueEmail($baseEmail, $usedEmails);
            $user = User::create([
                'email' => $emailName.'@gmail.com',
                'password' => Hash::make('123'),
                'role' => 'siswa',
                'is_aktif' => true,
            ]);
            Siswa::create([
                'user_id' => $user->user_id,
                'nama' => $student['nama'],
                'nis' => 'TKBB'.str_pad($i+1, 3, '0', STR_PAD_LEFT),
                'kelas' => 'TK B',
                'jenis_kelamin' => $student['jenis_kelamin'],
                'tanggal_lahir' => '2018-01-01',
                'alamat' => 'Alamat TK B',
                'no_hp' => '0812345679'.str_pad($i+1, 3, '0', STR_PAD_LEFT),
                'tanggal_masuk' => '2024-07-01',
                'is_aktif' => true,
            ]);
        }

        // Siswa::factory()
        //     ->count(50)
        //     ->create(['kelas' => 'TK A']);

        // Siswa::factory()
        //     ->count(50)
        //     ->create(['kelas' => 'TK B']);
    }
}
