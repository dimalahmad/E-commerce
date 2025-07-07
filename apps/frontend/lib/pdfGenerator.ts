import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Order } from '@/store/useOrderStore'
import { formatPrice } from './utils'

export const generateInvoicePDF = async (order: Order) => {
  // Create a temporary div for the invoice content
  const invoiceDiv = document.createElement('div')
  invoiceDiv.style.position = 'absolute'
  invoiceDiv.style.left = '-9999px'
  invoiceDiv.style.top = '0'
  invoiceDiv.style.width = '800px'
  invoiceDiv.style.backgroundColor = '#ffffff'
  invoiceDiv.style.color = '#000000'
  invoiceDiv.style.padding = '40px'
  invoiceDiv.style.fontFamily = 'Arial, sans-serif'
  invoiceDiv.style.fontSize = '12px'
  invoiceDiv.style.lineHeight = '1.4'

  // Ambil user info
  let userInfo = order.user || order.userData || order.userInfo || null;
  let userDetailHtml = '';
  if (userInfo) {
    userDetailHtml = `
      <div style="margin-bottom: 10px;">
        <h3 style="color: #1e293b; margin: 0 0 5px 0; font-size: 15px;">USER INFORMATION</h3>
        <p style="margin: 2px 0; color: #374151;"><strong>Username:</strong> ${userInfo.username || '-'} </p>
        <p style="margin: 2px 0; color: #374151;"><strong>Email:</strong> ${userInfo.email || '-'} </p>
        <p style="margin: 2px 0; color: #374151;"><strong>User ID:</strong> ${userInfo.id || '-'} </p>
      </div>
    `;
  }

  // Status label
  const statusLabel = (order.statusLabel || order.statusText || order.status || '').toString().toUpperCase();

  invoiceDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: bold;">BLANGKIS</h1>
      <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Modern E-Commerce for Blangkon</p>
      <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Jl. Blangkon No. 123, Yogyakarta</p>
      <p style="color: #64748b; margin: 5px 0; font-size: 14px;">Phone: +62 812-3456-7890 | Email: info@blangkis.com</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
      <div>
        <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">INVOICE</h3>
        <p style="margin: 5px 0; color: #374151;"><strong>Invoice No:</strong> ${order.orderNumber}</p>
        <p style="margin: 5px 0; color: #374151;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
        <p style="margin: 5px 0; color: #374151;"><strong>Status:</strong> ${statusLabel}</p>
      </div>
      <div style="text-align: right;">
        <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">SHIP TO</h3>
        <p style="margin: 5px 0; color: #374151;">${order.shippingAddress?.name || order.shipping?.address || '-'}</p>
        <p style="margin: 5px 0; color: #374151;">${order.shippingAddress?.phone || order.shipping?.phone || '-'}</p>
        <p style="margin: 5px 0; color: #374151;">${order.shippingAddress?.address || order.shipping?.address || '-'}</p>
        <p style="margin: 5px 0; color: #374151;">${order.shippingAddress?.city || order.shipping?.city || ''}${order.shippingAddress?.province ? ', ' + order.shippingAddress.province : ''}</p>
        <p style="margin: 5px 0; color: #374151;">${order.shippingAddress?.postal_code || order.shipping?.postalCode || ''}</p>
      </div>
    </div>
    ${userDetailHtml}

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
          <th style="padding: 12px; text-align: left; color: #1e293b; font-weight: bold;">Item</th>
          <th style="padding: 12px; text-align: center; color: #1e293b; font-weight: bold;">Qty</th>
          <th style="padding: 12px; text-align: right; color: #1e293b; font-weight: bold;">Price</th>
          <th style="padding: 12px; text-align: right; color: #1e293b; font-weight: bold;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(item => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 12px; color: #374151;">
              <div>
                <strong>${item.product.name}</strong><br>
                <span style="color: #6b7280; font-size: 11px;">${item.product.description}</span>
              </div>
            </td>
            <td style="padding: 12px; text-align: center; color: #374151;">${item.quantity}</td>
            <td style="padding: 12px; text-align: right; color: #374151;">${formatPrice(item.price)}</td>
            <td style="padding: 12px; text-align: right; color: #374151; font-weight: bold;">${formatPrice(item.subtotal)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
      <div style="width: 300px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #374151;">Subtotal:</span>
          <span style="color: #374151;">${formatPrice(order.subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #374151;">Shipping:</span>
          <span style="color: #374151;">${formatPrice(order.shippingCost)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-top: 2px solid #e2e8f0; padding-top: 8px;">
          <span style="color: #1e293b; font-weight: bold; font-size: 16px;">Total:</span>
          <span style="color: #1e293b; font-weight: bold; font-size: 16px;">${formatPrice(order.total)}</span>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">PAYMENT INFORMATION</h3>
      <p style="margin: 5px 0; color: #374151;"><strong>Method:</strong> ${order.paymentMethod.name}</p>
      <p style="margin: 5px 0; color: #374151;"><strong>Type:</strong> ${order.paymentMethod.type.toUpperCase().replace('_', ' ')}</p>
    </div>

    <div style="margin-bottom: 30px;">
      <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 16px;">SHIPPING INFORMATION</h3>
      <p style="margin: 5px 0; color: #374151;"><strong>Courier:</strong> ${order.shippingMethod.courier.toUpperCase()}</p>
      <p style="margin: 5px 0; color: #374151;"><strong>Service:</strong> ${order.shippingMethod.service}</p>
      <p style="margin: 5px 0; color: #374151;"><strong>Estimated Delivery:</strong> ${order.shippingMethod.etd} days</p>
    </div>

    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
      <p style="color: #64748b; margin: 5px 0; font-size: 12px;">Thank you for your purchase!</p>
      <p style="color: #64748b; margin: 5px 0; font-size: 12px;">For any questions, please contact us at support@blangkis.com</p>
    </div>
  `

  // Add the div to the document
  document.body.appendChild(invoiceDiv)

  try {
    // Convert the div to canvas
    const canvas = await html2canvas(invoiceDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })

    // Remove the temporary div
    document.body.removeChild(invoiceDiv)

    // Create PDF
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save the PDF
    pdf.save(`invoice-${order.orderNumber}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    document.body.removeChild(invoiceDiv)
    throw error
  }
}