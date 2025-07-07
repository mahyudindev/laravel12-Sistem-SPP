import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Data Siswa',
        href: '/siswa/data-siswa',
    },
];

type ProfileForm = {
    email: string;
    nama: string;
    no_telp?: string;
    alamat?: string;
    nis?: string;
    kelas?: string;
    jenis_kelamin?: 'L' | 'P' | '';
    tanggal_lahir?: string;
    no_hp?: string;
    tanggal_masuk?: string;
};

// Define Auth type to include nama attribute
interface UserWithNama {
    email: string;
    nama: string;
    role: 'admin' | 'siswa' | 'kepsek';
    email_verified_at: string | null;
    admin?: {
        nama: string;
        no_telp?: string;
        alamat?: string;
    };
    siswa?: {
        nama: string;
        nis?: string;
        kelas?: string;
        jenis_kelamin?: 'L' | 'P';
        tanggal_lahir?: string;
        alamat?: string;
        no_hp?: string;
        tanggal_masuk?: string;
    };
    [key: string]: any;
}

interface Auth {
    user: UserWithNama;
}

interface SharedData {
    auth: Auth;
    [key: string]: any; // Add index signature to satisfy PageProps constraint
}

export default function DataSiswa({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const isAdmin = auth.user.role === 'admin' || auth.user.role === 'kepsek';
    const isSiswa = auth.user.role === 'siswa';
    
    // Siapkan data awal berdasarkan role pengguna
    const initialFormData = {
        email: auth.user.email ?? '',
        nama: auth.user.nama ?? 'Nama tidak tersedia',
        // Admin fields
        no_telp: isAdmin && auth.user.admin ? auth.user.admin.no_telp ?? '' : '',
        // Data alamat diambil dari siswa atau admin berdasarkan role
        alamat: isAdmin && auth.user.admin ? auth.user.admin.alamat ?? '' : 
               isSiswa && auth.user.siswa ? auth.user.siswa.alamat ?? '' : '',
        // Siswa fields
        nis: isSiswa && auth.user.siswa ? auth.user.siswa.nis ?? '' : '',
        kelas: isSiswa && auth.user.siswa ? auth.user.siswa.kelas ?? '' : '',
        jenis_kelamin: isSiswa && auth.user.siswa ? auth.user.siswa.jenis_kelamin ?? '' : '',
        tanggal_lahir: isSiswa && auth.user.siswa ? auth.user.siswa.tanggal_lahir ?? '' : '',
        no_hp: isSiswa && auth.user.siswa ? auth.user.siswa.no_hp ?? '' : '',
        tanggal_masuk: isSiswa && auth.user.siswa ? auth.user.siswa.tanggal_masuk ?? '' : ''
    };

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>(initialFormData as Required<ProfileForm>);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Siswa" />

            <div className="space-y-6">
                <HeadingSmall title="Informasi Profil" description="Perbarui nama dan alamat email Anda" />

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Kolom 1 - Nama */}
                        <div className="grid gap-2">
                            <Label htmlFor="nama">Nama</Label>

                            <Input
                                id="nama"
                                className="mt-1 block w-full"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                required
                                autoComplete="nama"
                                placeholder="Nama Lengkap"
                            />

                            <InputError className="mt-2" message={errors.nama} />
                        </div>

                        {/* Kolom 2 - Email */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>
                    </div>

                    {(auth.user.role === 'admin' || auth.user.role === 'kepsek') && (
                        <>
                            {/* Grid dengan 2 kolom untuk field pendek */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kolom 1 - Nomor Telepon */}
                                <div className="grid gap-2">
                                    <Label htmlFor="no_telp">Nomor Telepon</Label>
                                    <Input
                                        id="no_telp"
                                        className="mt-1 block w-full"
                                        value={data.no_telp}
                                        onChange={(e) => setData('no_telp', e.target.value)}
                                        placeholder="Nomor Telepon"
                                    />
                                    <InputError className="mt-2" message={errors.no_telp} />
                                </div>

                                {/* Kolom kosong untuk balancing */}
                                <div></div>
                            </div>

                            {/* Alamat dalam satu baris penuh */}
                            <div className="grid gap-2">
                                <Label htmlFor="alamat">Alamat</Label>
                                <textarea
                                    id="alamat"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                    value={data.alamat}
                                    onChange={(e) => setData('alamat', e.target.value)}
                                    placeholder="Alamat"
                                    rows={3}
                                />
                                <InputError className="mt-2" message={errors.alamat} />
                            </div>
                        </>
                    )}

                    {auth.user.role === 'siswa' && (
                        <>
                            {/* Grid dengan 2 kolom untuk field pendek */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kolom 1 - NIS */}
                                <div className="grid gap-2">
                                    <Label htmlFor="nis">NIS</Label>
                                    <Input
                                        id="nis"
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-800"
                                        value={data.nis}
                                        disabled
                                        placeholder="Nomor Induk Siswa"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">NIS tidak dapat diubah</p>
                                </div>

                                {/* Kolom 2 - Kelas */}
                                <div className="grid gap-2">
                                    <Label htmlFor="kelas">Kelas</Label>
                                    <Input
                                        id="kelas"
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-800"
                                        value={data.kelas}
                                        disabled
                                        placeholder="Kelas"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Kelas tidak dapat diubah</p>
                                </div>

                                {/* Kolom 1 - Jenis Kelamin */}
                                <div className="grid gap-2">
                                    <Label htmlFor="jenis_kelamin">Jenis Kelamin</Label>
                                    <Input
                                        id="jenis_kelamin"
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-800"
                                        value={data.jenis_kelamin === 'L' ? 'Laki-laki' : data.jenis_kelamin === 'P' ? 'Perempuan' : ''}
                                        disabled
                                        placeholder="Jenis Kelamin"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Jenis kelamin tidak dapat diubah</p>
                                </div>

                                {/* Kolom 2 - Tanggal Lahir */}
                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_lahir">Tanggal Lahir</Label>
                                    <Input
                                        id="tanggal_lahir"
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-800"
                                        value={data.tanggal_lahir ? new Date(data.tanggal_lahir).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                                        disabled
                                        placeholder="Tanggal Lahir"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tanggal lahir tidak dapat diubah</p>
                                </div>
                            </div>

                            {/* Alamat */}
                            <div className="grid gap-2 col-span-full">
                                <Label htmlFor="alamat">Alamat</Label>
                                <div className="mt-1 p-3 block w-full rounded-md border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 min-h-[6rem] whitespace-pre-wrap">
                                    {data.alamat || 'Alamat tidak tersedia'}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Alamat hanya dapat dilihat</p>
                            </div>

                            {/* Grid dengan 2 kolom untuk field pendek */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Kolom 1 - Nomor HP */}
                                <div className="grid gap-2">
                                    <Label htmlFor="no_hp">Nomor HP</Label>
                                    <Input
                                        id="no_hp"
                                        className="mt-1 block w-full"
                                        value={data.no_hp}
                                        onChange={(e) => setData('no_hp', e.target.value)}
                                        placeholder="Nomor HP"
                                    />
                                    <InputError className="mt-2" message={errors.no_hp} />
                                </div>

                                {/* Kolom 2 - Tanggal Masuk */}
                                <div className="grid gap-2">
                                    <Label htmlFor="tanggal_masuk">Tanggal Masuk</Label>
                                    <Input
                                        id="tanggal_masuk"
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-800"
                                        value={data.tanggal_masuk ? new Date(data.tanggal_masuk).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                                        disabled
                                        placeholder="Tanggal Masuk"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tanggal masuk tidak dapat diubah</p>
                                </div>
                            </div>
                        </>
                    )}

                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                        <div>
                            <p className="text-muted-foreground -mt-4 text-sm">
                                Your email address is unverified.{' '}
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                >
                                    Click here to resend the verification email.
                                </Link>
                            </p>

                            {status === 'verification-link-sent' && (
                                <div className="mt-2 text-sm font-medium text-green-600">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save</Button>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out"
                            enterFrom="opacity-0"
                            leave="transition ease-in-out"
                            leaveTo="opacity-0"
                        >
                            <p className="text-sm text-neutral-600">Saved</p>
                        </Transition>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
