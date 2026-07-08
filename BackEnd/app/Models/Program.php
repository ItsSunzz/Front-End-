<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $table = 'program';
    protected $primaryKey = 'program_id';
    public $incrementing = true;
    protected $fillable = [
        'nama_program',
        'tahun',
        'status',
    ];

    public function pengajuan()
    {
        return $this->hasMany(Pengajuan::class, 'program_id');
    }
}