const STORAGE_KEY = 'rif_project_records_v1'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function saveProjectCreation(account, { projectId, txHash, title, description }) {
  if (!account || projectId == null || !txHash) return
  const addr = account.toLowerCase()
  const all = readAll()
  if (!all[addr]) all[addr] = []
  const idStr = String(projectId)
  const idx = all[addr].findIndex((p) => String(p.projectId) === idStr)
  const entry = {
    projectId: idStr,
    createTxHash: txHash,
    title: title ?? '',
    description: description ?? '',
  }
  if (idx >= 0) all[addr][idx] = { ...all[addr][idx], ...entry }
  else all[addr].push(entry)
  writeAll(all)
}

export function getProjectRecords(account) {
  if (!account) return []
  const addr = account.toLowerCase()
  const all = readAll()
  return Array.isArray(all[addr]) ? all[addr] : []
}
