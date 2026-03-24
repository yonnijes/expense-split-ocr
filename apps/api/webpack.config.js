const { ComposePlugins, withNx } = require('@nx/webpack');

module.exports = withNx({
    target: 'node', // Esto le dice a Webpack que no busque cosas de "browser"
});