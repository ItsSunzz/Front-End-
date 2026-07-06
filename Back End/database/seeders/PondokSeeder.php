<?php

namespace Database\Seeders;

use App\Models\Pondok;
use Illuminate\Database\Seeder;

class PondokSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan kecamatan_id=1 dan desa_id=1 sudah ada
        Pondok::create([
            'kecamatan_id' => 1,
            'desa_id' => 1,
            'nama_pondok' => 'Pondok Pesantren Al-Hidayah',
            'alamat_pondok' => 'Jl. Joko Tingkir No. 12, Desa Pajang'
        ]);

        Pondok::create([
            'kecamatan_id' => 1,
            'desa_id' => 1,
            'nama_pondok' => 'Pondok Pesantren Darussalam',
            'alamat_pondok' => 'Jl. Slamet Riyadi No. 45, Desa Gayan'
        ]);
    }
}