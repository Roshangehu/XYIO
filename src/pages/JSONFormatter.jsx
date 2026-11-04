import React, { useState } from "react";
import {
  Copy,
  Check,
  Trash2,
  Sparkles,
  Minimize2,
  FileJson,
  AlertCircle,
  Download,
} from "lucide-react";
import "./JSONFormatter.css";

const sampleJSON = `{
  "name": "XYLO",
  "description": "Everything Digital, One Place.",
  "version": "1.0.0",
  "tools": [
    "PDF Tools",
    "Image Tools",
    "Create & Build"
  ],
  "active": true
}`;

export default function JSONFormatter() {
  const [input, setInput] = useState(sampleJSON);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState("2");

  const processJSON = (type) => {
    setError("");
    setStatus("");
    setCopied(false);

    if (!input.trim()) {
      setError("Please enter some JSON data first.");
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(input);

      if (type === "format") {
        setOutput(JSON.stringify(parsed, null, Number(indent)));
        setStatus("JSON formatted successfully!");
      } else {
        setOutput(JSON.stringify(parsed));
        setStatus("JSON minified successfully!");
      }
    } catch (err) {
      setOutput("");
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const validateJSON = () => {
    setError("");
    setStatus("");

    if (!input.trim()) {
      setError("Please enter some JSON data first.");
      return;
    }

    try {
      JSON.parse(input);
      setStatus("Valid JSON! Your JSON structure is correct.");
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
    }
  };

  const copyOutput = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy. Please copy the output manually.");
    }
  };

  const downloadJSON = () => {
    if (!output) return;

    const blob = new Blob([output], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "formatted.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setStatus("");
    setCopied(false);
  };

  const loadSample = () => {
    setInput(sampleJSON);
    setOutput("");
    setError("");
    setStatus("");
  };

  return (
    <div className="json-tool-page">
      <div className="json-tool-container">

        <div className="json-tool-heading">
          <div className="json-heading-icon">
            <FileJson size={25} />
          </div>

          <div>
            <span className="json-eyebrow">DEVELOPER TOOLS</span>
            <h1>JSON Formatter</h1>
            <p>
              Format, validate and minify your JSON data in seconds.
              Simple, fast and completely browser-based.
            </p>
          </div>
        </div>

        <div className="json-toolbar">
          <div className="json-toolbar-left">
            <label>Indentation</label>

            <select
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
            >
              <option value="2">2 Spaces</option>
              <option value="4">4 Spaces</option>
              <option value="1">1 Space</option>
              <option value="0">No Indentation</option>
            </select>
          </div>

          <div className="json-toolbar-right">
            <button className="json-sample-btn" onClick={loadSample}>
              Load Sample
            </button>

            <button className="json-clear-btn" onClick={clearAll}>
              <Trash2 size={15} />
              Clear
            </button>
          </div>
        </div>

        <div className="json-editor-grid">

          <div className="json-editor-card">
            <div className="json-card-header">
              <div>
                <span className="json-dot input-dot"></span>
                <strong>Input JSON</strong>
              </div>

              <span className="json-card-label">EDITABLE</span>
            </div>

            <textarea
              className="json-textarea"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError("");
                setStatus("");
              }}
              placeholder='Paste your JSON here...'
              spellCheck="false"
            />

            <div className="json-editor-footer">
              <span>
                {input.length} characters
              </span>

              <span>
                {input.trim()
                  ? input.trim().split(/\s+/).length
                  : 0}{" "}
                words
              </span>
            </div>
          </div>

          <div className="json-editor-card">
            <div className="json-card-header">
              <div>
                <span className="json-dot output-dot"></span>
                <strong>Output JSON</strong>
              </div>

              <span className="json-card-label">RESULT</span>
            </div>

            <textarea
              className="json-textarea"
              value={output}
              readOnly
              placeholder="Your formatted JSON will appear here..."
              spellCheck="false"
            />

            <div className="json-editor-footer">
              <span>
                {output.length} characters
              </span>

              <span>
                {output ? "Ready" : "Waiting for input"}
              </span>
            </div>
          </div>

        </div>

        <div className="json-actions">
          <button
            className="json-action-primary"
            onClick={() => processJSON("format")}
          >
            <Sparkles size={17} />
            Format JSON
          </button>

          <button
            className="json-action-secondary"
            onClick={() => processJSON("minify")}
          >
            <Minimize2 size={17} />
            Minify JSON
          </button>

          <button
            className="json-action-secondary"
            onClick={validateJSON}
          >
            <Check size={17} />
            Validate
          </button>
        </div>

        {error && (
          <div className="json-message json-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {status && (
          <div className="json-message json-success">
            <Check size={18} />
            <span>{status}</span>
          </div>
        )}

        {output && (
          <div className="json-output-actions">
            <button onClick={copyOutput}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied!" : "Copy Output"}
            </button>

            <button onClick={downloadJSON}>
              <Download size={16} />
              Download JSON
            </button>
          </div>
        )}

        <div className="json-info-card">
          <h3>What can you do with JSON Formatter?</h3>

          <div className="json-info-grid">
            <div>
              <strong>Format JSON</strong>
              <p>Make messy JSON readable with proper indentation.</p>
            </div>

            <div>
              <strong>Minify JSON</strong>
              <p>Remove unnecessary whitespace to reduce file size.</p>
            </div>

            <div>
              <strong>Validate JSON</strong>
              <p>Check whether your JSON syntax is correct.</p>
            </div>

            <div>
              <strong>Download Results</strong>
              <p>Save the processed JSON directly to your device.</p>
            </div>
          </div>
        </div>

        <p className="json-privacy-note">
          Your JSON data is processed locally in your browser.
          Nothing is uploaded to a server.
        </p>

      </div>
    </div>
  );
}