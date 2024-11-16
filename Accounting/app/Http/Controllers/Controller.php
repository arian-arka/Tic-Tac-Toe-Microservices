<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Request;

class Controller extends BaseController
{
    use AuthorizesRequests, ValidatesRequests;


    protected function badRequestSchema($errorBag, $message = null)
    {
        $message = is_string($message) && mb_strlen($message) ? $message : 'Error';
        $errors = [];
        if ($errorBag instanceof \Illuminate\Support\MessageBag)
            foreach ($errorBag->toArray() as $key => $value)
                $errors[$key] = count($value) ? $value[0] : 'Error';

        else foreach ($errorBag as $key => $value) {
            if (is_array($value))
                $errors[$key] = count($value) ? $value[0] : 'Error';
            else
                $errors[$key] = $value;
        }
        return [
            'message' => $message,
            'errors' => $errors,
            //'data' => env('APP_DEBUG') == 'true' ? Request::all() : null,
            'data' => Request::all()
        ];

    }

    protected function jsonBadRequest($errorBag, $message = null)
    {
        return response()->json($this->badRequestSchema($errorBag, $message), 400);
    }
}
