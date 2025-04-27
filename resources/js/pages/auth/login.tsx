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
        <div className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4 overflow-hidden">
            {/* Animated Gradient Background */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 animate-gradient-move bg-gradient-to-tr from-primary/30 via-fuchsia-300/30 to-sky-400/30 dark:from-[#0A0A0A]/90 dark:via-primary/20 dark:to-fuchsia-800/20 blur-2xl opacity-80"
            />
            {/* Floating Accent Shapes */}
            <div className="absolute left-10 top-10 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-float-slow" />
            <div className="absolute right-12 bottom-12 w-32 h-32 bg-fuchsia-400/20 rounded-full blur-3xl animate-float-slower" />
            <Head title="Log in" />
            
            <Card className="w-full max-w-[900px] overflow-hidden z-10 shadow-xl transition-transform duration-300 hover:scale-[1.015] hover:shadow-2xl bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-0">
                <div className="grid md:grid-cols-2">
                    <div className="p-8">
                        <div className="mb-8 text-center relative">
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white animate-fade-in">Selamat Datang Di Sistem Pembayaran SPP</h1>
                            <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1 animate-fade-in delay-200">TK PARADISE</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
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
                                    className="mt-1 bg-[#121212] border-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>
                            
                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-muted-foreground">Password</Label>

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
                                    className="mt-1 bg-[#121212] border-gray-700"
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
                                    />
                                    <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
                                </div>
                            )}
                            
                            <Button 
                                type="submit" 
                                className="w-full bg-gray-900 hover:bg-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                                tabIndex={4} 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                Login
                            </Button>

                        </form>
                        

                        {/* Status message (success, etc.) */}
                        {status && <div className="mt-4 text-center text-sm font-medium text-green-600">{status}</div>}
                    </div>
                    <div className="relative hidden bg-gray-50 md:flex md:items-center md:justify-center overflow-hidden">
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
            
            <div className="absolute bottom-4 text-center text-xs text-muted-foreground z-10">
                By clicking continue, you agree to our <a href="#" className="text-muted-foreground underline underline-offset-2">Terms of Service</a> and <a href="#" className="text-muted-foreground underline underline-offset-2">Privacy Policy</a>.
            </div>
            {/*
            Add the following Tailwind CSS custom animation styles to your global CSS (e.g., app.css or tailwind.css):

            .animate-gradient-move {
              background-size: 200% 200%;
              animation: gradient-move 8s ease-in-out infinite;
            }
            @keyframes gradient-move {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-float-slow {
              animation: float-slow 8s ease-in-out infinite alternate;
            }
            .animate-float-slower {
              animation: float-slower 14s ease-in-out infinite alternate;
            }
            @keyframes float-slow {
              0% { transform: translateY(0) scale(1); }
              100% { transform: translateY(-14px) scale(1.07); }
            }
            @keyframes float-slower {
              0% { transform: translateY(0) scale(1); }
              100% { transform: translateY(18px) scale(1.05); }
            }
            .animate-fade-in {
              animation: fade-in 1s cubic-bezier(.32,0,.67,0.99) both;
            }
            @keyframes fade-in {
              0% { opacity: 0; transform: translateY(12px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-pulse-glow {
              animation: pulse-glow 2s infinite alternate;
            }
            @keyframes pulse-glow {
              0% { filter: blur(0) brightness(1.2); opacity: .6; }
              100% { filter: blur(4px) brightness(2); opacity: 1; }
            }
            */}
        </div>
    );
}
