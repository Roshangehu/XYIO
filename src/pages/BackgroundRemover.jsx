import { useEffect, useState } from "react";
import {
  Upload,
  Download,
  Image as ImageIcon,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import "./BackgroundRemover.css";

export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [preview, resultUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError("Please select an image smaller than 15 MB.");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResultUrl("");
    setError("");
    setProgress("");
  };

  const processImage = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setProgress("Preparing AI model...");

    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const resultBlob = await removeBackground(file, {
        model: "medium",
        output: {
          format: "image/png",
          quality: 1,
        },
        progress: (key, current, total) => {
          if (total > 0) {
            const percentage = Math.round((current / total) * 100);
            setProgress(`Processing image... ${percentage}%`);
          } else {
            setProgress("Processing image...");
          }
        },
      });

      if (!resultBlob) {
        throw new Error("No output image was generated.");
      }

      const url = URL.createObjectURL(resultBlob);

      setResultUrl(url);
      setProgress("Background removed successfully!");
    } catch (err) {
      console.error("Background removal error:", err);
      setError(
        "Unable to remove the background. Please try another image or check your internet connection."
      );
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "xylo-background-removed.png";
    link.click();
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setResultUrl("");
    setError("");
    setProgress("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="br-page">
      <div className="br-container">
        <header className="br-header">
          <div className="br-icon">
            <Sparkles size={27} />
          </div>

          <h1>Background Remover</h1>

          <p>
            Remove image backgrounds automatically using AI.
            Get transparent PNG images in seconds.
          </p>

          <div className="br-badge">
            <Sparkles size={14} />
            AI Powered
          </div>
        </header>

        {!file ? (
          <label className="br-upload">
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <div className="br-upload-icon">
              <Upload size={36} />
            </div>

            <h3>Upload Your Image</h3>

            <p>Click to browse or select an image from your device</p>

            <span>JPG, PNG and WebP supported · Maximum 15 MB</span>
          </label>
        ) : (
          <div className="br-workspace">
            <section className="br-panel">
              <div className="br-panel-heading">
                <h3>Original Image</h3>

                <button className="br-remove" onClick={removeFile}>
                  <X size={16} />
                  Remove
                </button>
              </div>

              <div className="br-preview">
                <img src={preview} alt="Original" />
              </div>

              <div className="br-info">
                <span>{file.name}</span>
                <span>{formatSize(file.size)}</span>
              </div>
            </section>

            <section className="br-panel">
              <div className="br-panel-heading">
                <h3>Background Removed</h3>

                {resultUrl && (
                  <span className="br-success">
                    <CheckCircle size={14} />
                    Ready
                  </span>
                )}
              </div>

              <div className="br-preview br-transparent">
                {resultUrl ? (
                  <img src={resultUrl} alt="Background removed" />
                ) : (
                  <div className="br-empty">
                    {loading ? (
                      <>
                        <RefreshCw size={35} className="br-spin" />
                        <p>Removing background...</p>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={40} />
                        <p>Your result will appear here</p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {resultUrl && (
                <div className="br-info">
                  <span>Format: PNG</span>
                  <span>Transparent background</span>
                </div>
              )}
            </section>

            <div className="br-actions">
              {!resultUrl ? (
                <button
                  className="br-process"
                  onClick={processImage}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="br-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Remove Background
                    </>
                  )}
                </button>
              ) : (
                <button className="br-download" onClick={downloadImage}>
                  <Download size={18} />
                  Download Transparent PNG
                </button>
              )}

              {progress && <p className="br-progress">{progress}</p>}

              {error && <p className="br-error">{error}</p>}
            </div>
          </div>
        )}

        <div className="br-features">
          <div>
            <Sparkles size={20} />
            <h4>AI Powered</h4>
            <p>Automatically detects the foreground.</p>
          </div>

          <div>
            <ImageIcon size={20} />
            <h4>Transparent PNG</h4>
            <p>Download images without backgrounds.</p>
          </div>

          <div>
            <CheckCircle size={20} />
            <h4>Easy to Use</h4>
            <p>Upload, process and download.</p>
          </div>
        </div>

        <footer className="br-footer">
          <span>🔒 Images processed in your browser</span>
          <span>Free to use</span>
        </footer>
      </div>
    </div>
  );
}