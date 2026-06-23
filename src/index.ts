import minimist, { type ParsedArgs } from 'minimist';
import { startServer } from './app/server.ts';

const argv: ParsedArgs = minimist(process.argv.slice(2));
startServer({
  port: Number(argv.port || 443),
  local: Boolean(argv.local),
});
