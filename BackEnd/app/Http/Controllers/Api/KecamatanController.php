<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kecamatan;
use Illuminate\Http\Request;

class KecamatanController extends Controller
{
    public function index()
    {
        $kecamatan = Kecamatan::all();
        return response()->json($kecamatan, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kecamatan' => 'required|string|max:255|unique:kecamatan,nama_kecamatan'
        ]);

        $kecamatan = Kecamatan::create($request->all());
        return response()->json(['message' => 'Kecamatan berhasil ditambahkan', 'data' => $kecamatan], 201);
    }

    public function show($id)
    {
        $kecamatan = Kecamatan::find($id);

        if (!$kecamatan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($kecamatan, 200);
    }

    public function update(Request $request, $id)
    {
        $kecamatan = Kecamatan::find($id);

        if (!$kecamatan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $request->validate([
            'nama_kecamatan' => 'required|string|max:255|unique:kecamatan,nama_kecamatan,' . $kecamatan->kecamatan_id . ',kecamatan_id'
        ]);

        $kecamatan->update($request->all());
        return response()->json(['message' => 'Kecamatan berhasil diperbarui', 'data' => $kecamatan], 200);
    }

    public function destroy($id)
    {
        $kecamatan = Kecamatan::find($id);

        if (!$kecamatan) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $kecamatan->delete();
        return response()->json(['message' => 'Kecamatan berhasil dihapus'], 200);
    }
}