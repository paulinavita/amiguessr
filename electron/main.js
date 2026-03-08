const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const isDev = process.env.ELECTRON_DEV === "1";

const DATA_DIR = () => path.join(app.getPath("userData"), "data");
const IMAGE_DIR = () => path.join(DATA_DIR(), "images");
const DATA_FILE = () => path.join(DATA_DIR(), "amiguessr_data.json");

async function ensureDataDirs() {
  await fs.mkdir(IMAGE_DIR(), { recursive: true });
}

function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!match) {
    throw new Error("Invalid data URL");
  }
  const mimeType = match[1];
  const base64Data = match[2];
  return { mimeType, base64Data };
}

function extFromMime(mimeType) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "bin";
}

async function toDataUrlFromFile(filePath) {
  const buf = await fs.readFile(filePath);
  const ext = path.extname(filePath).toLowerCase().replace(".", "");
  let mime;
  switch (ext) {
    case "jpg":
    case "jpeg":
      mime = "image/jpeg";
      break;
    case "png":
      mime = "image/png";
      break;
    case "webp":
      mime = "image/webp";
      break;
    default:
      mime = "application/octet-stream";
      break;
  }
  return `data:${mime};base64,${buf.toString("base64")}`;
}

async function saveJson(data) {
  await ensureDataDirs();
  await fs.writeFile(DATA_FILE(), JSON.stringify(data, null, 2), "utf-8");
}

async function loadJson() {
  try {
    const raw = await fs.readFile(DATA_FILE(), "utf-8");
    return JSON.parse(raw);
  } catch {
    return { pictures: [], gameSets: [] };
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    icon: path.join(__dirname, "..", "build", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "..", "out", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("appData:load", async () => {
  await ensureDataDirs();
  const stored = await loadJson();

  const pictures = await Promise.all(
    (stored.pictures || []).map(async (picture) => {
      const imageFileName = picture.imageFileName;
      if (!imageFileName) {
        return { ...picture, image: "" };
      }
      const filePath = path.join(IMAGE_DIR(), imageFileName);
      try {
        const image = await toDataUrlFromFile(filePath);
        return { ...picture, image };
      } catch {
        return { ...picture, image: "" };
      }
    }),
  );

  return {
    pictures,
    gameSets: stored.gameSets || [],
  };
});

ipcMain.handle("appData:save", async (_, payload) => {
  await ensureDataDirs();

  const pictures = (payload.pictures || []).map((p) => ({
    id: p.id,
    title: p.title,
    year: p.year,
    lat: p.lat,
    lng: p.lng,
    imageFileName: p.imageFileName || null,
  }));

  await saveJson({
    pictures,
    gameSets: payload.gameSets || [],
  });

  return { ok: true };
});

ipcMain.handle("appData:clear", async () => {
  await ensureDataDirs();
  await saveJson({ pictures: [], gameSets: [] });

  const files = await fs.readdir(IMAGE_DIR()).catch(() => []);
  await Promise.all(
    files.map((file) => fs.rm(path.join(IMAGE_DIR(), file), { force: true })),
  );

  return { ok: true };
});

ipcMain.handle("image:saveFromDataUrl", async (_, { dataUrl, pictureId }) => {
  await ensureDataDirs();

  const { mimeType, base64Data } = parseDataUrl(dataUrl);
  const ext = extFromMime(mimeType);
  const fileName = `${pictureId}_${Date.now()}.${ext}`;
  const filePath = path.join(IMAGE_DIR(), fileName);
  await fs.writeFile(filePath, Buffer.from(base64Data, "base64"));

  return { fileName };
});

ipcMain.handle("dialog:openJson", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const text = await fs.readFile(filePath, "utf-8");
  return { canceled: false, text };
});

ipcMain.handle("dialog:saveJson", async (_, jsonText) => {
  const result = await dialog.showSaveDialog({
    defaultPath: "amiguessr_data.json",
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  await fs.writeFile(result.filePath, jsonText, "utf-8");
  return { canceled: false };
});
