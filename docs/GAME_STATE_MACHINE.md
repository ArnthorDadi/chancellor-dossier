# Game State Machine

This document defines the game states and flow for the Secret Hitler Envelopes app.

## Game States

### LOBBY

**Description**: Players joining, waiting for Admin.  
**Purpose**: Initial gathering phase before game starts.  
**Key Actions**:

- Players join room via URL
- Admin manages player list
- Admin starts game when ready

### ROLE_REVEAL

**Description**: Digital Envelopes active. Players see roles.  
**Purpose**: Secret role distribution phase.  
**Key Actions**:

- Players open digital envelopes to view their roles
- Asymmetric information display based on player count
- Game transitions to VOTING after all players have viewed roles

### VOTING

**Description**: Election phase (Chancellor nomination).  
**Purpose**: Democratic election of Chancellor.  
**Key Actions**:

- President nominates Chancellor candidate
- All players vote (Ja/Nein)
- If majority votes Ja, proceed to LEGISLATIVE
- If majority votes Nein, continue with next Presidential election

### LEGISLATIVE

**Description**: President/Chancellor drawing policies.  
**Purpose**: Policy enactment phase.  
**Key Actions**:

- President draws 3 policy cards
- President discards 1, passes 2 to Chancellor
- Chancellor discards 1, enacts 1
- Enacted policy affects game board and powers

### EXECUTIVE_ACTION

**Description**: Special powers (like Investigation) active.  
**Purpose**: Presidential powers based on enacted fascist policies.  
**Key Actions**:

- President uses available power (Investigation, Special Election, etc.)
- Power execution varies by type
- Game returns to VOTING after power resolves

## State Flow

```
LOBBY → ROLE_REVEAL → VOTING → LEGISLATIVE → EXECUTIVE_ACTION → VOTING
                               ↓
                           (if Nein) → next election → VOTING
```

## Implementation Notes

- Game state is stored in Firebase Realtime Database at `/rooms/{roomId}/metadata/status`
- State transitions are controlled by Admin or automated based on game logic
- UI components render differently based on current game state
- Real-time synchronization ensures all players see same state
