<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pengajuan;
use App\Models\DataUser;
use App\Models\Program;
use App\Models\Desa;
use App\Models\JenisUser;
use Illuminate\Http\Request;

class PengajuanController extends Controller
{
    /**
     * Tampilan Utama (Sharing Data untuk Admin & Super Admin)
     */
    public function index(Request $request)
    {
        $userLogin = $request->user();
        
        $query = Pengajuan::with(['program', 'user.kecamatan', 'user.desa', 'user.jenisUser', 'operator', 'validator']);

        // JIKA ADMIN KECAMATAN: Filter data agar hanya memuat inputan dari kecamatan miliknya
        if ($userLogin->role === 'kecamatan') {
            $query->where('operator_id', $userLogin->id)
                  ->orWhereHas('operator', function($q) use ($userLogin) {
                      $q->where('district_id', $userLogin->district_id);
                  });
        }

        // JIKA SUPER ADMIN: Tampilkan semua data + Filter & History
        if ($userLogin->role === 'super_admin') {
            if ($request->has('status')) {
                $statusMap = [
                    'Pending' => 'pending',
                    'Terverifikasi' => 'disetujui',
                    'Ditolak' => 'ditolak'
                ];
                $val = $statusMap[$request->status] ?? $request->status;
                $query->where('status_pengajuan', $val);
            }
            if ($request->has('tahun')) {
                $query->whereHas('program', function($q) use ($request) {
                    $q->where('tahun', $request->tahun);
                });
            }
        }

        $submissions = $query->latest()->get()->map(function($p) {
            $u = $p->user;
            return [
                'id' => $p->pengajuan_id,
                'nama' => $u ? $u->nama_lengkap : '',
                'nik' => $u ? $u->nik : '',
                'kategori' => $u && $u->jenisUser ? $u->jenisUser->nama_jenis_user : '',
                'kecamatan' => $u && $u->kecamatan ? $u->kecamatan->name : '',
                'desaKelurahan' => $u && $u->desa ? $u->desa->nama_desa : '',
                'dusun' => $u ? $u->dusun : '',
                'rt' => $u ? $u->rt : '',
                'rw' => $u ? $u->rw : '',
                'noKK' => $u ? $u->no_kk : '',
                'tempatLahir' => $u ? $u->tempat_lahir : '',
                'tanggalLahir' => $u ? $u->tanggal_lahir : '',
                'jenisKelamin' => $u ? $u->jenis_kelamin : '',
                'bank' => $u ? $u->bank : '',
                'noRekening' => $u ? $u->nomor_rekening : '',
                'namaPemilikRekening' => $u ? $u->nama_pemilik_rekening : '',
                'masaJabatanMulai' => $u ? $u->masa_jabatan_mulai : '',
                'masaJabatanSelesai' => $u ? $u->masa_jabatan_selesai : '',
                'status' => $p->status_pengajuan === 'disetujui' ? 'Terverifikasi' : ($p->status_pengajuan === 'ditolak' ? 'Ditolak' : 'Pending'),
                'tanggalInput' => $p->created_at->format('d/m/Y'),
                'tahun' => $p->program ? $p->program->tahun : '',
                'catatan' => $p->catatan_pengajuan,
                'dokumenUploaded' => [
                    'ktp' => $u && $u->foto_ktp ? asset('storage/' . $u->foto_ktp) : null,
                    'kk' => $u && $u->foto_kk ? asset('storage/' . $u->foto_kk) : null,
                    'suratPutusan' => $u && $u->surat_putusan ? asset('storage/' . $u->surat_putusan) : null,
                    'suratKeterangan' => $u && $u->surat_keterangan_kecamatan ? asset('storage/' . $u->surat_keterangan_kecamatan) : null,
                    'suratPimpinanPondok' => $u && $u->surat_keterangan_pimpinan_pondok ? asset('storage/' . $u->surat_keterangan_pimpinan_pondok) : null,
                    'suratGuruMengaji' => $u && $u->surat_keterangan_guru_mengaji ? asset('storage/' . $u->surat_keterangan_guru_mengaji) : null,
                ]
            ];
        });

        return response()->json($submissions, 200);
    }

