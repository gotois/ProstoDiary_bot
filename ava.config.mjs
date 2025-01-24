/**
 * Ava config
 *
 * @returns {Object}
 */
export default () => {
  // специально скрываем результаты логов от посторонних глаз
  const verbose = !process.env.NODE_ENV.toUpperCase().startsWith('DEV');
  const avaMainConfig = {
    'ignoredByWatcher': [
      'src/**/*'
    ],
    'concurrency': 5,
    'failWithoutAssertions': false,
    'environmentVariables': {
      'HOST': 'localhost',
      'PORT': '9001',
    },
  };

   return {
    ...avaMainConfig,
    verbose,
    cache: false,
  };
};
