// src/types.ts
export interface ImageMetadata {
  filename: string;
  originalName: string;
  width: string;
  height: string;
  path: string;
  url: string;
  size: number;
  type: string;
  hash: string;
  uploadedAt: {
    $date: string;
  };
  uploadedBy: {
    name: string;
    email: string;
    id: string;
  };
}

export interface ProcessingConfig {
  inputFolder: string;
  outputFile?: string;
  basePath?: string;
  baseUrl?: string;
  uploadedBy: {
    name: string;
    email: string;
    id: string;
  };
}
