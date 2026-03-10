<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bairro extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'cor', 'geojson'];

    protected $casts = [
        'geojson' => 'array',
    ];

    public function acoes()
    {
        return $this->hasMany(Acao::class);
    }
}
