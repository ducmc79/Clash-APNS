
/*
 * Quantumult X - IP Geolocation Checker
 * Vietnamese Edition
 *
 * Chỉ sử dụng 12 trường:
 * status, message, country, countryCode,
 * regionName, city, lat, lon, timezone,
 * isp, org, query
 */

if (!$response || $response.statusCode !== 200 || !$response.body) {
  $done(null);
} else {
  try {
    const data = JSON.parse($response.body);

    // Xử lý dữ liệu trống
    function giaTri(value) {
      return value === undefined || value === null || value === ""
        ? "Không có dữ liệu"
        : String(value);
    }

    // Chuyển mã quốc gia thành emoji cờ
    function layCo(ma) {
      if (typeof ma !== "string" || !/^[A-Za-z]{2}$/.test(ma)) {
        return "🌐";
      }

      ma = ma.toUpperCase();

      return String.fromCodePoint(
        127397 + ma.charCodeAt(0),
        127397 + ma.charCodeAt(1)
      );
    }

    const trangThai = data.status === "success"
      ? "Thành công"
      : "Thất bại";

    const thongBao = data.message
      ? giaTri(data.message)
      : data.status === "success"
        ? "Không có thông báo"
        : "Không có dữ liệu";

    const quocGia = giaTri(data.country);
    const thanhPho = data.city ? String(data.city) : "";
    const vung = data.regionName ? String(data.regionName) : "";

    const title = data.status === "success"
      ? `${layCo(data.countryCode)} ${thanhPho || vung || quocGia}`
      : "🌐 Không thể xác định IP";

    const ip = giaTri(data.query);

    const subtitle = data.status === "success"
      ? `${giaTri(data.isp)} • ${ip}`
      : thongBao;

    // Chỉ hiển thị đúng các trường được yêu cầu
    const description = [
      `TRẠNG THÁI (status): ${trangThai}`,
      `THÔNG BÁO (message): ${thongBao}`,
      `QUỐC GIA (country): ${quocGia}`,
      `MÃ QUỐC GIA (countryCode): ${giaTri(data.countryCode)}`,
      `TỈNH / VÙNG (regionName): ${giaTri(data.regionName)}`,
      `THÀNH PHỐ (city): ${giaTri(data.city)}`,
      `VĨ ĐỘ (lat): ${giaTri(data.lat)}`,
      `KINH ĐỘ (lon): ${giaTri(data.lon)}`,
      `MÚI GIỜ (timezone): ${giaTri(data.timezone)}`,
      `NHÀ MẠNG (isp): ${giaTri(data.isp)}`,
      `TỔ CHỨC (org): ${giaTri(data.org)}`,
      `ĐỊA CHỈ IP (query): ${ip}`
    ].join("\n\n");

    $done({
      title: title,
      subtitle: subtitle,
      ip: ip,
      description: description
    });

  } catch (error) {
    $done({
      title: "Lỗi Geolocation",
      subtitle: "Không thể đọc dữ liệu JSON",
      ip: "",
      description: String(error)
    });
  }
}
