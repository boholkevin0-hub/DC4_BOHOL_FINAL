<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DocumentRequestController;
use App\Http\Controllers\Api\DocumentTypeController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/dashboard', DashboardController::class);
    Route::patch('/document-requests/{document_request}/status', [DocumentRequestController::class, 'updateStatus'])
        ->middleware('role:admin');
    Route::apiResource('document-requests', DocumentRequestController::class);
    Route::apiResource('document-types', DocumentTypeController::class);
});
