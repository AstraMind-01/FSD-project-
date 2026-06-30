let io;

export const initSocket = (socketIoInstance) => {
  io = socketIoInstance;
  return io;
};

export const getSocket = () => {
  return io;
};
