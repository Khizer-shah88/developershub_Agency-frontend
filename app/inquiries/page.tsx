'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Inquiry, inquiriesApi, Service, servicesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value?: string): value is string {
  return Boolean(value && UUID_REGEX.test(value));
}

function getStoredUserId(): string | undefined {
  try {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return undefined;
    const parsed = JSON.parse(userRaw) as { id?: string };
    return parsed?.id;
  } catch {
    return undefined;
  }
}

export default function InquiriesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const load = async () => {
    try {
      const serviceData = await servicesApi.getAll();
      setServices(serviceData);
    } catch {
      toast.error('Failed to load services');
    }

    if (!localStorage.getItem('token')) {
      setItems([]);
      return;
    }
    try {
      const data = await inquiriesApi.getAll();
      setItems(data);
    } catch {
      toast.error('Failed to load inquiries');
    }
  };

  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem('token')));
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const hasToken = Boolean(localStorage.getItem('token'));
      const trimmedName = name.trim();
      const trimmedEmail = email.trim();
      const trimmedMessage = message.trim();

      if (!trimmedName || !trimmedEmail || !trimmedMessage) {
        toast.error('Name, email and message are required.');
        return;
      }

      const selectedServiceExists = services.some(
        (service) => String(service.id) === serviceId,
      );
      const normalizedServiceId =
        selectedServiceExists && isValidUuid(serviceId) ? serviceId : undefined;
      const storedUserId = hasToken ? getStoredUserId() : undefined;

      const payload: {
        name: string;
        email: string;
        message: string;
        phone?: string;
        serviceId?: string;
        userId?: string;
      } = {
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      };

      if (phone.trim()) payload.phone = phone.trim();
      if (normalizedServiceId) payload.serviceId = normalizedServiceId;
      if (isValidUuid(storedUserId)) payload.userId = storedUserId;

      await inquiriesApi.create(payload);
      setServiceId('');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      toast.success('Inquiry submitted');
      await load();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit inquiry';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -top-16 left-[10%] size-80 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-72 right-[8%] size-80 rounded-full bg-emerald-300/10 blur-3xl" />
      <Navigation />
      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-28 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Inquiries</p>
          <h1 className="mt-2 font-display text-5xl">Start A Conversation</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Tell us what you are planning and we will guide the right strategy and build path.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-2xl border border-foreground/15 p-5">
            <label className="block text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Service preference
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            >
              <option value="">General inquiry (no specific service)</option>
              {services.map((service) => (
                <option key={service.id} value={String(service.id)}>
                  {service.title}
                  {service.category ? ` (${service.category})` : ''}
                </option>
              ))}
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message"
              required
              rows={5}
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <Button type="submit" disabled={loading} className="rounded-xl border border-foreground/25 px-4 py-2 text-sm">
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5 backdrop-blur">
          <h2 className="text-xl font-medium">Your Recent Inquiries</h2>
          {!loggedIn ? (
            <p className="mt-4 text-sm text-muted-foreground">Login to view your inquiry history.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-foreground/15 bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{item.name}</h3>
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {item.status || 'pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{item.Service?.title ? `Service: ${item.Service.title}` : 'General inquiry'}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.message}</p>
                </article>
              ))}
              {!items.length && <p className="text-sm text-muted-foreground">No inquiries found.</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
