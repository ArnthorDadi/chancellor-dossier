# Development Constraints

This document outlines the technical constraints and requirements for the Secret Hitler Envelopes app.

## Mobile-First Requirements

### Priority

All logic and UI must prioritize small screens first. Desktop enhancements are secondary to mobile experience.

### Touch Targets

- **Minimum Size**: All buttons and interactive elements must be at least 44x44px
- **Spacing**: Adequate spacing between touch targets to prevent accidental taps
- **Accessibility**: Touch targets must be easily reachable with thumb on common device sizes

## Responsive Design Rules

### Mobile (< 768px)

- **Layout**: Full-width layout, no max-width constraints
- **Content**: Stack vertically, avoid side-by-side layouts that require horizontal scrolling
- **Navigation**: Mobile-friendly navigation patterns (bottom nav, hamburger menu, etc.)

### Desktop (≥ 768px)

- **Container**: Use max-width container (e.g., `max-w-2xl`) to keep UI centered and professional
- **Spacing**: Increased whitespace for better desktop readability
- **Enhanced Features**: Take advantage of larger screen real estate when appropriate

## Zero Horizontal Scrolling

### Requirements

- Layout must be 100vw compliant at all times
- No content should overflow horizontally on any screen size
- Test on smallest target devices (320px width minimum)

### Implementation Guidelines

- Use `overflow-x-hidden` on containers when necessary
- Avoid fixed-width elements that exceed viewport
- Use percentage-based or flex layouts for responsive content
- Test text overflow in long content areas

## Performance Constraints

### Loading

- Optimize for mobile network conditions
- Lazy load non-critical assets
- Minimize initial bundle size

### Interaction

- Touch responses should be immediate (< 100ms)
- Smooth animations on mobile hardware
- Efficient state updates for real-time sync

## Browser Compatibility

### Target Browsers

- **Mobile**: Safari (iOS), Chrome (Android)
- **Desktop**: Chrome, Firefox, Safari, Edge
- **Fallback**: Graceful degradation for older browsers

### Progressive Enhancement

- Core functionality must work without JavaScript limitations
- Enhanced features with modern browser APIs
- Fallback UI for unsupported features
