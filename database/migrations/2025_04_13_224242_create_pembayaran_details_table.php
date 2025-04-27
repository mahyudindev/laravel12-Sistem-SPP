<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('pembayaran_detail', function (Blueprint $table) {
            $table->id('pembayaran_detail_id');
            $table->foreignId('pembayaran_id')->constrained('pembayaran', 'pembayaran_id')->onDelete('cascade');
            $table->foreignId('spp_id')->nullable()->constrained('spp', 'spp_id')->onDelete('cascade');
            $table->foreignId('ppdb_id')->nullable()->constrained('ppdb', 'ppdb_id')->onDelete('cascade');
            $table->foreignId('siswa_id')->constrained('siswa', 'siswa_id')->onDelete('cascade');
            $table->decimal('biaya', 10, 2)->default(0);
            $table->decimal('jumlah_bayar', 10, 2)->default(0);
            $table->enum('status_pembayaran', ['pending', 'lunas', 'ditolak'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran_detail');
    }
};