import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  Download,
  Eye,
  Edit3,
  FileText,
  RotateCcw,
} from "lucide-react";
import "./InvoiceGenerator.css";

const initialInvoice = {
  invoiceNumber: "INV-001",
  issueDate: new Date().toISOString().split("T")[0],
  dueDate: "",
  currency: "INR",
  businessName: "",
  businessEmail: "",
  businessAddress: "",
  clientName: "",
  clientEmail: "",
  clientAddress: "",
  notes: "Thank you for your business!",
  taxRate: 18,
  discount: 0,
  items: [
    {
      id: 1,
      description: "Website Development",
      quantity: 1,
      price: 10000,
    },
  ],
};

const currencySymbols = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export default function InvoiceGenerator() {
  const [invoice, setInvoice] = useState(() => {
    try {
      const saved = localStorage.getItem("xylo-invoice");
      return saved ? JSON.parse(saved) : initialInvoice;
    } catch {
      return initialInvoice;
    }
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    localStorage.setItem("xylo-invoice", JSON.stringify(invoice));
  }, [invoice]);

  const updateField = (field, value) => {
    setInvoice((prev) => ({ ...prev, [field]: value }));
  };

  const updateItem = (id, field, value) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setInvoice((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now(),
          description: "",
          quantity: 1,
          price: 0,
        },
      ],
    }));
  };

  const removeItem = (id) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const calculations = useMemo(() => {
    const subtotal = invoice.items.reduce(
      (total, item) =>
        total +
        Math.max(0, Number(item.quantity) || 0) *
          Math.max(0, Number(item.price) || 0),
      0
    );

    const discount = Math.min(
      subtotal,
      Math.max(0, Number(invoice.discount) || 0)
    );

    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * (Math.max(0, Number(invoice.taxRate) || 0) / 100);

    return {
      subtotal,
      discount,
      tax,
      total: taxableAmount + tax,
    };
  }, [invoice]);

  const symbol = currencySymbols[invoice.currency] || "₹";

  const formatMoney = (amount) =>
    `${symbol}${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const resetInvoice = () => {
    if (window.confirm("Reset this invoice? All current details will be cleared.")) {
      setInvoice({
        ...initialInvoice,
        invoiceNumber: `INV-${Date.now().toString().slice(-5)}`,
        items: [{ id: Date.now(), description: "", quantity: 1, price: 0 }],
      });
      setShowPreview(false);
    }
  };

  const downloadInvoice = () => {
    if (!invoice.businessName.trim() || !invoice.clientName.trim()) {
      alert("Please enter your business name and client's name first.");
      return;
    }

    setShowPreview(true);

    setTimeout(() => {
      window.print();
    }, 300);
  };

  const renderInvoice = () => (
    <div className="invoice-paper" id="invoice-paper">
      <div className="invoice-paper-header">
        <div>
          <h1>{invoice.businessName || "Your Business"}</h1>
          <p>{invoice.businessEmail}</p>
          <p className="invoice-address">{invoice.businessAddress}</p>
        </div>

        <div className="invoice-title">
          <h2>INVOICE</h2>
          <p>{invoice.invoiceNumber}</p>
        </div>
      </div>

      <div className="invoice-paper-details">
        <div>
          <span className="invoice-label">BILL TO</span>
          <h3>{invoice.clientName || "Client Name"}</h3>
          <p>{invoice.clientEmail}</p>
          <p className="invoice-address">{invoice.clientAddress}</p>
        </div>

        <div className="invoice-dates">
          <p>
            <span>Invoice Date</span>
            <strong>{invoice.issueDate || "—"}</strong>
          </p>
          <p>
            <span>Due Date</span>
            <strong>{invoice.dueDate || "—"}</strong>
          </p>
        </div>
      </div>

      <table className="invoice-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td>{item.description || "Item"}</td>
              <td>{item.quantity}</td>
              <td>{formatMoney(item.price)}</td>
              <td>
                {formatMoney(
                  (Number(item.quantity) || 0) * (Number(item.price) || 0)
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="invoice-bottom">
        <div className="invoice-notes">
          <span className="invoice-label">NOTES</span>
          <p>{invoice.notes || "—"}</p>
        </div>

        <div className="invoice-totals">
          <p>
            <span>Subtotal</span>
            <strong>{formatMoney(calculations.subtotal)}</strong>
          </p>

          <p>
            <span>Discount</span>
            <strong>- {formatMoney(calculations.discount)}</strong>
          </p>

          <p>
            <span>Tax ({invoice.taxRate}%)</span>
            <strong>{formatMoney(calculations.tax)}</strong>
          </p>

          <div className="invoice-grand-total">
            <span>Total</span>
            <strong>{formatMoney(calculations.total)}</strong>
          </div>
        </div>
      </div>

      <div className="invoice-footer">
        <p>Generated with XYLO · Everything Digital, One Place.</p>
      </div>
    </div>
  );

  return (
    <div className="invoice-tool">
      <div className="invoice-tool-header">
        <div>
          <div className="invoice-breadcrumb">XYLO / CREATE & BUILD</div>
          <h1>Invoice Generator</h1>
          <p>Create professional invoices in seconds. Customize, preview, and save as PDF.</p>
        </div>

        <div className="invoice-header-icon">
          <FileText size={27} />
        </div>
      </div>

      <div className="invoice-toolbar">
        <div className="invoice-save-status">
          <span className="invoice-save-dot" />
          Automatically saved in this browser
        </div>

        <div className="invoice-toolbar-actions">
          <button
            className="invoice-secondary-btn"
            onClick={resetInvoice}
            type="button"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            className="invoice-secondary-btn"
            onClick={() => setShowPreview(!showPreview)}
            type="button"
          >
            {showPreview ? <Edit3 size={16} /> : <Eye size={16} />}
            {showPreview ? "Edit invoice" : "Preview"}
          </button>

          <button
            className="invoice-primary-btn"
            onClick={downloadInvoice}
            type="button"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {showPreview ? (
        <div className="invoice-preview-container">
          {renderInvoice()}
        </div>
      ) : (
        <div className="invoice-layout">
          <div className="invoice-editor">
            <section className="invoice-section">
              <div className="invoice-section-heading">
                <span>01</span>
                <div>
                  <h2>Invoice details</h2>
                  <p>Basic information about this invoice.</p>
                </div>
              </div>

              <div className="invoice-form-grid">
                <label>
                  Invoice number
                  <input
                    value={invoice.invoiceNumber}
                    onChange={(e) => updateField("invoiceNumber", e.target.value)}
                    placeholder="INV-001"
                  />
                </label>

                <label>
                  Currency
                  <select
                    value={invoice.currency}
                    onChange={(e) => updateField("currency", e.target.value)}
                  >
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                  </select>
                </label>

                <label>
                  Issue date
                  <input
                    type="date"
                    value={invoice.issueDate}
                    onChange={(e) => updateField("issueDate", e.target.value)}
                  />
                </label>

                <label>
                  Due date
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateField("dueDate", e.target.value)}
                  />
                </label>
              </div>
            </section>

            <section className="invoice-section">
              <div className="invoice-section-heading">
                <span>02</span>
                <div>
                  <h2>Your business</h2>
                  <p>Enter your business information.</p>
                </div>
              </div>

              <div className="invoice-form-grid">
                <label>
                  Business name *
                  <input
                    value={invoice.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    placeholder="Your company name"
                  />
                </label>

                <label>
                  Business email
                  <input
                    type="email"
                    value={invoice.businessEmail}
                    onChange={(e) => updateField("businessEmail", e.target.value)}
                    placeholder="hello@example.com"
                  />
                </label>

                <label className="invoice-full-width">
                  Business address
                  <textarea
                    value={invoice.businessAddress}
                    onChange={(e) =>
                      updateField("businessAddress", e.target.value)
                    }
                    placeholder="Street, city, state, PIN code"
                    rows="2"
                  />
                </label>
              </div>
            </section>

            <section className="invoice-section">
              <div className="invoice-section-heading">
                <span>03</span>
                <div>
                  <h2>Client details</h2>
                  <p>Who are you billing?</p>
                </div>
              </div>

              <div className="invoice-form-grid">
                <label>
                  Client name *
                  <input
                    value={invoice.clientName}
                    onChange={(e) => updateField("clientName", e.target.value)}
                    placeholder="Client or company name"
                  />
                </label>

                <label>
                  Client email
                  <input
                    type="email"
                    value={invoice.clientEmail}
                    onChange={(e) => updateField("clientEmail", e.target.value)}
                    placeholder="client@example.com"
                  />
                </label>

                <label className="invoice-full-width">
                  Client address
                  <textarea
                    value={invoice.clientAddress}
                    onChange={(e) =>
                      updateField("clientAddress", e.target.value)
                    }
                    placeholder="Client's billing address"
                    rows="2"
                  />
                </label>
              </div>
            </section>

            <section className="invoice-section">
              <div className="invoice-section-heading">
                <span>04</span>
                <div>
                  <h2>Items & services</h2>
                  <p>Add the products or services you are charging for.</p>
                </div>
              </div>

              <div className="invoice-items">
                {invoice.items.map((item, index) => (
                  <div className="invoice-item-row" key={item.id}>
                    <div className="invoice-item-number">{index + 1}</div>

                    <div className="invoice-item-fields">
                      <label>
                        Description
                        <input
                          value={item.description}
                          onChange={(e) =>
                            updateItem(item.id, "description", e.target.value)
                          }
                          placeholder="Product or service"
                        />
                      </label>

                      <label>
                        Quantity
                        <input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(item.id, "quantity", e.target.value)
                          }
                        />
                      </label>

                      <label>
                        Rate ({symbol})
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            updateItem(item.id, "price", e.target.value)
                          }
                        />
                      </label>
                    </div>

                    <button
                      className="invoice-delete-btn"
                      onClick={() => removeItem(item.id)}
                      type="button"
                      aria-label="Remove item"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="invoice-add-item"
                onClick={addItem}
                type="button"
              >
                <Plus size={17} />
                Add another item
              </button>
            </section>

            <section className="invoice-section">
              <div className="invoice-section-heading">
                <span>05</span>
                <div>
                  <h2>Tax & discount</h2>
                  <p>Adjust the final invoice amount.</p>
                </div>
              </div>

              <div className="invoice-form-grid">
                <label>
                  Tax rate (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={invoice.taxRate}
                    onChange={(e) => updateField("taxRate", e.target.value)}
                  />
                </label>

                <label>
                  Discount ({symbol})
                  <input
                    type="number"
                    min="0"
                    value={invoice.discount}
                    onChange={(e) => updateField("discount", e.target.value)}
                  />
                </label>

                <label className="invoice-full-width">
                  Notes / Payment instructions
                  <textarea
                    rows="3"
                    value={invoice.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Add payment details or a thank-you message"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="invoice-summary">
            <div className="invoice-summary-top">
              <span>LIVE SUMMARY</span>
              <FileText size={19} />
            </div>

            <h2>Invoice total</h2>
            <div className="invoice-summary-total">
              {formatMoney(calculations.total)}
            </div>

            <div className="invoice-summary-line">
              <span>Subtotal</span>
              <strong>{formatMoney(calculations.subtotal)}</strong>
            </div>

            <div className="invoice-summary-line">
              <span>Discount</span>
              <strong>- {formatMoney(calculations.discount)}</strong>
            </div>

            <div className="invoice-summary-line">
              <span>Tax ({invoice.taxRate}%)</span>
              <strong>{formatMoney(calculations.tax)}</strong>
            </div>

            <div className="invoice-summary-divider" />

            <div className="invoice-summary-line invoice-summary-final">
              <span>Grand total</span>
              <strong>{formatMoney(calculations.total)}</strong>
            </div>

            <button
              className="invoice-primary-btn invoice-summary-button"
              onClick={downloadInvoice}
              type="button"
            >
              <Download size={16} />
              Download invoice
            </button>

            <p className="invoice-summary-note">
              Your invoice is saved locally in this browser. Download it as a
              PDF to share it with your client.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}