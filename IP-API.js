/*
 * Quantumult X - Geo Location Checker
 * Chuyển ngữ và chỉnh sửa từ IP(1).js
 * API: ip-api.com
 *
 * Cấu hình geo_location_checker trong [general]:
 * http://ip-api.com/json/?fields=status,message,country,countryCode,regionName,city,lat,lon,timezone,isp,org,as,asname,query, https://<URL_RAW_CUA_FILE>/IP-Geolocation-VI.js
 *
 * Đây là response script: Quantumult X gọi API và truyền JSON vào $response.body.
 * Không dùng $task.fetch() trong file này.
 */

// Nếu HTTP/API không trả về 200, kết thúc script an toàn.
if (!$response || $response.statusCode !== 200 || !$response.body) {
  $done(null);
} else {
  try {
    // Chuyển JSON từ API thành đối tượng JavaScript.
    const data = JSON.parse($response.body);

    // Lấy chuỗi an toàn: nếu API không có dữ liệu thì hiển thị "Không có dữ liệu".
    function layChuoi(value, macDinh = "Không có dữ liệu") {
      if (value === undefined || value === null || value === "") {
        return macDinh;
      }
      return String(value);
    }

    // Định dạng tọa độ, không tự tạo giá trị khi API không trả về.
    function dinhDangToaDo(value) {
      return typeof value === "number" && Number.isFinite(value)
        ? value.toFixed(4)
        : "Không có dữ liệu";
    }

    // Chuyển mã quốc gia ISO thành emoji lá cờ.
    function taoCo(code) {
      if (!code || !/^[A-Z]{2}$/i.test(code)) return "🌐";
      const ma = code.toUpperCase();
      return String.fromCodePoint(
        ...Array.from(ma).map(char => 127397 + char.charCodeAt(0))
      );
    }

    // Tách mã ASN từ trường "as", ví dụ: "AS135918 VIET DIGITAL...".
    function tachASN(value) {
      const ketQua = layChuoi(value, "");
      const match = ketQua.match(/^(AS\d+)/i);
      return match ? match[1].toUpperCase() : "Không có dữ liệu";
    }

    // API có thể trả status=fail kèm message thay vì dữ liệu địa lý.
    if (data.status !== "success") {
      const loi = layChuoi(data.message, "Không xác định được địa chỉ IP");
      $done({
        title: "🌐 Không thể định vị IP",
        subtitle: loi,
        ip: layChuoi(data.query, ""),
        description: `Trạng thái: Thất bại\nLý do: ${loi}`
      });
    } else {
      // Thông tin địa điểm dùng cho tiêu đề.
      const quocGia = layChuoi(data.country);
      const tinhThanh = layChuoi(data.regionName, "");
      const thanhPho = layChuoi(data.city, "");
      const diaDiem = [thanhPho, tinhThanh, quocGia]
        .filter(value => value && value !== "Không có dữ liệu")
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(", ") || "Không rõ vị trí";

      const ip = layChuoi(data.query);
      const isp = layChuoi(data.isp);
      const org = layChuoi(data.org);
      const asDayDu = layChuoi(data.as);
      const asn = tachASN(data.as);
      const asname = layChuoi(data.asname);
      const muiGio = layChuoi(data.timezone);
      const viDo = dinhDangToaDo(data.lat);
      const kinhDo = dinhDangToaDo(data.lon);
      const maQuocGia = layChuoi(data.countryCode, "");

      // Tiêu đề và dòng phụ hiển thị trong Quantumult X.
      const title = `${taoCo(maQuocGia)} ${thanhPho || tinhThanh || quocGia}`;
      const subtitle = `${isp}  •  ${diaDiem}  •  ${ip}`;

      // Nội dung chi tiết bằng tiếng Việt.
      const description = [
        `ĐỊA CHỈ IP: ${ip}`,
        `QUỐC GIA: ${quocGia}`,
        `MÃ QUỐC GIA: ${layChuoi(data.countryCode)}`,
        `TỈNH / THÀNH PHỐ: ${tinhThanh || "Không có dữ liệu"}`,
        `THÀNH PHỐ: ${thanhPho || "Không có dữ liệu"}`,
        `VĨ ĐỘ: ${viDo}`,
        `KINH ĐỘ: ${kinhDo}`,
        `MÚI GIỜ: ${muiGio}`,
        `NHÀ MẠNG (ISP): ${isp}`,
        `TỔ CHỨC (ORG): ${org}`,
        `ASN: ${asn}`,
        `TÊN ASN: ${asname}`,
        `ASN ĐẦY ĐỦ: ${asDayDu}`,
        `TRẠNG THÁI: Thành công`
      ].join("\n\n");

      // Trả dữ liệu theo định dạng Geo Location Checker của Quantumult X.
      $done({
        title: title,
        subtitle: subtitle,
        ip: ip,
        description: description
      });
    }
  } catch (error) {
    // Bắt lỗi JSON hoặc lỗi xử lý để tránh script bị dừng đột ngột.
    $done({
      title: "🌐 Lỗi Geo Location Checker",
      subtitle: "Không thể đọc dữ liệu từ ip-api.com",
      ip: "",
      description: `Chi tiết lỗi: ${String(error)}`
    });
  }
}
