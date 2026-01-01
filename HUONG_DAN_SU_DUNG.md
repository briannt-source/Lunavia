# 📖 HƯỚNG DẪN SỬ DỤNG LUNAVIA

**LUNAVIA** - Nền tảng B2B kết nối Tour Operator & Hướng dẫn viên tuân thủ 100% Luật Du lịch Việt Nam 2025

---

## 📑 Mục lục

1. [Tổng quan về LUNAVIA](#tổng-quan-về-lunavia)
2. [Đăng ký và Xác thực](#đăng-ký-và-xác-thực)
3. [Hướng dẫn cho Tour Operator/Agency](#hướng-dẫn-cho-tour-operatoragency)
4. [Hướng dẫn cho Tour Guide (HDV)](#hướng-dẫn-cho-tour-guide-hdv)
5. [Hướng dẫn cho Admin](#hướng-dẫn-cho-admin)
6. [Hệ thống Ví (Wallet)](#hệ-thống-ví-wallet)
7. [Quản lý Tour](#quản-lý-tour)
8. [Hệ thống Ứng tuyển](#hệ-thống-ứng-tuyển)
9. [Thanh toán và Báo cáo](#thanh-toán-và-báo-cáo)
10. [Công ty và Nhân viên](#công-ty-và-nhân-viên)
12. [Tính năng AI](#tính-năng-ai)
13. [Thông báo](#thông-báo)
14. [Hợp đồng](#hợp-đồng)
15. [Xử lý Tranh chấp](#xử-lý-tranh-chấp)
16. [Câu hỏi thường gặp (FAQ)](#câu-hỏi-thường-gặp-faq)

---

## 🎯 Tổng quan về LUNAVIA

LUNAVIA là nền tảng kết nối B2B giữa các Tour Operator/Agency với Hướng dẫn viên (HDV), được xây dựng để tuân thủ 100% Luật Du lịch Việt Nam 2025.

### Các vai trò trong hệ thống:

- **TOUR_OPERATOR**: Doanh nghiệp lữ hành quốc tế
- **TOUR_AGENCY**: Doanh nghiệp lữ hành nội địa
- **TOUR_GUIDE**: Hướng dẫn viên du lịch
- **ADMIN**: Quản trị viên hệ thống

### Yêu cầu pháp lý:

**Tour Operator/Agency:**
- Phải có giấy phép kinh doanh
- Phải có giấy phép lữ hành
- Phải có số dư ký quỹ tối thiểu 1,000,000 VND
- Phải được xác minh KYB (Know Your Business)

**Tour Guide:**
- Phải có thẻ Hướng dẫn viên
- Phải có số dư tối thiểu 500,000 VND để ứng tuyển
- Phải được xác minh KYC (Know Your Customer)

---

## 🔐 Đăng ký và Xác thực

### Đăng ký tài khoản

1. Truy cập trang đăng ký: `/auth/register`
2. Chọn vai trò của bạn:
   - **Tour Operator/Agency**: Nếu bạn là doanh nghiệp lữ hành
   - **Tour Guide**: Nếu bạn là hướng dẫn viên
3. Điền thông tin:
   - Email
   - Mật khẩu (tối thiểu 8 ký tự)
   - Xác nhận mật khẩu
   - Tên hiển thị
4. Nhấn "Đăng ký"

### Đăng nhập

1. Truy cập: `/auth/signin`
2. Nhập email và mật khẩu
3. Hoặc đăng nhập bằng Google OAuth (nếu đã cấu hình)

### Xác minh tài khoản

Sau khi đăng ký, bạn cần hoàn tất xác minh để sử dụng đầy đủ tính năng:

**Cho Tour Guide (KYC):**
- Hình ảnh thật của bạn
- CMND/CCCD (mặt trước và mặt sau)
- Thẻ Hướng dẫn viên
- Giấy tờ chứng minh địa chỉ (Proof of Address)

**Cho Tour Operator/Agency (KYB):**
- Hình ảnh thật của người đại diện
- CMND/CCCD của người đại diện
- Giấy phép kinh doanh
- Giấy phép lữ hành
- Giấy tờ chứng minh địa chỉ doanh nghiệp

**Các bước nộp xác minh:**
1. Vào Dashboard → **Xác minh** (Verification)
2. Chọn **KYC** (nếu là Guide) hoặc **KYB** (nếu là Operator/Agency)
3. Upload các giấy tờ yêu cầu
4. Nhấn "Gửi xác minh"
5. Chờ Admin duyệt (thường trong 1-3 ngày làm việc)

**Trạng thái xác minh:**
- **NOT_SUBMITTED**: Chưa nộp
- **PENDING**: Đang chờ duyệt
- **APPROVED**: Đã được duyệt ✅
- **REJECTED**: Bị từ chối (cần nộp lại)

---

## 👔 Hướng dẫn cho Tour Operator/Agency

### Dashboard Operator

Sau khi đăng nhập, bạn sẽ thấy Dashboard với:
- **Tổng số Tours**: Tổng số tour bạn đã tạo
- **Tours đang mở**: Số tour đang nhận ứng tuyển
- **Ứng tuyển chờ duyệt**: Số ứng tuyển đang chờ bạn xem xét
- **Tổng chi**: Tổng số tiền đã thanh toán cho guides

### Tạo Tour

**Điều kiện:**
- ✅ KYB đã được duyệt (APPROVED)
- ✅ Có số dư ký quỹ tối thiểu 1,000,000 VND
- ✅ Đã có giấy phép kinh doanh và lữ hành

**Các bước:**

1. Vào **Dashboard** → Nhấn **"Tạo Tour"** hoặc vào `/tours/create`
2. Điền thông tin tour:
   - **Tiêu đề tour**: Tên tour
   - **Mô tả**: Mô tả chi tiết về tour
   - **Thành phố**: Chọn thành phố
   - **Ngày và giờ bắt đầu**: Ngày và giờ khởi hành (ví dụ: 15/01/2025 08:00)
   - **Ngày và giờ kết thúc**: Ngày và giờ kết thúc (ví dụ: 17/01/2025 18:00)
   - **Số lượng Main Guide**: Số HDV chính cần
   - **Số lượng Sub Guide**: Số HDV phụ cần
   - **Giá Main Guide**: Mức lương cho HDV chính (VND)
   - **Giá Sub Guide**: Mức lương cho HDV phụ (VND)
   - **Bao gồm (Inclusions)**: Các dịch vụ đã bao gồm
   - **Không bao gồm (Exclusions)**: Các dịch vụ không bao gồm
   - **Yêu cầu bổ sung**: Yêu cầu đặc biệt cho guides
   - **Tầm nhìn (Visibility)**:
     - **PUBLIC**: Tour công khai, mọi guide có thể ứng tuyển
     - **PRIVATE**: Tour riêng tư, chỉ assign cho in-house guides
3. Nhấn **"Tạo Tour"**

**Lưu ý về thời gian:**
- Hãy nhập đầy đủ **ngày và giờ** khởi hành và kết thúc
- Khi tour chuyển sang trạng thái **IN_PROGRESS**, thông tin ngày và giờ này sẽ được gửi trong thông báo cho guides và operator

**Trạng thái Tour:**
- **DRAFT**: Bản nháp (chưa công bố)
- **OPEN**: Đang mở, nhận ứng tuyển
- **CLOSED**: Đã đóng, không nhận ứng tuyển nữa
- **IN_PROGRESS**: Tour đang diễn ra
  - ⚙️ Tự động chuyển khi đến giờ khởi hành (nếu có guide được chấp nhận)
  - Tour biến mất khỏi danh sách tour mở
- **COMPLETED**: Tour đã hoàn thành
- **CANCELLED**: Tour đã hủy
  - ⚙️ Tự động chuyển khi đến giờ khởi hành (nếu không có guide nào)

### Quản lý Ứng tuyển

1. Vào **Dashboard** → **Ứng tuyển** hoặc `/dashboard/operator/applications`
2. Xem danh sách ứng tuyển:
   - **PENDING**: Đang chờ bạn xem xét
   - **ACCEPTED**: Đã chấp nhận
   - **REJECTED**: Đã từ chối
3. Nhấn vào tour để xem chi tiết ứng tuyển
4. Xem profile của guide:
   - Thông tin cơ bản
   - Badges (KYC Verified, Freelance/In-House, Top Rated, Experienced)
   - Lịch sử ứng tuyển
   - Đánh giá và xếp hạng
5. **Chấp nhận ứng tuyển**:
   - Kiểm tra slot còn trống
   - Kiểm tra guide không bị conflict (trùng lịch)
   - Nhấn **"Chấp nhận"**
   - Hệ thống sẽ tự động từ chối các ứng tuyển khác nếu slot đã đầy
6. **Từ chối ứng tuyển**:
   - Nhấn **"Từ chối"**
   - Có thể nhập lý do (tùy chọn)

### Assign Guide (Tour Private)

Đối với tour **PRIVATE**, bạn có thể trực tiếp assign guide trong công ty:

1. Vào tour → **Assign Guide**
2. Chọn guide từ danh sách in-house guides
3. Chọn vai trò (Main/Sub)
4. Nhấn **"Assign"**
5. Guide sẽ nhận thông báo và có thể chấp nhận/từ chối

### Quản lý Công ty

1. Vào **Dashboard** → **Công ty** hoặc `/dashboard/operator/company`
2. **Tạo công ty** (nếu chưa có):
   - Tên công ty
   - Mô tả
   - Logo
   - Thông tin liên hệ
3. **Mời Guide vào công ty**:
   - Nhấn **"Mời Guide"**
   - Nhập email của guide
   - Hoặc tạo **Invite Link** để chia sẻ
4. **Duyệt Join Request**:
   - Xem các yêu cầu tham gia công ty
   - Chấp nhận hoặc từ chối

### Thanh toán cho Guide

**⚠️ QUAN TRỌNG - Quy định về thanh toán:**
- ✅ Chỉ có thể thanh toán **SAU KHI** tour đã kết thúc
- ✅ Guide **PHẢI** nộp báo cáo tour **TRONG VÒNG 2 GIỜ** sau khi tour kết thúc
- ❌ Nếu guide **KHÔNG** nộp báo cáo trong thời hạn, bạn **KHÔNG THỂ** thanh toán cho guide
- ❌ Nếu guide nộp báo cáo **SAU 2 GIỜ**, bạn **KHÔNG THỂ** thanh toán cho guide
- ✅ Hệ thống sẽ tự động kiểm tra và từ chối thanh toán nếu guide chưa nộp báo cáo đúng hạn

**Cách 1: Thanh toán trực tiếp**
1. Vào **Dashboard** → **Thanh toán** hoặc `/dashboard/operator/payments`
2. Chọn tour cần thanh toán
3. Chọn guide
4. **Hệ thống sẽ kiểm tra:**
   - Tour đã kết thúc chưa
   - Guide đã nộp báo cáo chưa
   - Báo cáo có được nộp trong vòng 2 giờ sau khi tour kết thúc không
5. Nếu đủ điều kiện, nhập số tiền
6. Nhấn **"Thanh toán"**

**Cách 2: Duyệt Payment Request từ Tour Report**
1. Vào tour → **Báo cáo** hoặc `/dashboard/operator/tours/[tourId]/reports`
2. Xem các báo cáo tour từ guides
3. Nếu guide yêu cầu thanh toán trong báo cáo:
   - Xem chi tiết báo cáo
   - **Hệ thống sẽ kiểm tra:**
     - Tour đã kết thúc chưa
     - Báo cáo có được nộp trong vòng 2 giờ sau khi tour kết thúc không
   - Nếu đủ điều kiện, nhấn **"Duyệt thanh toán"**
   - Xác nhận số tiền

**Lưu ý:**
- Nếu guide chưa nộp báo cáo hoặc nộp quá hạn, hệ thống sẽ hiển thị thông báo lỗi
- Bạn không thể thanh toán cho guide trong trường hợp này
- Đây là quy định để đảm bảo guide hoàn thành trách nhiệm và nộp báo cáo đúng hạn

### Quản lý Khẩn cấp (Emergency/SOS)

1. Vào **Dashboard** → **Khẩn cấp** hoặc `/dashboard/operator/emergencies`
2. Xem các báo cáo khẩn cấp từ guides
3. **Xử lý báo cáo**:
   - Xem chi tiết
   - Acknowledge (xác nhận đã nhận)
   - Liên hệ với guide nếu cần

### Xem Báo cáo Tour

1. Vào tour → **Báo cáo** hoặc `/dashboard/operator/tours/[tourId]/reports`
2. Xem các báo cáo từ guides:
   - Báo cáo hoàn thành tour
   - Yêu cầu thanh toán (nếu có)
   - Hình ảnh, tài liệu đính kèm
3. **Duyệt thanh toán** nếu guide yêu cầu

### Tạo Hợp đồng

1. Vào tour → **Hợp đồng** hoặc `/tours/[tourId]/contract`
2. Nhập nội dung hợp đồng
3. Nhấn **"Tạo hợp đồng"**
4. Guide sẽ nhận thông báo và có thể xem/chấp nhận hợp đồng

---

## 🧭 Hướng dẫn cho Tour Guide (HDV)

### Dashboard Guide

Sau khi đăng nhập, bạn sẽ thấy Dashboard với:
- **Tổng ứng tuyển**: Tổng số tour bạn đã ứng tuyển
- **Đã chấp nhận**: Số tour đã được chấp nhận
- **Đang chờ**: Số tour đang chờ phản hồi
- **Số dư ví**: Số tiền hiện có trong ví

### Tìm và Ứng tuyển Tour

**Điều kiện:**
- ✅ KYC đã được duyệt (APPROVED)
- ✅ Có số dư tối thiểu 500,000 VND trong ví
- ✅ Không bị conflict với tour khác (trùng lịch)

**Các bước:**

1. Vào **Tìm Tour** hoặc `/tours/browse`
2. Tìm kiếm tour:
   - Lọc theo thành phố
   - Lọc theo ngày
   - Lọc theo giá
   - Tìm kiếm theo từ khóa
3. Xem chi tiết tour:
   - Thông tin tour
   - Yêu cầu
   - Giá lương
   - Số slot còn lại
4. Nhấn **"Ứng tuyển"**
5. Điền thông tin:
   - Chọn vai trò: **Main Guide** hoặc **Sub Guide**
   - Viết thư xin việc (Cover Letter)
6. Nhấn **"Gửi ứng tuyển"**

**Lưu ý:**
- Bạn không thể ứng tuyển nếu:
  - Số dư < 500,000 VND
  - Tour đã đầy slot
  - Bạn đã ứng tuyển tour này rồi
  - Bạn bị conflict với tour khác (trùng ngày)
  - ⚠️ **Tour đã quá giờ khởi hành**: Không thể ứng tuyển tour đã bắt đầu hoặc đã qua thời gian khởi hành

### Quản lý Ứng tuyển

1. Vào **Dashboard** → **Ứng tuyển** hoặc `/dashboard/guide/applications`
2. Xem trạng thái:
   - **PENDING**: Đang chờ operator xem xét
   - **ACCEPTED**: Đã được chấp nhận ✅
   - **REJECTED**: Đã bị từ chối
3. **Hủy ứng tuyển** (nếu còn PENDING):
   - Nhấn vào ứng tuyển
   - Nhấn **"Hủy ứng tuyển"**

### Quản lý Assignment (Tour Private)

Nếu bạn là in-house guide và được operator assign vào tour private:

1. Vào **Dashboard** → **Assignments** hoặc `/dashboard/guide/assignments`
2. Xem các assignment:
   - **PENDING**: Đang chờ bạn chấp nhận/từ chối
   - **ACCEPTED**: Đã chấp nhận
   - **REJECTED**: Đã từ chối
3. **Chấp nhận Assignment**:
   - Xem chi tiết tour
   - Nhấn **"Chấp nhận"**
4. **Từ chối Assignment**:
   - Nhấn **"Từ chối"**
   - Nhập lý do (bắt buộc)

### Quản lý Tour của bạn

1. Vào **Dashboard** → **Tours** hoặc `/dashboard/guide/tours`
2. Xem các tour bạn đang tham gia:
   - Tour đã được chấp nhận
   - Tour đang diễn ra (IN_PROGRESS)
   - Tour đã hoàn thành (COMPLETED)
3. Nhấn vào tour để xem chi tiết

### Nộp Báo cáo Tour

Sau khi hoàn thành tour, bạn **PHẢI** nộp báo cáo trong vòng **2 giờ** sau khi tour kết thúc để có thể nhận thanh toán.

**⚠️ QUAN TRỌNG:**
- ✅ Chỉ có thể nộp báo cáo **SAU KHI** tour đã kết thúc
- ✅ Phải nộp báo cáo **TRONG VÒNG 2 GIỜ** sau khi tour kết thúc
- ❌ Nếu nộp báo cáo **SAU 2 GIỜ**, bạn sẽ **KHÔNG THỂ NHẬN THANH TOÁN** cho tour này
- ❌ Operator cũng **KHÔNG THỂ** thanh toán cho bạn nếu bạn chưa nộp báo cáo trong thời hạn

**Các bước:**

1. Vào tour → **Báo cáo** hoặc `/dashboard/guide/tours/[tourId]/report`
2. **Kiểm tra thời gian:**
   - Xem ngày và giờ kết thúc tour
   - Đảm bảo tour đã kết thúc
   - Nộp báo cáo ngay sau khi tour kết thúc (trong vòng 2 giờ)
3. Điền thông tin:
   - Mô tả tour
   - Số lượng khách
   - Đánh giá tour
   - Hình ảnh (nếu có)
   - Tài liệu đính kèm (nếu có)
4. **Yêu cầu thanh toán** (nếu chưa được thanh toán):
   - Đánh dấu **"Yêu cầu thanh toán"**
   - Nhập số tiền yêu cầu
5. Nhấn **"Gửi báo cáo"**

**Lưu ý về thời hạn:**
- Hệ thống sẽ tự động kiểm tra thời gian nộp báo cáo
- Nếu bạn nộp quá 2 giờ, hệ thống sẽ từ chối và bạn không thể nhận thanh toán
- Hãy nộp báo cáo ngay sau khi tour kết thúc để đảm bảo nhận được thanh toán

### Báo cáo Khẩn cấp (SOS)

Nếu gặp tình huống khẩn cấp trong tour:

1. Vào tour → Nhấn nút **"SOS"** hoặc `/tours/[tourId]/emergency`
2. Chọn loại khẩn cấp:
   - Tai nạn
   - Bệnh tật
   - Mất mát
   - Khác
3. Mô tả tình huống
4. Upload hình ảnh/tài liệu (nếu có)
5. Nhấn **"Gửi báo cáo"**
6. Operator sẽ nhận thông báo ngay lập tức

### Xem và Chấp nhận Hợp đồng

1. Vào **Dashboard** → **Notifications** hoặc kiểm tra thông báo
2. Nếu có hợp đồng mới:
   - Nhấn vào thông báo
   - Xem nội dung hợp đồng
   - **Chấp nhận** hoặc **Từ chối**
3. Hoặc vào tour → **Hợp đồng** để xem

### Tham gia Công ty

**Cách 1: Nhận lời mời**
1. Kiểm tra email hoặc thông báo
2. Nhấn vào **Invite Link** từ operator
3. Nhấn **"Chấp nhận lời mời"**

**Cách 2: Yêu cầu tham gia**
1. Tìm công ty trong danh sách
2. Nhấn **"Yêu cầu tham gia"**
3. Chờ operator duyệt

### Xem Profile của bạn

1. Vào **Dashboard** → **Profile** hoặc `/dashboard/profile`
2. Xem và chỉnh sửa:
   - Thông tin cá nhân
   - Avatar
   - Chuyên môn
   - Ngôn ngữ
   - Kinh nghiệm
3. Xem **Badges**:
   - KYC Verified
   - Freelance/In-House
   - Top Rated
   - Experienced

---

## 👨‍💼 Hướng dẫn cho Admin

### Dashboard Admin

Sau khi đăng nhập với quyền Admin, bạn sẽ thấy:
- **Disputes đang chờ**: Số tranh chấp cần xử lý
- **Xác minh đang chờ**: Số KYC/KYB cần duyệt
- **Tổng Users**: Tổng số người dùng
- **Tổng Tours**: Tổng số tour
- **Top-up chờ duyệt**: Yêu cầu nạp tiền
- **Rút tiền chờ duyệt**: Yêu cầu rút tiền

### Quản lý Xác minh (Verification)

1. Vào **Dashboard** → **Xác minh** hoặc `/dashboard/admin/verifications`
2. Xem danh sách:
   - **PENDING**: Đang chờ duyệt
   - **APPROVED**: Đã duyệt
   - **REJECTED**: Đã từ chối
3. Nhấn vào để xem chi tiết:
   - Xem các giấy tờ đã nộp
   - Kiểm tra tính hợp lệ
4. **Duyệt xác minh**:
   - Nhấn **"Duyệt"** nếu hợp lệ
   - Hoặc **"Từ chối"** với lý do

### Quản lý Tranh chấp (Disputes)

1. Vào **Dashboard** → **Disputes** hoặc `/dashboard/admin/disputes`
2. Xem danh sách tranh chấp:
   - **PENDING**: Đang chờ xử lý
   - **IN_REVIEW**: Đang xem xét
   - **RESOLVED**: Đã giải quyết
   - **REJECTED**: Đã từ chối
3. Nhấn vào để xem chi tiết:
   - Loại tranh chấp (Payment, Assignment, No Show, Quality)
   - Mô tả
   - Các bên liên quan
4. **Xử lý tranh chấp**:
   - Xem xét tình huống
   - Liên hệ các bên
   - Đưa ra quyết định
   - Cập nhật trạng thái

### Quản lý Yêu cầu Ví (Wallet Requests)

1. Vào **Dashboard** → **Yêu cầu** hoặc `/dashboard/admin/requests`
2. **Xử lý Top-up (Nạp tiền)**:
   - Xem yêu cầu nạp tiền
   - Kiểm tra chứng từ thanh toán
   - **Duyệt** hoặc **Từ chối**
   - Đối với Operator: Số tiền sẽ được ưu tiên vào locked deposit (1M VND)
3. **Xử lý Withdrawal (Rút tiền)**:
   - Xem yêu cầu rút tiền
   - Kiểm tra thông tin tài khoản
   - Kiểm tra số dư tối thiểu:
     - Guide: Phải còn ≥ 500,000 VND
     - Operator: Không được rút locked deposit (1M VND)
   - **Duyệt** hoặc **Từ chối**

### Quản lý Users

1. Vào **Dashboard** → **Users** hoặc `/dashboard/admin/users`
2. Xem danh sách users:
   - Tìm kiếm theo email, tên
   - Lọc theo vai trò
   - Lọc theo trạng thái xác minh
3. Nhấn vào user để xem chi tiết:
   - Thông tin profile
   - Wallet balance
   - Lịch sử giao dịch
   - Tours và applications
4. **Quản lý user**:
   - Reset mật khẩu
   - Chỉnh sửa profile
   - Khóa/Mở khóa tài khoản

### Quản lý Tours

1. Vào **Dashboard** → **Tours** hoặc `/dashboard/admin/tours`
2. Xem tất cả tours trong hệ thống
3. Xem chi tiết tour:
   - Thông tin tour
   - Operator
   - Applications
   - Guides được chấp nhận
4. Có thể can thiệp nếu cần (tùy quyền)

### Kiểm duyệt Tour (Đóng/Mở Tour)

Admin và Moderator có quyền đóng/mở tour nếu tour hoặc nội dung không phù hợp hoặc vi phạm quy định của marketplace.

**Các lỗi Tour Operator có thể mắc phải:**
1. **Thông tin sai lệch**: Giá cả, ngày giờ, địa điểm, số lượng khách không chính xác
2. **Nội dung không phù hợp**: Spam, quảng cáo trái phép, nội dung nhạy cảm, ngôn ngữ không phù hợp
3. **Vi phạm quy định**: Giá quá thấp/cao, thời gian không hợp lý, thiếu thông tin bắt buộc
4. **Thông tin thiếu sót**: Mô tả quá ngắn, thiếu itinerary, thiếu inclusions/exclusions
5. **Lạm dụng hệ thống**: Tạo nhiều tour spam, tour trùng lặp
6. **Nội dung không đúng với thực tế**: Dịch vụ không tồn tại, chứng nhận giả
7. **Vi phạm bản quyền**: Hình ảnh, nội dung sao chép không có quyền
8. **Thông tin cá nhân không được phép**: Số điện thoại, email công khai trong mô tả
9. **Vi phạm pháp luật**: Tour không có giấy phép, hoạt động bất hợp pháp
10. **Hành vi không đạo đức**: Phân biệt đối xử, bóc lột, lợi dụng

**Quy trình đóng tour:**
1. Vào **Dashboard** → **Tours** hoặc `/dashboard/admin/tours`
2. Tìm tour cần đóng
3. Click nút **"Đóng"** (màu đỏ) bên cạnh tour
4. Chọn **lý do đóng tour** từ danh sách:
   - MISINFORMATION - Thông tin sai lệch
   - INAPPROPRIATE_CONTENT - Nội dung không phù hợp
   - POLICY_VIOLATION - Vi phạm quy định
   - MISSING_INFO - Thiếu thông tin
   - SPAM - Spam/Lạm dụng hệ thống
   - FALSE_CLAIMS - Tuyên bố sai sự thật
   - COPYRIGHT_VIOLATION - Vi phạm bản quyền
   - UNAUTHORIZED_CONTACT - Thông tin liên hệ không được phép
   - LEGAL_VIOLATION - Vi phạm pháp luật
   - UNETHICAL_BEHAVIOR - Hành vi không đạo đức
   - OTHER - Lý do khác
5. Nhập **ghi chú chi tiết** (tùy chọn)
6. Click **"Đóng Tour"**
7. Tour sẽ biến mất khỏi marketplace ngay lập tức
8. Tour Operator sẽ nhận thông báo về lý do đóng tour
9. Tour Guide đã ứng tuyển (nếu có) cũng sẽ nhận thông báo

**Quy trình mở lại tour:**
1. Vào **Dashboard** → **Tours** hoặc `/dashboard/admin/tours`
2. Tìm tour đã bị đóng (có badge "Đã đóng" màu đỏ)
3. Click nút **"Mở lại"** (màu xanh) bên cạnh tour
4. Nhập **ghi chú** về việc mở lại (tùy chọn)
5. Click **"Mở lại Tour"**
6. Tour sẽ xuất hiện lại trên marketplace
7. Tour Operator sẽ nhận thông báo về việc tour được mở lại

**Lưu ý:**
- Chỉ **SUPER_ADMIN** và **MODERATOR** mới có quyền đóng/mở tour
- Tour bị đóng sẽ không hiển thị trong marketplace cho tất cả người dùng
- Lịch sử đóng/mở tour được lưu lại để theo dõi
- Tour Operator có thể xem lý do đóng tour trong thông báo

### Quản lý Công ty

1. Vào **Dashboard** → **Công ty** hoặc `/dashboard/admin/companies`
2. Xem danh sách công ty
3. Xem chi tiết:
   - Thông tin công ty
   - Members (in-house guides)
   - Tours của công ty

### Chuyển tiền (Transfers)

1. Vào **Dashboard** → **Chuyển tiền** hoặc `/dashboard/admin/transfers`
2. Chuyển tiền giữa các tài khoản (nếu cần)
3. Xem lịch sử chuyển tiền

### Cài đặt Thanh toán

1. Vào **Dashboard** → **Cài đặt thanh toán** hoặc `/dashboard/admin/payment-settings`
2. Quản lý:
   - Tài khoản ngân hàng của Lunavia
   - Phương thức thanh toán
   - Tỷ giá hối đoái (VND/USD)

### Cập nhật Tỷ giá

1. Vào **Dashboard** → **Cài đặt thanh toán**
2. Cập nhật tỷ giá VND/USD
3. Lưu lại

---

## 💰 Hệ thống Ví (Wallet)

### Tổng quan

Mỗi user đều có một ví điện tử trong hệ thống để:
- Nạp tiền (Top-up)
- Rút tiền (Withdrawal)
- Thanh toán (Payment)
- Nhận thanh toán

### Xem số dư và Lịch sử

1. Vào **Dashboard** → **Ví** hoặc `/dashboard/wallet`
2. Xem:
   - **Số dư khả dụng**: Số tiền có thể sử dụng
   - **Số dư ký quỹ** (Operator): 1,000,000 VND bị khóa
   - **Tổng số dư**: Tổng số tiền trong ví
   - **Lịch sử giao dịch**: Tất cả các giao dịch

### Nạp tiền (Top-up)

1. Vào **Dashboard** → **Ví** → **Nạp tiền**
2. Nhập số tiền
3. Chọn phương thức thanh toán:
   - Chuyển khoản ngân hàng
   - MoMo
   - ZaloPay
   - Khác
4. Upload chứng từ thanh toán (nếu có)
5. Nhấn **"Gửi yêu cầu"**
6. Chờ Admin duyệt (thường trong 1-2 ngày làm việc)

**Lưu ý cho Operator:**
- Số tiền nạp sẽ được ưu tiên vào **locked deposit** (1M VND)
- Sau khi đủ 1M locked deposit, số tiền còn lại mới vào số dư khả dụng

### Rút tiền (Withdrawal)

1. Vào **Dashboard** → **Ví** → **Rút tiền**
2. Nhập số tiền
3. Chọn phương thức nhận tiền:
   - Chuyển khoản ngân hàng
   - MoMo
   - ZaloPay
   - Khác
4. Nhập thông tin tài khoản
5. Nhấn **"Gửi yêu cầu"**
6. Chờ Admin duyệt

**Điều kiện:**
- **Guide**: Số dư sau khi rút phải ≥ 500,000 VND
- **Operator**: Không được rút locked deposit (1M VND)

### Thanh toán

**Cho Operator:**
- Thanh toán cho guide sau khi tour hoàn thành
- Xem phần [Thanh toán cho Guide](#thanh-toán-cho-guide)

**Cho Guide:**
- Nhận thanh toán từ operator
- Xem trong lịch sử giao dịch

### Lịch sử Giao dịch

Xem tất cả giao dịch:
- Top-up
- Withdrawal
- Payment (nhận/chi)
- Transaction details

---

## 🗺️ Quản lý Tour

### Tạo Tour

Xem phần [Tạo Tour](#tạo-tour) trong hướng dẫn cho Operator.

### Chỉnh sửa Tour

**Điều kiện:**
- ✅ Tour phải ở trạng thái **DRAFT**, **OPEN**, hoặc **CLOSED**
- ❌ Không thể chỉnh sửa tour ở trạng thái **IN_PROGRESS**, **COMPLETED**, hoặc **CANCELLED**

**Quy tắc chỉnh sửa:**

**1. Tour chưa có ứng tuyển nào:**
- ✅ Có thể chỉnh sửa trực tiếp, không cần admin duyệt
- ✅ Có thể thay đổi mọi thông tin

**2. Tour đã có ứng tuyển (PENDING, ACCEPTED, hoặc REJECTED):**
- ⚠️ Cần **yêu cầu admin duyệt** để chỉnh sửa
- ⚠️ Hệ thống sẽ tự động tạo **Tour Edit Request** và gửi đến admin
- ⚠️ Chờ admin duyệt trước khi thay đổi có hiệu lực
- ✅ Có thể xem trạng thái yêu cầu trong dashboard

**Các bước:**

1. Vào tour → **Chỉnh sửa** hoặc `/tours/[tourId]/edit`
2. Chỉnh sửa thông tin cần thiết
3. Nhập lý do chỉnh sửa (nếu tour đã có ứng tuyển)
4. Nhấn **"Lưu"** hoặc **"Cập nhật"**
5. Nếu tour đã có ứng tuyển:
   - Hệ thống sẽ tạo yêu cầu chỉnh sửa
   - Chờ admin duyệt
   - Nhận thông báo khi admin đã duyệt/từ chối

**Lưu ý khi tour đã có ứng tuyển:**
- ⚠️ Bạn **không thể giảm số lượng slot** xuống dưới số lượng guides đã được chấp nhận
- ⚠️ Nếu thay đổi ngày/giờ, vui lòng thông báo cho các guides đã được chấp nhận qua hệ thống tin nhắn
- ✅ Có thể thay đổi các thông tin khác như mô tả, giá, v.v. (sau khi admin duyệt)

### Xóa Tour

**Quy tắc xóa:**

**1. Tour chưa có ứng tuyển nào:**
- ✅ Có thể xóa trực tiếp, không cần admin duyệt
- ✅ Tour và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn

**2. Tour đã có ứng tuyển:**
- ⚠️ Cần **yêu cầu admin duyệt** để xóa
- ⚠️ Hệ thống sẽ tự động tạo **Tour Delete Request** và gửi đến admin
- ⚠️ Chờ admin duyệt trước khi tour bị xóa
- ✅ Có thể xem trạng thái yêu cầu trong dashboard

**Các bước:**

1. Vào tour → **Xóa tour**
2. Nhập lý do xóa (nếu tour đã có ứng tuyển)
3. Xác nhận xóa
4. Nếu tour đã có ứng tuyển:
   - Hệ thống sẽ tạo yêu cầu xóa
   - Chờ admin duyệt
   - Nhận thông báo khi admin đã duyệt/từ chối

### Thay đổi Trạng thái Tour

**Tự động chuyển trạng thái:**
- ⚙️ Hệ thống tự động kiểm tra và cập nhật trạng thái tour khi đến giờ khởi hành:
  - **Nếu có guide được chấp nhận** (ACCEPTED application hoặc APPROVED assignment):
    - Tour tự động chuyển sang **IN_PROGRESS**
    - Gửi thông báo cho operator và tất cả guides
    - Tour biến mất khỏi danh sách tour mở
  - **Nếu có ứng tuyển đang chờ duyệt** (PENDING applications):
    - Hệ thống thông báo cho operator: "Tour đã đến giờ khởi hành nhưng chưa có guide được chấp nhận"
    - Tour vẫn ở trạng thái OPEN/CLOSED để operator có thể chấp nhận guide
    - Operator cần quyết định: chấp nhận guide hoặc hủy tour
  - **Nếu không có guide nào** (không có ứng tuyển hoặc tất cả đã bị từ chối):
    - Tour tự động chuyển sang **CANCELLED**
    - Thông báo cho operator: "Tour đã bị hủy - Không tìm được guide"
    - Operator cần tìm phương án khác hoặc tạo tour mới

**Thay đổi thủ công:**

1. Vào tour → **Trạng thái**
2. Chọn trạng thái mới:
   - **OPEN**: Mở tour, nhận ứng tuyển
   - **CLOSED**: Đóng tour, không nhận ứng tuyển nữa (tour vẫn hiển thị trong list của operator nhưng không nhận ứng tuyển mới)
   - **IN_PROGRESS**: Tour đang diễn ra
     - ⚠️ **Lưu ý quan trọng**: Khi tour chuyển sang trạng thái IN_PROGRESS:
       - Tour sẽ **biến mất khỏi danh sách tour mở** (không còn hiển thị trong marketplace)
       - Tất cả guides đã được chấp nhận sẽ nhận thông báo: "Tour đã bắt đầu chạy" kèm thông tin ngày và giờ khởi hành, ngày và giờ kết thúc
       - Operator sẽ nhận thông báo: "Tour đã đến giờ khởi hành" kèm thông tin ngày và giờ khởi hành, ngày và giờ kết thúc
   - **COMPLETED**: Tour đã hoàn thành
   - **CANCELLED**: Hủy tour
3. Lưu lại

### Thay đổi Tầm nhìn (Visibility)

1. Vào tour → **Tầm nhìn**
2. Chọn:
   - **PUBLIC**: Tour công khai
   - **PRIVATE**: Tour riêng tư (chỉ in-house guides)
3. Lưu lại

### Xem Chi tiết Tour

1. Vào `/tours/[tourId]`
2. Xem:
   - Thông tin tour đầy đủ
   - Operator
   - Applications (nếu bạn là operator)
   - Guides được chấp nhận
   - Báo cáo (nếu có)

---

## 📝 Hệ thống Ứng tuyển

### Ứng tuyển Tour

Xem phần [Tìm và Ứng tuyển Tour](#tìm-và-ứng-tuyển-tour) trong hướng dẫn cho Guide.

### Xem Ứng tuyển

**Cho Operator:**
- Xem danh sách ứng tuyển cho tour của mình
- Xem profile của guide
- Chấp nhận/Từ chối

**Cho Guide:**
- Xem trạng thái ứng tuyển của mình
- Hủy ứng tuyển (nếu còn PENDING)

### Trạng thái Ứng tuyển

- **PENDING**: Đang chờ operator xem xét
- **ACCEPTED**: Đã được chấp nhận ✅
- **REJECTED**: Đã bị từ chối

### Conflict Checking

Hệ thống tự động kiểm tra conflict:
- Nếu guide đã ứng tuyển/được chấp nhận tour khác trùng ngày
- Ứng tuyển sẽ bị từ chối tự động

---

## 💵 Thanh toán và Báo cáo

### Thanh toán cho Guide

Xem phần [Thanh toán cho Guide](#thanh-toán-cho-guide) trong hướng dẫn cho Operator.

### Nộp Báo cáo Tour

Xem phần [Nộp Báo cáo Tour](#nộp-báo-cáo-tour) trong hướng dẫn cho Guide.

### Duyệt Payment Request

Xem phần [Xem Báo cáo Tour](#xem-báo-cáo-tour) trong hướng dẫn cho Operator.

---

## 🔒 Hệ thống Escrow (Ký quỹ)

### Tổng quan

Hệ thống Escrow (Ký quỹ) là một tính năng bảo vệ thanh toán giữa Tour Operator và Tour Guide. Khi một Tour Operator chấp nhận application của một Guide, hệ thống sẽ tự động tạo một escrow account để giữ tiền thanh toán cho đến khi tour hoàn thành.

### Lợi ích của Escrow

- **Bảo vệ Tour Operator:** Tiền được giữ trong escrow, chỉ được giải phóng khi tour hoàn thành và guide đã nộp báo cáo
- **Bảo vệ Tour Guide:** Đảm bảo operator đã có đủ tiền để thanh toán
- **Tự động hóa:** Hệ thống tự động tạo và quản lý escrow accounts
- **Minh bạch:** Cả operator và guide đều có thể theo dõi trạng thái escrow

### Quy trình Escrow

#### 1. Tạo Escrow Account

Khi Tour Operator chấp nhận application của một Guide:
- Hệ thống tự động tạo escrow account với trạng thái **PENDING**
- Escrow account chứa:
  - Số tiền thanh toán (dựa trên role: MAIN hoặc SUB)
  - Phí nền tảng (platform fee)
  - Số tiền guide sẽ nhận (net amount)

#### 2. Khóa Escrow (Lock)

Tour Operator có thể khóa escrow để reserve tiền:
- Click nút **"Khóa Escrow"** trên tour detail page
- Hệ thống sẽ reserve số tiền trong ví của operator
- Trạng thái escrow chuyển sang **LOCKED**
- Tiền được giữ an toàn trong escrow

**Lưu ý:** Operator cần có đủ số dư trong ví để khóa escrow.

#### 3. Giải phóng Escrow (Release)

Escrow được giải phóng khi:
- Tour đã kết thúc
- Guide đã nộp báo cáo tour trong vòng 2 giờ sau khi tour kết thúc
- Operator approve payment (hoặc auto-approve nếu đã bật)

**Tự động giải phóng:**
- Nếu operator đã bật auto-approve payments trong Settings
- Và payment amount <= auto-approve threshold
- Escrow sẽ tự động được giải phóng sau khi guide nộp báo cáo

**Giải phóng thủ công:**
- Operator có thể click **"Giải phóng Escrow"** trên tour detail page
- Nhập lý do giải phóng (optional)
- Xác nhận giải phóng

Sau khi giải phóng:
- Tiền được chuyển từ escrow vào ví của guide
- Payment record được tạo
- Trạng thái escrow chuyển sang **RELEASED**

#### 4. Hoàn tiền Escrow (Refund)

Escrow có thể được hoàn tiền về operator nếu:
- Tour bị hủy
- Tranh chấp được giải quyết
- Các trường hợp khác cần hoàn tiền

**Cách hoàn tiền:**
- Operator click **"Hoàn tiền Escrow"** trên tour detail page
- Nhập lý do hoàn tiền
- Xác nhận hoàn tiền

Sau khi hoàn tiền:
- Tiền được trả lại vào ví của operator
- Trạng thái escrow chuyển sang **REFUNDED**

### Trạng thái Escrow

- **PENDING:** Escrow account đã được tạo nhưng chưa được khóa
- **LOCKED:** Tiền đã được reserve trong ví của operator
- **RELEASED:** Tiền đã được chuyển vào ví của guide
- **REFUNDED:** Tiền đã được hoàn về operator
- **CANCELLED:** Escrow account đã bị hủy (nếu chưa được khóa)

### Xem Escrow Accounts

**Cho Tour Operators:**
- Vào tour detail page
- Scroll xuống phần **"Escrow Accounts"**
- Xem danh sách tất cả escrow accounts cho tour này
- Xem trạng thái, số tiền, và thực hiện các actions

**Cho Tour Guides:**
- Escrow status được hiển thị trong applications list
- Badge hiển thị trạng thái escrow cho application đã được accept

### Lưu ý quan trọng

1. **Thời hạn nộp báo cáo:**
   - Guide phải nộp báo cáo tour trong vòng **2 giờ** sau khi tour kết thúc
   - Nếu nộp quá hạn, escrow sẽ không thể được giải phóng
   - Guide sẽ không nhận được thanh toán

2. **Phí nền tảng:**
   - Freelance guides: 5% phí nền tảng (trừ từ payment)
   - In-house guides: 1% phí nền tảng (operator trả thêm) hoặc 0% nếu contract đã được verify

3. **Auto-approve:**
   - Operator có thể bật auto-approve payments trong Settings
   - Nếu bật, escrow sẽ tự động giải phóng khi guide nộp báo cáo
   - Chỉ áp dụng nếu payment amount <= auto-approve threshold

4. **Escrow và Direct Payment:**
   - Nếu không có escrow account, hệ thống sẽ sử dụng direct payment (backward compatibility)
   - Escrow là phương thức được khuyến nghị để đảm bảo an toàn

---

## 🏢 Công ty và Nhân viên

### Tạo Công ty

**Cho Operator:**
1. Vào **Dashboard** → **Công ty**
2. Nhấn **"Tạo công ty"**
3. Điền thông tin:
   - Tên công ty
   - Mô tả
   - Logo
   - Thông tin liên hệ
4. Lưu lại

### Mời Guide vào Công ty

**Cách 1: Mời qua Email**
1. Vào **Công ty** → **Mời Guide**
2. Nhập email của guide
3. Nhấn **"Gửi lời mời"**

**Cách 2: Tạo Invite Link**
1. Vào **Công ty** → **Tạo Invite Link**
2. Copy link
3. Chia sẻ với guide
4. Guide nhấn vào link và chấp nhận

### Duyệt Join Request

1. Vào **Công ty** → **Yêu cầu tham gia**
2. Xem danh sách guide muốn tham gia
3. **Chấp nhận** hoặc **Từ chối**

### Tham gia Công ty

**Cho Guide:**
- Nhận lời mời từ operator
- Hoặc yêu cầu tham gia công ty
- Xem phần [Tham gia Công ty](#tham-gia-công-ty) trong hướng dẫn cho Guide

### Quản lý In-House Guides

**Cho Operator:**
- Xem danh sách in-house guides
- Assign vào tour private
- Xem profile và lịch sử

---

## 🤖 Tính năng AI

### AI Matching

LUNAVIA sử dụng AI để match guides với tours với độ chính xác 92%:

1. Vào **AI Matching** hoặc `/ai/match`
2. Chọn tour
3. Xem danh sách guides được AI đề xuất
4. Xem lý do match (skills, experience, availability)

### AI Itinerary Generation

- Tạo lịch trình tour tự động
- Gợi ý điểm đến
- Tối ưu hóa lộ trình

### AI Chat Assistant

- Trợ lý AI hỗ trợ trả lời câu hỏi
- Gợi ý và tư vấn

### AI Analytics

- Phân tích dữ liệu
- Insights và recommendations

---

## 💬 Hệ thống Tin nhắn (Messaging)

### Tổng quan

LUNAVIA cung cấp hệ thống tin nhắn nội bộ để tour operator và tour guide có thể trao đổi thông tin về tour một cách an toàn và được quản lý.

**Lợi ích:**
- ✅ Tất cả giao tiếp được lưu trữ trong hệ thống
- ✅ Tránh việc liên hệ bên ngoài (email, phone, v.v.)
- ✅ Dễ dàng theo dõi lịch sử trao đổi
- ✅ Admin có thể giám sát nếu cần
- ✅ Về sau có thể tích hợp cuộc gọi trong ứng dụng

### Tạo Cuộc trò chuyện

**Cho Tour Operator:**

1. Vào tour → **Danh sách ứng tuyển** hoặc **Danh sách guides**
2. Nhấn vào guide bạn muốn liên hệ
3. Nhấn **"Nhắn tin"** hoặc **"Liên hệ"**
4. Hệ thống sẽ tự động tạo cuộc trò chuyện (nếu chưa có)

**Cho Tour Guide:**

1. Vào tour bạn đã ứng tuyển/được assign
2. Nhấn **"Nhắn tin với Operator"** hoặc **"Liên hệ"**
3. Hệ thống sẽ tự động tạo cuộc trò chuyện (nếu chưa có)

**Điều kiện:**
- ✅ Guide phải đã ứng tuyển hoặc được assign vào tour
- ✅ Operator phải là chủ sở hữu tour

### Gửi Tin nhắn

1. Vào **Tin nhắn** hoặc `/messages`
2. Chọn cuộc trò chuyện
3. Nhập tin nhắn
4. Nhấn **"Gửi"**

**Tính năng:**
- ✅ Xem lịch sử tin nhắn
- ✅ Đánh dấu đã đọc
- ✅ Thông báo khi có tin nhắn mới
- ✅ Hiển thị số tin nhắn chưa đọc

### Quản lý Cuộc trò chuyện

1. Vào **Tin nhắn** hoặc `/messages`
2. Xem danh sách tất cả cuộc trò chuyện:
   - Tour liên quan
   - Người tham gia (operator/guide)
   - Tin nhắn cuối cùng
   - Số tin nhắn chưa đọc
3. Sắp xếp theo thời gian (mới nhất trước)

### Lưu ý

- ⚠️ Tất cả tin nhắn được lưu trữ trong hệ thống
- ⚠️ Không nên chia sẻ thông tin cá nhân nhạy cảm
- ⚠️ Admin có thể xem cuộc trò chuyện nếu cần giải quyết tranh chấp
- ✅ Sử dụng hệ thống tin nhắn để trao đổi về tour thay vì liên hệ bên ngoài

---

## 🔔 Thông báo

### Xem Thông báo

1. Vào **Dashboard** → **Thông báo** hoặc `/dashboard/notifications`
2. Xem danh sách:
   - Thông báo chưa đọc (unread)
   - Thông báo đã đọc (read)
3. Lọc theo loại:
   - Ứng tuyển
   - Assignment
   - Thanh toán
   - Xác minh
   - Hợp đồng
   - Khẩn cấp

### Đánh dấu đã đọc

- Nhấn vào thông báo để đánh dấu đã đọc
- Hoặc nhấn **"Đánh dấu tất cả đã đọc"**

### Các loại Thông báo

- **New Application**: Có ứng tuyển mới (Operator)
- **Application Accepted**: Ứng tuyển được chấp nhận (Guide)
- **Application Rejected**: Ứng tuyển bị từ chối (Guide)
- **New Assignment**: Có assignment mới (Guide)
- **Payment Received**: Nhận thanh toán (Guide)
- **Payment Request**: Yêu cầu thanh toán (Operator)
- **Verification Approved**: Xác minh được duyệt
- **Verification Rejected**: Xác minh bị từ chối
- **New Contract**: Có hợp đồng mới (Guide)
- **Emergency Report**: Báo cáo khẩn cấp (Operator)
- **Tour Started**: Tour đã bắt đầu chạy
  - **Cho Guide**: "Tour đã bắt đầu chạy. Ngày và giờ khởi hành: [thời gian]. Ngày và giờ kết thúc: [thời gian]. Hãy đảm bảo bạn đến đúng giờ và tuân thủ quy định của tour operator. Chúc bạn một chuyến đi tốt lành và hoàn thành tốt nhiệm vụ!"
  - **Cho Operator**: "Tour đã đến giờ khởi hành. Ngày và giờ khởi hành: [thời gian]. Ngày và giờ kết thúc: [thời gian]."
- **Tour Start Warning**: Tour đã đến giờ khởi hành nhưng chưa có guide được chấp nhận
  - **Cho Operator**: "Tour đã đến giờ khởi hành nhưng chưa có guide nào được chấp nhận. Hiện có [X] ứng tuyển đang chờ bạn duyệt. Vui lòng kiểm tra và chấp nhận guide ngay hoặc hủy tour nếu không tìm được guide phù hợp."
- **Tour Cancelled No Guides**: Tour đã bị hủy vì không tìm được guide
  - **Cho Operator**: "Tour đã đến giờ khởi hành nhưng không có guide nào ứng tuyển hoặc được chấp nhận. Tour đã được tự động hủy. Vui lòng tìm phương án khác hoặc tạo tour mới."

---

## 📄 Hợp đồng

### Tạo Hợp đồng

**Cho Operator:**
1. Vào tour → **Hợp đồng**
2. Nhập nội dung hợp đồng
3. Nhấn **"Tạo hợp đồng"**
4. Guide sẽ nhận thông báo

### Xem và Chấp nhận Hợp đồng

**Cho Guide:**
1. Nhận thông báo về hợp đồng mới
2. Vào tour → **Hợp đồng**
3. Xem nội dung
4. **Chấp nhận** hoặc **Từ chối**

### Trạng thái Hợp đồng

- **NOT_VIEWED**: Chưa xem
- **VIEWED**: Đã xem
- **ACCEPTED**: Đã chấp nhận ✅
- **REJECTED**: Đã từ chối

---

## ⚠️ Hệ thống Xử lý Tranh chấp (Enhanced Dispute Resolution)

### Tổng quan

Hệ thống xử lý tranh chấp được nâng cấp để cung cấp một quy trình minh bạch và công bằng cho việc giải quyết các tranh chấp giữa Tour Operator và Tour Guide. Hệ thống bao gồm timeline theo dõi, upload bằng chứng, và tích hợp với hệ thống Escrow.

### Lợi ích

- **Timeline minh bạch:** Theo dõi toàn bộ lịch sử xử lý dispute
- **Bằng chứng đầy đủ:** Upload và quản lý bằng chứng dễ dàng
- **Tích hợp Escrow:** Tự động giữ tiền trong escrow khi có dispute
- **Phân quyền rõ ràng:** Admin/Moderator xử lý, users có thể appeal

### Tạo Dispute

**Cho Operator và Guide:**

1. Vào trang tour detail hoặc payment detail
2. Click nút **"Tạo Dispute"**
3. Chọn loại dispute:
   - **PAYMENT**: Vấn đề về thanh toán
   - **ASSIGNMENT**: Vấn đề về phân công
   - **NO_SHOW**: Guide không xuất hiện hoặc Operator không xuất hiện
   - **QUALITY**: Vấn đề về chất lượng dịch vụ
4. Nhập mô tả chi tiết
5. Upload bằng chứng (hình ảnh, tài liệu, v.v.)
6. Submit

**Lưu ý:**
- Dispute sẽ tự động chặn việc release/refund escrow nếu có escrow account liên quan
- Dispute sẽ được gửi đến Admin/Moderator để xử lý
- Bạn sẽ nhận được thông báo khi dispute được tạo

### Thêm Bằng chứng

Sau khi tạo dispute, bạn có thể thêm bằng chứng bổ sung:

1. Vào trang dispute detail
2. Click **"Thêm Bằng chứng"**
3. Upload file (hình ảnh, PDF, v.v.)
4. Submit

### Xử lý Dispute (Admin/Moderator)

**Cho Admin/Moderator:**

1. Vào **Dashboard Admin > Disputes**
2. Xem danh sách disputes với filters (status, type)
3. Click vào dispute để xem chi tiết:
   - Thông tin dispute (type, description, creator)
   - Timeline (lịch sử xử lý)
   - Bằng chứng (evidence)
   - Thông tin tour/payment liên quan
   - Escrow account (nếu có)
4. Xử lý dispute:

   **Resolve (Giải quyết):**
   - Chọn resolution type:
     - **FULL_REFUND**: Hoàn tiền đầy đủ cho operator
     - **PARTIAL_REFUND**: Hoàn tiền một phần cho operator
     - **FULL_PAYMENT**: Thanh toán đầy đủ cho guide
     - **PARTIAL_PAYMENT**: Thanh toán một phần cho guide
     - **NO_ACTION**: Không có hành động nào
   - Nhập resolution amount (nếu partial)
   - Nhập resolution notes
   - Submit

   **Reject (Từ chối):**
   - Nhập lý do từ chối
   - Submit

   **Escalate (Nâng cấp):**
   - Nếu dispute phức tạp, có thể escalate lên cấp cao hơn
   - Dispute sẽ được chuyển sang trạng thái **ESCALATED**

5. Sau khi resolve:
   - Escrow sẽ tự động được release hoặc refund dựa trên resolution
   - Cả hai bên sẽ nhận được thông báo

### Timeline

Timeline hiển thị toàn bộ lịch sử xử lý dispute:

- **CREATED**: Dispute được tạo
- **EVIDENCE_ADDED**: Bằng chứng được thêm
- **ASSIGNED**: Dispute được giao cho admin
- **STATUS_UPDATED**: Trạng thái được cập nhật
- **RESOLUTION_PROPOSED**: Đề xuất giải pháp
- **RESOLUTION_ACCEPTED**: Giải pháp được chấp nhận
- **RESOLUTION_REJECTED**: Giải pháp bị từ chối
- **REFUND_INITIATED**: Hoàn tiền được khởi tạo
- **ESCALATED**: Dispute được nâng cấp
- **CLOSED**: Dispute được đóng

### Appeal (Kháng cáo)

Nếu bạn không đồng ý với resolution:

1. Vào trang dispute detail
2. Click **"Appeal"** (chỉ có thể appeal nếu dispute đã được RESOLVED hoặc REJECTED)
3. Nhập lý do kháng cáo
4. Submit

Appeal sẽ tạo một dispute mới liên kết với dispute gốc và được gửi lại cho Admin xử lý.

### Trạng thái Dispute

- **PENDING**: Đang chờ xử lý
- **IN_REVIEW**: Đang được xem xét bởi admin
- **ESCALATED**: Đã được nâng cấp lên cấp cao hơn
- **RESOLVED**: Đã được giải quyết
- **REJECTED**: Đã bị từ chối
- **APPEALED**: Đã được kháng cáo

### Tích hợp với Escrow

Khi có dispute liên quan đến escrow account:

- Escrow sẽ tự động bị chặn release/refund
- Chỉ khi dispute được resolve, escrow mới có thể được release/refund
- Resolution sẽ quyết định việc release hoặc refund escrow

### Lưu ý quan trọng

- Dispute phải được tạo trong vòng 30 ngày sau khi tour kết thúc
- Bằng chứng phải là file hợp lệ (hình ảnh, PDF)
- Admin/Moderator sẽ xử lý dispute trong vòng 5-7 ngày làm việc
- Nếu không đồng ý với resolution, bạn có thể appeal trong vòng 7 ngày

---

## ❓ Câu hỏi thường gặp (FAQ)

### Đăng ký và Xác thực

**Q: Tôi quên mật khẩu, làm sao?**
A: Liên hệ Admin để reset mật khẩu.

**Q: Tôi có thể đổi vai trò sau khi đăng ký không?**
A: Không, bạn cần tạo tài khoản mới với vai trò khác.

**Q: Xác minh mất bao lâu?**
A: Thường trong 1-3 ngày làm việc, tùy vào số lượng yêu cầu.

### Ví và Thanh toán

**Q: Tại sao tôi không thể rút tiền?**
A: 
- Guide: Số dư sau khi rút phải ≥ 500,000 VND
- Operator: Không được rút locked deposit (1M VND)

**Q: Top-up mất bao lâu?**
A: Thường trong 1-2 ngày làm việc sau khi Admin duyệt.

**Q: Tôi có thể nạp tiền bằng cách nào?**
A: Chuyển khoản ngân hàng, MoMo, ZaloPay, hoặc phương thức khác.

### Tour và Ứng tuyển

**Q: Tại sao tôi không thể tạo tour?**
A: 
- KYB chưa được duyệt
- Chưa có đủ 1M VND locked deposit

**Q: Tại sao tôi không thể ứng tuyển?**
A:
- KYC chưa được duyệt
- Số dư < 500,000 VND
- Tour đã đầy slot
- Bị conflict với tour khác

**Q: Tôi có thể hủy ứng tuyển không?**
A: Có, nếu ứng tuyển còn ở trạng thái PENDING.

**Q: Tour bị conflict là gì?**
A: Bạn đã ứng tuyển/được chấp nhận tour khác trùng ngày.

**Q: Khi nào tour biến mất khỏi danh sách tour mở?**
A: Khi tour operator chuyển trạng thái tour sang **IN_PROGRESS**. Lúc này tour sẽ không còn hiển thị trong marketplace nữa.

**Q: Tôi nhận được thông báo "Tour đã bắt đầu chạy", tôi cần làm gì?**
A: 
- Kiểm tra thông tin ngày và giờ khởi hành, ngày và giờ kết thúc trong thông báo
- Đảm bảo bạn đến đúng giờ và địa điểm khởi hành
- Tuân thủ quy định của tour operator
- Hoàn thành tốt nhiệm vụ của bạn

**Q: Tại sao tôi không thể ứng tuyển tour này?**
A: Có thể do:
- Tour đã quá giờ khởi hành (đã bắt đầu hoặc đã qua thời gian khởi hành)
- Tour không ở trạng thái OPEN
- Bạn chưa đủ điều kiện (KYC, số dư, v.v.)

**Q: Tôi có thể nộp báo cáo tour sau 2 giờ không?**
A: 
- Có, bạn vẫn có thể nộp báo cáo sau 2 giờ
- Tuy nhiên, bạn sẽ **KHÔNG THỂ NHẬN THANH TOÁN** cho tour đó
- Operator cũng **KHÔNG THỂ** thanh toán cho bạn
- Hãy nộp báo cáo trong vòng 2 giờ sau khi tour kết thúc để đảm bảo nhận được thanh toán

**Q: Tại sao tôi không thể thanh toán cho guide?**
A: Có thể do:
- Tour chưa kết thúc
- Guide chưa nộp báo cáo tour
- Guide đã nộp báo cáo nhưng quá hạn 2 giờ sau khi tour kết thúc
- Số dư không đủ

**Q: Tôi quên nộp báo cáo trong vòng 2 giờ, có cách nào khắc phục không?**
A: 
- Không, đây là quy định bắt buộc để đảm bảo guide hoàn thành trách nhiệm
- Bạn sẽ không thể nhận thanh toán cho tour đó
- Hãy nhớ nộp báo cáo ngay sau khi tour kết thúc trong các tour tiếp theo

**Q: Tour của tôi sẽ tự động chuyển trạng thái khi đến giờ khởi hành không?**
A: 
- Có, hệ thống tự động kiểm tra và cập nhật trạng thái tour mỗi phút
- **Nếu có guide được chấp nhận**: Tour tự động chuyển sang IN_PROGRESS
- **Nếu có ứng tuyển đang chờ**: Hệ thống thông báo cho bạn để bạn quyết định
- **Nếu không có guide**: Tour tự động chuyển sang CANCELLED và thông báo cho bạn

**Q: Tôi nhận được thông báo "Tour đã đến giờ khởi hành nhưng chưa có guide được chấp nhận", tôi cần làm gì?**
A:
- Kiểm tra danh sách ứng tuyển ngay
- Chấp nhận guide phù hợp nếu có
- Hoặc hủy tour nếu không tìm được guide phù hợp
- Tour sẽ không tự động hủy nếu còn ứng tuyển đang chờ, để bạn có cơ hội chấp nhận guide

### Công ty

**Q: Tôi có thể tham gia nhiều công ty không?**
A: Không, mỗi guide chỉ có thể thuộc một công ty.

**Q: Tôi có thể rời công ty không?**
A: Liên hệ Admin để được hỗ trợ.

### Khác

**Q: Tôi gặp lỗi, làm sao?**
A: Liên hệ Support hoặc tạo Dispute.

**Q: Tôi có thể xóa tài khoản không?**
A: Liên hệ Admin để được hỗ trợ.

---

## 📞 Liên hệ Hỗ trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi:

1. Kiểm tra FAQ ở trên
2. Tạo Dispute trong hệ thống
3. Liên hệ Admin qua email hoặc trong hệ thống
4. Xem tài liệu kỹ thuật trong các file:
   - `API_ENDPOINTS.md`
   - `FEATURES.md`
   - `ERROR_HANDLING_GUIDE.md`

---

## 📝 Ghi chú

- Tất cả số tiền trong hệ thống tính bằng **VND (Việt Nam Đồng)**
- Hệ thống tự động kiểm tra các điều kiện pháp lý
- Mọi giao dịch đều được ghi lại trong lịch sử
- Thông báo được gửi tự động cho các sự kiện quan trọng
- **Hệ thống tự động cập nhật trạng thái tour** khi đến giờ khởi hành (chạy mỗi phút qua cron job)
- **Quy định về thời gian:**
  - Guide không thể ứng tuyển tour đã quá giờ khởi hành
  - Guide phải nộp báo cáo trong vòng 2 giờ sau khi tour kết thúc để nhận thanh toán
  - Operator không thể thanh toán nếu guide chưa nộp báo cáo đúng hạn
  - Tour tự động chuyển trạng thái khi đến giờ khởi hành (IN_PROGRESS nếu có guide, CANCELLED nếu không có guide)

---

**LUNAVIA** - Kết nối thông minh Tour Operator & HDV ⚖️🤖🚀

*Phiên bản: 1.0*  
*Cập nhật: 2025*

