<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bairro;
use App\Models\Clube;
use App\Models\Acao;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Criar Usuário Super Admin
        \App\Models\User::create([
            'name' => 'SUPER ADMIN',
            'email' => 'admin@projeto.com',
            'password' => bcrypt('senha123'),
            'role' => 'super_admin'
        ]);

        // 1. Criar Igrejas
        $igrejas = [
            [
                'nome' => 'Igreja Central de Toledo',
                'endereco' => 'Rua Guarani, 1000 - Centro, Toledo - PR',
                'lat' => -24.7199,
                'lng' => -53.7433,
            ],
            [
                'nome' => 'Igreja Porto Alegre',
                'endereco' => 'Rua Porto Alegre, 500 - Jd. Porto Alegre, Toledo - PR',
                'lat' => -24.7000,
                'lng' => -53.7600,
            ],
            [
                'nome' => 'Igreja Coopagro',
                'endereco' => 'Av. Maripá, 2000 - Jd. Coopagro, Toledo - PR',
                'lat' => -24.7100,
                'lng' => -53.7300,
            ]
        ];

        $igrejasNoBanco = [];
        foreach ($igrejas as $index => $igrejaData) {
            $igreja = \App\Models\Igreja::create(array_merge($igrejaData, ['status' => 'ativo']));
            $igrejasNoBanco[] = $igreja;

            // Criar um admin para cada igreja
            \App\Models\User::create([
                'name' => 'Admin ' . $igreja->nome,
                'email' => 'admin' . ($index + 1) . '@projeto.com',
                'password' => bcrypt('senha123'),
                'role' => 'admin_igreja',
                'igreja_id' => $igreja->id
            ]);
        }

        // 2. Criar Bairros a partir do GeoJSON oficial (Toledo)
        $bairrosJsonPath = database_path('seeders/toledo_bairros_oficial.json');
        if (file_exists($bairrosJsonPath)) {
            $bairrosJson = file_get_contents($bairrosJsonPath);
            $bairrosData = json_decode($bairrosJson, true);
            $bairrosNoBanco = [];

            $coresBairros = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

            if (isset($bairrosData['features'])) {
                foreach ($bairrosData['features'] as $index => $feature) {
                    $nome = $feature['properties']['nm_bairro'] ?? $feature['properties']['nome'] ?? 'Bairro ' . ($index + 1);
                    $nome = mb_convert_case($nome, MB_CASE_TITLE, "UTF-8");
                    $cor = $coresBairros[$index % count($coresBairros)];

                    $bairro = Bairro::create([
                        'nome' => $nome,
                        'cor' => $cor,
                        'geojson' => $feature['geometry']
                    ]);
                    $bairrosNoBanco[$nome] = $bairro->id;
                }
            }
        }

        // 3. Criar Clubes/Ministérios para cada igreja
        $nomesClubes = [
            ['nome' => 'Aventureiros Estrelas', 'tipo' => 'Infantil'],
            ['nome' => 'Desbravadores', 'tipo' => 'Jovem'],
            ['nome' => 'Ação Solidária Adventista (ASA)', 'tipo' => 'Assistencial'],
            ['nome' => 'Ministério da Mulher', 'tipo' => 'Mulheres'],
        ];

        $clubesNoBanco = [];
        foreach ($igrejasNoBanco as $igreja) {
            foreach ($nomesClubes as $clubeData) {
                $clube = Clube::create([
                    'nome' => $clubeData['nome'] . ' (' . str_replace('Igreja ', '', $igreja->nome) . ')',
                    'tipo' => $clubeData['tipo'],
                    'igreja_id' => $igreja->id
                ]);
                $clubesNoBanco[] = $clube;
            }
        }

        // IDs de bairros conhecidos (ou os primeiros)
        $idsBairros = array_values($bairrosNoBanco);
        if (empty($idsBairros))
            $idsBairros = [1];

        // 4. Criar Ações variadas
        $acoesTemplates = [
            ['titulo' => 'Feira de Saúde', 'desc' => 'Atendimento médico e nutricional gratuito.', 'min_atend' => 100, 'max_atend' => 300],
            ['titulo' => 'Sopão Solidário', 'desc' => 'Distribuição de sopa quente para moradores de rua.', 'min_atend' => 50, 'max_atend' => 150],
            ['titulo' => 'Curso de Culinária Saudável', 'desc' => 'Ensinando receitas vegetarianas para a comunidade.', 'min_atend' => 20, 'max_atend' => 40],
            ['titulo' => 'Mutirão de Limpeza', 'desc' => 'Limpeza de praças e bueiros para evitar dengue.', 'min_atend' => 0, 'max_atend' => 0],
            ['titulo' => 'Projeto Quebrando o Silêncio', 'desc' => 'Palestra contra violência doméstica.', 'min_atend' => 80, 'max_atend' => 200],
            ['titulo' => 'Escola Cristã de Férias', 'desc' => 'Atividades bíblicas e recreativas para crianças.', 'min_atend' => 50, 'max_atend' => 120],
        ];

        // Criar 30 ações aleatórias (10 por igreja em média)
        foreach ($clubesNoBanco as $idx => $clube) {
            for ($i = 0; $i < 4; $i++) {
                $tpl = $acoesTemplates[array_rand($acoesTemplates)];
                $status = (rand(0, 10) > 3) ? 'realizada' : 'programada';
                $pessoas = ($status == 'realizada') ? rand($tpl['min_atend'], $tpl['max_atend']) : 0;

                // Data aleatória (30 dias no passado até 30 no futuro)
                $offset = rand(-30, 30);
                $data = now()->addDays($offset);

                Acao::create([
                    'titulo' => $tpl['titulo'],
                    'descricao' => $tpl['desc'],
                    'clube_id' => $clube->id,
                    'bairro_id' => $idsBairros[array_rand($idsBairros)],
                    'igreja_id' => $clube->igreja_id,
                    'data_inicio' => $data,
                    'data_fim' => $data->addHours(4),
                    'status' => $status,
                    'status_moderacao' => 'aprovada',
                    'pessoas_atendidas' => $pessoas,
                    'lat' => $igrejasNoBanco[0]->lat + (rand(-50, 50) / 1000), // Random jitter around center
                    'lng' => $igrejasNoBanco[0]->lng + (rand(-50, 50) / 1000),
                    'fotos' => [
                        'https://picsum.photos/seed/' . rand(1, 1000) . '/800/600',
                        'https://picsum.photos/seed/' . rand(1, 1000) . '/800/600'
                    ]
                ]);
            }
        }
    }
}
