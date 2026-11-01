'use client'

import React from 'react'

export function FeatureCard({
  icon,
  num,
  title,
  text
}: {
  icon: React.ReactNode
  num: string
  title: string
  text: string
}) {
  return (
    <div className="feature">
      <div className="feature-top">
        <span className="feature-icon">{icon}</span>
        <span>{num}</span>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

