declare module "mammoth" {
  interface ExtractRawTextResult {
    value: string;
    messages?: Array<{ type: string; message: string }>;
  }

  interface Mammoth {
    extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<ExtractRawTextResult>;
  }

  const mammoth: Mammoth;
  export default mammoth;
}
