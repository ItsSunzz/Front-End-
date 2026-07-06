<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('program', function (Blueprint $table) {
            // Tambahkan kolom status setelah kolom 'tahun' (opsional)
            $table->enum('status', ['active', 'inactive'])->default('active')->after('tahun');
        });
    }

    public function down(): void
    {
        Schema::table('program', function (Blueprint $table) {
            // Hapus kolom status jika rollback
            $table->dropColumn('status');
        });
    }
};