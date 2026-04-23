'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Navigation } from '@/components/landing/navigation';
import { blogApi } from '@/lib/api';
import { resolveRole } from '@/lib/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type ApiBlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string | null;
  author: string;
  createdAt: string;
  updatedAt: string;
};

type UiPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  readTime: string;
  date: string;
  featured: boolean;
  excerpt: string;
  accent: string;
  author: string;
  imageUrl?: string;
};

type BlogForm = {
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  author: string;
};

const CATEGORIES = ['All', 'Agency Notes', 'Engineering', 'Product', 'Design', 'Culture'];
const ACCENTS = ['#00E5FF', '#FCD34D', '#C8FF00', '#34D399', '#FF6B6B', '#FB7185'];

const DEMO_POSTS: UiPost[] = [
  {
    id: 'b1',
    title: 'How we shipped a real-time analytics platform in 8 weeks',
    slug: 'real-time-analytics-8-weeks',
    category: 'Engineering',
    readTime: '9 min read',
    date: 'Jun 12, 2025',
    featured: true,
    excerpt:
      "ClickHouse, Apache Flink, and a lot of late nights. Here's the architecture story behind Orbis and what we'd change now.",
    accent: '#00E5FF',
    author: 'Developer Hub Team',
    imageUrl: '',
  },
  {
    id: 'b2',
    title: "Design systems are not documentation, they are culture",
    slug: 'design-systems-culture',
    category: 'Design',
    readTime: '6 min read',
    date: 'May 28, 2025',
    featured: false,
    excerpt:
      'After building Prism for a 5-team org, the hardest part was behavior change, not components or tokens.',
    accent: '#FCD34D',
    author: 'Developer Hub Team',
    imageUrl: '',
  },
  {
    id: 'b3',
    title: 'The 14-week SaaS playbook: from wireframe to 2M events/day',
    slug: 'saas-playbook-14-weeks',
    category: 'Product',
    readTime: '11 min read',
    date: 'May 09, 2025',
    featured: false,
    excerpt:
      'A tactical breakdown of how we took Cascade from discovery to GA, including sprint decisions and launch tradeoffs.',
    accent: '#C8FF00',
    author: 'Developer Hub Team',
    imageUrl: '',
  },
  {
    id: 'b4',
    title: 'tRPC at scale: lessons from 18 months in production',
    slug: 'trpc-at-scale',
    category: 'Engineering',
    readTime: '8 min read',
    date: 'Apr 17, 2025',
    featured: false,
    excerpt:
      'A practical look at monorepo caching, bundle boundaries, and error handling patterns that held up under load.',
    accent: '#A78BFA',
    author: 'Developer Hub Team',
    imageUrl: '',
  },
  {
    id: 'b5',
    title: 'Natural-language BI: GPT-4o + ClickHouse in practice',
    slug: 'nlq-gpt4o-clickhouse',
    category: 'Engineering',
    readTime: '7 min read',
    date: 'Mar 31, 2025',
    featured: false,
    excerpt:
      'Prompt architecture, guardrails, and UX lessons from deploying a natural-language analytics layer for operations teams.',
    accent: '#34D399',
    author: 'Developer Hub Team',
    imageUrl: '',
  },
];

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function toExcerpt(input: string, maxLen = 180) {
  const text = stripHtml(input);
  if (text.length <= maxLen) return text;
  return `${text.slice(0, maxLen).trimEnd()}...`;
}

function formatDate(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function estimateReadTime(input: string) {
  const words = stripHtml(input).split(' ').filter(Boolean).length;
  const minutes = Math.max(3, Math.ceil(words / 220));
  return `${minutes} min read`;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function mapApiPostsToUi(posts: ApiBlogPost[]): UiPost[] {
  return posts.map((post, index) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: 'Agency Notes',
    readTime: estimateReadTime(post.content),
    date: formatDate(post.createdAt),
    featured: index === 0,
    excerpt: toExcerpt(post.content),
    accent: ACCENTS[index % ACCENTS.length],
    author: post.author || 'Developer Hub Team',
    imageUrl: post.imageUrl || '',
  }));
}

