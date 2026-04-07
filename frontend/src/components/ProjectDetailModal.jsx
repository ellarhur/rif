import React, { useEffect, useState } from 'react'
import { getRifReadOnlyContract } from '../utils/rifContractRead'
import { getLocalSoundbites } from '../utils/rifSoundbiteRecords'
import { useWallet } from '../context/WalletContext.jsx'

function formatTs(ts) {
  try {
    const n = typeof ts === 'bigint' ? Number(ts) : Number(ts)
    if (!Number.isFinite(n) || n <= 0) return '—'
    return new Date(n * 1000).toLocaleString()
  } catch {
    return '—'
  }
}

function formatIsoDate(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString()
  } catch {
    return iso
  }
}

const ProjectDetailModal = ({ project, activeProvider, refreshKey, onClose }) => {
  const { account } = useWallet()
  const [soundbites, setSoundbites] = useState([])
  const [localSoundbites, setLocalSoundbites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError('')
      setLoading(true)
      setSoundbites([])
      setLocalSoundbites([])
      const eip1193 = activeProvider || window.ethereum
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
            soundbiteType: s.SoundbiteType,
            description: s.description,
            timestamp: s.timestamp,
            author: s.author,
          })
        }
        if (!cancelled) {
          setSoundbites(list)
          setLocalSoundbites(getLocalSoundbites(account, project.id))
        }
      } catch (e) {
        if (!cancelled) setError(e?.shortMessage || e?.message || 'Kunde inte läsa soundbites.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [project?.id, activeProvider, refreshKey, account])

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
        <p className="projectdetail-description">{project.description || '—'}</p>
        <p className="projectdetail-meta">
          <span>Projekt-ID: {project.id}</span>
          {project.createdAt != null && (
            <span> · Skapad: {formatTs(project.createdAt)}</span>
          )}
        </p>
        {txUrl ? (
          <p className="projectdetail-tx">
            <a href={txUrl} target="_blank" rel="noreferrer">
              Skapa-projekt-transaktion på Sepolia Etherscan
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
        {!loading && !error && soundbites.length === 0 && localSoundbites.length === 0 && (
          <p className="projectdetail-muted">Inga soundbites i det här projektet än.</p>
        )}
        {!loading && !error && localSoundbites.length > 0 && (
          <>
            <p className="projectdetail-muted">
              Lokala soundbites (ej publicerade än)
            </p>
            <ul className="projectdetail-soundbite-list">
              {localSoundbites.map((s) => (
                <li key={s.id} className="projectdetail-soundbite-item">
                  <strong>Draft</strong>
                  {s.date ? ` · ${formatIsoDate(s.date)}` : ''}
                  {s.description ? ` — ${s.description}` : ''}
                </li>
              ))}
            </ul>
          </>
        )}
        {!loading && soundbites.length > 0 && (
          <ul className="projectdetail-soundbite-list">
            {soundbites.map((s) => (
              <li key={s.id} className="projectdetail-soundbite-item">
                <strong>#{s.id}</strong> · {s.soundbiteType || '—'}
                {s.description ? ` — ${s.description}` : ''}
                <br />
                <span className="projectdetail-cid">
                  IPFS CID:{' '}
                  {s.ipfsCid ? (
                    <a href={`https://gateway.pinata.cloud/ipfs/${s.ipfsCid}`} target="_blank" rel="noreferrer">
                      {s.ipfsCid}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
                <br />
                <span className="projectdetail-muted">
                  {formatTs(s.timestamp)} · {s.author?.slice(0, 10)}…
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailModal
