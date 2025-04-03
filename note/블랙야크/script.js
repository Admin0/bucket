const canvas = document.getElementById('블랙야크_canvas');
const p = document.getElementById('블랙야크_p');
const ctx = canvas.getContext('2d');

// Example Data (very simplified)
const mapData = [
    { x: 400, y: 100 },
    { x: 200, y: 400 },
    { x: 600, y: 400 },
    { x: 100, y: 250 },
    { x: 700, y: 250 }
];

const points = [

    { id: "가리산(홍천)", done: false, pos_0: { y: 37.873670, x: 127.960754 }, info: { peak: "정상", height: 1051 } },
    { id: "가리왕산", done: false, pos_0: { y: 37.135833, x: 128.935278 }, info: { peak: "정상", height: 1561 } },
    { id: "가야산(경상)", done: false, pos_0: { y: 35.822222, x: 128.105556 }, info: { peak: "우두봉", height: 1430 } },
    { id: "가야산(충남)", done: "2025", pos_0: { y: 36.710698, x: 126.612243 }, info: { peak: "정상", height: 678 } },
    { id: "가지산", done: false, pos_0: { y: 35.616667, x: 129.016667 }, info: { peak: "정상", height: 1241 } },
    { id: "감악산(파주)", done: false, pos_0: { y: 37.686944, x: 126.975833 }, info: { peak: "정상", height: 674 } }, 
    { id: "감악산(원주)", done: false, pos_0: { y: 37.233333, x: 128.316667 }, info: { peak: "원주/제천 정상석", height: 945 } },
    { id: "계룡산", done: "2025-03-30", pos_0: { y: 36.352042, x: 127.200328 }, info: { peak: "관음봉", height: 766 } },
    { id: "계방산", done: false, pos_0: { y: 35.334722, x: 127.621667 }, info: { peak: "정상", height: 1577 } },
    { id: "관악산", done: false, pos_0: { y: 37.445000, x: 126.975000 }, info: { peak: "정상", height: 629 } },
    { id: "광덕산", done: "2024", pos_0: { y: 36.694459, x: 127.034083 }, info: { peak: "정상", height: 699 } },
    { id: "구병산(보은)", done: false, pos_0: { y: 36.483333, x: 127.816667 }, info: { peak: "정상", height: 877 } },
    { id: "구봉산(진안)", done: false, pos_0: { y: 35.883333, x: 127.383333 }, info: { peak: "정상", height: 1002 } },
    { id: "금수산", done: false, pos_0: { y: 36.983333, x: 128.383333 }, info: { peak: "정상", height: 1016 } },
    { id: "금오산(구미)", done: false, pos_0: { y: 36.633333, x: 128.316667 }, info: { peak: "현월봉", height: 977 } },
    { id: "금정산", done: false, pos_0: { y: 35.133333, x: 129.066667 }, info: { peak: "고당봉", height: 801 } },

    { id: "남산(경주)", done: false, pos_0: { y: 35.816667, x: 129.216667 }, info: { peak: "금오봉", height: 468 } },
    { id: "내변산(변산)", done: false, pos_0: { y: 35.616667, x: 126.583333 }, info: { peak: "의상봉", height: 424 } },
    { id: "내연산", done: false, pos_0: { y: 36.016667, x: 129.383333 }, info: { peak: "삼지봉", height: 711 } },
    { id: "내장산", done: "2025", pos_0: { y: 35.478583, x: 126.888914 }, info: { peak: "신선봉", height: 763 } },

    { id: "달마산", done: false, pos_0: { y: 34.916667, x: 127.316667 }, info: { peak: "정상", height: 489 } },
    { id: "대둔산", done: false, pos_0: { y: 36.116667, x: 127.316667 }, info: { peak: "마천대", height: 878 } },
    { id: "대야산", done: false, pos_0: { y: 36.316667, x: 129.116667 }, info: { peak: "정상", height: 930 } },
    { id: "덕룡산", done: false, pos_0: { y: 34.683333, x: 126.916667 }, info: { peak: "서봉", height: 432 } },
    { id: "덕유산", done: false, pos_0: { y: 35.866667, x: 127.733333 }, info: { peak: "향적봉", height: 1614 } },
    { id: "덕항산", done: false, pos_0: { y: 37.316667, x: 128.666667 }, info: { peak: "정상", height: 1073 } },
    { id: "도락산", done: false, pos_0: { y: 36.883333, x: 128.383333 }, info: { peak: "정상", height: 964 } },
    { id: "도봉산", done: false, pos_0: { y: 37.698611, x: 127.015833 }, info: { peak: "신선대", height: 740 } },
    { id: "두륜산", done: false, pos_0: { y: 34.766667, x: 126.616667 }, info: { peak: "가련봉", height: 630 } },
    { id: "두타산", done: false, pos_0: { y: 37.233333, x: 128.316667 }, info: { peak: "정상", height: 1353 } },

    { id: "마니산", done: false, pos_0: { y: 37.633333, x: 126.416667 }, info: { peak: "정상", height: 472 } },
    { id: "마이산(진안)", done: false, pos_0: { y: 35.766667, x: 127.383333 }, info: { peak: "비룡대", height: 686 } },
    { id: "명지산", done: false, pos_0: { y: 37.416667, x: 127.316667 }, info: { peak: "정상", height: 1267 } },
    { id: "모악산", done: false, pos_0: { y: 35.733333, x: 127.116667 }, info: { peak: "정상", height: 793 } },
    { id: "무등산", done: false, pos_0: { y: 35.133333, x: 126.983333 }, info: { peak: "서석대", height: 1278 } },
    { id: "민주지산", done: false, pos_0: { y: 36.216667, x: 127.533333 }, info: { peak: "정상", height: 1247 } },

    { id: "방장산", done: false, pos_0: { y: 35.383333, x: 126.533333 }, info: { peak: "정상", height: 743 } },
    { id: "방태산", done: false, pos_0: { y: 37.266667, x: 128.316667 }, info: { peak: "정상", height: 1444 } },
    { id: "백덕산", done: false, pos_0: { y: 37.166667, x: 128.666667 }, info: { peak: "정상", height: 1350 } },
    { id: "백암산", done: false, pos_0: { y: 35.383333, x: 126.783333 }, info: { peak: "상왕봉", height: 741 } },
    { id: "백운산(광양)", done: false, pos_0: { y: 35.083333, x: 127.616667 }, info: { peak: "정상", height: 1218 } },
    { id: "백운산(동강)", done: false, pos_0: { y: 37.316667, x: 128.316667 }, info: { peak: "정상", height: 883 } },
    { id: "북한산", done: false, pos_0: { y: 37.683333, x: 127.016667 }, info: { peak: "백운대", height: 837 } },
    { id: "비슬산", done: false, pos_0: { y: 35.716667, x: 128.516667 }, info: { peak: "천왕봉", height: 1084 } },
    { id: "삼악산", done: false, pos_0: { y: 37.816667, x: 127.666667 }, info: { peak: "용화봉", height: 654 } },
    { id: "서대산", done: false, pos_0: { y: 36.316667, x: 126.716667 }, info: { peak: "정상", height: 904 } },
    { id: "선운산", done: false, pos_0: { y: 35.483333, x: 126.583333 }, info: { peak: "정상", height: 336 } },
    { id: "설악산", done: false, pos_0: { y: 38.116667, x: 128.366667 }, info: { peak: "한계령", height: 1000 } },
    { id: "소백산", done: false, pos_0: { y: 36.966667, x: 128.483333 }, info: { peak: "비로봉", height: 1439 } },
    { id: "소요산", done: false, pos_0: { y: 37.933333, x: 127.166667 }, info: { peak: "의상대", height: 587 } },
    { id: "속리산", done: false, pos_0: { y: 36.516667, x: 127.833333 }, info: { peak: "천황봉", height: 1058 } },
    { id: "수락산", done: false, pos_0: { y: 37.683333, x: 127.083333 }, info: { peak: "주봉", height: 637 } },

    { id: "오서산(보령)", done: "2024", pos_0: { y: 36.458836, x: 126.659558 }, info: { peak: "정상", height: 791 } },
    { id: "용봉산(홍성)", done: "2025", pos_0: { y: 36.645551, x: 126.649078 }, info: { peak: "정상", height: 381 } },
    { id: "월악산", done: "2024", pos_0: { y: 36.886018, x: 128.105955 }, info: { peak: "영봉", height: 1097 } },
    { id: "연인산", done: false, pos_0: { y: 37.916667, x: 127.483333 }, info: { peak: "노인봉", height: 1068 } },
    { id: "연화산", done: false, pos_0: { y: 35.383333, x: 128.316667 }, info: { peak: "정상", height: 758 } },
    { id: "오대산", done: false, pos_0: { y: 37.783333, x: 128.566667 }, info: { peak: "비로봉", height: 1563 } },
    { id: "오봉산(춘천)", done: false, pos_0: { y: 37.916667, x: 127.816667 }, info: { peak: "정상", height: 774 } },
    { id: "용문산(양평)", done: false, pos_0: { y: 37.533333, x: 127.583333 }, info: { peak: "가섭봉", height: 1157 } },
    { id: "용화산", done: false, pos_0: { y: 37.916667, x: 128.666667 }, info: { peak: "정상", height: 878 } },
    { id: "운문산", done: false, pos_0: { y: 35.666667, x: 128.966667 }, info: { peak: "정상", height: 1188 } },
    { id: "운악산", done: false, pos_0: { y: 37.883333, x: 127.316667 }, info: { peak: "서봉", height: 936 } },
    { id: "월출산", done: false, pos_0: { y: 34.766667, x: 126.783333 }, info: { peak: "천황봉", height: 809 } },
    { id: "웅석봉", done: false, pos_0: { y: 35.383333, x: 128.083333 }, info: { peak: "정상", height: 1147 } },
    { id: "유명산", done: false, pos_0: { y: 37.566667, x: 127.483333 }, info: { peak: "정상", height: 862 } },
    { id: "응봉산(울진)", done: false, pos_0: { y: 36.983333, x: 129.083333 }, info: { peak: "정상", height: 999 } },

    { id: "재약산", done: false, pos_0: { y: 35.533333, x: 128.666667 }, info: { peak: "사자봉", height: 1108 } },
    { id: "조계산", done: false, pos_0: { y: 34.983333, x: 127.316667 }, info: { peak: "정상", height: 884 } },
    { id: "조령산", done: false, pos_0: { y: 36.816667, x: 128.316667 }, info: { peak: "정상", height: 1027 } },
    { id: "주왕산", done: false, pos_0: { y: 36.383333, x: 129.166667 }, info: { peak: "주봉", height: 721 } },
    { id: "주흘산", done: false, pos_0: { y: 36.816667, x: 128.083333 }, info: { peak: "정상", height: 1108 } },
    { id: "지리산", done: false, pos_0: { y: 35.333333, x: 127.733333 }, info: { peak: "천왕봉", height: 1917 } },

    { id: "천관산", done: false, pos_0: { y: 34.916667, x: 126.866667 }, info: { peak: "정상", height: 723 } },
    { id: "천마산", done: false, pos_0: { y: 37.666667, x: 127.283333 }, info: { peak: "정상", height: 812 } },
    { id: "천주산", done: false, pos_0: { y: 35.383333, x: 128.666667 }, info: { peak: "정상", height: 638 } },
    { id: "청계산", done: false, pos_0: { y: 37.433333, x: 127.050000 }, info: { peak: "매봉", height: 582 } },
    { id: "청량산", done: false, pos_0: { y: 36.416667, x: 129.083333 }, info: { peak: "정상", height: 870 } },
    { id: "추월산", done: false, pos_0: { y: 35.233333, x: 127.016667 }, info: { peak: "정상", height: 731 } },
    { id: "치악산", done: "2024", pos_0: { y: 37.365217, x: 128.055605 }, info: { peak: "비로봉", height: 1288 } },
    { id: "칠갑산(청양)", done: "2025", pos_0: { y: 36.414400, x: 126.884460 }, info: { peak: "정상", height: 561 } },

    { id: "태백산", done: false, pos_0: { y: 37.100000, x: 128.916667 }, info: { peak: "정상", height: 1567 } },
    { id: "태화산", done: false, pos_0: { y: 37.733333, x: 128.316667 }, info: { peak: "정상", height: 1027 } },
    { id: "팔공산(경북)", done: false, pos_0: { y: 36.016667, x: 128.633333 }, info: { peak: "비로봉", height: 1193 } },
    { id: "팔공산(전북)", done: false, pos_0: { y: 35.983333, x: 127.316667 }, info: { peak: "정상", height: 1151 } },
    { id: "팔봉산(홍천)", done: false, pos_0: { y: 37.666667, x: 127.916667 }, info: { peak: "2봉", height: 327 } },
    { id: "팔영산", done: false, pos_0: { y: 34.666667, x: 126.316667 }, info: { peak: "정상", height: 608 } },

    { id: "함백산", done: false, pos_0: { y: 37.083333, x: 128.916667 }, info: { peak: "정상", height: 1573 } },
    { id: "한라산", done: "2024-12-28", pos_0: { y: 33.389290, x: 126.537511 }, info: { peak: "백록담", height: 1950 } },
    { id: "형제봉", done: false, pos_0: { y: 34.916667, x: 127.666667 }, info: { peak: "정상", height: 532 } },
    { id: "황매산", done: false, pos_0: { y: 35.483333, x: 127.983333 }, info: { peak: "정상", height: 1113 } },
    { id: "황악산", done: false, pos_0: { y: 36.316667, x: 129.316667 }, info: { peak: "정상", height: 1111 } },
    { id: "화악산", done: false, pos_0: { y: 37.983333, x: 127.483333 }, info: { peak: "정상", height: 1468 } },
    { id: "희양산", done: false, pos_0: { y: 36.666667, x: 129.316667 }, info: { peak: "정상", height: 998 } },
    { id: "흥령산", done: false, pos_0: { y: 36.316667, x: 129.083333 }, info: { peak: "정상", height: 1032 } }

];

