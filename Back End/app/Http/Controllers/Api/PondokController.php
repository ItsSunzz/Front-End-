<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pondok;
use Illuminate\Http\Request;

class PondokController extends Controller
{
    public function index()
    {
        return response()->json(Pondok::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kecamatan_id' => 'required|exists:kecamatan,kecamatan_id',
            'desa_id' => 'required|exists:desa,desa_id',
            'nama_pondok' => 'required|string|max:255',
            'alamat_pondok' => 'required|string'
        ]);

        $pondok = Pondok::create($request->all());
        return response()->json(['message' => 'Pondok berhasil ditambahkan', 'data' => $pondok], 201);
    }

    public function show($id)
    {
        $pondok = Pondok::find($id);
        if (!$pondok) return response()->json(['message' => 'Data tidak ditemukan'], 404);
        return response()->json($pondok, 200);
    }

    public function update(Request $request, $id)
    {
        $pondok = Pondok::find($id);
        if (!$pondok) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $request->validate([
            'kecamatan_id' => 'required|exists:kecamatan,kecamatan_id',
            'desa_id' => 'required|exists:desa,desa_id',
            'nama_pondok' => 'required|string|max:255',
            'alamat_pondok' => 'required|string'
        ]);

        $pondok->update($request->all());
        return response()->json(['message' => 'Pondok berhasil diperbarui', 'data' => $pondok], 200);
    }

    public function destroy($id)
    {
        $pondok = Pondok::find($id);
        if (!$pondok) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $pondok->delete();
        return response()->json(['message' => 'Pondok berhasil dihapus'], 200);
    }
}