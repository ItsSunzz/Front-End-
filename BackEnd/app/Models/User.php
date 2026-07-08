<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'district_id',
        'nama',
        'email',
        'password',
        'role',
        'status',
        'terakhir_login'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function district()
    {
        return $this->belongsTo(District::class, 'district_id');
    }

    public function pengajuanOperator()
    {
        return $this->hasMany(Pengajuan::class, 'operator_id');
    }

    public function pengajuanValidator()
    {
        return $this->hasMany(Pengajuan::class, 'admin_id');
    }
}
