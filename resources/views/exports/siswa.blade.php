<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Data Siswa</title>
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
    </style>
</head>
<body>
    <div style="margin-bottom: 24px;">
        <table width="100%" style="border: none;">
            <tr>
                <td width="110" style="border: none; text-align: left; vertical-align: top; padding-right: 10px;">
                    <img src="{{ public_path('image/logo.png') }}" alt="Logo TKIT PARADISE" style="height:85px;">
                </td>
                <td style="border: none; text-align: center; vertical-align: middle;">
                    <div style="font-size: 34px; font-weight: bold; letter-spacing: 2px; margin-bottom: 2px;">TKIT PARADISE</div>
                    <div style="font-size: 12px; font-weight: bold; margin-bottom: 2px;">
                        Link. Jl. Sutan Syahrir No.42, Rawa Gondang, Kec. Citangkil, Kota Cilegon, Banten 42414
                    </div>
                    <div style="font-size: 18px; font-weight: bold; margin-top: 12px;">Data Siswa TK Tahun Ajaran {{ date('Y') }}/{{ date('Y') + 1 }}</div>
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
                <th>Jenis Kelamin</th>
                <th>Kelas</th>
            </tr>
        </thead>
        <tbody>
            @foreach($siswa as $i => $item)
                <tr>
                    <td style="text-align: center;">{{ $i + 1 }}</td>
                    <td>{{ $item->nis }}</td>
                    <td>{{ $item->nama }}</td>
                    <td>{{ $item->jenis_kelamin == 'L' ? 'Laki-laki' : 'Perempuan' }}</td>
                    <td style="text-align: center;">{{ $item->kelas }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div style="margin-top: 30px; text-align: right;">
        <p>{{ date('d F Y') }}</p>
        <br>
        <br>
        <br>
        <p>_______________________</p>
        <p>Kepala Sekolah</p>
    </div>
</body>
</html>
