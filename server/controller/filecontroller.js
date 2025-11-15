import File from "../models/Files.js";


export const createFile = async (req, res) => {
  try {
    const { roomId, name, content = "" } = req.body;
    const language = detectLanguageFromName(name);
    const file = await File.create({ roomId, name, content, language, owner: req.user.id });

    // emit to socket room so other collaborators can update UI
    try {
      const io = req.app.locals.io;
      if (io) io.to(`room-${roomId}`).emit(`file-created:${roomId}`, file);
    } catch (e) {
      console.error("Socket emit createFile failed", e.message);
    }

    return res.status(201).json(file);
  } catch (err) {
    console.error("createFile error:", err);
    return res.status(500).json({ message: err.message });
  }
};



export const getFilesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const files = await File.find({ roomId }).sort({ createdAt: 1 });
    return res.json(files);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.json(file);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!id) {
      return res.status(400).json({ message: "File id missing" });
    }

    // find file first (so we know roomId)
    const existing = await File.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "File not found" });
    }

    // Apply updates. Don't overwrite name/content with undefined.
    const updates = {};
    if (typeof content !== "undefined") updates.content = content;
    // if (typeof name !== "undefined") updates.name = name;
    updates.edited = true;
    updates.updatedAt = Date.now();

    const updated = await File.findByIdAndUpdate(id, updates, { new: true }).lean();
    console.log("File updated:", updated);
    // Emit socket event to room so other collaborators know about the update
    try {
      const io = req.app?.locals?.io;
      if (io && updated && updated.roomId) {
        io.to(`room-${updated.roomId}`).emit(`file-updated:${updated.roomId}`, updated);
      }
    } catch (emitErr) {
      console.error("Socket emit failed (updateFile):", emitErr?.message || emitErr);
    }

    return res.json(updated);
  } catch (err) {
    console.error("updateFile error:", err);
    return res.status(500).json({ message: "Server error updating file", error: err.message });
  }
};




export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
const file = await File.findById(id);
if(!file) return res.status(404).json({ message: "File not found" });
await File.findByIdAndDelete(id);
req.app.locals.io?.to(`room-${file.roomId}`).emit(`file-deleted:${file.roomId}`, id);
    return res.json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



// helper; add to same file or utils
function detectLanguageFromName(name = "") {
  const ext = name.split(".").pop().toLowerCase();
  const map = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    swift: "swift"
  };
  return map[ext] || "plaintext";
}
