<?php

namespace App\Exports;

use App\Models\Pembayaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;

class PembayaranExport implements FromCollection
{
    use Exportable;
    
    protected $request;
    protected $data;

    /**
     * Constructor to pass request parameters
     */
    public function __construct(Request $request = null, $data = null)
    {
        $this->request = $request;
        $this->data = $data;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        if ($this->data) {
            return collect($this->data);
        }
        
        $query = Pembayaran::with([
            'siswa:siswa_id,nama,nis,kelas', 
            'pembayaranDetail' => function($query) {
                $query->with(['spp:spp_id,nama,nominal', 'ppdb:ppdb_id,nama,nominal']);
            }
        ])
        ->where('status_pembayaran', 'lunas');
        
        if ($this->request) {
            if ($this->request->filled('dari_tanggal')) {
                $query->whereDate('tanggal_bayar', '>=', $this->request->dari_tanggal);
            }
            
            if ($this->request->filled('sampai_tanggal')) {
                $query->whereDate('tanggal_bayar', '<=', $this->request->sampai_tanggal);
            }
        }
        
        $pembayaranRows = $query->latest('tanggal_bayar')->get();
        
        return $pembayaranRows->map(function ($item) {
            $itemPembayaran = [];
            if ($item->pembayaranDetail && $item->pembayaranDetail->count() > 0) {
                foreach ($item->pembayaranDetail as $detail) {
                    if ($detail->spp) {
                        $itemPembayaran[] = $detail->spp->nama;
                    } elseif ($detail->ppdb) {
                        $itemPembayaran[] = $detail->ppdb->nama;
                    } else {
                        $itemPembayaran[] = 'SPP ' . $item->tahun_ajaran;
                    }
                }
            } else {
                $itemPembayaran[] = 'SPP ' . $item->tahun_ajaran; 
            }
            
            return [
                'pembayaran_id' => $item->pembayaran_id,
                'tanggal_bayar' => $item->tanggal_bayar,
                'total_bayar' => $item->total_bayar,
                'tahun_ajaran' => $item->tahun_ajaran,
                'nama_siswa' => $item->siswa ? $item->siswa->nama : 'Tidak diketahui',
                'kelas_siswa' => $item->siswa ? $item->siswa->kelas : '-',
                'nis_siswa' => $item->siswa ? $item->siswa->nis : '-',
                'item_pembayaran' => $itemPembayaran
            ];
        });
    }
    
    /**
     * Export to PDF
     * 
     * @return \Illuminate\Http\Response
     */
    public function toPdf()
    {
        $data = $this->collection();
        $pdf = \PDF::loadView('admin.laporan.pembayaran_pdf', ['pembayaran' => $data]);
        
        $tempPath = sys_get_temp_dir() . '/laporan-pembayaran.pdf';
        

        file_put_contents($tempPath, $pdf->output());
        

        return response()->download($tempPath, 'laporan-pembayaran.pdf', [
            'Content-Type' => 'application/pdf',
        ])->deleteFileAfterSend(true);
    }
}
