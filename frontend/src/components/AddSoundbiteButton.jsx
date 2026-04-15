import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import '../styles/AddSoundbite.scss'
import { useWallet } from '../context/useWallet.js'
import { getRifReadOnlyContract } from '../utils/rifContractRead'
import { CHAIN_IDS } from '../config/contracts'
import { getWalletChainId, isEthereumSepolia, switchToEthereumSepolia } from '../utils/rifChain'
import rifAbi from '../abi/rifAbi.json'
import { getRifAddress } from '../config/getRifAddress'
import { uploadFileToIpfs, uploadJsonToIpfs } from '../utils/ipfsUpload'

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
  const { account } = useWallet()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayIsoDate())
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const selectedProject = useMemo(
    () => projects.find((p) => String(p.id) === String(selectedProjectId)) ?? null,
    [projects, selectedProjectId]
  )

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
        setError('Din wallet är inte på Ethereum Sepolia. Byt nätverk i MetaMask och ladda om sidan.')
        setProjects([])
        return
      }
      const ids = await contract.getOwnerProjects(account)
      const list = []
      for (const rawId of ids) {
        const row = await contract.projects(rawId)
        if (!row.exists) continue
        list.push({ id: rawId.toString(), title: row.title })
      }
      list.sort((a, b) => Number(b.id) - Number(a.id))
      setProjects(list)
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id)
      }
    } catch (e) {
      setError(e.message || 'Kunde inte läsa projekt.')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }, [account, selectedProjectId])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handlePublish = async () => {
    setError('')
    setResult(null)
    if (!projects.length) { setError('Du har inga projekt. Skapa ett projekt först.'); return }
    if (!selectedProject) { setError('Välj ett projekt.'); return }
    if (!description.trim()) { setError('Beskrivning krävs.'); return }
    if (!date) { setError('Datum krävs.'); return }
    if (!file) { setError('Välj en fil att ladda upp.'); return }

    const eip1193 = window.ethereum
    if (!eip1193) { setError('Ingen wallet hittades. Logga in igen.'); return }

    try {
      setIsSubmitting(true)

      let chainId = await getWalletChainId(eip1193)
      if (!isEthereumSepolia(chainId)) {
        const switched = await switchToEthereumSepolia(eip1193)
        if (!switched.ok) {
          setError(
            switched.message ||
              `Fel nätverk (chainId ${chainId}). Byt till Ethereum Sepolia (${CHAIN_IDS.sepolia}) i MetaMask.`
          )
          return
        }
        chainId = await getWalletChainId(eip1193)
        if (!isEthereumSepolia(chainId)) {
          setError(`Fortfarande fel nätverk (chainId ${chainId}). Välj Ethereum Sepolia, inte Base Sepolia.`)
          return
        }
      }

      const projectTitle = selectedProject.title?.trim() || `Project #${selectedProject.id}`

      const fileUpload = await uploadFileToIpfs(file)

      const metadata = {
        version: 1,
        projectId: String(selectedProject.id),
        projectTitle,
        date,
        description: description.trim(),
        file: {
          cid: fileUpload.cid,
          name: file.name,
          type: file.type || null,
          size: typeof file.size === 'number' ? file.size : null,
        },
        createdAt: new Date().toISOString(),
      }
      const metaUpload = await uploadJsonToIpfs(metadata)

      const provider = new ethers.BrowserProvider(eip1193)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(getRifAddress(Number(CHAIN_IDS.sepolia)), rifAbi, signer)
      const tx = await contract.addSoundbite(selectedProject.id, metaUpload.cid, description.trim())
      await tx.wait()

      setResult({
        txHash: tx.hash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
        ipfsCid: metaUpload.cid,
      })

      onSave?.({
        projectId: selectedProject.id,
        projectTitle,
        description: description.trim(),
        date,
        ipfsCid: metaUpload.cid,
        txHash: tx.hash,
      })

      setDescription('')
      setFile(null)
    } catch (e) {
      setError(e.message || 'Kunde inte publicera soundbite.')
    } finally {
      setIsSubmitting(false)
    }
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
        <button type="button" className="addsoundbite-close" onClick={onClose} aria-label="Stäng">
          ×
        </button>
        <h1 id="addsoundbite-title">Lägg till Soundbite</h1>
        <p>Lägg till en soundbite i något av dina projekt: en fil som får illustrera vart din kreativa process är i nuläget.</p>

        {loading && <p>Laddar projekt…</p>}
        {!loading && error && <p className="addsoundbite-error">{error}</p>}

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

            <label>
              Fil (laddas upp till IPFS)
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </label>

            {result && (
              <div className="addsoundbite-result">
                <p>Publicerad!</p>
                <a href={result.etherscanUrl} target="_blank" rel="noreferrer">
                  Visa transaktion på Sepolia Etherscan
                </a>
                <p className="addsoundbite-muted">CID: {result.ipfsCid}</p>
                <div className="addsoundbite-guide">
                  <p className="addsoundbite-guide-title">Så här ser du din CID på Etherscan:</p>
                  <ol>
                    <li>Klicka på länken ovan.</li>
                    <li>Scrolla ner till <strong>Input Data</strong>.</li>
                    <li>Klicka på <strong>"View input as UTF-8"</strong>.</li>
                    <li>Där ser du CID:n <strong>{result.ipfsCid}</strong> — ditt on-chain-bevis.</li>
                  </ol>
                </div>
              </div>
            )}

            <button type="button" onClick={onClose}>Avbryt</button>
            <button type="button" onClick={() => handlePublish()} disabled={isSubmitting}>
              {isSubmitting ? 'Publicerar…' : 'Publicera soundbite'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AddSoundbiteButton
