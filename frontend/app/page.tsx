'use client'
import React, {useState} from 'react'


export default function Home() {
  const [query, setQuery] = useState('')
  const [urls, setUrls] = useState([])
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div style={{border: '2px solid black', outline: '10px solid white'}}>
        <input onChange={(e) => setQuery(e.target.value)} value={query} onKeyDown={(e) => {
          if (e.key === 'Enter') {
            fetch('http://ee-tik-vm054.ethz.ch:8000/search?query='+query)
            .then((result) => result.json())
            .then(setUrls)
            }
        }}/>
      </div>
      {urls.map(url => <iframe src={`https://www.youtube.com/embed/${(new URL(url)).searchParams.get("v")}`}/>)}

      
    </main>



  )
}
