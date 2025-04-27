<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Exports\SiswaExport;
use Maatwebsite\Excel\Facades\Excel;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search', '');
        $kelas = $request->input('kelas', 'all');
        $status = $request->input('status', 'all');
        $perPage = $request->input('perPage', 10);

        $query = Siswa::with('user')
            ->when($search, function ($query, $search) {
                return $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('nis', 'like', "%{$search}%");
            })
            ->when($kelas !== 'all', function ($query) use ($kelas) {
                return $query->where('kelas', $kelas);
            })
            ->when($status !== 'all', function ($query) use ($status) {
                return $query->where('is_aktif', $status === 'aktif');
            });

        $siswa = $query->select('siswa_id','nama','nis','kelas','jenis_kelamin','alamat','no_hp','tanggal_lahir','tanggal_masuk','is_aktif','user_id')
            ->orderBy('nama')->paginate($perPage)
            ->withQueryString()
            ->through(fn ($item) => [
                'siswa_id' => $item->siswa_id,
                'nama' => $item->nama,
                'nis' => $item->nis,
                'kelas' => $item->kelas,
                'jenis_kelamin' => $item->jenis_kelamin,
                'alamat' => $item->alamat,
                'no_hp' => $item->no_hp,
                'tanggal_lahir' => $item->tanggal_lahir,
                'tanggal_masuk' => $item->tanggal_masuk,
                'is_aktif' => $item->is_aktif,
                'user_id' => $item->user_id,
                'email' => $item->user ? $item->user->email : null,
            ]);

        $kelasList = Siswa::select('kelas')->distinct()->whereNotNull('kelas')->orderBy('kelas')->pluck('kelas');

        return Inertia::render('Admin/Data/Siswa/Index', [
            'siswa' => $siswa,
            'filters' => [
                'search' => $search,
                'kelas' => $kelas,
                'status' => $status,
            ],
            'kelasList' => $kelasList,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function create()
    {
        $kelasList = ['TK A', 'TK B'];

        return Inertia::render('Admin/Data/Siswa/Create', [
            'kelasList' => $kelasList,
        ]);
    }

    public function store(Request $request)
    {
        $messages = [
            'nama.required' => 'Nama siswa harus diisi',
            'nama.max' => 'Nama siswa maksimal 100 karakter',
            'nis.required' => 'NIS harus diisi',
            'nis.digits' => 'NIS harus terdiri dari 10 digit angka',
            'nis.unique' => 'NIS sudah terdaftar, silakan gunakan NIS lain',
            'kelas.required' => 'Kelas harus diisi',
            'kelas.max' => 'Kelas maksimal 5 karakter',
            'kelas.in' => 'Kelas harus TK A atau TK B',
            'jenis_kelamin.required' => 'Jenis kelamin harus dipilih',
            'jenis_kelamin.in' => 'Jenis kelamin harus L atau P',
            'tanggal_lahir.date' => 'Format tanggal lahir tidak valid',
            'alamat.max' => 'Alamat maksimal 100 karakter',
            'no_hp.digits' => 'Nomor HP harus terdiri dari 13 digit angka',
            'tanggal_masuk.date' => 'Format tanggal masuk tidak valid',
            'email.required' => 'Email harus diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar, silakan gunakan email lain',
            'password.required' => 'Password harus diisi',
            'password.min' => 'Password minimal 3 karakter',
        ];

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:100',
            'nis' => 'required|digits:10|unique:siswa,nis',
            'kelas' => 'required|string|max:5|in:TK A,TK B',
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string|max:100',
            'no_hp' => 'nullable|max:13',
            'tanggal_masuk' => 'nullable|date',
            'is_aktif' => 'boolean',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:3',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            $user = User::create([
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'siswa',
            ]);

            Siswa::create([
                'user_id' => $user->user_id,
                'nama' => $request->nama,
                'nis' => $request->nis,
                'kelas' => $request->kelas,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'alamat' => $request->alamat,
                'no_hp' => $request->no_hp,
                'tanggal_masuk' => $request->tanggal_masuk,
                'is_aktif' => $request->is_aktif ?? true,
            ]);

            DB::commit();

            return redirect()->route('admin.siswa.index')->with('success', 'Data siswa berhasil ditambahkan!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function show(Siswa $siswa)
    {
        $siswa->load('user');

        return Inertia::render('Admin/Data/Siswa/Show', [
            'siswa' => [
                'siswa_id' => $siswa->siswa_id,
                'nama' => $siswa->nama,
                'nis' => $siswa->nis,
                'kelas' => $siswa->kelas,
                'jenis_kelamin' => $siswa->jenis_kelamin,
                'alamat' => $siswa->alamat,
                'no_hp' => $siswa->no_hp,
                'tanggal_lahir' => $siswa->tanggal_lahir,
                'tanggal_masuk' => $siswa->tanggal_masuk,
                'is_aktif' => $siswa->is_aktif,
                'user_id' => $siswa->user_id,
                'email' => $siswa->user ? $siswa->user->email : null,
            ],
        ]);
    }

    public function edit(Siswa $siswa)
    {
        $siswa->load('user');

        $kelasList = ['TK A', 'TK B'];

        return Inertia::render('Admin/Data/Siswa/Edit', [
            'siswa' => [
                'siswa_id' => $siswa->siswa_id,
                'nama' => $siswa->nama,
                'nis' => $siswa->nis,
                'kelas' => $siswa->kelas,
                'jenis_kelamin' => $siswa->jenis_kelamin,
                'alamat' => $siswa->alamat,
                'no_hp' => $siswa->no_hp,
                'tanggal_lahir' => $siswa->tanggal_lahir ? $siswa->tanggal_lahir->format('Y-m-d') : null,
                'tanggal_masuk' => $siswa->tanggal_masuk ? $siswa->tanggal_masuk->format('Y-m-d') : null,
                'is_aktif' => $siswa->is_aktif,
                'user_id' => $siswa->user_id,
                'email' => $siswa->user ? $siswa->user->email : null,
            ],
            'kelasList' => $kelasList,
        ]);
    }

    public function update(Request $request, Siswa $siswa)
    {
        $messages = [
            'nama.required' => 'Nama siswa harus diisi',
            'nama.max' => 'Nama siswa maksimal 100 karakter',
            'nis.required' => 'NIS harus diisi',
            'nis.digits' => 'NIS harus terdiri dari 10 digit angka',
            'nis.unique' => 'NIS sudah terdaftar, silakan gunakan NIS lain',
            'kelas.required' => 'Kelas harus diisi',
            'kelas.max' => 'Kelas maksimal 5 karakter',
            'kelas.in' => 'Kelas harus TK A atau TK B',
            'jenis_kelamin.required' => 'Jenis kelamin harus dipilih',
            'jenis_kelamin.in' => 'Jenis kelamin harus L atau P',
            'tanggal_lahir.date' => 'Format tanggal lahir tidak valid',
            'alamat.max' => 'Alamat maksimal 100 karakter',
            'no_hp.digits' => 'Nomor HP harus terdiri dari 13 digit angka',
            'tanggal_masuk.date' => 'Format tanggal masuk tidak valid',
            'email.required' => 'Email harus diisi',
            'email.email' => 'Format email tidak valid',
            'email.unique' => 'Email sudah terdaftar, silakan gunakan email lain',
            'password.min' => 'Password minimal 3 karakter',
        ];

        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:100',
            'nis' => ['required', 'digits:10', Rule::unique('siswa', 'nis')->ignore($siswa->siswa_id, 'siswa_id')],
            'kelas' => 'required|string|max:5|in:TK A,TK B',
            'jenis_kelamin' => ['required', Rule::in(['L', 'P'])],
            'tanggal_lahir' => 'nullable|date',
            'alamat' => 'nullable|string|max:100',
            'no_hp' => 'nullable|max:13',
            'tanggal_masuk' => 'nullable|date',
            'is_aktif' => 'boolean',
            'email' => ['required', 'email', Rule::unique('users', 'email')->ignore($siswa->user_id, 'user_id')],
            'password' => 'nullable|min:3',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            if ($siswa->user) {
                $userData = [
                    'email' => $request->email,
                ];

                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }

                $siswa->user->update($userData);
            }

            $siswa->update([
                'nama' => $request->nama,
                'nis' => $request->nis,
                'kelas' => $request->kelas,
                'jenis_kelamin' => $request->jenis_kelamin,
                'tanggal_lahir' => $request->tanggal_lahir,
                'alamat' => $request->alamat,
                'no_hp' => $request->no_hp,
                'tanggal_masuk' => $request->tanggal_masuk,
                'is_aktif' => $request->is_aktif ?? $siswa->is_aktif,
            ]);

            DB::commit();

            return redirect()->route('admin.siswa.index')->with('success', 'Data siswa berhasil diperbarui!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Siswa $siswa)
    {
        try {
            DB::beginTransaction();

            if ($siswa->user) {
                $siswa->user->delete();
            }

            $siswa->delete();

            DB::commit();

            return redirect()->route('admin.siswa.index')->with('success', 'Data siswa berhasil dihapus!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function exportPDF(Request $request)
    {
        $query = Siswa::with('user');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->search . '%')
                  ->orWhere('nis', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->filled('kelas') && $request->kelas != 'all') {
            $query->where('kelas', $request->kelas);
        }

        if ($request->filled('status') && $request->status != 'all') {
            $query->where('is_aktif', $request->status === 'aktif');
        }

        $siswa = $query->select('siswa_id','nama','nis','kelas','jenis_kelamin','user_id')->with('user')->get();

        $pdf = Pdf::loadView('exports.siswa', [
            'siswa' => $siswa
        ]);

        return $pdf->download('data-siswa-' . date('Y-m-d') . '.pdf');
    }

    public function exportExcel(Request $request)
    {
        return Excel::download(new SiswaExport($request), 'data-siswa-' . date('Y-m-d') . '.xlsx');
    }

    public function toggleStatus(Siswa $siswa)
    {
        try {
            $siswa->update([
                'is_aktif' => !$siswa->is_aktif,
            ]);

            return back()->with('success', 'Status siswa berhasil diubah!');
        } catch (\Exception $e) {
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }
}
