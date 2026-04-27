import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from '@/src/api/player';
import { getAccessToken } from '@/src/auth/session';
import { mixpanel } from "@/src/analytics/mixpanel";

export function useSocket(namespace: string) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const isConnecting = useRef(false);

    useEffect(() => {
        if (isConnecting.current) return;
        isConnecting.current = true;

        let socketInstance: Socket;

        const connect = async () => {
            const token = await getAccessToken();
            const baseUrl = getSocketUrl();
            const url = `${baseUrl}/${namespace}`;

            socketInstance = io(url, {
                transports: ['websocket'],
                auth: { token },
            });

            socketInstance.on('connect', () => {
                console.log(`Socket connected to /${namespace}`);
                void mixpanel.track("Socket Connected", { namespace });
                setSocket(socketInstance);
            });

            socketInstance.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                void mixpanel.track("Socket Connect Error", {
                    namespace,
                    error_message: (err as any)?.message ?? String(err),
                });
            });
        };

        connect();

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
                void mixpanel.track("Socket Disconnected", { namespace });
            }
        };
    }, [namespace]);

    return socket;
}