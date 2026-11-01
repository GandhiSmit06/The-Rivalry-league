'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import type { Player, Team, Match } from '@/lib/server/db'
import {
  apiAuth,
  apiLeague,
  apiTeams,
  apiPlayers,
  apiAuction,
  apiMatches
} from '@/lib/client/api'
import { sounds } from '@/lib/client/sound'

// Layout & Common Components
import { Topbar } from '@/components/layout/Topbar'
import { Toast } from '@/components/common/Toast'
import { CricketAnimatedBackground } from '@/components/layout/CricketAnimatedBackground'

// Views
import { HomeView } from '@/components/views/HomeView'
import { AuctionView } from '@/components/views/AuctionView'
import { TeamsView } from '@/components/views/TeamsView'
import { PlayersView } from '@/components/views/PlayersView'
import { ScheduleView } from '@/components/views/ScheduleView'
import { ResultsView } from '@/components/views/ResultsView'

// Modals
import { AuthModal } from '@/components/modals/AuthModal'
import { DirectSellModal } from '@/components/modals/DirectSellModal'
import { AddPlayerModal } from '@/components/modals/AddPlayerModal'
import { BulkImportModal } from '@/components/modals/BulkImportModal'
import { AddTeamModal } from '@/components/modals/AddTeamModal'
import { AdjustBudgetModal } from '@/components/modals/AdjustBudgetModal'
import { AddMatchModal } from '@/components/modals/AddMatchModal'
import { TossModal } from '@/components/modals/TossModal'
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
  const [isMuted, setIsMuted] = useState(false)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [scheduleFilter, setScheduleFilter] = useState('ALL')

  // League Metadata State
  const [leagueName, setLeagueName] = useState('Sunday Premier Auction')
  const [season, setSeason] = useState('01')
  const [defaultPurse, setDefaultPurse] = useState(20000)
  const [maxSquadSize, setMaxSquadSize] = useState(11)

  // Auctioneer Master Auth State
  const [isAuctioneer, setIsAuctioneer] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authError, setAuthError] = useState('')

  // Modal Visibility State
  const [setupOpen, setSetupOpen] = useState(false)
  const [teamModalOpen, setTeamModalOpen] = useState(false)
  const [playerModalOpen, setPlayerModalOpen] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [budgetModalTeam, setBudgetModalTeam] = useState<Team | null>(null)
  const [addMatchModalOpen, setAddMatchModalOpen] = useState(false)
  const [tossModalMatch, setTossModalMatch] = useState<Match | null>(null)
  const [directSellPlayer, setDirectSellPlayer] = useState<Player | null>(null)
  const [directSellModalOpen, setDirectSellModalOpen] = useState(false)

  // Live Hammer Desk State
  const [awardTeam, setAwardTeam] = useState<string>('')
  const [awardPrice, setAwardPrice] = useState<number>(500)

  // Next sequential player number calculation
  const nextPlayerNumber = useMemo(() => {
    return players.reduce((max, p) => Math.max(max, p.number || 0), 0) + 1
  }, [players])

  const notify = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2800)
  }

  // Load and synchronize state from backend
  const loadState = useCallback(async () => {
    try {
      const [auctionData, matchData, leagueData] = await Promise.all([
        apiAuction.getState(),
        apiMatches.getAll(),
        apiLeague.getSettings()
      ])

      if (auctionData.success) {
        setPlayers(auctionData.players || [])
        setTeams(auctionData.teams || [])
        setCurrent(auctionData.current || null)
        setBid(auctionData.auctionState?.currentBid || 0)
        setLeader(auctionData.leader || null)
        if (auctionData.current) {
          setAwardPrice(auctionData.auctionState?.currentBid || auctionData.current.base || 500)
        }
      }

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
  }, [])

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

  // Auctioneer Gatekeeper Check
  const guardAuctioneer = (action: () => void) => {
    if (!isAuctioneer) {
      setAuthModalOpen(true)
      notify('Auctioneer authorization required')
      return
    }
    action()
  }

  const handleVerifyPin = async (pin: string) => {
    setAuthError('')
    try {
      const res = await apiAuth.verifyPin(pin)
      if (res.success) {
        setIsAuctioneer(true)
        setAuthModalOpen(false)
        notify('Auctioneer mode unlocked')
      } else {
        setAuthError(res.message || 'Incorrect PIN')
      }
    } catch {
      setAuthError('Error verifying PIN')
    }
  }

  const handleChangePin = async (currentPin: string, newPin: string): Promise<boolean> => {
    try {
      const res = await apiAuth.changePin(currentPin, newPin)
      if (res.success) {
        notify('PIN changed successfully')
        return true
      }
      return false
    } catch {
      return false
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
        if (res.success) {
          notify(`Active tournament set to Season ${newSeason}`)
        }
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
        if (res.success) {
          notify(`Squad capacity set to ${newLimit} players/team`)
        }
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
      const upcoming = players.filter(p => p.status === 'Upcoming')
      const unsold = players.filter(p => p.status === 'Unsold')
      if (isSpinning || (!upcoming.length && !unsold.length)) return
      setIsSpinning(true)
      sounds.playSpinnerTick()
      setCurrent(null)
      setLeader(null)
      setBid(0)

      window.setTimeout(async () => {
        try {
          const data = await apiAuction.spin()
          if (data.success) {
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
          } else {
            notify(data.message)
          }
        } catch {
          notify('Failed to draw from wheel')
        } finally {
          setIsSpinning(false)
          loadState()
        }
      }, 1800)
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
        const data = await apiAuction.sell(awardTeam, awardPrice, current.id)
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
        if (data.success) {
          notify(`Franchise "${name}" deleted`)
        }
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
  }) => {
    guardAuctioneer(async () => {
      try {
        const data = await apiPlayers.create(p)
        if (data.success) {
          notify(`Player #${data.player?.number || nextPlayerNumber} "${p.name}" added with base price ₹${p.base || 500}`)
          setPlayerModalOpen(false)
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
          base: Number(parts[1]) || 500
        }
      })
      try {
        const data = await apiPlayers.bulkImport(list)
        if (data.success) {
          notify(`Imported ${list.length} players with base price ₹500`)
          setBulkModalOpen(false)
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
      try {
        const data = await apiPlayers.delete(id)
        if (data.success) {
          notify('Player removed')
        }
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
        if (data.success) {
          notify('Player restored to upcoming pool')
        }
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
      try {
        const data = await apiMatches.delete(id)
        if (data.success) {
          notify('Match fixture removed')
        }
      } catch {
        notify('Failed to delete fixture')
      } finally {
        loadState()
      }
    })
  }

  const handleRecordToss = async (matchId: string, tossWinner: string, tossDecision: 'Bat' | 'Bowl') => {
    guardAuctioneer(async () => {
      try {
        const data = await apiMatches.recordToss(matchId, tossWinner, tossDecision)
        if (data.success) {
          sounds.playCheer()
          notify(data.message)
          setTossModalMatch(null)
        }
      } catch {
        notify('Failed to record toss')
      } finally {
        loadState()
      }
    })
  }

  const handleQuickToss = () => {
    guardAuctioneer(() => {
      if (matches.length > 0) {
        setTossModalMatch(matches[0])
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

  return (
    <div className="app-shell">
      <CricketAnimatedBackground />
      <Topbar
        page={page}
        setPage={setPage}
        leagueName={leagueName}
        season={season}
        onUpdateSeason={handleUpdateSeason}
        maxSquadSize={maxSquadSize}
        onUpdateSquadLimit={handleUpdateSquadLimit}
        isAuctioneer={isAuctioneer}
        setIsAuctioneer={setIsAuctioneer}
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
          />
        )}

        {page === 'auction' && (
          <AuctionView
            players={players}
            teams={teams}
            current={current}
            bid={bid}
            leader={leader}
            spinning={isSpinning}
            awardTeam={awardTeam}
            setAwardTeam={setAwardTeam}
            awardPrice={awardPrice}
            setAwardPrice={setAwardPrice}
            maxSquadSize={maxSquadSize}
            isAuctioneer={isAuctioneer}
            spin={handleSpin}
            nominate={handleNominate}
            makeBid={handleBid}
            awardSell={handleAwardSell}
            unsold={handleMarkUnsold}
            onBack={() => setPage('home')}
            onAddPlayer={() => guardAuctioneer(() => setPlayerModalOpen(true))}
            onAddTeam={() => guardAuctioneer(() => setTeamModalOpen(true))}
            onAdjustBudget={t => guardAuctioneer(() => setBudgetModalTeam(t))}
            onUpdateSquadLimit={handleUpdateSquadLimit}
            onUnlock={() => setAuthModalOpen(true)}
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
            onAddTeam={() => guardAuctioneer(() => setTeamModalOpen(true))}
            onDeleteTeam={handleDeleteTeam}
            onAdjustBudget={t => guardAuctioneer(() => setBudgetModalTeam(t))}
            onUpdateSquadLimit={handleUpdateSquadLimit}
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
            onQuickToss={handleQuickToss}
          />
        )}

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
