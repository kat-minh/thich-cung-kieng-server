export interface CheckoutRequest {
  orderCode: number; // Mã đơn hàng
  amount: number; // Số tiền của đơn hàng
  description: string; // Mô tả đơn hàng, được sử dụng làm nội dung chuyển khoản
  cancelUrl: string; // URL của trang web hoặc ứng dụng sẽ được chuyển hướng tới khi khách hàng hủy thanh toán
  returnUrl: string; // URL của trang web hoặc ứng dụng sẽ được chuyển hướng tới khi khách hàng thanh toán thành công
  signature?: string; // Chữ ký cho dữ liệu của đơn hàng, có chức năng kiểm tra tính toàn vẹn của dữ liệu
  items?: PayOSItem[];
  buyerName?: string; // Tên người mua hàng
  buyerEmail?: string; // Email người mua hàng
  buyerPhone?: string; // Số điện thoại người mua hàng
  buyerAddress?: string; // Địa chỉ người mua hàng
  expiredAt?: number; // Thời gian hết hạn của link thanh toán
}

export interface PayOSItem {
  name: string;
  quantity: number;
  price: number;
}
