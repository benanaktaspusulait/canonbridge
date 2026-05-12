# Accessibility Quick Reference for Developers

## Quick Checklist

When adding new components or features, ensure:

- [ ] All interactive elements have descriptive labels
- [ ] Keyboard navigation works (Tab, Enter, Space, Escape, Arrows)
- [ ] Focus states are visible
- [ ] Screen reader announcements for dynamic content
- [ ] Color is not the only indicator
- [ ] Forms have proper labels and validation
- [ ] ARIA attributes are correct

## Common Patterns

### Button

```html
<!-- Good -->
<button 
  type="button"
  [attr.aria-label]="'Delete partner ' + partner.name"
  (click)="delete(partner)">
  <i class="pi pi-trash" aria-hidden="true"></i>
</button>

<!-- Bad -->
<button (click)="delete(partner)">
  <i class="pi pi-trash"></i>
</button>
```

### Form Input

```html
<!-- Good -->
<label for="partner-name">
  Partner Name
  <span class="required-field" aria-label="required">*</span>
</label>
<input 
  id="partner-name"
  type="text"
  pInputText
  [(ngModel)]="form.name"
  [attr.aria-required]="true"
  [attr.aria-invalid]="hasError('name')"
  [attr.aria-describedby]="hasError('name') ? 'name-error' : null" />
@if (hasError('name')) {
  <span id="name-error" class="field-error" role="alert">
    {{ getError('name') }}
  </span>
}

<!-- Bad -->
<input type="text" [(ngModel)]="form.name" />
```

### Navigation

```html
<!-- Good -->
<nav role="navigation" aria-label="Primary navigation">
  <a 
    routerLink="/dashboard"
    [attr.aria-current]="isActive('/dashboard') ? 'page' : null">
    Dashboard
  </a>
</nav>

<!-- Bad -->
<div class="nav">
  <a routerLink="/dashboard">Dashboard</a>
</div>
```

### Dialog/Modal

```html
<!-- Good -->
<p-dialog
  [(visible)]="dialogVisible"
  [modal]="true"
  role="dialog"
  [attr.aria-labelledby]="'dialog-title'"
  [attr.aria-describedby]="'dialog-description'">
  <ng-template pTemplate="header">
    <h2 id="dialog-title">Add Partner</h2>
  </ng-template>
  <p id="dialog-description">Enter partner details below.</p>
  <!-- Content -->
</p-dialog>

<!-- Bad -->
<p-dialog [(visible)]="dialogVisible">
  <h2>Add Partner</h2>
  <!-- Content -->
</p-dialog>
```

### Status/Alert

```html
<!-- Good -->
<p-message 
  severity="success"
  [text]="message"
  role="alert"
  aria-live="polite" />

<!-- Or use the accessibility service -->
<button (click)="save()">Save</button>

// In component
save() {
  this.api.save().subscribe(() => {
    this.a11y.announceSuccess('Partner saved successfully');
  });
}

<!-- Bad -->
<div class="success-message">{{ message }}</div>
```

### Loading State

```html
<!-- Good -->
<div [attr.aria-busy]="loading">
  @if (loading) {
    <span class="sr-only">Loading partners...</span>
    <i class="pi pi-spinner" aria-hidden="true"></i>
  }
  <!-- Content -->
</div>

<!-- Bad -->
<div *ngIf="loading">
  <i class="pi pi-spinner"></i>
</div>
```

### Table

```html
<!-- Good -->
<p-table [value]="partners">
  <ng-template pTemplate="header">
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-partner>
    <tr>
      <td>{{ partner.name }}</td>
      <td>
        <p-tag [severity]="getSeverity(partner.status)">
          <span class="sr-only">Status: </span>
          {{ partner.status }}
        </p-tag>
      </td>
      <td>
        <button 
          [attr.aria-label]="'Edit ' + partner.name"
          (click)="edit(partner)">
          <i class="pi pi-pencil" aria-hidden="true"></i>
        </button>
      </td>
    </tr>
  </ng-template>
</p-table>

<!-- Bad -->
<table>
  <tr>
    <td>{{ partner.name }}</td>
    <td><span class="status-{{ partner.status }}"></span></td>
    <td><button (click)="edit(partner)"><i class="pi pi-pencil"></i></button></td>
  </tr>
</table>
```

