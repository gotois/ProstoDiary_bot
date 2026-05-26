import ngrok from '@ngrok/ngrok';
import minimist from 'minimist';
import { spawn } from 'node:child_process';

const argv = minimist(process.argv.slice(2));

/**
 * @param {Record<string, string>} [extraEnv] - дополнительные переменные среды
 */
function startServer(extraEnv = {}) {
  const child = spawn(
    process.execPath,
    ['--experimental-sqlite', '-r', 'dotenv/config', '--watch', 'src/index.mjs', `--port=${argv.port}`],
    {
      stdio: 'inherit',
      env: { ...process.env, ...extraEnv },
    },
  );
  child.on('exit', (code) => process.exit(code ?? 0));
}

if (process.env.NGROK_AUTHTOKEN) {
  const listener = await ngrok.forward({
    addr: argv.port,
    proto: 'http',
    authtoken_from_env: true,
  });
  const url = listener.url();
  console.log(`Ingress established at: ${url}`);
  startServer({ TELEGRAM_DOMAIN: url });
} else {
  startServer();
}
