<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kecamatan extends Model
{
    protected $table = 'kecamatan';
    protected $primaryKey = 'kecamatan_id';
    protected $fillable = ['nama_kecamatan'];

    public function desa() { return $this->hasMany(Desa::class, 'kecamatan_id'); }
    public function pondok() { return $this->hasMany(Pondok::class, 'kecamatan_id'); }
    public function admin() { return $this->hasMany(Admin::class, 'kecamatan_id'); }
}