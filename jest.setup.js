// Jest setup file
// Polyfills for Next.js globals in test environment

// Mock Next.js Request/Response globals
global.Request = global.Request || class MockRequest {};
global.Response = global.Response || class MockResponse {};
global.Headers = global.Headers || class MockHeaders {};

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock TextEncoder/TextDecoder if needed
if (!global.TextEncoder) {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
