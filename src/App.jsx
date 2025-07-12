import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Dropdown } from 'primereact/dropdown'
import 'primereact/resources/themes/lara-light-cyan/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

function App() {
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [loading, setLoading] = useState(false)
  const [availableFiles, setAvailableFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const mapRef = useRef(null)


  useEffect(() => {
    // Đọc danh sách file từ sampleFiles.json
    const loadSampleFiles = async () => {
      try {
        const response = await fetch('/sampleFiles.json')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const files = await response.json()
        setAvailableFiles(files)
      } catch (error) {
        console.error('Lỗi khi tải danh sách file:', error)
        // Fallback về danh sách mặc định nếu không tải được
        const fallbackFiles = [
          {
            name: 'Hưng Yên - Thư Vũ',
            path: '/sample-data/hung-yen-thu-vu.json'
          },
          {
            name: 'Hưng Yên - Vũ Thư',
            path: '/sample-data/hung-yen-vu-thu.json'
          },
          {
            name: 'Hưng Yên - Vũ Tiên',
            path: '/sample-data/hung-yen-vu-tien.json'
          },
          {
            name: 'Tân Quang - Tuyên Quang',
            path: '/sample-data/tỉnh Tuyên Quang_Tân Quang.json'
          }
        ]
        setAvailableFiles(fallbackFiles)
        if (fallbackFiles.length > 0) {
          setSelectedFile(fallbackFiles[0].path)
          loadGeoJsonFile(fallbackFiles[0].path)
        }
      }
    }

    loadSampleFiles()
  }, [])

  const loadGeoJsonFile = async (filePath) => {
    setLoading(true)
    try {
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setGeoJsonData(data)
      setSelectedFeature(null)
      
      // Auto focus and zoom to the GeoJSON bounds with smooth animation
      setTimeout(() => {
        if (data && data.features && data.features.length > 0 && mapRef.current) {
          const geoJsonLayer = L.geoJSON(data)
          const bounds = geoJsonLayer.getBounds()
          if (bounds.isValid()) {
            mapRef.current.flyToBounds(bounds, {
              padding: [20, 20],
              maxZoom: 16,
              duration: 2.0
            })
          }
        }
      }, 100)
    } catch (error) {
      console.error('Lỗi khi tải file GeoJSON:', error)
      // Tạo dữ liệu mẫu nếu không tải được file
      const sampleData = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Khu vực mẫu",
              population: "10,000",
              area: "50 km²"
            },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [106.0, 20.0],
                [106.1, 20.0],
                [106.1, 20.1],
                [106.0, 20.1],
                [106.0, 20.0]
              ]]
            }
          }
        ]
      }
      setGeoJsonData(sampleData)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const filePath = e.value
    setSelectedFile(filePath)
    if (filePath) {
      loadGeoJsonFile(filePath)
    }
  }

  const handleFeatureClick = (feature, layer) => {
    setSelectedFeature(feature.properties)
    const props = feature.properties
    const displayName = props.ten_chi_tiet || props.TEN_XA || props.name || 'Không có tên'
    const population = props.dan_so || props.DAN_SO || props.population || 'Không có dữ liệu'
    const area = props.dien_tich || props.DIEN_TICH || props.area || 'Không có dữ liệu'
    const density = props.MAT_DO ? `${props.MAT_DO} người/km²` : 'Không có dữ liệu'
    
    layer.bindPopup(`
      <div>
        <h4>${displayName}</h4>
        <p><strong>Dân số:</strong> ${typeof population === 'number' ? population.toLocaleString() : population}</p>
        <p><strong>Diện tích:</strong> ${typeof area === 'number' ? `${area} km²` : area}</p>
        <p><strong>Mật độ:</strong> ${density}</p>
        ${props.maxa ? `<p><strong>Mã xã:</strong> ${props.maxa}</p>` : ''}
        ${props.trung_tam_hc ? `<p><strong>Trung tâm hành chính:</strong> ${props.trung_tam_hc}</p>` : ''}
        ${props.sat_nhap_tu ? `<p><strong>Sát nhập từ:</strong> ${props.sat_nhap_tu}</p>` : ''}
        ${props.TEN_HUYEN ? `<p><strong>Huyện:</strong> ${props.TEN_HUYEN}</p>` : ''}
        ${props.TEN_TINH ? `<p><strong>Tỉnh:</strong> ${props.TEN_TINH}</p>` : ''}
        ${props.CAP_XA ? `<p><strong>Cấp:</strong> ${props.CAP_XA}</p>` : ''}
        ${props.KHU_VUC ? `<p><strong>Khu vực:</strong> ${props.KHU_VUC}</p>` : ''}
      </div>
    `).openPopup()
  }

  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => handleFeatureClick(feature, layer),
      mouseover: (e) => {
        e.target.setStyle({
          weight: 3,
          color: '#666',
          fillOpacity: 0.7
        })
      },
      mouseout: (e) => {
        e.target.setStyle({
          weight: 2,
          color: '#3388ff',
          fillOpacity: 0.2
        })
      }
    })
  }

  const geoJsonStyle = {
    color: '#3388ff',
    weight: 2,
    opacity: 1,
    fillColor: '#3388ff',
    fillOpacity: 0.2
  }

  return (
    <div className="map-container">
      {loading && (
        <div className="loading">
          <p>Đang tải dữ liệu GeoJSON...</p>
        </div>
      )}
      
      <div className="controls">
        <label htmlFor="file-select">Tìm kiếm xã/phường:</label>
        <Dropdown 
          value={selectedFile}
          onChange={handleFileChange}
          options={availableFiles.map(file => ({ label: file.name, value: file.path, relation: file.relation }))}
          virtualScrollerOptions={{ itemSize: 38 }}
          placeholder="-- Chọn xã/phường --"
          className="w-full md:w-24rem"
          filter
          filterBy="label,relation"
          showClear
        />
      </div>

      {selectedFeature && window.innerWidth >= 768 && (
        <div className="info-panel">
          <h3>Thông tin khu vực</h3>
          <p><strong>Tên chi tiết:</strong> {selectedFeature.ten_chi_tiet || selectedFeature.TEN_XA || selectedFeature.name || 'Không có tên'}</p>
          <p><strong>Dân số:</strong> {typeof selectedFeature.dan_so === 'number' ? selectedFeature.dan_so.toLocaleString() : (selectedFeature.dan_so || selectedFeature.DAN_SO || selectedFeature.population || 'Không có dữ liệu')}</p>
          <p><strong>Diện tích:</strong> {typeof selectedFeature.dien_tich === 'number' ? `${selectedFeature.dien_tich} km²` : (selectedFeature.dien_tich || selectedFeature.DIEN_TICH || selectedFeature.area || 'Không có dữ liệu')}</p>
          <p><strong>Mật độ:</strong> {selectedFeature.MAT_DO ? `${selectedFeature.MAT_DO.toFixed(2)} người/km²` : 'Không có dữ liệu'}</p>
          {selectedFeature.maxa && <p><strong>Mã xã:</strong> {selectedFeature.maxa}</p>}
          {selectedFeature.trung_tam_hc && <p><strong>Trung tâm hành chính:</strong> {selectedFeature.trung_tam_hc}</p>}
          {selectedFeature.sat_nhap_tu && <p><strong>Sát nhập từ:</strong> {selectedFeature.sat_nhap_tu}</p>}
          {selectedFeature.matinhxa && <p><strong>Mã tỉnh xã:</strong> {selectedFeature.matinhxa}</p>}
          {selectedFeature.TEN_HUYEN && <p><strong>Huyện:</strong> {selectedFeature.TEN_HUYEN}</p>}
          {selectedFeature.TEN_TINH && <p><strong>Tỉnh:</strong> {selectedFeature.TEN_TINH}</p>}
          {selectedFeature.CAP_XA && <p><strong>Cấp:</strong> {selectedFeature.CAP_XA}</p>}
          {selectedFeature.KHU_VUC && <p><strong>Khu vực:</strong> {selectedFeature.KHU_VUC}</p>}
          {selectedFeature.MA_XA && <p><strong>Mã xã:</strong> {selectedFeature.MA_XA}</p>}
          {selectedFeature.MA_HUYEN && <p><strong>Mã huyện:</strong> {selectedFeature.MA_HUYEN}</p>}
          {selectedFeature.MA_TINH && <p><strong>Mã tỉnh:</strong> {selectedFeature.MA_TINH}</p>}
          {selectedFeature.OBJECTID && <p><strong>Object ID:</strong> {selectedFeature.OBJECTID}</p>}
        </div>
      )}

      <MapContainer
        center={[20.5, 106.0]}
        zoom={8}
        style={{ height: '100vh', width: '100%' }}
        ref={mapRef}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Cường Đoàn'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {geoJsonData && (
          <GeoJSON
            key={JSON.stringify(geoJsonData)}
            data={geoJsonData}
            style={geoJsonStyle}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  )
}

export default App
