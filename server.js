import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import { query } from "./db-connector.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// ===================== 헬스체크 =====================
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ===================== Nookipedia 프록시 =====================
app.get("/api/villagers", async (req, res) => {
  try {
    const response = await axios.get("https://api.nookipedia.com/villagers", {
      headers: {
        "X-API-KEY": process.env.NOOKIPEDIA_API_KEY,
        "Accept-Version": "1.0.0",
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("프록시 서버 에러:", err.response?.data || err.message);
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
});

// ===================== 이미지 프록시 =====================
app.get(/^\/image-proxy\/(.+)/, async (req, res) => {
  const imgPath = req.params[0];
  const imageUrl = `https://dodo.ac/np/images/${imgPath}`;

  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
    });

    res.set("Content-Type", response.headers["content-type"]);
    res.send(response.data);
  } catch (err) {
    console.error("이미지 로드 실패:", err.message);
    res.status(500).send("이미지 로드 실패");
  }
});

// ===================== 사진 업로드 =====================
app.post("/upload", async (req, res) => {
  try {
    const { image, character } = req.body;

    if (!image || !character) {
      return res.status(400).json({
        success: false,
        message: "이미지 또는 캐릭터 이름이 없습니다.",
      });
    }

    const base64 = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64, "base64");

    let finalBuffer = imageBuffer;
    let usedSharp = false;

    try {
      const sharpModule = await import("sharp");
      const sharp = sharpModule.default || sharpModule;

      const img = sharp(imageBuffer);
      const meta = await img.metadata();

      if (meta?.width && meta?.height) {
        const cropWidth = Math.floor(meta.width * 0.5);

        console.log(
          `[CROP] ${meta.width}x${meta.height} → ${cropWidth}x${meta.height}`,
        );

        finalBuffer = await img
          .extract({
            left: 0,
            top: 0,
            width: cropWidth,
            height: meta.height,
          })
          .png()
          .toBuffer();

        usedSharp = true;
      }
    } catch (e) {
      console.warn("sharp 처리 실패, 원본 사용:", e.message);
    }

    // Cloudinary 업로드
    const result = await cloudinary.uploader.upload(
      `data:image/png;base64,${finalBuffer.toString("base64")}`,
      {
        folder: "animal-acrossing",
      },
    );

    const url = result.secure_url;

    await query(
      "INSERT INTO photos (url, character_name, created_at) VALUES (?, ?, NOW())",
      [url, character],
    );

    console.log("[UPLOAD] Cloudinary 저장 완료:", url);

    res.json({
      success: true,
      url,
      character,
      cropped: usedSharp,
    });
  } catch (err) {
    console.error("업로드 처리 중 오류:", err);

    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다.",
    });
  }
});

// ===================== 사진 삭제 =====================
app.delete("/photos/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "유효한 id가 필요합니다.",
    });
  }

  try {
    const result = await query("DELETE FROM photos WHERE id = ?", [id]);

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    console.error("삭제 실패:", err);

    res.status(500).json({
      success: false,
      message: "삭제 중 오류가 발생했습니다.",
    });
  }
});

// ===================== 갤러리 조회 =====================
app.get("/photos", async (req, res) => {
  try {
    const rows = await query(
      `
      SELECT
        id,
        url AS imageUrl,
        character_name AS characterName,
        created_at AS createdAt
      FROM photos
      ORDER BY created_at DESC
      `,
    );

    res.json(rows);
  } catch (error) {
    console.error("DB 조회 실패:", error);

    res.status(500).json({
      success: false,
      message: "데이터 조회 중 오류가 발생했습니다.",
    });
  }
});

// ===================== 서버 실행 =====================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ 서버 실행 중 : ${PORT}`);
});
