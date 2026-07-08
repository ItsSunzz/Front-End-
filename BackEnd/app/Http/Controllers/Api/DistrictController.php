<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\District;
use Illuminate\Http\Request;

class DistrictController extends Controller
{
    public function index()
    {
        $districts = District::all()->map(function($d) {
            return [
                'kecamatan_id' => $d->id,
                'nama_kecamatan' => $d->name,
                'id' => $d->id,
                'name' => $d->name,
            ];
        });
        return response()->json($districts, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:districts,name'
        ]);

        $district = District::create([
            'name' => $request->name
        ]);

        return response()->json([
            'message' => 'Kecamatan berhasil ditambahkan',
            'data' => [
                'kecamatan_id' => $district->id,
                'nama_kecamatan' => $district->name,
                'id' => $district->id,
                'name' => $district->name,
            ]
        ], 201);
    }

    public function show($id)
    {
        $district = District::find($id);

        if (!$district) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json([
            'kecamatan_id' => $district->id,
            'nama_kecamatan' => $district->name,
            'id' => $district->id,
            'name' => $district->name,
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $district = District::find($id);

        if (!$district) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:districts,name,' . $id
        ]);

        $district->update([
            'name' => $request->name
        ]);

        return response()->json([
            'message' => 'Kecamatan berhasil diperbarui',
            'data' => [
                'kecamatan_id' => $district->id,
                'nama_kecamatan' => $district->name,
                'id' => $district->id,
                'name' => $district->name,
            ]
        ], 200);
    }

    public function destroy($id)
    {
        $district = District::find($id);

        if (!$district) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        $district->delete();
        return response()->json(['message' => 'Kecamatan berhasil dihapus'], 200);
    }
}
