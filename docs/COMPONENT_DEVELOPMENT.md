# Component Development Guide

This guide provides templates and patterns for implementing 1930s Noir / Bureaucratic Minimalist components using shadcn/ui and Tailwind CSS v4.

## Noir Component Templates

### Base Noir Component Template

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const noirComponentVariants = cva(
  "border-2 rounded-lg shadow-lg transition-all duration-300",
  {
    variants: {
      variant: {
        liberal: "bg-liberal-blue text-white border-noir-black shadow-liberal-blue/20",
        fascist: "bg-fascist-red text-white border-noir-black shadow-fascist-red/20",
        hitler: "bg-hitler-brown text-white border-noir-black shadow-hitler-brown/20",
        neutral: "bg-parchment text-noir-black border-liberal-blue shadow-parchment/30",
        vintage: "bg-vintage-cream text-noir-black border-hitler-brown shadow-hitler-brown/20",
        noir: "bg-shadow-black text-vintage-cream border-parchment shadow-2xl",
      },
      size: {
        sm: "p-3 text-sm",
        default: "p-4 text-base",
        lg: "p-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "default",
    },
  }
)

interface NoirComponentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noirComponentVariants> {}

function NoirComponent({ 
  variant, 
  size, 
  className, 
  children, 
  ...props 
}: NoirComponentProps) {
  return (
    <div
      className={cn(noirComponentVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </div>
  )
}

export { NoirComponent, noirComponentVariants }
```

### Noir Button Component

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground border-transparent",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
        
        // Noir Variants
        liberal: "bg-liberal-blue text-vintage-cream hover:bg-liberal-blue/90 border-liberal-blue-900 shadow-md",
        fascist: "bg-fascist-red text-vintage-cream hover:bg-fascist-red/90 border-fascist-red-900 shadow-md",
        hitler: "bg-hitler-brown text-vintage-cream hover:bg-hitler-brown/90 border-hitler-brown-900 shadow-md",
        parchment: "bg-parchment text-noir-black hover:bg-parchment/90 border-liberal-blue shadow-sm",
        noir: "bg-shadow-black text-vintage-cream hover:bg-hitler-brown/90 border-parchment shadow-lg",
        vintage: "bg-vintage-cream text-noir-black hover:bg-parchment/50 border-hitler-brown shadow-sm",
      },
      font: {
        elite: "font-special-elite",
        courier: "font-courier-prime",
        sans: "font-sans",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      font: "sans",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, font, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, font, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Digital Envelope Component

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const envelopeVariants = cva(
  "rounded-lg shadow-xl transition-all duration-500",
  {
    variants: {
      variant: {
        liberal: "border-liberal-blue bg-parchment",
        fascist: "border-fascist-red bg-parchment", 
        hitler: "border-hitler-brown bg-parchment",
        neutral: "border-aged-paper bg-parchment",
      },
      sealed: {
        true: "bg-gradient-to-br from-parchment to-aged-paper",
        false: "bg-parchment",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "neutral",
      sealed: true,
      size: "default",
    },
  }
)

interface DigitalEnvelopeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof envelopeVariants> {
  title?: string
  isRevealed?: boolean
}

function DigitalEnvelope({ 
  variant, 
  sealed, 
  size, 
  title, 
  isRevealed = false, 
  className, 
  children, 
  ...props 
}: DigitalEnvelopeProps) {
  return (
    <div className="relative">
      <div
        className={cn(
          envelopeVariants({ variant, sealed: !isRevealed, size, className }),
          "border-2"
        )}
        {...props}
      >
        {title && (
          <h3 className="font-special-elite text-xl mb-4 text-liberal-blue text-center">
            {title}
          </h3>
        )}
        
        {isRevealed ? (
          <div className="border border-dashed border-hitler-brown p-6 bg-parchment/50">
            {children}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🔒</div>
              <p className="font-courier-prime text-sm text-noir-black/70">
                SEALED DOSSIER
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Stamp Effect */}
      {!isRevealed && (
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-fascist-red rounded-full border-2 border-noir-black flex items-center justify-center">
          <span className="font-special-elite text-xs text-vintage-cream">
            TOP
          </span>
        </div>
      )}
    </div>
  )
}

export { DigitalEnvelope, envelopeVariants }
```

### Role Card Component

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const roleCardVariants = cva(
  "border-2 rounded-lg shadow-lg p-6 text-center transition-all duration-300",
  {
    variants: {
      role: {
        liberal: "bg-liberal-blue text-white border-noir-black shadow-liberal-blue/30",
        fascist: "bg-fascist-red text-white border-noir-black shadow-fascist-red/30", 
        hitler: "bg-hitler-brown text-white border-noir-black shadow-hitler-brown/30",
        unknown: "bg-parchment text-noir-black border-liberal-blue shadow-parchment/30",
      },
      revealed: {
        true: "scale-105 shadow-2xl",
        false: "opacity-75",
      },
    },
    defaultVariants: {
      role: "unknown",
      revealed: false,
    },
  }
)

interface RoleCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof roleCardVariants> {
  playerName: string
  roleLabel?: string
  isRevealed?: boolean
}

function RoleCard({ 
  role, 
  revealed, 
  playerName, 
  roleLabel, 
  isRevealed = false, 
  className, 
  ...props 
}: RoleCardProps) {
  const displayRole = isRevealed ? role : "unknown"
  const displayLabel = isRevealed ? roleLabel?.toUpperCase() : "CLASSIFIED"
  
  return (
    <div
      className={cn(roleCardVariants({ role: displayRole, revealed: isRevealed, className }))}
      {...props}
    >
      <div className="space-y-4">
        <div className="text-sm font-courier-prime opacity-80">
          AGENT: {playerName}
        </div>
        
        <div className="py-4">
          <div className="font-special-elite text-2xl">
            {displayLabel}
          </div>
        </div>
        
        {isRevealed && (
          <div className="text-xs font-courier-prime opacity-70 border-t border-current pt-4">
            TOP SECRET // CLEARANCE LEVEL 5
          </div>
        )}
        
        {!isRevealed && (
          <div className="text-xs font-courier-prime opacity-70 border-t border-current pt-4">
            PENDING CLEARANCE // AUTHENTICATION REQUIRED
          </div>
        )}
      </div>
    </div>
  )
}

export { RoleCard, roleCardVariants }
```

### Bureaucratic Form Component

```typescript
import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const formVariants = cva(
  "space-y-4 p-6 border-2 rounded-lg shadow-lg",
  {
    variants: {
      variant: {
        dossier: "border-liberal-blue bg-parchment",
        telegram: "border-fascist-red bg-vintage-cream",
        memorandum: "border-hitler-brown bg-aged-paper",
      },
    },
    defaultVariants: {
      variant: "dossier",
    },
  }
)

interface BureaucraticFormProps
  extends React.HTMLAttributes<HTMLFormElement>,
    VariantProps<typeof formVariants> {
  title: string
  subtitle?: string
}

function BureaucraticForm({ 
  variant, 
  title, 
  subtitle, 
  className, 
  children, 
  ...props 
}: BureaucraticFormProps) {
  return (
    <form
      className={cn(formVariants({ variant, className }))}
      {...props}
    >
      <div className="text-center mb-6 pb-4 border-b border-current/30">
        <h2 className="font-special-elite text-2xl text-liberal-blue mb-2">
          {title}
        </h2>
        {subtitle && (
          <p className="font-courier-prime text-sm text-noir-black/70">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="space-y-4">
        {children}
      </div>
      
      <div className="mt-6 pt-4 border-t border-current/30 text-center">
        <p className="font-courier-prime text-xs text-noir-black/50">
          CONFIDENTIAL // FOR INTERNAL USE ONLY
        </p>
      </div>
    </form>
  )
}

export { BureaucraticForm, formVariants }
```

## shadcn/ui Extension Patterns

### Extending Existing Components

When extending shadcn/ui components with noir styling:

1. **Add Noir Variants**: Use `class-variance-authority` for consistent variant management
2. **Maintain Backward Compatibility**: Keep existing variants and add new ones
3. **Font Options**: Add `font` prop for typography selection
4. **Border Styling**: Noir components typically use `border-2` for that bureaucratic stamp effect

### Pattern Template:

```typescript
// 1. Import necessary dependencies
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// 2. Define variants with noir theme
const componentVariants = cva(
  "base-classes", // Existing shadcn/ui base classes
  {
    variants: {
      variant: {
        // Keep existing variants
        default: "existing-default-classes",
        outline: "existing-outline-classes",
        
        // Add noir variants
        liberal: "bg-liberal-blue text-vintage-cream border-liberal-blue-900",
        fascist: "bg-fascist-red text-vintage-cream border-fascist-red-900", 
        hitler: "bg-hitler-brown text-vintage-cream border-hitler-brown-900",
        noir: "bg-shadow-black text-vintage-cream border-parchment",
      },
      font: {
        elite: "font-special-elite",
        courier: "font-courier-prime",
        sans: "font-sans",
      },
    },
    defaultVariants: {
      variant: "default",
      font: "sans",
    },
  }
)

// 3. Create component with noir props
interface NoirComponentProps extends 
  React.HTMLAttributes<HTMLElement>,
  VariantProps<typeof componentVariants> {
  // Additional noir-specific props
}

// 4. Forward ref and implement
const NoirComponent = React.forwardRef<HTMLElement, NoirComponentProps>(
  ({ className, variant, font, ...props }, ref) => {
    return (
      <ElementType
        className={cn(componentVariants({ variant, font, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

## Responsive Noir Design

### Mobile-First Noir Patterns

```typescript
// Mobile-first responsive noir design
<div className="w-full max-w-md mx-auto p-4
               md:max-w-2xl md:p-6
               lg:max-w-4xl lg:p-8">
  <NoirCard variant="parchment">
    <h1 className="font-special-elite text-lg 
                     md:text-2xl 
                     lg:text-3xl">
      Secret Dossier
    </h1>
  </NoirCard>
</div>
```

### Touch-Target Noir Styling

```typescript
// Ensure 44x44px minimum touch targets with noir styling
<Button 
  variant="liberal" 
  size="lg"
  className="min-h-[44px] min-w-[44px]"
>
  Investigate
</Button>
```

### Dark Mode Noir Variants

```typescript
// Dark mode support for noir components
<div className="bg-parchment text-noir-black 
               dark:bg-shadow-black dark:text-vintage-cream
               border-liberal-blue
               dark:border-aged-paper">
  Noir content with dark mode
</div>
```

## Common Noir Styling Combinations

### Color + Typography Pairings

```typescript
// Liberal headers
<h1 className="font-special-elite text-liberal-blue">
  LIBERAL DIRECTIVE
</h1>

// Fascist warnings  
<p className="font-courier-prime text-fascist-red">
  WARNING: SECURITY BREACH
</p>

// Hitler confidential
<div className="font-special-elite text-hitler-brown">
  CONFIDENTIAL MEMORANDUM
</div>
```

### Border + Shadow Patterns

```typescript
// Standard noir border
<div className="border-2 border-liberal-blue bg-parchment shadow-lg">
  Noir content
</div>

// Dual border for envelopes
<div className="border-2 border-fascist-red bg-parchment">
  <div className="border border-dashed border-hitler-brown p-4">
    Envelope content
  </div>
</div>
```

### Responsive Noir Layouts

```typescript
// Noir card grid
<div className="grid grid-cols-1 gap-4
                md:grid-cols-2 md:gap-6
                lg:grid-cols-3 lg:gap-8">
  <RoleCard role="liberal" playerName="Agent 1" />
  <RoleCard role="fascist" playerName="Agent 2" />
  <RoleCard role="hitler" playerName="Agent 3" />
</div>
```

## Testing Noir Components

### Visual Regression Testing

```typescript
// Test noir component variants
describe('NoirButton Variants', () => {
  it('renders liberal variant correctly', () => {
    render(<Button variant="liberal">Liberal Action</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-liberal-blue')
  })
  
  it('applies correct typography', () => {
    render(<Button font="elite">Typewriter Text</Button>)
    expect(screen.getByRole('button')).toHaveClass('font-special-elite')
  })
})
```

### Accessibility Testing

```typescript
// Test color contrast in noir components
test('noir components maintain accessibility', async ({ page }) => {
  await page.goto('/')
  await checkA11y(page, {
    rules: {
      'color-contrast': { enabled: true }
    }
  })
})
```

### Mobile Touch Testing

```typescript
// Test touch targets on mobile
test('noir buttons meet touch target requirements', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  const buttons = await page.locator('button[variant*="liberal"]')
  
  for (const button of await buttons.all()) {
    const box = await button.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
  }
})
```

---

This guide provides comprehensive templates and patterns for implementing consistent 1930s Noir styling across all components. For complete design system reference, see [UI_STYLING.md](./UI_STYLING.md).