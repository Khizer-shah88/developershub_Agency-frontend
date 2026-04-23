'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { servicesApi, type Service } from '@/lib/api';
import { Button } from '@/components/ui/button';

type UiService = {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  deliverable: string;
  accent: string;
  highlights: string[];
};

const DEMO_SERVICES: UiService[] = [
  {
    id: 'demo-service-1',
    category: 'Web',
    title: 'Corporate Website Revamp',
    description:
      'High-performance, conversion-focused websites with modern UX and a headless CMS so your team can own content without touching code.',
    price: 2500,
    deliverable: '4-6 weeks',
    accent: '#00E5FF',
    highlights: ['Next.js + CMS', 'Performance audit', 'SEO baseline', 'Analytics setup'],
  },
  {
    id: 'demo-service-2',
    category: 'SaaS',
    title: 'MVP Product Build',
    description:
      'Full-stack SaaS from zero including auth, onboarding, billing, and an admin dashboard with solid scaling foundations.',
    price: 6800,
    deliverable: '10-14 weeks',
    accent: '#C8FF00',
    highlights: ['Auth + multi-tenant', 'Stripe billing', 'Admin panel', 'CI/CD pipeline'],
  },
  {
    id: 'demo-service-3',
    category: 'Mobile',
    title: 'Cross-Platform App',
    description:
      'React Native application with robust backend APIs, push notifications, and release support for both app stores.',
    price: 8400,
    deliverable: '12-16 weeks',
    accent: '#A78BFA',
    highlights: ['React Native', 'API + auth', 'Push notifications', 'Store deployment'],
  },
  {
    id: 'demo-service-4',
    category: 'Growth',
    title: 'SEO and Conversion Ops',
    description:
      'Technical SEO, Core Web Vitals remediation, and event tracking to improve traffic quality and conversion outcomes.',
    price: 1600,
    deliverable: 'Monthly',
    accent: '#34D399',
    highlights: ['Technical SEO', 'CWV fixes', 'A/B setup', 'Tracking strategy'],
  },
];

const ACCENTS = ['#00E5FF', '#C8FF00', '#FF6B6B', '#A78BFA', '#34D399', '#F59E0B'];

const PROCESS = [
  {
    step: '01',
    title: 'Discovery',
    desc: 'We map goals, constraints, and success criteria before implementation starts.',
  },
  {
    step: '02',
    title: 'Scope and plan',
    desc: 'You receive a clear proposal with deliverables, timeline, and milestones.',
  },
  {
    step: '03',
    title: 'Build',
    desc: 'Weekly demos, async updates, and a staging environment from day one.',
  },
  {
    step: '04',
    title: 'Launch and handover',
    desc: 'Deployment, documentation, and structured handover to your internal team.',
  },
];

function toCategory(service: Service) {
  if (service.category?.trim()) return service.category.trim();

  const title = service.title.toLowerCase();
  if (title.includes('app') || title.includes('mobile')) return 'Mobile';
  if (title.includes('saas') || title.includes('product')) return 'SaaS';
  if (title.includes('seo') || title.includes('growth')) return 'Growth';
  if (title.includes('brand') || title.includes('identity')) return 'Branding';
  return 'Web';
}

function toDeliverable(service: Service) {
  if (!service.price) return 'Custom timeline';
  if (service.price <= 2000) return '2-4 weeks';
  if (service.price <= 5000) return '4-8 weeks';
  if (service.price <= 9000) return '8-14 weeks';
  return 'Custom timeline';
}

function toHighlights(service: Service) {
  return [
    `${toCategory(service)} strategy`,
    'Milestone delivery',
    'Quality assurance',
    'Post-launch support',
  ];
}

