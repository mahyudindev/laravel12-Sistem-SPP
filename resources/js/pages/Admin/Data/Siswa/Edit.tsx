import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Calendar, Check, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Siswa {
    siswa_id: number;
    nama: string;
    nis: string;
    kelas: string;
    jenis_kelamin?: string;
    alamat?: string;
    no_hp?: string;
    tanggal_lahir?: string;
    tanggal_masuk?: string;
    is_aktif: boolean;
    user_id?: number;
    email?: string;
}

interface SiswaEditProps {
    siswa: Siswa;
    kelasList: string[];
}

export default function SiswaEdit({ siswa, kelasList }: SiswaEditProps) {
    const { flash } = usePage().props as any;
    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);
    const [showErrorAlert, setShowErrorAlert] = useState(!!flash?.error);

    useEffect(() => {
        if (flash?.success) {
            setShowSuccessAlert(true);
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }

        if (flash?.error) {
            setShowErrorAlert(true);
            const timer = setTimeout(() => {
                setShowErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Data Siswa',
            href: '/admin/siswa',
        },
        {
            title: 'Edit Siswa',
            href: `/admin/siswa/${siswa.siswa_id}/edit`,
        },
    ];

    const { data, setData, errors, put, processing } = useForm({
        nama: siswa.nama || '',
        nis: siswa.nis || '',
        kelas: siswa.kelas || '',
        jenis_kelamin: siswa.jenis_kelamin || 'L',
        tanggal_lahir: siswa.tanggal_lahir || '',
        alamat: siswa.alamat || '',
        no_hp: siswa.no_hp || '',
        tanggal_masuk: siswa.tanggal_masuk || '',
        is_aktif: siswa.is_aktif,
        email: siswa.email || '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/siswa/${siswa.siswa_id}`, {
            onSuccess: () => {
                // Redirect akan ditangani oleh controller
                console.log('Data siswa berhasil diperbarui');
            },
            onError: (errors) => {
                console.error('Error saat memperbarui data:', errors);
                // Error akan otomatis diteruskan ke state errors
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Siswa - ${siswa.nama}`} />
            <div className="font-inter flex h-full flex-1 flex-col p-4 sm:p-6">
                {showSuccessAlert && flash?.success && (
                    <div className="rounded-lg border border-green-100 bg-green-50/90 p-4 text-green-700 shadow-sm backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-green-600 dark:text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">Berhasil!</h3>
                                <p className="text-sm">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {showErrorAlert && flash?.error && (
                    <div className="rounded-lg border border-red-100 bg-red-50/90 p-4 text-red-700 shadow-sm backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-600 dark:text-red-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-7a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm0-4a1 1 0 100 2 1 1 0 000-2z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-medium">Gagal!</h3>
                                <p className="text-sm">{flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex-1">
                    <div className="mx-auto max-w-5xl">
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {/* Data Siswa */}
                                <Card className="bg-white/80 shadow-md backdrop-blur-sm dark:bg-[#171717]/90 md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">Data Siswa</CardTitle>
                                        <CardDescription>Edit informasi dasar siswa</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nama">Nama Lengkap<span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="nama"
                                                    type="text"
                                                    placeholder="Masukkan nama lengkap siswa"
                                                    value={data.nama}
                                                    onChange={(e) => setData('nama', e.target.value)}
                                                    className={errors.nama ? 'border-red-500' : ''}
                                                />
                                                {errors.nama && <div className="text-xs text-red-500">{errors.nama}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="nis">NIS<span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="nis"
                                                    type="text"
                                                    placeholder="Masukkan nomor induk siswa"
                                                    value={data.nis}
                                                    onChange={(e) => setData('nis', e.target.value)}
                                                    className={errors.nis ? 'border-red-500' : ''}
                                                />
                                                {errors.nis && <div className="text-xs text-red-500">{errors.nis}</div>}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="kelas">Kelas<span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={data.kelas}
                                                    onValueChange={(value) => setData('kelas', value)}
                                                >
                                                    <SelectTrigger id="kelas" className={errors.kelas ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Pilih kelas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {kelasList.length > 0 ? (
                                                            kelasList.map((kelas) => (
                                                                <SelectItem key={kelas} value={kelas}>
                                                                    {kelas}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <>
                                                                <SelectItem value="TK A">TK A</SelectItem>
                                                                <SelectItem value="TK B">TK B</SelectItem>
                                                            </>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                {errors.kelas && <div className="text-xs text-red-500">{errors.kelas}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="jenis_kelamin">Jenis Kelamin<span className="text-red-500">*</span></Label>
                                                <Select
                                                    value={data.jenis_kelamin}
                                                    onValueChange={(value) => setData('jenis_kelamin', value)}
                                                >
                                                    <SelectTrigger id="jenis_kelamin" className={errors.jenis_kelamin ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder="Pilih jenis kelamin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="L">Laki-laki</SelectItem>
                                                        <SelectItem value="P">Perempuan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.jenis_kelamin && <div className="text-xs text-red-500">{errors.jenis_kelamin}</div>}
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="tanggal_lahir"
                                                        type="date"
                                                        value={data.tanggal_lahir}
                                                        onChange={(e) => setData('tanggal_lahir', e.target.value)}
                                                        className={errors.tanggal_lahir ? 'border-red-500' : ''}
                                                    />
                                                    <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                                </div>
                                                {errors.tanggal_lahir && <div className="text-xs text-red-500">{errors.tanggal_lahir}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="tanggal_masuk">Tanggal Masuk</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="tanggal_masuk"
                                                        type="date"
                                                        value={data.tanggal_masuk}
                                                        onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                                        className={errors.tanggal_masuk ? 'border-red-500' : ''}
                                                    />
                                                    <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                                                </div>
                                                {errors.tanggal_masuk && <div className="text-xs text-red-500">{errors.tanggal_masuk}</div>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="alamat">Alamat</Label>
                                            <Input
                                                id="alamat"
                                                type="text"
                                                placeholder="Masukkan alamat siswa"
                                                value={data.alamat}
                                                onChange={(e) => setData('alamat', e.target.value)}
                                                className={errors.alamat ? 'border-red-500' : ''}
                                            />
                                            {errors.alamat && <div className="text-xs text-red-500">{errors.alamat}</div>}
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="no_hp">Nomor HP</Label>
                                                <Input
                                                    id="no_hp"
                                                    type="text"
                                                    placeholder="Masukkan nomor HP siswa"
                                                    value={data.no_hp}
                                                    onChange={(e) => setData('no_hp', e.target.value)}
                                                    className={errors.no_hp ? 'border-red-500' : ''}
                                                />
                                                {errors.no_hp && <div className="text-xs text-red-500">{errors.no_hp}</div>}
                                            </div>
                                            <div className="flex items-center space-x-2 pt-6">
                                                <Switch
                                                    id="is_aktif"
                                                    checked={data.is_aktif}
                                                    onCheckedChange={(checked) => setData('is_aktif', checked as any)}
                                                />
                                                <Label htmlFor="is_aktif">Status Aktif</Label>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Data Akun */}
                                <Card className="bg-white/80 shadow-md backdrop-blur-sm dark:bg-[#171717]/90 md:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold">Data Akun</CardTitle>
                                        <CardDescription>Edit informasi akun login siswa</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="Masukkan email siswa"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className={errors.email ? 'border-red-500' : ''}
                                                />
                                                {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password <span className="text-xs text-gray-500">(kosongkan jika tidak diubah)</span></Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="Masukkan password baru"
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    className={errors.password ? 'border-red-500' : ''}
                                                />
                                                {errors.password && <div className="text-xs text-red-500">{errors.password}</div>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="mt-6 flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="border-gray-300"
                                    disabled={processing}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700">
                                    {processing ? (
                                        <div className="flex items-center">
                                            <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Memproses...
                                        </div>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
