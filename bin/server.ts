import ngrok from '@ngrok/ngrok';
import minimist, { type ParsedArgs } from 'minimist';
import { spawn } from 'node:child_process';

const argv: ParsedArgs = minimist(process.argv.slice(2));

/**
 * Запускает дочерний процесс tg-сервера
 * @param {Record<string, string>} [extraEnvironment] - дополнительные переменные среды
 */
function startServer(extraEnvironment: Record<string, string> = {}): void {
  const child = spawn(
    process.execPath,
    ['-r', 'dotenv/config', '--watch', 'src/index.ts', `--port=${argv.port}`, `--local=${argv.local}`],
    {
      stdio: 'inherit',
      env: { ...process.env, ...extraEnvironment },
    },
  );

  child.on('exit', (code) => {
    process.exitCode = code ?? 0;
  });
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
