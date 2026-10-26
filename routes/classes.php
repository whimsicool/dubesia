<?php

use App\Http\Controllers\Admin\ClassGroupController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin/classes')
    ->name('admin.classes.')
    ->controller(ClassGroupController::class)
    ->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{classGroup}', 'show')->whereNumber('classGroup')->name('show');
        Route::put('/{classGroup}', 'update')->whereNumber('classGroup')->name('update');
        Route::patch('/{classGroup}/status', 'toggleActive')->whereNumber('classGroup')->name('status');
        Route::delete('/{classGroup}', 'destroy')->whereNumber('classGroup')->name('destroy');
        Route::get('/{classGroup}/students', 'students')->whereNumber('classGroup')->name('students');
        Route::post('/{classGroup}/students', 'syncStudent')->whereNumber('classGroup')->name('students.sync');
    });