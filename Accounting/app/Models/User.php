<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'avatar',
        'name',
        'username',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];


    protected $appends = ['avatar_url'];

    protected function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn(string|null $value) => !$this->avatar ? null : asset('users/avatars/' . $this->avatar)
        );
    }

    public function get2Friends($friend_id)
    {
        return Friend::query()
            ->orWhere(function (Builder $query) use ($friend_id) {
                $query->where('user_id_src', $friend_id)->where('user_id_dst', $this->id);
            })->orWhere(function (Builder $query) use ($friend_id) {
                $query->where('user_id_src', $this->id)->where('user_id_dst', $friend_id);
            })->first();
    }

    public function areFriends($friend_id)
    {
        return Friend::query()
            ->orWhere(function (Builder $query) use ($friend_id) {
                $query->where('user_id_src', $friend_id)->where('user_id_dst', $this->id);
            })->orWhere(function (Builder $query) use ($friend_id) {
                $query->where('user_id_src', $this->id)->where('user_id_dst', $friend_id);
            })->exists();
    }

    public function friends()
    {
        $all = Friend::query()
            ->orWhere(function (Builder $query) {
                $query->where('user_id_dst', $this->id);
            })->orWhere(function (Builder $query) {
                $query->where('user_id_src', $this->id);
            })->get();
        foreach ($all as $f)
            $f->user = User::find($f->user_id_dst == $this->id ? $f->user_id_src : $f->user_id_dst);

        return $all;
    }

    public function requests()
    {
        return User::query()
            ->join('friend_requests', 'friend_requests.user_id_src', '=', 'users.id')
            ->where('friend_requests.user_id_dst', $this->id)
            ->get();
    }

    public function hasRequest($src_id){
        return FriendRequest::where('user_id_src',$src_id)
            ->where('user_id_dst',$this->id)->exists();
    }
}
