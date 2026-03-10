<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Acao extends Model
{
    use HasFactory;

    protected $table = 'acoes';

    protected $fillable = [
        'titulo',
        'descricao',
        'clube_id',
        'bairro_id',
        'igreja_id',
        'data_inicio',
        'data_fim',
        'status',
        'status_moderacao',
        'pessoas_atendidas',
        'fotos',
        'lat',
        'lng'
    ];

    protected $casts = [
        'data_inicio' => 'datetime',
        'data_fim' => 'datetime',
        'fotos' => 'array',
    ];

    public function clube()
    {
        return $this->belongsTo(Clube::class);
    }

    public function bairro()
    {
        return $this->belongsTo(Bairro::class);
    }
}
