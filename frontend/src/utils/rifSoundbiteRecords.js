const STORAGE_KEY = 'rif_soundbite_records_v1'

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

export function saveLocalSoundbite(account, { projectId, projectTitle, description, date }) {
  if (!account || !projectId || !description || !date) return
  const addr = account.toLowerCase()
  const all = readAll()
  if (!all[addr]) all[addr] = []
  all[addr].push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    projectId: String(projectId),
    projectTitle: projectTitle ?? '',
    description: description ?? '',
    date,
    createdAtMs: Date.now(),
  })
  writeAll(all)
}

export function getLocalSoundbites(account, projectId) {
  if (!account || !projectId) return []
  const addr = account.toLowerCase()
  const all = readAll()
  const list = Array.isArray(all[addr]) ? all[addr] : []
  const pid = String(projectId)
  return list
    .filter((s) => String(s.projectId) === pid)
    .sort((a, b) => Number(b.createdAtMs ?? 0) - Number(a.createdAtMs ?? 0))
}

