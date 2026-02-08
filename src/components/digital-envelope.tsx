import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Role, Party } from '@/types/game-types'
import { cn } from '@/lib/utils'

interface DigitalEnvelopeProps {
  role?: Role
  party?: Party
  isOpen?: boolean
  onToggle?: () => void
}

interface RoleCardProps {
  role: Role
  className?: string
}

interface PartyCardProps {
  party: Party
  className?: string
}

function RoleCard({ role, className }: RoleCardProps) {
  const roleConfig = {
    LIBERAL: {
      bg: 'bg-liberal-blue',
      text: 'text-white',
      border: 'border-2 border-noir-black',
      label: 'LIBERAL',
      symbol: '🦅',
      description: 'Protect democracy and enact liberal policies'
    },
    FASCIST: {
      bg: 'bg-fascist-red',
      text: 'text-white',
      border: 'border-2 border-noir-black',
      label: 'FASCIST',
      symbol: '🦎',
      description: 'Enact fascist policies and elect Hitler as Chancellor'
    },
    HITLER: {
      bg: 'bg-hitler-brown',
      text: 'text-white',
      border: 'border-2 border-noir-black',
      label: 'HITLER',
      symbol: '🎭',
      description: 'Get elected Chancellor or enact 6 fascist policies to win'
    }
  }

  const config = roleConfig[role]

  return (
    <div className={cn(
      'p-6 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105',
      config.bg,
      config.text,
      config.border,
      className
    )}>
      <div className="text-center space-y-4">
        <div className="text-6xl">{config.symbol}</div>
        <div>
          <h3 className="font-special-elite text-2xl font-bold mb-2">
            {config.label}
          </h3>
          <p className="text-sm opacity-90 max-w-xs mx-auto">
            {config.description}
          </p>
        </div>
      </div>
    </div>
  )
}

function PartyCard({ party, className }: PartyCardProps) {
  const partyConfig = {
    LIBERAL: {
      bg: 'bg-liberal-blue',
      text: 'text-white',
      border: 'border-2 border-noir-black',
      label: 'LIBERAL PARTY',
      description: 'Member of the Liberal Party'
    },
    FASCIST: {
      bg: 'bg-fascist-red',
      text: 'text-white',
      border: 'border-2 border-noir-black',
      label: 'FASCIST PARTY',
      description: 'Member of the Fascist Party'
    }
  }

  const config = partyConfig[party]

  return (
    <div className={cn(
      'p-4 rounded-lg shadow-md',
      config.bg,
      config.text,
      config.border,
      className
    )}>
      <div className="text-center space-y-2">
        <h4 className="font-special-elite text-lg font-bold">
          {config.label}
        </h4>
        <p className="text-xs opacity-90">
          {config.description}
        </p>
      </div>
    </div>
  )
}

export function DigitalEnvelope({ 
  role, 
  party, 
  isOpen: controlledIsOpen, 
  onToggle 
}: DigitalEnvelopeProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen

  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsOpen(!isOpen)
    }
  }

  if (!role || !party) {
    return (
      <div className="border-2 border-liberal-blue bg-parchment rounded-lg shadow-lg p-6">
        <div className="text-center text-noir-black/60">
          <p className="font-courier text-sm">ROLE INFORMATION UNAVAILABLE</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Digital Envelope Container */}
      <div className="border-2 border-liberal-blue bg-parchment rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="font-special-elite text-2xl text-liberal-blue mb-2">
            SECRET DOSSIER
          </h2>
          <div className="inline-block border border-noir-black px-3 py-1 bg-yellow-200/80">
            <span className="text-xs font-bold text-noir-black">TOP SECRET</span>
          </div>
        </div>

        {/* Envelope Content */}
        <div className="relative">
          {isOpen ? (
            // Open State - Reveal cards
            <div className="space-y-4 animate-in fade-in duration-500">
              <RoleCard role={role} />
              <PartyCard party={party} />
            </div>
          ) : (
            // Closed State - Sealed envelope
            <div className="border-2 border-dashed border-hitler-brown p-8 bg-parchment/50">
              <div className="text-center space-y-4">
                <div className="text-6xl opacity-60">📋</div>
                <div>
                  <p className="font-courier text-sm text-noir-black/70 mb-2">
                    CLASSIFIED DOCUMENT
                  </p>
                  <p className="font-courier text-xs text-noir-black/50">
                    Official designation enclosed within
                  </p>
                </div>
                <div className="wax-seal flex justify-center">
                  <div className="w-12 h-12 bg-fascist-red rounded-full border-2 border-noir-black flex items-center justify-center">
                    <span className="text-white font-bold text-xs">TOP</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <div className="mt-6 text-center">
          <Button
            onClick={handleToggle}
            variant={isOpen ? "outline" : "default"}
            className={cn(
              "font-bold px-6 py-3 border-2 border-noir-black transition-all duration-200",
              isOpen 
                ? "border-liberal-blue text-liberal-blue hover:bg-liberal-blue hover:text-white"
                : "bg-liberal-blue text-white hover:bg-liberal-blue/90"
            )}
          >
            {isOpen ? 'CLOSE ENVELOPE' : 'OPEN ENVELOPE'}
          </Button>
        </div>
      </div>

      {/* Instructions */}
      {!isOpen && (
        <div className="text-center space-y-2">
          <p className="font-courier text-xs text-noir-black/60">
            Press OPEN ENVELOPE to reveal your secret role
          </p>
          <p className="font-courier text-xs text-noir-black/40">
            Keep your identity confidential from other players
          </p>
        </div>
      )}
    </div>
  )
}

export default DigitalEnvelope