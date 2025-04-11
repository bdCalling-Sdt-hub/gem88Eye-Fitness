import colors from 'colors';
import { Server, Socket } from 'socket.io';
import { logger } from '../shared/logger';

const socket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(colors.blue(`🟢 A user connected: ${socket.id}`));

    socket.on('join', (userId: string) => {
      socket.join(userId);
      logger.info(colors.green(`👤 User joined room: ${userId}`));
    });

    socket.on('disconnect', () => {
      logger.info(colors.red(`🔴 A user disconnected: ${socket.id}`));
    });
  });
};

export const socketHelper = { socket };
