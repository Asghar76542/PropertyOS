import { Server, Socket } from 'socket.io';
import { db } from '@/lib/db';

// In-memory map to track users and their socket IDs
const userSocketMap = new Map<string, string>(); // Map<userId, socketId>

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // When a user joins, store their userId and socketId
    socket.on('join', (userId: string) => {
      if (userId) {
        userSocketMap.set(userId, socket.id);
        console.log(`User ${userId} joined and is mapped to socket ${socket.id}`);
        // Optionally, acknowledge the join
        socket.emit('joined', { success: true });
      }
    });

    // Handle new messages from a client
    socket.on('sendMessage', async (message: { fromId: string; toId: string; subject: string; body: string }) => {
      try {
        // 1. Persist the message to the database
        const newMessage = await db.message.create({
          data: {
            fromId: message.fromId,
            toId: message.toId,
            subject: message.subject,
            body: message.body,
          },
        });

        // 2. Find the recipient's socket ID
        const recipientSocketId = userSocketMap.get(message.toId);

        // 3. If the recipient is online, send them the message in real-time
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receiveMessage', newMessage);
        }

        // 4. Acknowledge to the sender that the message was sent
        socket.emit('messageSent', { success: true, message: newMessage });

      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('messageError', { error: 'Failed to send message.' });
      }
    });

    // When a user disconnects, remove them from the map
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      // Find the user associated with this socket and remove them
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User ${userId} disconnected and was removed from map.`);
          break;
        }
      }
    });

    socket.emit('welcome', { message: 'Successfully connected to the messaging server.' });
  });
};