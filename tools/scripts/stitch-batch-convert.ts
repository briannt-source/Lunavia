#!/usr/bin/env tsx

/**
 * Stitch Batch Convert Script
 * 
 * Tự động hóa quy trình convert nhiều pages từ Stitch
 * 
 * Usage:
 *   npm run stitch:list                    # List tất cả pages cần convert
 *   npm run stitch:prepare <page-name>     # Prepare một page để convert
 *   npm run stitch:batch <category>         # Batch prepare theo category
 *   npm run stitch:similar                 # Tìm pages tương tự để reuse
 *   npm run stitch:report                  # Generate conversion report
 */

import * as fs from "fs";
import * as path from "path";

const STITCH_FOLDER = "stitch_lunavia_welcome_page";
const TEMP_INPUT_FILE = "temp/stitch-input.html";
const OUTPUT_FOLDER = "src/components/stitch";

interface PageInfo {
  name: string;
  folder: string;
  codeFile: string;
  screenFile: string;
  converted: boolean;
  category?: string;
}

// Categories mapping
const CATEGORIES: Record<string, string[]> = {
  "welcome": ["lunavia_welcome_page"],
  "auth": [
    "user_login_page_1",
    "user_login_page_2",
    "user_login_page_3",
    "user_login_page_4",
    "user_login_page_5",
    "user_login_page_6",
    "user_login_page_7",
    "user_login_page_8",
    "user_login_page_9",
    "user_login_page_10",
    "user_registration_page",
  ],
  "ai": [
    "ai_analytics_dashboard",
    "ai_chat_assistant_interface",
    "ai_guide_matching_page",
    "ai_itinerary_generation_page",
  ],
  "tours": [
    "browse_tours_page_(guide_view)_",
    "tour_details_&_apply_(guide_view)_page",
    "edit_tour_page",
    "my_tours_(participating)_page_(guide_view)_",
  ],
  "applications": [
    "application_management_overview",
    "application_details_&_guide_profile",
    "my_applications_page_(guide_view)_",
    "my_assignments_page_(guide_view)_",
  ],
  "company": [
    "company_profile_&_management",
    "invite_guide_to_company",
    "pending_guide_join_requests_1",
    "pending_guide_join_requests_2",
  ],
  "reports": [
    "submit_tour_report_page",
    "approve_payment_request_from_report",
  ],
  "emergency": [
    "emergency_management_page",
    "emergency_sos_report_page_1",
    "emergency_sos_report_page_2",
    "emergency_sos_report_page_3",
    "emergency_sos_report_page_4",
  ],
  "admin": [
    "user_management_page_(admin_view)__1",
    "user_management_page_(admin_view)__2",
    "user_management_page_(admin_view)__3",
    "user_management_page_(admin_view)__4",
    "user_management_page_(admin_view)__5",
    "user_management_page_(admin_view)__6",
    "user_management_page_(admin_view)__7",
    "user_management_page_(admin_view)__8",
    "verification_management_overview",
    "verification_details_&_approval",
    "verification_submission_page",
    "wallet_requests_management_page",
  ],
  "other": [
    "settings_page",
    "faq_page",
    "conversation_list_page_1",
    "conversation_list_page_2",
    "create_contract_page",
    "view_&_accept_contract_page",
  ],
};

// Similar pages groups (for reuse)
const SIMILAR_GROUPS: Record<string, string[]> = {
  "login_pages": [
    "user_login_page_1",
    "user_login_page_2",
    "user_login_page_3",
    "user_login_page_4",
    "user_login_page_5",
    "user_login_page_6",
    "user_login_page_7",
    "user_login_page_8",
    "user_login_page_9",
    "user_login_page_10",
  ],
  "admin_user_management": [
    "user_management_page_(admin_view)__1",
    "user_management_page_(admin_view)__2",
    "user_management_page_(admin_view)__3",
    "user_management_page_(admin_view)__4",
    "user_management_page_(admin_view)__5",
    "user_management_page_(admin_view)__6",
    "user_management_page_(admin_view)__7",
    "user_management_page_(admin_view)__8",
  ],
  "emergency_sos": [
    "emergency_sos_report_page_1",
    "emergency_sos_report_page_2",
    "emergency_sos_report_page_3",
    "emergency_sos_report_page_4",
  ],
  "conversation_list": [
    "conversation_list_page_1",
    "conversation_list_page_2",
  ],
  "pending_join_requests": [
    "pending_guide_join_requests_1",
    "pending_guide_join_requests_2",
  ],
};

