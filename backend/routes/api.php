<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Bairro;
use App\Models\Clube;
use App\Models\Acao;
use App\Models\Igreja;
use App\Http\Controllers\Api\LogController;

// --- PUBLIC ROUTES ---
Route::get('/igrejas', fn() => response()->json(Igreja::with('clubes')->where('status', 'ativo')->get()));
Route::get('/bairros', fn() => response()->json(Bairro::all()));
Route::get('/clubes', fn() => response()->json(Clube::with('igreja')->get()));
Route::get('/acoes', fn() => response()->json(Acao::with(['clube.igreja', 'bairro'])->where('status_moderacao', 'aprovada')->get()));

// --- COLLABORATION ---
Route::post('/propor-acao', function (Request $request) {
    $data = $request->validate([
        'titulo' => 'required|string|max:255',
        'descricao' => 'nullable|string',
        'bairro_id' => 'required|exists:bairros,id',
        'igreja_id' => 'nullable|exists:igrejas,id',
        'data_inicio' => 'nullable|date',
        'lat' => 'nullable|numeric',
        'lng' => 'nullable|numeric',
    ]);

    $acao = Acao::create(array_merge($data, [
        'status' => 'programada',
        'status_moderacao' => 'pendente'
    ]));

    \App\Services\LogService::log('PROPOSE_ACTION', "Guest proposed action: {$acao->titulo}");
    return response()->json($acao, 201);
});

Route::post('/propor-igreja', function (Request $request) {
    $data = $request->validate([
        'nome' => 'required|string|max:255',
        'endereco' => 'required|string',
        'lat' => 'nullable|numeric',
        'lng' => 'nullable|numeric',
    ]);

    $igreja = Igreja::create(array_merge($data, ['status' => 'pendente']));
    \App\Services\LogService::log('PROPOSE_CHURCH', "Guest proposed church: {$igreja->nome}");
    return response()->json($igreja, 201);
});

// --- ADMIN / LOGS ---
Route::get('/logs', [LogController::class, 'index']);
Route::post('/logs', [LogController::class, 'store']);

// --- MODERATION ---
Route::patch('/acoes/{acao}/vincular', function (Request $request, Acao $acao) {
    $request->validate([
        'clube_id' => 'required|exists:clubes,id',
        'status' => 'nullable|in:programada,realizada',
        'pessoas_atendidas' => 'nullable|integer',
        'fotos' => 'nullable|array'
    ]);

    $acao->update(array_merge($request->all(), ['status_moderacao' => 'aprovada']));
    \App\Services\LogService::log('APPROVE_ACTION', "Approved action: {$acao->titulo}");
    return response()->json($acao);
});

Route::patch('/igrejas/{igreja}/aprovar', function (Igreja $igreja) {
    $igreja->update(['status' => 'ativo']);
    \App\Services\LogService::log('APPROVE_CHURCH', "Approved church: {$igreja->nome}");
    return response()->json($igreja);
});

Route::get('/admin/resumo', function () {
    return response()->json([
        'acoes_pendentes' => Acao::where('status_moderacao', 'pendente')->with(['bairro', 'igreja'])->get(),
        'igrejas_pendentes' => Igreja::where('status', 'pendente')->get(),
        'metricas' => [
            'total_impacto' => Acao::sum('pessoas_atendidas'),
            'total_igrejas' => Igreja::where('status', 'ativo')->count(),
            'total_acoes' => Acao::where('status_moderacao', 'aprovada')->count(),
        ]
    ]);
});
