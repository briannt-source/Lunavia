/**
 * lib/email-templates.ts
 * 
 * Branded email templates for Lunavia transactional emails.
 * Uses inline CSS for maximum email client compatibility.
 */

const BRAND = {
    name: 'Lunavia',
    color: '#4F46E5',
    colorDark: '#3730A3',
    colorLight: '#EEF2FF',
    gray: '#6B7280',
    grayLight: '#F3F4F6',
    logo: '🌙',
};

function baseLayout(title: string, content: string) {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0; padding:0; background:#f3f4f6; font-family:'Segoe UI',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:24px 0;">
        <tr><td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.06);">
            <!-- Header -->
            <tr><td style="background:linear-gradient(135deg,${BRAND.color},${BRAND.colorDark}); padding:24px 32px; text-align:center;">
              <span style="font-size:32px;">${BRAND.logo}</span>
              <h1 style="margin:8px 0 0; color:#ffffff; font-size:20px; font-weight:700; letter-spacing:1px;">${BRAND.name}</h1>
            </td></tr>
            <!-- Title -->
            <tr><td style="padding:24px 32px 0;">
              <h2 style="margin:0; color:#111827; font-size:22px; font-weight:700;">${title}</h2>
            </td></tr>
            <!-- Content -->
            <tr><td style="padding:16px 32px 32px; color:#374151; font-size:15px; line-height:1.7;">
              ${content}
            </td></tr>
            <!-- Footer -->
            <tr><td style="background:${BRAND.grayLight}; padding:16px 32px; text-align:center; border-top:1px solid #E5E7EB;">
              <p style="margin:0; color:${BRAND.gray}; font-size:12px;">
                © ${new Date().getFullYear()} Lunavia · Tour Operations Platform
              </p>
              <p style="margin:4px 0 0; color:#9CA3AF; font-size:11px;">
                Bạn nhận email này vì có tài khoản trên Lunavia.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>`;
}

function button(label: string, url: string) {
    return `<div style="text-align:center; margin:24px 0;">
      <a href="${url}" style="display:inline-block; background:${BRAND.color}; color:#ffffff; padding:14px 32px; text-decoration:none; border-radius:10px; font-weight:700; font-size:15px;">${label}</a>
    </div>`;
}

function infoBox(rows: { label: string; value: string }[]) {
    return `<div style="background:${BRAND.grayLight}; border-radius:10px; padding:16px 20px; margin:16px 0;">
      ${rows.map(r => `<div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #E5E7EB;">
        <span style="color:${BRAND.gray}; font-size:13px;">${r.label}</span>
        <span style="color:#111827; font-weight:600; font-size:13px;">${r.value}</span>
      </div>`).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════════
// TEMPLATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/** Tour confirmation email to operator */
export function tourPublishedEmail(tourTitle: string, tourId: string) {
    return baseLayout('Tour Published Successfully', `
      <p>Tour <strong>${tourTitle}</strong> đã được đăng thành công trên Lunavia.</p>
      <p>Hướng dẫn viên giờ đây có thể tìm thấy và ứng tuyển vào tour này.</p>
      ${button('Xem Tour', `${process.env.NEXTAUTH_URL}/dashboard/operator/tours/${tourId}`)}
    `);
}

/** New application notification to operator */
export function newApplicationEmail(guideName: string, tourTitle: string, tourId: string) {
    return baseLayout('Ứng Tuyển Mới', `
      <p><strong>${guideName}</strong> đã ứng tuyển vào tour:</p>
      ${infoBox([{ label: 'Tour', value: tourTitle }])}
      <p>Hãy xem hồ sơ và phản hồi sớm để đảm bảo nhân sự cho tour.</p>
      ${button('Xem Ứng Tuyển', `${process.env.NEXTAUTH_URL}/dashboard/operator/tours/${tourId}`)}
    `);
}

/** Application result email to guide */
export function applicationResultEmail(tourTitle: string, operatorName: string, accepted: boolean) {
    const statusText = accepted ? '✅ Đã Được Chấp Nhận' : '❌ Chưa Được Chọn';
    const message = accepted
        ? `Chúc mừng! Bạn đã được <strong>${operatorName}</strong> chọn cho tour <strong>${tourTitle}</strong>. Hãy chuẩn bị cho tour nhé!`
        : `Rất tiếc, ứng tuyển của bạn vào tour <strong>${tourTitle}</strong> đã không được chọn lần này. Đừng nản, hãy tiếp tục ứng tuyển các tour khác!`;

    return baseLayout(`Kết Quả Ứng Tuyển: ${statusText}`, `
      <p>${message}</p>
      ${button('Xem Dashboard', `${process.env.NEXTAUTH_URL}/dashboard/guide`)}
    `);
}

/** Tour started notification */
export function tourStartedEmail(tourTitle: string, guideName: string, location: string) {
    return baseLayout('Tour Đã Bắt Đầu', `
      <p>Tour <strong>${tourTitle}</strong> đã chính thức bắt đầu.</p>
      ${infoBox([
        { label: 'Hướng dẫn viên', value: guideName },
        { label: 'Địa điểm', value: location },
        { label: 'Thời gian', value: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) },
      ])}
    `);
}

/** Payment received notification to guide */
export function paymentReceivedEmail(amount: string, tourTitle: string) {
    return baseLayout('Đã Nhận Thanh Toán', `
      <p>Bạn đã nhận thanh toán cho tour hoàn thành:</p>
      ${infoBox([
        { label: 'Tour', value: tourTitle },
        { label: 'Số tiền', value: amount },
        { label: 'Trạng thái', value: '✅ Đã vào ví' },
      ])}
      ${button('Xem Ví', `${process.env.NEXTAUTH_URL}/dashboard/guide/earnings`)}
    `);
}

/** SOS Alert to operator */
export function sosAlertEmail(tourTitle: string, guideName: string, description: string) {
    return baseLayout('🚨 SOS Alert — Hành Động Ngay', `
      <div style="background:#FEF2F2; border:1px solid #FECACA; border-radius:10px; padding:16px; margin-bottom:16px;">
        <p style="color:#991B1B; font-weight:700; margin:0;">⚠️ EMERGENCY ALERT</p>
      </div>
      <p>Hướng dẫn viên <strong>${guideName}</strong> đã phát tín hiệu SOS từ tour <strong>${tourTitle}</strong>.</p>
      <p style="color:#991B1B;"><strong>Mô tả:</strong> ${description}</p>
      ${button('Xem Chi Tiết', `${process.env.NEXTAUTH_URL}/dashboard/operator/emergencies`)}
      <p style="color:#EF4444; font-weight:600;">Vui lòng phản hồi ngay lập tức.</p>
    `);
}

/** KYC verification result */
export function kycResultEmail(approved: boolean, reason?: string) {
    const title = approved ? 'Xác Minh Thành Công' : 'Xác Minh Chưa Đạt';
    const message = approved
        ? 'Tài khoản của bạn đã được xác minh thành công. Bạn có thể sử dụng đầy đủ tính năng của Lunavia.'
        : `Hồ sơ xác minh của bạn chưa đạt yêu cầu. ${reason ? `Lý do: ${reason}` : 'Vui lòng cập nhật lại hồ sơ.'}`;

    return baseLayout(title, `
      <p>${message}</p>
      ${button('Quay Lại Dashboard', `${process.env.NEXTAUTH_URL}/dashboard`)}
    `);
}

/** Top-up approved notification */
export function topUpApprovedEmail(amount: string) {
    return baseLayout('Nạp Tiền Thành Công', `
      <p>Yêu cầu nạp tiền của bạn đã được duyệt.</p>
      ${infoBox([
        { label: 'Số tiền', value: amount },
        { label: 'Trạng thái', value: '✅ Đã vào ví' },
      ])}
      ${button('Xem Số Dư', `${process.env.NEXTAUTH_URL}/dashboard/operator/wallet`)}
    `);
}

/** Withdrawal approved notification */
export function withdrawalApprovedEmail(amount: string, method: string) {
    return baseLayout('Rút Tiền Thành Công', `
      <p>Yêu cầu rút tiền của bạn đã được duyệt và xử lý.</p>
      ${infoBox([
        { label: 'Số tiền', value: amount },
        { label: 'Phương thức', value: method },
        { label: 'Trạng thái', value: '✅ Đang chuyển khoản' },
      ])}
    `);
}

/** Tracking link shared email */
export function trackingLinkEmail(tourTitle: string, agencyName: string, trackingUrl: string) {
    return baseLayout('Tour Tracking Link', `
      <p>Bạn đã nhận được link theo dõi tour từ Lunavia:</p>
      ${infoBox([
        { label: 'Tour', value: tourTitle },
        { label: 'Từ', value: agencyName },
      ])}
      <p>Sử dụng link bên dưới để xem trạng thái tour theo thời gian thực:</p>
      ${button('Theo Dõi Tour', trackingUrl)}
      <p style="color:${BRAND.gray}; font-size:12px;">Link này không yêu cầu đăng nhập. Nó sẽ tự hết hạn sau khi tour kết thúc.</p>
    `);
}
