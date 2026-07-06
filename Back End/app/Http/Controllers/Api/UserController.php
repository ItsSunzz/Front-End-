<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
   // GET /api/users
    public function index()
    {
        // Pastikan model User menggunakan Eager Loading 'district'
        $users = User::with('district')->get()->map(function($u) {
            return [
                'id' => (string) $u->id,
                'nama' => $u->nama,
                'email' => $u->email,
                'role' => $u->role,
                'wilayah' => $u->role === 'super_admin' ? 'Kabupaten Boyolali' : ($u->district ? $u->district->name : '-'),
                'district_id' => $u->district_id,
                'kecamatan_id' => $u->district_id,
                'status' => $u->status ?? 'aktif', // Menjaga jika nilai status null
                'terakhirLogin' => $u->terakhir_login ?? '-',
            ];
        });

        return response()->json($users, 200);
    }

    // POST /api/users
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:super_admin,kecamatan',
            'district_id' => 'required_if:role,kecamatan|nullable|exists:districts,id',
            'password' => 'required|string|min:6',
        ]);

        $nama = $request->nama;
        if (!$nama) {
            if ($request->role === 'super_admin') {
                $nama = 'Setda Kabupaten Boyolali';
            } else {
                $district = \App\Models\District::find($request->district_id);
                $nama = 'Admin Kecamatan ' . ($district ? $district->name : '');
            }
        }

        $user = User::create([
            'nama' => $nama,
            'email' => $request->email,
            'role' => $request->role,
            'district_id' => $request->role === 'kecamatan' ? $request->district_id : null,
            'password' => Hash::make($request->password),
            'status' => 'aktif',
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan',
            'data' => [
                'id' => (string) $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'wilayah' => $user->role === 'super_admin' ? 'Kabupaten Boyolali' : ($user->district ? $user->district->name : '-'),
                'district_id' => $user->district_id,
                'kecamatan_id' => $user->district_id,
                'status' => $user->status,
                'terakhirLogin' => '-',
            ]
        ], 201);
    }

    // PUT /api/users/{id}
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $request->validate([
            'nama' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'required|in:super_admin,kecamatan',
            'district_id' => 'required_if:role,kecamatan|nullable|exists:districts,id',
            'password' => 'nullable|string|min:6',
        ]);

        $nama = $request->nama;
        if (!$nama) {
            if ($request->role === 'super_admin') {
                $nama = 'Setda Kabupaten Boyolali';
            } else {
                $district = \App\Models\District::find($request->district_id);
                $nama = 'Admin Kecamatan ' . ($district ? $district->name : '');
            }
        }

        $updateData = [
            'nama' => $nama,
            'email' => $request->email,
            'role' => $request->role,
            'district_id' => $request->role === 'kecamatan' ? $request->district_id : null,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        $user->load('district');

        return response()->json([
            'message' => 'User berhasil diperbarui',
            'data' => [
                'id' => (string) $user->id,
                'nama' => $user->nama,
                'email' => $user->email,
                'role' => $user->role,
                'wilayah' => $user->role === 'super_admin' ? 'Kabupaten Boyolali' : ($user->district ? $user->district->name : '-'),
                'district_id' => $user->district_id,
                'kecamatan_id' => $user->district_id,
                'status' => $user->status,
                'terakhirLogin' => $user->terakhir_login ?? '-',
            ]
        ], 200);
    }

    // DELETE /api/users/{id}
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus'], 200);
    }

    // PATCH /api/users/{id}/toggle-status
    public function toggleStatus($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $newStatus = $user->status === 'aktif' ? 'nonaktif' : 'aktif';
        $user->update(['status' => $newStatus]);

        return response()->json([
            'message' => 'Status user berhasil diubah',
            'status' => $newStatus
        ], 200);
    }

    // PATCH /api/users/{id}/reset-password
    public function resetPassword(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Password user berhasil direset'
        ], 200);
    }
}
