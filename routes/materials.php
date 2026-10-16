<?php

use App\Http\Controllers\Manage\MaterialController as ManageMaterialController;
use App\Http\Controllers\MaterialController;
use Illuminate\Support\Facades\Route;

/*
| Di-load dari routes/admin.php (yang di-require oleh routes/web.php).
*/

// Pustaka materi: semua user login (murid melihat materi terbit; guru/admin untuk pratinjau)
Route::middleware(['auth', 'verified'])->prefix('materials')->name('materials.')->controller(MaterialController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{material}/file', 'file')->whereNumber('material')->name('file');
    Route::get('/{material}/download', 'download')->whereNumber('material')->name('download');
    Route::post('/{material}/progress', 'progress')->whereNumber('material')->name('progress');
});

// Kelola materi: guru & admin (jalur lama) dan tutor pada URL portalnya.
Route::middleware(['auth', 'verified', 'role:teacher,tutor,admin'])
    ->prefix('manage/materials')
    ->name('manage.materials.')
    ->controller(ManageMaterialController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{material}/edit', 'edit')->whereNumber('material')->name('edit');
        Route::put('/{material}', 'update')->whereNumber('material')->name('update'); // dikirim via POST + _method=put (multipart)
        Route::patch('/{material}/publish', 'publish')->whereNumber('material')->name('publish');
        Route::delete('/{material}', 'destroy')->whereNumber('material')->name('destroy');
    });

Route::middleware(['auth', 'verified', 'role:teacher,tutor,admin'])
    ->prefix('tutor/materials')
    ->name('tutor.materials.')
    ->controller(ManageMaterialController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::post('/', 'store')->name('store');
        Route::get('/{material}/edit', 'edit')->whereNumber('material')->name('edit');
        Route::put('/{material}', 'update')->whereNumber('material')->name('update');
        Route::patch('/{material}/publish', 'publish')->whereNumber('material')->name('publish');
        Route::delete('/{material}', 'destroy')->whereNumber('material')->name('destroy');
    });
