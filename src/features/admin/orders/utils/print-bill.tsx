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
}

export async function printBill(options: PrintBillOptions): Promise<void> {
  const { order, billType, paymentMethod, description, qrCodeData, tenantName, tenantAddress } =
    options

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

  const billTitle = billType === 'temporary' ? 'PHIẾU TẠM TÍNH' : 'HÓA ĐƠN THANH TOÁN'
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
  })

  // Create hidden iframe for printing
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.top = '-10000px'
  iframe.style.left = '-10000px'
  iframe.style.width = '80mm'
  iframe.style.height = '100vh'
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
            size: 80mm 200mm;
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
          <div class="restaurant-name">${tenantName || 'NHÀ HÀNG'}</div>
          ${tenantAddress ? `<div class="restaurant-info">${tenantAddress}</div>` : ''}
          <div class="bill-type">${billTitle}</div>
        </div>

        <div class="info-section">
          <div class="info-row">
            <span class="label">Mã đơn:</span>
            <span>${order.orderNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Bàn:</span>
            <span>Bàn ${order.table?.tableNumber || 'N/A'} - ${order.table?.zone?.name || ''}</span>
          </div>
          <div class="info-row">
            <span class="label">Thời gian:</span>
            <span>${new Date(order.createdAt).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        <div class="items-section">
          <div class="item" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
            <div class="item-name">Món</div>
            <div class="item-qty">SL</div>
            <div class="item-price">Thành tiền</div>
          </div>
          ${order.items
            .map(
              (item) => `
            <div class="item">
              <div class="item-name">${(item as any).name || (item as any).menuItem?.name}</div>
              <div class="item-qty">x${item.quantity}</div>
              <div class="item-price">${item.subtotal.toLocaleString('vi-VN')}₫</div>
            </div>
            ${
              item.modifiers && item.modifiers.length > 0
                ? item.modifiers
                    .map(
                      (mod: any) =>
                        `<div class="item" style="font-size: 10px; padding-left: 10px;">
                      <div class="item-name">+ ${mod.name || mod.modifierName}</div>
                      <div class="item-qty"></div>
                      <div class="item-price">${mod.priceAdjustment.toLocaleString('vi-VN')}₫</div>
                    </div>`,
                    )
                    .join('')
                : ''
            }
            ${
              item.specialInstructions
                ? `<div style="font-size: 10px; padding-left: 10px; font-style: italic; color: #666;">Ghi chú: ${item.specialInstructions}</div>`
                : ''
            }
          `,
            )
            .join('')}
        </div>

        <div class="total-section">
          <div class="total-row">
            <span>Tạm tính:</span>
            <span>${order.subtotal.toLocaleString('vi-VN')}₫</span>
          </div>
          ${
            order.discountAmount > 0
              ? `
          <div class="total-row">
            <span>Giảm giá:</span>
            <span>-${order.discountAmount.toLocaleString('vi-VN')}₫</span>
          </div>
          `
              : ''
          }
          ${
            order.taxAmount > 0
              ? `
          <div class="total-row">
            <span>Thuế:</span>
            <span>${order.taxAmount.toLocaleString('vi-VN')}₫</span>
          </div>
          `
              : ''
          }
          <div class="total-row grand-total">
            <span>TỔNG CỘNG:</span>
            <span>${order.totalAmount.toLocaleString('vi-VN')}₫</span>
          </div>
        </div>

        ${
          !isPaid && paymentMethod === 'qr' && qrCodeDataUrl
            ? `
        <div class="qr-section">
          <div class="qr-instruction">QUÉT MÃ ĐỂ THANH TOÁN</div>
          <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
          <div style="font-size: 11px; margin-top: 10px;">Quét mã QR bằng ứng dụng ngân hàng</div>
        </div>
        `
            : ''
        }

        <div class="footer">
          <div class="thank-you">CẢM ƠN QUÝ KHÁCH!</div>
          <div style="font-size: 10px;">Một sản phẩm của Qrenso - qrenso.site</div>
        </div>
      </body>
    </html>
  `
}
