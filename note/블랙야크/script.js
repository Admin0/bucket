const note = document.getElementById("블랙야크");
const canvas = document.getElementById("블랙야크_canvas");
const p = document.getElementById("블랙야크_p");

const points = [
    // { id: "기준", done: '1', pos_0: { y: 38.615209, x: 128.358513 }, info: { peak: "대한민국 남반부 지역 최북단비", height: 0 } },
    // { id: "기준", done: '1', pos_0: { y: 37.506167, x: 130.865646 }, info: { peak: "성인봉", height: 0 } },
    // { id: "기준", done: '1', pos_0: { y: 36.078592, x: 129.569608 }, info: { peak: "호미곶", height: 0 } },
    // { id: "기준", done: '1', pos_0: { y: 37.823880, x: 124.699525 }, info: { peak: "대청도", height: 0 } },
    // { id: "기준", done: '1', pos_0: { y: 36.078592, x: 129.569608 }, info: { peak: "호미곶", height: 0 } },

    { id: "가리산(홍천)", done: false, pos_0: { y: 37.871353, x: 127.956485 }, info: { peak: "정상", height: 1051 } },
    { id: "가리왕산", done: false, pos_0: { y: 37.460995, x: 128.56275 }, info: { peak: "정상", height: 1561 } },
    { id: "가야산(경상)", done: false, pos_0: { y: 35.822563, x: 128.122518 }, info: { peak: "우두봉", height: 1430 } },
    { id: "가야산(충남)", done: "2025.02.02.", pos_0: { y: 36.7066361111, x: 126.6083527778 }, info: { peak: "정상", height: 678.2 } },
    { id: "가지산", done: false, pos_0: { y: 35.619875, x: 129.003523 }, info: { peak: "정상", height: 1240 } },

    { id: "감악산(원주)", done: false, pos_0: { y: 37.233333, x: 128.316667 }, info: { peak: "원주/제천 정상석", height: 675 } },
    { id: "감악산(파주)", done: false, pos_0: { y: 37.941082, x: 126.969989 }, info: { peak: "정상", height: 675 } },
    { id: "계룡산", done: "2025.03.30.", pos_0: { y: 36.361424, x: 127.210292 }, info: { peak: "관음봉", height: 845 } },
    { id: "계방산", done: false, pos_0: { y: 37.728268, x: 128.46543 }, info: { peak: "정상", height: 1577 } },
    { id: "관악산", done: false, pos_0: { y: 37.445044, x: 126.964223 }, info: { peak: "정상", height: 629 } },

    { id: "광덕산", done: "2024.10.27.", pos_0: { y: 36.687795, x: 127.027906 }, info: { peak: "정상", height: 699.3 } },
    { id: "구병산(보은)", done: false, pos_0: { y: 36.46989438, x: 127.8625301 }, info: { peak: "정상", height: 877 } },
    { id: "구봉산(진안)", done: false, pos_0: { y: 35.923157, x: 127.416559 }, info: { peak: "정상", height: 1002 } },
    { id: "금수산", done: false, pos_0: { y: 36.985009, x: 128.256761 }, info: { peak: "정상", height: 1016 } },
    { id: "금오산(구미)", done: false, pos_0: { y: 36.092833, x: 128.300054 }, info: { peak: "현월봉", height: 977 } },

    { id: "금정산", done: false, pos_0: { y: 35.280118, x: 129.050542 }, info: { peak: "고당봉", height: 802 } },
    { id: "남산(경주)", done: false, pos_0: { y: 35.767661, x: 129.225369 }, info: { peak: "금오봉", height: 468 } },
    { id: "내변산(변산)", done: false, pos_0: { y: 35.616667, x: 126.583333 }, info: { peak: "관음봉", height: 424 } },
    { id: "내연산", done: false, pos_0: { y: 36.263301, x: 129.258523 }, info: { peak: "삼지봉", height: 710 } },
    { id: "내장산", done: "2025.01.25.", pos_0: { y: 35.478299, x: 126.888994 }, info: { peak: "신선봉", height: 763 } },

    { id: "달마산", done: false, pos_0: { y: 34.382545, x: 126.585159 }, info: { peak: "정상", height: 498.8 } },
    { id: "대둔산", done: false, pos_0: { y: 36.126556, x: 127.323071 }, info: { peak: "마천대", height: 878 } },
    { id: "대야산", done: false, pos_0: { y: 36.649026, x: 127.96407 }, info: { peak: "정상", height: 931 } },
    { id: "덕룡산", done: false, pos_0: { y: 34.5379361111, x: 126.6983111111 }, info: { peak: "서봉", height: 432.8 } },
    { id: "덕유산", done: false, pos_0: { y: 35.85990274, x: 127.746381 }, info: { peak: "향적봉", height: 1614 } },

    { id: "덕항산", done: false, pos_0: { y: 37.318296, x: 129.001612 }, info: { peak: "정상", height: 1071 } },
    { id: "도락산", done: false, pos_0: { y: 36.856368, x: 128.311091 }, info: { peak: "정상", height: 964 } },
    { id: "도봉산", done: false, pos_0: { y: 37.69883, x: 127.01547 }, info: { peak: "신선대", height: 740 } },
    { id: "동악산(곡성)", done: false, pos_0: { y: 35.26132431, x: 127.2406651 }, info: { peak: "시루봉", height: 737.1 } },
    { id: "두륜산", done: false, pos_0: { y: 34.471848, x: 126.637535 }, info: { peak: "가련봉", height: 703 } },

    { id: "두타산", done: false, pos_0: { y: 37.43445721, x: 128.9734669 }, info: { peak: "정상", height: 1353 } },
    { id: "마니산(강화도)", done: false, pos_0: { y: 37.612745, x: 126.436401 }, info: { peak: "정상", height: 469 } },
    { id: "마이산(진안)", done: false, pos_0: { y: 35.760484, x: 127.411233 }, info: { peak: "비룡대", height: 686 } },
    { id: "명지산", done: false, pos_0: { y: 37.94024567, x: 127.4325174 }, info: { peak: "정상", height: 1267 } },
    { id: "모악산", done: false, pos_0: { y: 35.728678, x: 127.084721 }, info: { peak: "정상", height: 794 } },

    { id: "무등산", done: false, pos_0: { y: 35.121098, x: 127.00283 }, info: { peak: "서석대", height: 1187 } },
    { id: "민주지산", done: false, pos_0: { y: 36.03976612, x: 127.849333 }, info: { peak: "정상", height: 1242 } },
    { id: "방장산", done: false, pos_0: { y: 35.455991, x: 126.75431 }, info: { peak: "정상", height: 743 } },
    { id: "방태산", done: false, pos_0: { y: 37.888141, x: 128.390341 }, info: { peak: "정상", height: 1444 } },
    { id: "백덕산", done: false, pos_0: { y: 37.396072, x: 128.293787 }, info: { peak: "정상", height: 1350 } },

    { id: "백암산", done: false, pos_0: { y: 35.461171, x: 126.868349 }, info: { peak: "상왕봉", height: 741 } },
    { id: "백운산(광양)", done: false, pos_0: { y: 35.106243, x: 127.621757 }, info: { peak: "정상", height: 1218 } },
    { id: "백운산(동강)", done: false, pos_0: { y: 37.29869, x: 128.579145 }, info: { peak: "정상", height: 883 } },
    { id: "북한산", done: false, pos_0: { y: 37.658657, x: 126.978056 }, info: { peak: "백운대", height: 837 } },
    { id: "불갑산(영광)", done: false, pos_0: { y: 35.1908333333, x: 126.5650472222 }, info: { peak: "연실봉", height: 517.7 } },

    { id: "비슬산", done: false, pos_0: { y: 35.71526, x: 128.523981 }, info: { peak: "천왕봉", height: 1084 } },
    { id: "삼악산", done: false, pos_0: { y: 37.920351, x: 127.612711 }, info: { peak: "용화봉", height: 654 } },
    { id: "선운산", done: false, pos_0: { y: 35.517657, x: 126.577097 }, info: { peak: "정상", height: 336 } },
    { id: "설악산", done: false, pos_0: { y: 38.119135, x: 128.46544 }, info: { peak: "한계령", height: 1708 } },
    { id: "소백산", done: false, pos_0: { y: 36.95786818, x: 128.4788661 }, info: { peak: "비로봉", height: 1439 } },

    { id: "소요산", done: false, pos_0: { y: 37.915914, x: 127.132813 }, info: { peak: "의상대", height: 587 } },
    { id: "속리산", done: false, pos_0: { y: 36.543181, x: 127.870846 }, info: { peak: "천황봉", height: 1057 } },
    { id: "수락산", done: false, pos_0: { y: 37.697923, x: 127.081283 }, info: { peak: "주봉", height: 640.6 } },
    { id: "신불산", done: false, pos_0: { y: 35.53933, x: 129.053953 }, info: { peak: "정상", height: 1209 } },
    { id: "연인산", done: false, pos_0: { y: 37.898788, x: 127.41435 }, info: { peak: "정상", height: 1068 } },

    { id: "오대산", done: false, pos_0: { y: 37.794601, x: 128.543605 }, info: { peak: "노인봉", height: 1563 } },
    { id: "오대산", done: false, pos_0: { y: 37.794601, x: 128.543605 }, info: { peak: "비로봉", height: 1563 } },
    { id: "오봉산", done: false, pos_0: { y: 38.00002881, x: 127.807132 }, info: { peak: "정상", height: 779 } },
    { id: "오서산", done: "2024.11.03.", pos_0: { y: 36.460056, x: 126.658811 }, info: { peak: "정상", height: 789.9 } },
    { id: "용문산", done: false, pos_0: { y: 37.561979, x: 127.549637 }, info: { peak: "가섭봉", height: 1157 } },

    { id: "용봉산", done: "2025.01.19.", pos_0: { y: 36.6436555556, x: 126.6492388889 }, info: { peak: "정상", height: 381 } },
    { id: "용화산", done: false, pos_0: { y: 38.0380386, x: 127.7479119 }, info: { peak: "정상", height: 878 } },
    { id: "운악산", done: false, pos_0: { y: 37.878718, x: 127.322893 }, info: { peak: "서봉", height: 936 } },
    { id: "운장산", done: false, pos_0: { y: 35.915653, x: 127.363019 }, info: { peak: "운장대", height: 1126 } },
    { id: "월악산", done: "2025.01.12.", pos_0: { y: 36.886045, x: 128.105844 }, info: { peak: "영봉", height: 1094 } },

    { id: "월출산", done: false, pos_0: { y: 34.766997, x: 126.704294 }, info: { peak: "천황봉", height: 809 } },
    { id: "유명산", done: false, pos_0: { y: 37.575285, x: 127.48662 }, info: { peak: "정상", height: 862 } },
    { id: "응봉산", done: false, pos_0: { y: 37.076597, x: 129.230461 }, info: { peak: "정상", height: 999 } },
    { id: "장안산", done: false, pos_0: { y: 35.625733, x: 127.593443 }, info: { peak: "정상", height: 1237 } },
    { id: "재약산", done: false, pos_0: { y: 35.557707, x: 128.97228 }, info: { peak: "수미봉", height: 1189 } },

    { id: "조계산", done: false, pos_0: { y: 35.001211, x: 127.313555 }, info: { peak: "정상", height: 884 } },
    { id: "조령산", done: false, pos_0: { y: 36.816667, x: 128.316667 }, info: { peak: "정상", height: 1027 } },
    { id: "주왕산", done: false, pos_0: { y: 36.389337, x: 129.162417 }, info: { peak: "주봉", height: 721 } },
    { id: "주흘산", done: false, pos_0: { y: 36.78844, x: 128.101271 }, info: { peak: "정상", height: 1106 } },
    { id: "지리산", done: false, pos_0: { y: 35.336971, x: 127.730474 }, info: { peak: "천왕봉", height: 1915 } },

    { id: "지리산(통영)", done: false, pos_0: { y: 34.851294, x: 128.198261 }, info: { peak: "바래봉", height: 398 } },
    { id: "지리산(통영)", done: false, pos_0: { y: 34.851294, x: 128.198261 }, info: { peak: "반야봉", height: 398 } },
    { id: "천관산", done: false, pos_0: { y: 34.535402, x: 126.911238 }, info: { peak: "연대봉", height: 723 } },
    { id: "천마산", done: false, pos_0: { y: 37.680364, x: 127.273397 }, info: { peak: "정상", height: 812 } },
    { id: "천성산", done: false, pos_0: { y: 35.378184, x: 128.950771 }, info: { peak: "비로봉", height: 922 } },

    { id: "천태산", done: false, pos_0: { y: 36.159122, x: 127.600005 }, info: { peak: "정상", height: 715 } },
    { id: "청계산", done: false, pos_0: { y: 37.433333, x: 127.05 }, info: { peak: "매봉", height: 582 } },
    { id: "청량산", done: false, pos_0: { y: 36.794122, x: 128.907994 }, info: { peak: "정상", height: 870 } },
    { id: "청화산", done: false, pos_0: { y: 36.416667, x: 129.083333 }, info: { peak: "정상", height: 970 } },
    { id: "축령산", done: false, pos_0: { y: 37.752705, x: 127.333923 }, info: { peak: "정상", height: 879 } },

    { id: "치악산", done: "2024.12.22.", pos_0: { y: 37.365077, x: 128.055568 }, info: { peak: "비로봉", height: 1288 } },
    { id: "칠갑산", done: "2025.02.23.", pos_0: { y: 36.413006, x: 126.884905 }, info: { peak: "정상", height: 561 } },
    { id: "칠보산", done: false, pos_0: { y: 36.4144, x: 126.88446 }, info: { peak: "정상", height: 561 } },
    { id: "태백산", done: false, pos_0: { y: 37.096337, x: 128.916532 }, info: { peak: "정상", height: 1567 } },
    { id: "태화산", done: false, pos_0: { y: 37.117601, x: 128.486345 }, info: { peak: "정상", height: 1027 } },

    { id: "팔공산", done: false, pos_0: { y: 36.016137, x: 128.694901 }, info: { peak: "비로봉", height: 1193 } },
    { id: "팔봉산", done: false, pos_0: { y: 37.696514, x: 127.695577 }, info: { peak: "2봉", height: 302 } },
    { id: "팔영산", done: false, pos_0: { y: 34.624358, x: 127.430924 }, info: { peak: "정상", height: 609 } },
    { id: "한라산", done: "2024.12.29.", pos_0: { y: 33.361578, x: 126.535756 }, info: { peak: "백록담", height: 1950 } },
    { id: "함백산", done: false, pos_0: { y: 34.916667, x: 127.666667 }, info: { peak: "정상", height: 532 } },

    { id: "화악산", done: false, pos_0: { y: 37.988856, x: 127.497655 }, info: { peak: "정상", height: 1468 } },
    { id: "화왕산", done: false, pos_0: { y: 35.547141, x: 128.531682 }, info: { peak: "정상", height: 757 } },
    { id: "황매산", done: false, pos_0: { y: 35.495206, x: 127.974455 }, info: { peak: "정상", height: 1108 } },
    { id: "황석산", done: false, pos_0: { y: 35.730696, x: 127.761191 }, info: { peak: "정상", height: 1190 } },
    { id: "황악산", done: false, pos_0: { y: 36.117593, x: 127.966881 }, info: { peak: "정상", height: 1111 } },
];

