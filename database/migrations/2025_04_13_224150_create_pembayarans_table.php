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
        Schema::create('pembayaran', function (Blueprint $table) {
            $table->id('pembayaran_id');
            $table->foreignId('admin_id')->nullable()->constrained('admin', 'admin_id')->onDelete('cascade');
            $table->foreignId('siswa_id')->constrained('siswa', 'siswa_id')->onDelete('cascade');
            $table->string('tahun_ajaran', 10);
            $table->decimal('total_tagihan', 10, 2);
            $table->decimal('total_bayar', 10, 2);
            $table->string('bukti_bayar', 100)->nullable();
            $table->text('keterangan')->nullable();
            $table->enum('status_pembayaran', ['pending', 'lunas', 'ditolak'])->default('pending');
            $table->date('tanggal_bayar')->nullable();
            $table->date('tanggal_persetujuan')->nullable();
            $table->boolean('is_aktif')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pembayaran');
    }
};