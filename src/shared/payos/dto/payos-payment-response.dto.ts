export interface CheckoutResponse {
  bin: string, // Mã BIN ngân hàng
  accountNumber: string, // Số tài khoản của kênh thanh toán
  accountName: string, // Tên chủ tài khoản của kênh thanh toán
  amount: number, // Số tiền của đơn hàng
  description: string, // Mô tả đơn hàng, được sử dụng làm nội dung chuyển khoản
  orderCode: number, // Mã đơn hàng
  currency: string, // Đơn vị tiền tệ
  paymentLinkId: string, // ID link thanh toán
  status: string, // Trạng thái của link thanh toán
  checkoutUrl: string, // Đường dẫn trang thanh toán
  qrCode: string, // Mã QR thanh toán
}
