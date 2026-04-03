const fetch = require('node-fetch'); // we can just use native fetch if node is recent, or use http module
// wait, Node.js v24.13.0 has native fetch
async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test', email: 'test3@test.com', password: 'password123' })
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
