# Bản đồ dân cư - React + Leaflet + GeoJSON

Ứng dụng web hiển thị bản đồ dân cư sử dụng React, Leaflet và dữ liệu GeoJSON động.

## Tính năng

- 🗺️ Hiển thị bản đồ tương tác với Leaflet
- 📊 Load dữ liệu GeoJSON động
- 🎯 Click vào khu vực để xem thông tin chi tiết
- 📱 Giao diện responsive
- 🔄 Chuyển đổi giữa các file GeoJSON khác nhau
- 💡 Hiệu ứng hover và popup thông tin

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm run dev
```

3. Mở trình duyệt tại `http://localhost:5173`

## Cấu trúc project

```
ban-do-dan-cu/
├── public/
│   └── sample-data/
│       ├── hung-yen-thu-vu.json
│       └── vietnam-provinces.json
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── index.html
```

## Sử dụng

### Thêm dữ liệu GeoJSON mới

1. Đặt file GeoJSON vào thư mục `public/sample-data/`
2. Cập nhật danh sách `sampleFiles` trong `src/App.jsx`:

```javascript
const sampleFiles = [
  {
    name: 'Tên hiển thị',
    path: '/sample-data/ten-file.json'
  },
  // ... các file khác
]
```

### Định dạng dữ liệu GeoJSON

File GeoJSON cần có cấu trúc:

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Tên khu vực",
        "population": "Dân số",
        "area": "Diện tích",
        // ... các thuộc tính khác
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [...]
      }
    }
  ]
}
```

## Công nghệ sử dụng

- **React 18** - Framework frontend
- **Vite** - Build tool
- **Leaflet** - Thư viện bản đồ
- **React-Leaflet** - React wrapper cho Leaflet
- **GeoJSON** - Định dạng dữ liệu địa lý

## Tùy chỉnh

### Thay đổi style bản đồ

Chỉnh sửa `geoJsonStyle` trong `src/App.jsx`:

```javascript
const geoJsonStyle = {
  color: '#3388ff',
  weight: 2,
  opacity: 1,
  fillColor: '#3388ff',
  fillOpacity: 0.2
}
```

### Thay đổi tile layer

Thay đổi URL trong component `TileLayer`:

```javascript
<TileLayer
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  // Hoặc sử dụng tile khác như:
  // url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
/>
```

## License

MIT License