import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import '../styles/AddSoundbite.scss'
import { useWallet } from '../context/WalletContext.jsx'
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
  const { account, activeProvider } = useWallet()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [wrongChainId, setWrongChainId] = useState(null)
  const [switchBusy, setSwitchBusy] = useState(false)

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayIsoDate())
  const [soundbiteType, setSoundbiteType] = useState('audio')
  const [file, setFile] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState(null)

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

  const handlePublish = async () => {
    setError('')
    setResult(null)
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
    if (!file) {
      setError('Välj en fil att ladda upp till IPFS (tills vidare krävs fil).')
      return
    }

    const eip1193 = activeProvider || window.ethereum
    if (!eip1193) {
      setError('Ingen wallet hittades. Logga in igen från startsidan.')
      return
    }

    try {
      setIsSubmitting(true)
      const chainId = await getWalletChainId(eip1193)
      if (!isEthereumSepolia(chainId)) {
        const switched = await switchToEthereumSepolia(eip1193)
        if (!switched.ok) {
          setError(switched.message || 'Fel nätverk. Byt till Ethereum Sepolia.')
          return
        }
      }

      const projectTitle = selectedProject.title?.trim()
        ? selectedProject.title
        : `Project #${selectedProject.id}`

      // 1) Ladda upp filen till IPFS → fileCid
      const fileUpload = await uploadFileToIpfs(file)

      // 2) Skapa metadata-JSON och ladda upp → metadataCid
      const metadata = {
        version: 1,
        projectId: String(selectedProject.id),
        projectTitle,
        date,
        soundbiteType,
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

      // 3) Skriv metadata-CID till kontraktet
      const provider = new ethers.BrowserProvider(eip1193)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(getRifAddress(Number(CHAIN_IDS.sepolia)), rifAbi, signer)
      const tx = await contract.addSoundbite(selectedProject.id, metaUpload.cid, soundbiteType, description.trim())
      await tx.wait()

      setResult({
        txHash: tx.hash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
        ipfsCid: metaUpload.cid,
        ipfsUrl: `https://nftstorage.link/ipfs/${metaUpload.cid}`,
      })

      onSave?.({
        projectId: selectedProject.id,
        projectTitle,
        description: description.trim(),
        date,
        soundbiteType,
        ipfsCid: metaUpload.cid,
        txHash: tx.hash,
      })

      setDescription('')
      setFile(null)
      // Låt användaren se resultat-länkar, men refresh:a listor i bakgrunden via onSave i parent.
    } catch (e) {
      setError(e?.message || 'Kunde inte publicera soundbite.')
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

            <label>
              Typ
              <select value={soundbiteType} onChange={(e) => setSoundbiteType(e.target.value)}>
                <option value="audio">audio</option>
                <option value="lyric">lyric</option>
                <option value="chord">chord</option>
                <option value="note">note</option>
                <option value="other">other</option>
              </select>
            </label>

            <label>
              Fil (laddas upp till IPFS)
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {result && (
              <div className="addsoundbite-result">
                <p>Publicerad!</p>
                <a href={result.etherscanUrl} target="_blank" rel="noreferrer">
                  Visa transaktion på Sepolia Etherscan
                </a>
                <br />
                <a href={result.ipfsUrl} target="_blank" rel="noreferrer">
                  Visa metadata på IPFS
                </a>
                <p className="addsoundbite-muted">CID: {result.ipfsCid}</p>

                <div className="addsoundbite-guide">
                  <p className="addsoundbite-guide-title">Så här ser du din CID på Etherscan:</p>
                  <ol>
                    <li>Klicka på länken "Visa transaktion på Sepolia Etherscan" ovan.</li>
                    <li>Scrolla ner till <strong>Input Data</strong>.</li>
                    <li>Klicka på <strong>"View input as UTF-8"</strong> (eller "Decode input data").</li>
                    <li>Där ser du CID:n <strong>{result.ipfsCid}</strong> inbäddad i transaktionsdatan — det är ditt on-chain-bevis.</li>
                  </ol>
                </div>
              </div>
            )}

            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="button" onClick={() => void handlePublish()} disabled={isSubmitting}>
              {isSubmitting ? 'Publicerar…' : 'Publicera soundbite'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AddSoundbiteButton
