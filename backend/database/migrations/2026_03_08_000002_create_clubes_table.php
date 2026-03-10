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
        Schema::create('clubes', function (Blueprint $table) {
            $table->id();
            $table->string('nome');
            $table->string('tipo'); // ex: Clube de Aventureiros, Ministério Jovem
            $table->foreignId('igreja_id')->constrained('igrejas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clubes');
    }
};
