// src/services/imageProcessor.ts
import sharp from "sharp";
import * as fs from "fs-extra";
import * as path from "path";
import { lookup } from "mime-types";
import { ImageMetadata, ProcessingConfig } from "../types";
import { FileUtils } from "../utils/fileUtils";

export class ImageProcessor {
  private config: ProcessingConfig;

  constructor(config: ProcessingConfig) {
    this.config = config;
  }

  /**
   * 处理单个图片文件
   */
  async processImage(filePath: string): Promise<ImageMetadata | null> {
    try {
      console.log(`Processing: ${filePath}`);

      // 获取文件信息
      const stats = await fs.stat(filePath);
      const originalName = path.basename(filePath);

      // 生成新的文件名
      const filename = originalName;

      // 获取图片尺寸
      const metadata = await sharp(filePath).metadata();

      // 生成文件哈希
      const hash = await FileUtils.generateFileHash(filePath);

      // 获取 MIME 类型
      const mimeType = lookup(filePath) || "application/octet-stream";

      // 构建相对路径和 URL
      const relativePath = this.config.basePath || "/uploads";
      const url = `${relativePath}/${filename}`;

      // 构建元数据对象
      const imageMetadata: ImageMetadata = {
        filename,
        originalName,
        width: metadata.width?.toString() || "0",
        height: metadata.height?.toString() || "0",
        path: relativePath,
        url,
        size: stats.size,
        type: mimeType,
        hash,
        uploadedAt: {
          $date: new Date().toISOString(),
        },
        uploadedBy: {
          ...this.config.uploadedBy,
        },
      };

      return imageMetadata;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 处理文件夹中的所有图片
   */
  async processFolder(): Promise<ImageMetadata[]> {
    console.log(`Starting to process folder: ${this.config.inputFolder}`);

    // 检查输入文件夹是否存在
    if (!(await fs.pathExists(this.config.inputFolder))) {
      throw new Error(
        `Input folder does not exist: ${this.config.inputFolder}`
      );
    }

    // 获取所有图片文件
    const imageFiles = await FileUtils.getImageFiles(this.config.inputFolder);
    console.log(`Found ${imageFiles.length} image files`);

    const results: ImageMetadata[] = [];
    let processed = 0;

    // 处理每个图片文件
    for (const filePath of imageFiles) {
      const metadata = await this.processImage(filePath);
      if (metadata) {
        results.push(metadata);
      }

      processed++;
      console.log(
        `Progress: ${processed}/${imageFiles.length} (${Math.round(
          (processed / imageFiles.length) * 100
        )}%)`
      );
    }

    console.log(
      `Processing completed. ${results.length} images processed successfully.`
    );
    return results;
  }

  /**
   * 保存结果到文件
   */
  async saveResults(
    results: ImageMetadata[],
    outputPath?: string
  ): Promise<void> {
    const outputFile =
      outputPath || this.config.outputFile || "image-metadata.json";

    try {
      // ✅ 确保输出目录存在
      const outputDir = path.dirname(outputFile);
      await fs.ensureDir(outputDir);

      await fs.writeJson(outputFile, results, { spaces: 2 });
      console.log(`Results saved to: ${outputFile}`);
    } catch (error) {
      console.error("Error saving results:", error);
      throw error;
    }
  }
}
