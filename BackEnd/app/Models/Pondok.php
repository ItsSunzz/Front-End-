<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pondok extends Model
{
    protected $table = 'pondok';
    protected $primaryKey = 'pondok_id';

    protected $fillable = [
        'kecamatan_id',
        'desa_id',
        'nama_pondok',
        'alamat_pondok'
    ];

    public function desa()
    {
        return $this->belongsTo(Desa::class, 'desa_id', 'desa_id');
    }

    public function kecamatan()
    {
        return $this->belongsTo(District::class, 'kecamatan_id', 'id');
    }

    // Tambahan: Pondok punya banyak DataUser
    public function dataUser()
    {
        return $this->hasMany(DataUser::class, 'pondok_id', 'pondok_id');
    }
}