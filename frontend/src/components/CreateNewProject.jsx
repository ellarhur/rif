import React, { useState } from 'react'
import { ethers } from 'ethers'
import rifAbi from '../abi/rifAbi.json'
import { getRifAddress } from '../config/getRifAddress'
import { CHAIN_IDS } from '../config/contracts'

const CreateNewProject = ({ onClose }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleCreateProject = async () => {
    setError('')
    setResult(null)

    if (!title.trim()) {
      setError('Project title is required.')
      return
    }

    if (!window.ethereum) {
      setError('MetaMask hittades inte. Installera extensionen och prova igen.')
      return
    }

    try {
      setIsSubmitting(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])

      const signer = await provider.getSigner()
      const network = await provider.getNetwork()
      if (network.chainId !== BigInt(CHAIN_IDS.sepolia)) {
        setError('Wrong network. Switch to Ethereum Sepolia and try again.')
        return
      }

      const contract = new ethers.Contract(getRifAddress(network.chainId), rifAbi, signer)
      const tx = await contract.createProject(title.trim(), description.trim())
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

      setResult({
        projectId: projectId ?? 'Unknown',
        txHash: tx.hash,
        etherscanUrl: `https://sepolia.etherscan.io/tx/${tx.hash}`,
      })

      setTitle('')
      setDescription('')
      setImageUrl('')
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
        {result && (
          <div className="createnewproject-result">
            <h3>Project created</h3>
            <p>Project ID: {result.projectId}</p>
            <p>Hash: {result.txHash}</p>
            <p>Your project is now published on the blockchain.</p>
            <a href={result.etherscanUrl} target="_blank" rel="noreferrer">
              View on Sepolia Etherscan
            </a>
          </div>
        )}

        <button onClick={onClose}>Cancel</button>
        <button onClick={handleCreateProject} disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </div>
  )
}

export default CreateNewProject
