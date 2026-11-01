'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { Player, Team, Match } from '@/lib/server/db'
import {
  apiAuth,
  apiLeague,
  apiTeams,
  apiPlayers,
  apiAuction,
  apiMatches,
  apiOwner,
  type LiveSpin,
  type OwnerDetails,
  getAuthToken,
  getOwnerTeamId,
  setAuthToken,
  setOwnerToken
} from '@/lib/client/api'
import { sounds } from '@/lib/client/sound'

// Layout & Common Components
import { Topbar } from '@/components/layout/Topbar'
import { Toast } from '@/components/common/Toast'

// Views
import { HomeView } from '@/components/views/HomeView'
import { AuctionView, type WheelScope } from '@/components/views/AuctionView'
import { WHEEL_REVEAL_PAUSE_MS, WHEEL_SPIN_MS } from '@/lib/shared/rules'
import { SpectatorView } from '@/components/views/SpectatorView'
import { TeamsView } from '@/components/views/TeamsView'
import { PlayersView } from '@/components/views/PlayersView'
import { ScheduleView } from '@/components/views/ScheduleView'
import { ResultsView } from '@/components/views/ResultsView'
import { StandingsView } from '@/components/views/StandingsView'

// Modals
import { AuthModal } from '@/components/modals/AuthModal'
import { DirectSellModal } from '@/components/modals/DirectSellModal'
import { AddPlayerModal } from '@/components/modals/AddPlayerModal'
import { BulkImportModal } from '@/components/modals/BulkImportModal'
import { AddTeamModal } from '@/components/modals/AddTeamModal'
import { AdjustBudgetModal } from '@/components/modals/AdjustBudgetModal'
import { AddMatchModal } from '@/components/modals/AddMatchModal'
import { TossModal } from '@/components/modals/TossModal'
import { ResultModal } from '@/components/modals/ResultModal'
import { OwnerLoginModal } from '@/components/modals/OwnerLoginModal'
import { SetupModal } from '@/components/modals/SetupModal'

