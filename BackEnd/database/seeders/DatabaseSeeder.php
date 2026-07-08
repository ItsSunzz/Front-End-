<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            JenisUserSeeder::class,
            KecamatanSeeder::class,
            DesaSeeder::class,
            PondokSeeder::class,
            programSeeder::class,
            UserSeeder::class,
        ]);
    }
}
