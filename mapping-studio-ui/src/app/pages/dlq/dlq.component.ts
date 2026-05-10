import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { I18nPipe } from '../../core/i18n/i18n.pipe';

interface DlqMessage {
  id: string;
  partner: string;
  eventType: string;
  errorType: string;
  errorMessage: string;
  attempts: number;
  firstFailed: string;
  lastFailed: string;
  payload: string;
}

@Component({
  selector: 'app-dlq',
  standalone: true,
  imports: [CardModule, ButtonModule, TableModule, TagModule, TooltipModule, AccordionModule, I18nPipe],
  templateUrl: './dlq.component.html',
  styleUrl: './dlq.component.scss'
})
export class DlqComponent {
  selected: DlqMessage[] = [];

  readonly messages: DlqMessage[] = [
    {
      id: 'dlq-001', partner: 'payment-gateway',  eventType: 'payment.captured',
      errorType: 'SCHEMA_VALIDATION',
      errorMessage: 'Required field "amount" is missing from payload',
      attempts: 3, firstFailed: '2026-05-10 13:45', lastFailed: '2026-05-10 14:15',
      payload: '{"transactionId":"txn-999","currency":"USD"}'
    },
    {
      id: 'dlq-002', partner: 'payment-gateway',  eventType: 'payment.captured',
      errorType: 'TRANSFORMATION_ERROR',
      errorMessage: 'JSONata expression failed: cannot read property of undefined',
      attempts: 3, firstFailed: '2026-05-10 12:30', lastFailed: '2026-05-10 13:00',
      payload: '{"transactionId":"txn-888","amount":null}'
    },
    {
      id: 'dlq-003', partner: 'acme-marketplace', eventType: 'order.created',
      errorType: 'SCHEMA_VALIDATION',
      errorMessage: 'Field "customer.email" does not match format "email"',
      attempts: 1, firstFailed: '2026-05-10 11:00', lastFailed: '2026-05-10 11:00',
      payload: '{"orderId":"ORD-777","customer":{"email":"not-an-email"}}'
    },
    {
      id: 'dlq-004', partner: 'acme-marketplace', eventType: 'order.created',
      errorType: 'DOWNSTREAM_ERROR',
      errorMessage: 'Business service returned 503 after 3 retries',
      attempts: 3, firstFailed: '2026-05-10 09:15', lastFailed: '2026-05-10 09:45',
      payload: '{"orderId":"ORD-666","status":"A"}'
    },
  ];

  getErrorSeverity(type: string): 'danger' | 'warn' | 'info' {
    if (type === 'SCHEMA_VALIDATION') return 'danger';
    if (type === 'TRANSFORMATION_ERROR') return 'warn';
    return 'info';
  }
}
