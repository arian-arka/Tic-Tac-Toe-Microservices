<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Friend extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'user_id_src',
        'user_id_dst',
    ];
    protected $casts = [
        'accepted' => 'integer',
    ];

}
