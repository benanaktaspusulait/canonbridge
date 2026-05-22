import { Injectable, inject, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RealtimeNotificationService implements OnDestroy {
  private readonly toast = inject(MessageService);
  private readonly auth = inject(AuthService);
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private intentionallyClosed = false;

  private readonly reconnectInterval = environment.websocket.reconnectInterval || 5000;
  private readonly maxReconnectAttempts = environment.websocket.maxReconnectAttempts || 10;
  private readonly heartbeatInterval = 30_000; // 30s ping to keep connection alive

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;

    const token = this.auth.getToken();
    if (!token) {
      // Cannot connect without authentication
      return;
    }

    this.intentionallyClosed = false;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Pass token as query param for WebSocket auth (cookies not available for WS upgrade in all browsers)
    this.socket = new WebSocket(
      `${protocol}//${window.location.host}/api/notifications/ws?token=${encodeURIComponent(token)}`
    );

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.socket.onmessage = (event) => this.handleMessage(event.data);

    this.socket.onerror = (event) => {
      if (!environment.production) {
        console.warn('[RealtimeNotification] WebSocket error', event);
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.stopHeartbeat();
      if (!this.intentionallyClosed) {
        this.scheduleReconnect();
      }
    };
  }

  disconnect(): void {
    this.intentionallyClosed = true;
    this.clearReconnectTimer();
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      if (!environment.production) {
        console.warn('[RealtimeNotification] Max reconnect attempts reached');
      }
      return;
    }

    // Exponential backoff: base * 2^attempt, capped at 60s
    const delay = Math.min(
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      60_000
    );
    this.reconnectAttempts++;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private handleMessage(raw: string): void {
    try {
      const message = JSON.parse(raw);

      // Ignore pong responses
      if (message.type === 'pong') return;

      if (message.type === 'mapping.published') {
        this.toast.add({
          severity: 'success',
          summary: 'Mapping published',
          detail: `${message.name} v${message.version}`
        });
      } else if (message.type === 'alert.fired') {
        this.toast.add({
          severity: message.severity ?? 'warn',
          summary: message.title ?? 'Alert fired',
          detail: message.detail
        });
      }
    } catch (e) {
      if (!environment.production) {
        console.warn('[RealtimeNotification] Malformed message:', raw);
      }
    }
  }
}
