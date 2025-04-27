<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PembayaranDetail extends Model
{
    use HasFactory;

    protected $table = 'pembayaran_detail';
    protected $primaryKey = 'pembayaran_detail_id';
    
    protected $fillable = [
        'pembayaran_id',
        'spp_id',
        'ppdb_id',
        'siswa_id',
        'biaya',
        'jumlah_bayar',
        'status_pembayaran',
        'nominal',
        'total_bayar'
    ];

    /**
     * Get the pembayaran that owns the detail
     */
    public function pembayaran()
    {
        return $this->belongsTo(Pembayaran::class, 'pembayaran_id', 'pembayaran_id');
    }

    /**
     * Get the spp associated with the detail
     */
    public function spp()
    {
        return $this->belongsTo(Spp::class, 'spp_id', 'spp_id');
    }

    /**
     * Get the siswa associated with the detail
     */
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id', 'siswa_id');
    }

    /**
     * Get the ppdb associated with the detail
     */
    public function ppdb()
    {
        return $this->belongsTo(Ppdb::class, 'ppdb_id', 'ppdb_id');
    }
}