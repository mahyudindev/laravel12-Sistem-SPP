import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Mail, MapPin, Pencil, Phone, User, UserCircle } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

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

interface SiswaShowProps {
    siswa: Siswa;
}

export default function SiswaShow({ siswa }: SiswaShowProps) {
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
            title: `Detail Siswa: ${siswa.nama}`,
            href: `/admin/siswa/${siswa.siswa_id}`,
        },
    ];

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        try {
            return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
        } catch (e) {
            return dateString;
        }
    };

    const getJenisKelaminLabel = (jk?: string) => {
        if (!jk) return '-';
        return jk === 'L' ? 'Laki-laki' : jk === 'P' ? 'Perempuan' : jk;
    };

    const getStatusBadge = (status: boolean) => {
        return status ? 
            <Badge className="bg-green-500 hover:bg-green-600">Aktif</Badge> : 
            <Badge className="bg-gray-500 hover:bg-gray-600">Tidak Aktif</Badge>;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Siswa - ${siswa.nama}`} />
            <div className="font-inter flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Siswa</h1>
                        <p className="text-gray-500">Detail informasi lengkap siswa</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => window.history.back()}
                            className="border-gray-300"
                        >
                            Kembali
                        </Button>
                        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                            <Link href={`/admin/siswa/${siswa.siswa_id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Siswa
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Biodata Siswa */}
                    <Card className="bg-white/80 shadow-md backdrop-blur-sm dark:bg-[#171717]/90 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Biodata Siswa</CardTitle>
                            <CardDescription>Informasi pribadi siswa</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-y-4 md:grid-cols-2 md:gap-x-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <User className="h-4 w-4" />
                                        Nama Lengkap
                                    </h3>
                                    <p className="mt-1 text-base font-medium">{siswa.nama}</p>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <UserCircle className="h-4 w-4" />
                                        NIS
                                    </h3>
                                    <p className="mt-1 text-base font-mono">{siswa.nis}</p>
                                </div>
                            </div>

                            <div className="grid gap-y-4 md:grid-cols-2 md:gap-x-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <UserCircle className="h-4 w-4" />
                                        Kelas
                                    </h3>
                                    <p className="mt-1 text-base">{siswa.kelas}</p>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <UserCircle className="h-4 w-4" />
                                        Jenis Kelamin
                                    </h3>
                                    <p className="mt-1 text-base">{getJenisKelaminLabel(siswa.jenis_kelamin)}</p>
                                </div>
                            </div>

                            <div className="grid gap-y-4 md:grid-cols-2 md:gap-x-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Lahir
                                    </h3>
                                    <p className="mt-1 text-base">{formatDate(siswa.tanggal_lahir)}</p>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <Calendar className="h-4 w-4" />
                                        Tanggal Masuk
                                    </h3>
                                    <p className="mt-1 text-base">{formatDate(siswa.tanggal_masuk)}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    Alamat
                                </h3>
                                <p className="mt-1 text-base">{siswa.alamat || '-'}</p>
                            </div>

                            <div className="grid gap-y-4 md:grid-cols-2 md:gap-x-6">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <Phone className="h-4 w-4" />
                                        Nomor HP
                                    </h3>
                                    <p className="mt-1 text-base font-mono">{siswa.no_hp || '-'}</p>
                                </div>
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                        <UserCircle className="h-4 w-4" />
                                        Status
                                    </h3>
                                    <div className="mt-1">{getStatusBadge(siswa.is_aktif)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informasi Akun */}
                    <Card className="bg-white/80 shadow-md backdrop-blur-sm dark:bg-[#171717]/90">
                        <CardHeader>
                            <CardTitle className="text-xl font-semibold">Informasi Akun</CardTitle>
                            <CardDescription>Detail akun untuk login</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <Mail className="h-4 w-4" />
                                    Email
                                </h3>
                                <p className="mt-1 text-base font-medium">{siswa.email || '-'}</p>
                            </div>
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <User className="h-4 w-4" />
                                    User ID
                                </h3>
                                <p className="mt-1 text-base font-mono">{siswa.user_id || '-'}</p>
                            </div>
                            <div>
                                <h3 className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                    <UserCircle className="h-4 w-4" />
                                    Role
                                </h3>
                                <p className="mt-1">
                                    <Badge className="bg-purple-500 hover:bg-purple-600">Siswa</Badge>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