const MAP_MARGIN = 0;
const LATITUDE_MAX = 38.5;
const LATITUDE_MIN = 35;
const LONGITUDE_MAX = 129;
const LONGITUDE_MIN = 125;


let hoveredPoint = null;

function drawPentagon() {
    ctx.beginPath();
    ctx.moveTo(mapData[0].x, mapData[0].y);

    for (let i = 1; i < mapData.length; i++) {
        ctx.lineTo(mapData[i].x, mapData[i].y);
    }

    ctx.closePath();//
    ctx.strokeStyle = 'black'; // Set outline color to black
    ctx.stroke();
}

function drawCircle(point) {
    ctx.beginPath();
    ctx.arc(point.pos.x, point.pos.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = point.done ? "#f00" : "#000";
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawPentagon();
    for (const point of points) {
        if (point.pos == undefined) { //처음 1회만 실행
            point.pos = {
                x: (point.pos_0.x - LONGITUDE_MIN) * 100,
                y: (LATITUDE_MAX - point.pos_0.y) * 100
            };
        }

        drawCircle(point);
    }
    if (hoveredPoint) {
        // const textWidth = ctx.measureText(hoveredPoint.id).width + 10;
        // ctx.fillStyle = '#000';
        // ctx.fillRect(hoveredPoint.pos.x + 5, hoveredPoint.pos.y - 35, textWidth + 5, 30);
        // ctx.fillStyle = "#fff";
        ctx.fillText(hoveredPoint.id, hoveredPoint.pos.x + 10, hoveredPoint.pos.y - 22);
        ctx.fillText(`${hoveredPoint.info.peak} | ${hoveredPoint.info.height.toLocaleString()} m`, hoveredPoint.pos.x + 10, hoveredPoint.pos.y - 5);
        if (hoveredPoint.done != false) {
            ctx.fillText(hoveredPoint.done, hoveredPoint.pos.x + 10, hoveredPoint.pos.y + 15);
        }
    }
}

function isMouseInPoint(point, mouseX, mouseY) {
    const distance = Math.sqrt(Math.pow(mouseX - point.pos.x, 2) + Math.pow(mouseY - point.pos.y, 2));
    return distance <= 8;
}

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    hoveredPoint = points.find(point => isMouseInPoint(point, mouseX, mouseY));
    draw();
});

draw();

// 달성률 계산하디
let prog = 0;
points.forEach(element => {
    if (element.done != false) { prog++; }
});
p.innerText = `완료: ${prog}/100`