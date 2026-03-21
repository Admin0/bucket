const note = document.getElementById("블랙야크") != null ? document.getElementById("블랙야크") : document.getElementById("블랙야크_canvas");
const canvas = document.getElementById("블랙야크_canvas");
const p = document.getElementById("블랙야크_p");

const points = [
    // { no: 0, id: "기준", done: '1', pos_0: { y: 38.615209, x: 128.358513 }, info: { peak: "대한민국 남반부 지역 최북단비", height: 0 } },
    // { no: 0, id: "기준", done: '1', pos_0: { y: 37.506167, x: 130.865646 }, info: { peak: "성인봉", height: 0 } },
    // { no: 0, id: "기준", done: '1', pos_0: { y: 36.078592, x: 129.569608 }, info: { peak: "호미곶", height: 0 } },
    // { no: 0, id: "기준", done: '1', pos_0: { y: 37.823880, x: 124.699525 }, info: { peak: "대청도", height: 0 } },
    // { no: 0, id: "기준", done: '1', pos_0: { y: 33.505519, x: 126.955666 }, info: { peak: "우도", height: 0 } },

    { no: 1, id: "가리산(홍천)", done: { step: false, date: "" }, pos_0: { y: 37.871353, x: 127.956485 }, info: { peak: "정상", height: 1051 } },
    { no: 2, id: "가리왕산", done: { step: false, date: "" }, pos_0: { y: 37.460995, x: 128.56275 }, info: { peak: "정상", height: 1561 } },
    { no: 3, id: "가야산(경상)", done: { step: false, date: "" }, pos_0: { y: 35.822563, x: 128.122518 }, info: { peak: "우두봉", height: 1430 } },
    { no: 4, id: "가야산(충남)", done: { step: 8, date: "2025.02.02." }, pos_0: { y: 36.7066361111, x: 126.6083527778 }, info: { peak: "정상", height: 678.2 } },
    { no: 5, id: "가지산", done: { step: 49, date: "2025.11.15." }, pos_0: { y: 35.619875, x: 129.003523 }, info: { peak: "정상", height: 1240 } },

    { no: 6, id: "감악산(원주)", done: { step: 36, date: "2025.09.13." }, pos_0: { y: 37.229426, x: 128.141719 }, info: { peak: "정상", height: 930 } },
    { no: 7, id: "감악산(파주)", done: { step: 29, date: "2025.06.21." }, pos_0: { y: 37.941082, x: 126.969989 }, info: { peak: "정상", height: 675 } },
    { no: 8, id: "계룡산", done: { step: 10, date: "2025.03.30." }, pos_0: { y: 36.361424, x: 127.210292 }, info: { peak: "관음봉", height: 845 } },
    { no: 9, id: "계방산", done: { step: 68, date: "2026.02.26." }, pos_0: { y: 37.728268, x: 128.46543 }, info: { peak: "정상", height: 1577 } },
    { no: 10, id: "관악산", done: { step: 17, date: "2025.05.11." }, pos_0: { y: 37.445044, x: 126.964223 }, info: { peak: "정상", height: 629 } },

    { no: 11, id: "광덕산", done: { step: 1, date: "2024.10.27." }, pos_0: { y: 36.687795, x: 127.027906 }, info: { peak: "정상", height: 699.3 } },
    { no: 12, id: "구병산(보은)", done: { step: 22, date: "2025.05.24." }, pos_0: { y: 36.46989438, x: 127.8625301 }, info: { peak: "정상", height: 877 } },
    { no: 13, id: "구봉산(진안)", done: { step: 33, date: "2025.08.08." }, pos_0: { y: 35.923157, x: 127.416559 }, info: { peak: "천왕봉", height: 1002 } },
    { no: 14, id: "금수산", done: { step: false, date: "" }, pos_0: { y: 36.985009, x: 128.256761 }, info: { peak: "정상", height: 1016 } },
    { no: 15, id: "금오산(구미)", done: { step: 47, date: "2025.11.14." }, pos_0: { y: 36.092833, x: 128.300054 }, info: { peak: "현월봉", height: 977 } },

    { no: 16, id: "금정산", done: { step: 14, date: "2025.04.26." }, pos_0: { y: 35.280118, x: 129.050542 }, info: { peak: "고당봉", height: 802 } },
    { no: 17, id: "남산(경주)", done: { step: 15, date: "2025.04.26." }, pos_0: { y: 35.767661, x: 129.225369 }, info: { peak: "금오봉", height: 468 } },
    { no: 18, id: "내변산(변산)", done: { step: 11, date: "2025.04.11." }, pos_0: { y: 35.616667, x: 126.583333 }, info: { peak: "관음봉", height: 424 } },
    { no: 19, id: "내연산", done: { step: 63, date: "2026.01.31" }, pos_0: { y: 36.263301, x: 129.258523 }, info: { peak: "삼지봉", height: 710 } },
    { no: 20, id: "내장산", done: { step: 7, date: "2025.01.25." }, pos_0: { y: 35.478299, x: 126.888994 }, info: { peak: "신선봉", height: 763 } },

    { no: 21, id: "달마산", done: { step: 55, date: "2025.12.24." }, pos_0: { y: 34.382545, x: 126.585159 }, info: { peak: "달마봉", height: 498.8 } },
    { no: 22, id: "대둔산", done: { step: 13, date: "2025.04.13." }, pos_0: { y: 36.126556, x: 127.323071 }, info: { peak: "마천대", height: 878 } },
    { no: 23, id: "대야산", done: { step: 70, date: "2026.02.28." }, pos_0: { y: 36.672403, x: 127.936723 }, info: { peak: "정상", height: 931 } },
    { no: 24, id: "덕룡산", done: { step: 56, date: "2025.12.24." }, pos_0: { y: 34.5379361111, x: 126.6983111111 }, info: { peak: "서봉", height: 432.8 } },
    { no: 25, id: "덕유산", done: { step: false, date: "" }, pos_0: { y: 35.85990274, x: 127.746381 }, info: { peak: "향적봉", height: 1614 } },

    { no: 26, id: "덕항산", done: { step: false, date: "" }, pos_0: { y: 37.318296, x: 129.001612 }, info: { peak: "정상", height: 1071 } },
    { no: 27, id: "도락산", done: { step: false, date: "" }, pos_0: { y: 36.856368, x: 128.311091 }, info: { peak: "정상", height: 964 } },
    { no: 28, id: "도봉산", done: { step: 25, date: "2025.05.31." }, pos_0: { y: 37.69883, x: 127.01547 }, info: { peak: "신선대", height: 740 } },
    { no: 29, id: "동악산(곡성)", done: { step: 64, date: "2026.02.15." }, pos_0: { y: 35.26132431, x: 127.2406651 }, info: { peak: "시루봉", height: 737.1 } },
    { no: 30, id: "두륜산", done: { step: 54, date: "2025.12.24." }, pos_0: { y: 34.471848, x: 126.637535 }, info: { peak: "가련봉", height: 703 } },

    { no: 31, id: "두타산", done: { step: false, date: "" }, pos_0: { y: 37.43445721, x: 128.9734669 }, info: { peak: "정상", height: 1353 } },
    { no: 32, id: "마니산(강화도)", done: { step: 30, date: "2025.06.21." }, pos_0: { y: 37.612745, x: 126.436401 }, info: { peak: "정상", height: 469 } },
    { no: 33, id: "마이산(진안)", done: { step: 16, date: "2025.05.04." }, pos_0: { y: 35.760484, x: 127.411233 }, info: { peak: "비룡대", height: 686 } },
    { no: 34, id: "명지산", done: { step: false, date: "" }, pos_0: { y: 37.94024567, x: 127.4325174 }, info: { peak: "정상", height: 1267 } },
    { no: 35, id: "모악산", done: { step: 12, date: "2025.04.12." }, pos_0: { y: 35.728678, x: 127.084721 }, info: { peak: "정상", height: 794 } },

    { no: 36, id: "무등산", done: { step: 34, date: "2025.08.22." }, pos_0: { y: 35.121098, x: 127.00283 }, info: { peak: "인왕봉", height: 1187 } },
    { no: 37, id: "민주지산", done: { step: false, date: "" }, pos_0: { y: 36.03976612, x: 127.849333 }, info: { peak: "정상", height: 1242 } },
    { no: 38, id: "방장산", done: { step: 37, date: "2025.10.10." }, pos_0: { y: 35.455991, x: 126.75431 }, info: { peak: "정상", height: 743 } },
    { no: 39, id: "방태산", done: { step: false, date: "" }, pos_0: { y: 37.888141, x: 128.390341 }, info: { peak: "주억봉", height: 1444 } },
    { no: 40, id: "백덕산", done: { step: 69, date: "2026.02.27." }, pos_0: { y: 37.396072, x: 128.293787 }, info: { peak: "정상", height: 1350 } },

    { no: 41, id: "백암산", done: { step: 52, date: "2025.11.30." }, pos_0: { y: 35.461171, x: 126.868349 }, info: { peak: "상왕봉", height: 741 } },
    { no: 42, id: "백운산(광양)", done: { step: 66, date: "2026.02.16." }, pos_0: { y: 35.106243, x: 127.621757 }, info: { peak: "상봉", height: 1218 } },
    { no: 43, id: "백운산(동강)", done: { step: false, date: "" }, pos_0: { y: 37.29869, x: 128.579145 }, info: { peak: "정상", height: 883 } },
    { no: 44, id: "북한산", done: { step: 24, date: "2025.05.30." }, pos_0: { y: 37.658657, x: 126.978056 }, info: { peak: "백운대", height: 837 } },
    { no: 45, id: "불갑산(영광)", done: { step: 39, date: "2025.10.10." }, pos_0: { y: 35.1908333333, x: 126.5650472222 }, info: { peak: "연실봉", height: 517.7 } },

    { no: 46, id: "비슬산", done: { step: false, date: "" }, pos_0: { y: 35.71526, x: 128.523981 }, info: { peak: "천왕봉", height: 1084 } },
    { no: 47, id: "삼악산", done: { step: 45, date: "2025.11.01." }, pos_0: { y: 37.850896, x: 127.658911 }, info: { peak: "용화봉", height: 654 } },
    { no: 48, id: "선운산", done: { step: 27, date: "2025.06.08." }, pos_0: { y: 35.517657, x: 126.577097 }, info: { peak: "수리봉", height: 336 } },
    { no: 49, id: "설악산", done: { step: 42, date: "2025.10.25." }, pos_0: { y: 38.119135, x: 128.46544 }, info: { peak: "대청봉", height: 1708 } },
    { no: 50, id: "소백산", done: { step: false, date: "" }, pos_0: { y: 36.95786818, x: 128.4788661 }, info: { peak: "비로봉", height: 1439 } },
    { no: 51, id: "소요산", done: { step: 28, date: "2025.06.21." }, pos_0: { y: 37.915914, x: 127.132813 }, info: { peak: "의상대", height: 587 } },
    { no: 52, id: "속리산", done: { step: 21, date: "2025.05.23." }, pos_0: { y: 36.543181, x: 127.870846 }, info: { peak: "천황봉", height: 1057 } },
    { no: 53, id: "수락산", done: { step: 26, date: "2025.05.31." }, pos_0: { y: 37.697923, x: 127.081283 }, info: { peak: "주봉", height: 640.6 } },
    { no: 54, id: "신불산", done: { step: 48, date: "2025.11.15." }, pos_0: { y: 35.53933, x: 129.053953 }, info: { peak: "정상", height: 1209 } },
    { no: 55, id: "연인산", done: { step: false, date: "" }, pos_0: { y: 37.898788, x: 127.41435 }, info: { peak: "정상", height: 1068 } },

    { no: 56, id: "오대산", done: { step: 41, date: "2025.10.24." }, pos_0: { y: 37.785712, x: 128.637514 }, info: { peak: "노인봉", height: 1563 } },
    { no: 57, id: "오대산", done: { step: 40, date: "2025.10.24." }, pos_0: { y: 37.797038, x: 128.544074 }, info: { peak: "비로봉", height: 1563 } },
    { no: 58, id: "오봉산", done: { step: false, date: "" }, pos_0: { y: 38.00002881, x: 127.807132 }, info: { peak: "정상", height: 779 } },
    { no: 59, id: "오서산", done: { step: 2, date: "2024.11.03." }, pos_0: { y: 36.460056, x: 126.658811 }, info: { peak: "정상", height: 789.9 } },
    { no: 60, id: "용문산", done: { step: 43, date: "2025.10.31." }, pos_0: { y: 37.561979, x: 127.549637 }, info: { peak: "가섭봉", height: 1157 } },

    { no: 61, id: "용봉산", done: { step: 6, date: "2025.01.19." }, pos_0: { y: 36.64365555, x: 126.64923888 }, info: { peak: "정상", height: 381 } },
    { no: 62, id: "용화산", done: { step: false, date: "" }, pos_0: { y: 38.0380386, x: 127.7479119 }, info: { peak: "정상", height: 878 } },
    { no: 63, id: "운악산", done: { step: 61, date: "2026.01.25." }, pos_0: { y: 37.878718, x: 127.322893 }, info: { peak: "서봉", height: 936 } },
    { no: 64, id: "운장산", done: { step: 32, date: "2025.08.08." }, pos_0: { y: 35.915653, x: 127.363019 }, info: { peak: "운장대", height: 1126 } },
    { no: 65, id: "월악산", done: { step: 5, date: "2025.01.12." }, pos_0: { y: 36.886045, x: 128.105844 }, info: { peak: "영봉", height: 1094 } },

    { no: 66, id: "월출산", done: { step: 53, date: "2025.12.23." }, pos_0: { y: 34.766997, x: 126.704294 }, info: { peak: "천황봉", height: 809 } },
    { no: 67, id: "유명산", done: { step: 46, date: "2025.11.01." }, pos_0: { y: 37.575285, x: 127.48662 }, info: { peak: "정상", height: 862 } },
    { no: 68, id: "응봉산", done: { step: false, date: "" }, pos_0: { y: 37.076597, x: 129.230461 }, info: { peak: "정상", height: 999 } },
    { no: 69, id: "장안산", done: { step: 59, date: "2025.12.27." }, pos_0: { y: 35.625733, x: 127.593443 }, info: { peak: "정상", height: 1237 } },
    { no: 70, id: "재약산", done: { step: 50, date: "2025.11.16." }, pos_0: { y: 35.557707, x: 128.97228 }, info: { peak: "수미봉", height: 1189 } },

    { no: 71, id: "조계산", done: { step: 65, date: "2026.02.16." }, pos_0: { y: 35.001211, x: 127.313555 }, info: { peak: "장군봉", height: 884 } },
    { no: 72, id: "조령산", done: { step: false, date: "" }, pos_0: { y: 36.77083, x: 128.043553 }, info: { peak: "정상", height: 1027 } },
    { no: 73, id: "주왕산", done: { step: 62, date: "2026.01.31." }, pos_0: { y: 36.389337, x: 129.162417 }, info: { peak: "주봉", height: 721 } },
    { no: 74, id: "주흘산", done: { step: 20, date: "2025.05.17." }, pos_0: { y: 36.78844, x: 128.101271 }, info: { peak: "주봉", height: 1106 } },
    { no: 75, id: "지리산", done: { step: false, date: "" }, pos_0: { y: 35.336971, x: 127.730474 }, info: { peak: "천왕봉", height: 1915 } },

    { no: 76, id: "지리산", done: { step: 67, date: "2026.02.17." }, pos_0: { y: 35.421872, x: 127.576094 }, info: { peak: "바래봉", height: 1165 } },
    { no: 77, id: "지리산", done: { step: false, date: "" }, pos_0: { y: 35.275637, x: 127.578314 }, info: { peak: "반야봉", height: 1732 } },
    { no: 78, id: "천관산", done: { step: 57, date: "2025.12.25." }, pos_0: { y: 34.535402, x: 126.911238 }, info: { peak: "연대봉", height: 723 } },
    { no: 79, id: "천마산", done: { step: 31, date: "2025.06.27." }, pos_0: { y: 37.680364, x: 127.273397 }, info: { peak: "정상", height: 812 } },
    { no: 80, id: "천성산", done: { step: 51, date: "2025.11.16." }, pos_0: { y: 35.41542, x: 129.123144 }, info: { peak: "원효봉", height: 922 } },

    { no: 81, id: "천태산", done: { step: 23, date: "2025.05.24." }, pos_0: { y: 36.159122, x: 127.600005 }, info: { peak: "정상", height: 715 } },
    { no: 82, id: "청계산", done: { step: 18, date: "2025.05.11." }, pos_0: { y: 37.433333, x: 127.05 }, info: { peak: "매봉", height: 582 } },
    { no: 83, id: "청량산", done: { step: 71, date: "2026.03.13." }, pos_0: { y: 36.794122, x: 128.907994 }, info: { peak: "장인봉", height: 870 } },
    { no: 84, id: "청화산", done: { step: false, date: "" }, pos_0: { y: 36.625029, x: 127.919377 }, info: { peak: "정상", height: 970 } },
    { no: 85, id: "축령산(장성)", done: { step: 38, date: "2025.10.10." }, pos_0: { y: 35.386134, x: 126.740903 }, info: { peak: "정상", height: 879 } },

    { no: 86, id: "치악산", done: { step: 3, date: "2024.12.22." }, pos_0: { y: 37.365077, x: 128.055568 }, info: { peak: "비로봉", height: 1288 } },
    { no: 87, id: "칠갑산(청양)", done: { step: 9, date: "2025.02.23." }, pos_0: { y: 36.413006, x: 126.884905 }, info: { peak: "정상", height: 561 } },
    { no: 88, id: "칠보산(괴산)", done: { step: 19, date: "2025.05.16." }, pos_0: { y: 36.739981, x: 127.92771 }, info: { peak: "정상", height: 778 } },
    { no: 89, id: "태백산", done: { step: false, date: "" }, pos_0: { y: 37.096337, x: 128.916532 }, info: { peak: "정상", height: 1567 } },
    { no: 90, id: "태화산", done: { step: false, date: "" }, pos_0: { y: 37.117601, x: 128.486345 }, info: { peak: "정상", height: 1027 } },

    { no: 91, id: "팔공산", done: { step: 35, date: "2025.08.29." }, pos_0: { y: 36.016137, x: 128.694901 }, info: { peak: "비로봉", height: 1193 } },
    { no: 92, id: "팔봉산", done: { step: 44, date: "2025.11.01." }, pos_0: { y: 37.696514, x: 127.695577 }, info: { peak: "2봉", height: 302 } },
    { no: 93, id: "팔영산", done: { step: 58, date: "2025.12.25." }, pos_0: { y: 34.624358, x: 127.430924 }, info: { peak: "깃대봉", height: 609 } },
    { no: 94, id: "한라산", done: { step: 4, date: "2024.12.29." }, pos_0: { y: 33.461578, x: 126.535756 }, info: { peak: "백록담", height: 1950 } },
    { no: 95, id: "함백산", done: { step: false, date: "" }, pos_0: { y: 37.168522, x: 128.918228 }, info: { peak: "정상", height: 532 } },

    { no: 96, id: "화악산", done: { step: false, date: "" }, pos_0: { y: 37.988856, x: 127.497655 }, info: { peak: "중봉", height: 1468 } },
    { no: 97, id: "화왕산", done: { step: false, date: "" }, pos_0: { y: 35.547141, x: 128.531682 }, info: { peak: "정상", height: 757 } },
    { no: 98, id: "황매산", done: { step: false, date: "" }, pos_0: { y: 35.495206, x: 127.974455 }, info: { peak: "정상", height: 1108 } },
    { no: 99, id: "황석산", done: { step: 60, date: "2025.12.27." }, pos_0: { y: 35.730696, x: 127.761191 }, info: { peak: "정상", height: 1190 } },
    { no: 100, id: "황악산", done: { step: false, date: "" }, pos_0: { y: 36.117593, x: 127.966881 }, info: { peak: "정상", height: 1111 } }
];

