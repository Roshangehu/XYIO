import { useEffect, useState } from "react";
import {
  Upload,
  Download,
  RefreshCw,
  Image as ImageIcon,
  X,
  CheckCircle,
} from "lucide-react";
import "./ImageConverter.css";

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [convertedUrl, setConvertedUrl] = useState("");
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [convertedSize, setConvertedSize] = useState(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    };
  }, [preview, convertedUrl]);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      return;
    }

    setError("");
    setFile(selectedFile);
    setConvertedUrl("");
    setConvertedSize(null);

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    // Default to a different format from the uploaded image.
    if (selectedFile.type === "image/jpeg") {
      setFormat("image/png");
    } else if (selectedFile.type === "image/png") {
      setFormat("image/jpeg");
    } else {
      setFormat("image/jpeg");
    }
  };

  const convertImage = () => {
    if (!file) return;

    setError("");
    setLoading(true);
    setConvertedUrl("");

    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");

      if (!context) {
        setError("Your browser could not process this image.");
        setLoading(false);
        return;
      }

      // JPEG does not support transparency.
      if (format === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Unable to convert this image.");
            setLoading(false);
            return;
          }

          // Some browsers may not support a requested output format.
          if (blob.type !== format) {
            setError(
              "Your browser does not support this output format. Try another format."
            );
            setLoading(false);
            return;
          }

          const url = URL.createObjectURL(blob);
          setConvertedUrl(url);
          setConvertedSize(blob.size);
          setLoading(false);
        },
        format,
        quality / 100
      );
    };

    image.onerror = () => {
      setError("Unable to load this image.");
      setLoading(false);
    };

    image.src = preview;
  };

  const downloadImage = () => {
    if (!convertedUrl) return;

    const extension =
      format === "image/jpeg"
        ? "jpg"
        : format === "image/png"
        ? "png"
        : "webp";

    const link = document.createElement("a");
    link.href = convertedUrl;
    link.download = `xylo-converted.${extension}`;
    link.click();
  };

  const removeFile = () => {
    setFile(null);
    setPreview("");
    setConvertedUrl("");
    setConvertedSize(null);
    setError("");
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="iv-page">
      <div className="iv-container">
        <header className="iv-header">
          <div className="iv-icon">
            <RefreshCw size={26} />
          </div>

          <h1>Image Converter</h1>

          <p>
            Convert images between JPG, PNG and WebP formats quickly and
            easily. No installation or upload required.
          </p>
        </header>

        {!file ? (
          <label className="iv-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <Upload size={38} />
            <h3>Upload an Image</h3>
            <p>Click to browse or select an image from your device</p>
            <span>Supports JPG, PNG and WebP</span>
          </label>
        ) : (
          <div className="iv-workspace">
            <section className="iv-panel">
              <div className="iv-panel-heading">
                <h3>Original Image</h3>

                <button className="iv-remove" onClick={removeFile}>
                  <X size={16} />
                  Remove
                </button>
              </div>

              <div className="iv-preview">
                <img src={preview} alt="Original" />
              </div>

              <div className="iv-info">
                <span>{file.name}</span>
                <span>Format: {file.type}</span>
                <span>Size: {formatSize(file.size)}</span>
              </div>
            </section>

            <section className="iv-panel iv-settings">
              <h3>Conversion Settings</h3>

              <label className="iv-label">Choose Output Format</label>

              <div className="iv-formats">
                {[
                  { value: "image/jpeg", label: "JPG" },
                  { value: "image/png", label: "PNG" },
                  { value: "image/webp", label: "WebP" },
                ].map((item) => (
                  <button
                    key={item.value}
                    className={`iv-format ${
                      format === item.value ? "active" : ""
                    }`}
                    onClick={() => {
                      setFormat(item.value);
                      setConvertedUrl("");
                      setConvertedSize(null);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {format !== "image/png" && (
                <div className="iv-quality">
                  <div className="iv-quality-heading">
                    <label>Output Quality</label>
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
              )}

              {format === "image/jpeg" && (
                <p className="iv-note">
                  JPEG does not support transparency. Transparent areas will
                  become white.
                </p>
              )}

              <button
                className="iv-convert"
                onClick={convertImage}
                disabled={loading}
              >
                <RefreshCw size={17} />
                {loading ? "Converting..." : "Convert Image"}
              </button>

              {error && <p className="iv-error">{error}</p>}
            </section>

            {convertedUrl && (
              <section className="iv-panel iv-result">
                <div className="iv-panel-heading">
                  <h3>Converted Image</h3>
                  <span className="iv-success">
                    <CheckCircle size={15} />
                    Ready
                  </span>
                </div>

                <div className="iv-preview iv-result-preview">
                  <img src={convertedUrl} alt="Converted result" />
                </div>

                <div className="iv-info">
                  <span>Format: {format.split("/")[1].toUpperCase()}</span>
                  <span>Size: {formatSize(convertedSize)}</span>
                </div>

                <button className="iv-download" onClick={downloadImage}>
                  <Download size={18} />
                  Download Converted Image
                </button>
              </section>
            )}
          </div>
        )}

        <footer className="iv-footer">
          <span>🔒 100% Private</span>
          <span>Free to use</span>
          <span>No file uploads</span>
        </footer>
      </div>
    </div>
  );
}