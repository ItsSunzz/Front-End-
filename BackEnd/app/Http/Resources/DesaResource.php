<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DesaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'nama_desa' => $this->nama_desa,
            'kecamatan' => new KecamatanResource($this->whenLoaded('kecamatan')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}