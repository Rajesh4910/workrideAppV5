// scripts/create-sample-ride.js
// Creates a sample ride document in the Firestore emulator via REST.
const projectId = 'workride-4a320';
const host = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const [hostOnly, port] = host.split(':');
const base = `http://${hostOnly}:${port}`;
const fetch = global.fetch || require('node-fetch');

async function main() {
  const id = `ride_test_${Date.now()}`;
  const url = `${base}/v1/projects/${projectId}/databases/(default)/documents/rides?documentId=${id}`;
  const now = new Date().toISOString();
  const body = {
    fields: {
      id: { stringValue: id },
      status: { stringValue: 'PUBLISHED' },
      hostId: { stringValue: 'host_debug_1' },
      pickup: { mapValue: { fields: { lat: { doubleValue: 53.3498 }, lng: { doubleValue: -6.2603 }, name: { stringValue: 'Dublin City Centre' } } } },
      drop: { mapValue: { fields: { lat: { doubleValue: 53.333 }, lng: { doubleValue: -6.243 }, name: { stringValue: 'Sandyford' } } } },
      car: { mapValue: { fields: { model: { stringValue: 'Toyota Corolla' }, color: { stringValue: '#1f2937' }, reg: { stringValue: 'ABC-123' } } } },
      seats: { integerValue: '3' },
      price: { doubleValue: 5 },
      currency: { stringValue: '€' },
      createdAt: { timestampValue: now }
    }
  };
  console.log('Writing sample ride to', url);
  const res = await fetch(url, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
  const json = await res.text();
  console.log('Response status', res.status);
  console.log(json);
}

main().catch((e) => { console.error(e); process.exit(1); });
