export default function () {
  // специально скрываем результаты логов от посторонних глаз
  const verbose = !String(globalThis.process.env.NODE_ENV).toUpperCase().startsWith('DEV');
  const avaMainConfig = {
    watchMode: {
      ignoreChanges: ['src/**/*'],
    },
    concurrency: 5,
    failWithoutAssertions: false,
    environmentVariables: {
      HOST: 'localhost',
      PORT: '9001',
    },
    nodeArguments: [],
    extensions: {
      ts: 'module',
    },
  };

  return {
    ...avaMainConfig,
    verbose,
    cache: false,
  };
}
