<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DataUser extends Model
{
    protected $table = 'data_user';
    protected $primaryKey = 'user_id';
    protected $hidden = ['password', 'remember_token'];

    protected $fillable = [
        'pondok_id',
        'jenis_user_id',
        'kecamatan_id',
        'desa_id',
        'nama_lengkap',
        'nik',
        'no_kk',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'rt',
        'rw',
        'dusun',
        'alamat',
        'bank',
        'nomor_rekening',
        'nama_pemilik_rekening',
        'masa_jabatan_mulai',
        'masa_jabatan_selesai',
        'foto_ktp',
        'foto_kk',
        'surat_putusan',
        'surat_keterangan_pimpinan_pondok',
        'surat_keterangan_guru_mengaji',
        'surat_keterangan_kecamatan',
    ];

    public function pondok()
    {
        return $this->belongsTo(Pondok::class, 'pondok_id', 'pondok_id');
    }

    public function jenisUser()
    {
        return $this->belongsTo(JenisUser::class, 'jenis_user_id', 'jenis_user_id');
    }

    public function kecamatan()
    {
        return $this->belongsTo(District::class, 'kecamatan_id', 'id');
    }

    public function desa()
    {
        return $this->belongsTo(Desa::class, 'desa_id', 'desa_id');
    }

    public function pengajuan()
    {
        return $this->hasMany(Pengajuan::class, 'user_id');
    }
}