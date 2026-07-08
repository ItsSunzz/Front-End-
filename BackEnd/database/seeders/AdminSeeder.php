<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Kecamatan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin Kabupaten Boyolali
        Admin::updateOrCreate(
            ['email' => 'setda@boyolali.go.id'],
            [
                'nama'         => 'Setda Kabupaten Boyolali',
                'password'     => Hash::make('1234567890'),
                'role'         => 'Super Admin',
                'kecamatan_id' => null,
                'status'       => 'Aktif',
            ]
        );

        // 2. Admin tiap Kecamatan — email = {nama kecamatan lowercase}@boyolali.go.id
        $kecamatanList = [
            'Ampel', 'Andong', 'Banyudono', 'Boyolali', 'Cepogo',
            'Gladagsari', 'Juwangi', 'Karanggede', 'Kemusu', 'Klego',
            'Mojosongo', 'Musuk', 'Ngemplak', 'Nogosari', 'Sambi',
            'Sawit', 'Selo', 'Simo', 'Tamansari', 'Teras',
            'Wonosamudro', 'Wonosegoro',
        ];

        foreach ($kecamatanList as $nama) {
            $kecamatan = Kecamatan::where('nama_kecamatan', $nama)->first();
            $emailPrefix = strtolower(str_replace(' ', '', $nama));

            Admin::updateOrCreate(
                ['email' => "{$emailPrefix}@boyolali.go.id"],
                [
                    'nama'         => "Admin Kecamatan {$nama}",
                    'password'     => Hash::make('123456'),
                    'role'         => 'Admin Kecamatan',
                    'kecamatan_id' => $kecamatan ? $kecamatan->kecamatan_id : null,
                    'status'       => 'Aktif',
                ]
            );
        }
    }
}
