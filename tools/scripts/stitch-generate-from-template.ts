#!/usr/bin/env tsx

/**
 * Stitch Generate From Template Script
 * 
 * Generate component từ template (đã convert) để reuse
 * 
 * Usage:
 *   npm run stitch:generate <target-page> --from <source-page>
 * 
 * Example:
 *   npm run stitch:generate user_login_page_2 --from user_login_page_1
 */

import * as fs from "fs";
import * as path from "path";

const OUTPUT_FOLDER = "src/components/stitch";

/**
 * Convert folder name to component name
 */
function folderToComponentName(folder: string): string {
  return folder
    .replace(/_/g, "-")
    .replace(/[()]/g, "")
    .toLowerCase();
}

/**
 * Convert folder name to PascalCase component name
 */
function folderToPascalCase(folder: string): string {
  return folder
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Generate component from template
 */
function generateFromTemplate(sourcePage: string, targetPage: string): void {
  const sourceFileName = folderToComponentName(sourcePage);
  const targetFileName = folderToComponentName(targetPage);
  const sourceComponentName = folderToPascalCase(sourcePage);
  const targetComponentName = folderToPascalCase(targetPage);

  const sourceFile = path.join(OUTPUT_FOLDER, `${sourceFileName}.tsx`);
  const targetFile = path.join(OUTPUT_FOLDER, `${targetFileName}.tsx`);

  // Check source file exists
  if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Source file không tồn tại: ${sourceFile}`);
    console.log(`\n💡 Hãy convert source page trước:`);
    console.log(`   npm run stitch:prepare ${sourcePage}`);
    process.exit(1);
  }

  // Check target file doesn't exist
  if (fs.existsSync(targetFile)) {
    console.error(`❌ Target file đã tồn tại: ${targetFile}`);
    console.log(`\n💡 Nếu muốn overwrite, hãy xóa file trước.`);
    process.exit(1);
  }

  // Read source file
  let content = fs.readFileSync(sourceFile, "utf-8");

  // Replace component name
  content = content.replace(
    new RegExp(`export default function ${sourceComponentName}`, "g"),
    `export default function ${targetComponentName}`
  );

  content = content.replace(
    new RegExp(`function ${sourceComponentName}`, "g"),
    `function ${targetComponentName}`
  );

  // Replace in comments
  content = content.replace(
    new RegExp(sourceComponentName, "g"),
    targetComponentName
  );

  // Add comment at top
  const headerComment = `/**
 * ${targetComponentName}
 * 
 * Generated from template: ${sourceComponentName}
 * 
 * TODO: Review and adjust:
 * - Component-specific styling
 * - Props and interfaces
 * - Content differences
 * 
 * Location: ${targetFile}
 */
`;

  content = headerComment + content;

  // Write target file
  fs.writeFileSync(targetFile, content, "utf-8");

  console.log(`✅ Đã generate component từ template!`);
  console.log(`📁 Source: ${sourceFile}`);
  console.log(`📁 Target: ${targetFile}`);
  console.log(`📝 Component: ${sourceComponentName} → ${targetComponentName}`);
  console.log(`\n🚀 Bước tiếp theo:`);
  console.log(`   1. Mở file ${targetFile}`);
  console.log(`   2. Review và adjust styling/content nếu cần`);
  console.log(`   3. Test component`);
  console.log(`   4. Commit khi hoàn thành`);
}

// CLI
const args = process.argv.slice(2);
const targetIndex = args.findIndex(arg => !arg.startsWith("--"));
const fromIndex = args.findIndex(arg => arg === "--from");

if (targetIndex === -1) {
  console.error("❌ Vui lòng cung cấp target page name");
  console.log("\nUsage:");
  console.log("  npm run stitch:generate <target-page> --from <source-page>");
  console.log("\nExample:");
  console.log("  npm run stitch:generate user_login_page_2 --from user_login_page_1");
  process.exit(1);
}

if (fromIndex === -1 || fromIndex === args.length - 1) {
  console.error("❌ Vui lòng cung cấp source page name với --from");
  console.log("\nUsage:");
  console.log("  npm run stitch:generate <target-page> --from <source-page>");
  process.exit(1);
}

const targetPage = args[targetIndex];
const sourcePage = args[fromIndex + 1];

generateFromTemplate(sourcePage, targetPage);



