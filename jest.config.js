/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)'
    ],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/**/*.{js,ts}',
        '!src/**/*.d.ts',
        '!src/**/*.test.ts',
        '!src/types/**/*'
    ],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    setupFiles: ['<rootDir>/src/__tests__/setup.ts'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json'
        }
    }
};