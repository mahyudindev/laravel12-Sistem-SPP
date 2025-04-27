<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PembayaranDetail;
use App\Models\Siswa;

class Spp extends Model
{
    use HasFactory;

    protected $table = 'spp';
    protected $primaryKey = 'spp_id';
    
    protected $fillable = [
        'nama',
        'tahun_ajaran',
        'nominal',
        'is_aktif'
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
        'is_aktif' => 'boolean',
    ];

    public function pembayaranDetail()
    {
        return $this->hasMany(PembayaranDetail::class, 'spp_id', 'spp_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id', 'siswa_id');
    }
}