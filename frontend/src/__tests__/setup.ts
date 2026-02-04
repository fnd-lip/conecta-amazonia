import '@testing-library/jest-dom';

// Mock do ResizeObserver para componentes Radix UI
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
