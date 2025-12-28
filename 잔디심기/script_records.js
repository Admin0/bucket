
const hermes_records = [
    // official data
    { date: "2025-11-09", course: "10k", record: "01:00:07", title: "아산은행나무길 전국마라톤대회" },
    { date: "2025-10-19", course: "10k", record: "00:48:29", title: "꽈자런 천안", certi: "https://www.smartchip.co.kr/return_data_livephoto.asp?usedata=202550000229&nameorbibno=1975" },
    { date: "2025-10-12", course: "10k", record: "00:51:32", title: "빵빵런 대전", certi: "https://www.smartchip.co.kr/return_data_livephoto.asp?nameorbibno=3159&usedata=202550000208" },
    { date: "2025-09-28", course: "10k", record: "00:54:16", title: "공주백제마라톤", certi: "https://www.smartchip.co.kr/return_data_livephoto.asp?usedata=202550000189&nameorbibno=11646" },
    { date: "2025-04-20", course: "10k", record: "01:02:24", title: "아산이순신마라톤", certi: "https://time.spct.kr/m2.php?EVENT_NO=20250420009&TargetYear=2025&currentPage=1&BIB_NO=003596" },

    { date: "2024-11-10", course: "10k", record: "00:58:43", title: "아산은행나무길 전국마라톤대회", certi: "https://time.spct.kr/m2.php?E=2024111004&B=001956" },

    // { date: "2023-12-12", course: "trail", distance: 3.74, elevation: 362, record: "01:14:44", title: "배방산" }, // 트레일 러닝 대회 더미

    // unofficial 2025 run
    { date: "2025-12-21", distance: 5.01, record: "00:27:40", title: "장항선구철도길" },
    { date: "2025-12-18", distance: 10.01, record: "00:56:56", title: "장항선구철도길 이런저런" },
    { date: "2025-12-14", distance: 5.16, record: "00:26:41", title: "장항선구철도길" },
    { date: "2025-12-13", distance: 10.11, record: "00:55:34", title: "장항선구철도길 가민런" },
    { date: "2025-12-06", distance: 21.26, record: "01:57:05", title: "장항선구철도길 어쩌다보니하프런" },
    { date: "2025-12-04", distance: 5.36, record: "00:30:54", title: "장항선구철도길 눈싸데기런" },

    { date: "2025-11-26", distance: 6.35, record: "00:37:58", title: "신정호 정기런" },
    { date: "2025-11-19", distance: 4.71, record: "00:37:58", title: "은행나무길 정기런" },
    { date: "2025-11-12", distance: 6.14, record: "00:33:45", title: "신정호 영인호족조우런" },
    { date: "2025-11-03", distance: 5.34, record: "00:29:52", title: "장항선구철도길 이런저런" },

    { date: "2025-10-27", distance: 6.2, record: "00:40:43", title: "신정호 러닝벙" },
    { date: "2025-10-21", distance: 5.33, record: "00:29:29", title: "장항선구철도길 이런저런" },
    { date: "2025-10-18", distance: 6.2, record: "00:34:50", title: "신정호 등산화런" },
    { date: "2025-10-07", distance: 5.03, record: "00:24:44", title: "신정호 추석냠냠반성런" },
    // { date: "2025-10-03", distance: 7.16, record: "01:29:06", title: "알틴-아라산 승마런 (키르기스스탄)"},

    { date: "2025-09-26", distance: 5.95, record: "00:32:40", title: "이순신종합운동장 판다러버런" },
    { date: "2025-09-23", distance: 5.78, record: "00:29:52", title: "장항선구철도길 이런저런" },
    { date: "2025-09-20", distance: 12.31, record: "01:13:08", title: "장항선구철도길 참깨런" },
    { date: "2025-09-16", distance: 5.03, record: "00:28:13", title: "장항선구철도길 이런저런" },
    { date: "2025-09-11", distance: 5.04, record: "00:32:38", title: "성성호수공원 초록원정런" },
    { date: "2025-09-09", distance: 10.1, record: "00:55:08", title: "천안종합운동장 초록원정런" },
    { date: "2025-09-05", distance: 13.44, record: "01:16:02", title: "장항선구철도길 오런완실패런" },
    { date: "2025-09-03", distance: 6.30, record: "00:36:21", title: "신정호 정기모임런" },

    { date: "2025-08-28", distance: 6.25, record: "00:34:14", title: "신정호 이런저런" },
    { date: "2025-08-23", distance: 5.16, record: "00:29:36", title: "삼천 본가런" },
    { date: "2025-08-21", distance: 10.15, record: "01:07:30", title: "장재천 웨일런" },
    { date: "2025-08-14", distance: 5.02, record: "00:27:14", title: "장항선구철도길 크록스런" },
    { date: "2025-08-12", distance: 12.47, record: "01:15:15", title: "장항선구철도길 끝까지가본런" },
    { date: "2025-08-10", distance: 5.12, record: "00:28:43", title: "삼천 자라발견런" },
    { date: "2025-08-05", distance: 10.08, record: "00:56:55", title: "장항선구철도길 혼자런" },
    { date: "2025-08-01", distance: 10.01, record: "00:57:26", title: "장항선구철도길 선물러닝복개시런" },

    { date: "2025-07-31", distance: 5.14, record: "00:34:38", title: "신정호 왕손런" },
    { date: "2025-07-21", distance: 10.01, record: "01:00:17", title: "장항선구철도길" },
    { date: "2025-07-23", distance: 5.11, record: "00:32:15", title: "신정호 정기모임런" },
    { date: "2025-07-20", distance: 7.36, record: "00:42:20", title: "장항선구철도길" },
    { date: "2025-07-10", distance: 7.01, record: "00:42:54", title: "곡교천 코스발굴런" },
    { date: "2025-07-01", distance: 5.11, record: "00:32:15", title: "신정호" },

    { date: "2025-06-25", distance: 5.02, record: "00:28:19", title: "신정호" },
    { date: "2025-06-18", distance: 5.01, record: "00:28:51", title: "신정호" },
    { date: "2025-06-14", distance: 5.01, record: "00:29:15", title: "신정호" },

    { date: "2025-05-20", distance: 5.01, record: "00:32:58", title: "신정호" },
    { date: "2025-05-15", distance: 5.02, record: "00:34:13", title: "신정호" },

    { date: "2025-04-29", distance: 5.02, record: "00:34:13", title: "신정호" },
    { date: "2025-04-07", distance: 5.03, record: "00:33:50", title: "순천향대학교 이런저런" },

    { date: "2025-03-31", distance: 5.01, record: "00:31:58", title: "신정호" },
    { date: "2025-03-05", distance: 5.05, record: "00:32:36", title: "신정호" },

    { date: "2025-02-25", distance: 5.01, record: "00:29:34", title: "신정호" },

    { date: "2025-01-26", distance: 5.01, record: "00:29:46", title: "신정호" },

    // unofficial 2025 trail
    { date: "2025-12-28", distance: 3.47, elevation: 314, record: "01:46:44", title: "배방산" },
    { date: "2025-12-27", distance: 5.35, elevation: 634, record: "02:06:59", title: "황석산" },
    { date: "2025-12-27", distance: 6.48, elevation: 484, record: "01:39:30", title: "장안산" },
    { date: "2025-12-25", distance: 2.66, elevation: 313, record: "01:01:34", title: "팔영산" },
    { date: "2025-12-25", distance: 4.09, elevation: 449, record: "01:27:10", title: "천관산" },
    { date: "2025-12-24", distance: 1.87, elevation: 271, record: "01:12:44", title: "덕룡산" },
    { date: "2025-12-24", distance: 2.90, elevation: 351, record: "01:15:45", title: "달마산" },
    { date: "2025-12-24", distance: 6.77, elevation: 685, record: "02:22:30", title: "두륜산" },
    { date: "2025-12-23", distance: 9.81, elevation: 800, record: "02:47:47", title: "월출산" },
    { date: "2025-12-12", distance: 3.74, elevation: 362, record: "01:14:44", title: "배방산" },
    { date: "2025-12-06", distance: 3.56, elevation: 173, record: "01:03:23", title: "봉서산" },

    { date: "2025-11-30", distance: 10.0, elevation: 742, record: "02:27:32", title: "백암산" },
    { date: "2025-11-16", distance: 7.36, elevation: 330, record: "01:58:36", title: "재약산" },
    { date: "2025-11-15", distance: 11.15, elevation: 1055, record: "03:58:36", title: "신불산" },
    { date: "2025-11-14", distance: 5.8, elevation: 672, record: "01:57:07", title: "금오산" },
    { date: "2025-11-01", distance: 7.5, elevation: 821, record: "03:20:00", title: "삼악산" },

    { date: "2025-10-30", distance: 11.57, elevation: 1033, record: "04:02:44", title: "용문산" },
    { date: "2025-10-25", distance: 14.63, elevation: 1470, record: "04:39:37", title: "설악산" },
    { date: "2025-10-10", distance: 8.47, elevation: 453, record: "02:24:29", title: "불갑산" },
    { date: "2025-10-02", distance: 2.84, elevation: 193, record: "01:16:49", title: "알틴-아라산(키르기스스탄)" },
    
    { date: "2025-09-21", distance: 11.41, elevation: 893, record: "04:08:26", title: "망경산" },
    { date: "2025-09-14", distance: 6.20, elevation: 509, record: "01:38:36", title: "두타산" },
    { date: "2025-09-07", distance: 6.83, elevation: 539, record: "02:48:40", title: "광덕산" },

    { date: "2025-08-29", distance: 7.53, elevation: 894, record: "02:50:56", title: "팔공산" },
    { date: "2025-08-22", distance: 12.41, elevation: 948, record: "03:42:58", title: "무등산" },
    { date: "2025-08-16", distance: 3.23, elevation: 255, record: "01:14:18", title: "배방산" },
    { date: "2025-08-08", distance: 7.68, elevation: 826, record: "03:22:45", title: "구봉산(진안)" },
    { date: "2025-08-02", distance: 10.26, elevation: 544, record: "03:32:20", title: "칠보산(괴산)" },

    { date: "2025-07-26", distance: 4.87, elevation: 385, record: "01:29:27", title: "배방산" },
    { date: "2025-07-06", distance: 3.68, elevation: 150, record: "01:15:07", title: "봉서산" },

    { date: "2025-06-29", distance: 3.46, elevation: 293, record: "01:28:51", title: "배방산" },
    { date: "2025-06-27", distance: 6.75, elevation: 645, record: "02:33:54", title: "천마산" },
    { date: "2025-06-21", distance: 8.38, elevation: 543, record: "02:25:23", title: "소요산" },
    { date: "2025-06-15", distance: 4.59, elevation: 218, record: "01:25:27", title: "영인산" },
    { date: "2025-06-08", distance: 6.77, elevation: 312, record: "01:42:49", title: "선운산" },
    { date: "2025-06-06", distance: 7.26, elevation: 545, record: "03:22:04", title: "관악산" },
    
    { date: "2025-05-31", distance: 11.68, elevation: 690, record: "03:54:34", title: "수락산" },
    { date: "2025-05-23", distance: 14.88, elevation: 744, record: "03:56:49", title: "속리산" },
    { date: "2025-05-17", distance: 11.56, elevation: 871, record: "03:50:16", title: "주흘산" },
    { date: "2025-05-11", distance: 5.72, elevation: 488, record: "01:40:26", title: "청계산" },
    { date: "2025-05-04", distance: 8.28, elevation: 638, record: "02:51:06", title: "마이산" },
    
    { date: "2025-04-26", distance: 7.00, elevation: 592, record: "02:03:17", title: "금정산" },
    { date: "2025-04-13", distance: 8.01, elevation: 915, record: "03:11:58", title: "대둔산" },
    { date: "2025-04-12", distance: 6.24, elevation: 641, record: "02:11:27", title: "모악산" },
    { date: "2025-04-06", distance: 6.85, elevation: 406, record: "01:59:15", title: "흑성산" },

    { date: "2025-03-30", distance: 8.59, elevation: 884, record: "03:24:04", title: "계룡산" },
    { date: "2025-03-29", distance: 5.78, elevation: 501, record: "01:47:08", title: "오봉산" },
    { date: "2025-03-01", distance: 3.01, elevation: 304, record: "02:02:22", title: "망산" },

    { date: "2025-02-23", distance: 7.66, elevation: 697, record: "03:11:28", title: "칠갑산" },
    { date: "2025-02-02", distance: 6.93, elevation: 849, record: "04:24:27", title: "가야산(충남)" },
    
    { date: "2025-01-25", distance: 6.79, elevation: 846, record: "04:47:30", title: "내장산" },
    { date: "2025-01-19", distance: 2.45, elevation: 396, record: "01:45:22", title: "용봉산" },
    { date: "2025-01-12", distance: 7.22, elevation: 1193, record: "05:55:49", title: "월악산" },


    // unofficial 2024 run
    { date: "2024-12-12", distance: 5.07, record: "00:28:25", title: "신정호" },
    { date: "2024-12-07", distance: 5.01, record: "00:28:48", title: "신정호" },

    { date: "2024-11-19", distance: 5.01, record: "00:29:46", title: "신정호" },
    { date: "2024-11-07", distance: 5.01, record: "00:27:43", title: "신정호" },

    { date: "2024-10-31", distance: 5.03, record: "00:27:41", title: "신정호" },
    { date: "2024-10-23", distance: 5.01, record: "00:31:57", title: "신정호" },
    { date: "2024-10-15", distance: 5.01, record: "00:28:58", title: "신정호" },
    { date: "2024-10-12", distance: 5.01, record: "00:28:43", title: "신정호" },
    { date: "2024-10-05", distance: 5.00, record: "00:30:55", title: "신정호" },
    
    { date: "2024-09-28", distance: 5.01, record: "00:31:41", title: "신정호" },
    { date: "2024-09-23", distance: 10.01, record: "01:15:07", title: "신정호 마라톤대회대비런" },

    { date: "2024-08-27", distance: 5.01, record: "00:31:05", title: "신정호" },

    { date: "2024-07-21", distance: 5.01, record: "00:36:37", title: "신정호" },
    { date: "2024-07-05", distance: 5.09, record: "00:43:34", title: "신정호" },

    { date: "2024-06-23", distance: 5.01, record: "00:37:21", title: "신정호" },
    { date: "2024-06-10", distance: 5.02, record: "00:32:49", title: "신정호" },
    { date: "2024-06-08", distance: 5.01, record: "00:33:41", title: "신정호" },

    { date: "2024-05-31", distance: 5.08, record: "00:31:04", title: "신정호" },
    { date: "2024-05-19", distance: 5.01, record: "00:28:59", title: "신정호" },
    { date: "2024-05-16", distance: 5.12, record: "00:32:08", title: "신정호" },
    { date: "2024-05-09", distance: 5.02, record: "00:31:54", title: "신정호" },
    { date: "2024-05-01", distance: 5.02, record: "00:33:45", title: "신정호" },

    { date: "2024-04-16", distance: 5.01, record: "00:33:17", title: "신정호" },
    { date: "2024-04-11", distance: 5.01, record: "00:34:44", title: "신정호" },
    { date: "2024-04-01", distance: 5.02, record: "00:32:53", title: "신정호" },

    { date: "2024-03-26", distance: 5.01, record: "00:53:19", title: "신정호" },
    { date: "2024-03-15", distance: 5.03, record: "00:37:09", title: "신정호" },
    { date: "2024-03-09", distance: 5.17, record: "00:43:40", title: "신정호" },

    // unofficial 2024 trail
    { date: "2024-12-29", distance: 19.00, elevation: 1460, record: "07:14:58", title: "한라산" },
    { date: "2024-12-22", distance: 5.98, elevation: 1189, record: "02:55:13", title: "치악산" },
    { date: "2024-12-08", distance: 3.48, elevation: 391, record: "01:58:29", title: "덕숭산" },
    { date: "2024-12-01", distance: 3.12, elevation: 319, record: "01:37:59", title: "배방산" },
    
    { date: "2024-11-17", distance: 11.57, elevation: 853, record: "04:41:17", title: "광교산" },
    { date: "2024-11-02", distance: 9.17, elevation: 797, record: "04:39:07", title: "오서산" },
    
    { date: "2024-10-27", distance: 4.59, elevation: 507, record: "01:50:34", title: "광덕산" },
    { date: "2024-10-09", distance: 3.97, elevation: 410, record: "03:04:38", title: "설화산" },
    { date: "2024-10-03", distance: 6.22, elevation: 406, record: "02:42:04", title: "봉수산" },

    { date: "2024-09-14", distance: 4.38, elevation: 346, record: "02:07:31", title: "설화산" },

    { date: "2024-07-20", distance: 3.16, elevation: 122, record: "01:27:44", title: "고용산" },
    { date: "2024-07-13", distance: 8.01, elevation: 645, record: "02:52:37", title: "광덕산" },
    
    { date: "2024-06-22", distance: 8.00, elevation: 487, record: "02:10:13", title: "태조산" },
    { date: "2024-06-15", distance: 8.88, elevation: 444, record: "02:10:13", title: "영인산" },
    { date: "2024-06-09", distance: 8.45, elevation: 594, record: "02:48:51", title: "광덕산" }
];
