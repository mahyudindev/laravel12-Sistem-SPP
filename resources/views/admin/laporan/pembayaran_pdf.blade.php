<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Pembayaran Lunas</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        h1 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 20px;
        }
        .status-lunas {
            color: green;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div style="margin-bottom: 24px;">
        <table width="100%" style="border: none;">
            <tr>
                <td width="110" style="border: none; text-align: left; vertical-align: top; padding-right: 10px;">
                    <img src="{{ public_path('image/logo.png') }}" alt="Logo Sekolah" style="height:85px;">
                </td>
                <td style="border: none; text-align: center; vertical-align: middle;">
                    <div style="font-size: 34px; font-weight: bold; letter-spacing: 2px; margin-bottom: 2px;">SISTEM PEMBAYARAN SPP</div>
                    <div style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">
                        Jl. Raya Serang KM. 10, Kota Serang, Banten 42111
                    </div>
                    <div style="font-size: 18px; font-weight: bold; margin-top: 12px;">Laporan Pembayaran Lunas</div>
                    <div style="font-size: 14px; margin-top: 4px;">
                        Periode: {{ request('dari_tanggal') ? \Carbon\Carbon::parse(request('dari_tanggal'))->format('d/m/Y') : 'Semua' }} 
                        - {{ request('sampai_tanggal') ? \Carbon\Carbon::parse(request('sampai_tanggal'))->format('d/m/Y') : 'Semua' }}
                    </div>
                </td>
            </tr>
        </table>
        <hr style="border: 1.8px solid #222; margin: 16px 0 0 0;">
    </div>

    <table style="margin-top: 16px;">
        <thead>
            <tr>
                <th style="width: 40px;">No</th>
                <th>Tanggal</th>
                <th>Siswa</th>
                <th>Kelas</th>
                <th>Item Pembayaran</th>
                <th>Total</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($pembayaran as $index => $p)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ \Carbon\Carbon::parse($p['tanggal_bayar'])->format('d/m/Y') }}</td>
                <td>{{ $p['nama_siswa'] }}</td>
                <td style="text-align: center;">{{ $p['kelas_siswa'] }}</td>
                <td>
                    @if(!empty($p['item_pembayaran']))
                        @foreach($p['item_pembayaran'] as $item)
                            {{ $item }}<br>
                        @endforeach
                    @else
                        -
                    @endif
                </td>
                <td>Rp {{ number_format($p['total_bayar'], 0, ',', '.') }}</td>
                <td class="status-lunas" style="text-align: center;">Lunas</td>
            </tr>
            @empty
            <tr>
                <td colspan="7" style="text-align: center;">Tidak ada data pembayaran</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 30px;">
        <table width="100%" style="border: none;">
            <tr>
                <td style="border: none; width: 40%;">
                    <p><strong>Total Pembayaran:</strong> {{ $pembayaran->count() }}</p>
                    <p><strong>Total Nominal:</strong> Rp {{ number_format($pembayaran->sum('total_bayar'), 0, ',', '.') }}</p>
                </td>
                <td style="border: none; width: 30%; text-align: center;">
                    <p>Mengetahui,</p>
                    <br>
                    <br>
                    <br>
                    <p>_______________________</p>
                    <p>Kepala Sekolah</p>
                </td>
                <td style="border: none; text-align: center; width: 30%;">
                    <p>{{ \Carbon\Carbon::now()->format('d F Y') }}</p>
                    <br>
                    <br>
                    <br>
                    <p>_______________________</p>
                    <p>Admin</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