function useInView(threshold = 0.12) {
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
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function FeaturedPost({ post }: { post: UiPost }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeUp delay={100}>
      <Link
        href={`/blog/${post.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block"
      >
        <article
          className="grid items-end gap-7 rounded-3xl border border-border/80 p-7 transition-all duration-300 md:grid-cols-[1fr_auto] md:p-10"
          style={{
            transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
            background: hovered
              ? 'linear-gradient(140deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))'
              : 'linear-gradient(140deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            boxShadow: hovered ? '0 18px 34px rgba(0,0,0,0.12)' : '0 6px 16px rgba(0,0,0,0.06)',
          }}
        >
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span
                className="rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ borderColor: `${post.accent}40`, backgroundColor: `${post.accent}16`, color: post.accent }}
              >
                Featured
              </span>
              <span className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground">{post.category}</span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground">{post.author}</span>
            </div>

            <h2 className="max-w-3xl font-display text-3xl leading-tight tracking-tight md:text-4xl">{post.title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
          </div>

          <div className="flex flex-row items-center gap-4 text-right md:flex-col md:items-end md:gap-1">
            <span className="font-mono text-[11px] text-muted-foreground">{post.date}</span>
            <span className="font-mono text-[11px] text-muted-foreground">{post.readTime}</span>
            <span
              className="mt-0 text-xl transition-all md:mt-2"
              style={{ color: hovered ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
            >
              ↗
            </span>
          </div>
        </article>
      </Link>
    </FadeUp>
  );
}

function PostRow({ post, index }: { post: UiPost; index: number }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeUp delay={index * 55}>
      <Link
        href={`/blog/${post.slug}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="block"
      >
        <article
          className="grid items-center gap-4 border-b border-border/80 py-6 transition-opacity md:grid-cols-[1fr_auto]"
          style={{ opacity: hovered ? 1 : 0.88 }}
        >
          <div>
            <div className="mb-2 flex items-center gap-3">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: post.accent }}
              >
                {post.category}
              </span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/70" />
              <span className="font-mono text-[11px] text-muted-foreground">{post.date}</span>
            </div>

            <h3 className="font-display text-xl leading-tight tracking-tight">{post.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{post.excerpt}</p>
          </div>

          <div className="flex items-center gap-3 md:flex-col md:items-end md:gap-1">
            <span className="font-mono text-[11px] text-muted-foreground">{post.readTime}</span>
            <span className="text-lg text-muted-foreground">↗</span>
          </div>
        </article>
      </Link>
    </FadeUp>
  );
}