export default function Page() {
  // Navigation & Core Entity State
  const [page, setPage] = useState('home')
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [current, setCurrent] = useState<Player | null>(null)
  const [bid, setBid] = useState(0)
  const [leader, setLeader] = useState<Team | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [drawnPlayerId, setDrawnPlayerId] = useState<number | null>(null)
  const [liveSpin, setLiveSpin] = useState<LiveSpin | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [scheduleFilter, setScheduleFilter] = useState('ALL')

  // League Metadata State
  const [wheelScope, setWheelScope] = useState<WheelScope>('auto')
  const [leagueName, setLeagueName] = useState('The Rivalry League')
  const [season, setSeason] = useState('01')
  const [defaultPurse, setDefaultPurse] = useState(20000)
  const [maxSquadSize, setMaxSquadSize] = useState(11)

  // Auctioneer Master Auth State
  const [isAuctioneer, setIsAuctioneer] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authError, setAuthError] = useState('')
  const [ownerTeamId, setOwnerTeamId] = useState<string | null>(null)

  // Modal Visibility State
  const [setupOpen, setSetupOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [playerModalOpen, setPlayerModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [budgetModalTeam, setBudgetModalTeam] = useState<Team | null>(null)
  const [addMatchModalOpen, setAddMatchModalOpen] = useState(false)
  const [tossModalMatch, setTossModalMatch] = useState<Match | null>(null)
  const [resultModalMatch, setResultModalMatch] = useState<Match | null>(null)
  const [ownerLoginTeam, setOwnerLoginTeam] = useState<Team | null>(null)
  const [directSellPlayer, setDirectSellPlayer] = useState<Player | null>(null)
  const [directSellModalOpen, setDirectSellModalOpen] = useState(false)

  // Live Hammer Desk State
  const [awardTeam, setAwardTeam] = useState<string>('')
  const [awardPrice, setAwardPrice] = useState<number>(500)

  const ownerTeam = teams.find(t => t.id === ownerTeamId) || null

  // Next sequential player number calculation
  const nextPlayerNumber = useMemo(() => {
    return players.reduce((max, p) => Math.max(max, p.number || 0), 0) + 1
  }, [players])

  const toastTimer = useRef<number | undefined>(undefined)
  const lastSync = useRef('')
  const lastAuctionSync = useRef('')

  const notify = (msg: string) => {
    setToast(msg)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(''), 3200)
  }

  // Load and synchronize state from backend
  const loadAuction = useCallback(async () => {
    try {
      const { spin, ...auctionData } = await apiAuction.getState()
      if (!auctionData.success) return

      const incoming = spin ?? null
      setLiveSpin(prev => (prev?.id === incoming?.id ? prev : incoming))

      // Skip re-render (and clobbering of in-progress inputs) when nothing changed
      const signature = JSON.stringify(auctionData)
      if (signature === lastAuctionSync.current) return
      lastAuctionSync.current = signature

      setPlayers(auctionData.players || [])
      setTeams(auctionData.teams || [])
      setCurrent(auctionData.current || null)
      setBid(auctionData.auctionState?.currentBid || 0)
      setLeader(auctionData.leader || null)
      if (auctionData.current) {
        setAwardPrice(auctionData.auctionState?.currentBid || auctionData.current.base || 500)
      }
    } catch (e) {
      console.error('Failed to sync the auction:', e)
    }
  }, [])

  const loadState = useCallback(async () => {
    try {
      const [, matchData, leagueData] = await Promise.all([
        loadAuction(),
        apiMatches.getAll(),
        apiLeague.getSettings()
      ])

      const signature = JSON.stringify([matchData, leagueData])
      if (signature === lastSync.current) return
      lastSync.current = signature

      if (matchData.success) {
        setMatches(matchData.matches || [])
      }

      if (leagueData.success && leagueData.league) {
        setLeagueName(leagueData.league.name)
        setSeason(leagueData.league.season)
        setDefaultPurse(leagueData.league.defaultPurse || 20000)
        setMaxSquadSize(leagueData.league.maxSquadSize || 11)
      }
    } catch (e) {
      console.error('Failed to sync backend state:', e)
    }
  }, [loadAuction])

  useEffect(() => {
    loadState()
  }, [loadState])

  useEffect(() => {
    if (current) {
      setAwardPrice(bid || current.base || 500)
      if (leader) {
        setAwardTeam(leader.name)
      } else if (teams.length > 0 && !awardTeam) {
        setAwardTeam(teams[0].name)
      }
    } else {
      setAwardPrice(500)
    }
  }, [current, bid, leader, teams, awardTeam])

  const anyModalOpen =
    authModalOpen || setupOpen || teamModalOpen || playerModalOpen || bulkModalOpen ||
    addMatchModalOpen || directSellModalOpen || !!budgetModalTeam || !!tossModalMatch || !!resultModalMatch || !!ownerLoginTeam

  // Live auto-sync so a second screen (projector / spectators) follows the auction
  const watchingAuction = page === 'auction' && !isAuctioneer
  const auctionSyncMs = liveSpin ? 700 : current ? 2000 : watchingAuction ? 1500 : 4000 // catches a spin as it starts

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden && !anyModalOpen && !isSpinning) loadAuction()
    }, auctionSyncMs)
    return () => window.clearInterval(id)
  }, [loadAuction, anyModalOpen, isSpinning, auctionSyncMs])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden && !anyModalOpen && !isSpinning) loadState()
    }, 6000)
    return () => window.clearInterval(id)
  }, [loadState, anyModalOpen, isSpinning])

  // Auctioneer Gatekeeper Check
  const guardAuctioneer = (action: () => void) => {
    if (!isAuctioneer) {
      setAuthModalOpen(true)
      notify('Superadmin sign-in required')
      return
    }
    action()
  }

  // Restore a still-valid session on load; fall back to spectator when it expires
  useEffect(() => {
    if (getAuthToken()) setIsAuctioneer(true)
    setOwnerTeamId(getOwnerTeamId())
    const onExpired = () => {
      setIsAuctioneer(!!getAuthToken())
      setOwnerTeamId(getOwnerTeamId())
      setToast('Session expired - please sign in again')
    }
    window.addEventListener('trl-auth-expired', onExpired)
    return () => window.removeEventListener('trl-auth-expired', onExpired)
  }, [])

  const handleSetAuctioneer = (value: boolean) => {
    if (!value) setAuthToken(null)
    setIsAuctioneer(value)
  }

  const handleVerifyPin = async (pin: string) => {
    setAuthError('')
    try {
      const res = await apiAuth.verifyPin(pin)
      if (res.success && res.token) {
        setAuthToken(res.token)
        setIsAuctioneer(true)
        setAuthModalOpen(false)
        notify(res.defaultPin ? 'Unlocked - change the default password in Settings!' : 'Signed in as superadmin')
      } else {
        setAuthError(res.message || 'Wrong password')
      }
    } catch {
      setAuthError('Could not reach the server')
    }
  }

  const handleOwnerLogin = async (loginId: string, pin: string) => {
    setAuthError('')
    try {
      const res = await apiOwner.login(loginId, pin)
      if (res.success && res.token) {
        setOwnerToken(res.token)
        setOwnerTeamId(res.teamId || null)
        setAuthModalOpen(false)
        setPage('auction')
        notify('Signed in as team owner')
      } else {
        setAuthError(res.message || 'Wrong login ID or password')
      }
    } catch {
      setAuthError('Could not sign in')
    }
  }

  const handleOwnerLogout = () => {
    setOwnerToken(null)
    setOwnerTeamId(null)
    notify('Signed out')
  }

  const handleOwnerBid = async (increment: number) => {
    try {
      const data = await apiOwner.bid(increment)
      if (data.success) sounds.playHammer()
      notify(data.message)
    } catch {
      notify('Failed to place bid')
    } finally {
      loadState()
    }
  }

  const handleUploadLogo = async (logo: string) => {
    if (!ownerTeamId) return
    try {
      const data = await apiOwner.uploadLogo(ownerTeamId, logo)
      notify(data.message)
    } catch {
      notify('Failed to upload logo')
    } finally {
      loadState()
    }
  }

  const handleRemoveLogo = async () => {
    if (!ownerTeamId) return
    try {
      const data = await apiOwner.removeLogo(ownerTeamId)
      notify(data.message)
    } catch {
      notify('Failed to remove logo')
    } finally {
      loadState()
    }
  }

  const handleSaveOwnerLogin = async (teamId: string, details: OwnerDetails): Promise<string | null> => {
    try {
      const data = await apiOwner.setLogin(teamId, details)
      if (!data.success) return data.message || 'Could not save the owner'
      setAwardTeam('') // the selected team may just have been renamed
      loadState()
      return null
    } catch {
      return 'Could not save the owner'
    }
  }

  const handleChangePin = async (currentPin: string, newPin: string): Promise<string | null> => {
    try {
      const res = await apiAuth.changePin(currentPin, newPin)
      if (!res.success) return res.message || 'Could not change the password'
      notify('Superadmin password changed')
      return null
    } catch {
      return 'Could not reach the server'
    }
  }

  // Sound Control
  const handleToggleSound = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    sounds.setMuted(nextMuted)
  }

  // League Settings Operations
  const handleUpdateSeason = async (newSeason: string) => {
    guardAuctioneer(async () => {
      setSeason(newSeason)
      try {
        const res = await apiLeague.updateSettings({ season: newSeason })
        notify(res.success ? `Active tournament set to Season ${newSeason}` : res.message || 'Could not update season')
      } catch {
        notify('Failed to update season')
      } finally {
        loadState()
      }
    })
  }

  const handleUpdateSquadLimit = async (newLimit: number) => {
    guardAuctioneer(async () => {
      setMaxSquadSize(newLimit)
      try {
        const res = await apiLeague.updateSettings({ maxSquadSize: newLimit })
        notify(res.success ? `Squad capacity set to ${newLimit} players/team` : res.message || 'Could not update squad limit')
      } catch {
        notify('Failed to update squad limit')
      } finally {
        loadState()
      }
    })
  }

  const handleSaveLeagueSettings = async (settings: {
    name: string
    season: string
    defaultPurse: number
    maxSquadSize: number
  }) => {
    guardAuctioneer(async () => {
      try {
        const res = await apiLeague.updateSettings(settings)
        if (res.success) {
          notify('League settings saved')
          setSetupOpen(false)
        } else {
          notify(res.message || 'Could not save settings')
        }
      } catch {
        notify('Failed to save settings')
      } finally {
        loadState()
      }
    })
  }

  const handleReopenAllUnsold = async () => {
    guardAuctioneer(async () => {
      try {
        const data = await apiAuction.reopenAllUnsold()
        if (data.success) {
          sounds.playCheer()
          notify(data.message)
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to restore unsold players')
      } finally {
        loadState()
      }
    })
  }

  // Auction Room Operations
  const handleSpin = () => {
    guardAuctioneer(async () => {
      if (isSpinning || current) return
      setIsSpinning(true)
      sounds.playSpinnerTick()
      setCurrent(null)
      setLeader(null)
      setBid(0)

      const finish = () => {
        setDrawnPlayerId(null)
        setIsSpinning(false)
        loadState()
      }

      try {
        // The server picks first, so the wheel can land on the player it really drew
        const data = await apiAuction.spin(wheelScope)
        if (!data.success) {
          notify(data.message)
          finish()
          return
        }
        setDrawnPlayerId(data.player.id)
        window.setTimeout(() => {
          setCurrent(data.player)
          const initialBase = data.player.base || 500
          setBid(initialBase)
          setAwardPrice(initialBase)
          if (teams.length > 0) setAwardTeam(teams[0].name)
          sounds.playHammer()
          notify(
            data.isUnsoldRound
              ? `[RE-AUCTION ROUND] Unsold Player #${data.player.number} (${data.player.name}) drawn on the block!`
              : `Player #${data.player.number} (${data.player.name}) drawn on the block!`
          )
          finish()
        }, WHEEL_SPIN_MS + WHEEL_REVEAL_PAUSE_MS)
      } catch {
        notify('Failed to draw from wheel')
        finish()
      }
    })
  }

  const handleNominate = (playerId: number) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiAuction.nominate(playerId)
        if (data.success) {
          setCurrent(data.player)
          const initialBase = data.player.base || 500
          setBid(initialBase)
          setAwardPrice(initialBase)
          if (teams.length > 0) setAwardTeam(teams[0].name)
          sounds.playHammer()
          notify(`Player #${data.player.number} (${data.player.name}) on the block at ₹${initialBase}`)
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to nominate player')
      } finally {
        loadState()
      }
    })
  }

  const handleBid = (team: Team, customIncrement?: number) => {
    guardAuctioneer(async () => {
      if (!current) return
      if (team.players >= maxSquadSize) {
        notify(`${team.name} has already reached the maximum squad limit (${maxSquadSize} players)`)
        return
      }

      let increment = customIncrement
      if (!increment) {
        if (bid < 1000) increment = 100
        else if (bid < 5000) increment = 250
        else if (bid < 20000) increment = 500
        else increment = 1000
      }

      const nextBid = bid + increment
      if (nextBid > team.purse) {
        notify(`${team.name} has insufficient purse (₹${team.purse.toLocaleString()} left)`)
        return
      }

      try {
        const data = await apiAuction.bid(team.name, nextBid)
        if (data.success) {
          setBid(nextBid)
          setLeader(team)
          setAwardPrice(nextBid)
          setAwardTeam(team.name)
          sounds.playHammer()
          notify(`₹${nextBid.toLocaleString()} bid for ${team.name}`)
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to place bid')
      } finally {
        loadState()
      }
    })
  }

  const handleAwardSell = () => {
    guardAuctioneer(async () => {
      if (!current) {
        notify('No active player in the spotlight')
        return
      }
      if (!awardTeam) {
        notify('Please select which team this player went into')
        return
      }

      const targetTeam = teams.find(t => t.name === awardTeam)
      if (targetTeam && targetTeam.players >= maxSquadSize) {
        notify(`${awardTeam} has already reached max squad size of ${maxSquadSize} players!`)
        return
      }

      try {
        const data = await apiAuction.sell(awardTeam, awardPrice, current.id, bid)
        if (data.success) {
          sounds.playCheer()
          notify(data.message)
          setCurrent(null)
          setLeader(null)
          setBid(0)
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to award player')
      } finally {
        loadState()
      }
    })
  }

  const handleDirectSell = async (playerId: number, teamName: string, price: number) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiAuction.sell(teamName, price, playerId)
        if (data.success) {
          sounds.playCheer()
          notify(data.message)
          setDirectSellModalOpen(false)
          setDirectSellPlayer(null)
          if (current?.id === playerId) {
            setCurrent(null)
            setBid(0)
            setLeader(null)
          }
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to sell player')
      } finally {
        loadState()
      }
    })
  }

  const handleOpenDirectSell = (p?: Player) => {
    guardAuctioneer(() => {
      setDirectSellPlayer(p || null)
      setDirectSellModalOpen(true)
    })
  }

  const handleMarkUnsold = () => {
    guardAuctioneer(async () => {
      if (!current) return
      try {
        const data = await apiAuction.unsold()
        if (data.success) {
          notify(data.message)
          setCurrent(null)
          setLeader(null)
          setBid(0)
        } else {
          notify(data.message || 'Could not mark unsold')
        }
      } catch {
        notify('Failed to mark unsold')
      } finally {
        loadState()
      }
    })
  }

  const handleResetAuction = () => {
    guardAuctioneer(async () => {
      if (!confirm('Are you sure you want to reset the auction? All team budgets and squad allocations will be restored.')) {
        return
      }
      try {
        const data = await apiAuction.reset()
        if (data.success) {
          notify(data.message)
          setCurrent(null)
          setLeader(null)
          setBid(0)
        } else {
          notify(data.message || 'Could not reset the auction')
        }
      } catch {
        notify('Failed to reset auction')
      } finally {
        loadState()
      }
    })
  }

  // Team Operations
  const handleAddTeam = async (t: {
    name: string
    short: string
    owner: string
    color: string
    purse: number
    tagline: string
  }) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiTeams.create(t)
        if (data.success) {
          notify(`Franchise "${t.name}" registered with ₹${t.purse.toLocaleString()} purse`)
          setTeamModalOpen(false)
          if (data.team) setOwnerLoginTeam(data.team) // new teams go straight to owner setup
        } else {
          notify(data.message || 'Error creating team')
        }
      } catch {
        notify('Error creating team')
      } finally {
        loadState()
      }
    })
  }

  const handleDeleteTeam = async (name: string) => {
    guardAuctioneer(async () => {
      if (!confirm(`Delete franchise "${name}"? Any players on this team will be returned to the pool.`)) {
        return
      }
      try {
        const data = await apiTeams.delete(name)
        notify(data.success ? `Franchise "${name}" deleted` : data.message || 'Could not delete team')
      } catch {
        notify('Failed to delete team')
      } finally {
        loadState()
      }
    })
  }

  const handleAdjustBudget = async (teamId: string, mode: 'set' | 'add' | 'subtract', amount: number) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiTeams.adjustBudget(teamId, mode, amount)
        if (data.success) {
          notify(data.message)
          setBudgetModalTeam(null)
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to update team budget')
      } finally {
        loadState()
      }
    })
  }

  // Player Operations (₹500 default base price & sequential numbers)
  const handleAddPlayer = async (p: {
    name: string
    base: number
    role?: string
  }) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiPlayers.create(p)
        if (data.success) {
          notify(`Player #${data.player?.number || nextPlayerNumber} "${p.name}" added with base price ₹${p.base || 500}`)
          setPlayerModalOpen(false)
        } else {
          notify(data.message || 'Could not add player')
        }
      } catch {
        notify('Error adding player')
      } finally {
        loadState()
      }
    })
  }

  const handleBulkImport = async (text: string) => {
    guardAuctioneer(async () => {
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      const list = lines.map(line => {
        const parts = line.split(',').map(s => s.trim())
        return {
          name: parts[0] || 'Player',
          base: Number(parts[1]) || 500,
          role: parts[2] || undefined
        }
      })
      try {
        const data = await apiPlayers.bulkImport(list)
        if (data.success) {
          notify(`Imported ${list.length} players`)
          setBulkModalOpen(false)
        } else {
          notify((data as { message?: string }).message || 'Could not import players')
        }
      } catch {
        notify('Failed to bulk import')
      } finally {
        loadState()
      }
    })
  }

  const handleDeletePlayer = async (id: number) => {
    guardAuctioneer(async () => {
      const target = players.find(p => p.id === id)
      if (!confirm(`Remove ${target?.name || 'this player'}? A sold player's price goes back to their team.`)) return
      try {
        const data = await apiPlayers.delete(id)
        notify(data.success ? 'Player removed' : data.message || 'Could not remove player')
      } catch {
        notify('Failed to delete player')
      } finally {
        loadState()
      }
    })
  }

  const handleReopenPlayer = async (id: number) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiPlayers.update(id, { status: 'Upcoming' })
        notify(data.success ? 'Player restored to upcoming pool' : data.message || 'Could not reopen player')
      } catch {
        notify('Failed to re-auction player')
      } finally {
        loadState()
      }
    })
  }

  // Schedule & Toss Operations
  const handleAddMatch = async (m: {
    teamA: string
    teamB: string
    date: string
    time?: string
    venue?: string
    stage?: string
  }) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiMatches.create(m)
        if (data.success) {
          notify(`Match fixture scheduled: ${m.teamA} vs ${m.teamB}`)
          setAddMatchModalOpen(false)
        } else {
          notify(data.message || 'Could not schedule match')
        }
      } catch {
        notify('Failed to schedule match')
      } finally {
        loadState()
      }
    })
  }

  const handleGenerateRoundRobin = async () => {
    guardAuctioneer(async () => {
      if (matches.length > 0 && !confirm(`Replace all ${matches.length} fixtures? Tosses and results entered so far will be lost.`)) {
        return
      }
      try {
        const data = await apiMatches.generateRoundRobin()
        if (data.success) {
          notify(data.message)
        } else {
          notify(data.message)
        }
      } catch {
        notify('Failed to generate tournament fixtures')
      } finally {
        loadState()
      }
    })
  }

  const handleDeleteMatch = async (id: string) => {
    guardAuctioneer(async () => {
      if (!confirm('Delete this match? Its toss and result will be lost.')) return
      try {
        const data = await apiMatches.delete(id)
        notify(data.success ? 'Match fixture removed' : data.message || 'Could not delete match')
      } catch {
        notify('Failed to delete fixture')
      } finally {
        loadState()
      }
    })
  }

  const handleRecordToss = async (matchId: string, tossWinner: string, tossDecision: 'Bat' | 'Bowl') => {
    guardAuctioneer(async () => {
      // A quick toss with no fixture has nothing to save
      if (matchId === 'temp_toss') {
        notify(`${tossWinner} won the toss and chose to ${tossDecision}`)
        setTossModalMatch(null)
        return
      }
      try {
        const data = await apiMatches.recordToss(matchId, tossWinner, tossDecision)
        if (data.success) {
          sounds.playCheer()
          notify(data.message)
          setTossModalMatch(null)
        } else {
          notify(data.message || 'Could not record toss')
        }
      } catch {
        notify('Failed to record toss')
      } finally {
        loadState()
      }
    })
  }

  const handleRecordResult = async (
    matchId: string,
    payload: Parameters<typeof apiMatches.recordResult>[1]
  ) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiMatches.recordResult(matchId, payload)
        if (data.success) {
          sounds.playCheer()
          notify(data.message)
          setResultModalMatch(null)
        } else {
          notify(data.message || 'Could not save result')
        }
      } catch {
        notify('Failed to save result')
      } finally {
        loadState()
      }
    })
  }

  const handleQuickToss = () => {
    guardAuctioneer(() => {
      const nextMatch = matches.find(m => m.status !== 'Completed')
      if (nextMatch) {
        setTossModalMatch(nextMatch)
      } else if (teams.length >= 2) {
        setTossModalMatch({
          id: 'temp_toss',
          matchNumber: 1,
          stage: 'Exhibition Match',
          teamA: teams[0].name,
          teamB: teams[1].name,
          date: new Date().toISOString().split('T')[0],
          time: '18:00 IST',
          venue: 'Premier Arena',
          status: 'Scheduled'
        })
      } else {
        notify('Register at least 2 teams to run a coin toss!')
      }
    })
  }

  // Keyboard shortcuts on the Auction page: S spin, 1-9 bid for team N, Enter sell, U unsold
  useEffect(() => {
    if (page !== 'auction' || anyModalOpen || !isAuctioneer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const el = e.target as HTMLElement | null
      if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'enter' && el?.tagName === 'BUTTON') return // Enter on a focused button presses that button
      if (k === 's') { if (!current) handleSpin() }
      else if (k === 'u') handleMarkUnsold()
      else if (k === 'enter') handleAwardSell()
      else if (/^[1-9]$/.test(k) && teams[Number(k) - 1]) handleBid(teams[Number(k) - 1])
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="app-shell">
      <Topbar
        page={page}
        setPage={setPage}
        leagueName={leagueName}
        season={season}
        onUpdateSeason={handleUpdateSeason}
        maxSquadSize={maxSquadSize}
        onUpdateSquadLimit={handleUpdateSquadLimit}
        isAuctioneer={isAuctioneer}
        setIsAuctioneer={handleSetAuctioneer}
        ownerTeamName={ownerTeam?.name || null}
        onOwnerLogout={handleOwnerLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => guardAuctioneer(() => setSetupOpen(true))}
      />

      <main className="page-wrap">
        {page === 'home' && (
          <HomeView
            season={season}
            teamsCount={teams.length}
            playersCount={players.length}
            matchesCount={matches.length}
            maxSquadSize={maxSquadSize}
            defaultPurse={defaultPurse}
            onStart={() => setPage('auction')}
            onManageTeams={() => setPage('teams')}
            onManageSchedule={() => setPage('schedule')}
            onQuickToss={handleQuickToss}
          />
        )}

        {page === 'auction' && !isAuctioneer && (
          <SpectatorView
            players={players}
            teams={teams}
            current={current}
            bid={bid}
            leader={leader}
            liveSpin={liveSpin}
            maxSquadSize={maxSquadSize}
            ownerTeam={ownerTeam}
            onOwnerBid={handleOwnerBid}
            onUnlock={() => setAuthModalOpen(true)}
          />
        )}

        {page === 'auction' && isAuctioneer && (
          <AuctionView
            players={players}
            teams={teams}
            current={current}
            bid={bid}
            leader={leader}
            spinning={isSpinning}
            drawnPlayerId={drawnPlayerId}
            wheelScope={wheelScope}
            setWheelScope={setWheelScope}
            awardTeam={awardTeam}
            setAwardTeam={setAwardTeam}
            awardPrice={awardPrice}
            setAwardPrice={setAwardPrice}
            maxSquadSize={maxSquadSize}
            spin={handleSpin}
            nominate={handleNominate}
            makeBid={handleBid}
            awardSell={handleAwardSell}
            unsold={handleMarkUnsold}
            onAddPlayer={() => guardAuctioneer(() => setPlayerModalOpen(true))}
            onAddTeam={() => guardAuctioneer(() => setTeamModalOpen(true))}
            onAdjustBudget={t => guardAuctioneer(() => setBudgetModalTeam(t))}
            onDirectSell={handleOpenDirectSell}
            onReopenAllUnsold={handleReopenAllUnsold}
          />
        )}

        {page === 'teams' && (
          <TeamsView
            teams={teams}
            players={players}
            maxSquadSize={maxSquadSize}
            isAuctioneer={isAuctioneer}
            ownerTeamId={ownerTeamId}
            onAddTeam={() => guardAuctioneer(() => setTeamModalOpen(true))}
            onDeleteTeam={handleDeleteTeam}
            onAdjustBudget={t => guardAuctioneer(() => setBudgetModalTeam(t))}
            onOwnerLogin={t => guardAuctioneer(() => setOwnerLoginTeam(t))}
            onUploadLogo={handleUploadLogo}
            onRemoveLogo={handleRemoveLogo}
            notify={notify}
          />
        )}

        {page === 'players' && (
          <PlayersView
            players={players}
            search={search}
            setSearch={setSearch}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            isAuctioneer={isAuctioneer}
            maxSquadSize={maxSquadSize}
            defaultPurse={defaultPurse}
            onOpenAuction={() => setPage('auction')}
            onAddPlayer={() => guardAuctioneer(() => setPlayerModalOpen(true))}
            onBulkImport={() => guardAuctioneer(() => setBulkModalOpen(true))}
            onDeletePlayer={handleDeletePlayer}
            onReopenPlayer={handleReopenPlayer}
            onDirectSell={handleOpenDirectSell}
            onNominate={id => {
              handleNominate(id)
              setPage('auction')
            }}
          />
        )}

        {['schedule', 'standings', 'results'].includes(page) && (
          <div className="segmented">
            {[
              { id: 'schedule', label: 'Fixtures' },
              { id: 'standings', label: 'Leaderboard' },
              { id: 'results', label: 'Auction Results' }
            ].map(tab => (
              <button key={tab.id} className={page === tab.id ? 'active' : ''} onClick={() => setPage(tab.id)}>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {page === 'schedule' && (
          <ScheduleView
            matches={matches}
            teams={teams}
            filter={scheduleFilter}
            setFilter={setScheduleFilter}
            isAuctioneer={isAuctioneer}
            onAddMatch={() => guardAuctioneer(() => setAddMatchModalOpen(true))}
            onGenerateRoundRobin={handleGenerateRoundRobin}
            onDeleteMatch={handleDeleteMatch}
            onOpenToss={m => guardAuctioneer(() => setTossModalMatch(m))}
            onOpenResult={m => guardAuctioneer(() => setResultModalMatch(m))}
            onQuickToss={handleQuickToss}
          />
        )}

        {page === 'standings' && <StandingsView teams={teams} matches={matches} />}

        {page === 'results' && (
          <ResultsView
            players={players}
            teams={teams}
            maxSquadSize={maxSquadSize}
            isAuctioneer={isAuctioneer}
            onReset={handleResetAuction}
          />
        )}
      </main>

      {/* --- ALL MODALS --- */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onVerify={handleVerifyPin}
          onOwnerLogin={handleOwnerLogin}
          error={authError}
        />
      )}

      {directSellModalOpen && (
        <DirectSellModal
          players={players}
          teams={teams}
          maxSquadSize={maxSquadSize}
          initialPlayer={directSellPlayer}
          onClose={() => {
            setDirectSellModalOpen(false)
            setDirectSellPlayer(null)
          }}
          onSell={handleDirectSell}
        />
      )}

      {playerModalOpen && (
        <AddPlayerModal
          onClose={() => setPlayerModalOpen(false)}
          onAdd={handleAddPlayer}
          nextNumber={nextPlayerNumber}
        />
      )}

      {bulkModalOpen && (
        <BulkImportModal
          onClose={() => setBulkModalOpen(false)}
          onImport={handleBulkImport}
          nextNumber={nextPlayerNumber}
        />
      )}

      {teamModalOpen && (
        <AddTeamModal
          defaultPurse={defaultPurse}
          onClose={() => setTeamModalOpen(false)}
          onAdd={handleAddTeam}
        />
      )}

      {budgetModalTeam && (
        <AdjustBudgetModal
          team={budgetModalTeam}
          onClose={() => setBudgetModalTeam(null)}
          onAdjust={handleAdjustBudget}
        />
      )}

      {addMatchModalOpen && (
        <AddMatchModal
          teams={teams}
          onClose={() => setAddMatchModalOpen(false)}
          onAdd={handleAddMatch}
        />
      )}

      {tossModalMatch && (
        <TossModal
          match={tossModalMatch}
          onClose={() => setTossModalMatch(null)}
          onRecordToss={handleRecordToss}
        />
      )}

      {resultModalMatch && (
        <ResultModal
          match={resultModalMatch}
          onClose={() => setResultModalMatch(null)}
          onSave={handleRecordResult}
        />
      )}

      {ownerLoginTeam && (
        <OwnerLoginModal
          team={ownerLoginTeam}
          onClose={() => setOwnerLoginTeam(null)}
          onSave={handleSaveOwnerLogin}
        />
      )}

      {setupOpen && (
        <SetupModal
          leagueName={leagueName}
          season={season}
          defaultPurse={defaultPurse}
          maxSquadSize={maxSquadSize}
          onClose={() => setSetupOpen(false)}
          onSave={handleSaveLeagueSettings}
          onChangePin={handleChangePin}
        />
      )}

      <Toast message={toast} />
    </div>
  )
}
