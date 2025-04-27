<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PembayaranDetail;

class Siswa extends Model
{
    use HasFactory;

    protected $table = 'siswa';
    protected $primaryKey = 'siswa_id';
    
    protected $fillable = [
        'nama',
        'user_id',
        'nis',
        'kelas',
        'jenis_kelamin',
        'tanggal_lahir',
        'alamat',
        'no_hp',
        'tanggal_masuk',
        'is_aktif'
    ];
    
    protected $casts = [
        'tanggal_lahir' => 'date',
        'tanggal_masuk' => 'date',
        'is_aktif' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'siswa_id', 'siswa_id');
    }

    /**
     * Get the pembayaran details associated with the student
     */
    public function pembayaranDetail()
    {
        return $this->hasMany(PembayaranDetail::class, 'siswa_id', 'siswa_id');
    }
}