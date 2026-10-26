<?php

use App\Http\Controllers\Admin\ScheduleController;
use Illuminate\Support\Facades\Route;

/*
| Semua route di sini hanya untuk role "admin".
| Di-load dari routes/web.php:  require __DIR__.'/admin.php';
*/
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::prefix('schedules')->name('schedules.')->controller(ScheduleController::class)->group(function () {
            Route::get('/', 'index')->name('index');
            Route::get('/export', 'export')->name('export');
            Route::post('/', 'store')->name('store');
            Route::post('/check-conflict', 'checkConflict')->name('check-conflict');
            Route::put('/{schedule}', 'update')->whereNumber('schedule')->name('update');
            Route::delete('/{schedule}', 'destroy')->whereNumber('schedule')->name('destroy');
        });
    });

// Fitur materi belajar (guru: kelola, semua user: pustaka)
require __DIR__.'/materials.php';

// Fitur pengelolaan kelas belajar.
require __DIR__.'/classes.php';

// Fitur kelola ruangan (admin).
require __DIR__.'/rooms.php';
