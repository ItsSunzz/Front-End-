<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\District;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Super Admin Kabupaten Boyolali
        User::updateOrCreate(
            ['email' => 'setda@boyolali.go.id'],
            [
                'nama'         => 'Setda Kabupaten Boyolali',
                'password'     => Hash::make('1234567890'),
                'role'         => 'super_admin',
                'district_id'  => null,
                'status'       => 'aktif',
            ]
        );

        // 2. Admin tiap Kecamatan
        $kecamatanList = [
            'Ampel', 'Andong', 'Banyudono', 'Boyolali', 'Cepogo',
            'Gladagsari', 'Juwangi', 'Karanggede', 'Kemusu', 'Klego',
            'Mojosongo', 'Musuk', 'Ngemplak', 'Nogosari', 'Sambi',
            'Sawit', 'Selo', 'Simo', 'Tamansari', 'Teras',
            'Wonosamudro', 'Wonosegoro',
        ];

        foreach ($kecamatanList as $nama) {
            $district = District::where('name', $nama)->first();
            $emailPrefix = strtolower(str_replace(' ', '', $nama));

            User::updateOrCreate(
                ['email' => "{$emailPrefix}@boyolali.go.id"],
                [
                    'nama'         => "Admin Kecamatan {$nama}",
                    'password'     => Hash::make('123456'),
                    'role'         => 'kecamatan',
                    'district_id'  => $district ? $district->id : null,
                    'status'       => 'aktif',
                ]
            );
        }
    }
}
