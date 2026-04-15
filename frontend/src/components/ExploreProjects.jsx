import React, { useEffect, useState } from 'react'
import { getRifReadOnlyContract } from '../utils/rifContractRead'
import ProjectDetailModal from './ProjectDetailModal'
import '../styles/ExploreProjects.scss'

const ExploreProjects = ({ onClose }) => {
  const [allProjects, setAllProjects] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const contract = await getRifReadOnlyContract(window.ethereum)
        if (!contract) {
          setError('Kunde inte ansluta till kontraktet. Kontrollera att du är på Ethereum Sepolia.')
          return
        }
        const raw = await contract.getAllProjects()
        const list = raw
          .filter((p) => p.exists)
          .map((p) => ({
            id: p.id.toString(),
            owner: p.owner,
            title: p.title,
            description: p.description,
            createdAt: p.createdAt,
          }))
          .sort((a, b) => Number(b.id) - Number(a.id))
        setAllProjects(list)
      } catch (e) {
        setError(e.message || 'Kunde inte hämta projekt.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = allProjects.filter((p) => {
    const q = query.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.owner.toLowerCase().includes(q)
    )
  })

  return (
    <div className="explore-overlay" onClick={onClose}>
      <div className="explore-modal" onClick={(e) => e.stopPropagation()}>
        <div className="explore-modal__header">
          <h2>Utforska alla projekt</h2>
          <button type="button" className="explore-modal__close" onClick={onClose} aria-label="Stäng">
            ✕
          </button>
        </div>

        <input
          className="explore-modal__search"
          type="text"
          placeholder="Sök på titel, beskrivning eller wallet-adress…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />

        <div className="explore-modal__results">
          {loading && <p className="explore-modal__status">Hämtar alla projekt…</p>}
          {!loading && error && <p className="explore-modal__error">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="explore-modal__status">
              {query ? 'Inga projekt matchade din sökning.' : 'Inga projekt skapade än.'}
            </p>
          )}
          {!loading &&
            !error &&
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                className="explore-modal__project-btn"
                onClick={() => setSelected(p)}
              >
                <span className="explore-modal__project-title">
                  {p.title?.trim() ? p.title : `Project #${p.id}`}
                </span>
                <span className="explore-modal__project-owner">
                  {p.owner.slice(0, 6)}…{p.owner.slice(-4)}
                </span>
              </button>
            ))}
        </div>

        {!loading && !error && (
          <p className="explore-modal__count">
            {filtered.length} av {allProjects.length} projekt visas
          </p>
        )}
      </div>

      {selected && (
        <ProjectDetailModal
          project={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export default ExploreProjects
