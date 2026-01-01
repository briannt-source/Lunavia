import { AlertTriangle, Bell, ChevronDown, Eye, MapPin, Plus, Search, Settings, X } from "lucide-react"

export interface EditTourPageProps {}

export default function EditTourPage(_props: EditTourPageProps) {
  return (
    <div className="bg-background-light dark:bg-[#111418] font-display text-white min-h-screen flex flex-col">
      {/* Top Navigation */}
      <div className="relative flex w-full flex-col bg-[#111418] dark group/design-root overflow-x-hidden border-b border-[#283039]">
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap px-10 py-3">
            <div className="flex items-center gap-4 text-white">
              <div className="size-8 flex items-center justify-center text-primary">
                ✈️
              </div>
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">TourConnect B2B</h2>
            </div>
            <div className="flex flex-1 justify-end gap-8">
              <div className="flex gap-2">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#283039] hover:bg-[#3e4856] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#283039] hover:bg-[#3e4856] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#283039]" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD8Lwsio6FJYqIjKAhg7XLNAwCs94uFr7nWmi9ao1yJZwTh5WrhHeDiwBA25vOCsFIOQeK3urQNOiAIqcM_lcAGgawIX0MWNSZWlArmbdfg9eE1GjaPpRyzjuyWkupVYQj4zYT4VfXZIFPYxs3188XBAttGCslb0jI1vKVwZbApaifFP8A4PdqO95H1LeGTa6HQx1rpFbXNDK9WjR9fdx5q50HTXdso7u83VfvCLRSaRd7qXiJDlNTS3Jx3vJ0vh_S81JRTPaMVwg")' }} />
            </div>
          </header>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex justify-center py-5 px-4 md:px-10 lg:px-40">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-6 pb-20">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 px-4">
            <a className="text-[#9dabb9] hover:text-white transition-colors text-sm font-medium leading-normal flex items-center gap-1" href="#">
              <MapPin className="w-4 h-4" />
              Quản lý Tour
            </a>
            <span className="text-[#9dabb9] text-sm font-medium leading-normal">/</span>
            <a className="text-[#9dabb9] hover:text-white transition-colors text-sm font-medium leading-normal" href="#">Danh sách Tour</a>
            <span className="text-[#9dabb9] text-sm font-medium leading-normal">/</span>
            <span className="text-white text-sm font-medium leading-normal">Chỉnh sửa Tour</span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-wrap justify-between items-end gap-3 px-4">
            <div className="flex min-w-72 flex-col gap-2">
              <h1 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Chỉnh sửa: Khám phá Di sản Hà Nội</h1>
              <div className="flex items-center gap-3 text-[#9dabb9] text-sm font-normal leading-normal">
                <span className="bg-[#283039] px-2 py-1 rounded text-xs text-white border border-[#3e4856]">Mã: HN-2025-OCT-01</span>
                <span className="flex items-center gap-1 text-green-400">
                  ✅ Đang hoạt động
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-[#283039] hover:bg-[#3e4856] text-white text-sm font-bold border border-[#3e4856] transition-colors">
                Xem trang chi tiết
              </button>
            </div>
          </div>

          {/* Context/Status Banner */}
          <div className="px-4">
            <div className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl overflow-hidden relative p-6" style={{ backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(19, 127, 236, 0.6) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9HO31s1Qflsgws_RUmvucYpfSgS88Jx_e9RAXMorCnFA1pW4WuHNN_w0dx4gLatD0fFDQqA2Foz1A_8Gb9EzzdMEtEaqRosS1tEdw4XnlTnKMHeRze8biyDFs-9RbBZ7TLOmKAbx4-jrb4_-qpKpNbs5eJw9fM3T-4SZV9EW28V1g4d_PtOxxsUK6cp9Vuk6PmfPUVYN1EVbTNVfx5GM_B9b6hqPwcWj_CfxkYf79pJ08M5HaFTfQeX2C3z-5ZKaKQoQRszGnIQ")' }}>
              <div className="flex w-full flex-col md:flex-row items-start md:items-end justify-between gap-4 z-10">
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <p className="text-white tracking-light text-xl font-bold leading-tight">Lưu ý chỉnh sửa quan trọng</p>
                  </div>
                  <p className="text-white/90 text-sm md:text-base font-medium leading-normal max-w-[600px]">
                    Tour này hiện đã có <strong className="text-white underline decoration-wavy decoration-amber-400">3 hướng dẫn viên ứng tuyển</strong>. Mọi thay đổi về lịch trình, chi phí hoặc giảm số lượng slot sẽ cần sự phê duyệt của Admin trước khi áp dụng.
                  </p>
                </div>
                <button className="flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors border border-white/30">
                  <span className="truncate">Xem quy định xét duyệt</span>
                </button>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <form className="flex flex-col gap-6 px-4">
            {/* 1. General Info */}
            <div className="flex flex-col gap-4 bg-[#1a2027] p-6 rounded-xl border border-[#283039]">
              <h2 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">1</span>
                Thông tin chung
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Tên Tour <span className="text-red-500">*</span></label>
                  <input className="bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3 placeholder-[#576475]" type="text" defaultValue="Khám phá Di sản Hà Nội - Trọn vẹn 1 ngày" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Điểm đến chính</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-[#9dabb9]" />
                    <input className="pl-10 bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full py-3 placeholder-[#576475]" type="text" defaultValue="Hà Nội, Việt Nam" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#9dabb9] text-sm font-medium">Mô tả chi tiết</label>
                <div className="flex flex-col rounded-lg border border-[#3e4856] bg-[#283039] overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                  {/* Fake Toolbar */}
                  <div className="flex items-center gap-1 p-2 border-b border-[#3e4856] bg-[#222831]">
                    <button className="p-1.5 text-[#9dabb9] hover:text-white hover:bg-[#3e4856] rounded text-sm font-bold" type="button">B</button>
                    <button className="p-1.5 text-[#9dabb9] hover:text-white hover:bg-[#3e4856] rounded italic text-sm font-bold" type="button">I</button>
                    <button className="p-1.5 text-[#9dabb9] hover:text-white hover:bg-[#3e4856] rounded" type="button">•</button>
                    <div className="w-px h-4 bg-[#3e4856] mx-1"></div>
                    <button className="p-1.5 text-[#9dabb9] hover:text-white hover:bg-[#3e4856] rounded" type="button">🔗</button>
                  </div>
                  <textarea className="bg-transparent text-white text-sm border-none focus:ring-0 px-4 py-3 resize-y placeholder-[#576475]" rows={4} defaultValue="Hành trình khám phá các địa danh lịch sử nổi tiếng tại Hà Nội bao gồm Lăng Bác, Văn Miếu, và Phố Cổ. Tour được thiết kế dành cho khách quốc tế muốn tìm hiểu sâu về văn hóa." />
                </div>
              </div>
            </div>

            {/* 2. Logistics */}
            <div className="flex flex-col gap-4 bg-[#1a2027] p-6 rounded-xl border border-[#283039]">
              <h2 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">2</span>
                Lịch trình & Thời gian
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Ngày bắt đầu</label>
                  <input className="bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3" type="date" defaultValue="2025-10-01" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Ngày kết thúc</label>
                  <input className="bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3" type="date" defaultValue="2025-10-01" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Tổng thời gian</label>
                  <input className="bg-[#181d23] text-[#7a8694] text-sm rounded-lg border border-[#283039] cursor-not-allowed px-4 py-3" readOnly type="text" defaultValue="1 Ngày" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#9dabb9] text-sm font-medium">Điểm tập trung</label>
                <div className="flex items-center gap-3">
                  <input className="flex-1 bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3" type="text" defaultValue="Nhà Hát Lớn Hà Nội, Số 1 Tràng Tiền" />
                  <button className="text-primary hover:text-blue-400 text-sm font-bold flex items-center gap-1 whitespace-nowrap" type="button">
                    <MapPin className="w-4 h-4" /> Ghim trên bản đồ
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Guide Requirements */}
            <div className="flex flex-col gap-4 bg-[#1a2027] p-6 rounded-xl border border-[#283039]">
              <h2 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">3</span>
                Yêu cầu Hướng dẫn viên
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Loại thẻ HDV <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select className="appearance-none bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full px-4 py-3 pr-10">
                      <option>Thẻ Quốc tế (International)</option>
                      <option>Thẻ Nội địa (Domestic)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-[#9dabb9] pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Ngôn ngữ yêu cầu</label>
                  <div className="flex gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#137fec]/20 text-primary border border-primary/30 text-xs font-bold">
                      Tiếng Anh <button className="hover:text-white" type="button"><X className="w-3 h-3" /></button>
                    </span>
                    <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#283039] hover:bg-[#3e4856] text-white border border-[#3e4856] text-xs transition-colors" type="button">
                      <Plus className="w-3 h-3" /> Thêm ngôn ngữ
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Số lượng cần tuyển</label>
                  <div className="flex items-center gap-4">
                    <input className="bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full px-4 py-3" min="3" type="number" defaultValue="5" />
                    <div className="text-[#9dabb9] text-xs flex-1">
                      <span className="text-amber-500 flex items-center gap-1 font-medium mb-0.5">
                        🔒 Tối thiểu: 3
                      </span>
                      Do đã có 3 HDV được chấp nhận.
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Kinh nghiệm tối thiểu</label>
                  <div className="relative">
                    <select className="appearance-none bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full px-4 py-3 pr-10">
                      <option>Trên 2 năm</option>
                      <option>Trên 5 năm</option>
                      <option>Không yêu cầu</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-[#9dabb9] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Pricing */}
            <div className="flex flex-col gap-4 bg-[#1a2027] p-6 rounded-xl border border-[#283039]">
              <h2 className="text-white text-xl font-bold leading-tight flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs">4</span>
                Chi phí & Thù lao
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Thù lao HDV (VNĐ/Ngày) <span className="text-red-500">*</span></label>
                  <input className="bg-[#283039] text-white text-sm font-bold rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3 text-right" type="text" defaultValue="1.500.000" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[#9dabb9] text-sm font-medium">Tiền Tips (Dự kiến)</label>
                  <input className="bg-[#283039] text-white text-sm rounded-lg border border-[#3e4856] focus:border-primary focus:ring-1 focus:ring-primary outline-none px-4 py-3 text-right" type="text" defaultValue="300.000 - 500.000" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[#9dabb9] text-sm font-medium">Bao gồm (Inclusions)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[#3e4856] bg-[#222831] cursor-pointer hover:bg-[#283039]">
                    <input defaultChecked className="rounded border-gray-600 bg-[#181d23] text-primary" type="checkbox" />
                    <span className="text-sm">Ăn trưa</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[#3e4856] bg-[#222831] cursor-pointer hover:bg-[#283039]">
                    <input defaultChecked className="rounded border-gray-600 bg-[#181d23] text-primary" type="checkbox" />
                    <span className="text-sm">Vé tham quan</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[#3e4856] bg-[#222831] cursor-pointer hover:bg-[#283039]">
                    <input defaultChecked className="rounded border-gray-600 bg-[#181d23] text-primary" type="checkbox" />
                    <span className="text-sm">Xe đưa đón</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-[#3e4856] bg-[#222831] cursor-pointer hover:bg-[#283039]">
                    <input className="rounded border-gray-600 bg-[#181d23] text-primary" type="checkbox" />
                    <span className="text-sm">Bảo hiểm</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 5. Reason for Edit */}
            <div className="flex flex-col gap-4 bg-amber-900/10 p-6 rounded-xl border border-amber-900/30">
              <h2 className="text-amber-500 text-xl font-bold leading-tight flex items-center gap-2">
                ✎ Lý do chỉnh sửa
              </h2>
              <p className="text-[#9dabb9] text-sm">Vui lòng nhập lý do cụ thể để Admin và các HDV đã ứng tuyển nắm được thông tin thay đổi.</p>
              <textarea className="bg-[#283039] text-white text-sm rounded-lg border border-amber-500/30 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none px-4 py-3 placeholder-[#576475]" placeholder="Ví dụ: Thay đổi địa điểm đón khách do yêu cầu từ đoàn khách..." rows={3}></textarea>
            </div>

            {/* Action Footer */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#111418]/95 backdrop-blur-md border-t border-[#283039] flex justify-end gap-4 mt-4 z-50 rounded-t-xl -mx-4 md:mx-0">
              <button className="h-12 px-6 rounded-lg bg-transparent hover:bg-[#283039] text-white font-bold border border-[#3e4856] transition-colors" type="button">
                Hủy bỏ
              </button>
              <button className="h-12 px-6 rounded-lg bg-[#283039] hover:bg-[#3e4856] text-white font-bold transition-colors" type="button">
                Lưu bản nháp
              </button>
              <button className="h-12 px-8 rounded-lg bg-primary hover:bg-[#116ecf] text-white font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2" type="button">
                📤 Gửi duyệt thay đổi
              </button>
            </div>
            <div className="text-center text-[#576475] text-xs py-4">
              Thông tin được xử lý tuân thủ Luật Du lịch Việt Nam 2025.
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
