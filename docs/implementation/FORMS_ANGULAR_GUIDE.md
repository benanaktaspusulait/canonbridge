# Forms Implementation Guide - Angular 17

## 🎯 Overview

The forms layer provides complex form handling for partner onboarding, Mapping Studio, mapping configuration, and schema management using Angular 17 with Reactive Forms.

Mapping Studio product behavior is defined in:

- [Mapping Studio Product Requirements](../product/01-mapping-studio-product-requirements.md)
- [Mapping Studio UX Flow](../product/02-mapping-studio-ux-flow.md)
- [Mapping Studio Validation and Testing](../product/04-mapping-studio-validation-testing.md)

## 🏗️ Project Structure

```
forms/
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── partner-onboarding/
│   │   │   ├── mapping-studio/
│   │   │   ├── mapping-config/
│   │   │   ├── schema-management/
│   │   │   └── shared/
│   │   ├── services/
│   │   │   ├── partner.service.ts
│   │   │   ├── sample-payload.service.ts
│   │   │   ├── field-inventory.service.ts
│   │   │   ├── mapping.service.ts
│   │   │   ├── schema.service.ts
│   │   │   ├── validation-run.service.ts
│   │   │   └── validation.service.ts
│   │   ├── models/
│   │   │   ├── partner.model.ts
│   │   │   ├── mapping.model.ts
│   │   │   └── schema.model.ts
│   │   ├── validators/
│   │   │   ├── custom-validators.ts
│   │   │   └── async-validators.ts
│   │   ├── app.component.ts
│   │   └── app.module.ts
│   ├── assets/
│   └── main.ts
├── angular.json
├── tsconfig.json
└── package.json
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "@angular/material": "^17.0.0",
    "@angular/cdk": "^17.0.0",
    "rxjs": "^7.x",
    "tslib": "^2.x",
    "zone.js": "^0.14.x"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^17.0.0",
    "@angular/cli": "^17.0.0",
    "@angular/compiler-cli": "^17.0.0",
    "typescript": "^5.x",
    "jasmine-core": "^5.x",
    "karma": "^6.x",
    "karma-jasmine": "^5.x",
    "karma-chrome-launcher": "^3.x"
  }
}
```

## 🚀 Setup

### 1. Create Project

```bash
ng new forms --routing --style=scss
cd forms
ng add @angular/material
```

### 2. Create Modules

```bash
ng generate module modules/partner-onboarding
ng generate module modules/mapping-config
ng generate module modules/schema-management
ng generate module modules/shared
```

### 3. Create Services

```bash
ng generate service services/partner
ng generate service services/mapping
ng generate service services/schema
ng generate service services/validation
```

## 📋 Key Components

### Mapping Studio Form Modules

The Mapping Studio form experience should cover the complete sample JSON to publish workflow:

- Draft setup form.
- Sample JSON paste/upload form.
- JSON structure explorer with field details.
- Input schema builder.
- Canonical mapping builder.
- JSONata code view.
- Transform preview.
- Fixture manager.
- Review and publish form.

These modules should follow the UX contract in [Mapping Studio UX Flow](../product/02-mapping-studio-ux-flow.md). Expensive parsing, schema inference, preview execution, and validation runs should happen through backend APIs rather than browser-only logic.

### Partner Onboarding Form

