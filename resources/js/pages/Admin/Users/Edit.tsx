import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Bell, Building2, CheckCircle2, Info, Save, School, User, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
        title: 'Edit Akun',
        href: '#',
    },
];

interface UserData {
    user_id: number;
    email: string;
    role: string;
    siswa?: {
        nama: string;
        nis: string;
        kelas: string;
        tanggal_masuk?: string;
    };
    admin?: {
        nama: string;
        no_telp?: string;
        alamat?: string;
    };
}

interface EditUserForm {
    email: string;
    password: string;
    role: string;
    nama: string;
    nis: string;
    kelas: string;
    tanggal_masuk: string;
    no_telp: string;
    alamat: string;
    [key: string]: string;
}

interface EditUserProps {
    user: UserData;
}

export default function EditUser({ user }: EditUserProps) {
    const { flash } = usePage().props as any;
    const [selectedRole, setSelectedRole] = useState<string>(user.role);
    const [showSuccessAlert, setShowSuccessAlert] = useState(!!flash?.success);
    const [showErrorAlert, setShowErrorAlert] = useState(!!flash?.error);
    const [successMessage, setSuccessMessage] = useState(flash?.success || '');
    const [errorMessage, setErrorMessage] = useState(flash?.error || '');
    
    const getNameBasedOnRole = () => {
        if (user.role === 'siswa' && user.siswa) {
            return user.siswa.nama || '';
        } else if ((user.role === 'admin' || user.role === 'kepsek') && user.admin) {
            return user.admin.nama || '';
        }
        return '';
    };

    const { data, setData, put, processing, errors, reset } = useForm<EditUserForm>({
        email: user.email || '',
        password: '',
        role: user.role || 'admin',
        nama: getNameBasedOnRole(),
        nis: user?.siswa?.nis || '',
        kelas: user?.siswa?.kelas || '',
        tanggal_masuk: user?.siswa?.tanggal_masuk || '',
        no_telp: user?.admin?.no_telp || '',
        alamat: user?.admin?.alamat || '',
    });

    const handleRoleChange = (value: string) => {
        setSelectedRole(value);
        setData('role' as keyof EditUserForm, value);
    };

    useEffect(() => {
        if (showSuccessAlert || showErrorAlert) {
            const timer = setTimeout(() => {
                if (showSuccessAlert) setShowSuccessAlert(false);
                if (showErrorAlert) setShowErrorAlert(false);
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, [showSuccessAlert, showErrorAlert]);
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(`/admin/users/${user.user_id}`, {
            onSuccess: (response) => {
                setShowSuccessAlert(true);
                setSuccessMessage('Akun berhasil diperbarui!');
                
                // Delay redirect untuk memberikan waktu melihat alert
                setTimeout(() => {
                    router.get('/admin/users');
                }, 2000);
            },
            onError: (errors) => {
                setShowErrorAlert(true);
                setErrorMessage('Gagal memperbarui akun. Silakan cek kembali data Anda.');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Akun" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="font-inter flex h-full flex-1 flex-col gap-6 p-6 transition-colors duration-300 dark:bg-[#171717]"
            >
                {showSuccessAlert && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Alert className="border border-green-100 bg-green-50/90 text-green-800 backdrop-blur-sm dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-green-100 p-1 dark:bg-green-900/30">
                                    <Bell className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <AlertTitle className="font-medium text-green-700 dark:text-green-400">Berhasil!</AlertTitle>
                                    <AlertDescription className="text-green-600 dark:text-green-300">{successMessage}</AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    </motion.div>
                )}

                {showErrorAlert && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <Alert className="border border-red-100 bg-red-50/90 text-red-800 backdrop-blur-sm dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
                            <div className="flex items-center gap-2">
                                <div className="rounded-full bg-red-100 p-1 dark:bg-red-900/30">
                                    <Info className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <AlertTitle className="font-medium text-red-700 dark:text-red-400">Gagal!</AlertTitle>
                                    <AlertDescription className="text-red-600 dark:text-red-300">{errorMessage}</AlertDescription>
                                </div>
                            </div>
                        </Alert>
                    </motion.div>
                )}

                <Card className="overflow-hidden border border-gray-100 bg-white/90 text-gray-900 shadow-md backdrop-blur-md dark:border-[#334155] dark:bg-[#171717]/90 dark:text-gray-100">
                    <CardHeader className="flex items-center justify-center gap-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 dark:border-gray-800 dark:from-blue-950/20 dark:to-indigo-950/20">
                        <CardTitle className="text-lg font-medium">Informasi Akun</CardTitle>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-6 pt-5">
                            <Tabs defaultValue="akun" className="w-full">
                                <TabsList className="mb-4 grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800/50">
                                    <TabsTrigger value="akun" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Data Akun</span>
                                    </TabsTrigger>
                                    <TabsTrigger value={selectedRole === 'siswa' ? 'siswa' : 'admin'} className="flex items-center gap-2">
                                        {selectedRole === 'siswa' ? <School className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
                                        <span>
                                            {selectedRole === 'siswa' ? 'Data Siswa' : selectedRole === 'admin' ? 'Data Admin' : 'Data Kepsek'}
                                        </span>
                                    </TabsTrigger>
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
                                                <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nama', e.target.value)}
                                                placeholder="Masukkan nama lengkap"
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                required
                                            />
                                            {errors.nama && <p className="text-sm text-red-500">{errors.nama}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('email', e.target.value)}
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
                                            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                                Password <span className="text-gray-500">(Kosongkan jika tidak ingin mengubah)</span>
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('password', e.target.value)}
                                                placeholder="Masukkan password baru"
                                                className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                            />
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
                                                <Label htmlFor="nis" className="block text-sm font-medium text-gray-700">
                                                    NIS <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="nis"
                                                    type="text"
                                                    value={data.nis}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('nis', e.target.value)}
                                                    placeholder="Masukkan NIS"
                                                    className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#171717]"
                                                    pattern="[0-9]{10}"
                                                    inputMode="numeric"
                                                    maxLength={10}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '');
                                                    }}
                                                    required
                                                />
                                                {errors.nis && <p className="text-sm text-red-500">{errors.nis}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="kelas" className="block text-sm font-medium text-gray-700">
                                                    Kelas <span className="text-red-500">*</span>
                                                </Label>
                                                <Select value={data.kelas} onValueChange={(value: string) => setData('kelas', value)}>
                                                    <SelectTrigger className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
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
                                                <Label htmlFor="tanggal_masuk" className="block text-sm font-medium text-gray-700">
                                                    Tanggal Masuk <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="tanggal_masuk"
                                                    type="date"
                                                    value={data.tanggal_masuk}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                                        setData('tanggal_masuk', e.target.value as string)
                                                    }
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
                                                <Label htmlFor="no_telp" className="block text-sm font-medium text-gray-700">
                                                    Nomor Telepon
                                                </Label>
                                                <Input
                                                    id="no_telp"
                                                    type="text"
                                                    value={data.no_telp}
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('no_telp', e.target.value)}
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
                                                <Label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                                                    Alamat
                                                </Label>
                                                <textarea
                                                    id="alamat"
                                                    value={data.alamat}
                                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('alamat', e.target.value)}
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
                                    className="mr-2 border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                >
                                    {selectedRole === 'admin' ? 'Administrator' : selectedRole === 'kepsek' ? 'Kepala Sekolah' : 'Siswa'}
                                </Badge>
                                Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}
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
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Perubahan
                                </Button>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </AppLayout>
    );
}
