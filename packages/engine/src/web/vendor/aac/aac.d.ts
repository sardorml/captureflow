export type AacModule = {
  HEAPU8: Uint8Array;
  cwrap(
    name: string,
    returnType: "number" | null,
    argTypes: "number"[],
  ): (...args: (number | bigint)[]) => number;
};

export default function createModule(): Promise<AacModule>;
