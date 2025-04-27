import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bell, Building2, Info, Save, School, User, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Pengelolaan Akun',
        href: '/admin/users',
    },
    {
        title: 'Tambah Akun',
        href: '/admin/users/create',
    },
];

export default function CreateUser() {
    const { flash } = usePage().props as any;
    const [selectedRole, setSelectedRole] = useState<string>('admin');
    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);
    const [showErrorAlert, setShowErrorAlert] = useState(!!flash?.error);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        role: 'admin',
        nama: '',
        nis: '',
        kelas: '',
        tanggal_masuk: '',
        no_telp: '',
        alamat: '',
    });

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        setData('role', value);
    };

    useEffect(() => {
        // Auto-hide success alert after 5 seconds
        if (showSuccessAlert) {
            const timer = setTimeout(() => {
                setShowSuccessAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
        // Auto-hide error alert after 5 seconds
        if (showErrorAlert) {
            const timer = setTimeout(() => {
                setShowErrorAlert(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessAlert, showErrorAlert]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                reset();
                setSelectedRole('admin');
                setShowSuccessAlert(true);
                flash.success = 'Akun berhasil ditambahkan!';
            },
            onError: () => {
                setShowErrorAlert(true);
                flash.error = 'Gagal menambahkan akun!';
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Akun" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-inter flex h-full flex-1 flex-col gap-6 p-6 transition-colors duration-300 dark:bg-[#171717]"
            >
                {showSuccessAlert && flash?.success && (
                    <Alert className="border border-green-200 bg-green-50/90 backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                            <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <AlertTitle className="font-medium text-green-700 dark:text-green-400">Berhasil!</AlertTitle>
                                <AlertDescription className="text-green-600 dark:text-green-300">{flash.success}</AlertDescription>
                            </div>
                        </motion.div>
                    </Alert>
                )}

                {showErrorAlert && flash?.error && (
                    <Alert className="border border-red-200 bg-red-50/90 backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                            <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <AlertTitle className="font-medium text-red-700 dark:text-red-400">Gagal!</AlertTitle>
                                <AlertDescription className="text-red-600 dark:text-red-300">{flash.error}</AlertDescription>
                            </div>
                        </motion.div>
                    </Alert>
                )}
                <Card className="overflow-hidden border border-gray-100 bg-white/90 text-gray-900 shadow-md backdrop-blur-md dark:border-[#334155] dark:bg-[#171717]/90 dark:text-gray-100">
                    <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 dark:border-gray-800 dark:from-indigo-950/20 dark:to-blue-950/20">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-medium">Tambah Akun Baru</CardTitle>
                                <CardDescription>Lengkapi informasi akun dibawah ini dengan benar</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-6 pt-5">
                            <Tabs defaultValue="akun" className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800/50">
                                    <TabsTrigger value="akun" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Data Akun</span>
                                    </TabsTrigger>
                                    {selectedRole === 'siswa' && (
                                        <TabsTrigger value="siswa" className="flex items-center gap-2">
                                            <School className="h-4 w-4" />
                                            <span>Data Siswa</span>
                                        </TabsTrigger>
                                    )}
                                    {(selectedRole === 'admin' || selectedRole === 'kepsek') && (
                                        <TabsTrigger value="admin" className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            <span>{selectedRole === 'admin' ? 'Data Admin' : 'Data Kepsek'}</span>
                                        </TabsTrigger>
                                    )}
                                </TabsList>

                                <TabsContent value="akun" className="mt-0">
                                    <div className="mb-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                                        <h3 className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                                            <User className="h-4 w-4" />
                                            Informasi Akun Pengguna
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Role <span className="text-red-500 dark:text-red-400">*</span>
                                            </Label>
                                            <Select value={data.role} onValueChange={handleRoleChange}>
                                                <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]">
                                                    <SelectValue placeholder="Pilih role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin">Admin</SelectItem>
                                                    <SelectItem value="kepsek">Kepala Sekolah</SelectItem>
                                                    <SelectItem value="siswa">Siswa</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Nama <span className="text-red-500 dark:text-red-400">*</span>
                                            </Label>
                                            <Input
                                                id="nama"
                                                type="text"
                                                value={data.nama}
                                                onChange={(e) => setData('nama', e.target.value)}
                                                placeholder="Masukkan nama lengkap"
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                required
                                            />
                                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Email <span className="text-red-500 dark:text-red-400">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Masukkan email"
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                required
                                                pattern="[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+"
                                                onInvalid={(e: React.FormEvent<HTMLInputElement>) =>
                                                    e.currentTarget.setCustomValidity(
                                                        'Email harus mengandung karakter "@" dan format valid, contoh: user@email.com',
                                                    )
                                                }
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => e.currentTarget.setCustomValidity('')}
                                            />
                                            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Password <span className="text-red-500 dark:text-red-400">*</span>
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                placeholder="Masukkan password"
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                required
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Password minimal 3 karakter</p>
                                            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Section: Data Siswa */}
                                {selectedRole === 'siswa' && (
                                    <TabsContent value="siswa" className="mt-0">
                                        <div className="mb-4 rounded-lg bg-purple-50 p-3 dark:bg-purple-900/20">
                                            <h3 className="flex items-center gap-2 text-sm font-medium text-purple-800 dark:text-purple-300">
                                                <School className="h-4 w-4" />
                                                Informasi Data Siswa
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nis" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    NIS <span className="text-red-500 dark:text-red-400">*</span>
                                                </Label>
                                                <Input
                                                    id="nis"
                                                    type="text"
                                                    value={data.nis}
                                                    onChange={(e) => setData('nis', e.target.value)}
                                                    placeholder="Masukkan NIS"
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                    pattern="[0-9]{10}"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    onInput={(e) => {
                                                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                                    }}
                                                    required
                                                />
                                                {errors.nis && <p className="text-sm text-red-500">{errors.nis}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="kelas" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Kelas <span className="text-red-500 dark:text-red-400">*</span>
                                                </Label>
                                                <Select value={data.kelas} onValueChange={(value) => setData('kelas', value)}>
                                                    <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]">
                                                        <SelectValue placeholder="Pilih kelas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="TK A">TK A</SelectItem>
                                                        <SelectItem value="TK B">TK B</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.kelas && <p className="text-sm text-red-500">{errors.kelas}</p>}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="tanggal_masuk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Tanggal Masuk <span className="text-red-500 dark:text-red-400">*</span>
                                                </Label>
                                                <Input
                                                    id="tanggal_masuk"
                                                    type="date"
                                                    value={data.tanggal_masuk}
                                                    onChange={(e) => setData('tanggal_masuk', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                    required
                                                />
                                                {errors.tanggal_masuk && <p className="text-sm text-red-500">{errors.tanggal_masuk}</p>}
                                            </div>
                                        </div>
                                    </TabsContent>
                                )}

                                {/* Section: Data Admin/Kepsek */}
                                {(selectedRole === 'admin' || selectedRole === 'kepsek') && (
                                    <TabsContent value="admin" className="mt-0">
                                        <div className="mb-4 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                            <h3 className="flex items-center gap-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                                <Building2 className="h-4 w-4" />
                                                {selectedRole === 'admin' ? 'Informasi Administrator' : 'Informasi Kepala Sekolah'}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="no_telp" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Nomor Telepon
                                                </Label>
                                                <Input
                                                    id="no_telp"
                                                    type="text"
                                                    value={data.no_telp}
                                                    onChange={(e) => setData('no_telp', e.target.value)}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '').slice(0, 12);
                                                        setData('no_telp', e.currentTarget.value);
                                                    }}
                                                    maxLength={12}
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    placeholder="Masukkan nomor telepon"
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                />
                                                {errors.no_telp && <p className="text-sm text-red-500">{errors.no_telp}</p>}
                                            </div>

                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="alamat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Alamat
                                                </Label>
                                                <textarea
                                                    id="alamat"
                                                    value={data.alamat}
                                                    onChange={(e) => setData('alamat', e.target.value)}
                                                    placeholder="Masukkan alamat"
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                    rows={3}
                                                />
                                                {errors.alamat && <p className="text-sm text-red-500">{errors.alamat}</p>}
                                            </div>
                                        </div>
                                    </TabsContent>
                                )}
                            </Tabs>
                        </CardContent>

                        <CardFooter className="flex justify-between border-t border-gray-100 bg-gray-50 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/20">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Badge
                                    variant="outline"
                                    className="mr-2 border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
                                >
                                    {selectedRole === 'admin' ? 'Administrator' : selectedRole === 'kepsek' ? 'Kepala Sekolah' : 'Siswa'}
                                </Badge>
                                Formulir Pendaftaran Akun
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    asChild
                                    className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-[#334155] dark:bg-[#171717] dark:text-gray-300 dark:hover:bg-[#171717]/80"
                                >
                                    <Link href="/admin/users">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Batal
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </AppLayout>
    );
}
