<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Spp;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SppController extends Controller
{
    public function index(Request $request)
    {
        $query = Spp::query();
        
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

        $spp = $query->with('pembayaranDetail')
            ->orderByRaw(
                "FIELD(nama, 'SPP - Januari', 'SPP - Februari', 'SPP - Maret', 'SPP - April', 'SPP - Mei', 'SPP - Juni', 'SPP - Juli', 'SPP - Agustus', 'SPP - September', 'SPP - Oktober', 'SPP - November', 'SPP - Desember')"
            )
            ->paginate(10)
            ->withQueryString()
            ->through(function ($item) {
                return [
                    'spp_id' => $item->spp_id,
                    'nama' => $item->nama,
                    'tahun_ajaran' => $item->tahun_ajaran,
                    'nominal' => $item->nominal,
                    'is_aktif' => $item->is_aktif,
                    'created_at' => $item->created_at,
                ];
            });

        return Inertia::render('Admin/Data/Spp/Index', [
            'spp' => $spp,
            'filters' => $request->only(['search', 'status', 'tahun_ajaran']),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:25',
            'tahun_ajaran' => 'required|string|max:10',
            'nominal' => 'required|numeric|min:0',
            'is_aktif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        Spp::create([
            'nama' => 'SPP - ' . $request->nama,
            'tahun_ajaran' => $request->tahun_ajaran,
            'nominal' => $request->nominal,
            'is_aktif' => $request->is_aktif ?? true,
        ]);

        return redirect()->route('admin.spp.index')->with('success', 'Data SPP berhasil ditambahkan');
    }

    public function show($id)
    {
        $spp = Spp::with('pembayaranDetail')->findOrFail($id);
        return [
            'spp_id' => $spp->spp_id,
            'nama' => $spp->nama,
            'tahun_ajaran' => $spp->tahun_ajaran,
            'nominal' => $spp->nominal,
            'is_aktif' => $spp->is_aktif,
            'created_at' => $spp->created_at,
        ];
    }

    public function update(Request $request, $id)
    {
        $spp = Spp::with('pembayaranDetail')->findOrFail($id);
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:25',
            'tahun_ajaran' => 'required|string|max:10',
            'nominal' => 'required|numeric|min:0',
            'is_aktif' => 'boolean',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $spp->update([
            'nama' => strpos($request->nama, 'SPP - ') === 0 ? $request->nama : 'SPP - ' . $request->nama,
            'tahun_ajaran' => $request->tahun_ajaran,
            'nominal' => $request->nominal,
            'is_aktif' => $request->is_aktif ?? $spp->is_aktif,
        ]);

        return redirect()->route('admin.spp.index')->with('success', 'Data SPP berhasil diperbarui');
    }

    public function destroy($id)
    {
        $spp = Spp::with('pembayaranDetail')->findOrFail($id);
        if ($spp->pembayaranDetail->count() > 0) {
            return back()->with('error', 'SPP tidak dapat dihapus karena masih digunakan dalam data pembayaran');
        }
        $spp->delete();
        return back()->with('success', 'Data SPP berhasil dihapus');
    }

    public function toggleStatus($id)
    {
        $spp = Spp::with('pembayaranDetail')->findOrFail($id);
        $spp->is_aktif = !$spp->is_aktif;
        $spp->save();
        return back()->with('success', 'Status SPP berhasil diperbarui');
    }
}
