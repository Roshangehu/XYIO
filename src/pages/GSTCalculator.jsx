import React, { useState } from "react";
import {
  Calculator,
  Copy,
  Check,
  RotateCcw,
  IndianRupee,
  Receipt,
} from "lucide-react";
import "./GSTCalculator.css";

export default function GSTCalculator() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState("exclusive");
  const [taxType, setTaxType] = useState("intra");
  const [copied, setCopied] = useState(false);

  const numericAmount = Math.max(0, Number(amount) || 0);

  let baseAmount = 0;
  let gstAmount = 0;
  let totalAmount = 0;

  if (mode === "exclusive") {
    baseAmount = numericAmount;
    gstAmount = (baseAmount * rate) / 100;
    totalAmount = baseAmount + gstAmount;
  } else {
    totalAmount = numericAmount;
    baseAmount = totalAmount / (1 + rate / 100);
    gstAmount = totalAmount - baseAmount;
  }

  const cgst = taxType === "intra" ? gstAmount / 2 : 0;
  const sgst = taxType === "intra" ? gstAmount / 2 : 0;
  const igst = taxType === "inter" ? gstAmount : 0;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(value);

  const copyResults = async () => {
    const text = `
GST Calculation - XYLO

Base Amount: ${formatCurrency(baseAmount)}
GST Rate: ${rate}%
GST Amount: ${formatCurrency(gstAmount)}
${taxType === "intra"
  ? `CGST: ${formatCurrency(cgst)}\nSGST: ${formatCurrency(sgst)}`
  : `IGST: ${formatCurrency(igst)}`}
Total Amount: ${formatCurrency(totalAmount)}
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const resetCalculator = () => {
    setAmount("1000");
    setRate(18);
    setMode("exclusive");
    setTaxType("intra");
    setCopied(false);
  };

  return (
    <div className="gst-page">
      <div className="gst-container">

        <div className="gst-heading">
          <div className="gst-heading-icon">
            <Calculator size={25} />
          </div>

          <div>
            <span className="gst-eyebrow">FINANCE TOOLS</span>
            <h1>GST Calculator</h1>
            <p>
              Calculate GST instantly with a detailed tax breakdown.
              Simple, accurate and completely browser-based.
            </p>
          </div>
        </div>

        <div className="gst-layout">

          {/* Calculator Input */}

          <div className="gst-input-card">

            <div className="gst-card-title">
              <Receipt size={19} />
              <h3>Calculation Details</h3>
            </div>

            <div className="gst-field">
              <label>Amount (₹)</label>

              <div className="gst-amount-input">
                <IndianRupee size={17} />

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            <div className="gst-field">
              <label>GST Rate</label>

              <div className="gst-rate-grid">
                {[5, 12, 18, 28].map((value) => (
                  <button
                    key={value}
                    className={rate === value ? "active" : ""}
                    onClick={() => setRate(value)}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </div>

            <div className="gst-field">
              <label>Calculation Type</label>

              <div className="gst-toggle">
                <button
                  className={mode === "exclusive" ? "active" : ""}
                  onClick={() => setMode("exclusive")}
                >
                  GST Exclusive
                </button>

                <button
                  className={mode === "inclusive" ? "active" : ""}
                  onClick={() => setMode("inclusive")}
                >
                  GST Inclusive
                </button>
              </div>

              <small>
                {mode === "exclusive"
                  ? "GST will be added to the entered amount."
                  : "GST will be extracted from the entered amount."}
              </small>
            </div>

            <div className="gst-field">
              <label>Tax Type</label>

              <div className="gst-toggle">
                <button
                  className={taxType === "intra" ? "active" : ""}
                  onClick={() => setTaxType("intra")}
                >
                  CGST + SGST
                </button>

                <button
                  className={taxType === "inter" ? "active" : ""}
                  onClick={() => setTaxType("inter")}
                >
                  IGST
                </button>
              </div>

              <small>
                {taxType === "intra"
                  ? "For transactions within the same state."
                  : "For transactions between different states."}
              </small>
            </div>

            <button className="gst-reset-btn" onClick={resetCalculator}>
              <RotateCcw size={16} />
              Reset Calculator
            </button>

          </div>

          {/* Result Card */}

          <div className="gst-result-card">

            <div className="gst-result-header">
              <div>
                <span className="gst-result-label">
                  TOTAL AMOUNT
                </span>

                <h2>{formatCurrency(totalAmount)}</h2>
              </div>

              <div className="gst-result-icon">
                <IndianRupee size={24} />
              </div>
            </div>

            <div className="gst-result-divider"></div>

            <div className="gst-breakdown-title">
              <h3>Price Breakdown</h3>
              <span>{rate}% GST</span>
            </div>

            <div className="gst-breakdown-row">
              <span>Original Amount</span>
              <strong>{formatCurrency(baseAmount)}</strong>
            </div>

            {taxType === "intra" ? (
              <>
                <div className="gst-breakdown-row">
                  <span>CGST ({rate / 2}%)</span>
                  <strong>{formatCurrency(cgst)}</strong>
                </div>

                <div className="gst-breakdown-row">
                  <span>SGST ({rate / 2}%)</span>
                  <strong>{formatCurrency(sgst)}</strong>
                </div>
              </>
            ) : (
              <div className="gst-breakdown-row">
                <span>IGST ({rate}%)</span>
                <strong>{formatCurrency(igst)}</strong>
              </div>
            )}

            <div className="gst-breakdown-row gst-total-tax">
              <span>Total GST</span>
              <strong>{formatCurrency(gstAmount)}</strong>
            </div>

            <div className="gst-final-total">
              <span>Final Amount</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <button
              className="gst-copy-btn"
              onClick={copyResults}
            >
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copied Successfully" : "Copy Breakdown"}
            </button>

          </div>

        </div>

        {/* Information */}

        <div className="gst-info-card">
          <h3>How GST Calculation Works</h3>

          <div className="gst-info-grid">

            <div>
              <strong>GST Exclusive</strong>
              <p>
                GST is calculated on the entered amount and added
                to the original price.
              </p>
            </div>

            <div>
              <strong>GST Inclusive</strong>
              <p>
                GST is already included in the entered amount.
                The calculator extracts the tax component.
              </p>
            </div>

            <div>
              <strong>CGST + SGST</strong>
              <p>
                For intra-state transactions, GST is divided
                equally between CGST and SGST.
              </p>
            </div>

            <div>
              <strong>IGST</strong>
              <p>
                For inter-state transactions, the complete GST
                amount is calculated as IGST.
              </p>
            </div>

          </div>
        </div>

        <p className="gst-privacy">
          All calculations happen locally in your browser.
          No financial information is uploaded.
        </p>

      </div>
    </div>
  );
}