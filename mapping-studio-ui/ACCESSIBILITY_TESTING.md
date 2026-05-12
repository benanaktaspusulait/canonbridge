# Accessibility Testing Guide

## Overview

This guide provides step-by-step instructions for testing the accessibility features of the CanonBridge Mapping Studio UI.

## Prerequisites

### Tools Required

1. **Screen Readers**:
   - Windows: [NVDA](https://www.nvaccess.org/download/) (free)
   - macOS: VoiceOver (built-in, press Cmd+F5)
   - Linux: Orca

2. **Browser Extensions**:
   - [axe DevTools](https://www.deque.com/axe/devtools/)
   - [WAVE](https://wave.webaim.org/extension/)
   - [Lighthouse](https://developers.google.com/web/tools/lighthouse) (built into Chrome DevTools)

3. **Keyboard**: For keyboard-only navigation testing

## Test Scenarios

### 1. Keyboard Navigation Test

#### Test: Complete Mapping Creation Workflow

**Steps**:
1. Start at the login page
2. Use only keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
3. Navigate through:
   - Login form
   - Dashboard
   - Integration Studio
   - Mapping wizard (all steps)
   - Save mapping

**Expected Results**:
- [ ] All interactive elements are reachable via keyboard
- [ ] Focus indicators are visible on all focused elements
- [ ] Tab order is logical (top to bottom, left to right)
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes dialogs and menus
- [ ] No keyboard traps (can always navigate away)

**Pass Criteria**: All checkboxes checked

---

#### Test: Skip Navigation Links

**Steps**:
1. Load any page
2. Press Tab (first focus should be skip links)
3. Press Enter on "Skip to main content"
4. Verify focus moves to main content area

**Expected Results**:
- [ ] Skip links appear on first Tab press
- [ ] Skip links are visible and readable
- [ ] Skip links work correctly
- [ ] Focus moves to correct target

**Pass Criteria**: All checkboxes checked

---

### 2. Screen Reader Test

#### Test: Integration Studio with NVDA/VoiceOver

**Steps**:
1. Enable screen reader
2. Navigate to Integration Studio
3. Listen to announcements for:
   - Page title and description
   - Wizard step navigation
   - Source type selection
   - Field tree navigation
   - Transformation preview
   - Validation errors
   - Save confirmation

**Expected Results**:
- [ ] Page title is announced
- [ ] Wizard steps are announced with current step
- [ ] Source type cards announce their state (pressed/not pressed)
- [ ] Field tree items are announced with type
- [ ] Transformation results are announced
- [ ] Validation errors are announced immediately
- [ ] Save confirmation is announced

**Pass Criteria**: All checkboxes checked

---

#### Test: Partner Management with Screen Reader

**Steps**:
1. Enable screen reader
2. Navigate to Partners page
3. Listen to announcements for:
   - Page title and partner count
   - Table headers
   - Partner rows
   - Action buttons
   - Add partner dialog
   - Form validation

**Expected Results**:
- [ ] Page title and summary are announced
- [ ] Table structure is announced (rows, columns)
- [ ] Partner information is announced in logical order
- [ ] Action buttons have descriptive labels
- [ ] Dialog title and purpose are announced
- [ ] Form fields are announced with labels
- [ ] Validation errors are announced

**Pass Criteria**: All checkboxes checked

---

#### Test: DLQ with Screen Reader

**Steps**:
1. Enable screen reader
2. Navigate to DLQ page
3. Listen to announcements for:
   - Page title and message count
   - Filter controls
   - Message table
   - Bulk actions
   - Message inspector

**Expected Results**:
- [ ] Page title and message count are announced
- [ ] Filter controls are announced with current values
- [ ] Table structure is announced
- [ ] Message details are announced
- [ ] Bulk action buttons have descriptive labels
- [ ] Inspector drawer content is announced

**Pass Criteria**: All checkboxes checked

---

### 3. Focus State Test

#### Test: Visual Focus Indicators

**Steps**:
1. Navigate through all pages using Tab key
2. Verify focus indicators on:
   - Buttons
   - Links
   - Form inputs
   - Dropdowns
   - Checkboxes
   - Radio buttons
   - Custom components

**Expected Results**:
- [ ] Focus ring is visible (3px blue outline)
- [ ] Focus ring has sufficient contrast (3:1 minimum)
- [ ] Focus ring is consistent across components
- [ ] Focus ring is visible in both light and dark modes
- [ ] Focus ring doesn't obscure content

**Pass Criteria**: All checkboxes checked

---

### 4. Form Accessibility Test

#### Test: Partner Onboarding Form

**Steps**:
1. Navigate to Partners page
2. Click "Onboard Partner"
3. Test form accessibility:
   - Tab through all fields
   - Submit with empty fields
   - Submit with invalid data
   - Submit with valid data

**Expected Results**:
- [ ] All fields have visible labels
- [ ] Required fields are marked with asterisk
- [ ] Tab order is logical
- [ ] Validation errors appear near fields
- [ ] Errors are announced to screen readers
- [ ] Error messages are descriptive
- [ ] Success message is announced

**Pass Criteria**: All checkboxes checked

---

### 5. Color and Contrast Test

#### Test: Color Blindness Simulation

**Steps**:
1. Use browser extension or OS settings to simulate color blindness
2. Navigate through all pages
3. Verify all information is conveyed without color alone

**Expected Results**:
- [ ] Status indicators have icons (not just color)
- [ ] Validation states have icons and text
- [ ] Charts have patterns or labels
- [ ] Links are distinguishable (underline or icon)
- [ ] All information is accessible

**Pass Criteria**: All checkboxes checked

---

#### Test: Contrast Ratios

**Steps**:
1. Use axe DevTools or WAVE to check contrast
2. Verify contrast ratios for:
   - Body text
   - Headings
   - Button text
   - Link text
   - Form labels
   - Error messages
   - Focus indicators

**Expected Results**:
- [ ] Normal text: 4.5:1 minimum
- [ ] Large text: 3:1 minimum
- [ ] UI components: 3:1 minimum
- [ ] Focus indicators: 3:1 minimum

**Pass Criteria**: All checkboxes checked

---

### 6. Responsive Accessibility Test

#### Test: Text Zoom

**Steps**:
1. Set browser zoom to 200%
2. Navigate through all pages
3. Verify functionality

**Expected Results**:
- [ ] All content is visible
- [ ] No horizontal scrolling required
- [ ] All interactive elements are usable
- [ ] Text doesn't overlap
- [ ] Layout adapts appropriately

**Pass Criteria**: All checkboxes checked

---

#### Test: Reduced Motion

**Steps**:
1. Enable "Reduce motion" in OS settings
2. Navigate through all pages
3. Verify animations are reduced

**Expected Results**:
- [ ] Transitions are instant or very brief
- [ ] No distracting animations
- [ ] Functionality is preserved
- [ ] Content is still accessible

**Pass Criteria**: All checkboxes checked

---

### 7. Automated Testing

#### Test: axe DevTools Scan

**Steps**:
1. Install axe DevTools browser extension
2. Open each page
3. Run axe scan
4. Review and fix issues

**Expected Results**:
- [ ] No critical issues
- [ ] No serious issues
- [ ] Moderate issues documented
- [ ] Minor issues documented

**Pass Criteria**: No critical or serious issues

---

#### Test: Lighthouse Accessibility Audit

**Steps**:
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Run accessibility audit
4. Review score and issues

**Expected Results**:
- [ ] Score: 90+ (target: 100)
- [ ] All issues documented
- [ ] Action plan for improvements

**Pass Criteria**: Score 90+

---

## Test Matrix

| Component | Keyboard Nav | Screen Reader | Focus States | Forms | Color/Contrast | Responsive |
|-----------|-------------|---------------|--------------|-------|----------------|------------|
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| Integration Studio | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Mappings | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| Partners | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| External Systems | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| DLQ | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| Monitoring | ✅ | ✅ | ✅ | N/A | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Issue Reporting

When reporting accessibility issues, include:

1. **Component**: Which page/component has the issue
2. **Issue Type**: Keyboard, screen reader, focus, color, etc.
3. **Steps to Reproduce**: Detailed steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Severity**: Critical, High, Medium, Low
7. **Screenshots/Videos**: If applicable
8. **Assistive Technology**: Screen reader, browser, OS version

## Continuous Testing

### Pre-Commit Checks

```bash
# Run automated accessibility tests
npm run test:a11y

# Run linting for accessibility issues
npm run lint:a11y
```

### CI/CD Integration

Accessibility tests should run on every pull request:
- Automated axe-core tests
- Lighthouse CI
- Pa11y CI

### Regular Audits

Schedule regular accessibility audits:
- Monthly: Automated scans
- Quarterly: Manual testing with screen readers
- Annually: Professional accessibility audit

## Resources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Deque University](https://dequeuniversity.com/)

## Checklist Summary

Use this checklist for each release:

- [ ] All keyboard navigation tests pass
- [ ] All screen reader tests pass
- [ ] All focus state tests pass
- [ ] All form accessibility tests pass
- [ ] All color/contrast tests pass
- [ ] All responsive accessibility tests pass
- [ ] Automated tests pass (axe, Lighthouse)
- [ ] No critical or serious issues
- [ ] Documentation updated
- [ ] Accessibility statement updated
