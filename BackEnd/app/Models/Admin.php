<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Admin extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'admin';

    protected $primaryKey = 'admin_id';

    protected $hidden = ['password', 'remember_token'];

    protected $fillable = ['kecamatan_id', 'nama', 'email', 'password', 'role', 'status', 'terakhir_login'];

    public function kecamatan()
    {
        return $this->belongsTo(Kecamatan::class, 'kecamatan_id');
    }

    public function pengajuan()
    {
        return $this->hasMany(Pengajuan::class, 'admin_id');
    }
}
