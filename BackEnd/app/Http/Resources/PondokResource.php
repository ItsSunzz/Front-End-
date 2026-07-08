<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PondokResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_pondok' => $this->nama_pondok,
            'alamat' => $this->alamat,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}