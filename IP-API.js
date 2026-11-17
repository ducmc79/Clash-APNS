
/*
 * Quantumult X - IP Geolocation Checker
 * API: ip-api.com
 * Ngôn ngữ hiển thị: Tiếng Việt
 */

// 1. Kiểm tra phản hồi HTTP
if (!$response || $response.statusCode !== 200) {
  $done(null);
  return;
}

// 2. Phân tích dữ liệu JSON
let data;

try {
  data = JSON.parse($response.body);
} catch (error) {
  $done(null);
  return;
}

// 3. Hàm xử lý dữ liệu trống
function giaTri(value) {
  if (value === undefined || value === null || value === "") {
    return "Không có dữ liệu";
  }

  return String(value);
}

// 4. Chuyển mã quốc gia thành emoji cờ
function layCo(maQuocGia) {
  if (!maQuocGia || maQuocGia.length !== 2) {
    return "🌐";
  }

  const ma = maQuocGia.toUpperCase();

  return String.fromCodePoint(
    127397 + ma.charCodeAt(0),
    127397 + ma.charCodeAt(1)
  );
}

// 5. Xử lý trạng thái API
const trangThai = data.status === "success"
  ? "Thành công"
  : "Thất bại";

const thongBao = data.status === "success"
  ? "Không có lỗi"
  : giaTri(data.message);

// 6. Tạo tiêu đề
const title = data.status === "success"
  ? `${layCo(data.countryCode)} ${giaTri(data.country)}`
  : "⚠️ Không thể xác định IP";

// 7. Tạo dòng thông tin ngắn
const subtitle = [
  giaTri(data.city),
  giaTri(data.regionName),
  giaTri(data.query)
].join(" • ");

// 8. Địa chỉ IP
const ip = giaTri(data.query);

// 9. Tạo nội dung chi tiết
const description = [
  `TRẠNG THÁI: ${trangThai}`,
  `THÔNG BÁO: ${thongBao}`,
  "",
  `QUỐC GIA: ${giaTri(data.country)}`,
  `MÃ QUỐC GIA: ${giaTri(data.countryCode)}`,
  `TỈNH / THÀNH PHỐ: ${giaTri(data.regionName)}`,
  `THÀNH PHỐ: ${giaTri(data.city)}`,
  "",
  `VĨ ĐỘ: ${giaTri(data.lat)}`,
  `KINH ĐỘ: ${giaTri(data.lon)}`,
  `MÚI GIỜ: ${giaTri(data.timezone)}`,
  "",
  `NHÀ MẠNG (ISP): ${giaTri(data.isp)}`,
  `TỔ CHỨC (ORG): ${giaTri(data.org)}`,
  "",
  `ĐỊA CHỈ IP: ${ip}`
].join("\n");

// 10. Trả kết quả về Quantumult X
$done({
  title: title,
  subtitle: subtitle,
  ip: ip,
  description: description
});
