<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DataUserController;
use App\Http\Controllers\Api\DesaController;
use App\Http\Controllers\Api\DistrictController;
use App\Http\Controllers\Api\PondokController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\PengajuanController; // 1. IMPORT CONTROLLER BARU
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

// ================================================
// Route Publik (Bisa diakses tanpa login)
// ================================================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/public-recipients', [PengajuanController::class, 'publicIndex']);

// Kecamatan publik (data referensi wilayah)
Route::apiResource('kecamatan', DistrictController::class);

// Program publik (data referensi anggaran tahunan)
Route::apiResource('program', ProgramController::class);


// ================================================
// Route Terproteksi (Harus Login Sanctum)
// ================================================
Route::middleware('auth:sanctum')->group(function () {

    Route::apiResource('desa', DesaController::class);
    Route::apiResource('pondok', PondokController::class);
    Route::apiResource('data-user', DataUserController::class);
    Route::apiResource('pengajuan', PengajuanController::class);
    Route::apiResource('users', UserController::class);
    Route::patch('users/{id}/toggle-status', [UserController::class, 'toggleStatus']);
    Route::patch('users/{id}/reset-password', [UserController::class, 'resetPassword']);
    
    // 3. RUTE KHUSUS VALIDASI SUPER ADMIN (Menggunakan PATCH untuk mengubah sebagian data status)
    Route::patch('pengajuan/{id}/validate', [PengajuanController::class, 'validateSubmission']);

    Route::post('pengajuan/{id}/renew', [PengajuanController::class, 'renew']);
    Route::get('pengajuan/check-nik/{nik}', [PengajuanController::class, 'checkNik']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/logout', [AuthController::class, 'logout']);
});