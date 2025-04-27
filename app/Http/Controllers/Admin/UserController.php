<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Siswa;
use App\Models\Admin as AdminModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['siswa', 'admin']);
        
        if ($request->has('role') && $request->role != 'all') {
            $query->where('role', $request->role);
        }

        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->whereHas('siswa', function($q) use ($request) {
                    $q->where('nama', 'like', '%' . $request->search . '%');
                })->orWhereHas('admin', function($q) use ($request) {
                    $q->where('nama', 'like', '%' . $request->search . '%');
                });
            });
        }

        if ($request->role === 'siswa' || !$request->has('role')) {
            $query->where(function($q) {
                $q->where('role', '!=', 'siswa')
                    ->orWhereHas('siswa', function($q) {
                        $q->where('is_aktif', true);
                    });
            });
        }
        
        $users = $query->paginate(10)->withQueryString();
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $request->only(['role', 'search']),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $kelasList = ['TK A', 'TK B'];
        
        return Inertia::render('Admin/Users/Create', [
            'kelasList' => $kelasList
        ]);
    }

    public function store(Request $request)
    {
        $messages = [
            'email.required' => 'Email tidak boleh kosong',
            'email.email' => 'Format email tidak valid',
            'email.max' => 'Email maksimal 255 karakter',
            'email.unique' => 'Email sudah digunakan',
            'password.required' => 'Password tidak boleh kosong',
            'password.min' => 'Password minimal 3 karakter',
            'role.required' => 'Role harus dipilih',
            'role.in' => 'Role tidak valid',
            'nama.required' => 'Nama tidak boleh kosong',
            'nama.string' => 'Nama harus berupa teks',
            'nama.max' => 'Nama maksimal 255 karakter',
            'nis.required' => 'NIS tidak boleh kosong',
            'nis.string' => 'NIS harus berupa teks',
            'nis.max' => 'NIS maksimal 20 karakter',
            'nis.unique' => 'NIS sudah digunakan',
            'kelas.required' => 'Kelas tidak boleh kosong',
            'kelas.string' => 'Kelas harus berupa teks',
            'kelas.max' => 'Kelas maksimal 10 karakter',
            'kelas.in' => 'Kelas harus TK A atau TK B',
            'tanggal_masuk.required' => 'Tanggal masuk tidak boleh kosong',
            'tanggal_masuk.date' => 'Format tanggal masuk tidak valid',
        ];

        $rules = [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:3'],
            'role' => ['required', 'in:admin,kepsek,siswa'],
            'nama' => ['required', 'string', 'max:255'],
        ];

        if ($request->role === 'siswa') {
            $rules['nis'] = ['required', 'string', 'max:20', 'unique:siswa,nis'];
            $rules['kelas'] = ['required', 'string', 'max:10', 'in:TK A,TK B'];
            $rules['tanggal_masuk'] = ['required', 'date'];
        }

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        if ($request->role === 'siswa') {
            Siswa::create([
                'user_id' => $user->user_id,
                'nama' => $request->nama,
                'nis' => $request->nis,
                'kelas' => $request->kelas,
                'tanggal_masuk' => $request->tanggal_masuk,
                'is_aktif' => true,
            ]);
        } else {
            AdminModel::create([
                'user_id' => $user->user_id,
                'nama' => $request->nama,
                'no_telp' => $request->no_telp ?? null,
                'alamat' => $request->alamat ?? null,
            ]);
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Akun berhasil ditambahkan!');
    }

    public function edit(User $user)
    {
        $user->load(['siswa', 'admin']);
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        try {
        $messages = [
            'email.required' => 'Email tidak boleh kosong',
            'email.email' => 'Format email tidak valid',
            'email.max' => 'Email maksimal 255 karakter',
            'email.unique' => 'Email sudah digunakan',
            'password.min' => 'Password minimal 3 karakter',
            'role.required' => 'Role harus dipilih',
            'role.in' => 'Role tidak valid',
            'nama.required' => 'Nama tidak boleh kosong',
            'nama.string' => 'Nama harus berupa teks',
            'nama.max' => 'Nama maksimal 255 karakter',
            'no_telp.max' => 'Nomor telepon maksimal 15 karakter',
            'nis.required' => 'NIS tidak boleh kosong',
            'nis.string' => 'NIS harus berupa teks',
            'nis.max' => 'NIS maksimal 20 karakter',
            'nis.unique' => 'NIS sudah digunakan',
            'kelas.required' => 'Kelas tidak boleh kosong',
            'kelas.string' => 'Kelas harus berupa teks',
            'kelas.max' => 'Kelas maksimal 10 karakter',
            'kelas.in' => 'Kelas harus TK A atau TK B',
        ];

        $rules = [
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->user_id, 'user_id')],
            'password' => ['nullable', 'string', 'min:3'],
            'role' => ['required', 'in:admin,kepsek,siswa'],
            'nama' => ['required', 'string', 'max:255'],
            'no_telp' => ['nullable', 'string', 'max:15'],
        ];

        if ($request->role === 'siswa') {
            $rules['nis'] = ['required', 'string', 'max:20', Rule::unique('siswa', 'nis')->ignore($user->siswa->siswa_id ?? null, 'siswa_id')];
            $rules['kelas'] = ['required', 'string', 'max:10', 'in:TK A,TK B'];
        }

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $user->email = $request->email;
        $user->role = $request->role;
        $user->save();

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        if ($request->role === 'siswa') {
            if ($user->siswa) {
                $user->siswa->update([
                    'nama' => $request->nama,
                    'nis' => $request->nis,
                    'kelas' => $request->kelas,
                ]);
            } else {
                Siswa::create([
                    'user_id' => $user->user_id,
                    'nama' => $request->nama,
                    'nis' => $request->nis,
                    'kelas' => $request->kelas,
                    'is_aktif' => true,
                ]);
                
                if ($user->admin) {
                    $user->admin->delete();
                }
            }
        } else {
            if ($user->admin) {
                $user->admin->update([
                    'nama' => $request->nama,
                    'no_telp' => $request->no_telp ?? null,
                    'alamat' => $request->alamat ?? null,
                ]);
            } else {
                AdminModel::create([
                    'user_id' => $user->user_id,
                    'nama' => $request->nama,
                    'no_telp' => $request->no_telp ?? null,
                    'alamat' => $request->alamat ?? null,
                ]);
                
                if ($user->siswa) {
                    $user->siswa->delete();
                }
            }
        }

        return redirect()->route('admin.users.index')
            ->with('success', 'Akun berhasil diperbarui!');
        } catch (\Exception $e) {
            \Log::error($e);
            return redirect()->route('admin.users.index')
                ->with('error', $e->getMessage());
        }
    }

    public function exportPDF()
    {
        $users = User::with(['siswa'])
            ->where('role', 'siswa')
            ->get();
        $pdf = app('dompdf.wrapper');
        $pdf->loadView('exports.users', compact('users'));
        return $pdf->download('data-akun-' . date('Y-m-d') . '.pdf');
    }

    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('admin.users.index')
            ->with('success', 'Akun berhasil dihapus!');
    }
}
