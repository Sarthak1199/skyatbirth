// Email via Resend — optional, silently skipped if RESEND_API_KEY is not set

export async function sendFulfillmentEmail(order: {
  id: string;
  name: string;
  dob: string;
  time: string;
  place: string;
  email: string;
  phone: string;
  address: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.FOUNDER_EMAIL) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "BornHere <orders@bornhere.in>",
    to: process.env.FOUNDER_EMAIL,
    subject: `🖨️ New order — ${order.name} (${order.id})`,
    html: `
      <h2>New BornHere Order</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><td><strong>Order ID</strong></td><td>${order.id}</td></tr>
        <tr><td><strong>Customer</strong></td><td>${order.name}</td></tr>
        <tr><td><strong>DOB</strong></td><td>${order.dob} at ${order.time || "unknown time"}</td></tr>
        <tr><td><strong>Place</strong></td><td>${order.place}</td></tr>
        <tr><td><strong>Email</strong></td><td>${order.email}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${order.phone}</td></tr>
        <tr><td><strong>Shipping Address</strong></td><td>${order.address.replace(/\n/g, "<br>")}</td></tr>
      </table>
      <p>Print on A4, 200GSM matte. Collect payment of ₹999 via UPI before shipping.</p>
    `,
  });
}
