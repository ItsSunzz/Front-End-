<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // GET /api/users
    public function index()
    {
        $admins = Admin::with('kecamatan')->get()->map(function($a) {
            return [
                'id' => (string) $a->admin_id,
                'nama' => $a->nama,
                'email' => $a->email,
                'role' => $a->role,
                'wilayah' => $a->kecamatan ? $a->kecamatan->nama_kecamatan : 'Semua',
                'kecamatan_id' => $a->kecamatan_id,
                'status' => $a->status,
                'terakhirLogin' => $a->terakhir_login ?? '-',
            ];
        });

        return response()->json($admins, 200);
    }

    // POST /api/users
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:admin,email',
            'role' => 'required|string',
            'kecamatan_id' => 'nullable|exists:kecamatan,kecamatan_id',
            'password' => 'nullable|string|min:6',
        ]);

        $admin = Admin::create([
            'nama' => $request->nama,
            'email' => $request->email,
            'role' => $request->role,
            'kecamatan_id' => $request->role === 'Admin Kecamatan' ? $request->kecamatan_id : null,
            'password' => Hash::make($request->password ?? '123456'),
            'status' => 'Aktif',
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'data' => [
                'id' => (string) $admin->admin_id,
                'nama' => $admin->nama,
                'email' => $admin->email,
                'role' => $admin->role,
                'wilayah' => $admin->kecamatan ? $admin->kecamatan->nama_kecamatan : 'Semua',
                'kecamatan_id' => $admin->kecamatan_id,
                'status' => $admin->status,
                'terakhirLogin' => '-',
            ]
        ], 201);
    }

    // PUT /api/users/{id}
    public function update(Request $request, $id)
    {
        $admin = Admin::find($id);
        if (!$admin) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => 'required|string|max:255',
            'email' => 'required|email|unique:admin,email,' . $id . ',admin_id',
            'role' => 'required|string',
            'kecamatan_id' => 'nullable|exists:kecamatan,kecamatan_id',
        ]);

        $admin->update([
            'nama' => $request->nama,
            'email' => $request->email,
            'role' => $request->role,
            'kecamatan_id' => $request->role === 'Admin Kecamatan' ? $request->kecamatan_id : null,
        ]);

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'data' => [
                'id' => (string) $admin->admin_id,
                'nama' => $admin->nama,
                'email' => $admin->email,
                'role' => $admin->role,
                'wilayah' => $admin->kecamatan ? $admin->kecamatan->nama_kecamatan : 'Semua',
                'kecamatan_id' => $admin->kecamatan_id,
                'status' => $admin->status,
                'terakhirLogin' => $admin->terakhir_login ?? '-',
            ]
        ], 200);
    }

    // DELETE /api/users/{id}
    public function destroy($id)
    {
        $admin = Admin::find($id);
        if (!$admin) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $admin->delete();
        return response()->json(['message' => 'User berhasil dihapus'], 200);
    }

    // PATCH /api/users/{id}/toggle-status
    public function toggleStatus($id)
    {
        $admin = Admin::find($id);
        if (!$admin) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $newStatus = $admin->status === 'Aktif' ? 'Nonaktif' : 'Aktif';
        $admin->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Status user berhasil diubah',
            'status' => $newStatus
        ], 200);
    }

    // PATCH /api/users/{id}/reset-password
    public function resetPassword(Request $request, $id)
    {
        $admin = Admin::find($id);
        if (!$admin) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $admin->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password user berhasil direset'
        ], 200);
    }
}
