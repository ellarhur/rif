// Panel som listar och visar den inloggade användarens egna projekt från blockkedjan.
import React, { useCallback, useEffect, useState } from 'react'
import { useWallet } from '../context/useWallet.js'
import { getRifReadOnlyContract } from '../utils/rifContractRead'
import { getProjectRecords } from '../utils/rifProjectRecords'
import { CHAIN_IDS } from '../config/contracts'
import ProjectDetailModal from './ProjectDetailModal'

const YourProjects = ({ refreshKey = 0 }) => {
  const { account } = useWallet()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)

  const loadProjects = useCallback(async () => {
    setError('')
    setLoading(true)
    const eip1193 = window.ethereum
    if (!eip1193 || !account) {
      setProjects([])
      setLoading(false)
      return
    }
    try {
      const contract = await getRifReadOnlyContract(eip1193)
      if (!contract) {
        setError(
          `Din wallet är inte på Ethereum Sepolia (chainId ska vara ${CHAIN_IDS.sepolia}). Byt nätverk i MetaMask och ladda om sidan.`
        )
        setProjects([])
        return
      }
      const ids = await contract.getOwnerProjects(account)
      const records = getProjectRecords(account)
      const list = []
      for (const rawId of ids) {
        const row = await contract.projects(rawId)
        if (!row.exists) continue
        const idStr = rawId.toString()
        const rec = records.find((r) => String(r.projectId) === idStr)
        list.push({
          id: idStr,
          title: row.title,
          description: row.description,
          createdAt: row.createdAt,
          owner: row.owner,
          createTxHash: rec?.createTxHash ?? null,
        })
      }
      list.sort((a, b) => Number(b.id) - Number(a.id))
      setProjects(list)
    } catch (e) {
      setError(e?.shortMessage || e?.message || 'Kunde inte läsa projekt.')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [account])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects, refreshKey])

  return (
    <div className="yourprojects-panel">
      <h1>Dina projekt</h1>
      {loading && <p className="yourprojects-panel__status">Laddar projekt…</p>}
      {!loading && error && (
        <p className="yourprojects-panel__error">{error}</p>
      )}
      {!loading && !error && projects.length === 0 && (
        <p className="yourprojects-panel__status">Inga projekt än. Skapa ett med knappen till höger.</p>
      )}
      {!loading &&
        projects.map((p) => (
          <button
            key={p.id}
            type="button"
            className="yourprojects-panel__project-btn"
            onClick={() => setSelected(p)}
          >
            {p.title?.trim() ? p.title : `Project #${p.id}`}
          </button>
        ))}

      {selected && (
        <ProjectDetailModal
          project={selected}
          refreshKey={refreshKey}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

export default YourProjects
