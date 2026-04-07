import React, { useCallback, useEffect, useMemo, useState } from 'react'
import '../styles/AddSoundbite.scss'
import { useWallet } from '../context/WalletContext.jsx'
import { getRifReadOnlyContract } from '../utils/rifContractRead'
import { CHAIN_IDS } from '../config/contracts'
import { getWalletChainId, switchToEthereumSepolia } from '../utils/rifChain'

function todayIsoDate() {
  try {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  } catch {
    return ''
  }
}

const AddSoundbiteButton = ({ onClose, onSave }) => {
  const { account, activeProvider } = useWallet()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wrongChainId, setWrongChainId] = useState(null)
  const [switchBusy, setSwitchBusy] = useState(false)

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayIsoDate())

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(selectedProjectId)) ?? null,
    [projects, selectedProjectId]
  )

  const loadProjects = useCallback(async () => {
    setError('')
    setWrongChainId(null)
    setLoading(true)
    const eip1193 = activeProvider || window.ethereum
    if (!eip1193 || !account) {
      setProjects([])
      setLoading(false)
      return
    }
    try {
      const chainId = await getWalletChainId(eip1193)
      const contract = await getRifReadOnlyContract(eip1193)
      if (!contract) {
        setWrongChainId(chainId != null ? chainId.toString() : 'okänd')
        setError(
          `Din wallet är inte på Ethereum Sepolia (chainId ska vara ${CHAIN_IDS.sepolia}). ` +
            `MetaMask kan visa "Sepolia" men mena ett annat testnät — välj Ethereum Sepolia.`
        )
        setProjects([])
        return
      }
      const ids = await contract.getOwnerProjects(account)
      const list = []
      for (const rawId of ids) {
        const row = await contract.projects(rawId)
        if (!row.exists) continue
        const idStr = rawId.toString()
        list.push({
          id: idStr,
          title: row.title,
        })
      }
      list.sort((a, b) => Number(b.id) - Number(a.id))
      setProjects(list)
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id)
      }
    } catch (e) {
      setError(e?.shortMessage || e?.message || 'Kunde inte läsa projekt.')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [account, activeProvider, selectedProjectId])

  useEffect(() => {
    void loadProjects()
  }, [loadProjects])

  const handleSwitchSepolia = async () => {
    const eip1193 = activeProvider || window.ethereum
    if (!eip1193) return
    setSwitchBusy(true)
    setError('')
    try {
      const result = await switchToEthereumSepolia(eip1193)
      if (!result.ok) {
        setError(result.message || 'Kunde inte byta nätverk.')
        return
      }
      await loadProjects()
    } finally {
      setSwitchBusy(false)
    }
  }

  const handleSave = () => {
    setError('')
    if (!projects.length) {
      setError('Du har inga projekt att välja. Skapa ett projekt först.')
      return
    }
    if (!selectedProject) {
      setError('Välj ett projekt.')
      return
    }
    if (!description.trim()) {
      setError('Beskrivning krävs.')
      return
    }
    if (!date) {
      setError('Datum krävs.')
      return
    }
    onSave?.({
      projectId: selectedProject.id,
      projectTitle: selectedProject.title?.trim() ? selectedProject.title : `Project #${selectedProject.id}`,
      description: description.trim(),
      date,
    })
    onClose?.()
  }

  return (
    <div className="addsoundbite-overlay" onClick={onClose} role="presentation">
      <div
        className="addsoundbite-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="addsoundbite-title"
      >
        <button type="button" className="addsoundbite-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h1 id="addsoundbite-title">Add Soundbite</h1>
        <p>Lägg till en soundbite (datum + beskrivning) till ett av dina projekt.</p>

        {loading && <p>Laddar projekt…</p>}
        {!loading && error && (
          <>
            <p className="addsoundbite-error">{error}</p>
            {wrongChainId != null && <p className="addsoundbite-chainid">Upptäckt chainId: {wrongChainId}</p>}
            <button type="button" disabled={switchBusy} onClick={() => void handleSwitchSepolia()}>
              {switchBusy ? 'Byter nätverk…' : 'Byt till Ethereum Sepolia'}
            </button>
          </>
        )}

        {!loading && !error && (
          <>
            <label>
              Projekt
              <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title?.trim() ? p.title : `Project #${p.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Datum
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <label>
              Beskrivning
              <input
                type="text"
                placeholder="Beskriv din soundbite…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" onClick={handleSave}>
              Spara soundbite
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AddSoundbiteButton
