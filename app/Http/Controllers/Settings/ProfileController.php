<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        

        $user->email = $validated['email'];
        $user->save();
        

        if ($user->role === 'siswa' && $user->siswa) {

            $siswaData = [
                'nama' => $validated['nama']
            ];
            

            if (isset($validated['no_hp'])) $siswaData['no_hp'] = $validated['no_hp'];
            
            $user->siswa()->update($siswaData);
        } elseif (($user->role === 'admin' || $user->role === 'kepsek') && $user->admin) {

            $adminData = [
                'nama' => $validated['nama']
            ];
            

            if (isset($validated['no_telp'])) $adminData['no_telp'] = $validated['no_telp'];
            if (isset($validated['alamat'])) $adminData['alamat'] = $validated['alamat'];
            
            $user->admin()->update($adminData);
        }

        return to_route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
