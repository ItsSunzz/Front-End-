<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JenisUser;

class JenisUserSeeder extends Seeder
{

    public function run(): void
    {
        JenisUser::create(['nama_jenis_user' => 'Guru Mengaji']);
        JenisUser::create(['nama_jenis_user' => 'Pimpinan Pondok']);
    }
}
