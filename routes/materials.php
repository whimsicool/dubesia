<?php

use App\Http\Controllers\Manage\MaterialController as ManageMaterialController;
use App\Http\Controllers\MaterialController;
use Illuminate\Support\Facades\Route;

/*
| Di-load dari routes/admin.php (yang di-require oleh routes/web.php).
*/

// Pustaka materi hanya untuk murid.
Route::middleware(['auth', 'verified', 'role:student'])->prefix('materials')->name('materials.')->controller(MaterialController::class)->group(function () {
    Route::get('/', 'index')->name('index');
    Route::get('/{material}/file', 'file')->whereNumber('material')->name('file');
    Route::get('/{material}/download', 'download')->whereNumber('material')->name('download');
    Route::post('/{material}/progress', 'progress')->whereNumber('material')->name('progress');
});

// Tutor mengelola materi melalui portal tutor.
Route::middleware(['auth', 'verified', 'role:tutor'])
    ->prefix('tutor/materials')
    ->name('tutor.materials.')
    ->controller(ManageMaterialController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/create', 'create')->name('create');
        Route::get('/{material}/preview', 'preview')->whereNumber('material')->name('preview');
        Route::get('/{material}/file', 'file')->whereNumber('material')->name('file');
        Route::get('/{material}/download', 'download')->whereNumber('material')->name('download');
        Route::post('/', 'store')->name('store');
        Route::get('/{material}/edit', 'edit')->whereNumber('material')->name('edit');
        Route::put('/{material}', 'update')->whereNumber('material')->name('update');
        Route::patch('/{material}/publish', 'publish')->whereNumber('material')->name('publish');
        Route::delete('/{material}', 'destroy')->whereNumber('material')->name('destroy');
    });
