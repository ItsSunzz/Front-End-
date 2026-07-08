<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Desa extends Model
{
    protected $table = 'desa';
    protected $primaryKey = 'desa_id';

    protected $fillable = [
        'kecamatan_id',
        'nama_desa'
    ];

    public function kecamatan()
    {
        return $this->belongsTo(District::class, 'kecamatan_id', 'id');
    }

    public function pondok()
    {
        return $this->hasMany(Pondok::class, 'desa_id', 'desa_id');
    }
}