'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { appointmentsApi, inquiriesApi } from '@/lib/api';
import { resolveRole } from '@/lib/auth';
import { toast } from 'sonner';
import { ChevronDown, UserCircle2 } from 'lucide-react';

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const loadData = async () => {
    try {
      const [appointmentData, inquiryData] = await Promise.all([
        appointmentsApi.getAll(),
        inquiriesApi.getAll(),
      ]);
      setAppointments(appointmentData);
      setInquiries(inquiryData);
    } catch {
      toast.error('Failed to load your dashboard data');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      const parsed = rawUser ? (JSON.parse(rawUser) as AuthUser) : null;
      const role = resolveRole(parsed?.role, token);

      if (role === 'ADMIN') {
        router.replace('/admin');
        return;
      }

      const resolved = parsed ?? { role: 'CLIENT' };
      setUser(resolved);
      void loadData();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    const closeProfileMenu = () => setIsProfileOpen(false);
    window.addEventListener('click', closeProfileMenu);
    return () => window.removeEventListener('click', closeProfileMenu);
  }, []);

  if (!user) {
    return <main className="min-h-screen grid place-items-center bg-background text-foreground">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10">
        <div className="rounded-3xl border border-foreground/15 bg-gradient-to-br from-background to-foreground/[0.03] p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Client Portal</p>
              <h1 className="mt-2 font-display text-4xl">Welcome, {user.name ?? 'Client'}</h1>
              <p className="mt-2 text-sm text-muted-foreground">Track your bookings, inquiries, and progress updates.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/" className="rounded-full border border-foreground/20 px-5 py-2 text-sm hover:bg-foreground/5">
                Home
              </Link>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm text-background"
                >
                  <UserCircle2 className="size-4" />
                  Profile
                  <ChevronDown className="size-4" />
                </button>

                {isProfileOpen ? (
                  <div className="absolute right-0 top-12 z-40 w-52 rounded-2xl border border-foreground/15 bg-background p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Client</p>
                      <p className="truncate text-sm font-medium">{user.name ?? user.email ?? 'User'}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        router.replace('/login');
                      }}
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-foreground/85 transition hover:bg-foreground/5"
                    >
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-foreground/15 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Email</p>
              <p className="mt-2 text-sm">{user.email}</p>
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Appointments</p>
              <p className="mt-2 font-display text-3xl">{appointments.length}</p>
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-background/70 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Inquiries</p>
              <p className="mt-2 font-display text-3xl">{inquiries.length}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-foreground/15 bg-background/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium">My Bookings</h2>
              <Link href="/appointments" className="text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4">
                New Booking
              </Link>
            </div>
            <div className="space-y-3">
              {appointments.map((item) => (
                <article key={item.id} className="rounded-2xl border border-foreground/15 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.Service?.title || 'Service booking'}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(item.dateTime).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full border border-foreground/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.13em]">
                      {item.status || 'pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">Payment: {item.paymentStatus || 'unpaid'}</p>
                </article>
              ))}
              {!appointments.length && <p className="text-sm text-muted-foreground">No bookings yet.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-foreground/15 bg-background/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-medium">My Inquiries</h2>
              <Link href="/inquiries" className="text-xs uppercase tracking-[0.14em] text-muted-foreground underline underline-offset-4">
                New Inquiry
              </Link>
            </div>
            <div className="space-y-3">
              {inquiries.map((item) => (
                <article key={item.id} className="rounded-2xl border border-foreground/15 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{item.name}</p>
                    <span className="rounded-full border border-foreground/20 px-2.5 py-1 text-[11px] uppercase tracking-[0.13em]">
                      {item.status || 'new'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                </article>
              ))}
              {!inquiries.length && <p className="text-sm text-muted-foreground">No inquiries yet.</p>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
