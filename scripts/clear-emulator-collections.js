// scripts/clear-emulator-collections.js
// Deletes all documents in specified collections from the Firestore emulator.
const projectId = 'workride-4a320';
const host = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.warn('FIRESTORE_EMULATOR_HOST not set — defaulting to 127.0.0.1:8080. Ensure this is the emulator.');
}
const [hostOnly, port] = host.split(':');
const base = `http://${hostOnly}:${port}`;
const fetch = global.fetch || require('node-fetch');

const collections = ['rides', 'ratings', 'messages', 'threadTyping'];

async function clearCollection(col) {
  const url = `${base}/v1/projects/${projectId}/databases/(default)/documents/${col}?pageSize=1000`;
  console.log('Listing', col);
  const res = await fetch(url);
  if (res.status === 404) {
    console.log(`Collection ${col} not found (404). Skipping.`);
    return;
  }
  if (!res.ok) {
    console.error(`Failed to list ${col}:`, res.status);
    console.error(await res.text());
    return;
  }
  const json = await res.json();
  const docs = json.documents || [];
  if (docs.length === 0) {
    console.log(`${col} empty`);
    return;
  }
  console.log(`Found ${docs.length} docs in ${col}, deleting...`);
  for (const d of docs) {
    const name = d.name; // e.g. projects/.../documents/rides/docId
    const delUrl = `${base}/v1/${name}`;
    try {
      const r = await fetch(delUrl, { method: 'DELETE' });
      if (!r.ok) console.warn('Delete failed for', name, r.status, await r.text());
      else console.log('Deleted', name);
    } catch (e) {
      console.warn('Delete error for', name, e);
    }
  }
}

async function main() {
  console.log('Clearing emulator collections at', base);
  for (const c of collections) {
    await clearCollection(c);
  }
  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
