<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index()
    {
        $program = Program::all();

        return response()->json($program, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_program' => 'required|string|max:255',
            'tahun'        => 'required|integer',
            'status'       => 'required|in:active,inactive',
        ]);

        $program = Program::create($request->all());

        return response()->json(['message' => 'Program berhasil ditambahkan', 'data' => $program], 201);
    }

    public function show($id)
    {
        $program = Program::find($id);

        if (!$program) {
            return response()->json(['message' => 'Data tidak ditemukan'], 404);
        }

        return response()->json($program, 200);
    }

    public function update(Request $request, $id)
    {
        $program = Program::find($id);

        if (!$program) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $request->validate([
            'nama_program' => 'required|string|max:255',
            'tahun'        => 'required|integer',
            'status'       => 'required|in:active,inactive',
        ]);

        $program->update($request->all());

        return response()->json(['message' => 'Program berhasil diperbarui', 'data' => $program], 200);
    }

    public function destroy($id)
    {
        $program = Program::find($id);

        if (!$program) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $program->delete();

        return response()->json(['message' => 'Program berhasil dihapus'], 200);
    }
}