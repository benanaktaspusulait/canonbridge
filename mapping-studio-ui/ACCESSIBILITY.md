# Accessibility Implementation Guide

## Overview

The CanonBridge Mapping Studio UI implements WCAG 2.1 Level AA accessibility standards to ensure the application is usable by all users, including those with disabilities.

## Implemented Features

### 1. ARIA Labels and Roles

All interactive elements have appropriate ARIA labels and roles:

- **Navigation**: `role="navigation"` with `aria-label` for primary and secondary navigation
- **Main Content**: `role="main"` with `id="main-content"` for skip link target
- **Buttons**: All buttons have descriptive `aria-label` attributes
- **Form Controls**: All inputs have associated labels using `for`/`id` or `aria-labelledby`
- **Status Messages**: Toast notifications use `role="alert"` and `aria-live="polite"`
- **Dialogs**: Modals use `role="dialog"` with proper focus management
- **Menus**: Dropdown menus use `aria-haspopup` and `aria-expanded`

### 2. Keyboard Navigation

Complete keyboard navigation support:

- **Tab Order**: Logical tab order following visual layout (top to bottom, left to right)
- **Focus Management**: Focus is properly managed in dialogs and dynamic content
- **Keyboard Shortcuts**: 
  - `Tab` / `Shift+Tab`: Navigate between interactive elements
  - `Enter` / `Space`: Activate buttons and links
  - `Escape`: Close dialogs and menus
  - `Arrow Keys`: Navigate within menus and lists
- **Skip Links**: Skip navigation links appear on focus to bypass repetitive content

### 3. Focus States

Visible focus indicators with 3:1 contrast ratio:

- **Focus Ring**: 3px solid blue outline with 2px offset
- **Dark Mode**: Lighter blue focus ring for sufficient contrast
- **High Contrast Mode**: Enhanced focus indicators (4px width, 3px offset)
- **Custom Components**: All custom components have focus states

### 4. Screen Reader Support

Screen reader announcements for dynamic content:

- **Validation Errors**: Announced with `aria-live="assertive"`
- **Save Confirmations**: Announced with `aria-live="polite"`
- **Preview Results**: Announced when transformation completes
- **Loading States**: Loading indicators announced to screen readers
- **Navigation Changes**: Page changes announced
- **Form Errors**: Field-specific errors announced

### 5. Skip Navigation Links

Skip links allow users to bypass repetitive navigation:

- **Skip to Main Content**: Jumps to `#main-content`
- **Skip to Navigation**: Jumps to `#primary-navigation`
- **Skip to Page Actions**: Jumps to `#page-actions`

Skip links are hidden by default and appear when focused.

### 6. Form Accessibility

All forms have proper accessibility features:

- **Labels**: All inputs have programmatically linked labels
- **Required Fields**: Marked with asterisk and `aria-required="true"`
- **Error Messages**: Associated with fields using `aria-describedby`
- **Field Groups**: Related fields grouped with `<fieldset>` and `<legend>`
- **Validation**: Real-time validation with screen reader announcements

### 7. Color and Contrast

Non-color indicators for all color-coded information:

- **Status Indicators**: Icons accompany color (✓ for success, ✕ for error, ⚠ for warning)
- **Validation States**: Icons and text labels in addition to color
- **Charts and Graphs**: Patterns and labels in addition to color
- **Contrast Ratios**:
  - Text: Minimum 4.5:1 for normal text, 3:1 for large text
  - UI Components: Minimum 3:1 contrast
  - Focus Indicators: Minimum 3:1 contrast

### 8. Responsive and Adaptive

- **Reduced Motion**: Respects `prefers-reduced-motion` media query
- **High Contrast**: Enhanced visibility in high contrast mode
- **Text Scaling**: UI remains functional at 200% text zoom
- **Mobile Accessibility**: Touch targets minimum 44x44px

## Component-Specific Accessibility

### Integration Studio (Mapping Wizard)

- **Wizard Steps**: Keyboard navigable with `aria-current="step"`
- **Source Type Cards**: Keyboard accessible with `aria-pressed` state
- **Field Tree**: Keyboard navigation with arrow keys
- **Drag and Drop**: Keyboard alternative with Space to grab, Arrow keys to move
- **Advanced Editor**: Syntax highlighting with sufficient contrast
- **Preview Panel**: Results announced to screen readers

### Partner Management

- **Partner Table**: Sortable columns with keyboard navigation
- **Action Buttons**: Descriptive labels for edit and delete
- **Add Partner Dialog**: Focus trapped within dialog
- **Form Validation**: Errors announced and associated with fields

### DLQ (Dead Letter Queue)

- **Message Table**: Keyboard navigable with row selection
- **Filters**: Accessible dropdowns with keyboard support
- **Bulk Actions**: Keyboard accessible with confirmation dialogs
- **Message Inspector**: Drawer with proper focus management
- **Redrive Actions**: Confirmation dialogs with clear messaging

## Testing Recommendations

### Automated Testing

Use automated tools to verify accessibility:

```bash
# Install axe-core for automated testing
npm install --save-dev @axe-core/playwright

# Run accessibility tests
npm run test:a11y
```

### Manual Testing

#### Keyboard Navigation Test

1. Disconnect mouse/trackpad
2. Navigate entire application using only keyboard
3. Verify all interactive elements are reachable
4. Verify focus indicators are visible
5. Verify logical tab order

#### Screen Reader Test

Test with multiple screen readers:

- **Windows**: NVDA (free) or JAWS
- **macOS**: VoiceOver (built-in)
- **Linux**: Orca

Test checklist:
- [ ] All images have alt text
- [ ] All buttons have descriptive labels
- [ ] Form fields are properly labeled
- [ ] Dynamic content changes are announced
- [ ] Error messages are announced
- [ ] Navigation landmarks are identified

#### Visual Test

- [ ] Zoom to 200% - UI remains functional
- [ ] Enable high contrast mode - content is visible
- [ ] Test with color blindness simulators
- [ ] Verify focus indicators are visible

### Browser Testing

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari

## Known Limitations

1. **Full WCAG Validation**: Requires manual testing with assistive technologies
2. **Third-Party Components**: PrimeNG components have their own accessibility features
3. **Complex Interactions**: Some advanced features may require additional keyboard shortcuts

## Accessibility Statement

The CanonBridge Mapping Studio UI is committed to providing an accessible experience for all users. We continuously work to improve accessibility and welcome feedback.

### Contact

For accessibility issues or feedback:
- Email: accessibility@canonbridge.example
- Issue Tracker: [GitHub Issues](https://github.com/canonbridge/mapping-studio/issues)

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/resources/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Changelog

### Version 1.0.0 (P3 Hardening)

- ✅ Added ARIA labels to all interactive elements
- ✅ Implemented keyboard navigation for all workflows
- ✅ Added visible focus states with 3:1 contrast ratio
- ✅ Implemented screen reader announcements
- ✅ Added skip navigation links
- ✅ Ensured all form inputs have linked labels
- ✅ Added non-color indicators for color-coded information
- ✅ Created accessibility service for announcements
- ✅ Implemented focus management for dialogs
- ✅ Added reduced motion support
- ✅ Added high contrast mode support
