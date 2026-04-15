const PINATA_FILE_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
const PINATA_JSON_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs'

function getPinataJwt() {
  return import.meta.env.VITE_PINATA_JWT || ''
}

export async function uploadFileToIpfs(file) {
  if (!file) throw new Error('Ingen fil vald.')
  const token = getPinataJwt()
  if (!token) throw new Error('Saknar VITE_PINATA_JWT (Pinata).')

  const form = new FormData()
  form.append('file', file, file.name)

  const res = await fetch(PINATA_FILE_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.IpfsHash) {
    const msg = json?.error?.details || json?.error || res.statusText || 'IPFS-uppladdning misslyckades.'
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  return {
    cid: json.IpfsHash,
    url: `${IPFS_GATEWAY}/${json.IpfsHash}`,
  }
}

export async function uploadJsonToIpfs(obj) {
  const token = getPinataJwt()
  if (!token) throw new Error('Saknar VITE_PINATA_JWT (Pinata).')

  const res = await fetch(PINATA_JSON_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pinataContent: obj }),
  })

  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.IpfsHash) {
    const msg = json?.error?.details || json?.error || res.statusText || 'IPFS-uppladdning misslyckades.'
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }

  return {
    cid: json.IpfsHash,
    url: `${IPFS_GATEWAY}/${json.IpfsHash}`,
  }
}
