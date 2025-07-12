# Đường dẫn thư mục chứa file JSON
$folderPath = ".\public\sample-data"

# Lấy danh sách file .json
$files = Get-ChildItem -Path $folderPath -Filter *.json

# Hàm viết hoa từng từ trong chuỗi
function Format-Title {
    param ($text)
    $words = $text -split '\s+'
    $formatted = @()
    foreach ($word in $words) {
        if ($word.Length -gt 0) {
            $first = $word.Substring(0,1).ToUpper()
            $rest = ""
            if ($word.Length -gt 1) {
                $rest = $word.Substring(1).ToLower()
            }
            $formatted += "$first$rest"
        }
    }
    return ($formatted -join " ")
}

# Danh sách kết quả
$result = @()

foreach ($file in $files) {
    $fileName = $file.BaseName
    $filePath = "/sample-data/$($file.Name)"

    # Tách tên file thành 2 phần nếu có dấu "_"
    $parts = $fileName -split '_', 2
    if ($parts.Count -eq 2) {
        $province = Format-Title $parts[0]
        $commune  = Format-Title $parts[1]
        $name = "$province - $commune"
    } else {
        $name = Format-Title $fileName
    }

    # Đọc nội dung file JSON để lấy trường sat_nhap_tu
    $relation = ""
    try {
        $jsonContent = Get-Content -Path $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($jsonContent.features -and $jsonContent.features.Count -gt 0) {
            $firstFeature = $jsonContent.features[0]
            if ($firstFeature.properties -and $firstFeature.properties.sat_nhap_tu) {
                $relation = $firstFeature.properties.sat_nhap_tu
            }
        }
    }
    catch {
        Write-Warning "Không thể đọc file $($file.Name): $($_.Exception.Message)"
    }

    $entry = @{
        name = $name
        path = $filePath
        relation = $relation
    }

    $result += $entry
}

# Xuất ra file JSON
$outputPath = "sampleFiles.json"
$result | ConvertTo-Json -Depth 3 | Out-File -Encoding utf8 $outputPath

Write-Host "✅ Đã tạo file $outputPath với $($result.Count) mục." -ForegroundColor Green
