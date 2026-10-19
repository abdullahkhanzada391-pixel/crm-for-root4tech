const http = require('http');

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing Frontend root http://localhost:5173/...');
  const root = await checkUrl('http://localhost:5173/');
  console.log('Root status:', root.status, 'HTML length:', root.data.length);

  console.log('Testing Backend API http://127.0.0.1:8000/api/health/...');
  const health = await checkUrl('http://127.0.0.1:8000/api/health/');
  console.log('Health status:', health.status, 'Body:', health.data);

  console.log('Testing Vite Proxy http://localhost:5173/api/health/...');
  const proxy = await checkUrl('http://localhost:5173/api/health/');
  console.log('Proxy status:', proxy.status, 'Body:', proxy.data);

  console.log('Testing Dashboard stats http://localhost:5173/api/dashboard/stats/...');
  const stats = await checkUrl('http://localhost:5173/api/dashboard/stats/');
  console.log('Stats status:', stats.status, 'Body snippet:', stats.data.substring(0, 100));

  console.log('Testing main.tsx http://localhost:5173/src/main.tsx...');
  const main = await checkUrl('http://localhost:5173/src/main.tsx');
  console.log('main.tsx status:', main.status, 'Body length:', main.data.length);

  console.log('Testing App.tsx http://localhost:5173/src/App.tsx...');
  const app = await checkUrl('http://localhost:5173/src/App.tsx');
  console.log('App.tsx status:', app.status, 'Body length:', app.data.length);

  console.log('Testing DashboardPage.tsx http://localhost:5173/src/pages/dashboard/DashboardPage.tsx...');
  const dash = await checkUrl('http://localhost:5173/src/pages/dashboard/DashboardPage.tsx');
  console.log('DashboardPage.tsx status:', dash.status, 'Body length:', dash.data.length);
}

run().catch(console.error);
