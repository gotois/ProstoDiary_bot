/**
 * Ava config
 *
 * @returns {Object}
 */
export default () => {
  // специально скрываем результаты логов от посторонних глаз
  const verbose = process.env.NODE_ENV !== 'TRAVIS_CI';
  if (process.env.FAST_TEST) {
    return {
      failFast: true,
      cache: true,
      verbose,
    };
  }
  return {
    verbose,
  };
};
