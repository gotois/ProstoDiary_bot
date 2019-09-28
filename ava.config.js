/**
 * Ava config
 *
 * @returns {Object}
 */
export default () => {
  // специально скрываем результаты логов от посторонних глаз
  const verbose = process.env.NODE_ENV !== 'TRAVIS_CI';
  const avaMainConfig = {
    'sources': [
      'src/**/*'
    ],
    'concurrency': 5,
    'failWithoutAssertions': false,
    'environmentVariables': {
      'SERVER_NAME': '0.0.0.0:3000',
      'TELEGRAM_TOKEN': '123456',
      'SALT_PASSWORD': '123456',
      'TELEGRAM_SERVER_PORT': '9001',
    },
    'compileEnhancements': false,
  };
  
  if (process.env.FAST_TEST) {
    return {
      ...avaMainConfig,
      failFast: true,
      cache: true,
      verbose,
    };
  }
  return {
    ...avaMainConfig,
    verbose,
    cache: false,
  };
};
