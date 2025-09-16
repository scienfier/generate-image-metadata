// src/index.ts
import * as path from "path";
import { ImageProcessor } from "./services/imageProcessor";
import { ProcessingConfig } from "./types";

async function main() {
  // 配置参数
  const config: ProcessingConfig = {
    inputFolder: process.argv[2] || "./images", // 从命令行参数获取，或使用默认值
    outputFile: "./output/image-metadata.json",
    basePath: "/uploads/68b024b484593fe1a374706e/products/main",
    uploadedBy: {
      name: "workingkyle",
      email: "",
      id: "68b024b484593fe1a374706e",
    },
  };

  try {
    console.log("Image Metadata Processor Starting...");
    console.log("Configuration:", {
      inputFolder: config.inputFolder,
      outputFile: config.outputFile,
      basePath: config.basePath,
    });

    // 创建处理器实例
    const processor = new ImageProcessor(config);

    // 处理文件夹
    const results = await processor.processFolder();

    // 保存结果
    await processor.saveResults(results);

    console.log("\n=== Processing Summary ===");
    console.log(`Total images processed: ${results.length}`);
    console.log(`Output file: ${config.outputFile}`);

    // 显示前几个结果作为示例
    if (results.length > 0) {
      console.log("\n=== Sample Results ===");
      console.log(JSON.stringify(results.slice(0, 2), null, 2));
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// 处理未捕获的异常
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// 运行主函数
main();
