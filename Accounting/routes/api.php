<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/random', [\App\Http\Controllers\UserController::class, 'randomUser']);
    Route::get('/logout', [\App\Http\Controllers\UserController::class, 'logout']);
    Route::put('/profile', [\App\Http\Controllers\UserController::class, 'updateProfile']);
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
    Route::prefix('/friend')->group(function () {
        Route::post('/request/{user}', [\App\Http\Controllers\UserController::class, 'requestFriend']);
        Route::post('/request/{friendRequest}/{status}', [\App\Http\Controllers\UserController::class, 'acceptRequest']);

        Route::delete('/remove/{friend}', [\App\Http\Controllers\UserController::class, 'removeFriend']);
        Route::get('/list/requests', [\App\Http\Controllers\UserController::class, 'listFriendRequests']);
        Route::get('/list', [\App\Http\Controllers\UserController::class, 'listFriends']);
        Route::get('/requests', [\App\Http\Controllers\UserController::class, 'listFriendRequests']);
        Route::get('/with', [\App\Http\Controllers\UserController::class, 'areFriends']);
        Route::post('/find', [\App\Http\Controllers\UserController::class, 'findFriend']);

    });
});

Route::get('/test', function (Illuminate\Http\Request $request) {
    return response()->json([
        $request->getHost(),
        $request->header(),
        parse_url($request->header('origin'), PHP_URL_HOST),
    ]);
});

Route::post('/register', [\App\Http\Controllers\UserController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\UserController::class, 'login']);
Route::get('/user/{user}', [\App\Http\Controllers\UserController::class, 'publicProfile']);

