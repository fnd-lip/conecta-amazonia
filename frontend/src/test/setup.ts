import "@testing-library/jest-dom/jest-globals";
import "@testing-library/jest-dom";


import { TextEncoder, TextDecoder } from "util";

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
});

globalThis.fetch = jest.fn();
