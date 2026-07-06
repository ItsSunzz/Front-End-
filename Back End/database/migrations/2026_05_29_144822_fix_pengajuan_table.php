<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan', function (Blueprint $table) {

            // Hapus jenis_pengajuan_id
            if (Schema::hasColumn('pengajuan', 'jenis_pengajuan_id')) {
                $table->dropColumn('jenis_pengajuan_id');
            }

            // Sesuaikan enum status
            $table->enum('status_pengajuan', ['pending', 'disetujui', 'ditolak'])
                  ->default('pending')
                  ->change();

            // Tambah kolom tanggal_validasi (terpisah dari tanggal_pengajuan)
            if (!Schema::hasColumn('pengajuan', 'tanggal_validasi')) {
                $table->timestamp('tanggal_validasi')->nullable()->after('tanggal_pengajuan');
            }

            // Tambah semua foreign key constraint
            $table->foreign('operator_id')->references('admin_id')->on('admin')->onDelete('set null');
            $table->foreign('admin_id')->references('admin_id')->on('admin')->onDelete('set null');
            $table->foreign('user_id')->references('user_id')->on('data_user')->onDelete('cascade');
            $table->foreign('program_id')->references('program_id')->on('program')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan', function (Blueprint $table) {
            $table->dropForeign(['operator_id']);
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['user_id']);
            $table->dropForeign(['program_id']);
            $table->dropColumn('tanggal_validasi');
            $table->unsignedBigInteger('jenis_pengajuan_id')->nullable()->after('admin_id');
            $table->enum('status_pengajuan', ['menunggu', 'diproses', 'disetujui', 'ditolak'])
                  ->default('menunggu')->change();
        });
    }
};