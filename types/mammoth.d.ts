declare module "mammoth" {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function extractRawText(options: {
    path?: string;
    buffer?: Buffer;
    arrayBuffer?: ArrayBuffer;
  }): Promise<MammothResult>;
}
