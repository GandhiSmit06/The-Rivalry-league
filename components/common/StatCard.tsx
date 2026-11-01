'use client'

import React from 'react'

export function StatCard({
  icon,
  label,
  value,
  color = 'gold'
}: {
  icon: React.ReactNode
  label: string
  value: string
  color?: string
}) {
  return (
    <div className={`stat-card ${color}`}>
      <span>{icon}</span>
      <small>{label}</small>
      <b>{value}</b>
    </div>
  )
}

