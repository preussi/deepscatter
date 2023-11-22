'use client'
import React, {useState} from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <input onChange={(e) => setQuery(e.target.value)} value={query} onKeyDown={(e) => {
        if (e.key === 'Enter') {
          fetch('http://ee-tik-vm054.ethz.ch:8000/search?query='+query)
          .then ((result) => console.log(result))
        }
      }}/>
    </main>
  )
}
