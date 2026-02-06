# UI Styling Guide

This guide provides styling guidelines for the Secret Hitler Envelopes game app, implementing a 1930s Noir / Bureaucratic Minimalist aesthetic using shadcn/ui and Tailwind CSS.

## Design System Overview

**Theme**: 1930s Noir / Bureaucratic Minimalist  
**Tech Stack**: Vite + React + Tailwind CSS v4 + shadcn/ui  
**Target**: Mobile-first responsive game companion app  
**Aesthetic**: Period-appropriate bureaucratic styling with noir atmosphere  
**Real-time**: Firebase Realtime Database for synchronization

## Color Palette

### Light Theme (1930s Office)
```css
--liberal-blue: #2b5d84;
--fascist-red: #9c2a2a;
--hitler-brown: #4d342c;
--parchment-bg: #f4e4bc;
--noir-black: #1a1a1a;
--aged-paper: #d4c5a1;
```

### Dark Theme (Noir Atmosphere)
```css
--liberal-blue: #3d7ba4;
--fascist-red: #bc3a3a;
--hitler-brown: #6d443c;
--parchment-bg: #2a2416;
--noir-black: #0a0a0a;
--aged-paper: #847a61;
```

## Typography System

### Primary Fonts
- **Special Elite**: Typewriter aesthetic for headers
- **Courier Prime**: Body text and bureaucratic forms
- **Fallback**: System monospace fonts

### Loading Strategy
```tsx
// Add to index.css or main layout
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Courier+Prime&display=swap');
```

### Typography Patterns
```tsx
// Bureaucratic Header
<h1 className="font-special-elite text-2xl text-liberal-blue">
  SECRET DOSSIER
</h1>

// Form Content
<p className="font-courier text-sm aged-paper">
  Top Secret - For Internal Use Only
</p>
```

## Component Patterns

### Digital Envelope
```tsx
<div className="border-2 border-liberal-blue bg-parchment rounded-lg shadow-lg p-4">
  <div className="border border-dashed border-hitler-brown p-6">
    {/* Envelope content */}
  </div>
</div>
```

### Role Cards
```tsx
// Liberal Card
<div className="bg-liberal-blue text-white p-4 rounded border-2 border-noir-black">
  <h3 className="font-special-elite">LIBERAL</h3>
</div>

// Fascist Card  
<div className="bg-fascist-red text-white p-4 rounded border-2 border-noir-black">
  <h3 className="font-special-elite">FASCIST</h3>
</div>

// Hitler Card
<div className="bg-hitler-brown text-white p-4 rounded border-2 border-noir-black">
  <h3 className="font-special-elite">HITLER</h3>
</div>
```

### Buttons with Noir Styling
```tsx
<Button className="bg-liberal-blue hover:bg-liberal-blue/90 border-2 border-noir-black">
  Investigate
</Button>

<Button variant="outline" className="border-liberal-blue text-liberal-blue hover:bg-liberal-blue hover:text-white">
  Reveal Role
</Button>
```

## Responsive Design

### Mobile-First Rules
- **Touch Targets**: Minimum 44x44px for all interactive elements
- **Container**: Full width on mobile (< 768px)
- **Typography**: Readable without zooming

### Desktop Scaling
```tsx
// Desktop container with max-width
<div className="w-full max-w-2xl mx-auto p-4">
  {/* Game content */}
</div>
```

### Zero Horizontal Scroll
- All layouts must be 100vw compliant
- Use overflow-x-hidden on containers when necessary
- Test on smallest target devices (320px width)

## Asset Management

### File Naming Conventions
```
src/assets/
├── icons/
│   ├── envelope-open.svg
│   ├── envelope-closed.svg
│   └── liberal-icon.svg
├── textures/
│   ├── parchment-bg.jpg
│   └── paper-texture.png
└── sounds/
    ├── envelope-open.mp3
    └── card-reveal.mp3
```

### General Guidelines
- **Format**: SVG for icons, WebP for photos
- **Size**: Optimize for mobile, keep under 100KB per asset
- **Period Authenticity**: Use aged, worn textures for envelopes
- **Consistency**: Maintain noir aesthetic across all visual elements

### shadcn/ui Integration
- Extend existing shadcn/ui theme with custom noir colors
- Maintain component variants while adding period styling
- Use Tailwind CSS v4 custom properties for theme colors

## Implementation Notes

- Use CSS custom properties for theme colors in `src/index.css`
- Maintain dark mode support with noir-appropriate variants
- Test touch interactions on actual mobile devices
- Keep visual hierarchy clear in low-light gaming conditions