<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SiswaController;
use App\Http\Controllers\Admin\SppController;
use App\Http\Controllers\Admin\PpdbController;
use App\Http\Controllers\Admin\PembayaranController as AdminPembayaranController;
use App\Http\Controllers\Siswa\DataSiswaController;
use App\Http\Controllers\Admin\LaporanController;
use App\Http\Controllers\Siswa\DashboardController as SiswaDashboardController;
use App\Http\Controllers\Siswa\PembayaranSiswaController;
use Illuminate\Support\Facades\Auth;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// Routing dashboard utama: redirect sesuai role login
Route::middleware(['auth', 'verified'])->get('dashboard', function () {
    if (Auth::user()->role === 'admin' || Auth::user()->role === 'kepsek') {
        return redirect()->route('admin.dashboard');
    } else {
        return redirect()->route('siswa.dashboard');
    }
})->name('dashboard');

// Grup route untuk ADMIN & KEPSEK
Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::get('users/export-pdf', [UserController::class, 'exportPDF'])->name('admin.users.export-pdf');
    Route::resource('users', UserController::class)->names([
        'index' => 'admin.users.index',
        'create' => 'admin.users.create',
        'store' => 'admin.users.store',
        'edit' => 'admin.users.edit',
        'update' => 'admin.users.update',
        'destroy' => 'admin.users.destroy',
    ]);
    Route::get('siswa/export-pdf', [SiswaController::class, 'exportPDF'])->name('admin.siswa.export-pdf');
    Route::get('siswa/export-excel', [SiswaController::class, 'exportExcel'])->name('admin.siswa.export-excel');
    Route::resource('siswa', SiswaController::class)->names([
        'index' => 'admin.siswa.index',
        'create' => 'admin.siswa.create',
        'store' => 'admin.siswa.store',
        'show' => 'admin.siswa.show',
        'edit' => 'admin.siswa.edit',
        'update' => 'admin.siswa.update',
        'destroy' => 'admin.siswa.destroy',
    ]);
    Route::put('siswa/{siswa}/toggle-status', [SiswaController::class, 'toggleStatus'])->name('admin.siswa.toggle-status');
    Route::resource('spp', SppController::class)->names([
        'index' => 'admin.spp.index',
        'store' => 'admin.spp.store',
        'show' => 'admin.spp.show',
        'update' => 'admin.spp.update',
        'destroy' => 'admin.spp.destroy',
    ]);
    Route::put('spp/{spp}/toggle-status', [SppController::class, 'toggleStatus'])->name('admin.spp.toggle-status');
    Route::resource('ppdb', PpdbController::class)->names([
        'index' => 'admin.ppdb.index',
        'store' => 'admin.ppdb.store',
        'show' => 'admin.ppdb.show',
        'update' => 'admin.ppdb.update',
        'destroy' => 'admin.ppdb.destroy',
    ]);
    Route::put('ppdb/{ppdb}/toggle-status', [PpdbController::class, 'toggleStatus'])->name('admin.ppdb.toggle-status');
    
    // Pembayaran Admin routes
    Route::prefix('pembayaran')->group(function () {
                Route::get('/', [AdminPembayaranController::class, 'index'])->name('admin.pembayaran.index');
                Route::post('/{id}/approve', [AdminPembayaranController::class, 'approve'])->name('admin.pembayaran.approve');
                Route::post('/{id}/reject', [AdminPembayaranController::class, 'reject'])->name('admin.pembayaran.reject');
                Route::post('/{id}/update-status', [AdminPembayaranController::class, 'updateStatus'])->name('admin.pembayaran.update-status');
    });
    
    // Laporan routes
    Route::prefix('laporan')->group(function () {
        Route::get('/pembayaran', [LaporanController::class, 'pembayaran'])->name('admin.laporan.pembayaran');
        Route::get('/siswa-lunas', [LaporanController::class, 'siswaLunas'])->name('admin.laporan.siswa-lunas');
        Route::get('/siswa-menunggak', [LaporanController::class, 'siswaMenunggak'])->name('admin.laporan.siswa-menunggak');
        Route::get('/pembayaran/download-pdf', [LaporanController::class, 'downloadPembayaranPdf'])->name('admin.laporan.pembayaran.download-pdf');
        Route::get('/siswa-lunas/download-pdf', [LaporanController::class, 'downloadSiswaLunasPdf'])->name('admin.laporan.siswa-lunas.download-pdf');
        Route::get('/siswa-menunggak/download-pdf', [LaporanController::class, 'downloadSiswaMenunggakPdf'])->name('admin.laporan.siswa-menunggak.download-pdf');
        Route::post('/siswa-menunggak/send-notification', [LaporanController::class, 'sendWhatsAppNotification'])->name('admin.laporan.send-notification');
    });
});

// Grup route untuk SISWA
Route::middleware(['auth', 'verified', 'siswa'])->prefix('siswa')->name('siswa.')->group(function () {
    Route::get('dashboard', [SiswaDashboardController::class, 'index'])->name('dashboard');

    // Pembayaran routes
    Route::prefix('pembayaran')->name('pembayaran.')->group(function () {
        // Redirect main pembayaran
        Route::get('/', function() {
            return redirect()->route('siswa.pembayaran.create');
        })->name('index');
        Route::get('/create', [PembayaranSiswaController::class, 'create'])->name('create');
        Route::post('/store', [PembayaranSiswaController::class, 'store'])->name('store');
        Route::get('/history', [PembayaranSiswaController::class, 'history'])->name('history');
        Route::get('/{id}', [PembayaranSiswaController::class, 'getDetail'])->name('detail');
    });

    // Data Siswa
    Route::get('data-siswa', [DataSiswaController::class, 'index'])->name('data-siswa.index');
    Route::patch('data-siswa', [DataSiswaController::class, 'update'])->name('data-siswa.update');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
