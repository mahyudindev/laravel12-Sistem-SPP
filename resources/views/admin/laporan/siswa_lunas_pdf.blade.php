<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Siswa Sudah Bayar</title>
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
                    <div style="font-size: 18px; font-weight: bold; margin-top: 12px;">Laporan Siswa Sudah Bayar</div>
                    <div style="font-size: 14px; margin-top: 4px;">
                        Kelas: {{ $kelas }} | SPP: {{ $spp }} | PPDB: {{ $ppdb ?? 'Semua PPDB' }}
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
                <th>NIS</th>
                <th>Nama</th>
                <th>Kelas</th>
                {{-- <th>Email</th> --}}
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($siswa as $index => $s)
            <tr>
                <td style="text-align: center;">{{ $index + 1 }}</td>
                <td>{{ is_array($s) ? $s['nis'] : $s->nis }}</td>
                <td>{{ is_array($s) ? $s['nama'] : $s->nama }}</td>
                <td style="text-align: center;">{{ is_array($s) ? $s['kelas'] : $s->kelas }}</td>
                {{-- <td>{{ is_array($s) && isset($s['user']) && isset($s['user']['email']) ? $s['user']['email'] : (isset($s->user) && isset($s->user->email) ? $s->user->email : '-') }}</td> --}}
                <td class="status-lunas" style="text-align: center;">Sudah Bayar</td>
            </tr>
            @empty
            <tr>
                <td colspan="6" style="text-align: center;">Tidak ada data siswa lunas</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div style="margin-top: 30px;">
        <table width="100%" style="border: none;">
            <tr>
                <td style="border: none; width: 40%; vertical-align: top;">
                    <p><strong>Total Siswa Lunas:</strong> {{ count($siswa) }}</p>
                </td>
                <td style="border: none; width: 60%;">
                    <table width="100%" style="border: none;">
                        <tr>
                            <td style="border: none; width: 50%;"></td>
                            <td style="border: none; text-align: center; width: 50%;">
                                <p>Cilegon, {{ \Carbon\Carbon::now()->format('d F Y') }}</p>
                                <p>Bendahara</p>
                                <br><br><br>
                                <p style="text-decoration: underline; font-weight: bold;">Istikomah</p>
                                <p>NIP. 197432130000022323</p>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border: none; text-align: center; padding-top: 30px;">
                                <p>Mengetahui,</p>
                                <p>Kepala Sekolah</p>
                                <br><br><br>
                                <p style="text-decoration: underline; font-weight: bold;">Siti Anisa</p>
                                <p>NIP. 197501012000031002</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
