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
        Schema::create('pondok', function (Blueprint $table) {
            $table->id('pondok_id');
            $table->unsignedBigInteger('kecamatan_id');
            $table->unsignedBigInteger('desa_id');
            $table->string('nama_pondok');
            $table->string('alamat_pondok')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pondok');
    }
};
