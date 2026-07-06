<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program', function (Blueprint $table) {
            $table->dropForeign(['jenis_pengajuan_id']); // ← harus duluan
            $table->dropColumn('jenis_pengajuan_id');
        });
    }

    public function down(): void
    {
        Schema::table('program', function (Blueprint $table) {
            $table->unsignedBigInteger('jenis_pengajuan_id')->after('program_id');
            $table->foreign('jenis_pengajuan_id')
                  ->references('jenis_pengajuan_id')
                  ->on('jenis_pengajuan');
        });
    }
};