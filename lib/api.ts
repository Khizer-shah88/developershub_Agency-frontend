import axios from 'axios';

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || 'https://developershub-agency-platform-1.onrender.com';

const api = axios.create({
	baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

export type AdminUser = {
	id: string;
	name: string;
	email: string;
	role: 'ADMIN' | 'CLIENT';
	createdAt: string;
	updatedAt: string;
};

export type OverviewResponse = {
	stats: {
		users: number;
		services: number;
		portfolio: number;
		blogPosts: number;
		inquiries: number;
		appointments: number;
	};
	recentInquiries: any[];
	recentAppointments: any[];
};

export type Service = {
	id: string;
	title: string;
	description: string;
	price?: number | null;
	imageUrl?: string | null;
	category?: string | null;
	createdAt?: string;
	updatedAt?: string;
};

export type Inquiry = {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
	message: string;
	status: string;
	serviceId?: string | null;
	userId?: string | null;
	createdAt: string;
	Service?: Service | null;
};

export type Appointment = {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
	dateTime: string;
	status: string;
	paymentStatus?: string;
	notes?: string | null;
	serviceId?: string | null;
	userId?: string | null;
	createdAt: string;
	Service?: Service | null;
};

export const adminApi = {
	getOverview: async () => (await api.get<OverviewResponse>('/admin/overview')).data,
	getUsers: async () => (await api.get<AdminUser[]>('/admin/users')).data,
	updateUserRole: async (id: string, role: 'ADMIN' | 'CLIENT') =>
		(await api.patch<AdminUser>(`/admin/users/${id}/role`, { role })).data,
	removeUser: async (id: string) => (await api.delete<AdminUser>(`/admin/users/${id}`)).data,
};

export const servicesApi = {
	getAll: async () => (await api.get<Service[]>('/services')).data,
	create: async (payload: any) => (await api.post('/services', payload)).data,
	update: async (id: string, payload: any) => (await api.put(`/services/${id}`, payload)).data,
	remove: async (id: string) => (await api.delete(`/services/${id}`)).data,
};

export const portfolioApi = {
	getAll: async () => (await api.get('/portfolio')).data,
	create: async (payload: any) => (await api.post('/portfolio', payload)).data,
	update: async (id: string, payload: any) => (await api.put(`/portfolio/${id}`, payload)).data,
	remove: async (id: string) => (await api.delete(`/portfolio/${id}`)).data,
};

export const blogApi = {
	getAll: async () => (await api.get('/blog')).data,
	create: async (payload: any) => (await api.post('/blog', payload)).data,
	update: async (id: string, payload: any) => (await api.put(`/blog/${id}`, payload)).data,
	remove: async (id: string) => (await api.delete(`/blog/${id}`)).data,
};

export const inquiriesApi = {
	getAll: async () => (await api.get<Inquiry[]>('/inquiries')).data,
	create: async (payload: any) => (await api.post('/inquiries', payload)).data,
	updateStatus: async (id: string, status: string) =>
		(await api.patch(`/inquiries/${id}/status`, { status })).data,
};

export const appointmentsApi = {
	getAll: async () => (await api.get<Appointment[]>('/appointments')).data,
	create: async (payload: any) => (await api.post('/appointments', payload)).data,
	updateStatus: async (id: string, status: string) =>
		(await api.patch(`/appointments/${id}/status`, { status })).data,
};

export const paymentsApi = {
	createCheckout: async (payload: { appointmentId: string; amount: number }) =>
		(await api.post<{ url: string }>('/payments/create-checkout', payload)).data,
};

export default api;
