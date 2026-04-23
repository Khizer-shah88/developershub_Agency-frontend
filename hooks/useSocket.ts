'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

type SocketHandlers = {
	onInquiry?: (payload: any) => void;
	onAppointment?: (payload: any) => void;
};

export function useSocket(handlers: SocketHandlers) {
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		const socket = io(SOCKET_URL, {
			transports: ['websocket'],
		});

		socketRef.current = socket;

		if (handlers.onInquiry) {
			socket.on('new-inquiry', handlers.onInquiry);
		}

		if (handlers.onAppointment) {
			socket.on('new-appointment', handlers.onAppointment);
		}

		return () => {
			if (handlers.onInquiry) {
				socket.off('new-inquiry', handlers.onInquiry);
			}
			if (handlers.onAppointment) {
				socket.off('new-appointment', handlers.onAppointment);
			}
			socket.disconnect();
			socketRef.current = null;
		};
	}, [handlers.onInquiry, handlers.onAppointment]);

	return socketRef;
}

