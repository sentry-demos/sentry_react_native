const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {withSentryConfig} = require('@sentry/react-native/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const userConfig = {};

const config = mergeConfig(getDefaultConfig(__dirname), userConfig);

module.exports = withSentryConfig(config, {
  annotateReactComponents: true,
});
