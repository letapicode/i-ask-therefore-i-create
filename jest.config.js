module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '^../../packages/(.*)$': '<rootDir>/packages/$1',
    '^../../services/(.*)$': '<rootDir>/services/$1'
  },
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};
