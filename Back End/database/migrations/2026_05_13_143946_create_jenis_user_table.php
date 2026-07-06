<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_xx_xx_create_jenis_user_table.php
    public function up(): void
    {
        Schema::create('jenis_user', function (Blueprint $table) {
            $table->id('jenis_user_id');

            // Ubah menjadi seperti ini (buang batas angka di dalamnya jika ada)
            $table->string('nama_jenis_user');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jenis_user');
    }
};
