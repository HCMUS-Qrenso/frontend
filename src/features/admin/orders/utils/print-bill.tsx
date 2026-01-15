import QRCode from 'qrcode'
import type { Order, OrderDetail } from '../types/orders'

interface PrintBillOptions {
  order: Order | OrderDetail
  billType: 'temporary' | 'final'
  paymentMethod?: 'cash' | 'qr'
  description?: string
  qrCodeData?: string
  tenantName?: string | null
  tenantAddress?: string | null
  locale?: string
  receiptHeader?: string | null
  receiptFooter?: string | null
  currencySymbol?: string
  invoiceNum?: string | null
}

export async function printBill(options: PrintBillOptions): Promise<void> {
  const {
    order,
    billType,
    paymentMethod,
    description,
    qrCodeData,
    tenantName,
    tenantAddress,
    locale = 'vi',
    receiptHeader,
    receiptFooter,
    currencySymbol = '₫',
    invoiceNum,
  } = options

  // Generate QR code data URL if qrCodeData is provided
  let qrCodeDataUrl: string | undefined
  if (qrCodeData) {
    try {
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
    } catch (error) {
      console.error('Failed to generate QR code:', error)
    }
  }

  // Localized strings
  const translations: Record<
    string,
    {
      billTitle: { temporary: string; final: string }
      orderCode: string
      invoiceNumber: string
      table: string
      time: string
      item: string
      qty: string
      amount: string
      subtotal: string
      discount: string
      tax: string
      total: string
      scanQr: string
      scanQrDesc: string
      thankYou: string
      note: string
    }
  > = {
    vi: {
      billTitle: { temporary: 'PHIẾU TẠM TÍNH', final: 'HÓA ĐƠN THANH TOÁN' },
      orderCode: 'Mã đơn',
      invoiceNumber: 'Số hóa đơn',
      table: 'Bàn',
      time: 'Thời gian',
      item: 'Món',
      qty: 'SL',
      amount: 'Thành tiền',
      subtotal: 'Tạm tính',
      discount: 'Giảm giá',
      tax: 'Thuế',
      total: 'TỔNG CỘNG',
      scanQr: 'QUÉT MÃ ĐỂ THANH TOÁN',
      scanQrDesc: 'Quét mã QR bằng ứng dụng ngân hàng',
      thankYou: 'CẢM ƠN QUÝ KHÁCH!',
      note: 'Ghi chú',
    },
    en: {
      billTitle: { temporary: 'TEMPORARY BILL', final: 'INVOICE' },
      orderCode: 'Order',
      invoiceNumber: 'Invoice No.',
      table: 'Table',
      time: 'Time',
      item: 'Item',
      qty: 'Qty',
      amount: 'Amount',
      subtotal: 'Subtotal',
      discount: 'Discount',
      tax: 'Tax',
      total: 'TOTAL',
      scanQr: 'SCAN TO PAY',
      scanQrDesc: 'Scan QR code with banking app',
      thankYou: 'THANK YOU!',
      note: 'Note',
    },
    zh: {
      billTitle: { temporary: '临时账单', final: '发票' },
      orderCode: '订单号',
      invoiceNumber: '发票号',
      table: '桌号',
      time: '时间',
      item: '项目',
      qty: '数量',
      amount: '金额',
      subtotal: '小计',
      discount: '折扣',
      tax: '税',
      total: '总计',
      scanQr: '扫码支付',
      scanQrDesc: '使用银行应用扫描二维码',
      thankYou: '谢谢！',
      note: '备注',
    },
    fr: {
      billTitle: { temporary: 'FACTURE TEMPORAIRE', final: 'FACTURE' },
      orderCode: 'Commande',
      invoiceNumber: 'N° Facture',
      table: 'Table',
      time: 'Heure',
      item: 'Article',
      qty: 'Qté',
      amount: 'Montant',
      subtotal: 'Sous-total',
      discount: 'Remise',
      tax: 'Taxe',
      total: 'TOTAL',
      scanQr: 'SCANNER POUR PAYER',
      scanQrDesc: "Scanner le code QR avec l'application bancaire",
      thankYou: 'MERCI!',
      note: 'Remarque',
    },
  }

  const t = translations[locale] || translations.vi
  const billTitle = billType === 'temporary' ? t.billTitle.temporary : t.billTitle.final
  const isPaid = billType === 'final'

  const htmlContent = generateBillHTML({
    order,
    billTitle,
    isPaid,
    paymentMethod,
    description,
    qrCodeDataUrl,
    tenantName,
    tenantAddress,
    t,
    receiptHeader,
    receiptFooter,
    currencySymbol,
    invoiceNum,
  })

  // Create hidden iframe for printing
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '-10000px'
  iframe.style.left = '-10000px'
  iframe.style.width = '80mm'
  document.body.appendChild(iframe)

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (!iframeDoc) {
    document.body.removeChild(iframe)
    throw new Error('Không thể tạo iframe để in.')
  }

  iframeDoc.open()
  iframeDoc.write(htmlContent)
  iframeDoc.close()

  // Wait for content to load then print
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()

      // Cleanup after print
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }, 250)
  }
}

interface GenerateBillHTMLOptions {
  order: Order | OrderDetail
  billTitle: string
  isPaid: boolean
  paymentMethod?: 'cash' | 'qr'
  description?: string
  qrCodeDataUrl?: string
  tenantName?: string | null
  tenantAddress?: string | null
  t: any
  receiptHeader?: string | null
  receiptFooter?: string | null
  currencySymbol: string
  invoiceNum?: string | null
}

