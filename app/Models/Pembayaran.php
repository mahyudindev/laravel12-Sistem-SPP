<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PembayaranDetail;
use App\Models\Spp;

class Pembayaran extends Model
{
    use HasFactory;

    protected $table = 'pembayaran';
    protected $primaryKey = 'pembayaran_id';
    
    protected $fillable = [
        'admin_id',
        'siswa_id',
        'tahun_ajaran',
        'total_tagihan',
        'total_bayar',
        'bukti_bayar',
        'keterangan',
        'status_pembayaran',
        'tanggal_bayar',
        'is_aktif'
    ];

    protected $casts = [
        'is_aktif' => 'boolean',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id', 'admin_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id', 'siswa_id');
    }

    public function pembayaranDetail()
    {
        return $this->hasMany(PembayaranDetail::class, 'pembayaran_id', 'pembayaran_id');
    }
    
    public function spp()
    {
        return $this->belongsTo(Spp::class, 'spp_id', 'spp_id');
    }
}