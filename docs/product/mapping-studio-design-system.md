# CanonBridge Design System

**Version**: 1.0.0  
**Last Updated**: May 10, 2026

---

## 📋 Overview

This document defines the design system for CanonBridge Mapping Studio UI, ensuring consistency, accessibility, and professional appearance across all components.

---

## 🎨 Brand Identity

### Logo

**Primary Logo**: CanonBridge wordmark with gradient icon
- Icon: Gradient from Blue 600 (#2563eb) to Violet 600 (#7c3aed)
- Typography: Inter Bold, 18px
- Subtitle: "Mapping Studio" in Inter Regular, 12px

### Brand Colors

```scss
$brand-primary: #2563eb;      // Blue 600 - Primary actions
$brand-primary-dark: #1e40af;  // Blue 700 - Hover states
$brand-primary-light: #3b82f6; // Blue 500 - Light accents
$brand-secondary: #7c3aed;     // Violet 600 - Secondary actions
$brand-accent: #06b6d4;        // Cyan 500 - Highlights
```

### Semantic Colors

```scss
$color-success: #10b981;       // Green 500 - Success states
$color-warning: #f59e0b;       // Amber 500 - Warning states
$color-error: #ef4444;         // Red 500 - Error states
$color-info: #3b82f6;          // Blue 500 - Info states
```

---

## 📝 Typography

### Font Families

**Primary**: Inter
- Used for all UI text
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)

**Monospace**: JetBrains Mono
- Used for code, JSON, and technical content
- Weights: 400 (Regular), 500 (Medium), 700 (Bold)

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| **Heading 1** | 36px | Bold (700) | 1.25 | Page titles |
| **Heading 2** | 30px | Bold (700) | 1.25 | Section titles |
| **Heading 3** | 24px | Semibold (600) | 1.25 | Subsection titles |
| **Heading 4** | 20px | Semibold (600) | 1.5 | Card titles |
| **Body Large** | 18px | Regular (400) | 1.75 | Large body text |
| **Body Base** | 16px | Regular (400) | 1.5 | Default body text |
| **Body Small** | 14px | Regular (400) | 1.5 | Secondary text |
| **Caption** | 12px | Regular (400) | 1.5 | Labels, captions |

### Usage Examples

```html
<h1>Create New Mapping</h1>
<h2>Partner Configuration</h2>
<h3>Field Mapping</h3>
<h4>Transformation Preview</h4>
<p>Upload or paste your sample JSON to begin mapping.</p>
<small class="text-muted">Last updated 2 hours ago</small>
```

---

## 🎨 Color System

### Neutral Palette

```scss
$neutral-50: #f9fafb;   // Backgrounds
$neutral-100: #f3f4f6;  // Hover states
$neutral-200: #e5e7eb;  // Borders
$neutral-300: #d1d5db;  // Disabled states
$neutral-400: #9ca3af;  // Placeholders
$neutral-500: #6b7280;  // Secondary text
$neutral-600: #4b5563;  // Body text
$neutral-700: #374151;  // Headings
$neutral-800: #1f2937;  // Dark text
$neutral-900: #111827;  // Primary text
```

### Status Colors

| Status | Color | Background | Usage |
|--------|-------|------------|-------|
| **Active** | Green 500 | Green 50 | Active partners, published mappings |
| **Inactive** | Gray 400 | Gray 50 | Inactive partners, draft mappings |
| **Pending** | Amber 500 | Amber 50 | Pending approvals, in-progress |
| **Error** | Red 500 | Red 50 | Failed transformations, errors |
| **Draft** | Gray 500 | Gray 50 | Draft mappings |
| **Published** | Green 500 | Green 50 | Published versions |

---

## 📐 Spacing System

Based on 4px grid:

```scss
$spacing-1: 4px;    // Tight spacing
$spacing-2: 8px;    // Small spacing
$spacing-3: 12px;   // Medium spacing
$spacing-4: 16px;   // Base spacing
$spacing-5: 20px;   // Large spacing
$spacing-6: 24px;   // XL spacing
$spacing-8: 32px;   // 2XL spacing
$spacing-10: 40px;  // 3XL spacing
$spacing-12: 48px;  // 4XL spacing
```

### Usage Guidelines

- **Padding**: Use spacing-4 (16px) as default for cards and containers
- **Margins**: Use spacing-4 (16px) between sections, spacing-2 (8px) between related items
- **Gaps**: Use spacing-3 (12px) for flex/grid gaps

---

## 🔲 Components

### Buttons

**Variants**:
- **Primary**: Blue background, white text - Main actions
- **Secondary**: White background, gray text, gray border - Secondary actions
- **Ghost**: Transparent background, gray text - Tertiary actions
- **Danger**: Red background, white text - Destructive actions

**Sizes**:
- **Small**: 32px height, 12px padding
- **Base**: 40px height, 16px padding
- **Large**: 48px height, 24px padding

**States**:
- Default
- Hover (darker background)
- Active (scale 0.98)
- Disabled (50% opacity)
- Focus (outline ring)

```html
<button class="p-button p-button-primary">Save Mapping</button>
<button class="p-button p-button-secondary">Cancel</button>
<button class="p-button p-button-text">Learn More</button>
<button class="p-button p-button-danger">Delete</button>
```

### Input Fields

**Variants**:
- Text input
- Textarea
- Select dropdown
- Multi-select
- Date picker
- File upload

**Sizes**:
- **Small**: 32px height
- **Base**: 40px height
- **Large**: 48px height

**States**:
- Default
- Focus (blue border, shadow)
- Error (red border, red shadow)
- Disabled (gray background)

