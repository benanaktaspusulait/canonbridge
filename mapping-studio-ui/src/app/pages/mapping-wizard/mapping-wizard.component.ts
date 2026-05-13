import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { StepsModule } from 'primeng/steps';
import { MenuItem } from 'primeng/api';
import { I18nPipe } from '../../core/i18n/i18n.pipe';
import { SourceTypeSelectionComponent } from './steps/step0-source-type/source-type-selection.component';
import { ConfigurationStepComponent } from './steps/step1-configuration/configuration-step.component';
import { SourceType, WizardState } from './models/mapping-wizard.models';

@Component({
  selector: 'app-mapping-wizard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    StepsModule,
    I18nPipe,
    SourceTypeSelectionComponent,
    ConfigurationStepComponent
  ],
  templateUrl: './mapping-wizard.component.html',
  styleUrl: './mapping-wizard.component.scss'
})
export class MappingWizardComponent {
  currentStep = signal(0);
  
  wizardState = signal<WizardState>({
    sourceType: null,
    externalSystemId: null,
    sourceConfig: {},
    sampleJson: '',
    targetSchemaRef: null,
    mappingRules: []
  });

  steps: MenuItem[] = [
    { label: 'Source Type' },
    { label: 'Configuration' },
    { label: 'Sample Data' },
    { label: 'Target Schema' },
    { label: 'Field Mapping' },
    { label: 'Test & Publish' }
  ];

  onSourceTypeSelected(sourceType: SourceType): void {
    this.wizardState.update(state => ({
      ...state,
      sourceType
    }));
    this.currentStep.set(1);
  }

  onConfigurationComplete(data: { externalSystemId: string | null; config: Record<string, unknown> }): void {
    this.wizardState.update(state => ({
      ...state,
      externalSystemId: data.externalSystemId,
      sourceConfig: data.config
    }));
    this.currentStep.set(2);
  }

  goBack(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(step => step - 1);
    }
  }

  goNext(): void {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(step => step + 1);
    }
  }
}
