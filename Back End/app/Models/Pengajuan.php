<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengajuan extends Model
{
    protected $table = 'pengajuan';
    protected $primaryKey = 'pengajuan_id';
    
    protected $fillable = [
        'operator_id',      // Admin Kecamatan (yang input)
        'user_id',          // Pemohon / Masyarakat
        'admin_id',         // Super Admin (yang melakukan validasi)
        'program_id',       // Program Tahunan Anggaran
        'status_pengajuan', // Nilainya akan diisi 'pending', 'disetujui', atau 'ditolak'
        'tanggal_pengajuan',
        'catatan_pengajuan' // Alasan disetujui / ditolak dari Super Admin
    ];

    // Relasi ke Masyarakat
    public function user() { 
        return $this->belongsTo(DataUser::class, 'user_id', 'user_id'); 
    }

    // Relasi ke Admin Kecamatan (Data Entry)
    public function operator() { 
        return $this->belongsTo(User::class, 'operator_id', 'id'); 
    }

    // Relasi ke Super Admin (Validator)
    public function validator() { 
        return $this->belongsTo(User::class, 'admin_id', 'id'); 
    }

    // Relasi ke Program tahunan
    public function program() { 
        return $this->belongsTo(Program::class, 'program_id', 'program_id'); 
    }
}