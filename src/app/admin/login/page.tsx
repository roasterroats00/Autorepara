'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from '@/lib/auth-client';

export default function AdminLoginPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    // Redirect if already logged in
    useEffect(() => {
        if (session && !isPending) {
            router.push('/admin');
        }
    }, [session, isPending, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn.email({
                email: formData.email,
                password: formData.password,
            });

            if (result.error) {
                setError(result.error.message || 'Login failed. Please check your credentials.');
            } else {
                router.push('/admin');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isPending) {
        return (
            <div className="min-h-screen bg-mf-dark flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-mf-green"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-mf-dark flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div className="w-10 h-10 bg-mf-green rounded-lg flex items-center justify-center text-mf-dark">
                            <span className="material-symbols-outlined text-2xl">directions_car</span>
                        </div>
                        <span className="font-bold text-2xl text-white">AutoRepair</span>
                    </Link>
                    <h1 className="text-xl text-gray-400 mt-4">Admin Panel</h1>
                </div>

                {/* Login Form */}
                <div className="bg-mf-card rounded-2xl p-8 border border-[#26342b]">
                    <div className="text-center mb-6">
                        <span className="material-symbols-outlined text-mf-green text-4xl mb-2">admin_panel_settings</span>
                        <h2 className="text-white text-lg font-semibold">Administrator Login</h2>
                        <p className="text-gray-500 text-sm mt-1">Enter your credentials to access the dashboard</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="admin@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-gray-400 text-sm mb-2">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-mf-dark border border-[#26342b] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-mf-green"
                                placeholder="••••••••"
                                required
                                minLength={8}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-mf-green hover:bg-mf-green-hover text-mf-dark font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-mf-dark"></span>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined">login</span>
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-gray-500 text-sm mt-6">
                    <Link href="/" className="text-mf-green hover:underline">
                        ← Back to Home
                    </Link>
                </p>
            </div>
        </div>
    );
}
