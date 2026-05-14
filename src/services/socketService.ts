import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;
    
    this.socket = io(window.location.origin, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("Connected to Real-time GPS Engine");
    });
  }

  joinDelivery(orderId: string) {
    this.socket?.emit("join-delivery", orderId);
  }

  updateLocation(data: { orderId: string; lat: number; lng: number; speed?: number; heading?: number }) {
    this.socket?.emit("update-location", data);
  }

  onLocationUpdate(callback: (data: any) => void) {
    this.socket?.on("location-updated", callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const socketService = new SocketService();
