import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Search,
  Verified,
  Wallet,
  FileText,
  Scale,
  Building2,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Mail,
} from "lucide-react";

export default function FAQPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-white overflow-x-hidden antialiased">
      <div className="relative flex min-h-screen w-full flex-col">
        {/* Top Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark bg-background-dark px-4 py-3 md:px-10 sticky top-0 z-50">
          <div className="flex items-center gap-4 text-white">
            <div className="size-8 flex items-center justify-center text-primary">
              <MapPin className="w-8 h-8" />
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              Tourism Connect
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <Link
                className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
                href="#"
              >
                Trang chủ
              </Link>
              <Link
                className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
                href="#"
              >
                Về chúng tôi
              </Link>
              <Link
                className="text-white text-sm font-medium leading-normal hover:text-primary transition-colors"
                href="#"
              >
                Liên hệ
              </Link>
            </div>
            <div className="flex gap-2">
              <Button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Đăng nhập</span>
              </Button>
              <Button
                variant="outline"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-dark border border-border-dark hover:bg-border-dark transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <span className="truncate">Đăng ký</span>
              </Button>
            </div>
          </div>
        </header>
        {/* Hero Search Section */}
        <div className="flex flex-col">
          <div className="@container">
            <div className="@[480px]:p-4">
              <div
                className="flex min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-lg items-center justify-center p-4 relative overflow-hidden"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(17, 20, 24, 0.7) 0%, rgba(17, 20, 24, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuALIY-2rT44msRC1up5TuMKb1cPf166EbBAQnsevTVZFgandrqXbP86llDXwJfhFF-eHeK2feeuHkwtKhaZC8t-1HXfzLI4rGFhVaqoq_LJfesdhHMpDxWYb8WB6Eka4Rx4PfHfFKqhNIKSA92xMM4C5jdqmN7IzWtzz4kGrpa9A9WEDOH2LkJUh_tLufBKANmdaO7jmZ-GZig0ED33ufZ3RIFtNNDF2pWyc_QcOfVE1UXF_uNYWVd0QdEs3XkucQE2qTiR7R59JA")',
                }}
              >
                <div className="flex flex-col gap-2 text-center z-10 max-w-2xl px-4">
                  <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                    Trung tâm trợ giúp
                  </h1>
                  <h2 className="text-gray-300 text-sm font-normal leading-normal @[480px]:text-lg mt-2">
                    Xin chào! Chúng tôi có thể giúp gì cho bạn về quy trình vận
                    hành và tuân thủ Luật Du lịch 2025?
                  </h2>
                </div>
                <label className="flex flex-col min-w-40 h-14 w-full max-w-[580px] @[480px]:h-16 z-10 shadow-2xl">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-[#9dabb9] flex border border-[#3b4754] bg-[#1c2127] items-center justify-center pl-[20px] rounded-l-lg border-r-0">
                      <Search className="w-6 h-6" />
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden text-white focus:outline-0 focus:ring-0 border border-[#3b4754] bg-[#1c2127] focus:border-primary h-full placeholder:text-[#9dabb9] px-[15px] rounded-r-none border-r-0 border-l-0 text-sm font-normal leading-normal @[480px]:text-base"
                      placeholder="Tìm kiếm (ví dụ: xác thực thẻ, hoàn tiền, hợp đồng điện tử...)"
                      value=""
                    />
                    <div className="flex items-center justify-center rounded-r-lg border-l-0 border border-[#3b4754] bg-[#1c2127] pr-[7px]">
                      <Button className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-6 bg-primary hover:bg-blue-600 transition-colors text-white text-sm font-bold leading-normal tracking-[0.015em] @[480px]:text-base">
                        <span className="truncate">Tìm kiếm</span>
                      </Button>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Container */}
        <div className="flex flex-1 justify-center px-4 md:px-40 py-10">
          <div className="flex flex-col max-w-[960px] flex-1 gap-10">
            {/* Topic Filters (Chips) */}
            <div className="flex flex-col gap-4">
              <h3 className="text-white text-lg font-bold px-4">
                Chủ đề phổ biến
              </h3>
              <div className="flex gap-3 px-4 flex-wrap">
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 border border-primary/50 pl-5 pr-5 hover:bg-primary/30 transition-all cursor-pointer">
                  <Verified className="w-4 h-4 text-primary" />
                  <p className="text-primary text-sm font-bold leading-normal">
                    Đăng ký {'&'} Xác thực
                  </p>
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-border-dark pl-5 pr-5 hover:bg-border-dark transition-all cursor-pointer group">
                  <Wallet className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <p className="text-gray-300 group-hover:text-white text-sm font-medium leading-normal">
                    Ví {'&'} Thanh toán
                  </p>
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-border-dark pl-5 pr-5 hover:bg-border-dark transition-all cursor-pointer group">
                  <MapPin className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <p className="text-gray-300 group-hover:text-white text-sm font-medium leading-normal">
                    Tour {'&'} Ứng tuyển
                  </p>
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-border-dark pl-5 pr-5 hover:bg-border-dark transition-all cursor-pointer group">
                  <Scale className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <p className="text-gray-300 group-hover:text-white text-sm font-medium leading-normal">
                    Luật Du lịch 2025
                  </p>
                </button>
                <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full bg-surface-dark border border-border-dark pl-5 pr-5 hover:bg-border-dark transition-all cursor-pointer group">
                  <Building2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
                  <p className="text-gray-300 group-hover:text-white text-sm font-medium leading-normal">
                    Công ty
                  </p>
                </button>
              </div>
            </div>
            {/* FAQ Section 1: Registration & Law */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 pb-2 pt-4 border-b border-border-dark mb-4">
                <h2 className="text-white text-xl font-bold leading-tight">
                  Đăng ký và Tuân thủ Luật 2025
                </h2>
                <Link
                  className="text-primary text-sm font-medium hover:underline"
                  href="#"
                >
                  Xem tất cả
                </Link>
              </div>
              <div className="flex flex-col px-4 gap-3">
                <details className="flex flex-col rounded-xl border border-border-dark bg-surface-dark px-5 py-3 group transition-all hover:border-gray-600" open>
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 outline-none">
                    <div className="flex items-center gap-3">
                      <Verified className="w-5 h-5 text-primary" />
                      <p className="text-white text-base font-semibold leading-normal">
                        Làm thế nào để xác thực thẻ hướng dẫn viên theo luật
                        mới?
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-9 pr-4 pt-2 pb-2">
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                      Theo <strong className="text-white">Luật Du lịch 2025</strong>, tất cả Hướng dẫn viên (HDV) khi hoạt động trên nền tảng số bắt buộc phải định danh điện tử. Bạn cần thực hiện các bước sau:
                    </p>
                    <ol className="list-decimal list-inside text-gray-400 text-sm mt-2 space-y-1">
                      <li>
                        Truy cập phần <strong>Hồ sơ cá nhân</strong> {'>'}{" "}
                        <strong>Xác thực nâng cao</strong>.
                      </li>
                      <li>
                        Tải lên ảnh chụp 2 mặt Căn cước công dân gắn chip.
                      </li>
                      <li>
                        Tải lên bản scan màu Thẻ hướng dẫn viên (Quốc tế/Nội
                        địa) còn hiệu lực.
                      </li>
                      <li>
                        Thực hiện quét khuôn mặt (FaceID) để đối chiếu.
                      </li>
                    </ol>
                    <p className="text-gray-400 text-sm mt-2">
                      Hệ thống sẽ tự động xác thực với cơ sở dữ liệu quốc gia
                      trong vòng 24h.
                    </p>
                  </div>
                </details>
                <details className="flex flex-col rounded-xl border border-border-dark bg-surface-dark px-5 py-3 group transition-all hover:border-gray-600">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 outline-none">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                      <p className="text-white text-base font-medium leading-normal">
                        Tôi cần cung cấp giấy tờ gì để đăng ký tài khoản
                        Operator?
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-9 pr-4 pt-2 pb-2">
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                      Đối với doanh nghiệp lữ hành (Operator), bạn cần cung cấp
                      Giấy phép kinh doanh lữ hành (Quốc tế hoặc Nội địa), Giấy
                      chứng nhận đăng ký doanh nghiệp và thông tin người đại
                      diện pháp luật. Tất cả tài liệu phải được ký số hoặc là
                      bản sao y công chứng điện tử.
                    </p>
                  </div>
                </details>
                <details className="flex flex-col rounded-xl border border-border-dark bg-surface-dark px-5 py-3 group transition-all hover:border-gray-600">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 outline-none">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                      <p className="text-white text-base font-medium leading-normal">
                        Hợp đồng điện tử có giá trị pháp lý không?
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-9 pr-4 pt-2 pb-2">
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                      Có. Hợp đồng tour được tạo trên Tourism Connect tuân thủ
                      quy định về Giao dịch điện tử và Luật Du lịch 2025. Hợp
                      đồng được ký số bởi cả Operator và Guide có giá trị pháp
                      lý tương đương hợp đồng giấy truyền thống và được dùng để
                      giải quyết tranh chấp.
                    </p>
                  </div>
                </details>
              </div>
            </div>
            {/* FAQ Section 2: Payment & Tours */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 pb-2 pt-4 border-b border-border-dark mb-4">
                <h2 className="text-white text-xl font-bold leading-tight">
                  Ví, Thanh toán {'&'} Vận hành Tour
                </h2>
              </div>
              <div className="flex flex-col px-4 gap-3">
                <details className="flex flex-col rounded-xl border border-border-dark bg-surface-dark px-5 py-3 group transition-all hover:border-gray-600">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 outline-none">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                      <p className="text-white text-base font-medium leading-normal">
                        Quy trình thanh toán công tác phí diễn ra như thế nào?
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-9 pr-4 pt-2 pb-2">
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                      Sau khi Tour kết thúc, Operator có 48h để xác nhận hoàn
                      thành (hoặc khiếu nại). Sau thời gian này, hệ thống tự
                      động giải ngân tiền từ tài khoản tạm giữ vào Ví của
                      Hướng dẫn viên. Bạn có thể rút tiền về ngân hàng liên kết
                      bất cứ lúc nào (xử lý trong 24h làm việc).
                    </p>
                  </div>
                </details>
                <details className="flex flex-col rounded-xl border border-border-dark bg-surface-dark px-5 py-3 group transition-all hover:border-gray-600">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 outline-none">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                      <p className="text-white text-base font-medium leading-normal">
                        Chính sách hủy Tour và đền bù?
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-9 pr-4 pt-2 pb-2">
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                      Chính sách hủy tour phụ thuộc vào khung thời gian hủy
                      (trước 7 ngày, 3 ngày, hoặc 24h). Mức đền bù được quy
                      định rõ trong Hợp đồng điện tử khi bạn nhận Tour. Vui lòng
                      xem kỹ điều khoản "Phạt hủy" trong chi tiết Tour trước
                      khi ứng tuyển.
                    </p>
                  </div>
                </details>
                <details className="flex flex-col rounded-xl border border-border-dark bg-surface-dark px-5 py-3 group transition-all hover:border-gray-600">
                  <summary className="flex cursor-pointer items-center justify-between gap-6 py-2 outline-none">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary" />
                      <p className="text-white text-base font-medium leading-normal">
                        Làm sao để ứng tuyển vào một Tour?
                      </p>
                    </div>
                    <ChevronDown className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pl-9 pr-4 pt-2 pb-2">
                    <p className="text-gray-400 text-sm font-normal leading-relaxed">
                      Khi hồ sơ của bạn đã được xác thực, bạn có thể vào mục "Tìm
                      Tour", lọc theo địa điểm và thời gian phù hợp, sau đó nhấn
                      nút "Ứng tuyển". Operator sẽ xem hồ sơ của bạn và gửi lời
                      mời nếu phù hợp.
                    </p>
                  </div>
                </details>
              </div>
            </div>
            {/* Still Need Help Section */}
            <div className="px-4 mt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl bg-gradient-to-r from-[#1c2127] to-[#161a20] border border-border-dark p-8 md:p-10 shadow-lg relative overflow-hidden">
                {/* Decorative bg element */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col gap-3 relative z-10 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-white text-2xl font-bold">
                      Vẫn cần sự trợ giúp?
                    </h3>
                  </div>
                  <p className="text-gray-400 max-w-md">
                    Đội ngũ hỗ trợ của chúng tôi sẵn sàng giải đáp mọi thắc mắc
                    của bạn về nền tảng và các quy định pháp lý.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 relative z-10 w-full md:w-auto">
                  <Button className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-primary/20">
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat trực tuyến</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#283039] hover:bg-[#343e4a] text-white font-bold transition-all border border-gray-700"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Gửi Email</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <footer className="bg-[#1c2127] border-t border-border-dark py-12 px-4 md:px-40">
          <div className="max-w-[960px] mx-auto flex flex-col md:flex-row justify-between gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold">Tourism Connect</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                Nền tảng kết nối du lịch B2B hàng đầu Việt Nam, tuân thủ Luật Du
                lịch 2025.
              </p>
            </div>
            <div className="flex gap-16 flex-wrap">
              <div className="flex flex-col gap-3">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                  Khám phá
                </h4>
                <Link
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                  href="#"
                >
                  Về chúng tôi
                </Link>
                <Link
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                  href="#"
                >
                  Tìm Tour
                </Link>
                <Link
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                  href="#"
                >
                  Tìm Hướng dẫn viên
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                  Hỗ trợ
                </h4>
                <Link
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                  href="#"
                >
                  Trung tâm trợ giúp
                </Link>
                <Link
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                  href="#"
                >
                  Điều khoản sử dụng
                </Link>
                <Link
                  className="text-gray-400 hover:text-primary text-sm transition-colors"
                  href="#"
                >
                  Chính sách bảo mật
                </Link>
              </div>
            </div>
          </div>
          <div className="max-w-[960px] mx-auto mt-10 pt-6 border-t border-gray-800 text-center md:text-left">
            <p className="text-gray-500 text-xs">
              © 2024 Tourism Connect. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
