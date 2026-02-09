// Debug script to test the logic
const mockPlayers = [
  { id: 'president-1', name: 'President Player' },
  { id: 'player-2', name: 'Target Player' },
  { id: 'player-3', name: 'Already Investigated' }
]

const currentPresidentId = 'president-1'
const alreadyInvestigated = ['player-3']

const canInvestigate = (player) => {
  // Cannot investigate self
  if (player.id === currentPresidentId) return false
  
  // Cannot investigate already investigated players
  if (alreadyInvestigated.includes(player.id)) return false
  
  // Can investigate all other players
  return true
}

const getInvestigationStatus = (player) => {
  if (player.id === currentPresidentId) return 'Cannot investigate self'
  if (alreadyInvestigated.includes(player.id)) return 'Already investigated'
  return 'Eligible for investigation'
}

console.log('=== Debug Investigation Logic ===')
mockPlayers.forEach(player => {
  console.log(`Player: ${player.name} (${player.id})`)
  console.log(`  isAlreadyInvestigated: ${alreadyInvestigated.includes(player.id)}`)
  console.log(`  canInvestigate: ${canInvestigate(player)}`)
  console.log(`  status: ${getInvestigationStatus(player)}`)
  console.log('')
})