import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  QrCode,
  Download,
  Copy,
  Check,
  RefreshCcw,
  Link,
  Type,
  Wifi,
  Mail,
  Phone,
  Palette,
} from "lucide-react";
import "./QRCodeGenerator.css";

const initialData = {
  url: "https://xylo.com",
  text: "Hello! Welcome to XYLO.",
  wifiName: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  email: "",
  emailSubject: "",
  phone: "",
};

export default function QRCodeGenerator() {
  const [type, setType] = useState("url");
  const [data, setData] = useState(initialData);

  const [foreground, setForeground] = useState("#171717");
  const [background, setBackground] = useState("#ffffff");
  const [size, setSize] = useState(300);
  const [errorLevel, setErrorLevel] = useState("M");

  const [qrImage, setQrImage] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);

  const getQRContent = () => {
    switch (type) {
      case "url":
        return data.url.trim();

      case "text":
        return data.text.trim();

      case "wifi": {
        const escapeWifi = (value) =>
          value.replace(/([\\;,:"])/g, "\\$1");

        return `WIFI:T:${data.wifiSecurity};S:${escapeWifi(
          data.wifiName
        )};P:${escapeWifi(data.wifiPassword)};;`;
      }

      case "email": {
        const email = data.email.trim();
        const subject = encodeURIComponent(data.emailSubject);

        return `mailto:${email}?subject=${subject}`;
      }

      case "phone":
        return `tel:${data.phone.trim()}`;

      default:
        return "";
    }
  };

  const generateQR = async () => {
    const content = getQRContent();

    if (!content || content === "mailto:" || content === "tel:") {
      setError("Please enter the required information.");
      setQrImage("");
      return;
    }

    if (type === "url") {
      try {
        const parsed = new URL(content);

        if (!["http:", "https:"].includes(parsed.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        setError("Please enter a valid URL, including https://");
        setQrImage("");
        return;
      }
    }

    if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setError("Please enter a valid email address.");
      setQrImage("");
      return;
    }

    if (type === "phone" && !/^\+?[\d\s()-]{5,20}$/.test(data.phone.trim())) {
      setError("Please enter a valid phone number.");
      setQrImage("");
      return;
    }

    if (type === "wifi" && !data.wifiName.trim()) {
      setError("Please enter your Wi-Fi network name.");
      setQrImage("");
      return;
    }

    setLoading(true);
    setError("");
    setCopied(false);

    try {
      const image = await QRCode.toDataURL(content, {
        width: Number(size),
        margin: 3,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: foreground,
          light: background,
        },
      });

      setQrImage(image);
    } catch {
      setError("Unable to generate QR code. Please try again.");
      setQrImage("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQR();
    // Generate a new QR code when settings or content change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, data, foreground, background, size, errorLevel]);

  const downloadQR = () => {
    if (!qrImage) return;

    const link = document.createElement("a");
    link.href = qrImage;
    link.download = "xylo-qr-code.png";
    link.click();
  };

  const copyQR = async () => {
    if (!qrImage) return;

    try {
      const response = await fetch(qrImage);
      const blob = await response.blob();

      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Image copying is not supported in this browser. Download the QR code instead.");
    }
  };

  const resetSettings = () => {
    setType("url");
    setData(initialData);
    setForeground("#171717");
    setBackground("#ffffff");
    setSize(300);
    setErrorLevel("M");
    setError("");
    setCopied(false);
  };

  const updateData = (field, value) => {
    setData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const types = [
    { id: "url", label: "Website URL", icon: Link },
    { id: "text", label: "Plain Text", icon: Type },
    { id: "wifi", label: "Wi-Fi", icon: Wifi },
    { id: "email", label: "Email", icon: Mail },
    { id: "phone", label: "Phone", icon: Phone },
  ];

  return (
    <div className="qr-page">
      <div className="qr-container">

        <div className="qr-heading">
          <div className="qr-heading-icon">
            <QrCode size={27} />
          </div>

          <div>
            <span className="qr-eyebrow">UTILITY TOOLS</span>
            <h1>QR Code Generator</h1>
            <p>
              Create customized QR codes for websites, text,
              Wi-Fi, email and phone numbers.
            </p>
          </div>
        </div>

        <div className="qr-layout">

          {/* LEFT: SETTINGS */}

          <div className="qr-settings-card">

            <div className="qr-section-title">
              <h3>QR Code Content</h3>
              <span>STEP 01</span>
            </div>

            <div className="qr-type-grid">
              {types.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    className={type === item.id ? "active" : ""}
                    onClick={() => {
                      setType(item.id);
                      setError("");
                    }}
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="qr-input-section">

              {type === "url" && (
                <div className="qr-field">
                  <label>Website URL</label>
                  <input
                    type="url"
                    value={data.url}
                    onChange={(e) => updateData("url", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              )}

              {type === "text" && (
                <div className="qr-field">
                  <label>Your Text</label>
                  <textarea
                    value={data.text}
                    onChange={(e) => updateData("text", e.target.value)}
                    placeholder="Enter your text..."
                    rows="5"
                  />
                </div>
              )}

              {type === "wifi" && (
                <>
                  <div className="qr-field">
                    <label>Wi-Fi Network Name (SSID)</label>
                    <input
                      value={data.wifiName}
                      onChange={(e) =>
                        updateData("wifiName", e.target.value)
                      }
                      placeholder="Enter Wi-Fi name"
                    />
                  </div>

                  <div className="qr-field">
                    <label>Wi-Fi Password</label>
                    <input
                      type="text"
                      value={data.wifiPassword}
                      onChange={(e) =>
                        updateData("wifiPassword", e.target.value)
                      }
                      placeholder="Enter Wi-Fi password"
                    />
                  </div>

                  <div className="qr-field">
                    <label>Security Type</label>
                    <select
                      value={data.wifiSecurity}
                      onChange={(e) =>
                        updateData("wifiSecurity", e.target.value)
                      }
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No Password</option>
                    </select>
                  </div>
                </>
              )}

              {type === "email" && (
                <>
                  <div className="qr-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) =>
                        updateData("email", e.target.value)
                      }
                      placeholder="example@email.com"
                    />
                  </div>

                  <div className="qr-field">
                    <label>Email Subject</label>
                    <input
                      value={data.emailSubject}
                      onChange={(e) =>
                        updateData("emailSubject", e.target.value)
                      }
                      placeholder="Enter subject"
                    />
                  </div>
                </>
              )}

              {type === "phone" && (
                <div className="qr-field">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) =>
                      updateData("phone", e.target.value)
                    }
                    placeholder="+91 9876543210"
                  />
                </div>
              )}

            </div>

            <div className="qr-divider"></div>

            <div className="qr-section-title">
              <h3>
                <Palette size={17} />
                Customize Design
              </h3>
              <span>STEP 02</span>
            </div>

            <div className="qr-color-grid">

              <div className="qr-color-field">
                <label>QR Color</label>
                <div>
                  <input
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                  />
                  <span>{foreground.toUpperCase()}</span>
                </div>
              </div>

              <div className="qr-color-field">
                <label>Background</label>
                <div>
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                  />
                  <span>{background.toUpperCase()}</span>
                </div>
              </div>

            </div>

            <div className="qr-field">
              <label>QR Code Size: {size} × {size}px</label>
              <input
                className="qr-range"
                type="range"
                min="150"
                max="1000"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>

            <div className="qr-field">
              <label>Error Correction Level</label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value)}
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            <button className="qr-reset-btn" onClick={resetSettings}>
              <RefreshCcw size={15} />
              Reset Settings
            </button>

          </div>

          {/* RIGHT: PREVIEW */}

          <div className="qr-preview-card">

            <div className="qr-section-title">
              <h3>Live Preview</h3>
              <span>STEP 03</span>
            </div>

            <div className="qr-preview-area">

              {qrImage ? (
                <div className="qr-image-wrapper">
                  <img
                    ref={canvasRef}
                    src={qrImage}
                    alt="Generated QR Code"
                  />
                </div>
              ) : (
                <div className="qr-empty-preview">
                  <QrCode size={65} />
                  <p>Your QR code will appear here.</p>
                </div>
              )}

            </div>

            {error && (
              <div className="qr-error">
                {error}
              </div>
            )}

            {loading && (
              <p className="qr-loading">Generating QR code...</p>
            )}

            <div className="qr-preview-details">
              <div>
                <span>Format</span>
                <strong>PNG</strong>
              </div>

              <div>
                <span>Dimensions</span>
                <strong>{size} × {size}px</strong>
              </div>

              <div>
                <span>Correction</span>
                <strong>{errorLevel}</strong>
              </div>
            </div>

            <div className="qr-download-actions">
              <button
                className="qr-download-btn"
                onClick={downloadQR}
                disabled={!qrImage || loading}
              >
                <Download size={17} />
                Download PNG
              </button>

              <button
                className="qr-copy-btn"
                onClick={copyQR}
                disabled={!qrImage || loading}
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? "Copied!" : "Copy Image"}
              </button>
            </div>

          </div>

        </div>

        <div className="qr-info-card">
          <h3>About QR Codes</h3>

          <div className="qr-info-grid">
            <div>
              <strong>Website QR</strong>
              <p>Share your website or landing page with a simple scan.</p>
            </div>

            <div>
              <strong>Wi-Fi QR</strong>
              <p>Allow guests to connect to your Wi-Fi without typing a password.</p>
            </div>

            <div>
              <strong>Text QR</strong>
              <p>Share messages, instructions or other text information.</p>
            </div>

            <div>
              <strong>Custom Design</strong>
              <p>Choose colors and dimensions for your QR code.</p>
            </div>
          </div>
        </div>

        <p className="qr-privacy">
          QR codes are generated locally in your browser.
          Your information is not uploaded to a server.
        </p>

      </div>
    </div>
  );
}