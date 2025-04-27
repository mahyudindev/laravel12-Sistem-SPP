import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Key, Lock, Save, User, UserCircle } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { LoadingOverlay } from '@/components/ui/loading-overlay';

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
        title: 'Profil',
        href: '#',
    },
];

interface ProfileProps {
    user: {
        user_id: number;
        email: string;
        role: string;
        siswa?: {
            nama: string;
            nis: string;
            kelas: string;
        };
        admin?: {
            nama: string;
            no_telp?: string;
            alamat?: string;
        };
    };
}

export default function Profile({ user }: ProfileProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Form untuk data profil
    const profileForm = useForm({
        email: user.email,
        nama: user.role === 'siswa' ? user.siswa?.nama : user.admin?.nama,
        no_telp: user.role === 'siswa' ? '' : user.admin?.no_telp || '',
        alamat: user.role === 'siswa' ? '' : user.admin?.alamat || '',
        nis: user.role === 'siswa' ? user.siswa?.nis : '',
        kelas: user.role === 'siswa' ? user.siswa?.kelas : '',
    });

    // Form untuk ubah password
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        profileForm.post(`/admin/users/${user.user_id}/profile`, {
            onSuccess: () => {
                setIsLoading(false);
                toast.success('Profil berhasil diperbarui', {
                    position: 'top-center',
                    duration: 2000,
                    className: 'bg-[#0A0A0A] border border-green-600 text-white',
                    descriptionClassName: 'text-gray-300',
                    style: { backgroundColor: '#0A0A0A', color: 'white' }
                });
            },
            onError: (errors) => {
                console.error('Error:', errors);
                setIsLoading(false);
                toast.error('Terjadi kesalahan saat memperbarui profil', {
                    position: 'top-center',
                    duration: 3000,
                    className: 'bg-[#0A0A0A] border border-red-600 text-white',
                    descriptionClassName: 'text-gray-300',
                    style: { backgroundColor: '#0A0A0A', color: 'white' }
                });
            },
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        passwordForm.post(`/admin/users/${user.user_id}/password`, {
            onSuccess: () => {
                setIsLoading(false);
                toast.success('Password berhasil diperbarui', {
                    position: 'top-center',
                    duration: 2000,
                    className: 'bg-[#0A0A0A] border border-green-600 text-white',
                    descriptionClassName: 'text-gray-300',
                    style: { backgroundColor: '#0A0A0A', color: 'white' }
                });
                passwordForm.reset();
            },
            onError: (errors) => {
                console.error('Error:', errors);
                setIsLoading(false);
                toast.error('Terjadi kesalahan saat memperbarui password', {
                    position: 'top-center',
                    duration: 3000,
                    className: 'bg-[#0A0A0A] border border-red-600 text-white',
                    descriptionClassName: 'text-gray-300',
                    style: { backgroundColor: '#0A0A0A', color: 'white' }
                });
            },
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-blue-500">Admin</Badge>;
            case 'kepsek':
                return <Badge className="bg-green-500">Kepala Sekolah</Badge>;
            case 'siswa':
                return <Badge className="bg-purple-500">Siswa</Badge>;
            default:
                return <Badge className="bg-gray-500">{role}</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <LoadingOverlay isLoading={isLoading} />
            <Toaster richColors closeButton position="top-center" theme="dark" />
            <Head title="Profil Pengguna" />
            <div className="font-inter flex h-full flex-1 flex-col gap-4 p-4 transition-colors duration-300 dark:bg-[#171717]">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-9 p-0 dark:border-[#334155] dark:bg-[#171717] dark:text-gray-300 dark:hover:bg-[#334155]/50"
                        asChild
                    >
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Kembali</span>
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Profil Pengguna</h1>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Kartu Profil */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:col-span-1"
                    >
                        <Card className="border-border overflow-hidden border bg-white/80 text-gray-900 shadow-md backdrop-blur-sm dark:border-[#334155] dark:bg-[#171717]/80 dark:text-white">
                            <CardHeader className="flex flex-col items-center justify-center border-b p-6 dark:border-[#334155]">
                                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                                    <UserCircle className="h-16 w-16" />
                                </div>
                                <CardTitle className="text-xl font-bold">
                                    {user.role === 'siswa' ? user.siswa?.nama : user.admin?.nama}
                                </CardTitle>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                <div className="mt-2">{getRoleBadge(user.role)}</div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-200 dark:divide-[#334155]">
                                    {user.role === 'siswa' && user.siswa && (
                                        <>
                                            <div className="grid grid-cols-3 p-4">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">NIS</div>
                                                <div className="col-span-2 font-mono text-sm">{user.siswa.nis}</div>
                                            </div>
                                            <div className="grid grid-cols-3 p-4">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Kelas</div>
                                                <div className="col-span-2 text-sm">{user.siswa.kelas}</div>
                                            </div>
                                        </>
                                    )}
                                    {(user.role === 'admin' || user.role === 'kepsek') && user.admin && (
                                        <>
                                            <div className="grid grid-cols-3 p-4">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Telepon</div>
                                                <div className="col-span-2 font-mono text-sm">{user.admin.no_telp || '-'}</div>
                                            </div>
                                            <div className="grid grid-cols-3 p-4">
                                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat</div>
                                                <div className="col-span-2 text-sm">{user.admin.alamat || '-'}</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Form Edit Profil */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="md:col-span-2"
                    >
                        <Card className="border-border border bg-white/80 text-gray-900 shadow-md backdrop-blur-sm dark:border-[#334155] dark:bg-[#171717]/80 dark:text-white">
                            <CardContent className="p-6">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="mb-6 grid w-full grid-cols-2 bg-gray-100 dark:bg-[#334155]/50">
                                        <TabsTrigger
                                            value="profile"
                                            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#171717] dark:data-[state=active]:text-white"
                                        >
                                            <User className="mr-2 h-4 w-4" />
                                            Profil
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="password"
                                            className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-[#171717] dark:data-[state=active]:text-white"
                                        >
                                            <Lock className="mr-2 h-4 w-4" />
                                            Password
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="profile">
                                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileForm.data.email}
                                                    onChange={(e) => profileForm.setData('email', e.target.value)}
                                                    className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                    required
                                                />
                                                {profileForm.errors.email && (
                                                    <p className="text-sm text-red-500">{profileForm.errors.email}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nama">Nama Lengkap</Label>
                                                <Input
                                                    id="nama"
                                                    type="text"
                                                    value={profileForm.data.nama}
                                                    onChange={(e) => profileForm.setData('nama', e.target.value)}
                                                    className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                    required
                                                />
                                                {profileForm.errors.nama && (
                                                    <p className="text-sm text-red-500">{profileForm.errors.nama}</p>
                                                )}
                                            </div>

                                            {user.role === 'siswa' ? (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="nis">NIS</Label>
                                                        <Input
                                                            id="nis"
                                                            type="text"
                                                            value={profileForm.data.nis}
                                                            onChange={(e) => profileForm.setData('nis', e.target.value)}
                                                            className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                            required
                                                        />
                                                        {profileForm.errors.nis && (
                                                            <p className="text-sm text-red-500">{profileForm.errors.nis}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="kelas">Kelas</Label>
                                                        <Input
                                                            id="kelas"
                                                            type="text"
                                                            value={profileForm.data.kelas}
                                                            onChange={(e) => profileForm.setData('kelas', e.target.value)}
                                                            className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                            required
                                                        />
                                                        {profileForm.errors.kelas && (
                                                            <p className="text-sm text-red-500">{profileForm.errors.kelas}</p>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="no_telp">Nomor Telepon</Label>
                                                        <Input
                                                            id="no_telp"
                                                            type="text"
                                                            value={profileForm.data.no_telp}
                                                            onChange={(e) => profileForm.setData('no_telp', e.target.value)}
                                                            className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                        />
                                                        {profileForm.errors.no_telp && (
                                                            <p className="text-sm text-red-500">{profileForm.errors.no_telp}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="alamat">Alamat</Label>
                                                        <Input
                                                            id="alamat"
                                                            type="text"
                                                            value={profileForm.data.alamat}
                                                            onChange={(e) => profileForm.setData('alamat', e.target.value)}
                                                            className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                        />
                                                        {profileForm.errors.alamat && (
                                                            <p className="text-sm text-red-500">{profileForm.errors.alamat}</p>
                                                        )}
                                                    </div>
                                                </>
                                            )}

                                            <div className="mt-6 flex justify-end">
                                                <Button
                                                    type="submit"
                                                    className="bg-blue-600 text-white shadow-md transition-all duration-200 hover:bg-blue-700 dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
                                                    disabled={profileForm.processing}
                                                >
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Simpan Perubahan
                                                </Button>
                                            </div>
                                        </form>
                                    </TabsContent>

                                    <TabsContent value="password">
                                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="current_password">Password Saat Ini</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="current_password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={passwordForm.data.current_password}
                                                        onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                                        className="border-gray-300 bg-white pr-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.current_password && (
                                                    <p className="text-sm text-red-500">{passwordForm.errors.current_password}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password">Password Baru</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="password"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordForm.data.password}
                                                        onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                        className="border-gray-300 bg-white pr-10 focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                    >
                                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                                {passwordForm.errors.password && (
                                                    <p className="text-sm text-red-500">{passwordForm.errors.password}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                    className="border-gray-300 bg-white focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-[#334155] dark:bg-[#171717] dark:focus-visible:ring-blue-600"
                                                    required
                                                />
                                                {passwordForm.errors.password_confirmation && (
                                                    <p className="text-sm text-red-500">{passwordForm.errors.password_confirmation}</p>
                                                )}
                                            </div>

                                            <div className="mt-6 flex justify-end">
                                                <Button
                                                    type="submit"
                                                    className="bg-blue-600 text-white shadow-md transition-all duration-200 hover:bg-blue-700 dark:bg-[#3b82f6] dark:hover:bg-[#2563eb]"
                                                    disabled={passwordForm.processing}
                                                >
                                                    <Key className="mr-2 h-4 w-4" />
                                                    Perbarui Password
                                                </Button>
                                            </div>
                                        </form>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
