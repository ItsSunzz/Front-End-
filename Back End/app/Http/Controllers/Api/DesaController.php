<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Desa;
use Illuminate\Http\Request;

class DesaController extends Controller
{
    // 1. Mengambil SEMUA data desa beserta data kecamatannya
    public function index(Request $request)
    {
        $query = Desa::with('kecamatan');
        if ($request->has('kecamatan_id')) {
            $query->where('kecamatan_id', $request->kecamatan_id);
        }
        $desa = $query->get(); 
        
        return response()->json($desa, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'kecamatan_id' => 'required|exists:kecamatan,kecamatan_id',
            'nama_desa' => 'required|string|max:255'
        ]);

        $desa = Desa::create($request->all());
        return response()->json(['message' => 'Desa berhasil ditambahkan', 'data' => $desa], 201);
    }

    // 2. Mengambil SATU data desa beserta data kecamatannya
    public function show($id)
    {
        // Menggunakan dengan eager loading untuk satu data
        $desa = Desa::with('kecamatan')->find($id);
        
        if (!$desa) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }
        
        return response()->json($desa, 200);
    }

    public function update(Request $request, $id)
    {
        $desa = Desa::find($id);
        if (!$desa) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $request->validate([
            'kecamatan_id' => 'required|exists:kecamatan,kecamatan_id',
            'nama_desa' => 'required|string|max:255'
        ]);

        $desa->update($request->all());
        return response()->json(['message' => 'Desa berhasil diperbarui', 'data' => $desa], 200);
    }

    public function destroy($id)
    {
        $desa = Desa::find($id);
        if (!$desa) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $desa->delete();
        return response()->json(['message' => 'Desa berhasil dihapus'], 200);
    }
}