const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//确保上传目录存在
const uploadDir = path.join(__dirname, "../public/uploads/characters");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
//multer配置：存到本地
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  //对象里面的属性之间，必须用逗号 , 分隔，不能用分号 ;
  // 分号是用来结束整行代码的，不是对象内部用的。
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  }, //5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("只允许上传图片"));
  },
});

//POST/api/upload/character-bg
router.post("/character-bg", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "没有收到文件" });
  //返回可访问的路径
  res.json({ url: `/uploads/characters/${req.file.filename}` });
});
module.exports = router;
