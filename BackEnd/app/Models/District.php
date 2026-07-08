<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    protected $table = 'districts';
    protected $fillable = ['name'];

    public function desa() { return $this->hasMany(Desa::class, 'kecamatan_id'); }
    public function pondok() { return $this->hasMany(Pondok::class, 'kecamatan_id'); }
    public function users() { return $this->hasMany(User::class, 'district_id'); }
}
