<?php

namespace App\Exports;

use App\Models\Siswa;
use App\Models\PembayaranDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromCollection;

class SiswaLunasExport implements FromCollection
{
    use Exportable;
    
    protected $request;
    protected $data;
    protected $kelas;
    protected $spp;


    public function __construct(Request $request = null, $data = null, $kelas = 'Semua', $spp = 'Semua SPP')
    {
        $this->request = $request;
        $this->data = $data;
        $this->kelas = $kelas;
        $this->spp = $spp;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        if ($this->data) {
            return collect($this->data);
        }
        
        return collect([]);
    }
    
    public function toPdf()
    {
        $data = $this->data ?: $this->collection();
        $pdf = \PDF::loadView('admin.laporan.siswa_lunas_pdf', [
            'siswa' => $data,
            'kelas' => $this->kelas,
            'spp' => $this->spp
        ]);
        
        $tempPath = sys_get_temp_dir() . '/laporan-siswa-lunas.pdf';
        
        file_put_contents($tempPath, $pdf->output());
        
        return response()->download($tempPath, 'laporan-siswa-lunas.pdf', [
            'Content-Type' => 'application/pdf',
        ])->deleteFileAfterSend(true);
    }
}
