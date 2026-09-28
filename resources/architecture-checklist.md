# Architecture Checklist

## Component Standards
- [ ] Component has TypeScript interface with `Readonly<>` wrapper
- [ ] Interface name follows `[ComponentName]Props` pattern
- [ ] Component uses React.FC type annotation
- [ ] Props are destructured with defaults where appropriate
- [ ] Component is exported as both named and default export

## Style & Design System
- [ ] Uses theme-mapped Tailwind classes (no arbitrary hex codes)
- [ ] Follows Sonic Curator design tokens from style-guide.json
- [ ] No 1px borders (uses tonal layering instead)
- [ ] Proper color hierarchy: surface-container-* variants
- [ ] Typography uses Manrope font family
- [ ] Maintains 8px border radius (ROUND_EIGHT) pattern

## Data & Logic
- [ ] No hardcoded strings or data in component
- [ ] All static content moved to src/data/mockData.ts
- [ ] Event handlers and business logic moved to custom hooks
- [ ] Component remains purely presentational when possible

## Accessibility & UX
- [ ] Proper semantic HTML elements
- [ ] Keyboard navigation support where appropriate
- [ ] Focus states for interactive elements
- [ ] Screen reader friendly structure
- [ ] High contrast maintained in dark theme

## Performance
- [ ] No unnecessary re-renders
- [ ] Images have proper sizing and loading attributes
- [ ] Smooth hover transitions (200ms duration)
- [ ] Efficient class name construction

## Mobile Responsiveness
- [ ] Works on mobile viewports (320px+)
- [ ] Touch-friendly interactive elements (44px minimum)
- [ ] Responsive typography scale
- [ ] Proper spacing on smaller screens

## File Organization
- [ ] Component in appropriate directory structure
- [ ] Clear file naming convention
- [ ] Related components grouped logically
- [ ] Proper import/export statements

## Validation
- [ ] Passes `npm run validate` without errors
- [ ] No TypeScript compilation errors
- [ ] ESLint rules satisfied
- [ ] Component renders without console errors