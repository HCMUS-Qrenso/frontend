export function Footer() {
  return (
    <footer id="contact" className="bg-white py-12 dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl">
                <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Qrenso</span>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Giải pháp QR Ordering & quản lý nhà hàng toàn diện
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Sản phẩm</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#features" className="hover:text-slate-900 dark:hover:text-white">
                  Tính năng
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white">
                  Bảng giá
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Case studies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Roadmap
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Công ty</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-slate-900 dark:hover:text-white">
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">Pháp lý</h3>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 dark:hover:text-white">
                  Chính sách hoàn tiền
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-slate-200 pt-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>© 2025 Qrenso. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
