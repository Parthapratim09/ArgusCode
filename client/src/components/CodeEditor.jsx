import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import api from "../api/axios.js"; // your axios wrapper
import { Button, Select, MenuItem, Typography } from "@mui/material";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";
import * as monaco from "monaco-editor";


export default function CodeEditor({ file, onSaved }) {
  const [language, setLanguage] = useState("javascript");
  const [status, setStatus] = useState("idle"); 
  const [isDirty, setIsDirty] = useState(false);
  const [editorReady, setEditorReady] = useState(false);

  // Monaco refs
  const editorRef = useRef(null);
  const modelRef = useRef(null);

  // Yjs refs
  const bindingRef = useRef(null);
  const yjsConnectionsRef = useRef(new Map());

  // Save lock & debounce
  const savingRef = useRef(false);
  const dirtyDebounceRef = useRef(null);
  const autosaveRef = useRef(null);
  
  // Ref to track isDirty state
  const isDirtyRef = useRef(isDirty);

  const useYjs = import.meta.env.VITE_USE_YJS === "true";
  const yjsUrl = import.meta.env.VITE_YJS_WEBSOCKET_URL;
  const AUTO_SAVE_INTERVAL_MS = 10000;

  // --- NEW: Refs for stale props ---
  const fileRef = useRef(file);
  const onSavedRef = useRef(onSaved);
  const useYjsRef = useRef(useYjs);

  // --- NEW: Effect to keep refs in sync ---
  useEffect(() => {
    fileRef.current = file;
    onSavedRef.current = onSaved;
    useYjsRef.current = useYjs;
  }, [file, onSaved, useYjs]);

  const extToLang = {
    py: "python", js: "javascript", ts: "typescript", java: "java",
    cpp: "cpp", c: "c", cs: "csharp", php: "php", rb: "ruby",
    go: "go", rs: "rust", swift: "swift", txt: "plaintext", json: "json"
  };

  function detectLanguageFromName(name = "") {
    const ext = (name?.split(".").pop() || "").toLowerCase();
    return extToLang[ext] || "plaintext";
  }

  function cleanupBinding() {
    try {
      if (bindingRef.current) {
        console.log("Destroying binding");
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    } catch (e) {
      console.warn("binding cleanup error", e);
    }
  }

  function readEditorContent() {
    try {
      if (editorRef.current) return editorRef.current.getValue();
      if (modelRef.current) return modelRef.current.getValue();
      return "";
    } catch (err) {
      console.error("readEditorContent err", err);
      return "";
    }
  }

  // This useEffect (for file switching) remains unchanged
  useEffect(() => {
    cleanupBinding();
    if (!editorReady || !modelRef.current) {
      return;
    }
    if (!file) {
      setLanguage("javascript");
      modelRef.current.setValue("// Select a file from the left\n");
      setIsDirty(false);
      return;
    }
    const detected = detectLanguageFromName(file.name);
    setLanguage(detected);
    if (!useYjs) {
      (async () => {
        let content = file.content;
        if (typeof content === "undefined" || content === null) {
          try {
            const res = await api.get(`/files/${file._id}`);
            content = res.data?.content ?? res.data ?? "";
            if (typeof content === "object") content = content.content ?? "";
          } catch (err) {
            console.error("Failed to fetch file content", err);
            content = "";
          }
        }
        monaco.editor.setModelLanguage(modelRef.current, detected);
        modelRef.current.setValue(content || "");
        setIsDirty(false);
      })();
      return;
    }
    (async () => {
      let content = file.content;
      const fileId = file._id;
      const room = `file-${fileId}`;
      let connection;
      if (yjsConnectionsRef.current.has(fileId)) {
        connection = yjsConnectionsRef.current.get(fileId);
        if (!connection.provider.shouldConnect) {
           connection.provider.connect();
        }
      } else {
        const doc = new Y.Doc();
        const provider = new WebsocketProvider(yjsUrl, room, doc);
        const ytext = doc.getText("monaco");
        connection = { doc, provider, ytext };
        yjsConnectionsRef.current.set(fileId, connection);
        if (typeof content === "undefined" || content === null) {
          try {
            const res = await api.get(`/files/${file._id}`);
            content = res.data?.content ?? res.data ?? "";
            if (typeof content === "object") content = content.content ?? "";
          } catch (err) {
            console.error("Failed to fetch file content", err); content = "";
          }
        }
        provider.on('sync', (isSynced) => {
          if (isSynced && ytext.length === 0 && content) {
            console.log(`Applying initial server content to ${room}`);
            ytext.insert(0, content);
          }
        });
      }
      const { ytext, provider } = connection;
      monaco.editor.setModelLanguage(modelRef.current, detected);
      const currentModelValue = modelRef.current.getValue();
      const ydocValue = ytext.toString();
      if (currentModelValue !== ydocValue) {
        modelRef.current.setValue(ydocValue);
      }
      bindingRef.current = new MonacoBinding(
        ytext,
        modelRef.current,
        new Set([editorRef.current]),
        provider.awareness
      );
      setIsDirty(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, editorReady, useYjs, yjsUrl]);

  // handleEditorDidMount remains unchanged
  function handleEditorDidMount(editor, monacoInstance) {
    editorRef.current = editor;
    modelRef.current = editor.getModel();
    const lang = detectLanguageFromName(file?.name || "") || language;
    if (modelRef.current) {
      monaco.editor.setModelLanguage(modelRef.current, lang);
    }
    if (!useYjs && file?.content !== undefined) {
      try {
        modelRef.current.setValue(file.content ?? "");
      } catch (e) {}
    }
    editor.onDidChangeModelContent(() => {
      if (dirtyDebounceRef.current) clearTimeout(dirtyDebounceRef.current);
      dirtyDebounceRef.current = setTimeout(() => setIsDirty(true), 200);
    });
    startAutosave();
    setEditorReady(true);
  }

  // ---------- Save (NOW USES REFS) ----------
  async function handleSave() {
    const currentFile = fileRef.current;
    
    if (!currentFile || !currentFile._id) { 
      alert("No file selected to save.");
      return;
    }
    if (savingRef.current) {
      console.log("Save already in progress; skipping.");
      return;
    }
    savingRef.current = true;
    setStatus("saving");

    try {
      const content = readEditorContent();
      const res = await api.put(`/files/${currentFile._id}`, { content }); 
      const saved = res.data;

      if (!useYjsRef.current && modelRef.current) { 
        try {
          const srvContent = saved?.content ?? content;
          modelRef.current.setValue(srvContent);
        } catch (err) {
          console.warn("Failed to apply server content to model:", err);
        }
      }

      setIsDirty(false);
      setStatus("saved");
      onSavedRef.current && onSavedRef.current(saved); 
  
      setTimeout(() => setStatus("idle"), 700);
      return saved;
    } catch (err) {
      console.error("Save failed:", err);
      alert(`Save failed: ${err?.response?.data?.message || err.message}`);
      setStatus("idle");
    } finally {
      savingRef.current = false;
    }
  }

  // startAutosave remains unchanged
  function startAutosave() {
    clearInterval(autosaveRef.current);
    autosaveRef.current = setInterval(() => {
      if (isDirtyRef.current && !savingRef.current) {
        handleSave().catch(() => {});
      }
    }, AUTO_SAVE_INTERVAL_MS);
  }

  // isDirtyRef effect remains unchanged
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // Unmount cleanup remains unchanged
  useEffect(() => {
    return () => {
      clearInterval(autosaveRef.current);
      if (dirtyDebounceRef.current) clearTimeout(dirtyDebounceRef.current);
      if (isDirtyRef.current && !savingRef.current) {
        handleSave().catch(() => {});
      }
      cleanupBinding(); 
      yjsConnectionsRef.current.forEach((conn) => {
        try { conn.provider.disconnect(); } catch (e) {}
        try { conn.provider.destroy(); } catch (e) {}
        try { conn.doc.destroy(); } catch (e) {}
      });
      yjsConnectionsRef.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // runCode remains unchanged
  const [output, setOutput] = useState("Output will appear here...");
  const runCode = async () => {
    setOutput("⏳ Running code...");
    try {
      const langMap = {
        "javascript": 93, "python": 71, "c": 50, "cpp": 54, "java": 62
      }
      const langId = langMap[language] || 93;
      const payload = {
        language_id: langId,
        source_code: readEditorContent(),
        stdin: "",
      };
      const res = await api.post("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true", payload, {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": import.meta.env.VITE_RAPID_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      });
      const result = res.data;
      if (result.status?.id === 3) {
        setOutput(result.stdout || "Code executed (no output)");
      } else if (result.status?.id === 6) {
        setOutput(` Compilation Error:\n${result.compile_output}`);
      } else if (result.status?.id > 3) {
         setOutput(` ${result.status.description}:\n${result.stderr || ""}`);
      } else {
         setOutput(result.stdout || result.stderr || "No output");
      }
    } catch (err) {
      console.error(err)
      setOutput(`Error: ${err?.response?.data?.message || err.message}`);
    }
  };

  // handleLanguageChange remains unchanged
  function handleLanguageChange(e) {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (modelRef.current) {
      monaco.editor.setModelLanguage(modelRef.current, newLang);
    }
  }

  // JSX return remains unchanged
  return (
    <div className="flex flex-col w-full h-full bg-slate-950 text-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <Typography variant="h6">{file?.name || "No file selected"}</Typography>
        <div className="flex gap-3 items-center">
          <Select size="small" value={language} onChange={handleLanguageChange}
            sx={{ bgcolor: "#1e293b", color: "white", "& .MuiSvgIcon-root": { color: "white" } }}>
            <MenuItem value="javascript">JavaScript</MenuItem>
            <MenuItem value="python">Python</MenuItem>
            <MenuItem value="typescript">TypeScript</MenuItem>
            <MenuItem value="java">Java</MenuItem>
            <MenuItem value="cpp">C++</MenuItem>
            <MenuItem value="c">C</MenuItem>
            <MenuItem value="php">PHP</MenuItem>
            <MenuItem value="ruby">Ruby</MenuItem>
          </Select>

          <Button onClick={handleSave} variant="outlined" sx={{ color: "white", borderColor: "#334155" }} disabled={status === "saving"}>
            {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved!' : 'Save'}
          </Button>

          <Button onClick={runCode} variant="contained" sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}>
            Run Code
          </Button>
        </div>
      </div>

      <Editor
        height="60vh"
        theme="vs-dark"
        language={language}
        onMount={handleEditorDidMount}
        options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false } }}
      />

      <div className="bg-slate-900 text-green-400 p-4 border-t border-slate-800 font-mono">
        <Typography variant="subtitle1" sx={{color: 'white'}}>Output:</Typography>
        <pre className="whitespace-pre-wrap text-sm">{output}</pre>
      </div>
    </div>
  );
}