<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Igreja extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'endereco', 'lat', 'lng', 'status'];

    public function clubes()
    {
        return $this->hasMany(Clube::class);
    }

    public function acoes()
    {
        return $this->hasManyThrough(Acao::class, Clube::class);
    }
}
