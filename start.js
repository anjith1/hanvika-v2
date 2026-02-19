import { exec } from 'child_process';
import { createInterface } from 'readline';

console.log('🚀 Starting the Local Connect application...');

// Track startup state
let apiServerStarted = false;
let clientStarted = false;

// Start the API server
console.log('🌐 Starting API server...');
const apiServer = exec('npm run api-server');

apiServer.stdout.on('data', (data) => {
  const output = data.trim();
  console.log(`[API SERVER]: ${output}`);
  if (output.includes('Server running on port') && !apiServerStarted) {
    apiServerStarted = true;
    startClient();
  }
});

apiServer.stderr.on('data', (data) => {
  console.error(`[API SERVER ERROR]: ${data.trim()}`);
});

apiServer.on('error', (err) => {
  console.error('Failed to start API server process:', err);
  process.exit(1);
});

function startClient() {
  console.log('💻 Starting client application...');
  const client = exec('npm run dev');

  client.stdout.on('data', (data) => {
    const output = data.trim();
    console.log(`[CLIENT]: ${output}`);
    if (output.includes('Local:') && !clientStarted) {
      clientStarted = true;
      console.log('\n✅ Application is now running!');
      console.log('Press Ctrl+C to stop\n');
    }
  });

  client.stderr.on('data', (data) => {
    console.error(`[CLIENT ERROR]: ${data.trim()}`);
  });

  client.on('error', (err) => {
    console.error('Failed to start client process:', err);
    apiServer.kill();
    process.exit(1);
  });

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  process.on('SIGINT', () => {
    console.log('\n👋 Gracefully shutting down...');
    apiServer.kill();
    client.kill();
    rl.close();
    process.exit(0);
  });
}

// Timeout guard: abort if API server doesn't start within 15 seconds
setTimeout(() => {
  if (!apiServerStarted) {
    console.error('❌ API server startup timed out. Check server logs.');
    apiServer.kill();
    process.exit(1);
  }
}, 15000);