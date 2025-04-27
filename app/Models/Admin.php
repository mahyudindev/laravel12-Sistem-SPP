<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Pembayaran;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admin';
    protected $primaryKey = 'admin_id';
    protected $fillable = ['user_id', 'nama', 'no_telp', 'alamat'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'admin_id', 'admin_id');
    }
}