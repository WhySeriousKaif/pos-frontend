import jsPDF from 'jspdf'

/**
 * Generate a PDF invoice for an order
 * @param {Object} order - The order object
 * @param {Object} options - Additional options
 * @returns {jsPDF} - The PDF document
 */
export const generateInvoicePDF = (order, options = {}) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let yPos = margin

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredHeight) => {
    if (yPos + requiredHeight > pageHeight - margin) {
      doc.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Header
  doc.setFontSize(24)
  doc.setTextColor(22, 163, 74) // Green color
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' })
  yPos += 10

  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice #${order.id}`, pageWidth - margin, yPos, { align: 'right' })
  yPos += 15

  // Company/Branch Info
  const branchName = order.branch?.name || order.branch?.store?.brand || 'POS System'
  const branchAddress = order.branch?.address || ''
  const branchPhone = order.branch?.phone || ''
  const branchEmail = order.branch?.email || ''

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text(branchName, margin, yPos)
  yPos += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  if (branchAddress) {
    doc.text(branchAddress, margin, yPos)
    yPos += 5
  }
  if (branchPhone) {
    doc.text(`Phone: ${branchPhone}`, margin, yPos)
    yPos += 5
  }
  if (branchEmail) {
    doc.text(`Email: ${branchEmail}`, margin, yPos)
    yPos += 5
  }
  yPos += 10

  // Customer Info
  const customerName = order.customer?.name || order.customer?.fullName || 'Walk-in Customer'
  const customerEmail = order.customer?.email || ''
  const customerPhone = order.customer?.phone || ''

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Bill To:', margin, yPos)
  yPos += 6

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(customerName, margin, yPos)
  yPos += 5
  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, margin, yPos)
    yPos += 5
  }
  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, margin, yPos)
    yPos += 5
  }
  yPos += 10

  // Invoice Details
  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString()

  const invoiceTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleTimeString()

  doc.setFontSize(10)
  doc.text(`Date: ${invoiceDate}`, pageWidth - margin, yPos - 20, { align: 'right' })
  doc.text(`Time: ${invoiceTime}`, pageWidth - margin, yPos - 15, { align: 'right' })
  doc.text(`Payment: ${getPaymentMethodLabel(order.paymentType)}`, pageWidth - margin, yPos - 10, {
    align: 'right',
  })
  doc.text(`Status: ${getStatusLabel(order.status)}`, pageWidth - margin, yPos - 5, {
    align: 'right',
  })

  yPos += 15

  // Line separator
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Order Items Table Header
  checkPageBreak(20)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F')
  doc.text('Item', margin + 2, yPos + 6)
  doc.text('Qty', pageWidth - 120, yPos + 6, { align: 'right' })
  doc.text('Price', pageWidth - 80, yPos + 6, { align: 'right' })
  doc.text('Total', pageWidth - margin, yPos + 6, { align: 'right' })
  yPos += 12

  // Order Items
  doc.setFont('helvetica', 'normal')
  const orderItems = order.orderItems || []
  orderItems.forEach((item, index) => {
    checkPageBreak(15)
    const productName = item.product?.name || 'Unknown Product'
    const sku = item.product?.sku || ''
    const quantity = item.quantity || 0
    const price = item.price || 0
    const total = quantity * price

    // Truncate product name if too long
    const maxNameWidth = pageWidth - 140
    let displayName = productName
    if (doc.getTextWidth(displayName) > maxNameWidth) {
      displayName = doc.splitTextToSize(displayName, maxNameWidth)[0] + '...'
    }

    doc.text(displayName, margin + 2, yPos + 5)
    if (sku) {
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`SKU: ${sku}`, margin + 2, yPos + 9)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
    }
    doc.text(quantity.toString(), pageWidth - 120, yPos + 5, { align: 'right' })
    doc.text(formatCurrency(price), pageWidth - 80, yPos + 5, { align: 'right' })
    doc.text(formatCurrency(total), pageWidth - margin, yPos + 5, { align: 'right' })

    yPos += 12
  })

  yPos += 5

  // Line separator
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Totals
  checkPageBreak(30)
  const subtotal = order.subtotal || order.totalAmount || 0
  const discount = order.discountAmount || 0
  const tax = order.tax || 0
  const total = order.totalAmount || 0

  if (discount > 0) {
    doc.setFontSize(10)
    doc.text('Subtotal:', pageWidth - 80, yPos, { align: 'right' })
    doc.text(formatCurrency(subtotal), pageWidth - margin, yPos, { align: 'right' })
    yPos += 8

    doc.text('Discount:', pageWidth - 80, yPos, { align: 'right' })
    doc.setTextColor(220, 38, 38) // Red for discount
    doc.text(`-${formatCurrency(discount)}`, pageWidth - margin, yPos, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    yPos += 8
  }

  if (tax > 0) {
    doc.text('Tax:', pageWidth - 80, yPos, { align: 'right' })
    doc.text(formatCurrency(tax), pageWidth - margin, yPos, { align: 'right' })
    yPos += 8
  }

  // Total
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setFillColor(22, 163, 74) // Green background
  doc.setTextColor(255, 255, 255) // White text
  doc.rect(pageWidth - 80, yPos - 5, 60, 10, 'F')
  doc.text('Total:', pageWidth - 80, yPos + 2, { align: 'right' })
  doc.text(formatCurrency(total), pageWidth - margin, yPos + 2, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  yPos += 20

  // Footer
  checkPageBreak(30)
  doc.setFontSize(8)
  doc.setTextColor(128, 128, 128)
  doc.setFont('helvetica', 'italic')
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' })
  yPos += 5

  if (order.orderNote) {
    doc.text(`Note: ${order.orderNote}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 5
  }

  // Cashier info
  const cashierName = order.cashier?.fullName || order.cashier?.email || 'Unknown'
  doc.text(`Processed by: ${cashierName}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 5

  // Footer line
  doc.setDrawColor(200, 200, 200)
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20)
  doc.setFontSize(7)
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  return doc
}

/**
 * Download invoice as PDF
 * @param {Object} order - The order object
 * @param {string} filename - Optional filename (default: invoice-{orderId}.pdf)
 */
export const downloadInvoicePDF = (order, filename = null) => {
  const doc = generateInvoicePDF(order)
  const invoiceFilename = filename || `invoice-${order.id || 'order'}.pdf`
  doc.save(invoiceFilename)
}

/**
 * Get payment method label
 */
const getPaymentMethodLabel = (method) => {
  if (!method) return 'Cash'
  const methodMap = {
    CASH: 'Cash',
    CARD: 'Card',
    UPI: 'UPI',
    DEBIT_CARD: 'Debit Card',
    CREDIT_CARD: 'Credit Card',
  }
  return methodMap[method] || method
}

/**
 * Get status label
 */
const getStatusLabel = (status) => {
  if (!status) return 'N/A'
  const statusMap = {
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    REFUNDED: 'Refunded',
  }
  return statusMap[status] || status
}

/**
 * Format currency
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