### Dropdown/Select

```html
<!-- Good -->
<label for="partner-status">Status</label>
<p-select
  inputId="partner-status"
  [options]="statusOptions"
  [(ngModel)]="form.status"
  [attr.aria-label]="'Select partner status'"
  [attr.aria-required]="true" />

<!-- Bad -->
<p-select
  [options]="statusOptions"
  [(ngModel)]="form.status" />
```

### Icon-Only Button

```html
<!-- Good -->
<button 
  type="button"
  [attr.aria-label]="'Close dialog'"
  (click)="close()">
  <i class="pi pi-times" aria-hidden="true"></i>
</button>

<!-- Bad -->
<button (click)="close()">
  <i class="pi pi-times"></i>
</button>
```

### Drag and Drop

```html
<!-- Good -->
<div 
  cdkDrag
  [attr.aria-label]="'Reorder rule ' + rule.id"
  [attr.aria-describedby]="'drag-instructions'">
  <button 
    cdkDragHandle
    [attr.aria-label]="'Drag handle for rule ' + rule.id">
    <i class="pi pi-bars" aria-hidden="true"></i>
  </button>
  <!-- Content -->
</div>
<span id="drag-instructions" class="sr-only">
  Press Space to grab, Arrow keys to move, Space to drop
</span>

<!-- Bad -->
<div cdkDrag>
  <button cdkDragHandle>
    <i class="pi pi-bars"></i>
  </button>
</div>
```

### Toggle/Switch

```html
<!-- Good -->
<label for="rule-enabled">
  Enable rule
</label>
<p-toggleSwitch
  inputId="rule-enabled"
  [(ngModel)]="rule.enabled"
  [attr.aria-label]="'Enable or disable rule ' + rule.id"
  [attr.aria-checked]="rule.enabled" />

<!-- Bad -->
<p-toggleSwitch [(ngModel)]="rule.enabled" />
```

## Using the Accessibility Service

```typescript
import { AccessibilityService } from '@core/services/accessibility.service';

export class MyComponent {
  private readonly a11y = inject(AccessibilityService);

  save() {
    this.api.save().subscribe({
      next: () => {
        this.a11y.announceSuccess('Partner saved successfully');
      },
      error: (err) => {
        this.a11y.announceError('Save failed', err.message);
      }
    });
  }

  load() {
    this.a11y.announceLoading('Loading partners');
    this.api.load().subscribe(() => {
      this.a11y.announceLoadingComplete('Partners loaded');
    });
  }

  navigate() {
    this.router.navigate(['/partners']);
    this.a11y.announceNavigation('Partners page');
  }
}
```

## ARIA Attributes Reference

### Common ARIA Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `aria-label` | Provides label for element | `aria-label="Close dialog"` |
| `aria-labelledby` | References element(s) that label this element | `aria-labelledby="dialog-title"` |
| `aria-describedby` | References element(s) that describe this element | `aria-describedby="field-error"` |
| `aria-required` | Indicates required field | `aria-required="true"` |
| `aria-invalid` | Indicates validation error | `aria-invalid="true"` |
| `aria-live` | Announces dynamic content | `aria-live="polite"` or `"assertive"` |
| `aria-current` | Indicates current item | `aria-current="page"` or `"step"` |
| `aria-expanded` | Indicates expanded state | `aria-expanded="true"` |
| `aria-haspopup` | Indicates popup menu | `aria-haspopup="true"` |
| `aria-hidden` | Hides from screen readers | `aria-hidden="true"` |
| `aria-busy` | Indicates loading state | `aria-busy="true"` |
| `aria-pressed` | Indicates toggle button state | `aria-pressed="true"` |
| `aria-checked` | Indicates checkbox/switch state | `aria-checked="true"` |

