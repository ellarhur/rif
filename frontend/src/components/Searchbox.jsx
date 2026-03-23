import React from 'react'

const Searchbox = ({ titles = [] }) => {
  const [query, setQuery] = React.useState('')

  const filteredTitles = titles.filter((title) =>
    title.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="searchbox-card">
      <h2>Search for a song to see if it&apos;s creatively proofed...</h2>
      <input
        type="text"
        placeholder="Song title"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {query && (
        <ul className="search-results">
          {filteredTitles.length > 0 ? (
            filteredTitles.map((title) => <li key={title}>{title}</li>)
          ) : (
            <li>No title found yet.</li>
          )}
        </ul>
      )}
    </div>
  )
}

export default Searchbox
