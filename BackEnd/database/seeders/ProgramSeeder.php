<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        DB::table('program')->truncate();
        \Illuminate\Support\Facades\Schema::enableForeignKeyConstraints();

        $now = now();

        $data = [
            // ── Tahun 2025 ───────────────────────────────────────────────
            [
                
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2025,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2025,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2025,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
               
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2025,
                'status'             => 'inactive',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
               
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2025,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],

            // ── Tahun 2026 ───────────────────────────────────────────────
            [
               
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2026,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
               
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2026,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
               
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2026,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
               
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2026,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
            [
                
                'nama_program'       => 'Program Kesejahteraan',
                'tahun'              => 2026,
                'status'             => 'active',
                'created_at'         => $now,
                'updated_at'         => $now,
            ],
        ];

        Program::insert($data);
    }
}