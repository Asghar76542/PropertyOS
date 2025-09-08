import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
const SOCKET_PATH = '/api/socketio';

export const useSocket = (userId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize the socket connection
    const socket = io(SOCKET_URL, {
      path: SOCKET_PATH,
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    // --- Event Handlers ---
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      // Join a room associated with the user ID
      socket.emit('join', userId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('receiveMessage', (newMessage: any) => {
      console.log('Received message:', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('messageError', (error: any) => {
        console.error('Socket message error:', error);
        // Optionally, show a toast notification
    });

    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [userId]);

  // --- Emitting Functions ---
  const sendMessage = (message: { fromId: string; toId: string; subject: string; body: string }) => {
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', message);
    }
  };

  return { messages, setMessages, sendMessage, isConnected };
};
