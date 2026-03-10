<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('acoes', function (Blueprint $table) {
            $table->id();
            $table->string('titulo'); // Ex: Feira de Saúde
            $table->text('descricao')->nullable();

            $table->foreignId('clube_id')->nullable()->constrained('clubes')->onDelete('cascade');
            $table->foreignId('bairro_id')->nullable()->constrained('bairros')->nullOnDelete();
            $table->foreignId('igreja_id')->nullable()->constrained('igrejas')->onDelete('cascade');

            // Novos campos: Impacto e Eventos
            $table->dateTime('data_inicio')->nullable();
            $table->dateTime('data_fim')->nullable();
            $table->enum('status', ['programada', 'realizada', 'cancelada'])->default('programada');
            $table->string('status_moderacao')->default('pendente'); // pendente, aprovada, rejeitada
            $table->integer('pessoas_atendidas')->default(0);
            $table->json('fotos')->nullable();

            // Coordenadas para o marcador no leaflet
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('acoes');
    }
};
