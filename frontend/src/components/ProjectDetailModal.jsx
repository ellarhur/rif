import React, { useEffect, useState } from 'react'
import { getRifReadOnlyContract } from '../utils/rifContractRead'

const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

function formatTs(ts) {
  try {
    const n = typeof ts === 'bigint' ? Number(ts) : Number(ts)
    if (!Number.isFinite(n) || n <= 0) return '—'
    return new Date(n * 1000).toLocaleString()
  } catch {
    return '—'
  }
}
async function fetchSoundbiteMetadata(metadataCid) {
  try {
    const res = await fetch(`${IPFS_GATEWAY}/${metadataCid}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function SoundbitePlayer({ soundbite }) {
  const [meta, setMeta] = useState(null)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!soundbite.ipfsCid) {
      return
    }
    fetchSoundbiteMetadata(soundbite.ipfsCid).then((data) => {
      setMeta(data)
      setFetching(false)
    })
  }, [soundbite.ipfsCid])

  const isAudio = meta?.file?.type?.startsWith('audio/')
  const audioUrl = isAudio ? `${IPFS_GATEWAY}/${meta.file.cid}` : null

  return (
    <div className="projectdetail-soundbite-entry">
      <span className="projectdetail-soundbite-date">
        {formatTs(soundbite.timestamp)}
      </span>
      <div className="projectdetail-soundbite-item">
        <strong>{soundbite.id}</strong>
        {soundbite.description ? `.  ${soundbite.description}` : ''}

        {fetching && (
          <p className="projectdetail-muted projectdetail-loading">Laddar fil…</p>
        )}

        {!fetching && audioUrl && (
          <div className="projectdetail-audioplayer">
            <audio controls src={audioUrl} preload="metadata">
              Din webbläsare stöder inte audio-uppspelning.
            </audio>
          </div>
        )}

        {soundbite.ipfsCid && (
          <a
            className="projectdetail-cid-btn"
            href={`${IPFS_GATEWAY}/${soundbite.ipfsCid}`}
            target="_blank"
            rel="noreferrer"
          >
            IPFS — Visa fil
          </a>
        )}
      </div>
    </div>
  )
}

const ProjectDetailModal = ({ project, refreshKey, onClose }) => {
  const [soundbites, setSoundbites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      setSoundbites([])
      const eip1193 = window.ethereum
      if (!eip1193 || !project?.id) {
        setLoading(false)
        return
      }
      try {
        const contract = await getRifReadOnlyContract(eip1193)
        if (!contract) {
          if (!cancelled) setError('Byt till Ethereum Sepolia för att läsa soundbites.')
          return
        }
        const ids = await contract.getProjectSoundbites(project.id)
        const list = []
        for (const sid of ids) {
          const s = await contract.Soundbites(sid)
          list.push({
            id: s.id.toString(),
            ipfsCid: s.ipfsCid,
            description: s.description,
            timestamp: s.timestamp,
            author: s.author,
          })
        }
        if (!cancelled) {
          setSoundbites(list)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Kunde inte läsa soundbites.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [project?.id, refreshKey])

  if (!project) return null

  const txUrl = project.createTxHash
    ? `https://sepolia.etherscan.io/tx/${project.createTxHash}`
    : null

  return (
    <div className="projectdetail-overlay" onClick={onClose} role="presentation">
      <div
        className="projectdetail-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="projectdetail-title"
      >
        <button type="button" className="projectdetail-close" onClick={onClose} aria-label="Stäng">
          ×
        </button>
        <h2 id="projectdetail-title">{project.title || `Project #${project.id}`}</h2>
        <p className="projectdetail-meta">
          {project.createdAt != null && (
            <span>{formatTs(project.createdAt)}</span>
          )}
        </p>
        <p className="projectdetail-description">"{project.description || '—'}"</p>
        {txUrl ? (
          <p className="projectdetail-tx">
            <a href={txUrl} target="_blank" rel="noreferrer">
              Sepolia Etherscan - Visa transaktion
            </a>
          </p>
        ) : (
          <p className="projectdetail-tx projectdetail-tx--muted">
            Ingen lokal tx-hash sparad (t.ex. skapat i annan webbläsare). Data kommer ändå från kontraktet.
          </p>
        )}

        <h3 className="projectdetail-soundbites-title">Soundbites</h3>
        {loading && <p className="projectdetail-muted">Laddar…</p>}
        {error && <p className="projectdetail-error">{error}</p>}
        {!loading && !error && soundbites.length === 0 && (
          <p className="projectdetail-muted">Inga soundbites i det här projektet än.</p>
        )}
        {!loading && soundbites.length > 0 && (
          <div className="projectdetail-soundbite-list">
            {soundbites.map((s) => (
              <SoundbitePlayer key={s.id} soundbite={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailModal
