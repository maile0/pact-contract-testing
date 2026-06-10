module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 30000,
  testMatch: ['**/*.pact.test.ts', '**/*.provider.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@pact-foundation)/)'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  }
}
