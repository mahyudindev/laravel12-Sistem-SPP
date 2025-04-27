<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            \Database\Seeders\UserSeeder::class,
            \Database\Seeders\SppSeeder::class,
            \Database\Seeders\PpdbSeeder::class,
        ]);
    }
}
