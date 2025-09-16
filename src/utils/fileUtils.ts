// src/utils/fileUtils.ts
import * as fs from "fs-extra";
import * as path from "path";
import * as crypto from "crypto";
import { lookup } from "mime-types";

export class FileUtils {
  /**
   * 检查文件是否为图片
   */
  static isImageFile(filePath: string): boolean {
    const mimeType = lookup(filePath);
    return mimeType ? mimeType.startsWith("image/") : false;
  }

  /**
   * 生成文件哈希值
   */
  static async generateFileHash(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash("sha256").update(fileBuffer).digest("hex");
  }

  /**
   * 生成唯一的文件名
   */
  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString("hex");
    const ext = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, ext);
    return `${timestamp}_${randomString}_${nameWithoutExt}${ext}`;
  }

  /**
   * 生成 MongoDB ObjectId 格式的 ID
   */
  static generateObjectId(): string {
    const timestamp = Math.floor(Date.now() / 1000).toString(16);
    const randomBytes = crypto.randomBytes(8).toString("hex");
    return timestamp + randomBytes;
  }

  /**
   * 递归获取文件夹中的所有图片文件
   */
  static async getImageFiles(folderPath: string): Promise<string[]> {
    const imageFiles: string[] = [];

    try {
      const items = await fs.readdir(folderPath);

      for (const item of items) {
        const fullPath = path.join(folderPath, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          // 递归处理子文件夹
          const subImages = await this.getImageFiles(fullPath);
          imageFiles.push(...subImages);
        } else if (stat.isFile() && this.isImageFile(fullPath)) {
          imageFiles.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading folder ${folderPath}:`, error);
    }

    return imageFiles;
  }
}
