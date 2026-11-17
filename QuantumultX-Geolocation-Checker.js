/*
 * Quantumult X - Geolocation Checker
 * API: ip-api.com (free endpoint, HTTP)
 * Chuc nang: Lay IP cong khai va thong tin dia ly/mang cua IP dau ra.
 * Cach chay: Tao mot Task Script trong Quantumult X va chay thu cong.
 */

const API_URL =
  "http://ip-api.com/json/?fields=status,message,query,country,countryCode,regionName,city,district,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting";

// Chuyen gia tri rong/null/undefined thanh chuoi de tranh loi khi ghep chuoi.
function safeText(value, fallback = "Không có dữ liệu") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  return String(value);
}

// Tao co emoji tu ma quoc gia ISO 3166-1 alpha-2, vi du VN -> 🇻🇳.
function countryFlag(countryCode) {
  if (typeof countryCode !== "string" || !/^[A-Z]{2}$/.test(countryCode)) {
    return "🌐";
  }

  const flagCodePoints = [...countryCode].map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...flagCodePoints);
}

// Lay so ASN tu chuoi, vi du "AS135918 VIET DIGITAL..." -> "AS135918".
function getASN(asInfo) {
  const match = safeText(asInfo, "").match(/^AS\d+/i);
  return match ? match[0].toUpperCase() : "Không có dữ liệu";
}

// Tao chuoi dia diem tu cac truong API co du lieu.
function getLocation(data) {
  return [data.city, data.regionName, data.country]
    .filter(value => value !== undefined && value !== null && value !== "")
    .join(", ") || "Không xác định";
}

// Tao trang thai dac biet cua IP.
function getNetworkFlags(data) {
  const labels = [];

  if (data.mobile === true) labels.push("Di động");
  if (data.proxy === true) labels.push("Proxy/VPN");
  if (data.hosting === true) labels.push("Hosting/Data Center");

  return labels.length > 0 ? labels.join(" | ") : "Không có cờ đặc biệt";
}

function finishWithError(title, message) {
  $notify("Geolocation Checker", title, message);
  $done();
}

$task.fetch({
  url: API_URL,
  method: "GET",
  headers: {
    "Accept": "application/json",
    "User-Agent": "Quantumult-X-Geolocation-Checker"
  }
}).then(response => {
  // Kiem tra phan hoi HTTP truoc khi doc JSON.
  if (!response || response.statusCode !== 200) {
    const statusCode = response ? response.statusCode : "Không nhận được phản hồi";
    finishWithError("Lỗi HTTP", "Mã trạng thái: " + statusCode);
    return;
  }

  // JSON.parse co the loi neu API tra ve du lieu khong hop le.
  let data;
  try {
    data = JSON.parse(response.body);
  } catch (error) {
    finishWithError("Lỗi JSON", safeText(error.message, String(error)));
    return;
  }

  // ip-api co the tra HTTP 200 nhung status trong JSON la fail.
  if (data.status !== "success") {
    finishWithError("Không thể định vị IP", safeText(data.message));
    return;
  }

  const flag = countryFlag(data.countryCode);
  const location = getLocation(data);
  const ip = safeText(data.query);
  const asn = getASN(data.as);

  const title = `${flag} ${location}`;
  const subtitle = `${ip}  •  ${safeText(data.isp)}`;

  const description = [
    `IP công khai: ${ip}`,
    `Quốc gia: ${safeText(data.country)} (${safeText(data.countryCode)})`,
    `Khu vực: ${safeText(data.regionName)}`,
    `Thành phố: ${safeText(data.city)}`,
    `Quận/Huyện: ${safeText(data.district)}`,
    `Mã bưu chính: ${safeText(data.zip)}`,
    `Tọa độ: ${safeText(data.lat)}, ${safeText(data.lon)}`,
    `Múi giờ: ${safeText(data.timezone)}`,
    "",
    `ISP: ${safeText(data.isp)}`,
    `Tổ chức: ${safeText(data.org)}`,
    `ASN: ${asn}`,
    `Tên ASN: ${safeText(data.asname)}`,
    "",
    `Phân loại mạng: ${getNetworkFlags(data)}`
  ].join("\n");

  // Hien thi ket qua bang thong bao Quantumult X.
  $notify(title, subtitle, description);
  $done();

}).catch(error => {
  finishWithError("Lỗi kết nối", safeText(error.message, String(error)));
});