function generateBillHTML(options: GenerateBillHTMLOptions): string {
  const {
    order,
    billTitle,
    isPaid,
    paymentMethod,
    description,
    qrCodeDataUrl,
    tenantName,
    tenantAddress,
    t,
    receiptHeader,
    receiptFooter,
    currencySymbol,
    invoiceNum,
  } = options
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${billTitle} - ${order.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            padding: 10px;
            width: 80mm;
            margin: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px dashed #000;
          }
          .restaurant-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .restaurant-info {
            font-size: 10px;
            margin-bottom: 4px;
          }
          .bill-type {
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
          }
          .info-section {
            margin: 15px 0;
            padding: 10px 0;
            border-bottom: 1px dashed #000;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .label {
            font-weight: bold;
          }
          .items-section {
            margin: 15px 0;
          }
          .item {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
          }
          .item-name {
            flex: 1;
          }
          .item-qty {
            width: 60px;
            text-align: right;
          }
          .item-price {
            width: 100px;
            text-align: right;
          }
          .total-section {
            margin: 15px 0;
            padding: 10px 0;
            border-top: 2px dashed #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            font-size: 14px;
          }
          .total-row.grand-total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #000;
          }
          .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            text-align: center;
          }
          .thank-you {
            margin: 10px 0;
            font-weight: bold;
          }
          .qr-section {
            margin: 20px 0;
            padding: 15px 0;
            border-top: 2px dashed #000;
            text-align: center;
          }
          .qr-code {
            max-width: 180px;
            height: auto;
            margin: 10px auto;
            display: block;
          }
          .qr-instruction {
            font-size: 12px;
            font-weight: bold;
            margin: 10px 0;
          }
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          @media print {
            html, body {
              width: 80mm;
              margin: 0;
              padding: 0;
            }
            body {
              padding: 5px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="restaurant-name">${tenantName || 'RESTAURANT'}</div>
          ${tenantAddress ? `<div class="restaurant-info">${tenantAddress}</div>` : ''}
          ${receiptHeader ? `<div class="restaurant-info">${receiptHeader}</div>` : ''}
          <div class="bill-type">${billTitle}</div>
        </div>

        <div class="info-section">
          ${
            isPaid && invoiceNum
              ? `
          <div class="info-row">
            <span class="label">${t.invoiceNumber}:</span>
            <span>${invoiceNum}</span>
          </div>
          `
              : ''
          }
          <div class="info-row">
            <span class="label">${t.orderCode}:</span>
            <span>${order.orderNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.table}:</span>
            <span>${t.table} ${order.table?.tableNumber || 'N/A'} - ${order.table?.zone?.name || ''}</span>
          </div>
          <div class="info-row">
            <span class="label">${t.time}:</span>
            <span>${new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div class="items-section">
          <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
            <div class="item-name">${t.item}</div>
            <div class="item-qty">${t.qty}</div>
            <div class="item-price">${t.amount}</div>
          </div>
          ${order.items
            .map(
              (item) => `
            <div class="item">
              <div class="item-name">${(item as any).name || (item as any).menuItem?.name}</div>
              <div class="item-qty">x${item.quantity}</div>
              <div class="item-price">${item.subtotal.toLocaleString()}${currencySymbol}</div>
            </div>
            ${
              item.modifiers && item.modifiers.length > 0
                ? item.modifiers
                    .map(
                      (mod: any) =>
                        `<div class="item" style="font-size: 10px; padding-left: 10px;">
                      <div class="item-name">+ ${mod.name || mod.modifierName}</div>
                      <div class="item-qty"></div>
                      <div class="item-price">${mod.priceAdjustment.toLocaleString()}${currencySymbol}</div>
                    </div>`,
                    )
                    .join('')
                : ''
            }
            ${
              item.specialInstructions
                ? `<div style="font-size: 10px; padding-left: 10px; font-style: italic; color: #666;">${t.note}: ${item.specialInstructions}</div>`
                : ''
            }
          `,
            )
            .join('')}
        </div>

        <div class="total-section">
          <div class="total-row">
            <span>${t.subtotal}:</span>
            <span>${order.subtotal.toLocaleString()}${currencySymbol}</span>
          </div>
          ${
            order.discountAmount > 0
              ? `
          <div class="total-row">
            <span>${t.discount}:</span>
            <span>-${order.discountAmount.toLocaleString()}${currencySymbol}</span>
          </div>
          `
              : ''
          }
          ${
            order.taxAmount > 0
              ? `
          <div class="total-row">
            <span>${t.tax}:</span>
            <span>${order.taxAmount.toLocaleString()}${currencySymbol}</span>
          </div>
          `
              : ''
          }
          <div class="total-row grand-total">
            <span>${t.total}:</span>
            <span>${order.totalAmount.toLocaleString()}${currencySymbol}</span>
          </div>
        </div>

        ${
          !isPaid && paymentMethod === 'qr' && qrCodeDataUrl
            ? `
        <div class="qr-section">
          <div class="qr-instruction">${t.scanQr}</div>
          <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
          <div style="font-size: 11px; margin-top: 10px;">${t.scanQrDesc}</div>
        </div>
        `
            : ''
        }

        <div class="footer">
          ${receiptFooter ? `<div style="font-size: 11px; margin-bottom: 10px;">${receiptFooter}</div>` : ''}
          <div class="thank-you">${t.thankYou}</div>
          <div style="font-size: 10px;">Qrenso - qrenso.site</div>
        </div>
      </body>
    </html>
  `
}
