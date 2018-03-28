module.exports = {
  extends: ['@brickblock/eslint-config-base'],
  globals: {
    // We are in a node.js context, Buffer is available
    Buffer: true
  }
}
