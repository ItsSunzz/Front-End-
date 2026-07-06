<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Drop foreign keys
        Schema::table('desa', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
        });
        Schema::table('pondok', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
        });
        Schema::table('data_user', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
        });
        Schema::table('pengajuan', function (Blueprint $table) {
            $table->dropForeign(['operator_id']);
            $table->dropForeign(['admin_id']);
        });

        // 2. Rename kecamatan -> districts
        Schema::rename('kecamatan', 'districts');
        Schema::table('districts', function (Blueprint $table) {
            $table->renameColumn('kecamatan_id', 'id');
            $table->renameColumn('nama_kecamatan', 'name');
        });

        // 3. Rename admin -> users
        Schema::rename('admin', 'users');
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('admin_id', 'id');
            $table->renameColumn('kecamatan_id', 'district_id');
        });

        // 4. Update data in users table (map to requested role and status enums)
        DB::table('users')->where('role', 'Super Admin')->update(['role' => 'super_admin']);
        DB::table('users')->where('role', 'Admin Kecamatan')->update(['role' => 'kecamatan']);
        
        DB::table('users')->where('status', 'Aktif')->update(['status' => 'aktif']);
        DB::table('users')->where('status', 'Nonaktif')->update(['status' => 'nonaktif']);

        // 5. Change columns role and status in users to enums
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['super_admin', 'kecamatan'])->change();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif')->change();
        });

        // 6. Re-add foreign key constraints
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('district_id')->references('id')->on('districts')->onDelete('set null');
        });
        Schema::table('desa', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('id')->on('districts')->onDelete('set null');
        });
        Schema::table('pondok', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('id')->on('districts')->onDelete('set null');
        });
        Schema::table('data_user', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('id')->on('districts')->onDelete('set null');
        });
        Schema::table('pengajuan', function (Blueprint $table) {
            $table->foreign('operator_id')->references('id')->on('users')->onDelete('set null');
            $table->foreign('admin_id')->references('id')->on('users')->onDelete('set null');
        });

        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // 1. Drop foreign keys
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['district_id']);
        });
        Schema::table('desa', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
        });
        Schema::table('pondok', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
        });
        Schema::table('data_user', function (Blueprint $table) {
            $table->dropForeign(['kecamatan_id']);
        });
        Schema::table('pengajuan', function (Blueprint $table) {
            $table->dropForeign(['operator_id']);
            $table->dropForeign(['admin_id']);
        });

        // 2. Change columns role and status in users back to string
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->change();
            $table->string('status')->default('Aktif')->change();
        });

        // 3. Revert data in users table
        DB::table('users')->where('role', 'super_admin')->update(['role' => 'Super Admin']);
        DB::table('users')->where('role', 'kecamatan')->update(['role' => 'Admin Kecamatan']);
        
        DB::table('users')->where('status', 'aktif')->update(['status' => 'Aktif']);
        DB::table('users')->where('status', 'nonaktif')->update(['status' => 'Nonaktif']);

        // 4. Rename users -> admin
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('id', 'admin_id');
            $table->renameColumn('district_id', 'kecamatan_id');
        });
        Schema::rename('users', 'admin');

        // 5. Rename districts -> kecamatan
        Schema::table('districts', function (Blueprint $table) {
            $table->renameColumn('id', 'kecamatan_id');
            $table->renameColumn('name', 'nama_kecamatan');
        });
        Schema::rename('districts', 'kecamatan');

        // 6. Re-add foreign keys
        Schema::table('desa', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('kecamatan_id')->on('kecamatan')->onDelete('cascade');
        });
        Schema::table('pondok', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('kecamatan_id')->on('kecamatan')->onDelete('cascade');
        });
        Schema::table('data_user', function (Blueprint $table) {
            $table->foreign('kecamatan_id')->references('kecamatan_id')->on('kecamatan')->onDelete('set null');
        });
        Schema::table('pengajuan', function (Blueprint $table) {
            $table->foreign('operator_id')->references('admin_id')->on('admin')->onDelete('set null');
            $table->foreign('admin_id')->references('admin_id')->on('admin')->onDelete('set null');
        });

        Schema::enableForeignKeyConstraints();
    }
};