const MAP_MARGIN = 0;
const LATITUDE_MAX = 38.66;
const LATITUDE_MIN = 33.17;
const LONGITUDE_MAX = 131.26;
const LONGITUDE_MIN = 124.38;

// 이미지 경로 생성 함수
function getImagePath(point) {
    let path = isOnPage() ? "/" : "/블랙야크/";
    return `.${path}img/${point.no}_${point.id}.jpg`;
}

// am i in note page?
function isOnPage() {
    return document.querySelector("body#블랙야크") != null;
}

// 이미지 파일 존재 여부 확인 (fetch API 사용)
async function isImageExists(path) {
    try {
        const response = await fetch(path, { method: "HEAD", mode: "no-cors" }); // no-cors 추가
        return response.ok; // 200 OK이면 true, 그렇지 않으면 false
    } catch (error) {
        console.error("Error checking image existence:", error);
        return false;
    }
}

async function updateTitle(p, point) {
    let title = `<div class="info">${point.id} | ${point.info.peak} | ${point.info.height.toLocaleString()} m</div>`;
    if (point.done.step) {
        const imagePath = getImagePath(point);
        // if (await isImageExists(imagePath)) {
        //     title = `<img class="블랙야크_img" src='${imagePath}'> ${title} <div class="done">${point.done.date} (${point.done.step}/100)</div>`;
        // } else {
        //     title = `${title} <div class="done">${point.done.date} (${point.done.step}/100)</div>`;
        // }
        title = `<img class="블랙야크_img" src='${imagePath}' onerror="this.style.display='none'"> ${title} <div class="done">${point.done.date} (${point.done.step}/100)</div>`;
    } else {
        title += `<div class="undone"></div>`;
    }

    // p.setAttribute("data-title", title);
    // let p_target = document.querySelector(`#블랙야크_canvas .point:nth-of-type(${point.no})`);
    p.addEventListener("mouseover", (e) => {
        let tooltip = document.getElementById("tooltip");

        tooltip.innerHTML = title;

        if (isOnPage()) {
            document.querySelectorAll("#블랙야크_canvas .point").forEach(function (element) {
                element.classList.remove("on");
            });
            p.classList.add("on");

            document.querySelectorAll("#블랙야크_table tr").forEach((tr) => {
                tr.classList.remove("on");
            });
            const table_item_target = document.querySelector(`#블랙야크_table tr.no-${point.no}`);
            table_item_target.classList.add("on");
            if (!isMobile() && !window.matchMedia("only screen and (max-width: 1440px)").matches) table_item_target.scrollIntoView({ behavior: "smooth" });
            tooltip.style.setProperty("--tooltip-rotate", `${-3 + Math.random() * 6}deg`);
        }
        tooltip.classList.add("on", "블랙야크");
        if (!isOnPage()) {
            tooltip.style.top = note.parentElement.getBoundingClientRect().top + scrollY + p.offsetTop + "px";
            let left = p.getBoundingClientRect().left;
            if (left <= 0) {
                left = 0;
            }
            tooltip.style.left = left + "px";
        }
    });
    p.addEventListener("mouseout", (e) => {
        tooltip.classList.remove("on", "블랙야크");
    });
}

