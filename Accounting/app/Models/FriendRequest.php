<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class FriendRequest extends Authenticatable
{
    protected $table = 'friend_requests';
    use HasFactory, Notifiable;
    protected $fillable = [
        'user_id_src',
        'user_id_dst',
    ];

    public function accept(){
        Friend::create([
            'user_id_src' => $this->user_id_src,
            'user_id_dst' => $this->user_id_dst,
        ]);
        $this->delete();
    }

    public function decline(){
        $this->delete();
    }



}
