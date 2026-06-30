import { getSocket } from '../config/socket.js';

export const registerSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      if (userId) {
        socket.join(userId.toString());
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

export const sendRealTimeNotification = (userId, notification) => {
  const io = getSocket();
  if (io) {
    io.to(userId.toString()).emit('notification_received', notification);
  } else {
    console.warn('Socket not initialized. Could not send notification.');
  }
};
