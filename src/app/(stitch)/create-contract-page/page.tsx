import { Bell, Copy, Download, Edit2, Mail, Search, UploadCloud, Check } from "lucide-react"

export interface CreateContractPageProps {}

export default function CreateContractPage(_props: CreateContractPageProps) {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-white overflow-x-hidden">
      <div className="relative flex h-auto min-h-screen w-full flex-col">
        {/* Top Navigation */}
        <div className="layout-container flex w-full flex-col bg-white dark:bg-[#1e2732] border-b border-[#f0f2f4] dark:border-[#2a3541]">
          <div className="px-4 md:px-10 py-3 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-4 text-[#111418] dark:text-white">
                <div className="size-8 rounded bg-primary flex items-center justify-center text-white">
                  🤝
                </div>
                <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">TourConnect B2B</h2>
              </div>
              {/* Search Bar */}
              <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="flex border-none bg-[#f0f2f4] dark:bg-[#2a3541] items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <Search className="w-6 h-6 text-[#617589]" />
                  </div>
                  <input className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] dark:bg-[#2a3541] focus:border-none h-full placeholder:text-[#617589] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" placeholder="Tìm kiếm" />
                </div>
              </label>
            </div>
            <div className="flex items-center gap-8">
              <div className="hidden lg:flex items-center gap-9">
                <a className="text-[#111418] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Dashboard</a>
                <a className="text-[#111418] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Tours</a>
                <a className="text-[#111418] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Guides</a>
                <a className="text-primary text-sm font-bold leading-normal" href="#">Hợp đồng</a>
                <a className="text-[#111418] dark:text-white text-sm font-medium leading-normal hover:text-primary transition-colors" href="#">Báo cáo</a>
              </div>
              <button className="flex items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-[#f0f2f4] dark:bg-[#2a3541] hover:bg-gray-200 transition-colors">
                <Bell className="w-6 h-6 text-[#111418] dark:text-white" />
              </button>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-white dark:ring-[#2a3541]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA9EmZ1byuHcZ98UId20NfWLNacqQKg9cBxVtHeTxfr0glDtr5N4w7ELa2mNhzXrbxkdRjHbOKcWRTXcQG8Z2PXtpYAbZV1K2xvDdhGDf-PeGAtGt1C1VohGw-_CiBOmU-zn9u4DkiImFTDSFKhM1yVTPEJk2zHapfMGWu2d2eHSavfFH0qRuqAokZfw9yOgW8AY3ZEgx5upcs2I7ZhRqnr8enVYzLJXSgncaPGCkBTE1o0b-2y_p7OXgZrBFmcSgdVXdEXLrpT3g")' }} />
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="layout-container flex h-full grow flex-col">
          <div className="px-4 md:px-20 xl:px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              {/* Breadcrumbs */}
              <div className="flex flex-wrap gap-2 px-4 py-2">
                <a className="text-[#617589] text-sm font-medium leading-normal hover:underline" href="#">Trang chủ</a>
                <span className="text-[#617589] text-sm font-medium leading-normal">/</span>
                <a className="text-[#617589] text-sm font-medium leading-normal hover:underline" href="#">Quản lý hợp đồng</a>
                <span className="text-[#617589] text-sm font-medium leading-normal">/</span>
                <span className="text-[#111418] dark:text-white text-sm font-medium leading-normal">Tạo hợp đồng mới</span>
              </div>

              {/* Page Heading */}
              <div className="flex flex-wrap justify-between gap-3 px-4 py-6">
                <div className="flex min-w-72 flex-col gap-3">
                  <h1 className="text-[#111418] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Tạo Hợp Đồng Hướng Dẫn Viên</h1>
                  <p className="text-[#617589] text-base font-normal leading-normal">Soạn thảo và gửi hợp đồng dịch vụ cho hướng dẫn viên theo quy định Luật Du lịch 2025.</p>
                </div>
              </div>

              {/* Step 1: Select Tour */}
              <div className="flex flex-col gap-4 px-4 pb-6">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-2 pt-4 border-b border-[#f0f2f4] dark:border-[#2a3541]">1. Chọn Tour & Hướng dẫn viên</h3>
                <div className="flex flex-wrap items-end gap-4 py-2">
                  <div className="flex-1 min-w-[300px]">
                    <label className="block text-sm font-medium text-[#111418] dark:text-white mb-2">Chọn Tour</label>
                    <div className="relative">
                      <select className="form-input appearance-none flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#dbe0e6] dark:border-[#3e4a5b] bg-white dark:bg-[#1e2732] h-14 placeholder:text-[#617589] px-[15px] pr-10 text-base font-normal leading-normal transition-shadow">
                        <option disabled defaultValue="">Tìm kiếm theo tên tour hoặc mã tour...</option>
                        <option value="tour1">Hà Nội - Hạ Long - Ninh Bình (3N2Đ) - Mã: HLNB001</option>
                        <option value="tour2">Đà Nẵng - Hội An - Bà Nà (4N3Đ) - Mã: DNHA002</option>
                        <option value="tour3">Sài Gòn - Miền Tây (2N1Đ) - Mã: SGMT003</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#617589]">
                        ▼
                      </div>
                    </div>
                  </div>
                  <button className="h-14 px-6 rounded-lg bg-background-light dark:bg-[#2a3541] border border-[#dbe0e6] dark:border-[#3e4a5b] text-[#111418] dark:text-white font-bold hover:bg-gray-200 dark:hover:bg-[#344050] transition-colors">
                    Tải mẫu gần đây
                  </button>
                </div>

                {/* Tour Info Card */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex flex-col md:flex-row gap-6 mt-2">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg text-primary dark:text-blue-300">
                      🏖️
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-blue-300 uppercase tracking-wide">Tour Đã Chọn</p>
                      <p className="font-bold text-[#111418] dark:text-white">Hà Nội - Hạ Long - Ninh Bình (3N2Đ)</p>
                      <p className="text-sm text-[#617589] dark:text-gray-400">Khởi hành: 20/10/2025 - Kết thúc: 23/10/2025</p>
                    </div>
                  </div>
                  <div className="w-px bg-blue-200 dark:bg-blue-800 hidden md:block"></div>
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg text-primary dark:text-blue-300">
                      👤
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary dark:text-blue-300 uppercase tracking-wide">Hướng Dẫn Viên</p>
                      <p className="font-bold text-[#111418] dark:text-white">Nguyễn Văn A</p>
                      <p className="text-sm text-[#617589] dark:text-gray-400">Thẻ HDV: 12345678 - Tiếng Anh</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Contract Content */}
              <div className="flex flex-col gap-4 px-4 pb-6 mt-4">
                <div className="flex items-center justify-between border-b border-[#f0f2f4] dark:border-[#2a3541] pb-2 pt-4">
                  <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">2. Nội dung hợp đồng</h3>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                      📄 Mẫu Luật 2025
                    </button>
                    <button className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                      ⏰ Lịch sử mẫu
                    </button>
                  </div>
                </div>

                {/* Rich Text Editor Container */}
                <div className="flex flex-col border border-[#dbe0e6] dark:border-[#3e4a5b] rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#1e2732]">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#f0f2f4] dark:border-[#3e4a5b] bg-[#f8f9fa] dark:bg-[#252f3d]">
                    <div className="flex items-center gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
                      <select className="h-8 bg-transparent text-sm border-none focus:ring-0 text-[#111418] dark:text-white font-medium">
                        <option>Normal Text</option>
                        <option>Heading 1</option>
                        <option>Heading 2</option>
                        <option>Heading 3</option>
                      </select>
                    </div>
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[#617589] dark:text-gray-300 transition-colors" title="Bold">
                      <strong>B</strong>
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[#617589] dark:text-gray-300 transition-colors" title="Italic">
                      <em>I</em>
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[#617589] dark:text-gray-300 transition-colors" title="Underline">
                      <u>U</u>
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[#617589] dark:text-gray-300 transition-colors" title="Bullet List">
                      •
                    </button>
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[#617589] dark:text-gray-300 transition-colors" title="Numbered List">
                      1.
                    </button>
                    <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-[#617589] dark:text-gray-300 transition-colors" title="Insert Variable">
                      {}
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline-block">Chèn biến dữ liệu</span>
                  </div>

                  {/* Editing Area */}
                  <div className="relative w-full bg-[#f0f2f4] dark:bg-[#101922] p-8 overflow-hidden">
                    <div className="min-h-[600px] w-full max-w-[800px] mx-auto bg-white dark:bg-[#1e2732] shadow-sm border border-gray-200 dark:border-gray-700 p-8 outline-none text-[#111418] dark:text-gray-100">
                      <p className="text-center font-bold text-xl mb-6">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br/><span className="font-normal text-base border-b border-black pb-1 inline-block">Độc lập - Tự do - Hạnh phúc</span></p>
                      <h2 className="text-center font-bold text-lg mb-6">HỢP ĐỒNG HƯỚNG DẪN VIÊN DU LỊCH</h2>
                      <p className="text-right italic text-sm mb-4">Số: 2025/HĐ-HDV/XYZ</p>
                      <p className="mb-4">Hôm nay, ngày ... tháng ... năm 2025, tại văn phòng Công ty ABC, chúng tôi gồm:</p>
                      <h3 className="font-bold mb-2">BÊN A: CÔNG TY DU LỊCH TOURCONNECT (Bên thuê)</h3>
                      <ul className="list-disc ml-6 mb-4 space-y-1">
                        <li>Đại diện: Ông/Bà Trần Văn B</li>
                        <li>Chức vụ: Giám đốc điều hành</li>
                        <li>Địa chỉ: 123 Đường Láng, Hà Nội</li>
                      </ul>
                      <h3 className="font-bold mb-2">BÊN B: ÔNG/BÀ NGUYỄN VĂN A (Hướng dẫn viên)</h3>
                      <ul className="list-disc ml-6 mb-4 space-y-1">
                        <li>Số thẻ HDV: 12345678</li>
                        <li>CCCD/CMND: 00109xxxxxxx</li>
                        <li>Điện thoại: 0987xxxxxx</li>
                      </ul>
                      <p className="mb-2 font-bold">Điều 1: Nội dung công việc</p>
                      <p className="mb-4">Bên A đồng ý thuê và Bên B đồng ý nhận hướng dẫn chương trình du lịch:</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded mb-4 border border-blue-100 dark:border-blue-800">
                        <p><strong>Tên Tour:</strong> Hà Nội - Hạ Long - Ninh Bình</p>
                        <p><strong>Thời gian:</strong> 3 ngày 2 đêm</p>
                        <p><strong>Ngày khởi hành:</strong> 20/10/2025</p>
                      </div>
                      <p className="mb-2 font-bold">Điều 2: Thù lao và phương thức thanh toán</p>
                      <p className="mb-4">...</p>
                    </div>
                  </div>

                  {/* Status Bar */}
                  <div className="px-4 py-2 bg-white dark:bg-[#1e2732] border-t border-[#f0f2f4] dark:border-[#3e4a5b] flex justify-between items-center text-xs text-[#617589]">
                    <span>Số từ: 452</span>
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      💾 Đã lưu tự động lúc 14:32
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="px-4 py-6 mb-10">
                <label className="flex items-start gap-3 mb-6 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input defaultChecked className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-[#dbe0e6] dark:border-[#3e4a5b] bg-white dark:bg-[#2a3541] checked:bg-primary checked:border-primary transition-all" type="checkbox" />
                    <span className="material-symbols-outlined absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[16px] text-white opacity-0 peer-checked:opacity-100 pointer-events-none">✓</span>
                  </div>
                  <span className="text-sm text-[#111418] dark:text-gray-300 leading-tight pt-0.5 select-none group-hover:text-primary transition-colors">
                    Tôi xác nhận các điều khoản trong hợp đồng này tuân thủ <a className="text-primary underline" href="#">Luật Du lịch 2025</a> và các quy định hiện hành.
                  </span>
                </label>
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4">
                  <button className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#dbe0e6] dark:border-[#3e4a5b] bg-white dark:bg-[#2a3541] text-[#111418] dark:text-white font-bold hover:bg-gray-50 dark:hover:bg-[#344050] transition-colors flex items-center justify-center gap-2">
                    👁️ Xem trước
                  </button>
                  <button className="w-full sm:w-auto px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2">
                    📧 Tạo & Gửi Hợp Đồng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

