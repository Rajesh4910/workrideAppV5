// scripts/add-pending-request.js
// Adds a pendingRequest to an existing ride document in the Firestore emulator via REST.
const projectId = 'workride-4a320';
const host = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const [hostOnly, port] = host.split(':');
const base = `http://${hostOnly}:${port}`;
const fetch = global.fetch || require('node-fetch');

async function main() {
  const rideId = process.argv[2];
  if (!rideId) {
    console.error('Usage: node add-pending-request.js <rideId>');
    process.exit(1);
  }
  const url = `${base}/v1/projects/${projectId}/databases/(default)/documents/rides/${rideId}`;
  // Read existing doc
  const getRes = await fetch(url);
  if (getRes.status !== 200) {
    console.error('Failed to read ride', getRes.status);
    console.error(await getRes.text());
    process.exit(1);
  }
  const doc = await getRes.json();
  const fields = doc.fields || {};
  // attach pendingRequest
  fields.pendingRequest = {
    mapValue: {
      fields: {
        riderId: { stringValue: 'rider_test_1' },
        riderName: { stringValue: 'Test Rider' },
        pickup: { mapValue: { fields: { lat: { doubleValue: 53.350 }, lng: { doubleValue: -6.260 }, name: { stringValue: 'Dublin Docklands' } } } },
        createdAt: { timestampValue: new Date().toISOString() }
      }
    }
  };

  // write back with PATCH (update mask omitted to replace whole doc fields)
  const body = { fields };
  const patchRes = await fetch(url, { method: 'PATCH', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  console.log('Patch status', patchRes.status);
  console.log(await patchRes.text());
}

main().catch((e) => { console.error(e); process.exit(1); });
