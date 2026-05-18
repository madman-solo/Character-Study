// 运行方式：node scripts/convert-whisper.js
// 将 whisper-output/*.json 转换为 seed 可用的 sentences 格式，并打印映射关系

const fs = require("fs");
const path = require("path");

const inputDir = path.join(__dirname, "whisper-output");
const outputDir = path.join(__dirname, "sentences-output");
fs.mkdirSync(outputDir, { recursive: true });

// 音频文件名 → seed 中的 title 映射（按实际文件名填写）
const fileToTitle = {
  "APriceless_Bible_Returns_to.json": "A Priceless Bible Returns to Its Longtime Home in Switzerland",
  "Wilbur_and_Orville_Wright.json": "Wilbur and Orville Wright: The First Airplane",
  "Llama_at_Childrens_Camp.json": "Llama at Children's Camp Recognized as Oldest in Captivity",
  "In_Kenya_High_Altitude_Town.json": "In Kenya, High-Altitude Town Serves Champion Runners",
  "Growing_Number_of_Birdwatchers.json": "Growing Number of Birdwatchers Find Joy in Smart Bird Feeders",
  "New_York_Yankees.json": "New York Yankees Can Now Grow Beards",
  "Private_Moon.json": "Private Moon Missions Include Hits and Misses",
  "Researchers.json": "Researchers Use New Methods to Date Ancient Skeleton",
  "Discovery.json": "Discovery Provides New Details on Early Use of Bone Tools",
};

const files = fs.readdirSync(inputDir).filter((f) => f.endsWith(".json"));

for (const file of files) {
  const raw = JSON.parse(fs.readFileSync(path.join(inputDir, file), "utf-8"));

  // 提取 segments，只保留 start/end/text
  const sentences = raw.segments.map((seg) => ({
    start: Math.round(seg.start * 100) / 100,
    end: Math.round(seg.end * 100) / 100,
    text: seg.text.trim(),
  }));

  const outFile = file.replace(".json", "-sentences.json");
  fs.writeFileSync(
    path.join(outputDir, outFile),
    JSON.stringify(sentences, null, 2),
    "utf-8"
  );

  const title = fileToTitle[file] || file;
  console.log(`✓ ${file} → ${sentences.length} sentences`);
  console.log(`  Title: "${title}"`);
  console.log(`  Output: sentences-output/${outFile}\n`);
}

console.log("全部转换完成！sentences-output/ 目录下查看结果。");