function pin(point) {
    let p = document.createElement("div");
    canvas.appendChild(p);
    p.setAttribute("style", `left:${point.pos.x}%; top:${point.pos.y}%;`);

    // 기본 정보 묶음
    const title_0 = `${point.id} | ${point.info.peak} | ${point.info.height} m`;

    // p.setAttribute("title", title);
    updateTitle(p, point);

    p.classList.add("point");
    if (point.done.step != false) {
        p.classList.add("done");
        if (point.done.step > 75) {
            p.classList.add("c1");
        } else if (point.done.step > 50) {
            p.classList.add("c2");
        } else if (point.done.step > 25) {
            p.classList.add("c3");
        } else {
            p.classList.add("c4");
        }
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
                y: ((LATITUDE_MAX - point.pos_0.y) / (LATITUDE_MAX - LATITUDE_MIN)) * 100
            };
        }

        pin(point);
    }
}

draw();

// 사이즈 맞추기
canvas.style.height = "calc(" + canvas.offsetWidth + "px - .5em)";
note.addEventListener("mouseenter", (event) => {
    // const rect = canvas.getBoundingClientRect();
    // const mouseX = event.clientX - rect.left;
    // const mouseY = event.clientY - rect.top;
    canvas.style.height = "calc(" + canvas.offsetWidth + "px - .5em)";
});

// 달성률 계산하기
let prog = 0;
points.forEach((element) => {
    if (element.done.step != false) {
        prog++;
    }
});
p.innerHTML += `<span class="prog">${prog}</span>/100`;