const MAP_MARGIN = 0;
const LATITUDE_MAX = 39;
const LATITUDE_MIN = 33;
const LONGITUDE_MAX = 132;
const LONGITUDE_MIN = 124;

let hoveredPoint = null;

function pin(point) {
    let p = document.createElement("div");
    canvas.appendChild(p);
    p.setAttribute("style", `left:${point.pos.x}%; top:${point.pos.y}%;`);

    const title_0 = `${point.id} | ${point.info.peak} | ${point.info.height} m`;
    p.setAttribute("title", point.done ? title_0 + `<br/>${point.done}` : title_0);

    p.classList.add("point");
    if (point.done != false) {
        p.classList.add("done");
    }
}

function draw() {
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // drawPentagon();
    for (const point of points) {
        if (point.pos == undefined) {
            //처음 1회만 실행
            point.pos = {
                x: ((point.pos_0.x - LONGITUDE_MIN) / (LONGITUDE_MAX - LONGITUDE_MIN)) * 100,
                y: ((LATITUDE_MAX - point.pos_0.y) / (LATITUDE_MAX - LATITUDE_MIN)) * 92,
            };
        }

        pin(point);
    }
}

draw();

// 사이즈 맞추기
note.addEventListener("mousemove", (event) => {
    // const rect = canvas.getBoundingClientRect();
    // const mouseX = event.clientX - rect.left;
    // const mouseY = event.clientY - rect.top;
    canvas.style.height = "calc(" + canvas.offsetWidth + "px - .5em)";
});


// 달성률 계산하기
let prog = 0;
points.forEach((element) => {
    if (element.done != false) {
        prog++;
    }
});
p.innerText = `완료: ${prog}/100`;
