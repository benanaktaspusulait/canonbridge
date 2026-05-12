import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AutoSaveService } from '../services/auto-save.service';

@Component({
  selector: 'app-auto-save-restore-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      header="Unsaved Progress Found"
      [modal]="true"
      [closable]="false"
      [style]="{ width: '450px' }">
      
      <div class="restore-dialog-content">
        <i class="pi pi-info-circle" style="font-size: 3rem; color: var(--primary-color);"></i>
        
        <p class="message">
          We found unsaved progress from <strong>{{ autoSaveAge }}</strong>.
          Would you like to restore it?
        </p>

        <div class="warning-note">
          <i class="pi pi-exclamation-triangle"></i>
          <span>If you choose "Start Fresh", the saved progress will be lost.</span>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Start Fresh"
          icon="pi pi-times"
          (onClick)="onDiscard()"
          severity="secondary"
          [outlined]="true" />
        <p-button
          label="Restore Progress"
          icon="pi pi-replay"
          (onClick)="onRestore()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .restore-dialog-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      padding: 1rem 0;
      text-align: center;
    }

    .message {
      font-size: 1rem;
      line-height: 1.5;
      margin: 0;
    }

    .warning-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: var(--yellow-50);
      border-left: 3px solid var(--yellow-500);
      border-radius: 4px;
      font-size: 0.875rem;
      color: var(--yellow-900);
      width: 100%;
    }

    .warning-note i {
      color: var(--yellow-600);
    }

    :host ::ng-deep .p-dialog-footer {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }
  `]
})
export class AutoSaveRestoreDialogComponent {
  @Input() visible = false;
  @Input() autoSaveKey = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() restore = new EventEmitter<void>();
  @Output() discard = new EventEmitter<void>();

  constructor(private autoSaveService: AutoSaveService) {}

  get autoSaveAge(): string {
    return this.autoSaveService.formatAutoSaveAge(this.autoSaveKey);
  }

  onRestore(): void {
    this.restore.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onDiscard(): void {
    this.discard.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
