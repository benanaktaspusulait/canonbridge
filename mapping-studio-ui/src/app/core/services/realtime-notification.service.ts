import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class RealtimeNotificationService {
  private readonly toast = inject(MessageService);
  private socket: WebSocket | null = null;

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.socket = new WebSocket(`${protocol}//${window.location.host}/api/notifications/ws`);
    this.socket.onmessage = (event) => this.handleMessage(event.data);
    this.socket.onclose = () => {
      this.socket = null;
    };
  }

  private handleMessage(raw: string): void {
    try {
      const message = JSON.parse(raw);
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
    } catch {
      /* Ignore malformed real-time notifications. */
    }
  }
}