```typescript
// src/app/modules/partner-onboarding/partner-form.component.ts
import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { PartnerService } from '../../services/partner.service'
import { ValidationService } from '../../services/validation.service'

@Component({
  selector: 'app-partner-form',
  templateUrl: './partner-form.component.html',
  styleUrls: ['./partner-form.component.scss']
})
export class PartnerFormComponent implements OnInit {
  partnerForm!: FormGroup
  loading = false
  submitted = false

  constructor(
    private fb: FormBuilder,
    private partnerService: PartnerService,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    this.initializeForm()
  }

  initializeForm(): void {
    this.partnerForm = this.fb.group({
      partnerId: ['', [Validators.required, Validators.minLength(3)]],
      partnerName: ['', [Validators.required]],
      eventType: ['', [Validators.required]],
      schemaVersion: ['v1', [Validators.required]],
      inputSchema: ['', [Validators.required]],
      mapping: ['', [Validators.required]],
      canonicalSchema: ['', [Validators.required]],
      kafka: this.fb.group({
        inputTopic: ['partner.raw.events', [Validators.required]],
        outputTopic: ['canonical.events', [Validators.required]],
        dlqTopic: ['transformation.dlq', [Validators.required]],
        partitionKeyPath: ['$.entityId', [Validators.required]]
      }),
      processing: this.fb.group({
        orderingRequired: [false],
        mode: ['ordered'],
        maxRetries: [3, [Validators.required, Validators.min(1)]],
        workerPoolEnabled: [true]
      })
    })
  }

  onSubmit(): void {
    this.submitted = true

    if (this.partnerForm.invalid) {
      return
    }

    this.loading = true
    this.partnerService.createPartner(this.partnerForm.value).subscribe({
      next: (response) => {
        console.log('Partner created:', response)
        this.loading = false
        this.partnerForm.reset()
      },
      error: (error) => {
        console.error('Error creating partner:', error)
        this.loading = false
      }
    })
  }

  get f() {
    return this.partnerForm.controls
  }
}
```

### Partner Form Template

```html
<!-- src/app/modules/partner-onboarding/partner-form.component.html -->
<div class="container">
  <h2>Partner Onboarding</h2>

  <form [formGroup]="partnerForm" (ngSubmit)="onSubmit()">
    <!-- Basic Information -->
    <mat-card>
      <mat-card-header>
        <mat-card-title>Basic Information</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="fill">
          <mat-label>Partner ID</mat-label>
          <input matInput formControlName="partnerId" required>
          <mat-error *ngIf="f['partnerId'].hasError('required')">
            Partner ID is required
          </mat-error>
          <mat-error *ngIf="f['partnerId'].hasError('minlength')">
            Partner ID must be at least 3 characters
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Partner Name</mat-label>
          <input matInput formControlName="partnerName" required>
          <mat-error *ngIf="f['partnerName'].hasError('required')">
            Partner Name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Event Type</mat-label>
          <input matInput formControlName="eventType" required>
          <mat-error *ngIf="f['eventType'].hasError('required')">
            Event Type is required
          </mat-error>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <!-- Kafka Configuration -->
    <mat-card formGroupName="kafka">
      <mat-card-header>
        <mat-card-title>Kafka Configuration</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-form-field appearance="fill">
          <mat-label>Input Topic</mat-label>
          <input matInput formControlName="inputTopic" required>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Output Topic</mat-label>
          <input matInput formControlName="outputTopic" required>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>DLQ Topic</mat-label>
          <input matInput formControlName="dlqTopic" required>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Partition Key Path</mat-label>
          <input matInput formControlName="partitionKeyPath" required>
        </mat-form-field>
      </mat-card-content>
    </mat-card>

    <!-- Processing Configuration -->
    <mat-card formGroupName="processing">
      <mat-card-header>
        <mat-card-title>Processing Configuration</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <mat-checkbox formControlName="orderingRequired">
          Ordering Required
        </mat-checkbox>

        <mat-form-field appearance="fill">
          <mat-label>Mode</mat-label>
          <mat-select formControlName="mode">
            <mat-option value="ordered">Ordered</mat-option>
            <mat-option value="parallel">Parallel</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Max Retries</mat-label>
          <input matInput type="number" formControlName="maxRetries" required>
        </mat-form-field>

        <mat-checkbox formControlName="workerPoolEnabled">
          Enable Worker Pool
        </mat-checkbox>
      </mat-card-content>
    </mat-card>

    <!-- Submit Button -->
    <div class="actions">
      <button mat-raised-button color="primary" type="submit" [disabled]="loading">
        <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
        {{ loading ? 'Creating...' : 'Create Partner' }}
      </button>
      <button mat-button type="reset">Reset</button>
    </div>
  </form>
</div>
```

