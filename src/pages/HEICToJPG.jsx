import { useEffect, useState } from "react";
import {
  Upload,
  Download,
  RefreshCw,
  Image as ImageIcon,
  X,
  CheckCircle,
} from "lucide-react";
import heic2any from "heic2any";
import "./HEICToJPG.css";

export default function HEICToJPG() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [convertedUrl, setConvertedUrl] = useState("");
  const [convertedSize, setConvertedSize] = useState(0);
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [preview, convertedUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split(".").pop().toLowerCase();

    if (!["heic", "heif"].includes(extension)) {
      setError("Please select a HEIC or HEIF image.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setConvertedUrl("");
    setConvertedSize(0);

    // HEIC previews are not supported in every browser.
    // Conversion will create a browser-compatible preview.
    setPreview("");
  };

  const convertImage = async () => {
    if (!file) {
      setError("Please upload a HEIC image first.");
      return;
    }

    setLoading(true);
    setError("");
    setConvertedUrl("");

    try {
      const result = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: quality / 100,
      });

      // HEIC files can contain multiple images.
      const outputBlob = Array.isArray(result) ? result[0] : result;

      if (!outputBlob) {
        throw new Error("No converted image was generated.");
      }

      const url = URL.createObjectURL(outputBlob);

      setPreview(url);
      setConvertedUrl(url);
      setConvertedSize(outputBlob.size);
    } catch (err) {
      console.error("HEIC conversion error:", err);
      setError(
        "Unable to convert this file. Please check that it is a valid HEIC/HEIF image."
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!convertedUrl) return;

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = "xylo-converted.jpg";
    link.click();
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setConvertedUrl("");
    setConvertedSize(0);
    setError("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="hc-page">
      <div className="hc-container">
        <header className="hc-header">
          <div className="hc-icon">
            <ImageIcon size={26} />
          </div>

          <h1>HEIC to JPG</h1>

          <p>
            Convert iPhone HEIC and HEIF photos into widely supported JPG
            images. Fast, simple and private.
          </p>
        </header>

        {!file ? (
          <label className="hc-upload">
            <input
              type="file"
              accept=".heic,.heif,image/heic,image/heif"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <Upload size={38} />
            <h3>Upload a HEIC Image</h3>
            <p>Click to browse or select a photo from your device</p>
            <span>Supports HEIC and HEIF formats</span>
          </label>
        ) : (
          <div className="hc-workspace">
            <section className="hc-panel">
              <div className="hc-panel-heading">
                <h3>Selected Image</h3>

                <button className="hc-remove" onClick={removeFile}>
                  <X size={16} />
                  Remove
                </button>
              </div>

              <div className="hc-empty-preview">
                {preview ? (
                  <img src={preview} alt="Converted preview" />
                ) : (
                  <>
                    <ImageIcon size={42} />
                    <p>HEIC image selected</p>
                    <span>Convert to JPG to preview</span>
                  </>
                )}
              </div>

              <div className="hc-info">
                <span>{file.name}</span>
                <span>Size: {formatSize(file.size)}</span>
                <span>Output: JPG</span>
              </div>
            </section>

            <section className="hc-panel hc-settings">
              <h3>Conversion Settings</h3>

              <div className="hc-format-card">
                <span>Input format</span>
                <strong>HEIC / HEIF</strong>
              </div>

              <div className="hc-format-arrow">↓</div>

              <div className="hc-format-card hc-output-format">
                <span>Output format</span>
                <strong>JPG / JPEG</strong>
              </div>

              <div className="hc-quality">
                <div className="hc-quality-heading">
                  <label>JPG Quality</label>
                  <strong>{quality}%</strong>
                </div>

                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                />
              </div>

              <button
                className="hc-convert"
                onClick={convertImage}
                disabled={loading}
              >
                <RefreshCw size={17} />
                {loading ? "Converting..." : "Convert to JPG"}
              </button>

              {error && <p className="hc-error">{error}</p>}
            </section>

            {convertedUrl && (
              <section className="hc-panel hc-result">
                <div className="hc-panel-heading">
                  <h3>Converted Image</h3>

                  <span className="hc-success">
                    <CheckCircle size={15} />
                    Ready
                  </span>
                </div>

                <div className="hc-result-preview">
                  <img src={convertedUrl} alt="Converted JPG" />
                </div>

                <div className="hc-info">
                  <span>Format: JPG</span>
                  <span>Size: {formatSize(convertedSize)}</span>
                </div>

                <button className="hc-download" onClick={downloadImage}>
                  <Download size={18} />
                  Download JPG
                </button>
              </section>
            )}
          </div>
        )}

        <footer className="hc-footer">
          <span>🔒 100% Private</span>
          <span>Free to use</span>
          <span>No file uploads</span>
        </footer>
      </div>
    </div>
  );
}