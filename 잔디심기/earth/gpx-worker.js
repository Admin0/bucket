self.onmessage = function (e) {
  const { gpxText } = e.data;
  const coordinates = gpxToCoordinates(gpxText);
  self.postMessage({ coordinates });
};

function gpxToCoordinates(gpxText) {
  const coordinates = [];
  // DOMParser를 사용하지 않는 정규식 기반 파서
  const regex = /<trkpt\s+lat="([^"]+)"\s+lon="([^"]+)"/g;
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
