<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Data Akun</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        table, th, td { border: 1px solid #ddd; }
        th, td { padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
    </style>
</head>
<body>
    <h2 style="text-align:center; margin-bottom: 16px;">DATA AKUN</h2>
    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>Kelas</th>
                <th>Email</th>
                <th>Password</th>
            </tr>
        </thead>
        <tbody>
            @foreach($users as $user)
                <tr>
                    <td>
                        @if($user->role === 'siswa' && $user->siswa)
                            {{ $user->siswa->nama }}
                        @elseif(($user->role === 'admin' || $user->role === 'kepsek') && $user->admin)
                            {{ $user->admin->nama }}
                        @else
                            {{ $user->email }}
                        @endif
                    </td>
                    <td>
                        @if($user->role === 'siswa' && $user->siswa)
                            {{ $user->siswa->kelas }}
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $user->email }}</td>
                    <td>123</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
