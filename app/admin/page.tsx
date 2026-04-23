'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { resolveRole } from '@/lib/auth';
import {
  adminApi,
  appointmentsApi,
  blogApi,
  inquiriesApi,
  portfolioApi,
  servicesApi,
  type AdminUser,
  type OverviewResponse,
} from '@/lib/api';
import { toast } from 'sonner';
import { useSocket } from '@/hooks/useSocket';

type AuthUser = {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
};

type ServiceForm = {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
};

type PortfolioForm = {
  title: string;
  description: string;
  imageUrl: string;
  clientName: string;
  projectUrl: string;
};

type BlogForm = {
  title: string;
  slug: string;
  content: string;
  imageUrl: string;
  author: string;
};

const TABS = [
  'Overview',
  'Services',
  'Portfolio',
  'Blog',
  'Inquiries',
  'Appointments',
  'Manage Users',
] as const;

const INQUIRY_STATUSES = ['new', 'read', 'replied'];
const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled'];

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Overview');
  const [busy, setBusy] = useState(false);

  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [serviceForm, setServiceForm] = useState<ServiceForm>({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '',
  });

  const [portfolioForm, setPortfolioForm] = useState<PortfolioForm>({
    title: '',
    description: '',
    imageUrl: '',
    clientName: '',
    projectUrl: '',
  });

  const [blogForm, setBlogForm] = useState<BlogForm>({
    title: '',
    slug: '',
    content: '',
    imageUrl: '',
    author: '',
  });

  const adminUserCount = useMemo(() => users.filter((u) => u.role === 'ADMIN').length, [users]);

  const loadEverything = useCallback(async () => {
    setBusy(true);
    try {
      const [overviewRes, usersRes, servicesRes, portfolioRes, postsRes, inquiriesRes, appointmentsRes] =
        await Promise.all([
          adminApi.getOverview(),
          adminApi.getUsers(),
          servicesApi.getAll(),
          portfolioApi.getAll(),
          blogApi.getAll(),
          inquiriesApi.getAll(),
          appointmentsApi.getAll(),
        ]);

      setOverview(overviewRes);
      setUsers(usersRes);
      setServices(servicesRes);
      setPortfolio(portfolioRes);
      setPosts(postsRes);
      setInquiries(inquiriesRes);
      setAppointments(appointmentsRes);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to load admin data');
    } finally {
      setBusy(false);
    }
  }, []);

  const handleRealtimeInquiry = useCallback(
    () => {
      toast.success('New inquiry received');
      loadEverything();
    },
    [loadEverything],
  );

  const handleRealtimeAppointment = useCallback(
    () => {
      toast.success('New appointment received');
      loadEverything();
    },
    [loadEverything],
  );

  useSocket({ onInquiry: handleRealtimeInquiry, onAppointment: handleRealtimeAppointment });

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

      if (role !== 'ADMIN') {
        router.replace('/dashboard');
        return;
      }

      const currentUser = parsed ?? { role: 'ADMIN' };
      setUser(currentUser);
      loadEverything();
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  }, [router, loadEverything]);

  const handleCreateService = async () => {
    try {
      await servicesApi.create({
        title: serviceForm.title,
        description: serviceForm.description,
        price: serviceForm.price ? Number(serviceForm.price) : null,
        imageUrl: serviceForm.imageUrl || null,
        category: serviceForm.category || null,
      });
      setServiceForm({ title: '', description: '', price: '', imageUrl: '', category: '' });
      toast.success('Service created');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create service');
    }
  };

  const handleCreatePortfolio = async () => {
    try {
      await portfolioApi.create({
        title: portfolioForm.title,
        description: portfolioForm.description,
        imageUrl: portfolioForm.imageUrl,
        clientName: portfolioForm.clientName || null,
        projectUrl: portfolioForm.projectUrl || null,
      });
      setPortfolioForm({ title: '', description: '', imageUrl: '', clientName: '', projectUrl: '' });
      toast.success('Portfolio item created');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create portfolio item');
    }
  };

  const handleCreateBlogPost = async () => {
    try {
      await blogApi.create({ ...blogForm });
      setBlogForm({ title: '', slug: '', content: '', imageUrl: '', author: '' });
      toast.success('Blog post created');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create blog post');
    }
  };

  const handleEditRecord = async (
    moduleName: 'service' | 'portfolio' | 'blog',
    item: any,
  ) => {
    const title = window.prompt('Title', item.title || '');
    if (title === null) return;
    const description = window.prompt('Description', item.description || '');
    if (description === null) return;

    try {
      if (moduleName === 'service') {
        const category = window.prompt('Category', item.category || '');
        if (category === null) return;
        const priceRaw = window.prompt('Price', item.price?.toString() || '');
        if (priceRaw === null) return;

        await servicesApi.update(item.id, {
          title,
          description,
          category: category || null,
          price: priceRaw ? Number(priceRaw) : null,
          imageUrl: item.imageUrl || null,
        });
      }

      if (moduleName === 'portfolio') {
        await portfolioApi.update(item.id, {
          title,
          description,
          imageUrl: item.imageUrl,
          clientName: item.clientName || null,
          projectUrl: item.projectUrl || null,
        });
      }

      if (moduleName === 'blog') {
        const slug = window.prompt('Slug', item.slug || '');
        if (slug === null) return;
        const author = window.prompt('Author', item.author || '');
        if (author === null) return;
        const content = window.prompt('Content', item.content || '');
        if (content === null) return;

        await blogApi.update(item.id, {
          title,
          description,
          slug,
          author,
          content,
          imageUrl: item.imageUrl || null,
        });
      }

      toast.success('Item updated');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteRecord = async (moduleName: 'service' | 'portfolio' | 'blog', id: string) => {
    if (!window.confirm('Delete this item?')) return;

    try {
      if (moduleName === 'service') await servicesApi.remove(id);
      if (moduleName === 'portfolio') await portfolioApi.remove(id);
      if (moduleName === 'blog') await blogApi.remove(id);
      toast.success('Item deleted');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Delete failed');
    }
  };

  const handleInquiryStatusChange = async (id: string, status: string) => {
    try {
      await inquiriesApi.updateStatus(id, status);
      toast.success('Inquiry status updated');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update inquiry status');
    }
  };

  const handleAppointmentStatusChange = async (id: string, status: string) => {
    try {
      await appointmentsApi.updateStatus(id, status);
      toast.success('Appointment status updated');
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleUserRoleChange = async (targetUser: AdminUser, role: 'ADMIN' | 'CLIENT') => {
    try {
      await adminApi.updateUserRole(targetUser.id, role);
      toast.success(`Role updated for ${targetUser.email}`);
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleRemoveUser = async (targetUser: AdminUser) => {
    const isConfirmed = window.confirm(
      `Remove ${targetUser.email}? This will revoke access and remove this account.`,
    );
    if (!isConfirmed) return;

    try {
      await adminApi.removeUser(targetUser.id);
      toast.success(`Removed ${targetUser.email}`);
      loadEverything();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove user');
    }
  };

  if (!user) {
    return <main className="min-h-screen grid place-items-center bg-background text-foreground">Loading...</main>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">DevelopersHub Corporation</p>
            <h1 className="mt-2 font-display text-4xl">Admin Control Center</h1>
            <p className="mt-2 text-muted-foreground">
              Welcome, {user.name ?? 'Admin'} ({user.email})
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => loadEverything()}
              className="rounded-full border border-foreground/20 px-5 py-2 text-sm hover:bg-foreground/5"
            >
              {busy ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link href="/" className="rounded-full border border-foreground/20 px-5 py-2 text-sm hover:bg-foreground/5">
              Home
            </Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.replace('/login');
              }}
              className="rounded-full bg-foreground px-5 py-2 text-sm text-background"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                activeTab === tab
                  ? 'bg-foreground text-background'
                  : 'border border-foreground/20 hover:bg-foreground/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Users', overview?.stats.users ?? 0],
                ['Services', overview?.stats.services ?? 0],
                ['Portfolio', overview?.stats.portfolio ?? 0],
                ['Blog Posts', overview?.stats.blogPosts ?? 0],
                ['Inquiries', overview?.stats.inquiries ?? 0],
                ['Appointments', overview?.stats.appointments ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-2 text-3xl font-display">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
                <h2 className="font-medium">Recent Inquiries</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {(overview?.recentInquiries || []).map((item: any) => (
                    <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                      <p className="font-medium">{item.name} · {item.email}</p>
                      <p className="text-muted-foreground">Status: {item.status}</p>
                    </div>
                  ))}
                  {!overview?.recentInquiries?.length && <p className="text-muted-foreground">No inquiries yet.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
                <h2 className="font-medium">Recent Appointments</h2>
                <div className="mt-4 space-y-3 text-sm">
                  {(overview?.recentAppointments || []).map((item: any) => (
                    <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                      <p className="font-medium">{item.name} · {item.email}</p>
                      <p className="text-muted-foreground">Status: {item.status}</p>
                    </div>
                  ))}
                  {!overview?.recentAppointments?.length && <p className="text-muted-foreground">No appointments yet.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Services' && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
              <h2 className="font-medium">Add Service</h2>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Title" value={serviceForm.title} onChange={(e) => setServiceForm((s) => ({ ...s, title: e.target.value }))} />
                <textarea className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Description" value={serviceForm.description} onChange={(e) => setServiceForm((s) => ({ ...s, description: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Price" value={serviceForm.price} onChange={(e) => setServiceForm((s) => ({ ...s, price: e.target.value }))} />
                  <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Category" value={serviceForm.category} onChange={(e) => setServiceForm((s) => ({ ...s, category: e.target.value }))} />
                </div>
                <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Image URL" value={serviceForm.imageUrl} onChange={(e) => setServiceForm((s) => ({ ...s, imageUrl: e.target.value }))} />
                <button type="button" onClick={handleCreateService} className="rounded-full bg-foreground px-5 py-2 text-sm text-background">Create Service</button>
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
              <h2 className="font-medium">All Services</h2>
              <div className="mt-4 space-y-3">
                {services.map((item) => (
                  <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="rounded-full border border-foreground/20 px-3 py-1 text-xs" onClick={() => handleEditRecord('service', item)}>Edit</button>
                      <button type="button" className="rounded-full border border-foreground/20 px-3 py-1 text-xs" onClick={() => handleDeleteRecord('service', item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Portfolio' && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
              <h2 className="font-medium">Add Portfolio Project</h2>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Title" value={portfolioForm.title} onChange={(e) => setPortfolioForm((s) => ({ ...s, title: e.target.value }))} />
                <textarea className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Description" value={portfolioForm.description} onChange={(e) => setPortfolioForm((s) => ({ ...s, description: e.target.value }))} />
                <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Image URL" value={portfolioForm.imageUrl} onChange={(e) => setPortfolioForm((s) => ({ ...s, imageUrl: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Client Name" value={portfolioForm.clientName} onChange={(e) => setPortfolioForm((s) => ({ ...s, clientName: e.target.value }))} />
                  <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Project URL" value={portfolioForm.projectUrl} onChange={(e) => setPortfolioForm((s) => ({ ...s, projectUrl: e.target.value }))} />
                </div>
                <button type="button" onClick={handleCreatePortfolio} className="rounded-full bg-foreground px-5 py-2 text-sm text-background">Create Project</button>
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
              <h2 className="font-medium">All Portfolio Projects</h2>
              <div className="mt-4 space-y-3">
                {portfolio.map((item) => (
                  <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="rounded-full border border-foreground/20 px-3 py-1 text-xs" onClick={() => handleEditRecord('portfolio', item)}>Edit</button>
                      <button type="button" className="rounded-full border border-foreground/20 px-3 py-1 text-xs" onClick={() => handleDeleteRecord('portfolio', item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Blog' && (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
              <h2 className="font-medium">Create Blog Post</h2>
              <div className="mt-4 space-y-3">
                <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Title" value={blogForm.title} onChange={(e) => setBlogForm((s) => ({ ...s, title: e.target.value }))} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Slug" value={blogForm.slug} onChange={(e) => setBlogForm((s) => ({ ...s, slug: e.target.value }))} />
                  <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Author" value={blogForm.author} onChange={(e) => setBlogForm((s) => ({ ...s, author: e.target.value }))} />
                </div>
                <input className="w-full rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Image URL" value={blogForm.imageUrl} onChange={(e) => setBlogForm((s) => ({ ...s, imageUrl: e.target.value }))} />
                <textarea className="w-full min-h-28 rounded-xl border border-foreground/20 bg-transparent px-3 py-2" placeholder="Content" value={blogForm.content} onChange={(e) => setBlogForm((s) => ({ ...s, content: e.target.value }))} />
                <button type="button" onClick={handleCreateBlogPost} className="rounded-full bg-foreground px-5 py-2 text-sm text-background">Create Post</button>
              </div>
            </div>
            <div className="rounded-2xl border border-foreground/15 bg-background/60 p-5">
              <h2 className="font-medium">All Blog Posts</h2>
              <div className="mt-4 space-y-3">
                {posts.map((item) => (
                  <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">/{item.slug}</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" className="rounded-full border border-foreground/20 px-3 py-1 text-xs" onClick={() => handleEditRecord('blog', item)}>Edit</button>
                      <button type="button" className="rounded-full border border-foreground/20 px-3 py-1 text-xs" onClick={() => handleDeleteRecord('blog', item.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Inquiries' && (
          <div className="mt-8 rounded-2xl border border-foreground/15 bg-background/60 p-5">
            <h2 className="font-medium">Manage Inquiries</h2>
            <div className="mt-4 space-y-3">
              {inquiries.map((item) => (
                <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                  <p className="font-medium">{item.name} · {item.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.Service?.title ? `Service: ${item.Service.title}` : 'General inquiry'}</p>
                  <p className="text-sm text-muted-foreground">{item.message}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleInquiryStatusChange(item.id, e.target.value)}
                      className="rounded-full border border-foreground/20 bg-transparent px-3 py-1 text-xs"
                    >
                      {INQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {!inquiries.length && <p className="text-muted-foreground">No inquiries yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'Appointments' && (
          <div className="mt-8 rounded-2xl border border-foreground/15 bg-background/60 p-5">
            <h2 className="font-medium">Manage Appointments</h2>
            <div className="mt-4 space-y-3">
              {appointments.map((item) => (
                <div key={item.id} className="rounded-xl border border-foreground/10 p-3">
                  <p className="font-medium">{item.name} · {item.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.Service?.title || 'Service'}</p>
                  <p className="text-sm text-muted-foreground">{new Date(item.dateTime).toLocaleString()}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Payment: {item.paymentStatus || 'unpaid'}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleAppointmentStatusChange(item.id, e.target.value)}
                      className="rounded-full border border-foreground/20 bg-transparent px-3 py-1 text-xs"
                    >
                      {APPOINTMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
              {!appointments.length && <p className="text-muted-foreground">No appointments yet.</p>}
            </div>
          </div>
        )}

        {activeTab === 'Manage Users' && (
          <div className="mt-8 rounded-2xl border border-foreground/15 bg-background/60 p-5">
            <h2 className="font-medium">User Role Management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Total admins: {adminUserCount}. Admins can promote, demote, and remove users while preserving at least one admin.
            </p>
            <div className="mt-4 space-y-3">
              {users.map((targetUser) => (
                <div key={targetUser.id} className="rounded-xl border border-foreground/10 p-3">
                  <p className="font-medium">{targetUser.name} · {targetUser.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Role</span>
                    <select
                      value={targetUser.role}
                      onChange={(e) => handleUserRoleChange(targetUser, e.target.value as 'ADMIN' | 'CLIENT')}
                      className="rounded-full border border-foreground/20 bg-transparent px-3 py-1 text-xs"
                    >
                      <option value="CLIENT">CLIENT</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveUser(targetUser)}
                      className="rounded-full border border-red-500/30 px-3 py-1 text-xs text-red-600 transition hover:bg-red-500/10"
                    >
                      Remove User
                    </button>
                  </div>
                </div>
              ))}
              {!users.length && <p className="text-muted-foreground">No users found.</p>}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
