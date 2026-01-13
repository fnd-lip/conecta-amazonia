import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],

  testMatch: [
    "<rootDir>/src/__tests__/**/*.test.ts",
    "<rootDir>/src/__tests__/**/*.test.tsx",
  ],

  moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/src/$1",
  "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/src/__mocks__/fileMock.ts"
},

  clearMocks: true,
};

export default config;
