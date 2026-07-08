<?php

namespace Database\Seeders;

use App\Models\District;
use Illuminate\Database\Seeder;

class KecamatanSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        District::truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $data = [
            ['name' => 'Ampel',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Andong',       'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Banyudono',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Boyolali',     'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cepogo',       'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Gladagsari',   'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Juwangi',      'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Karanggede',   'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kemusu',       'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Klego',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mojosongo',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Musuk',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Ngemplak',     'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nogosari',     'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sambi',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sawit',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Selo',         'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Simo',         'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tamansari',    'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Teras',        'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Wonosamudro',  'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Wonosegoro',   'created_at' => now(), 'updated_at' => now()],
        ];

        District::insert($data);
    }
}