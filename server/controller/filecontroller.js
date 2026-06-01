import File from "../models/Files.js";


export const createFile = async (req, res) => {
  try {
    const { roomId, name, content = "",parentId=null,type="file" } = req.body;
    const language = detectLanguageFromName(name);
    const file = await File.create({ roomId, name,language, owner: req.user.id,parentId,type,content:type==="file"?content:""});

  
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

export const createFolder = async (req,res)=>{
  try{
    const {roomId,name,parentId=null}=req.body;
    const folder=await File.create({roomId,name,type:"folder",owner:req.user.id,parentId});
    req.app.locals.io?.to(`room-${roomId}`).emit(`file-created:${roomId}`, folder);
    return  res.status(201).json(folder);
  }catch(err){
    console.error("createFolder error:", err);
    return res.status(500).json({ message: err.message });
  }
}




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

    
    const existing = await File.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "File not found" });
    }


    const updates = {};
    if (typeof content !== "undefined") updates.content = content;
    updates.edited = true;
    updates.updatedAt = Date.now();

    const updated = await File.findByIdAndUpdate(id, updates, { new: true }).lean();
    console.log("File updated:");
    
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
