'use client'

import Image from 'next/image'
import React, {useState} from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input onChange={(e) => setQuery(e.target.value)} value={query} onKeyDown={(e) => {
        if (e.key === 'Enter') {
          fetch('http://server:8000/search?query='+query)
          .then ((result) => console.log(result))
        }
      }}/>
    </main>
  )
}
