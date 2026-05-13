import { Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { I18nPipe } from '../../../../core/i18n/i18n.pipe';
import { SourceType, SourceTypeOption } from '../../models/mapping-wizard.models';

@Component({
  selector: 'app-source-type-selection',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, I18nPipe],
  templateUrl: './source-type-selection.component.html',
  styleUrl: './source-type-selection.component.scss'
})
export class SourceTypeSelectionComponent {
  sourceTypeSelected = output<SourceType>();

  sourceTypes: SourceTypeOption[] = [
    {
      id: 'KAFKA',
      icon: 'pi pi-send',
      titleKey: 'wizard.sourceType.kafka',
      descriptionKey: 'wizard.sourceType.kafkaDesc'
    },
    {
      id: 'WEBHOOK',
      icon: 'pi pi-link',
      titleKey: 'wizard.sourceType.webhook',
      descriptionKey: 'wizard.sourceType.webhookDesc'
    },
    {
      id: 'REST_API',
      icon: 'pi pi-globe',
      titleKey: 'wizard.sourceType.restApi',
      descriptionKey: 'wizard.sourceType.restApiDesc'
    },
    {
      id: 'SCHEDULED_API',
      icon: 'pi pi-cloud-download',
      titleKey: 'wizard.sourceType.externalApi',
      descriptionKey: 'wizard.sourceType.externalApiDesc'
    },
    {
      id: 'SOAP',
      icon: 'pi pi-code',
      titleKey: 'wizard.sourceType.soap',
      descriptionKey: 'wizard.sourceType.soapDesc'
    },
    {
      id: 'FILE_BATCH',
      icon: 'pi pi-file',
      titleKey: 'wizard.sourceType.fileBatch',
      descriptionKey: 'wizard.sourceType.fileBatchDesc'
    },
    {
      id: 'API_ENRICHMENT',
      icon: 'pi pi-sitemap',
      titleKey: 'wizard.sourceType.apiEnrichment',
      descriptionKey: 'wizard.sourceType.apiEnrichmentDesc'
    },
    {
      id: 'MANUAL',
      icon: 'pi pi-upload',
      titleKey: 'wizard.sourceType.manual',
      descriptionKey: 'wizard.sourceType.manualDesc'
    }
  ];

  selectSourceType(type: SourceType): void {
    this.sourceTypeSelected.emit(type);
  }
}
