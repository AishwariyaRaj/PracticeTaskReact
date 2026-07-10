import React from 'react'

export default function Logo({ size = 24, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <defs>
        <linearGradient id="logo-block-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00c6ff" />
          <stop offset="100%" stopColor="#0072ff" />
        </linearGradient>
      </defs>
      {/* Top Left Square */}
      <rect x="0" y="0" width="10" height="10" fill="url(#logo-block-gradient)" rx="1.5" />
      {/* Middle Right Square */}
      <rect x="10" y="10" width="10" height="10" fill="url(#logo-block-gradient)" rx="1.5" />
      {/* Bottom Left Square */}
      <rect x="0" y="20" width="10" height="10" fill="url(#logo-block-gradient)" rx="1.5" />
    </svg>
  )
}
