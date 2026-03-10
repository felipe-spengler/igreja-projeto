<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Bairro;
use App\Models\Clube;
use App\Models\Acao;
use App\Models\Igreja;

// Retorna o usuário autenticado, mas a api base está aberta para leitura
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/igrejas', function () {
    return response()->json(Igreja::with('clubes')->get());
});

Route::get('/bairros', function () {
    return response()->json(Bairro::all());
});

Route::get('/clubes', function () {
    return response()->json(Clube::with('igreja')->get());
});

Route::get('/acoes', function () {
    return response()->json(Acao::with(['clube.igreja', 'bairro'])->get());
});

// Exemplo para cadastrar via POST
Route::post('/acoes', function (Request $request) {
    $request->validate([
        'titulo' => 'required',
        'clube_id' => 'required|exists:clubes,id',
    ]);

    $acao = Acao::create($request->all());
    return response()->json($acao, 201);
});
