/**
 * GPX 파일을 백그라운드에서 파싱하는 웹 워커
 */

self.onmessage = async (e) => {
  const gpxFiles = e.data;
  const totalFiles = gpxFiles.length;

  for (let i = 0; i < totalFiles; i++) {
      const gpxFile = gpxFiles[i];

      try {
          const response = await fetch(gpxFile);
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const gpxText = await response.text();

          // GPX(XML) 텍스트에서 좌표를 추출하는 간단한 파서
          const coords = (gpxText.match(/lat="([\d\.]+)"\s+lon="([\d\.]+)"/g) || []).map(trkpt => {
              const match = /lat="([\d\.]+)"\s+lon="([\d\.]+)"/.exec(trkpt);
              return [parseFloat(match[1]), parseFloat(match[2])];
          });
          
          if (coords.length > 0) {
               // 성공적으로 파싱된 좌표 데이터를 메인 스레드로 전송
              self.postMessage({
                  type: 'gpx-data',
                  payload: coords,
                  index: i
              });
          } else {
               // 좌표가 없는 경우 에러로 처리
               throw new Error('No coordinates found in GPX file.');
          }

      } catch (error) {
          // 파일 로드 또는 파싱 실패 시 에러 정보를 메인 스레드로 전송
          console.error(`Worker error for ${gpxFile}:`, error);
          self.postMessage({
              type: 'error',
              payload: gpxFile,
              index: i
          });
      }
  }
};
