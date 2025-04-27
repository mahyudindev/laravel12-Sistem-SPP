<?php

namespace App\Exports;

use App\Models\Siswa;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class SiswaExport implements FromQuery, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $request;

    /**
     * Constructor to pass request parameters
     */
    public function __construct(Request $request = null)
    {
        $this->request = $request;
    }

    /**
     * @return \Illuminate\Database\Query\Builder
     */
    public function query()
    {
        $query = Siswa::query();
        
        // Apply filters if request exists
        if ($this->request) {
            // Filter by search
            if ($this->request->filled('search')) {
                $query->where(function ($q) {
                    $q->where('nama', 'like', '%' . $this->request->search . '%')
                      ->orWhere('nis', 'like', '%' . $this->request->search . '%');
                });
            }
            
            // Filter by kelas
            if ($this->request->filled('kelas') && $this->request->kelas != 'all') {
                $query->where('kelas', $this->request->kelas);
            }
            
            // Filter by status
            if ($this->request->filled('status') && $this->request->status != 'all') {
                $query->where('is_aktif', $this->request->status === 'aktif');
            }
        }
        
        return $query;
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Data Siswa TK';
    }

    /**
     * @var Siswa $siswa
     */
    public function map($siswa): array
    {
        $jenisKelamin = $siswa->jenis_kelamin == 'L' ? 'Laki-laki' : 'Perempuan';
        return [
            $siswa->nis,
            $siswa->nama,
            $jenisKelamin,
            $siswa->kelas,
        ];
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'NIS',
            'Nama',
            'Jenis Kelamin',
            'Kelas',
        ];
    }
    
    /**
     * @param Worksheet $sheet
     */
    public function styles(Worksheet $sheet)
    {
        $lastRow = $sheet->getHighestRow();
        $lastColumn = $sheet->getHighestColumn();
        $range = 'A1:' . $lastColumn . $lastRow;

        // HEADER: Logo, Judul, Alamat, Tahun Ajaran (mirip PDF)
        // Logo tidak bisa inline di Excel, hanya text
        $sheet->insertNewRowBefore(1, 4);
        $sheet->mergeCells('A1:' . $lastColumn . '1');
        $sheet->setCellValue('A1', 'TKIT PARADISE');
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [ 'bold' => true, 'size' => 22 ],
            'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER ],
        ]);
        $sheet->mergeCells('A2:' . $lastColumn . '2');
        $sheet->setCellValue('A2', 'Link. Jl. Sutan Syahrir No.42, Rawa Gondang, Kec. Citangkil, Kota Cilegon, Banten 42414');
        $sheet->getStyle('A2')->applyFromArray([
            'font' => [ 'bold' => true, 'size' => 11 ],
            'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER ],
        ]);
        $sheet->mergeCells('A3:' . $lastColumn . '3');
        $sheet->setCellValue('A3', 'Data Siswa TK Tahun Ajaran ' . date('Y') . '/' . (date('Y') + 1));
        $sheet->getStyle('A3')->applyFromArray([
            'font' => [ 'bold' => true, 'size' => 14 ],
            'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER ],
        ]);
        $sheet->mergeCells('A4:' . $lastColumn . '4');
        $sheet->setCellValue('A4', '');
        $sheet->getRowDimension(4)->setRowHeight(4);

        // HEADER TABEL
        $sheet->getStyle('A5:' . $lastColumn . '5')->applyFromArray([
            'font' => [ 'bold' => true, 'color' => ['rgb' => 'FFFFFF'] ],
            'fill' => [ 'fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4'] ],
            'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER ],
        ]);

        // BORDER & ALIGNMENT TABEL
        $sheet->getStyle('A5:' . $lastColumn . $lastRow)->applyFromArray([
            'borders' => [ 'allBorders' => [ 'borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ],
        ]);
        $sheet->getStyle('A5:' . $lastColumn . $lastRow)->getAlignment()->setWrapText(true);
        $sheet->getStyle('A5:' . $lastColumn . $lastRow)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

        // Auto-size columns
        foreach(range('A', $lastColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return $sheet;
    }
}
