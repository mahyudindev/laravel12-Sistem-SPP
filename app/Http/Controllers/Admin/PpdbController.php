<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Ppdb;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PpdbController extends Controller
{
    public function index(Request $request)
    {
        $query = Ppdb::query();
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('nama', 'like', "%{$searchTerm}%")
                  ->orWhere('tahun_ajaran', 'like', "%{$searchTerm}%");
            });
        }
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status === 'active' ? 1 : 0;
            $query->where('is_aktif', $status);
        }
        if ($request->has('tahun_ajaran') && $request->tahun_ajaran !== 'all') {
            $query->where('tahun_ajaran', $request->tahun_ajaran);
        }
        if ($request->has('kelas') && $request->kelas !== 'all') {
            $query->where('kelas', $request->kelas);
        }
        $ppdb = $query->orderBy('created_at', 'desc')
        ->paginate(10)
        ->withQueryString()
        ->through(function ($item) {
            return [
                'ppdb_id' => $item->ppdb_id,
                'nama' => $item->nama,
                'tahun_ajaran' => $item->tahun_ajaran,
                'nominal' => $item->nominal,
                'is_aktif' => $item->is_aktif,
                'kelas' => $item->kelas,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });
        
        $kelasList = Ppdb::select('kelas')->distinct()->whereNotNull('kelas')->orderBy('kelas')->pluck('kelas');

        return Inertia::render('Admin/Data/Ppdb/Index', [
            'ppdb' => $ppdb,
            'filters' => $request->only(['search', 'status', 'tahun_ajaran', 'kelas']),
            'kelasList' => $kelasList,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:50',
            'tahun_ajaran' => 'required|string|max:10',
            'nominal' => 'required|numeric|min:0',
            'is_aktif' => 'boolean',
            'kelas' => 'nullable|string|max:10|in:TK A,TK B,'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        try {
            Ppdb::create([
                'nama' => 'PPDB - ' . $request->nama,
                'tahun_ajaran' => $request->tahun_ajaran,
                'nominal' => $request->nominal,
                'is_aktif' => $request->is_aktif ?? false,
                'kelas' => $request->kelas,
            ]);
            return redirect()->route('admin.ppdb.index')->with('success', 'Data PPDB berhasil ditambahkan');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menambahkan data PPDB: ' . $e->getMessage())->withInput();
        }
    }

    public function update(Request $request, Ppdb $ppdb)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:50',
            'tahun_ajaran' => 'required|string|max:10',
            'nominal' => 'required|numeric|min:0',
            'is_aktif' => 'boolean',
            'kelas' => 'nullable|string|max:10|in:TK A,TK B,'
        ]);
        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }
        try {
            $ppdb->update([
                'nama' => strpos($request->nama, 'PPDB - ') === 0 ? $request->nama : 'PPDB - ' . $request->nama,
                'tahun_ajaran' => $request->tahun_ajaran,
                'nominal' => $request->nominal,
                'is_aktif' => $request->is_aktif ?? false,
                'kelas' => $request->kelas,
            ]);
            return redirect()->route('admin.ppdb.index')->with('success', 'Data PPDB berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui data PPDB: ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Ppdb $ppdb)
    {
        try {
            $ppdb->delete();
            return redirect()->route('admin.ppdb.index')->with('success', 'Data PPDB berhasil dihapus');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal menghapus data PPDB: ' . $e->getMessage());
        }
    }
}
