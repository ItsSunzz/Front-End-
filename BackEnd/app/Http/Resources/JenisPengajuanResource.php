<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JenisPengajuanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_jenis' => $this->nama_jenis,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}