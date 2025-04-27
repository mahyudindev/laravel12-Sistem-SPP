<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!$request->user()) {
            return redirect('/login');
        }

        // Jika pengguna memiliki salah satu role yang diizinkan
        if (in_array($request->user()->role, $roles)) {
            return $next($request);
        }

        // Redirect berdasarkan role pengguna jika mencoba mengakses halaman yang tidak sesuai
        if ($request->user()->role === 'siswa') {
            return redirect('/siswa/dashboard');
        } elseif (in_array($request->user()->role, ['admin', 'kepsek'])) {
            return redirect('/admin/dashboard');
        }

        // Fallback jika role tidak dikenali
        return abort(403, 'Unauthorized action.');
    }
}
