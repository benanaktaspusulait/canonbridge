import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../../../core/i18n/i18n.pipe';
import { WizardMode } from '../../models/mapping-wizard.models';

@Component({
  selector: 'app-mode-selector',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    I18nPipe
  ],
  templateUrl: './mode-selector.component.html',
  styleUrl: './mode-selector.component.scss'
})
export class ModeSelectorComponent {
  selectedMode = signal<WizardMode | null>(null);
  
  modeSelected = output<WizardMode>();

  modes: Array<{
    id: WizardMode;
    icon: string;
    titleKey: string;
    descriptionKey: string;
  }> = [
    {
      id: 'api-gateway',
      icon: 'pi pi-cloud',
      titleKey: 'wizard.mode.apiGateway',
      descriptionKey: 'wizard.mode.apiGatewayDesc'
    },
    {
      id: 'integration-hub',
      icon: 'pi pi-sitemap',
      titleKey: 'wizard.mode.integrationHub',
      descriptionKey: 'wizard.mode.integrationHubDesc'
    }
  ];

  selectMode(mode: WizardMode): void {
    this.selectedMode.set(mode);
  }

  onNext(): void {
    const mode = this.selectedMode();
    if (mode) {
      this.modeSelected.emit(mode);
    }
  }

  isValid(): boolean {
    return this.selectedMode() !== null;
  }
}
