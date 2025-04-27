<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ppdb extends Model
{
    use HasFactory;

    protected $table = 'ppdb';
    protected $primaryKey = 'ppdb_id';
    
    protected $fillable = [
        'nama',
        'tahun_ajaran',
        'nominal',
        'is_aktif',
        'kelas',
    ];

    protected $casts = [
        'nominal' => 'decimal:2',
        'is_aktif' => 'boolean',
    ];
}
