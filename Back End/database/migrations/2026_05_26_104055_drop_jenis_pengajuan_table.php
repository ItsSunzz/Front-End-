<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cek dan drop FK di tabel pengajuan jika masih ada
        if (Schema::hasColumn('pengajuan', 'jenis_pengajuan_id')) {
            Schema::table('pengajuan', function (Blueprint $table) {
                $table->dropForeign(['jenis_pengajuan_id']);
                $table->dropColumn('jenis_pengajuan_id');
            });
        }

        Schema::dropIfExists('jenis_pengajuan');
    }

    public function down(): void
    {
        Schema::create('jenis_pengajuan', function (Blueprint $table) {
            $table->id('jenis_pengajuan_id');
            $table->string('nama_pengajuan');
            $table->timestamps();
        });
    }
};