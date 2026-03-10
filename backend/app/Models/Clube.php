<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clube extends Model
{
    use HasFactory;

    protected $fillable = ['nome', 'tipo', 'igreja_id'];

    public function igreja()
    {
        return $this->belongsTo(Igreja::class);
    }

    public function acoes()
    {
        return $this->hasMany(Acao::class);
    }
}
