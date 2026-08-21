// ============================================================
//  配置 & 数据
// ============================================================
const STORAGE_KEY = 'trip_spots_v7';
const PLAN_KEY = 'trip_plan_v7';
const NOTES_KEY = 'trip_notes_v7';
const CHECKINS_KEY = 'trip_checkins_v7';
const TRAVEL_INFO_KEY = 'trip_travel_info_v7';
const MODEL_KEY = 'trip_model_v7';

const PLANS = {
    'dl-yt': {
        name: '大连→烟台',
        itinerary: [
            { day: 'Day 1 · 北京→大连 🐷', meals: ['早餐: 高铁简餐', '午餐: 海味当家·海鲜蒸锅', '晚餐: 黑石礁夜市烧烤'], activity: '🚄 高铁 → 星海广场夜景' },
            { day: 'Day 2 · 大连海岸 🐷', meals: ['早餐: 酒店/豆腐脑', '午餐: 渔人码头·日丰园', '晚餐: 中原小吃街'], activity: '🏞️ 滨海路 → 渔人码头 → 威尼斯水城' },
            { day: 'Day 3 · 大连深度 🐷', meals: ['早餐: 酒店', '午餐: 金石滩/旅顺海鲜', '晚餐: 市区日料'], activity: '🌋 金石滩 或 🏯 旅顺' },
            { day: 'Day 4 · 轮渡之夜 🐷', meals: ['早餐: 酒店', '午餐: 市区简餐', '晚餐: 船上餐厅'], activity: '🚢 中山广场 → 复古电车 → 夜航轮渡' },
            { day: 'Day 5 · 烟台 🐷', meals: ['早餐: 蓬莱小面', '午餐: 鲁凤炒鸡', '晚餐: 旺角小渔村'], activity: '🌅 海上日出 → 烟台山 → 月亮湾' },
            { day: 'Day 6 · 返程 🐷', meals: ['早餐: 酒店', '午餐: 烟台简餐', '晚餐: 高铁上'], activity: '🚄 张裕博物馆 → 烟台→北京' }
        ]
    },
    'yt-dl': {
        name: '烟台→大连',
        itinerary: [
            { day: 'Day 1 · 北京→烟台 🐷', meals: ['早餐: 高铁简餐', '午餐: 烟台海鲜', '晚餐: 烟台山周边'], activity: '🚄 高铁 → 烟台山夜景' },
            { day: 'Day 2 · 烟台海岸 🐷', meals: ['早餐: 蓬莱小面', '午餐: 鲁凤炒鸡', '晚餐: 旺角小渔村'], activity: '🌅 烟台山 → 月亮湾 → 所城里' },
            { day: 'Day 3 · 烟台深度 🐷', meals: ['早餐: 酒店', '午餐: 烟台特色', '晚餐: 市区海鲜'], activity: '🏖️ 养马岛 或 张裕博物馆' },
            { day: 'Day 4 · 轮渡之夜 🐷', meals: ['早餐: 酒店', '午餐: 市区简餐', '晚餐: 船上餐厅'], activity: '🚢 烟台港 → 夜航轮渡' },
            { day: 'Day 5 · 大连 🐷', meals: ['早餐: 抵达后', '午餐: 渔人码头·日丰园', '晚餐: 中原小吃街'], activity: '🌊 星海广场 → 滨海路 → 渔人码头' },
            { day: 'Day 6 · 返程 🐷', meals: ['早餐: 酒店', '午餐: 大连简餐', '晚餐: 高铁上'], activity: '🚄 中山广场 → 大连→北京' }
        ]
    }
};

const PRESET_COORDS = {
    '星海广场': { lat: 38.88, lng: 121.59 },
    '渔人码头': { lat: 38.86, lng: 121.69 },
    '金石滩': { lat: 39.08, lng: 122.01 },
    '旅顺': { lat: 38.80, lng: 121.26 },
    '中山广场': { lat: 38.92, lng: 121.64 },
    '烟台山': { lat: 37.55, lng: 121.40 },
    '月亮湾': { lat: 37.52, lng: 121.44 },
    '养马岛': { lat: 37.47, lng: 121.62 },
    '张裕博物馆': { lat: 37.54, lng: 121.42 },
    '所城里': { lat: 37.53, lng: 121.42 }
};

function getCoordsForName(name) {
    for (let [key, val] of Object.entries(PRESET_COORDS)) {
        if (name.includes(key)) return val;
    }
    return null;
}

let currentPlan = 'dl-yt';
let spots = [];
let checkins = {};
let notes = {};
let currentDayIndex = 0;
let mapInstance = null;
let fullMapInstance = null;
let mapMarkers = [];
let fullMapMarkers = [];
let mapPolyline = null;
let fullMapPolyline = null;
let travelInfo = { train1: '', ferry: '', train2: '', hotelInfo: '', otherNote: '' };
let chatHistory = [];
let typingTimer = null;
let typingIndex = 0;
let selectedModel = 'zhipu-glm';

// ============================================================
//  存储
// ============================================================
function loadSpots() {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) spots = JSON.parse(raw); } catch (e) { spots = []; }
    if (spots.length === 0) {
        spots = [
            { id: 's1', dayIndex: 0, name: '星海广场', lat: 38.88, lng: 121.59, photos: [] },
            { id: 's2', dayIndex: 1, name: '渔人码头', lat: 38.86, lng: 121.69, photos: [] },
            { id: 's4', dayIndex: 4, name: '烟台山', lat: 37.55, lng: 121.40, photos: [] },
            { id: 's5', dayIndex: 4, name: '月亮湾', lat: 37.52, lng: 121.44, photos: [] }
        ];
        saveSpots();
    }
}
function saveSpots() { localStorage.setItem(STORAGE_KEY, JSON.stringify(spots)); updateAllStats(); }
function loadCheckins() {
    try { const raw = localStorage.getItem(CHECKINS_KEY); if (raw) checkins = JSON.parse(raw); } catch (e) { checkins = {}; }
}
function saveCheckins() { localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins)); updateAllStats(); }
function loadNotes() {
    try { const raw = localStorage.getItem(NOTES_KEY); if (raw) notes = JSON.parse(raw); } catch (e) { notes = {}; }
}
function saveNotes() { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); }
function loadPlan() {
    try { const p = localStorage.getItem(PLAN_KEY); if (p && PLANS[p]) currentPlan = p; } catch (e) {}
}
function savePlan() { localStorage.setItem(PLAN_KEY, currentPlan); }
function loadTravelInfo() {
    try { const raw = localStorage.getItem(TRAVEL_INFO_KEY); if (raw) travelInfo = JSON.parse(raw); } catch (e) {}
    document.getElementById('train1').value = travelInfo.train1 || '';
    document.getElementById('ferry').value = travelInfo.ferry || '';
    document.getElementById('train2').value = travelInfo.train2 || '';
    document.getElementById('hotelInfo').value = travelInfo.hotelInfo || '';
    document.getElementById('otherNote').value = travelInfo.otherNote || '';
    updateBudgetFromInfo();
}
function saveTravelInfo() {
    travelInfo = {
        train1: document.getElementById('train1').value,
        ferry: document.getElementById('ferry').value,
        train2
