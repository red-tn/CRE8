import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

interface EmailParams {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailParams) {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    text: text || html.replace(/<[^>]*>/g, ''),
    html,
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error('SendGrid error:', error)
    return { success: false, error }
  }
}

export function getDuesReminderEmail(memberName: string, dueDate: string, paymentLink: string) {
  return {
    subject: 'CRE8 Truck Club - Membership Dues Reminder',
    html: `
      <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #fff; text-align: center; font-size: 32px; margin-bottom: 20px; letter-spacing: 2px;">
            CRE8 TRUCK CLUB
          </h1>
          <h2 style="color: #a1a1aa; text-align: center;">Membership Dues Reminder</h2>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
            Hey ${memberName},
          </p>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
            Your CRE8 Truck Club membership dues are coming up on <strong style="color: #fff;">${dueDate}</strong>.
          </p>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
            Keep your membership active to continue enjoying:
          </p>
          <ul style="color: #d4d4d8; font-size: 16px; line-height: 1.8;">
            <li>Exclusive member-only events</li>
            <li>Member pricing on merch</li>
            <li>Access to the fleet gallery</li>
            <li>Priority event registration</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background-color: #fff; color: #000; padding: 15px 40px; text-decoration: none; font-weight: bold; font-size: 18px;">
              PAY DUES NOW - $50
            </a>
          </div>
          <p style="color: #71717a; font-size: 14px; text-align: center; margin-top: 40px;">
            Questions? Reply to this email or hit us up on Instagram @cre8truckclub
          </p>
        </div>
      </div>
    `,
  }
}

export function getWelcomeEmail(memberName: string, loginLink: string) {
  return {
    subject: 'Welcome to CRE8 Truck Club!',
    html: `
      <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #fff; text-align: center; font-size: 32px; margin-bottom: 20px; letter-spacing: 2px;">
            CRE8 TRUCK CLUB
          </h1>
          <h2 style="color: #a1a1aa; text-align: center;">Welcome to the Family!</h2>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
            What's up ${memberName},
          </p>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
            You're officially part of CRE8 Truck Club. Welcome to the crew.
          </p>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6;">
            Here's what you get as a member:
          </p>
          <ul style="color: #d4d4d8; font-size: 16px; line-height: 1.8;">
            <li>Access to exclusive member-only events</li>
            <li>Discounted pricing on all merch</li>
            <li>Your truck featured in our gallery</li>
            <li>Connect with fellow truck enthusiasts</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #fff; color: #000; padding: 15px 40px; text-decoration: none; font-weight: bold; font-size: 18px;">
              GO TO YOUR DASHBOARD
            </a>
          </div>
          <p style="color: #71717a; font-size: 14px; text-align: center; margin-top: 40px;">
            Follow us on Instagram @cre8truckclub
          </p>
        </div>
      </div>
    `,
  }
}

export function getTestEmail() {
  return {
    subject: 'CRE8 Truck Club - Email Test',
    html: `
      <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #fff; text-align: center; font-size: 32px; margin-bottom: 20px; letter-spacing: 2px;">
            CRE8 TRUCK CLUB
          </h1>
          <h2 style="color: #a1a1aa; text-align: center;">Email Test Successful!</h2>
          <p style="color: #d4d4d8; font-size: 16px; line-height: 1.6; text-align: center;">
            If you're seeing this, your SendGrid email setup is working correctly.
          </p>
          <p style="color: #71717a; font-size: 14px; text-align: center; margin-top: 40px;">
            Sent from cre8trucks.club
          </p>
        </div>
      </div>
    `,
  }
}

interface OrderItem {
  product_name: string
  quantity: number
  size?: string
  color?: string
  unit_price: number
  total_price: number
}

interface ShippingAddress {
  name?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export function getNewOrderNotificationEmail(
  orderId: string,
  customerName: string,
  customerEmail: string,
  total: number,
  items: OrderItem[],
  shippingAddress: ShippingAddress | null,
  adminLink: string
) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #d4d4d8;">
        ${item.product_name}
        ${item.size ? `<br><small style="color: #71717a;">Size: ${item.size}</small>` : ''}
        ${item.color ? `<small style="color: #71717a;"> • Color: ${item.color}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #d4d4d8; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #333; color: #d4d4d8; text-align: right;">$${item.total_price.toFixed(2)}</td>
    </tr>
  `).join('')

  const addressHtml = shippingAddress ? `
    <div style="background-color: #1a1a1a; padding: 15px; margin: 20px 0;">
      <h3 style="color: #fff; margin: 0 0 10px 0; font-size: 14px;">SHIP TO:</h3>
      <p style="color: #d4d4d8; margin: 0; line-height: 1.6;">
        ${shippingAddress.name || customerName}<br>
        ${shippingAddress.line1 || ''}${shippingAddress.line2 ? '<br>' + shippingAddress.line2 : ''}<br>
        ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}<br>
        ${shippingAddress.country || 'USA'}
      </p>
    </div>
  ` : ''

  return {
    subject: `🚨 New Order - $${total.toFixed(2)} from ${customerName}`,
    html: `
      <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto;">
          <h1 style="color: #fff; text-align: center; font-size: 32px; margin-bottom: 20px; letter-spacing: 2px;">
            CRE8 TRUCK CLUB
          </h1>
          <h2 style="color: #22c55e; text-align: center;">New Order Received!</h2>

          <div style="background-color: #1a1a1a; padding: 15px; margin: 20px 0;">
            <p style="color: #71717a; margin: 0; font-size: 12px;">ORDER ID</p>
            <p style="color: #fff; margin: 5px 0 0 0; font-family: monospace;">${orderId}</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin: 20px 0;">
            <div>
              <p style="color: #71717a; margin: 0; font-size: 12px;">CUSTOMER</p>
              <p style="color: #fff; margin: 5px 0 0 0;">${customerName}</p>
              <p style="color: #d4d4d8; margin: 5px 0 0 0; font-size: 14px;">${customerEmail}</p>
            </div>
            <div style="text-align: right;">
              <p style="color: #71717a; margin: 0; font-size: 12px;">TOTAL</p>
              <p style="color: #22c55e; margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">$${total.toFixed(2)}</p>
            </div>
          </div>

          ${addressHtml}

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr>
                <th style="padding: 10px; border-bottom: 2px solid #333; text-align: left; color: #71717a; font-size: 12px;">ITEM</th>
                <th style="padding: 10px; border-bottom: 2px solid #333; text-align: center; color: #71717a; font-size: 12px;">QTY</th>
                <th style="padding: 10px; border-bottom: 2px solid #333; text-align: right; color: #71717a; font-size: 12px;">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminLink}" style="background-color: #fff; color: #000; padding: 15px 40px; text-decoration: none; font-weight: bold; font-size: 16px;">
              VIEW ORDER IN ADMIN
            </a>
          </div>

          <p style="color: #71717a; font-size: 12px; text-align: center; margin-top: 40px;">
            This notification was sent because you have order notifications enabled.
          </p>
        </div>
      </div>
    `,
  }
}