    /**
     * Tampilan Publik (Data Terbatas untuk Guest)
     */
    public function publicIndex()
    {
        $query = Pengajuan::with(['program', 'user.kecamatan', 'user.desa', 'user.jenisUser']);

        $data = $query->latest()->get()->map(function($p) {
            $u = $p->user;
            return [
                'nama' => $u ? $u->nama_lengkap : '',
                'nik' => $u ? substr($u->nik, 0, 4) . '************' : '',
                'kategori' => $u && $u->jenisUser ? $u->jenisUser->nama_jenis_user : '',
                'kecamatan' => $u && $u->kecamatan ? $u->kecamatan->name : '',
                'desaKelurahan' => $u && $u->desa ? $u->desa->nama_desa : '',
                'status' => $p->status_pengajuan === 'disetujui' ? 'Terverifikasi' : ($p->status_pengajuan === 'ditolak' ? 'Ditolak' : 'Pending'),
                'tanggalInput' => $p->created_at->format('d/m/Y'),
                'tahun' => $p->program ? $p->program->tahun : '',
            ];
        });

        return response()->json($data, 200);
    }

    /**
     * Input Data Pengajuan (Hanya bisa dilakukan oleh Admin Kecamatan)
     */
    public function store(Request $request)
    {
        $admin = $request->user();
        
        if ($admin->role !== 'kecamatan') {
            return response()->json(['message' => 'Akses ditolak. Hanya Admin Kecamatan yang dapat menginput pengajuan.'], 403);
        }

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'nik' => 'required|string|size:16',
            'no_kk' => 'nullable|string|size:16',
            'tempat_lahir' => 'required|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|string',
            'rt' => 'nullable|string|max:10',
            'rw' => 'nullable|string|max:10',
            'dusun' => 'nullable|string|max:255',
            'kategori_penerima' => 'required|string',
            'bank' => 'nullable|string|max:255',
            'nomor_rekening' => 'required|string|max:255',
            'nama_pemilik_rekening' => 'nullable|string|max:255',
            'desa_kelurahan' => 'required|string',
            'masa_jabatan_mulai' => 'nullable|string',
            'masa_jabatan_selesai' => 'nullable|string',
            'foto_ktp' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024',
            'foto_kk' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024',
            'surat_putusan' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024',
            'surat_keterangan' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024',
            'surat_pimpinan_pondok' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024',
            'surat_guru_mengaji' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024',
        ]);

        // Find active program for current year or overall active
        $program = Program::where('status', 'active')
            ->where('tahun', date('Y'))
            ->first();
        if (!$program) {
            $program = Program::where('status', 'active')->first();
        }
        if (!$program) {
            $program = Program::create([
                'nama_program' => 'Program Kesejahteraan',
                'tahun' => date('Y'),
                'status' => 'active'
            ]);
        }

        // Check if NIK already has a submission in this program
        $existsInCurrentProgram = Pengajuan::where('program_id', $program->program_id)
            ->whereHas('user', function($q) use ($request) {
                $q->where('nik', $request->nik);
            })->exists();

        if ($existsInCurrentProgram) {
            return response()->json([
                'message' => 'Data Ini Sudah Terdaftar'
            ], 422);
        }

        // Find jenis_user_id by category name
        $jenisUser = JenisUser::where('nama_jenis_user', $request->kategori_penerima)->first();
        $jenisUserId = $jenisUser ? $jenisUser->jenis_user_id : null;

        // Find desa_id by name within the admin's kecamatan
        $desa = Desa::where('kecamatan_id', $admin->district_id)
            ->where('nama_desa', $request->desa_kelurahan)
            ->first();
        $desaId = $desa ? $desa->desa_id : null;

        // Save files
        $filePaths = [];
        $fileFields = [
            'foto_ktp' => 'foto_ktp',
            'foto_kk' => 'foto_kk',
            'surat_putusan' => 'surat_putusan',
            'surat_keterangan' => 'surat_keterangan_kecamatan',
            'surat_pimpinan_pondok' => 'surat_keterangan_pimpinan_pondok',
            'surat_guru_mengaji' => 'surat_keterangan_guru_mengaji',
        ];

        foreach ($fileFields as $inputKey => $dbColumn) {
            if ($request->hasFile($inputKey)) {
                $filePaths[$dbColumn] = $request->file($inputKey)->store("uploads/{$dbColumn}", 'public');
            }
        }

        // Create DataUser
        $dataUser = DataUser::create(array_merge([
            'jenis_user_id' => $jenisUserId,
            'kecamatan_id' => $admin->district_id,
            'desa_id' => $desaId,
            'nama_lengkap' => $request->nama_lengkap,
            'nik' => $request->nik,
            'no_kk' => $request->no_kk,
            'tempat_lahir' => $request->tempat_lahir,
            'tanggal_lahir' => $request->tanggal_lahir,
            'jenis_kelamin' => $request->jenis_kelamin,
            'rt' => $request->rt,
            'rw' => $request->rw,
            'dusun' => $request->dusun,
            'bank' => $request->bank,
            'nomor_rekening' => $request->nomor_rekening,
            'nama_pemilik_rekening' => $request->nama_pemilik_rekening,
            'masa_jabatan_mulai' => $request->masa_jabatan_mulai,
            'masa_jabatan_selesai' => $request->masa_jabatan_selesai,
            'alamat' => trim("{$request->dusun} RT.{$request->rt} RW.{$request->rw} {$request->desa_kelurahan}"),
        ], $filePaths));

        // Find active program for current year or overall active
        $program = Program::where('status', 'active')
            ->where('tahun', date('Y'))
            ->first();
        if (!$program) {
            $program = Program::where('status', 'active')->first();
        }
        if (!$program) {
            $program = Program::create([
                'nama_program' => 'Program Kesejahteraan',
                'tahun' => date('Y'),
                'status' => 'active'
            ]);
        }

        // Create Pengajuan
        $pengajuan = Pengajuan::create([
            'program_id' => $program->program_id,
            'user_id' => $dataUser->user_id,
            'operator_id' => $admin->id,
            'status_pengajuan' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil ditambahkan',
            'data' => $pengajuan
        ], 201);
    }

    /**
     * Mengambil Detail Pengajuan Tunggal
     */
    public function show($id)
    {
        $pengajuan = Pengajuan::with(['program', 'user.kecamatan', 'user.desa', 'user.jenisUser', 'operator', 'validator'])->find($id);
        
        if (!$pengajuan) {
            return response()->json(['message' => 'Data pengajuan tidak ditemukan'], 404);
        }
        
        return response()->json($pengajuan, 200);
    }

    /**
     * Memperbarui Pengajuan & User Terkait
     */
    public function update(Request $request, $id)
    {
        $pengajuan = Pengajuan::with('user')->find($id);
        if (!$pengajuan) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan'], 404);
        }

        $u = $pengajuan->user;
        if ($u) {
            $request->validate([
                'nama' => 'nullable|string|max:255',
                'nik' => 'nullable|string|size:16',
                'kategori' => 'nullable|string',
                'rt' => 'nullable|string|max:10',
                'rw' => 'nullable|string|max:10',
                'dusun' => 'nullable|string|max:255',
                'desaKelurahan' => 'nullable|string',
                'noKK' => 'nullable|string|size:16',
                'bank' => 'nullable|string',
                'noRekening' => 'nullable|string',
                'masaJabatanMulai' => 'nullable|string',
                'masaJabatanSelesai' => 'nullable|string',
            ]);

            if ($request->has('nik') && $request->nik !== $u->nik) {
                $existsInCurrentProgram = Pengajuan::where('program_id', $pengajuan->program_id)
                    ->where('pengajuan_id', '!=', $pengajuan->pengajuan_id)
                    ->whereHas('user', function($q) use ($request) {
                        $q->where('nik', $request->nik);
                    })->exists();
                if ($existsInCurrentProgram) {
                    return response()->json(['message' => 'NIK ini sudah terdaftar pada program tahun ini.'], 422);
                }
            }

            $updateData = [];
            if ($request->has('nama')) $updateData['nama_lengkap'] = $request->nama;
            if ($request->has('nik')) $updateData['nik'] = $request->nik;
            if ($request->has('rt')) $updateData['rt'] = $request->rt;
            if ($request->has('rw')) $updateData['rw'] = $request->rw;
            if ($request->has('dusun')) $updateData['dusun'] = $request->dusun;
            if ($request->has('noKK')) $updateData['no_kk'] = $request->noKK;
            if ($request->has('bank')) $updateData['bank'] = $request->bank;
            if ($request->has('noRekening')) $updateData['nomor_rekening'] = $request->noRekening;
            if ($request->has('masaJabatanMulai')) $updateData['masa_jabatan_mulai'] = $request->masaJabatanMulai;
            if ($request->has('masaJabatanSelesai')) $updateData['masa_jabatan_selesai'] = $request->masaJabatanSelesai;

            if ($request->has('kategori')) {
                $jenisUser = JenisUser::where('nama_jenis_user', $request->kategori)->first();
                if ($jenisUser) {
                    $updateData['jenis_user_id'] = $jenisUser->jenis_user_id;
                }
            }

            if ($request->has('desaKelurahan')) {
                $desa = Desa::where('kecamatan_id', $u->kecamatan_id)
                    ->where('nama_desa', $request->desaKelurahan)
                    ->first();
                if ($desa) {
                    $updateData['desa_id'] = $desa->desa_id;
                }
            }

            $fileFields = [
                'foto_ktp' => 'foto_ktp',
                'foto_kk' => 'foto_kk',
                'surat_putusan' => 'surat_putusan',
                'surat_keterangan' => 'surat_keterangan_kecamatan',
                'surat_pimpinan_pondok' => 'surat_keterangan_pimpinan_pondok',
                'surat_guru_mengaji' => 'surat_keterangan_guru_mengaji',
            ];

            foreach ($fileFields as $inputKey => $dbColumn) {
                if ($request->hasFile($inputKey)) {
                    $request->validate([
                        $inputKey => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024'
                    ]);
                    $updateData[$dbColumn] = $request->file($inputKey)->store("uploads/{$dbColumn}", 'public');
                }
            }

            $u->update($updateData);
        }

        if ($request->has('status')) {
            $statusMap = [
                'Pending' => 'pending',
                'Terverifikasi' => 'disetujui',
                'Ditolak' => 'ditolak'
            ];
            $pengajuan->update([
                'status_pengajuan' => $statusMap[$request->status] ?? $pengajuan->status_pengajuan
            ]);
        }

        // If updated by kecamatan and currently ditolak, reset to pending and clear comments
        if ($request->user() && $request->user()->role === 'kecamatan' && $pengajuan->status_pengajuan === 'ditolak') {
            $pengajuan->update([
                'status_pengajuan' => 'pending',
                'catatan_pengajuan' => null,
            ]);
        }

        return response()->json([
            'message' => 'Pengajuan berhasil diperbarui'
        ], 200);
    }

    /**
     * Menghapus Pengajuan & User Terkait
     */
    public function destroy($id)
    {
        $pengajuan = Pengajuan::find($id);
        if (!$pengajuan) {
            return response()->json(['message' => 'Pengajuan tidak ditemukan'], 404);
        }

        $user = $pengajuan->user;
        $pengajuan->delete();
        if ($user) {
            $user->delete();
        }

        return response()->json(['message' => 'Pengajuan berhasil dihapus'], 200);
    }

    /**
     * Fitur Validasi Pengajuan (MUTLAK HANYA UNTUK SUPER ADMIN)
     */
    public function validateSubmission(Request $request, $id)
    {
        $superAdmin = $request->user();
        
        if ($superAdmin->role !== 'super_admin') {
            return response()->json(['message' => 'Akses ditolak. Hanya Super Admin yang berhak melakukan validasi.'], 403);
        }

        $request->validate([
            'status_pengajuan'  => 'required|in:disetujui,ditolak',
            'catatan_pengajuan' => 'nullable|string',
        ]);

        $pengajuan = Pengajuan::find($id);
        if (!$pengajuan) {
            return response()->json(['message' => 'Data pengajuan tidak ditemukan'], 404);
        }

        $pengajuan->update([
            'status_pengajuan'  => $request->status_pengajuan,
            'catatan_pengajuan' => $request->catatan_pengajuan,
            'admin_id'          => $superAdmin->id,
            'tanggal_pengajuan' => now(),
            'tanggal_validasi'  => now(),
        ]);

        return response()->json([
            'message' => 'Status pengajuan berhasil diperbarui oleh Super Admin.',
            'data'    => $pengajuan
        ], 200);
    }

    /**
     * Memeriksa apakah NIK sudah terdaftar di database untuk program tahun ini
     */
    public function checkNik($nik)
    {
        $program = Program::where('status', 'active')
            ->where('tahun', date('Y'))
            ->first();
        if (!$program) {
            $program = Program::where('status', 'active')->first();
        }
        
        $exists = false;
        if ($program) {
            $exists = Pengajuan::where('program_id', $program->program_id)
                ->whereHas('user', function($q) use ($nik) {
                    $q->where('nik', $nik);
                })->exists();
        }

        return response()->json([
            'exists' => $exists,
            'message' => $exists ? 'Data Ini Sudah Terdaftar' : 'NIK tersedia'
        ]);
    }

    /**
     * Memperbarui pengajuan untuk tahun berikutnya dengan pilihan dokumen lama/baru
     */
    public function renew(Request $request, $id)
    {
        $admin = $request->user();
        if ($admin->role !== 'kecamatan') {
            return response()->json(['message' => 'Akses ditolak. Hanya Admin Kecamatan yang dapat memperbaharui pengajuan.'], 403);
        }

        $oldPengajuan = Pengajuan::with('user')->find($id);
        if (!$oldPengajuan || !$oldPengajuan->user) {
            return response()->json(['message' => 'Data pengajuan lama tidak ditemukan.'], 404);
        }

        $u = $oldPengajuan->user;

        // Find active program for current year or overall active
        $program = Program::where('status', 'active')
            ->where('tahun', date('Y'))
            ->first();
        if (!$program) {
            $program = Program::where('status', 'active')->first();
        }
        if (!$program) {
            $program = Program::create([
                'nama_program' => 'Program Kesejahteraan',
                'tahun' => date('Y'),
                'status' => 'active'
            ]);
        }

        // Check if NIK already has a submission in this program
        $existsInCurrentProgram = Pengajuan::where('program_id', $program->program_id)
            ->whereHas('user', function($q) use ($u) {
                $q->where('nik', $u->nik);
            })->exists();

        if ($existsInCurrentProgram) {
            return response()->json([
                'message' => 'NIK ini sudah terdaftar pada program tahun ini.'
            ], 422);
        }

        // Prepare new DataUser attributes
        $newUserData = [
            'pondok_id' => $u->pondok_id,
            'jenis_user_id' => $u->jenis_user_id,
            'kecamatan_id' => $u->kecamatan_id,
            'desa_id' => $u->desa_id,
            'nama_lengkap' => $u->nama_lengkap,
            'nik' => $u->nik,
            'no_kk' => $u->no_kk,
            'tempat_lahir' => $u->tempat_lahir,
            'tanggal_lahir' => $u->tanggal_lahir,
            'jenis_kelamin' => $u->jenis_kelamin,
            'rt' => $u->rt,
            'rw' => $u->rw,
            'dusun' => $u->dusun,
            'alamat' => $u->alamat,
            'bank' => $u->bank,
            'nomor_rekening' => $u->nomor_rekening,
            'nama_pemilik_rekening' => $u->nama_pemilik_rekening,
            'masa_jabatan_mulai' => $u->masa_jabatan_mulai,
            'masa_jabatan_selesai' => $u->masa_jabatan_selesai,
        ];

        // Handle documents
        $fileFields = [
            'foto_ktp' => 'foto_ktp',
            'foto_kk' => 'foto_kk',
            'surat_putusan' => 'surat_putusan',
            'surat_keterangan' => 'surat_keterangan_kecamatan',
            'surat_pimpinan_pondok' => 'surat_keterangan_pimpinan_pondok',
            'surat_guru_mengaji' => 'surat_keterangan_guru_mengaji',
        ];

        $reuse = $request->input('reuse_documents') === 'true' || $request->input('reuse_documents') === true;

        foreach ($fileFields as $inputKey => $dbColumn) {
            if (!$reuse && $request->hasFile($inputKey)) {
                // Validate file
                $request->validate([
                    $inputKey => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:1024'
                ]);
                $newUserData[$dbColumn] = $request->file($inputKey)->store("uploads/{$dbColumn}", 'public');
            } else {
                // Copy from old record
                $newUserData[$dbColumn] = $u->$dbColumn;
            }
        }

        // Create new DataUser
        $newDataUser = DataUser::create($newUserData);

        // Create new Pengajuan
        $newPengajuan = Pengajuan::create([
            'program_id' => $program->program_id,
            'user_id' => $newDataUser->user_id,
            'operator_id' => $admin->id,
            'status_pengajuan' => 'pending',
        ]);

        return response()->json([
            'message' => 'Pengajuan berhasil diperbaharui untuk tahun ini.',
            'data' => $newPengajuan
        ], 201);
    }
}