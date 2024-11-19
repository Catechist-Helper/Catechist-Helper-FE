/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  testEnvironment: "jest-environment-jsdom", // Đảm bảo testEnvironment trỏ tới module mới
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {}], // Đảm bảo hỗ trợ TypeScript
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"], // Đường dẫn tới file setupTests
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy", // Mock file CSS
  },
};
