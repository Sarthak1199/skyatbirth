import { google } from "googleapis";

export async function appendOrderToSheet(order: {
  id: string;
  name: string;
  dob: string;
  place: string;
  email: string;
  phone: string;
  address: string;
  amount: number;
  status: string;
  razorpayLinkId: string;
  createdAt: string;
}) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.GOOGLE_SHEET_ID;

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "Orders!A:L",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        order.id,
        order.createdAt,
        order.name,
        order.dob,
        order.place,
        order.email,
        order.phone,
        order.address,
        order.amount,
        order.status,
        order.razorpayLinkId,
      ]],
    },
  });
}

export async function updateOrderStatus(razorpayLinkId: string, status: string) {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const sheetId = process.env.GOOGLE_SHEET_ID;

  // Find the row with matching razorpayLinkId (column K, index 10)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: "Orders!K:K",
  });

  const rows = res.data.values || [];
  const rowIndex = rows.findIndex((r) => r[0] === razorpayLinkId);
  if (rowIndex === -1) return;

  // Update column J (status, index 9) — row is 1-indexed + header
  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: `Orders!J${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [[status]] },
  });
}
