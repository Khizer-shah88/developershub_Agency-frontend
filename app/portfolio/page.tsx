'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { portfolioApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

type UiService = {
  id: string;
  number: string;
  title: string;
  description: string;
  tags: string[];
};

type UiProject = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  technologies: string[];
  stat: string;
  accent: string;
  projectUrl?: string;
};

type ApiPortfolio = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  clientName?: string | null;
  projectUrl?: string | null;
  createdAt?: string;
};

const SERVICES: UiService[] = [
  {
    id: 's1',
    number: '01',
    title: 'Product Engineering',
    description:
      'Full-stack development of web and mobile products from MVP to scale with resilient architecture.',
    tags: ['Next.js', 'React Native', 'Node.js', 'PostgreSQL'],
  },
  {
    id: 's2',
    number: '02',
    title: 'Platform and Infrastructure',
    description:
      'Cloud-native infrastructure, delivery pipelines, and observability stacks for reliable operations.',
    tags: ['AWS', 'Kubernetes', 'Terraform', 'Datadog'],
  },
  {
    id: 's3',
    number: '03',
    title: 'AI and Data Engineering',
    description:
      'LLM integrations, analytics pipelines, and data products that improve product intelligence and decisions.',
    tags: ['Python', 'LangChain', 'dbt', 'Snowflake'],
  },
  {
    id: 's4',
    number: '04',
    title: 'Design Systems',
    description:
      'Reusable component systems and tokens that align design and engineering at speed.',
    tags: ['Figma', 'Storybook', 'Radix UI', 'Tailwind CSS'],
  },
];

const DEMO_PROJECTS: UiProject[] = [
  {
    id: 'p1',
    title: 'Cascade - B2B SaaS Platform',
    category: 'Product Engineering',
    year: '2024',
    description:
      'Designed and built a workflow automation SaaS for mid-market teams from discovery to GA in 14 weeks.',
    technologies: ['Next.js', 'tRPC', 'Postgres', 'AWS ECS'],
    stat: '2M+ events/day',
    accent: '#C8FF00',
  },
  {
    id: 'p2',
    title: 'Orbis - Real-Time Analytics',
    category: 'AI and Data Engineering',
    year: '2024',
    description:
      'Migrated a legacy BI stack to a streaming analytics platform with major dashboard speed gains.',
    technologies: ['ClickHouse', 'Apache Flink', 'Python', 'GPT-4o'],
    stat: '94% faster',
    accent: '#00E5FF',
  },
  {
    id: 'p3',
    title: 'Mira - Consumer Mobile App',
    category: 'Product Engineering',
    year: '2023',
    description:
      'Delivered a fintech mobile product from zero to tens of thousands of users with robust payment flows.',
    technologies: ['React Native', 'Expo', 'Supabase', 'Stripe'],
    stat: '80k users',
    accent: '#FF6B6B',
  },
  {
    id: 'p4',
    title: 'Foundry - Internal Dev Platform',
    category: 'Platform and Infrastructure',
    year: '2023',
    description:
      'Built an internal developer platform that reduced deployment time from 40 minutes to 4 minutes.',
    technologies: ['Kubernetes', 'Backstage', 'Terraform', 'GitHub Actions'],
    stat: '10x deploy speed',
    accent: '#A78BFA',
  },
];

const STATS = [
  { value: '7+', label: 'Years operating' },
  { value: '60+', label: 'Products shipped' },
  { value: '98%', label: 'Client retention' },
  { value: '3.2M', label: 'Daily active users served' },
];

const ACCENTS = ['#C8FF00', '#00E5FF', '#FF6B6B', '#A78BFA', '#34D399', '#FCD34D'];

