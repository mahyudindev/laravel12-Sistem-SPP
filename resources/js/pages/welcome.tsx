import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-[#0A0A0A] p-4 overflow-hidden">
            {/* Animated Gradient Background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 animate-gradient-move bg-gradient-to-tr from-primary/20 via-fuchsia-300/20 to-sky-400/20 dark:from-[#0A0A0A]/90 dark:via-primary/20 dark:to-fuchsia-800/20 blur-2xl opacity-80"
            />
            {/* Floating Accent Shapes */}
            <div className="absolute left-10 top-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-float-slow" />
            <div className="absolute right-12 bottom-12 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-3xl animate-float-slower" />
            <Head title="Log in" />
            
            <Card className="w-full max-w-[900px] overflow-hidden z-10 shadow-xl transition-transform duration-300 hover:scale-[1.015] hover:shadow-2xl bg-white dark:bg-[#121212] backdrop-blur-md border border-gray-200 dark:border-gray-800">
                <div className="grid md:grid-cols-2">
                    <div className="p-8">
                        <div className="mb-8 text-center relative">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white animate-fade-in">Selamat Datang Di Sistem Pembayaran SPP</h1>
                            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1 animate-fade-in delay-200">TK PARADISE</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="m@example.com"
                                    className="mt-1 bg-white dark:bg-[#1E1E1E] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                                />
                                <InputError message={errors.email} />
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    className="mt-1 bg-white dark:bg-[#1E1E1E] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                                />
                                <InputError message={errors.password} />
                                {errors && errors.email === 'These credentials do not match our records.' && (
                                    <div className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">
                                        Email atau kata sandi salah. Silakan periksa kembali.
                                    </div>
                                )}
                            </div>
                            
                            {data.remember !== undefined && (
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onClick={() => setData('remember', !data.remember)}
                                        tabIndex={3}
                                        className="border-gray-300 dark:border-gray-700"
                                    />
                                    <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300">Remember me</Label>
                                </div>
                            )}
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-primary hover:bg-primary/90 text-black transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Login
                            </Button>
                        </form>

                        {/* Status message (success, etc.) */}
                        {status && <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">{status}</div>}
                    </div>
                    <div className="relative hidden bg-gray-50 dark:bg-[#1E1E1E] md:flex md:items-center md:justify-center overflow-hidden">
                        {/* Animated floating accent for visual interest */}
                        <div className="absolute left-4 top-4 w-16 h-16 bg-primary/20 rounded-full blur-2xl animate-float-slow" />
                        <div className="absolute right-8 bottom-8 w-24 h-24 bg-fuchsia-400/20 rounded-full blur-3xl animate-float-slower" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src="/image/logo.png"
                                alt="Logo TK PARADISE"
                                className="max-w-[200px] max-h-[200px] object-contain animate-fade-in rounded-xl"
                            />
                        </div>
                    </div> 
                </div>
            </Card>
        </div>
    );
}
