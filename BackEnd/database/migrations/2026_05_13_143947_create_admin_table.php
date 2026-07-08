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
        Schema::create('admin', function (Blueprint $table) {
            $table->id('admin_id');
            $table->unsignedBigInteger('kecamatan_id')->nullable();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role')->default('Admin Kecamatan');
            $table->string('status')->default('Aktif');
            $table->string('terakhir_login')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin');
    }
};
