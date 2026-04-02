import React, { useState } from 'react'
import { ethers } from 'ethers'
import rifAbi from '../abi/rifAbi.json'
import { getRifAddress } from '../config/getRifAddress'
import { CHAIN_IDS } from '../config/contracts'
import { useWallet } from '../context/WalletContext.jsx'
import { saveProjectCreation } from '../utils/rifProjectRecords'
import { getWalletChainId, isEthereumSepolia, switchToEthereumSepolia } from '../utils/rifChain'
import '../styles/CreateNewProject.scss'

const CreateNewProject = ({ onClose, onSuccess, onCreated }) => {
  const { activeProvider } = useWallet()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleCreateProject = async () => {
    setError('')

    if (!title.trim()) {
      setError('Project title is required.')
      return
    }

    const eip1193 = activeProvider || window.ethereum
    if (!eip1193) {
      setError('Ingen wallet hittades. Logga in igen från startsidan.')
      return
    }

    const titleTrimmed = title.trim()
    const descriptionTrimmed = description.trim()

    try {
      setIsSubmitting(true)
      const provider = new ethers.BrowserProvider(eip1193)
      const signer = await provider.getSigner()
      const userAddress = await signer.getAddress()
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

      const contract = new ethers.Contract(getRifAddress(Number(CHAIN_IDS.sepolia)), rifAbi, signer)
      const tx = await contract.createProject(titleTrimmed, descriptionTrimmed)
      const receipt = await tx.wait()

      let projectId = null
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log)
          if (parsed?.name === 'ProjectCreated') {
            projectId = parsed.args.projectId.toString()
            break
          }
        } catch {
          // Ignore non-contract logs.
        }
      }

      onCreated?.({
        projectId: projectId ?? 'Unknown',
        txHash: tx.hash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
      })

      if (projectId != null && projectId !== 'Unknown') {
        saveProjectCreation(userAddress, {
          projectId,
          txHash: tx.hash,
          title: titleTrimmed,
          description: descriptionTrimmed,
        })
        onSuccess?.()
      }

      setTitle('')
      setDescription('')
      setImageUrl('')
      onClose?.()
    } catch (createError) {
      setError(createError?.shortMessage || createError?.message || 'Transaction failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="createnewproject-overlay" onClick={onClose} role="presentation">
      <div
        className="createnewproject-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="createnewproject-title"
      >
        <button className="createnewproject-close" onClick={onClose} aria-label="Close modal">
          x
        </button>
        <h1 id="createnewproject-title">Create New Project</h1>
        <p>Create a new project to start your creative journey.</p>
        <input
          type="text"
          placeholder="Project Name"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          type="text"
          placeholder="Project Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <input
          type="text"
          placeholder="Project Image URL"
          value={imageUrl}
          onChange={(event) => setImageUrl(event.target.value)}
        />

        {error && <p className="createnewproject-error">{error}</p>}

        <button onClick={onClose}>Cancel</button>
        <button onClick={handleCreateProject} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}

export default CreateNewProject
