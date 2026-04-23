'use client';

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams?.get('token') || '', [searchParams]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Invalid reset link');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword,
      });
      toast.success('Password reset successful. Please sign in.');
      router.replace('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <section className="mx-auto mt-16 w-full max-w-md rounded-3xl border border-foreground/15 bg-background/70 p-8 backdrop-blur-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Secure Recovery</p>
        <h1 className="mt-2 font-display text-3xl">Reset Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">Set your new account password.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-foreground/20 bg-background/70 px-3 text-sm outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="h-11 w-full rounded-xl border border-foreground/20 bg-background/70 px-3 text-sm outline-none"
          />
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm">
            {loading ? 'Resetting...' : 'Update Password'}
          </Button>
        </form>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