/**
 * List tất cả pages từ Stitch folder
 */
export function listAllPages(): PageInfo[] {
  const stitchPath = path.join(process.cwd(), STITCH_FOLDER);
  
  if (!fs.existsSync(stitchPath)) {
    console.error(`❌ Folder ${STITCH_FOLDER} không tồn tại!`);
    process.exit(1);
  }

  const folders = fs.readdirSync(stitchPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const pages: PageInfo[] = [];

  for (const folder of folders) {
    const folderPath = path.join(stitchPath, folder);
    const codeFile = path.join(folderPath, "code.html");
    const screenFile = path.join(folderPath, "screen.png");
    const componentName = folderToComponentName(folder);
    const componentFile = path.join(
      OUTPUT_FOLDER,
      `${componentName}.tsx`
    );

    // Find category
    let category = "other";
    for (const [cat, pages] of Object.entries(CATEGORIES)) {
      if (pages.includes(folder)) {
        category = cat;
        break;
      }
    }

    pages.push({
      name: folder,
      folder: folderPath,
      codeFile,
      screenFile,
      converted: fs.existsSync(componentFile),
      category,
    });
  }

  return pages.sort((a, b) => {
    if (a.converted && !b.converted) return 1;
    if (!a.converted && b.converted) return -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Convert folder name to component name
 * Example: "lunavia_welcome_page" -> "lunavia-welcome-page"
 */
function folderToComponentName(folder: string): string {
  return folder
    .replace(/_/g, "-")
    .replace(/[()]/g, "")
    .toLowerCase();
}

/**
 * Convert folder name to PascalCase component name
 * Example: "lunavia_welcome_page" -> "LunaviaWelcomePage"
 */
function folderToPascalCase(folder: string): string {
  return folder
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

/**
 * Prepare một page để convert
 */
export function preparePage(pageName: string): void {
  const pages = listAllPages();
  const page = pages.find(p => p.name === pageName || p.name.includes(pageName));

  if (!page) {
    console.error(`❌ Không tìm thấy page: ${pageName}`);
    console.log("\n📋 Danh sách pages có sẵn:");
    pages.forEach(p => console.log(`  - ${p.name}`));
    process.exit(1);
  }

  if (!fs.existsSync(page.codeFile)) {
    console.error(`❌ File không tồn tại: ${page.codeFile}`);
    process.exit(1);
  }

  // Ensure temp folder exists
  const tempDir = path.dirname(TEMP_INPUT_FILE);
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // Copy code.html to temp/stitch-input.html
  const codeContent = fs.readFileSync(page.codeFile, "utf-8");
  fs.writeFileSync(TEMP_INPUT_FILE, codeContent, "utf-8");

  console.log(`✅ Đã prepare page: ${page.name}`);
  console.log(`📁 Code đã copy vào: ${TEMP_INPUT_FILE}`);
  console.log(`\n📝 Component name đề xuất: ${folderToPascalCase(page.name)}`);
  console.log(`📁 File output đề xuất: ${OUTPUT_FOLDER}/${folderToComponentName(page.name)}.tsx`);
  console.log(`\n🚀 Bước tiếp theo:`);
  console.log(`   1. Mở file ${TEMP_INPUT_FILE} trong Cursor`);
  console.log(`   2. Select All (Ctrl+A)`);
  console.log(`   3. Mở Cursor AI Chat (Ctrl+L)`);
  console.log(`   4. Dùng prompt từ: temp/STITCH_PROMPT_TEMPLATE.md`);
}

/**
 * Batch prepare nhiều pages theo category
 */
export function batchPrepareCategory(category: string): void {
  const pages = listAllPages();
  const categoryPages = CATEGORIES[category];

  if (!categoryPages) {
    console.error(`❌ Category không tồn tại: ${category}`);
    console.log("\n📋 Categories có sẵn:");
    Object.keys(CATEGORIES).forEach(cat => {
      const count = CATEGORIES[cat].length;
      console.log(`  - ${cat} (${count} pages)`);
    });
    process.exit(1);
  }

  const pagesToPrepare = pages.filter(p => categoryPages.includes(p.name) && !p.converted);

  if (pagesToPrepare.length === 0) {
    console.log(`✅ Tất cả pages trong category "${category}" đã được convert!`);
    return;
  }

  console.log(`\n📦 Batch Prepare Category: ${category}`);
  console.log(`📊 Tổng số pages: ${pagesToPrepare.length}\n`);

  // Create batch file
  const batchFile = `temp/batch-${category}.txt`;
  const batchContent = pagesToPrepare.map(p => {
    const componentName = folderToPascalCase(p.name);
    const fileName = folderToComponentName(p.name);
    return `${p.name}|${componentName}|${fileName}`;
  }).join("\n");

  fs.writeFileSync(batchFile, batchContent, "utf-8");

  console.log(`📝 Đã tạo batch file: ${batchFile}`);
  console.log(`\n📋 Pages cần convert:\n`);
  pagesToPrepare.forEach((p, index) => {
    console.log(`${index + 1}. ${p.name}`);
    console.log(`   Component: ${folderToPascalCase(p.name)}`);
    console.log(`   File: ${OUTPUT_FOLDER}/${folderToComponentName(p.name)}.tsx\n`);
  });

  console.log(`\n🚀 Workflow:`);
  console.log(`   1. Chạy: npm run stitch:prepare <page-name>`);
  console.log(`   2. Convert với Cursor AI`);
  console.log(`   3. Lưu component`);
  console.log(`   4. Lặp lại cho page tiếp theo\n`);
  console.log(`💡 Tip: Prepare page đầu tiên để tạo template, sau đó reuse cho các pages tương tự!`);
}

/**
 * Tìm pages tương tự để reuse components
 */
export function findSimilarPages(): void {
  console.log("\n🔍 Tìm Pages Tương Tự Để Reuse Components\n");

  for (const [groupName, pageNames] of Object.entries(SIMILAR_GROUPS)) {
    const pages = listAllPages();
    const groupPages = pages.filter(p => pageNames.includes(p.name));
    const converted = groupPages.filter(p => p.converted);
    const remaining = groupPages.filter(p => !p.converted);

    console.log(`\n📦 ${groupName.toUpperCase().replace(/_/g, " ")}`);
    console.log(`   Total: ${groupPages.length} pages`);
    console.log(`   ✅ Converted: ${converted.length}`);
    console.log(`   ⏳ Remaining: ${remaining.length}`);

    if (converted.length > 0) {
      console.log(`\n   ✅ Đã convert (có thể reuse):`);
      converted.forEach(p => {
        const componentName = folderToPascalCase(p.name);
        console.log(`      - ${p.name} → ${componentName}`);
      });
    }

    if (remaining.length > 0) {
      console.log(`\n   ⏳ Chưa convert (nên reuse từ page đã convert):`);
      remaining.forEach(p => {
        console.log(`      - ${p.name}`);
      });

      if (converted.length > 0) {
        const templatePage = converted[0];
        console.log(`\n   💡 Strategy:`);
        console.log(`      1. Xem component: ${folderToPascalCase(templatePage.name)}`);
        console.log(`      2. Copy và modify cho các pages còn lại`);
        console.log(`      3. Chỉ cần thay đổi content, giữ nguyên structure`);
      }
    }
  }

  console.log(`\n\n📝 Reuse Strategy:`);
  console.log(`   1. Convert 1-2 pages đầu tiên trong mỗi group`);
  console.log(`   2. Tách reusable components (nếu có)`);
  console.log(`   3. Copy và modify cho các pages còn lại`);
  console.log(`   4. Chỉ thay đổi content, giữ nguyên structure & styling`);
}

/**
 * List pages theo category
 */
export function listByCategory(): void {
  const pages = listAllPages();
  const byCategory: Record<string, PageInfo[]> = {};

  pages.forEach(page => {
    const cat = page.category || "other";
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(page);
  });

  console.log("\n📊 Pages Theo Category:\n");

  for (const [category, categoryPages] of Object.entries(byCategory)) {
    const converted = categoryPages.filter(p => p.converted).length;
    const total = categoryPages.length;
    const percentage = ((converted / total) * 100).toFixed(1);

    console.log(`\n📦 ${category.toUpperCase()} (${converted}/${total} - ${percentage}%)`);
    categoryPages.forEach(p => {
      const status = p.converted ? "✅" : "⏳";
      console.log(`   ${status} ${p.name}`);
    });
  }
}

/**
 * Generate report về tất cả pages
 */
export function generateReport(): void {
  const pages = listAllPages();
  const converted = pages.filter(p => p.converted).length;
  const remaining = pages.length - converted;

  console.log("\n📊 STITCH CONVERSION REPORT\n");
  console.log(`Total pages: ${pages.length}`);
  console.log(`✅ Converted: ${converted}`);
  console.log(`⏳ Remaining: ${remaining}`);
  console.log(`📈 Progress: ${((converted / pages.length) * 100).toFixed(1)}%\n`);

  // Group by category
  const byCategory: Record<string, PageInfo[]> = {};
  pages.forEach(page => {
    const cat = page.category || "other";
    if (!byCategory[cat]) {
      byCategory[cat] = [];
    }
    byCategory[cat].push(page);
  });

  console.log("📊 By Category:\n");
  for (const [category, categoryPages] of Object.entries(byCategory)) {
    const converted = categoryPages.filter(p => p.converted).length;
    const total = categoryPages.length;
    const percentage = ((converted / total) * 100).toFixed(1);
    console.log(`  ${category}: ${converted}/${total} (${percentage}%)`);
  }

  // Group by status
  const convertedPages = pages.filter(p => p.converted);
  const remainingPages = pages.filter(p => !p.converted);

  // Save report to file
  const reportPath = "temp/stitch-conversion-report.md";
  const reportContent = `# Stitch Conversion Report

Generated: ${new Date().toISOString()}

## Summary
- Total: ${pages.length}
- Converted: ${converted}
- Remaining: ${remaining}
- Progress: ${((converted / pages.length) * 100).toFixed(1)}%

## By Category

${Object.entries(byCategory).map(([cat, catPages]) => {
  const conv = catPages.filter(p => p.converted).length;
  const total = catPages.length;
  return `### ${cat.toUpperCase()}\n- Converted: ${conv}/${total} (${((conv / total) * 100).toFixed(1)}%)\n`;
}).join("\n")}

## Converted Pages
${convertedPages.map(p => `- [x] ${p.name} (${p.category})`).join("\n")}

## Remaining Pages
${remainingPages.map(p => `- [ ] ${p.name} (${p.category})`).join("\n")}
`;

  fs.writeFileSync(reportPath, reportContent, "utf-8");
  console.log(`\n📄 Report đã lưu vào: ${reportPath}`);
}

// CLI Commands
const command = process.argv[2];
const arg = process.argv[3];

if (command === "list") {
  const pages = listAllPages();
  console.log("\n📋 Tất cả pages từ Stitch:\n");
  pages.forEach((page, index) => {
    const status = page.converted ? "✅" : "⏳";
    console.log(`${index + 1}. ${status} ${page.name} [${page.category}]`);
  });
  console.log(`\nTotal: ${pages.length} pages`);
} else if (command === "prepare") {
  if (!arg) {
    console.error("❌ Vui lòng cung cấp page name");
    console.log("Usage: npm run stitch:prepare <page-name>");
    process.exit(1);
  }
  preparePage(arg);
} else if (command === "batch") {
  if (!arg) {
    console.error("❌ Vui lòng cung cấp category");
    console.log("\n📋 Categories có sẵn:");
    Object.keys(CATEGORIES).forEach(cat => {
      const count = CATEGORIES[cat].length;
      console.log(`  - ${cat} (${count} pages)`);
    });
    process.exit(1);
  }
  batchPrepareCategory(arg);
} else if (command === "similar") {
  findSimilarPages();
} else if (command === "categories") {
  listByCategory();
} else if (command === "report") {
  generateReport();
} else {
  console.log(`
📦 Stitch Batch Convert Script

Usage:
  npm run stitch:list                    # List tất cả pages
  npm run stitch:categories               # List pages theo category
  npm run stitch:prepare <page-name>      # Prepare một page để convert
  npm run stitch:batch <category>         # Batch prepare theo category
  npm run stitch:similar                  # Tìm pages tương tự để reuse
  npm run stitch:report                   # Generate conversion report

Categories:
${Object.keys(CATEGORIES).map(cat => `  - ${cat} (${CATEGORIES[cat].length} pages)`).join("\n")}

Examples:
  npm run stitch:list
  npm run stitch:categories
  npm run stitch:batch auth
  npm run stitch:prepare user_login_page_1
  npm run stitch:similar
  npm run stitch:report
`);
}
