<?php

use App\Middleware\PermissionConstant;
use Illuminate\Support\Facades\Route;

Route::any("*", function () {
    return response()->json('not found', 404);
});