function mapApiServices(items: Service[]): UiService[] {
  return items.map((service, index) => ({
    id: service.id,
    category: toCategory(service),
    title: service.title,
    description: service.description,
    price: Number(service.price || 0),
    deliverable: toDeliverable(service),
    accent: ACCENTS[index % ACCENTS.length],
    highlights: toHighlights(service),
  }));
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function ServiceCard({ service, index }: { service: UiService; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <FadeUp delay={index * 60}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur transition-all duration-300"
        style={{
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.10)' : '0 6px 20px rgba(0,0,0,0.05)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
      >
        <div className="flex items-start justify-between">
          <span
            className="rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.16em]"
            style={{
              borderColor: `${service.accent}55`,
              backgroundColor: `${service.accent}18`,
              color: service.accent,
            }}
          >
            {service.category}
          </span>
          <span className="font-mono text-xs text-muted-foreground/80">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <div>
          <h3 className="font-display text-2xl leading-tight tracking-tight">{service.title}</h3>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">{service.description}</p>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {service.highlights.map((highlight) => (
            <div key={highlight} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: service.accent }} />
              <span className="font-mono tracking-[0.04em]">{highlight}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border/70 pt-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Starting at</p>
            <p className="font-display text-3xl tracking-tight">${service.price.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Timeline</p>
            <p className="font-mono text-xs text-muted-foreground">{service.deliverable}</p>
          </div>
        </div>
      </article>
    </FadeUp>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<UiService[]>(DEMO_SERVICES);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    servicesApi
      .getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(mapApiServices(data));
        }
      })
      .catch(() => {
        setServices(DEMO_SERVICES);
      });
  }, []);

  const filters = useMemo(() => {
    const unique = Array.from(new Set(services.map((service) => service.category)));
    return ['All', ...unique];
  }, [services]);

  const filtered =
    activeFilter === 'All'
      ? services
      : services.filter((service) => service.category === activeFilter);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -left-20 top-16 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-300/10" />
      <div className="pointer-events-none absolute right-0 top-80 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-300/10" />

      <Navigation />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
            DevelopersHub services
          </p>
        </FadeUp>
        <FadeUp delay={60}>
          <h1 className="mt-3 max-w-4xl font-display text-6xl tracking-tight sm:text-7xl">
            What we build
            <span className="text-muted-foreground"> for your growth.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={120}>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            Premium digital services with transparent scope, predictable delivery, and execution that is aligned to your business outcomes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild className="rounded-full px-7">
              <Link href="/appointments">Start a project</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-7">
              <Link href="#services">View pricing</Link>
            </Button>
          </div>
        </FadeUp>
      </section>

      <section id="services" className="mx-auto max-w-7xl border-t border-border/70 px-6 py-16">
        <FadeUp>
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Services and pricing</p>
              <div className="h-px w-12 bg-border" />
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                    activeFilter === filter
                      ? 'border-foreground/40 bg-foreground text-background'
                      : 'border-border bg-card/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-6 font-mono text-xs text-muted-foreground">No services found for this category.</p>
        ) : null}
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 border-t border-border/70 px-6 py-16 lg:grid-cols-2">
        <div>
          <FadeUp>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Process</p>
            <h2 className="mt-3 max-w-xl font-display text-4xl tracking-tight sm:text-5xl">
              How your project moves from idea to launch.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
              You always know what is happening, what comes next, and how every milestone maps to business goals.
            </p>
          </FadeUp>
        </div>

        <div className="space-y-5">
          {PROCESS.map((item, index) => (
            <FadeUp key={item.step} delay={index * 80}>
              <div className="rounded-2xl border border-border/70 bg-card/60 p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{item.step}</span>
                  <h3 className="font-display text-xl tracking-tight">{item.title}</h3>
                </div>
                <p className="text-sm leading-7 text-muted-foreground">{item.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="border-t border-border/70 px-6 py-20 text-center">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Custom scope</p>
          <h2 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">
            Need a custom engagement?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Tell us what you are building and we will design the right scope, timeline, and team composition.
          </p>
          <Button asChild className="mt-8 rounded-full px-8">
            <Link href="/inquiries">Get a custom quote</Link>
          </Button>
        </FadeUp>
      </section>
    </main>
  );
}
