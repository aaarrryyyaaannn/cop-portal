import Dexie from 'dexie'

export const db = new Dexie('FirPortalDB')

db.version(1).stores({
  user: 'id, token, updatedAt',
  firs: 'id, firNumber, status, updatedAt',
  pendingFirs: '++id, createdAt, synced',
  cache: 'key, value, updatedAt',
  syncQueue: '++id, url, method, body, createdAt'
})

export async function getStoredUser() {
  const row = await db.user.get(1)
  return row ? { user: row.user, token: row.token } : null
}

export async function setStoredUser(user, token) {
  await db.user.put({
    id: 1,
    user,
    token,
    updatedAt: Date.now()
  })
}

export async function clearStoredUser() {
  await db.user.clear()
}

export async function cacheFirs(firs) {
  await db.firs.clear()
  for (const fir of firs || []) {
    await db.firs.put({ ...fir, id: fir._id || fir.id, updatedAt: Date.now() })
  }
}

export async function getCachedFirs() {
  return db.firs.toArray()
}

export async function addPendingFir(data) {
  return db.pendingFirs.add({
    ...data,
    synced: false,
    createdAt: Date.now()
  })
}

export async function getPendingFirs() {
  return db.pendingFirs.where('synced').equals(false).toArray()
}

export async function markPendingSynced(id) {
  await db.pendingFirs.update(id, { synced: true })
}

export async function addToSyncQueue(url, method, body) {
  return db.syncQueue.add({
    url,
    method,
    body: JSON.stringify(body),
    createdAt: Date.now()
  })
}

export async function getSyncQueue() {
  return db.syncQueue.toArray()
}

export async function removeFromSyncQueue(id) {
  await db.syncQueue.delete(id)
}
