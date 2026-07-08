<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisPengajuan extends Model
{
    protected $table = 'jenis_pengajuan';
    protected $primaryKey = 'jenis_pengajuan_id';
    protected $fillable = ['nama_pengajuan'];

    public function program() { return $this->hasMany(Program::class, 'jenis_pengajuan_id'); }
    public function pengajuan() { return $this->hasMany(Pengajuan::class, 'jenis_pengajuan_id'); }
}