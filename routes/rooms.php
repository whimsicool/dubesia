<?php

use App\Http\Controllers\Admin\RoomController;
use Illuminate\Support\Facades\Route;

/*
| Kelola Ruang / Platform (admin). Di-load dari routes/admin.php.
| Menu: Data Akademik → Kelola Ruang
*/
Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin/rooms')
    ->name('admin.rooms.')
    ->controller(RoomController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{room}', 'show')->whereNumber('room')->name('show');
        Route::put('/{room}', 'update')->whereNumber('room')->name('update');
        Route::patch('/{room}/status', 'toggleActive')->whereNumber('room')->name('status');
        Route::delete('/{room}', 'destroy')->whereNumber('room')->name('destroy');
        Route::get('/{room}/schedules', 'schedules')->whereNumber('room')->name('schedules');
    });