### ARIA Roles

| Role | Purpose | Example |
|------|---------|---------|
| `role="navigation"` | Navigation region | `<nav role="navigation">` |
| `role="main"` | Main content | `<main role="main">` |
| `role="banner"` | Site header | `<header role="banner">` |
| `role="contentinfo"` | Site footer | `<footer role="contentinfo">` |
| `role="complementary"` | Supporting content | `<aside role="complementary">` |
| `role="dialog"` | Modal dialog | `<div role="dialog">` |
| `role="alert"` | Important message | `<div role="alert">` |
| `role="status"` | Status message | `<div role="status">` |
| `role="button"` | Button | `<div role="button">` |
| `role="list"` | List | `<div role="list">` |
| `role="listitem"` | List item | `<div role="listitem">` |

## Keyboard Navigation

### Standard Keys

- **Tab**: Move to next focusable element
- **Shift+Tab**: Move to previous focusable element
- **Enter**: Activate button or link
- **Space**: Activate button or toggle
- **Escape**: Close dialog or menu
- **Arrow Keys**: Navigate within menus, lists, or grids

### Custom Shortcuts (Document in UI)

```typescript
@HostListener('keydown', ['$event'])
handleKeyboard(event: KeyboardEvent) {
  // Ctrl/Cmd + S: Save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    this.save();
    this.a11y.announce('Saving...');
  }
  
  // Ctrl/Cmd + Enter: Test
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault();
    this.test();
    this.a11y.announce('Running test...');
  }
}
```

## Focus Management

### Setting Focus

```typescript
// Focus an element
@ViewChild('firstInput') firstInput!: ElementRef;

ngAfterViewInit() {
  // Focus first input when dialog opens
  setTimeout(() => {
    this.firstInput.nativeElement.focus();
  }, 0);
}
```

### Focus Trap (for dialogs)

PrimeNG dialogs automatically trap focus. For custom dialogs:

```typescript
import { FocusTrap } from '@angular/cdk/a11y';

@ViewChild(FocusTrap) focusTrap!: FocusTrap;

openDialog() {
  this.dialogVisible = true;
  setTimeout(() => {
    this.focusTrap.focusInitialElement();
  }, 0);
}
```

## Testing Checklist

### Quick Test

1. **Keyboard**: Can you navigate with Tab and activate with Enter/Space?
2. **Focus**: Are focus indicators visible?
3. **Labels**: Do all inputs have labels?
4. **Announcements**: Are changes announced to screen readers?
5. **Color**: Is information conveyed without color alone?

### Tools

```bash
# Run automated tests
npm run test:a11y

# Check with browser extensions
# - axe DevTools
# - WAVE
# - Lighthouse
```

## Common Mistakes to Avoid

❌ **Don't**:
- Use `<div>` or `<span>` as buttons without proper ARIA
- Forget labels on form inputs
- Use color alone to convey information
- Create keyboard traps
- Hide focus indicators
- Use placeholder as label
- Forget to announce dynamic content
- Use `tabindex` values other than 0 or -1

✅ **Do**:
- Use semantic HTML (`<button>`, `<nav>`, `<main>`)
- Provide descriptive labels
- Include non-color indicators
- Ensure keyboard accessibility
- Show visible focus states
- Use proper labels for inputs
- Announce important changes
- Use logical tab order

## Resources

- Full documentation: `ACCESSIBILITY.md`
- Testing guide: `ACCESSIBILITY_TESTING.md`
- Implementation summary: `ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md`
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Practices: https://www.w3.org/WAI/ARIA/apg/

## Questions?

Contact the accessibility team or refer to the full documentation.