export default function BlogPage() {
  const [apiPosts, setApiPosts] = useState<ApiBlogPost[]>([]);
  const [posts, setPosts] = useState<UiPost[]>(DEMO_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  const [source, setSource] = useState<'api' | 'demo' | 'mixed'>('demo');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<BlogForm>({
    title: '',
    slug: '',
    content: '',
    imageUrl: '',
    author: '',
  });

  const resetForm = () => {
    setBlogForm({
      title: '',
      slug: '',
      content: '',
      imageUrl: '',
      author: '',
    });
    setEditingPostId(null);
  };

  const loadPosts = async () => {
    const data = (await blogApi.getAll()) as ApiBlogPost[];
    if (Array.isArray(data)) {
      setApiPosts(data);
      if (data.length > 0) {
        const apiUiPosts = mapApiPostsToUi(data);

        if (apiUiPosts.length >= 4) {
          setPosts(apiUiPosts);
          setSource('api');
          return;
        }

        const needed = 4 - apiUiPosts.length;
        const demoFill = DEMO_POSTS.filter(
          (demoPost) => !apiUiPosts.some((apiPost) => apiPost.slug === demoPost.slug),
        ).slice(0, needed);

        setPosts([...apiUiPosts, ...demoFill]);
        setSource('mixed');
        return;
      }
    }
    setPosts(DEMO_POSTS);
    setSource('demo');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    try {
      const user = userRaw ? (JSON.parse(userRaw) as { role?: string }) : null;
      setIsAdmin(resolveRole(user?.role, token) === 'ADMIN');
    } catch {
      setIsAdmin(false);
    }

    loadPosts()
      .catch(() => {
        setApiPosts([]);
        setPosts(DEMO_POSTS);
        setSource('demo');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const onCreateOrUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('Only admin can manage blog posts.');
      return;
    }

    const title = blogForm.title.trim();
    const content = blogForm.content.trim();
    const author = blogForm.author.trim() || 'Developer Hub Team';
    const slug = (blogForm.slug.trim() || slugify(title)).trim();

    if (!title || !content || !slug) {
      toast.error('Title, slug and content are required.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title,
        slug,
        content,
        author,
        imageUrl: blogForm.imageUrl.trim() || null,
      };

      if (editingPostId) {
        await blogApi.update(editingPostId, payload);
        toast.success('Blog post updated');
      } else {
        await blogApi.create(payload);
        toast.success('Blog post created');
      }

      resetForm();
      await loadPosts();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save blog post';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSaving(false);
    }
  };

  const onEdit = (post: ApiBlogPost) => {
    setEditingPostId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      imageUrl: post.imageUrl || '',
      author: post.author || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async (postId: string) => {
    if (!isAdmin) {
      toast.error('Only admin can delete posts.');
      return;
    }

    if (!window.confirm('Delete this blog post?')) return;

    try {
      await blogApi.remove(postId);
      if (editingPostId === postId) {
        resetForm();
      }
      await loadPosts();
      toast.success('Blog post deleted');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete blog post';
      toast.error(Array.isArray(message) ? message.join(', ') : message);
    }
  };

  const featured = posts.find((post) => post.featured);
  const rest = posts.filter((post) => !post.featured);

  const availableCategories = useMemo(() => {
    const fromPosts = Array.from(new Set(rest.map((post) => post.category)));
    return ['All', ...fromPosts.filter((category) => CATEGORIES.includes(category))];
  }, [rest]);

  const filtered =
    activeCategory === 'All' ? rest : rest.filter((post) => post.category === activeCategory);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute -top-28 left-[10%] h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-200/10" />
      <div className="pointer-events-none absolute right-[2%] top-64 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl dark:bg-amber-200/10" />

      <Navigation />

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 pt-28">
        <FadeUp>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">Journal</p>
        </FadeUp>
        <FadeUp delay={70}>
          <h1 className="mt-3 max-w-4xl font-display text-6xl tracking-tight sm:text-7xl">
            Thinking out <span className="text-muted-foreground">loud.</span>
          </h1>
        </FadeUp>
        <FadeUp delay={130}>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground">
            Engineering deep-dives, product retrospectives, and honest stories from building software in the real world.
          </p>
        </FadeUp>
        <FadeUp delay={170}>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border bg-card/70 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {source === 'api'
                ? 'Live content'
                : source === 'mixed'
                  ? 'Live + demo content'
                  : 'Demo content'}
            </span>
            {isLoading ? <span className="font-mono text-xs text-muted-foreground">Syncing posts...</span> : null}
          </div>
        </FadeUp>

        {isAdmin ? (
          <FadeUp delay={200}>
            <div className="mt-8 rounded-2xl border border-foreground/15 bg-background/70 p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-2xl tracking-tight">
                  {editingPostId ? 'Edit blog post' : 'Create blog post'}
                </h2>
                {editingPostId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel edit
                  </Button>
                ) : null}
              </div>

              <form onSubmit={onCreateOrUpdate} className="grid gap-3 md:grid-cols-2">
                <input
                  value={blogForm.title}
                  onChange={(e) =>
                    setBlogForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                      slug: prev.slug ? prev.slug : slugify(e.target.value),
                    }))
                  }
                  placeholder="Post title"
                  className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
                  required
                />
                <input
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm((prev) => ({ ...prev, slug: slugify(e.target.value) }))}
                  placeholder="post-slug"
                  className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
                  required
                />
                <input
                  value={blogForm.author}
                  onChange={(e) => setBlogForm((prev) => ({ ...prev, author: e.target.value }))}
                  placeholder="Author"
                  className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
                />
                <input
                  value={blogForm.imageUrl}
                  onChange={(e) => setBlogForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Image URL (optional)"
                  className="w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
                />
                <textarea
                  value={blogForm.content}
                  onChange={(e) => setBlogForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Write post content..."
                  rows={6}
                  className="md:col-span-2 w-full rounded-xl border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none"
                  required
                />
                <div className="md:col-span-2 flex flex-wrap gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingPostId ? 'Update post' : 'Create post'}
                  </Button>
                </div>
              </form>

              <div className="mt-5 space-y-2">
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">Manage posts</p>
                {apiPosts.length ? (
                  apiPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-foreground/10 px-3 py-2"
                    >
                      <div>
                        <p className="text-sm font-medium">{post.title}</p>
                        <p className="text-xs text-muted-foreground">/{post.slug}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onEdit(post)}>
                          Edit
                        </Button>
                        <Button type="button" variant="destructive" onClick={() => onDelete(post.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No API posts yet. Create your first post above.</p>
                )}
              </div>
            </div>
          </FadeUp>
        ) : null}
      </section>

      <section className="mx-auto max-w-7xl border-t border-border/80 px-6 py-12">
        {featured ? (
          <>
            <FadeUp>
              <div className="mb-4 flex items-center gap-4">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Latest</p>
                <div className="h-px flex-1 bg-border" />
              </div>
            </FadeUp>
            <FeaturedPost post={featured} />
          </>
        ) : null}

        <FadeUp>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">All posts</p>
              <div className="h-px w-14 bg-border" />
            </div>

            <div className="flex flex-wrap gap-2">
              {availableCategories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] transition ${
                    activeCategory === category
                      ? 'border-foreground/35 bg-foreground text-background'
                      : 'border-border bg-card/40 text-muted-foreground hover:border-foreground/25 hover:text-foreground'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </FadeUp>

        <div className="mt-2">
          {filtered.length ? (
            filtered.map((post, index) => <PostRow key={post.id} post={post} index={index} />)
          ) : (
            <FadeUp>
              <p className="pt-8 font-mono text-xs text-muted-foreground">No posts in this category yet.</p>
            </FadeUp>
          )}
        </div>
      </section>

      <section className="border-t border-border/80 px-6 py-14">
        <FadeUp>
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
            <div>
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Newsletter</p>
              <p className="font-display text-3xl tracking-tight">Get new posts in your inbox.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="w-64 rounded-full border border-border bg-card/60 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-foreground/35"
              />
              <Button className="rounded-full px-6">Subscribe</Button>
            </div>
          </div>
        </FadeUp>
      </section>
    </main>
  );
}