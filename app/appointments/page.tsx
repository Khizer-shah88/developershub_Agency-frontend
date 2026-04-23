'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { Appointment, appointmentsApi, paymentsApi, Service, servicesApi } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function isValidUuid(value?: string): value is string {
  return Boolean(value && UUID_REGEX.test(value));
}

function toLocalDateTimeInputValue(date = new Date()): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

const FALLBACK_SERVICE_OPTIONS: Service[] = [
  {
    id: 'fallback-web-app',
    title: 'Web App Development',
    description: 'Modern web application design and implementation',
    category: 'Engineering',
    price: null,
  },
  {
    id: 'fallback-mobile-app',
    title: 'Mobile App Development',
    description: 'Cross-platform and native mobile product delivery',
    category: 'Engineering',
    price: null,
  },
  {
    id: 'fallback-ui-ux',
    title: 'UI/UX Design',
    description: 'Product UX strategy and interface design',
    category: 'Design',
    price: null,
  },
  {
    id: 'fallback-devops',
    title: 'DevOps and Cloud',
    description: 'Infrastructure, CI/CD and cloud operations',
    category: 'Infrastructure',
    price: null,
  },

  {
    id: 'fallback-consultation',
    title: 'Consultation Session',
    description: 'One-on-one session to discuss your project needs and get expert advice',
    category: 'Consultation',
    price: null,
  
  },

  {
    id: 'fallback-custom',
    title: 'Custom Service',
    description: 'Tailored service to fit your unique project requirements',
    category: 'Custom',
    price: null,
  }


];

export default function AppointmentsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<Appointment[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [minDateTime, setMinDateTime] = useState('');

  const load = async (showErrors = true) => {
    try {
      const serviceData = await servicesApi.getAll();
      setServices(serviceData.length ? serviceData : FALLBACK_SERVICE_OPTIONS);
    } catch {
      setServices(FALLBACK_SERVICE_OPTIONS);
      toast.error('Failed to load services');
    }

    if (localStorage.getItem('token')) {
      try {
        const appointments = await appointmentsApi.getAll();
        setItems(appointments);
      } catch {
        setItems([]);
        if (showErrors) {
          toast.error('Failed to load appointments');
        }
      }
    }
  };

  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem('token')));
    setMinDateTime(toLocalDateTimeInputValue());
    load();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      toast.error('Select a service first');
      return;
    }
    setLoading(true);
    try {
      const normalizedServiceId =
        serviceId.startsWith('fallback-') || !isValidUuid(serviceId) ? undefined : serviceId;
      const parsedDateTime = new Date(dateTime);

      if (!dateTime || Number.isNaN(parsedDateTime.getTime())) {
        toast.error('Please select a valid appointment date and time.');
        return;
      }

      const normalizedDateTime = parsedDateTime.toISOString();
      const hasToken = Boolean(localStorage.getItem('token'));
      const userId = hasToken ? getStoredUserId() : undefined;

      const payload: {
        name: string;
        email: string;
        phone?: string;
        serviceId?: string;
        dateTime: string;
        notes?: string;
        userId?: string;
      } = {
        name,
        email,
        dateTime: normalizedDateTime,
      };

      if (phone.trim()) payload.phone = phone.trim();
      if (notes.trim()) payload.notes = notes.trim();
      if (normalizedServiceId) payload.serviceId = normalizedServiceId;
      if (isValidUuid(userId)) payload.userId = userId;

      const createdAppointment = await appointmentsApi.create(payload);

      const selectedService = services.find((service) => String(service.id) === serviceId);
      if (selectedService?.price && selectedService.price > 0) {
        if (createdAppointment?.id) {
          try {
            const checkout = await paymentsApi.createCheckout({
              appointmentId: createdAppointment.id,
              amount: selectedService.price,
            });
            window.location.href = checkout.url;
            return;
          } catch {
            toast.warning('Appointment created, but payment checkout is unavailable right now.');
          }
        }
      }

      setDateTime('');
      setName('');
      setEmail('');
      setPhone('');
      setNotes('');
      toast.success('Appointment requested');

      // Refresh appointment history quietly so submit success is not masked by list-fetch issues.
      if (localStorage.getItem('token')) {
        await load(false);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to request appointment';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -top-20 left-[8%] size-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-64 right-[6%] size-80 rounded-full bg-amber-300/10 blur-3xl" />
      <Navigation />
      <section className="relative z-10 mx-auto grid max-w-7xl gap-8 px-6 pb-16 pt-28 lg:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Appointments</p>
          <h1 className="mt-2 font-display text-5xl">Book A Session</h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Pick your service and preferred date to begin your project discussion.
          </p>
          <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-2xl border border-foreground/15 p-5">
            <label className="block text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground">
              Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
              required
            >
              <option value="" disabled>
                Select a service by name
              </option>
              {services.map((service) => (
                <option key={service.id} value={String(service.id)}>
                  {service.title}
                  {service.category ? ` (${service.category})` : ''}
                  {typeof service.price === 'number' ? ` - $${service.price}` : ''}
                </option>
              ))}
            </select>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
              required
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
              min={minDateTime}
              required
            />
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes"
              rows={4}
              className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <Button type="submit" disabled={loading} className="rounded-xl border border-foreground/25 px-4 py-2 text-sm">
              {loading ? 'Submitting...' : 'Request Appointment'}
            </Button>
          </form>
        </div>

        <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5 backdrop-blur">
          <h2 className="text-xl font-medium">Your Appointments</h2>
          {!loggedIn ? (
            <p className="mt-4 text-sm text-muted-foreground">Login to view your appointment history.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-foreground/15 bg-background/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium">{item.Service?.title || 'Service'}</h3>
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      {item.status || 'pending'}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {new Date(item.dateTime).toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Payment: {item.paymentStatus || 'unpaid'}</p>
                  {item.notes ? <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p> : null}
                </article>
              ))}
              {!items.length && <p className="text-sm text-muted-foreground">No appointments found.</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
