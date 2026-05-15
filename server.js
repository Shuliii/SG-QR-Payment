// server.js

const express = require("express");
const QRCode = require("qrcode");
const pn = require("@jeremyling/sg-paynow-qr");

const app = express();

app.use(express.json());

/**
 * Fixed PayNow phone number
 */
const PAYNOW_PHONE = process.env.PAYNOW_PHONE;
/**
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.post("/api/paynow-qr", async (req, res) => {
  try {
    const {amount, editable = false} = req.body;

    if (!amount) {
      return res.status(400).json({
        error: "amount is required",
      });
    }

    const [qrPayload, error] = pn.generateQr({
      mobile: "+65" + PAYNOW_PHONE,
      amount: Number(amount),
      editable: editable ? 1 : 0,
    });

    if (error) {
      return res.status(400).json({
        error,
      });
    }

    const qrImage = await QRCode.toDataURL(qrPayload);

    return res.json({
      success: true,
      data: {
        amount,
        editable,
        payload: qrPayload,
        qrImage,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "internal server error",
    });
  }
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PayNow QR service running on port ${PORT}`);
});
