self.onmessage = function (e) {
    const { gpxText, path } = e.data;
    const coordinates = gpxToCoordinates(gpxText);
    const encodedCoordinates = encodeCoordinates(coordinates);
    self.postMessage({ encodedCoordinates, path });
};

function gpxToCoordinates(gpxText) {
    const coordinates = [];
    const regex = /<trkpt\s+lat="([^\"]+)"\s+lon="([^\"]+)"/g;
    let match;

    while ((match = regex.exec(gpxText)) !== null) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
            coordinates.push([lon, lat]);
        }
    }
    return coordinates;
}

function encodeCoordinates(coordinates) {
    if (!coordinates || coordinates.length === 0) {
        return "";
    }

    let encoded = "";
    let lastLat = 0;
    let lastLon = 0;

    function encodeValue(value) {
        value = value < 0 ? ~(value << 1) : value << 1;
        while (value >= 0x20) {
            encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
            value >>= 5;
        }
        encoded += String.fromCharCode(value + 63);
    }

    for (let i = 0; i < coordinates.length; i++) {
        const lat = Math.round(coordinates[i][1] * 1e6); // 위도를 소수점 6자리로 반올림 (garmin 유효숫자 28자리, samsung 유효숫자 9자리)
        const lon = Math.round(coordinates[i][0] * 1e6); // 경도를 소수점 6자리로 반올림

        const dLat = lat - lastLat;
        const dLon = lon - lastLon;

        encodeValue(dLat);
        encodeValue(dLon);

        lastLat = lat;
        lastLon = lon;
    }

    return encoded;
}
