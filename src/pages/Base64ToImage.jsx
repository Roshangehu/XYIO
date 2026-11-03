import { useState } from "react";
import {
  Image as ImageIcon,
  Download,
  RefreshCw,
  Clipboard,
  Check,
  Trash2,
} from "lucide-react";
import "./Base64ToImage.css";

export default function Base64ToImage() {
  const [base64, setBase64] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageType, setImageType] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const convertBase64 = () => {
    setError("");
    setImageUrl("");
    setImageType("");

    const input = base64.trim();

    if (!input) {
      setError("Please paste a Base64 string first.");
      return;
    }

    try {
      let mimeType = "image/png";
      let data = input;

      // Handle Data URL format:
      // data:image/png;base64,.....
      const match = input.match(
        /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]*)$/i
      );

      if (match) {
        mimeType = match[1].toLowerCase();
        data = match[2];
      }

      if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(mimeType)) {
        throw new Error("Supported formats are PNG, JPG, WebP and GIF.");
      }

      // Remove whitespace and validate Base64 characters.
      data = data.replace(/\s/g, "");

      if (
        !data ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(data) ||
        data.length % 4 !== 0
      ) {
        throw new Error("The Base64 string is invalid or incomplete.");
      }

      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const image = new window.Image();

      image.onload = () => {
        setImageUrl(url);
        setImageType(mimeType);
      };

      image.onerror = () => {
        URL.revokeObjectURL(url);
        setError("This Base64 string does not contain a valid image.");
      };

      image.src = url;
    } catch (err) {
      setError(err.message || "Unable to convert this Base64 string.");
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    const extension =
      imageType === "image/jpeg"
        ? "jpg"
        : imageType === "image/webp"
        ? "webp"
        : imageType === "image/gif"
        ? "gif"
        : "png";

    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `xylo-image.${extension}`;
    link.click();
  };

  const copyExample = async () => {
    try {
      await navigator.clipboard.writeText(
        "data:image/png;base64,PASTE_YOUR_BASE64_HERE"
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy the example.");
    }
  };

  const clearAll = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setBase64("");
    setImageUrl("");
    setImageType("");
    setError("");
    setCopied(false);
  };

  return (
    <div className="bi-page">
      <div className="bi-container">
        <header className="bi-header">
          <div className="bi-icon">
            <ImageIcon size={26} />
          </div>

          <h1>Base64 to Image</h1>

          <p>
            Convert Base64 strings into images instantly. Preview and download
            your image directly in your browser.
          </p>
        </header>

        <div className="bi-workspace">
          <section className="bi-panel">
            <div className="bi-panel-heading">
              <h3>Paste Base64 String</h3>

              <button className="bi-clear" onClick={clearAll}>
                <Trash2 size={15} />
                Clear
              </button>
            </div>

            <textarea
              className="bi-textarea"
              placeholder="Paste your Base64 string here..."
              value={base64}
              onChange={(e) => {
                setBase64(e.target.value);
                setError("");
              }}
              spellCheck="false"
            />

            <p className="bi-hint">
              You can paste a complete Data URL or a raw Base64 string.
            </p>

            <button className="bi-convert" onClick={convertBase64}>
              <RefreshCw size={17} />
              Convert to Image
            </button>

            <div className="bi-example">
              <span>Example format</span>

              <code>data:image/png;base64,iVBORw0KGgo...</code>

              <button onClick={copyExample}>
                {copied ? <Check size={14} /> : <Clipboard size={14} />}
                {copied ? "Copied" : "Copy Example"}
              </button>
            </div>

            {error && <p className="bi-error">{error}</p>}
          </section>

          <section className="bi-panel bi-result">
            <div className="bi-panel-heading">
              <h3>Image Preview</h3>

              {imageUrl && <span className="bi-badge">Converted</span>}
            </div>

            {imageUrl ? (
              <>
                <div className="bi-preview">
                  <img src={imageUrl} alt="Converted from Base64" />
                </div>

                <p className="bi-format">
                  Detected format: {imageType}
                </p>

                <button className="bi-download" onClick={downloadImage}>
                  <Download size={18} />
                  Download Image
                </button>
              </>
            ) : (
              <div className="bi-empty">
                <ImageIcon size={42} />
                <h3>No Image Yet</h3>
                <p>Your converted image will appear here.</p>
              </div>
            )}
          </section>
        </div>

        <footer className="bi-footer">
          <span>🔒 100% Private</span>
          <span>Free to use</span>
          <span>No file uploads</span>
        </footer>
      </div>
    </div>
  );
}