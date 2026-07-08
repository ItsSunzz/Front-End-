<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'kecamatan_id' => 'nullable|exists:districts,id',
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => false, 'message' => $validator->errors()], 422);
        }

        $user = User::create([
            'district_id' => $request->kecamatan_id,
            'nama' => $request->nama,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'kecamatan', // Default set to kecamatan
            'status' => 'aktif',
        ]);

        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi Admin Berhasil',
            'token' => $token,
            'admin' => $user,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Cari user berdasarkan email + muat relasi district
        $user = User::with('district')->where('email', $request->email)->first();

        // Validasi keberadaan user dan kecocokan password
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Kredensial yang diberikan salah.',
            ], 401);
        }

        if ($user->status !== 'aktif') {
            return response()->json([
                'message' => 'Akun Anda dinonaktifkan. Silakan hubungi Super Admin.',
            ], 403);
        }

        // Hapus token lama jika ada
        $user->tokens()->delete();

        // Buat token baru
        $token = $user->createToken('admin_token')->plainTextToken;

        // Siapkan data admin yang dikirim ke FE (tambahkan nama_kecamatan)
        $adminData = $user->toArray();
        $adminData['nama_kecamatan'] = $user->district ? $user->district->name : null;

        return response()->json([
            'message' => 'Login Berhasil',
            'token'   => $token,
            'admin'   => $adminData,
        ], 200);
    }

    public function logout(Request $request)
    {
        // Menghapus token yang sedang digunakan saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout Berhasil',
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'old_password' => 'required',
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Sandi lama salah.'
            ], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Sandi Anda berhasil diperbarui.'
        ], 200);
    }
}