```html
<input type="text" class="p-inputtext" placeholder="Enter partner name">
<input type="text" class="p-inputtext error" placeholder="Required field">
<input type="text" class="p-inputtext" disabled placeholder="Disabled">
```

### Cards

**Variants**:
- **Base**: White background, subtle shadow
- **Hover**: Elevated shadow on hover
- **Interactive**: Clickable with active state

**Structure**:
```html
<div class="p-card">
  <div class="p-card-title">Card Title</div>
  <div class="p-card-subtitle">Card subtitle</div>
  <div class="p-card-content">
    Card content goes here
  </div>
</div>
```

### Badges

**Variants**:
- **Success**: Green background
- **Warning**: Amber background
- **Error**: Red background
- **Info**: Blue background
- **Neutral**: Gray background

```html
<span class="p-badge p-badge-success">Active</span>
<span class="p-badge p-badge-warning">Pending</span>
<span class="p-badge p-badge-danger">Error</span>
<span class="p-badge p-badge-info">Draft</span>
```

### Data Tables

**Features**:
- Sortable columns
- Filterable data
- Pagination
- Row selection
- Hover states
- Empty states

**Structure**:
- Header: Gray background, semibold text
- Rows: White background, hover effect
- Borders: Subtle gray lines

---

## 🎭 Shadows

```scss
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
$shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
$shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
$shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

**Usage**:
- **sm**: Subtle elevation (cards)
- **base**: Default elevation (dropdowns)
- **md**: Medium elevation (modals)
- **lg**: High elevation (popovers)
- **xl**: Very high elevation (dialogs)
- **2xl**: Maximum elevation (overlays)

---

## 📏 Border Radius

```scss
$radius-sm: 4px;    // Small elements
$radius-base: 6px;  // Default
$radius-md: 8px;    // Cards, inputs
$radius-lg: 12px;   // Large cards
$radius-xl: 16px;   // Dialogs
$radius-2xl: 24px;  // Hero sections
$radius-full: 9999px; // Pills, avatars
```

---

## 🎬 Animations

### Transitions

```scss
$transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
$transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

### Animations

**Fade In**:
```scss
@include fade-in;
```

**Slide In Right**:
```scss
@include slide-in-right;
```

**Slide In Up**:
```scss
@include slide-in-up;
```

**Pulse** (for notifications):
```scss
@include pulse;
```

**Skeleton Loading**:
```scss
@include skeleton;
```

---

## 📱 Responsive Design

### Breakpoints

```scss
$breakpoint-sm: 640px;   // Mobile landscape
$breakpoint-md: 768px;   // Tablet portrait
$breakpoint-lg: 1024px;  // Tablet landscape
$breakpoint-xl: 1280px;  // Desktop
$breakpoint-2xl: 1536px; // Large desktop
```

### Usage

```scss
@include responsive(md) {
  // Styles for tablet and up
}

@include responsive(lg) {
  // Styles for desktop and up
}
```

---

## ♿ Accessibility

### Focus States

All interactive elements must have visible focus indicators:
```scss
@include focus-ring; // 2px blue outline with 2px offset
```

### Color Contrast

- **Text on white**: Minimum AA contrast (4.5:1)
- **Large text**: Minimum AA contrast (3:1)
- **Interactive elements**: Minimum AA contrast (3:1)

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus must be visible
- Escape key closes modals/dropdowns

### Screen Readers

- Use semantic HTML
- Provide alt text for images
- Use ARIA labels where needed
- Announce dynamic content changes

---

## 🌙 Dark Mode

### Dark Theme Colors

```scss
$dark-bg-primary: #0f172a;     // Main background
$dark-bg-secondary: #1e293b;   // Card background
$dark-bg-tertiary: #334155;    // Hover states
$dark-text-primary: #f1f5f9;   // Primary text
$dark-text-secondary: #cbd5e1; // Secondary text
```

### Implementation

```html
<body class="dark-mode">
  <!-- Dark mode styles automatically applied -->
</body>
```

---

## 📦 Component Library

### PrimeNG Components Used

- **Button**: p-button
- **Input**: p-inputtext
- **Card**: p-card
- **Table**: p-datatable
- **Dialog**: p-dialog
- **Dropdown**: p-dropdown
- **Toast**: p-toast
- **Menu**: p-menu
- **Sidebar**: p-sidebar
- **Badge**: p-badge

All components are customized to match the CanonBridge design system.

---

## 🎯 Best Practices

### Do's ✅

- Use design tokens (variables) instead of hard-coded values
- Follow the 4px spacing grid
- Use semantic color names (success, error, warning)
- Provide hover and focus states for all interactive elements
- Use consistent border radius across similar components
- Implement loading states for async operations
- Show empty states when no data is available
- Use appropriate shadows for elevation
- Follow accessibility guidelines

### Don'ts ❌

- Don't use arbitrary spacing values
- Don't mix different button styles in the same context
- Don't use colors outside the defined palette
- Don't forget focus indicators
- Don't use low contrast text
- Don't create custom components without checking existing ones
- Don't ignore responsive design
- Don't skip loading and error states

---

## 📚 Resources

### Design Files

- Figma: [Link to Figma file]
- Style Guide: This document
- Component Library: Storybook (coming soon)

### Code

- SCSS Variables: `src/styles/_variables.scss`
- SCSS Mixins: `src/styles/_mixins.scss`
- Global Styles: `src/styles.scss`

### References

- [PrimeNG Documentation](https://primeng.org/)
- [Tailwind CSS](https://tailwindcss.com/) - Inspiration for utility classes
- [Material Design](https://material.io/) - Design principles
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility guidelines

---

**Version**: 1.0.0  
**Last Updated**: May 10, 2026  
**Maintained by**: CanonBridge Design Team

