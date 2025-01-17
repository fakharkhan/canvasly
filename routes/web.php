<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CanvasController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/canvas', [CanvasController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('canvas');

Route::post('/canvas', [CanvasController::class, 'store'])
    ->middleware(['auth', 'verified'])
    ->name('canvas.store');

Route::patch('/canvas/{canvas}', [CanvasController::class, 'update'])
    ->middleware(['auth', 'verified'])
    ->name('canvas.update');

Route::delete('/canvas/{canvas}', [CanvasController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('canvas.destroy');

Route::get('/canvas/{canvas}/editor', [CanvasController::class, 'editor'])->name('canvas.editor');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
