<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisUser extends Model
{
    protected $table = 'jenis_user';
    protected $primaryKey = 'jenis_user_id';
    protected $fillable = ['nama_jenis_user'];

    public function dataUsers()
    {
        return $this->hasMany(DataUser::class, 'jenis_user_id');
    }
}