function mapApiProjects(items: ApiPortfolio[]): UiProject[] {
  return items.map((item, index) => {
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    const year = createdAt && !Number.isNaN(createdAt.getTime()) ? String(createdAt.getFullYear()) : 'Recent';

    return {
      id: item.id,
      title: item.title,
      category: item.clientName ? 'Client Project' : 'Portfolio',
      year,
      description: item.description,
      technologies: ['Delivery', 'Engineering', 'Product', 'Quality'],
      stat: item.clientName || 'Case study',
      accent: ACCENTS[index % ACCENTS.length],
      projectUrl: item.projectUrl || undefined,
    };
  });
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function ServiceCard({ service, index }: { service: UiService; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <FadeUp delay={index * 70}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="h-full rounded-2xl border border-border/70 bg-card/60 p-7 transition-all duration-300"
        style={{
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 20px 35px rgba(0,0,0,0.10)' : '0 6px 18px rgba(0,0,0,0.04)',
        }}
      >
        <span className="mb-4 block font-mono text-xs tracking-[0.16em] text-muted-foreground">{service.number}</span>
        <h3 className="mb-2 font-display text-2xl leading-tight tracking-tight">{service.title}</h3>
        <p className="text-sm leading-7 text-muted-foreground">{service.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/80 px-3 py-1 font-mono text-[11px] tracking-[0.05em] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </FadeUp>
  );
}

function ProjectCard({ project, index }: { project: UiProject; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <FadeUp delay={index * 60}>
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-card/60 p-7 transition-all duration-300"
        style={{
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.10)' : '0 8px 20px rgba(0,0,0,0.05)',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-2 font-mono text-[11px] tracking-[0.12em] text-muted-foreground">
              {project.category} · {project.year}
            </p>
            <h3 className="font-display text-2xl leading-tight tracking-tight">{project.title}</h3>
          </div>
          <div
            className="min-w-20 rounded-xl border px-3 py-1.5 text-center"
            style={{
              borderColor: `${project.accent}45`,
              backgroundColor: `${project.accent}18`,
            }}
          >
            <span style={{ color: project.accent }} className="text-sm font-semibold">
              {project.stat}
            </span>
          </div>
        </div>

        <p className="flex-1 text-sm leading-7 text-muted-foreground">{project.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border/80 px-3 py-1 font-mono text-[11px] text-muted-foreground"
              >
                {tech}
              </span>
            ))}
          </div>
          {project.projectUrl ? (
            <Link href={project.projectUrl} target="_blank" className="text-sm text-muted-foreground hover:text-foreground">
              View ↗
            </Link>
          ) : null}
        </div>
      </article>
    </FadeUp>
  );
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<UiProject[]>(DEMO_PROJECTS);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  useEffect(() => {
    portfolioApi
      .getAll()
      .then((data: ApiPortfolio[]) => {
        if (Array.isArray(data) && data.length) {
          setProjects(mapApiProjects(data));
        }
      })
      .catch(() => {
        setProjects(DEMO_PROJECTS);
      });
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(projects.map((project) => project.category)))],
    [projects],
  );

  const filtered =
    activeFilter === 'All' ? projects : projects.filter((project) => project.category === activeFilter);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-300/10" />
      <div className="pointer-events-none absolute right-0 top-72 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-200/10" />

      <Navigation />

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-28">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Software Agency · Est. 2017</p>
        </FadeUp>
        <FadeUp delay={70}>
          <h1 className="mt-3 max-w-5xl font-display text-6xl tracking-tight sm:text-7xl">
            We build software
            <span className="text-muted-foreground"> that compounds.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={130}>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            A focused engineering studio partnering with founders and product teams to design, build, and scale digital products.
          </p>
        </FadeUp>

        <FadeUp delay={200}>
          <div className="mt-10 grid overflow-hidden rounded-2xl border border-border/70 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((item) => (
              <div key={item.label} className="border-r border-border/70 p-5 last:border-r-0">
                <p className="font-display text-4xl tracking-tight">{item.value}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </FadeUp>
      </section>

      <section className="mx-auto max-w-7xl border-t border-border/70 px-6 py-16">
        <FadeUp>
          <div className="mb-10 flex items-center gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Services</p>
            <div className="h-px flex-1 bg-border" />
          </div>
          <h2 className="mb-10 max-w-2xl font-display text-5xl tracking-tight">What we do best</h2>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {SERVICES.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t border-border/70 px-6 py-16">
        <FadeUp>
          <div className="mb-8 flex items-center gap-4">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Work</p>
            <div className="h-px flex-1 bg-border" />
          </div>

          <h2 className="mb-4 font-display text-5xl tracking-tight">Selected work</h2>

          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveFilter(category)}
                className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                  activeFilter === category
                    ? 'border-foreground/35 bg-foreground text-background'
                    : 'border-border bg-card/40 text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </FadeUp>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-5 font-mono text-xs text-muted-foreground">No projects in this category yet.</p>
        ) : null}
      </section>

      <section className="border-t border-border/70 px-6 py-20 text-center">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Start a project</p>
          <h2 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">Have something in mind?</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
            Tell us what you are building and we will put together a focused execution plan.
          </p>
          <Button asChild className="mt-8 rounded-full px-8">
            <Link href="/inquiries">Let's talk</Link>
          </Button>
        </FadeUp>
      </section>
    </main>
  );
}
