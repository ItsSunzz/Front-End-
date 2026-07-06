<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('data_user', function (Blueprint $table) {
            $table->id('user_id');
            $table->foreignId('pondok_id')->nullable()->constrained('pondok', 'pondok_id')->onDelete('set null');
            $table->foreignId('jenis_user_id')->nullable()->constrained('jenis_user', 'jenis_user_id')->onDelete('set null');
            $table->foreignId('kecamatan_id')->nullable()->constrained('kecamatan', 'kecamatan_id')->onDelete('set null');
            $table->foreignId('desa_id')->nullable()->constrained('desa', 'desa_id')->onDelete('set null');
            $table->string('nama_lengkap');
            $table->string('nik', 16)->unique();
            $table->string('no_kk', 16)->nullable();
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir')->nullable();
            $table->string('jenis_kelamin')->nullable();
            $table->string('rt', 10)->nullable();
            $table->string('rw', 10)->nullable();
            $table->string('dusun')->nullable();
            $table->string('alamat')->nullable();
            $table->string('bank')->nullable();
            $table->string('nomor_rekening');
            $table->string('nama_pemilik_rekening')->nullable();
            $table->string('masa_jabatan_mulai')->nullable();
            $table->string('masa_jabatan_selesai')->nullable();
            $table->string('foto_ktp')->nullable(); // Menyimpan path file gambar/pdf
            $table->string('foto_kk')->nullable();  // Menyimpan path file gambar/pdf
            $table->string('surat_putusan')->nullable();
            $table->string('surat_keterangan_pimpinan_pondok')->nullable();
            $table->string('surat_keterangan_guru_mengaji')->nullable();
            $table->string('surat_keterangan_kecamatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_user');
    }
};
