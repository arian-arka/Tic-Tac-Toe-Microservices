<?php

namespace App\Http\Controllers;

use App\Class\Upload;
use App\Models\Friend;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    const IMAGE_VALIDATION = 'file|mimes:jpg,png,jpeg,svg|max:5000';

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:300',
            'username' => 'required|string|max:300|unique:users,username',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|min:8|max:64',
            'avatar' => 'required|' . UserController::IMAGE_VALIDATION,
        ]);

        if ($validator->stopOnFirstFailure()->fails())
            return $this->jsonBadRequest($validator->errors());

        $upload = Upload::instance(public_path('users/avatars'))
            ->nameGenerator(function ($name, $ext) {
                return '_' . time() . Str::random(4) . '.' . $ext;
            })
            ->make('avatar');

        if ($upload['hasError'])
            return $this->jsonBadRequest($upload['errors']);

        $user = User::create([
            'name' => $validator->validated()['name'],
            'email' => $validator->validated()['email'],
            'username' => $validator->validated()['username'],
            'password' => Hash::make($validator->validated()['password']),
            'avatar' => $upload['file']['name'],
        ]);

        return response()->json($user);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:300',
            'username' => [
                'required', 'username',
                Rule::unique('users', 'username')->ignore($user->id)
            ],
            'oldPassword' => 'required|min:8|max:64',
            'newPassword' => 'nullable|min:8|max:64',
            'avatar' => 'nullable|' . UserController::IMAGE_VALIDATION
        ]);
        if ($validator->stopOnFirstFailure()->fails())
            return $this->jsonBadRequest($validator->errors());

        if (!Hash::check($validator->validated()['oldPassword'], $user->password))
            return $this->jsonBadRequest(['oldPassword' => 'Invalid password.']);

        $newPassword = $validator->validated()['newPassword'];


        $upload = Upload::instance(public_path('users/avatars'))
            ->nameGenerator(function ($name, $ext) {
                return '_' . time() . Str::random(4) . '.' . $ext;
            })
            ->make('avatar');


        if ($upload['hasError'])
            return $this->jsonBadRequest($upload['errors']);

        $data = [
            'name' => $validator->validated()['name'],
            'username' => $validator->validated()['username'],
            'password' => $newPassword ? Hash::make($newPassword) : $user->password,
        ];
        if (!$upload['empty']) {
            File::delete(public_path('users/avatars/' . $user->avatar));
            $data['avatar'] = $upload['file']['name'];
        }

        $user->update($data);

        return $user;
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->post(), [
            'username' => 'required|string',
            'password' => 'required|min:8|max:64',
        ]);

        if ($validator->stopOnFirstFailure()->fails())
            return $this->jsonBadRequest($validator->errors());

        if (User::query()->where('email', $validator->validated()['username'])->exists())
            $user = User::where('email', $validator->validated()['username'])->first();
        else
            $user = User::where('username', $validator->validated()['username'])->first();

        if ($user == null)
            return $this->jsonBadRequest(['username' => 'Username not found.']);

        if (!Hash::check($validator->validated()['password'], $user->password))
            return $this->jsonBadRequest(['password' => 'Invalid credential.']);

        $user->tokens()->delete();

        return response()->json([
            'token' => $user->createToken('login')->plainTextToken,
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user->tokens()->delete();
        return response()->json([]);
    }

    public function requestFriend(User $user, Request $request)
    {
        if ($user->areFriends($request->user()->id))
            return $this->jsonBadRequest([], 'Already friends.');
        FriendRequest::create([
            'user_id_src' => $request->user()->id,
            'user_id_dst' => $user->id,
        ]);
        return response()->json([]);
    }

    public function acceptRequest(FriendRequest $friendRequest, string $status, Request $request)
    {
        if ($friendRequest->user_id_dst != $request->user()->id)
            abort(404);
        if ($status === 'accept')
            $friendRequest->accept();
        else if ($status === 'decline')
            $friendRequest->decline();
        else
            abort(404);
        return response()->json([]);
    }

    public function removeFriend(Friend $friend, Request $request)
    {
        $user = $request->user();
        if ($friend->user_id_src != $user->id && $friend->user_id_dst != $user->id)
            return response()->json([],404);
        $friend->delete();
        return response()->json([]);
    }

    public function listFriends(Request $request)
    {
        return response()->json($request->user()->friends());
    }

    public function areFriends(User $user, Request $request)
    {
        return response()->json([
            'friend' => $user->areFriends($request->user()->id),
        ]);
    }

    public function publicProfile(User $user)
    {
        return response()->json($user);
    }

    public function findFriend(Request $request)
    {
        $validator = Validator::make($request->post(), [
            'username' => 'required|string',
        ]);

        if ($validator->stopOnFirstFailure()->fails())
            return $this->jsonBadRequest($validator->errors());

        $user = User::where('username', $validator->validated()['username'])->first();
        if (!$user)
            return response()->json(null);
        $user->areFriends = $user->areFriends($request->user()->id);

        $user->hasFriendRequest = $user->hasRequest($request->user()->id);

        return response()->json($user);
    }

    public function listFriendRequests(Request $request){
        return $request->user()->requests();
    }

    public function randomUser(Request $request){
        $user = User::query()->inRandomOrder()->whereNot('id',$request->user()->id)->first();
        $user->areFriends = $user->areFriends($request->user()->id);
        return response()->json($user);
    }
}