### Partner Service

```typescript
// src/app/services/partner.service.ts
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { Partner } from '../models/partner.model'

@Injectable({
  providedIn: 'root'
})
export class PartnerService {
  private apiUrl = '/api/partners'

  constructor(private http: HttpClient) {}

  createPartner(partner: Partner): Observable<Partner> {
    return this.http.post<Partner>(this.apiUrl, partner)
  }

  getPartner(id: string): Observable<Partner> {
    return this.http.get<Partner>(`${this.apiUrl}/${id}`)
  }

  updatePartner(id: string, partner: Partner): Observable<Partner> {
    return this.http.put<Partner>(`${this.apiUrl}/${id}`, partner)
  }

  deletePartner(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  listPartners(): Observable<Partner[]> {
    return this.http.get<Partner[]>(this.apiUrl)
  }
}
```

### Custom Validators

```typescript
// src/app/validators/custom-validators.ts
import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms'
import { Observable, of } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { PartnerService } from '../services/partner.service'

export class CustomValidators {
  static jsonataExpression(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null
      }

      try {
        // Basic JSONata validation
        if (!control.value.includes('{') || !control.value.includes('}')) {
          return { invalidJsonata: true }
        }
        return null
      } catch {
        return { invalidJsonata: true }
      }
    }
  }

  static jsonSchema(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null
      }

      try {
        JSON.parse(control.value)
        return null
      } catch {
        return { invalidJson: true }
      }
    }
  }

  static uniquePartnerId(partnerService: PartnerService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null)
      }

      return partnerService.getPartner(control.value).pipe(
        map(() => ({ partnerIdExists: true })),
        catchError(() => of(null))
      )
    }
  }
}
```

## 🧪 Testing

```typescript
// src/app/modules/partner-onboarding/partner-form.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { PartnerFormComponent } from './partner-form.component'
import { PartnerService } from '../../services/partner.service'

describe('PartnerFormComponent', () => {
  let component: PartnerFormComponent
  let fixture: ComponentFixture<PartnerFormComponent>
  let partnerService: jasmine.SpyObj<PartnerService>

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('PartnerService', ['createPartner'])

    await TestBed.configureTestingModule({
      declarations: [PartnerFormComponent],
      imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
      providers: [{ provide: PartnerService, useValue: spy }]
    }).compileComponents()

    partnerService = TestBed.inject(PartnerService) as jasmine.SpyObj<PartnerService>
    fixture = TestBed.createComponent(PartnerFormComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize form with default values', () => {
    expect(component.partnerForm.get('kafka.inputTopic')?.value).toBe('partner.raw.events')
  })

  it('should validate required fields', () => {
    const form = component.partnerForm
    expect(form.valid).toBeFalsy()

    form.patchValue({
      partnerId: 'test-partner',
      partnerName: 'Test Partner',
      eventType: 'OrderCreated'
    })

    expect(form.valid).toBeTruthy()
  })
})
```

## 🚀 Development

```bash
# Start development server
ng serve

# Run tests
ng test

# Build for production
ng build

# Lint code
ng lint
```

## 📋 Implementation Checklist

- [ ] Angular project setup
- [ ] Material UI integration
- [ ] Partner onboarding form
- [ ] Mapping Studio wizard
- [ ] Sample JSON paste/upload form
- [ ] JSON structure explorer
- [ ] Mapping configuration form
- [ ] Schema management form
- [ ] Input schema builder
- [ ] Canonical mapping builder
- [ ] JSONata code view
- [ ] Transform preview
- [ ] Fixture manager
- [ ] Review and publish form
- [ ] Custom validators
- [ ] Async validators
- [ ] Error handling
- [ ] Form state management
- [ ] Unit tests
- [ ] Integration tests
- [ ] Production build
- [ ] Docker containerization

---

**See Also**: [Tech Stack](../architecture/tech-stack.md)
