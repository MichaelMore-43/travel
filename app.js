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
        train2: document.getElementById('train2').value,
        hotelInfo: document.getElementById('hotelInfo').value,
        otherNote: document.getElementById('otherNote').value
    };
    localStorage.setItem(TRAVEL_INFO_KEY, JSON.stringify(travelInfo));
    updateBudgetFromInfo();
    alert('🐷 已保存！');
}
function loadModelPreference() {
    try { const m = localStorage.getItem(MODEL_KEY); if (m) { selectedModel = m; } } catch (e) {}
    document.getElementById('modelSelect').value = selectedModel;
    document.getElementById('settingsModelSelect').value = selectedModel;
}
function saveModelPreference() {
    selectedModel = document.getElementById('modelSelect').value;
    localStorage.setItem(MODEL_KEY, selectedModel);
    document.getElementById('settingsModelSelect').value = selectedModel;
}
function syncModelSelect() {
    const m = document.getElementById('settingsModelSelect').value;
    selectedModel = m;
    document.getElementById('modelSelect').value = m;
    localStorage.setItem(MODEL_KEY, m);
}

// ============================================================
//  预算
// ============================================================
function updateBudgetFromInfo() {
    const text = travelInfo.train1 + travelInfo.ferry + travelInfo.train2 + travelInfo.hotelInfo;
    const numbers = text.match(/\d+/g);
    let total = 0;
    if (numbers) { numbers.forEach(n => { total += parseInt(n) || 0; }); }
    if (total === 0 && text.length > 0) {
        document.getElementById('hBudget').textContent = '请填数字';
        document.getElementById('rTotalBudget').textContent = '--';
        document.getElementById('rSpent').textContent = '--';
        document.getElementById('rRemain').textContent = '--';
        document.getElementById('budgetRing').style.setProperty('--pct', '0%');
        document.getElementById('budgetRingLabel').textContent = '0%';
        document.getElementById('statsBudgetRing').style.setProperty('--pct', '0%');
        document.getElementById('statsBudgetLabel').textContent = '0%';
        document.getElementById('statsTotalBudget').textContent = '--';
        document.getElementById('statsSpent').textContent = '--';
        document.getElementById('statsRemain').textContent = '--';
        return;
    }
    const spent = Math.min(total, Math.round(total * 0.4));
    const remain = total - spent;
    document.getElementById('hBudget').textContent = total || '--';
    document.getElementById('rTotalBudget').textContent = total || '--';
    document.getElementById('rSpent').textContent = spent || '--';
    document.getElementById('rRemain').textContent = remain || '--';
    const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
    document.getElementById('budgetRing').style.setProperty('--pct', pct + '%');
    document.getElementById('budgetRingLabel').textContent = Math.round(pct) + '%';
    document.getElementById('statsBudgetRing').style.setProperty('--pct', pct + '%');
    document.getElementById('statsBudgetLabel').textContent = Math.round(pct) + '%';
    document.getElementById('statsTotalBudget').textContent = total || '--';
    document.getElementById('statsSpent').textContent = spent || '--';
    document.getElementById('statsRemain').textContent = remain || '--';
}

// ============================================================
//  统计
// ============================================================
function updateAllStats() {
    const totalPhotos = spots.reduce((sum, s) => sum + (s.photos ? s.photos.length : 0), 0);
    const checked = spots.filter(s => checkins[s.id]).length;
    const total = spots.length;
    document.getElementById('hSpots').textContent = total;
    document.getElementById('hPhotos').textContent = totalPhotos;
    document.getElementById('hCheckins').textContent = checked;
    document.getElementById('hCheckinsTotal').textContent = total;
    document.getElementById('hSpotsSub').textContent = `🐷 已打卡 ${checked} 个`;
    const dayProgress = Math.min(100, (currentDayIndex + 1) / 6 * 100);
    document.getElementById('hProgress').textContent = Math.round(dayProgress) + '%';
    document.getElementById('hProgressSub').textContent = `🐷 Day ${Math.min(currentDayIndex+1,6)} / 6`;
    const checkPct = total > 0 ? Math.round((checked / total) * 100) : 0;
    document.getElementById('checkinDone').textContent = checked;
    document.getElementById('checkinTotal').textContent = total;
    document.getElementById('checkinPct').textContent = checkPct + '%';
    document.getElementById('checkinBar').style.width = checkPct + '%';
    document.getElementById('statsCheckinDone').textContent = checked;
    document.getElementById('statsCheckinTotal').textContent = total;
    document.getElementById('statsCheckinPct').textContent = checkPct + '%';
    document.getElementById('statsCheckinBar').style.width = checkPct + '%';

    document.getElementById('mapTotalSpots').textContent = total;
    document.getElementById('photoWallCount').textContent = totalPhotos + ' 张照片';
    document.getElementById('settingsSpotCount').textContent = total;
    document.getElementById('settingsPhotoCount').textContent = totalPhotos;
    document.getElementById('settingsChatCount').textContent = chatHistory.length;

    renderBarChart();
    renderPieChart();
    renderPhotoWall();
    renderDayCards();
    renderFullMapSpotsList();
    updateBudgetFromInfo();
    if (document.getElementById('page-day').classList.contains('active')) {
        renderDayDetail(currentDayIndex);
    }
}

function updateCountdown() {
    const start = new Date(2026, 9, 1);
    const now = new Date();
    const diff = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    document.getElementById('countdownDays').textContent = Math.max(0, diff);
    document.getElementById('planDisplay').textContent = PLANS[currentPlan].name;
}

// ============================================================
//  图表
// ============================================================
function renderBarChart() {
    const container = document.getElementById('statsBarChart');
    const daySpots = Array.from({ length: 6 }, (_, i) => spots.filter(s => s.dayIndex === i).length);
    const max = Math.max(1, ...daySpots);
    container.innerHTML = daySpots.map((count, i) => `
            <div class="bar-item">
                <div class="bar" style="height: ${(count / max) * 80 + 4}px;"></div>
                <div class="bar-label">D${i+1}</div>
                <div style="font-size:8px;color:#4a7ad8;font-weight:600;">${count}</div>
            </div>
        `).join('');
    document.getElementById('statsBarTotal').textContent = spots.length;
}

function renderPieChart() {
    const dl = spots.filter(s => {
        const plan = PLANS[currentPlan];
        const isDl = plan.itinerary.slice(0, 3).some((_, i) => s.dayIndex === i);
        return isDl;
    }).length;
    const yt = spots.length - dl;
    const total = spots.length || 1;
    const dlPct = (dl / total) * 100;
    const ytPct = (yt / total) * 100;
    document.getElementById('statsPieChart').style.background =
        `conic-gradient(#4a7ad8 0% ${dlPct}%, #6c5ecf ${dlPct}% ${dlPct + ytPct}%)`;
    document.getElementById('statsPieDl').textContent = dl;
    document.getElementById('statsPieYt').textContent = yt;
    document.getElementById('statsPieTotal').textContent = spots.length;
}

function renderPhotoWall() {
    const container = document.getElementById('photoWallGrid');
    const allPhotos = [];
    spots.forEach(s => { if (s.photos) { s.photos.forEach(p => { allPhotos.push({ spotName: s.name, data: p.data, id: p.id }); }); } });
    if (allPhotos.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="pig-big">🐷</span>还没有照片呢～<br>去首页添加地点后上传照片吧！</div>`;
        return;
    }
    container.innerHTML = allPhotos.map(p =>
        `<div class="wall-item" onclick="window.open('${p.data}','_blank')">
                <img src="${p.data}" alt="${p.spotName}" />
                <div class="badge">${p.spotName}</div>
            </div>`
    ).join('');
}

function renderDayCards() {
    const plan = PLANS[currentPlan];
    const container = document.getElementById('dayCards');
    container.innerHTML = plan.itinerary.map((d, i) => {
        const count = spots.filter(s => s.dayIndex === i).length;
        const photos = spots.filter(s => s.dayIndex === i).reduce((sum, s) => sum + (s.photos ? s.photos.length : 0), 0);
        const checked = spots.filter(s => s.dayIndex === i && checkins[s.id]).length;
        const allChecked = count > 0 && checked === count;
        return `<div class="day-card" onclick="openDay(${i})">
                ${allChecked ? '✅' : '<span class="pig-icon">🐷</span>'}
                <div class="day-num">Day ${i+1}</div>
                <div class="day-label">${d.day.replace('Day '+(i+1)+' · ','').replace('🐷','')}</div>
                <div class="day-sub">📍 ${count} 个 · 📷 ${photos} 张</div>
                <div class="day-badge">${allChecked ? '✅ 已完成 🐷' : '查看详情 →'}</div>
            </div>`;
    }).join('');
}

// ============================================================
//  页面切换
// ============================================================
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    if (page === 'map') { setTimeout(initFullMap, 300); }
    if (page === 'stats') { updateAllStats(); }
    if (page === 'photos') { renderPhotoWall(); }
    if (page === 'settings') { updateAllStats(); }
}

function goHome() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-home').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === 'home'));
    if (mapInstance) { try { mapInstance.destroy(); } catch (e) {} mapInstance = null; mapMarkers = []; mapPolyline = null; }
    renderHome();
}

function renderHome() {
    const plan = PLANS[currentPlan];
    document.getElementById('planDisplay').textContent = plan.name;
    renderDayCards();
    updateAllStats();
    updateCountdown();
    loadTravelInfo();
    renderToday();
    renderAIHistory();
}

// ============================================================
//  今日行程
// ============================================================
function getTodayIndex() {
    const start = new Date(2026, 9, 1);
    const now = new Date();
    const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diff, 5));
}

function renderToday() {
    const idx = getTodayIndex();
    const plan = PLANS[currentPlan];
    const day = plan.itinerary[idx];
    document.getElementById('todayTitle').textContent = day.day;
    document.getElementById('todayActivity').textContent = day.activity;
    const items = document.querySelectorAll('#todayMeals .meal-item .editable-text');
    day.meals.forEach((m, i) => { if (items[i]) items[i].textContent = m.replace(/早餐: |午餐: |晚餐: /g, ''); });
}

// ============================================================
//  AI 问答
// ============================================================
function renderAIHistory() {
    const container = document.getElementById('aiResponse');
    if (chatHistory.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.style.display = 'block';
    container.innerHTML = chatHistory.map(msg => {
        const icon = msg.role === 'user' ? '👤' : '🐷';
        const label = msg.role === 'user' ? '你' : '小猪';
        const cls = msg.role === 'user' ? 'msg-user' : 'msg-assistant';
        return `<div class="${cls}" style="padding:3px 0;border-bottom:1px solid #e8edf5;font-size:13px;">
                <strong>${icon} ${label}：</strong>${msg.content}
            </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}

async function askAI() {
    const input = document.getElementById('aiInput');
    const responseDiv = document.getElementById('aiResponse');
    const btn = document.getElementById('aiBtn');
    const question = input.value.trim();

    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }

    if (!question) {
        responseDiv.style.display = 'block';
        responseDiv.innerHTML = '🐷 小猪说：先输入问题再问我呀～';
        return;
    }

    input.value = '';

    chatHistory.push({ role: 'user', content: question });
    renderAIHistory();

    responseDiv.style.display = 'block';
    responseDiv.innerHTML += '🐷 <span class="typing-cursor">▌</span>';
    btn.disabled = true;
    btn.textContent = '⏳ 思考中...';

    try {
        const context = chatHistory.slice(-20).map(msg =>
            `${msg.role === 'user' ? '用户' : '助手'}：${msg.content}`
        ).join('\n');

        const model = document.getElementById('modelSelect').value;

        const res = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: question,
                context: context,
                model: model
            })
        });

        const data = await res.json();

        if (data.success) {
            const cursor = responseDiv.querySelector('.typing-cursor');
            if (cursor) cursor.remove();

            chatHistory.push({ role: 'assistant', content: data.reply });
            renderAIHistory();

            const fullText = data.reply;
            typingIndex = 0;
            typeCharacter(responseDiv, fullText);
        } else {
            responseDiv.innerHTML += `\n🐷 小猪遇到了问题：${data.error || '请稍后重试'}`;
        }
    } catch (err) {
        responseDiv.innerHTML += `\n🐷 网络连接失败，请检查网络后重试。`;
    }

    btn.disabled = false;
    btn.textContent = '🐷 问小猪';
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
}

function typeCharacter(container, text) {
    if (typingIndex >= text.length) {
        container.innerHTML += ' ✨';
        return;
    }

    const char = text.charAt(typingIndex);
    container.innerHTML += char;
    typingIndex++;

    const delay = 25 + Math.random() * 40;
    typingTimer = setTimeout(() => {
        typeCharacter(container, text);
    }, delay);
}

function clearAI() {
    if (chatHistory.length === 0) return;
    if (!confirm('🐷 确定要清空聊天记录吗？')) return;
    chatHistory = [];
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
    const responseDiv = document.getElementById('aiResponse');
    responseDiv.style.display = 'none';
    responseDiv.innerHTML = '';
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
    updateAllStats();
}

function loadChatHistory() {
    try {
        const raw = localStorage.getItem('chat_history');
        if (raw) {
            const data = JSON.parse(raw);
            if (Array.isArray(data) && data.length > 0) {
                chatHistory = data;
                renderAIHistory();
            }
        }
    } catch (e) {}
}

// ============================================================
//  每日详情
// ============================================================
function openDay(index) {
    currentDayIndex = index;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-day').classList.add('active');
    renderDayDetail(index);
    document.getElementById('dayNote').value = notes[index] || '';
    setTimeout(() => initDayMap(index), 400);
}

function renderDayDetail(index) {
    const plan = PLANS[currentPlan];
    const day = plan.itinerary[index];
    document.getElementById('dTitle').innerHTML = `<span class="pig">🐷</span> ${day.day}`;
    const infoContainer = document.getElementById('dInfo');
    infoContainer.innerHTML = `
            <div style="display:flex;flex-wrap:wrap;gap:4px 16px;font-size:13px;">
                ${day.meals.map(m => `<div><span style="font-weight:600;color:#4a7ad8;">${m.split(':')[0]}:</span> ${m.split(':')[1]}</div>`).join('')}
            </div>
            <div class="activity">🏃 ${day.activity}</div>
        `;
    renderDaySpots(index);
}

function renderDaySpots(index) {
    const daySpots = spots.filter(s => s.dayIndex === index);
    const container = document.getElementById('dSpotsList');
    document.getElementById('dSpotCount').textContent = daySpots.length + ' 个';
    if (daySpots.length === 0) {
        container.innerHTML = `<div class="empty-state"><span class="pig-big">🐷</span>还没有地点呢～<br>点击地图添加！</div>`;
        return;
    }
    container.innerHTML = daySpots.map(spot => {
        const photoCount = spot.photos ? spot.photos.length : 0;
        const isChecked = checkins[spot.id] || false;
        const thumbs = spot.photos && spot.photos.length > 0 ? `
                <div class="photo-thumbs">
                    ${spot.photos.slice(0,4).map(p => `
                        <div class="thumb">
                            <img src="${p.data}" alt="照片" />
                            <button class="remove" onclick="removeDayPhoto('${spot.id}','${p.id}')">✕</button>
                        </div>
                    `).join('')}
                    ${spot.photos.length > 4 ? `<div class="thumb" style="display:flex;align-items:center;justify-content:center;font-size:11px;color:#4a7ad8;">+${spot.photos.length-4}</div>` : ''}
                </div>
            ` : '';
        return `<div class="day-spot-item">
                <div class="spot-icon">${isChecked ? '✅' : '🐷'}</div>
                <div class="spot-info">
                    <div class="spot-name">${spot.name} ${isChecked ? '' : '<span style="font-size:14px;">🐷</span>'}</div>
                    <div class="spot-photos">📷 ${photoCount} 张照片</div>
                    ${thumbs}
                </div>
                <div class="spot-actions">
                    <button class="btn-sm primary" onclick="uploadDayPhoto('${spot.id}')">📤</button>
                    <button class="btn-sm" onclick="focusDaySpot('${spot.id}')">🔍</button>
                    <button class="btn-sm ${isChecked ? 'success' : ''}" onclick="toggleCheckin('${spot.id}')" style="${isChecked ? 'background:#4a9e7a;color:white;' : ''}">${isChecked ? '✅' : '🐷'}</button>
                    <button class="btn-sm danger" onclick="deleteDaySpot('${spot.id}')">🗑️</button>
                </div>
            </div>`;
    }).join('');
}

// ============================================================
//  地图（每日）
// ============================================================
function initDayMap(index) {
    if (typeof AMap === 'undefined') { setTimeout(() => initDayMap(index), 500); return; }
    const container = document.getElementById('dMap');
    if (mapInstance) { try { mapInstance.destroy(); } catch (e) {} mapInstance = null; mapMarkers = []; mapPolyline = null; }
    const daySpots = spots.filter(s => s.dayIndex === index);
    const center = daySpots.length > 0 ? [daySpots[0].lng, daySpots[0].lat] : [121.0, 38.5];
    const zoom = daySpots.length > 0 ? 11 : 8;
    mapInstance = new AMap.Map(container, { zoom, center, mapStyle: 'amap://styles/fresh', viewMode: '2D', resizeEnable: true });
    mapInstance.on('click', function(e) {
        const lng = e.lnglat.getLng();
        const lat = e.lnglat.getLat();
        const name = prompt('📍 输入地点名称 (可加 🐷)');
        if (name && name.trim()) { addSpotToDayInternal(name.trim(), lat, lng); }
    });
    renderDayMarkers(index);
    if (daySpots.length > 0) { setTimeout(() => { try { mapInstance.setFitView(mapMarkers); } catch (e) {} }, 300); }
}

function renderDayMarkers(index) {
    const daySpots = spots.filter(s => s.dayIndex === index);
    mapMarkers.forEach(m => { try { m.setMap(null); } catch (e) {} }); mapMarkers = [];
    if (mapPolyline) { try { mapPolyline.setMap(null); } catch (e) {}; mapPolyline = null; }
    if (daySpots.length === 0) return;
    const sorted = [...daySpots].sort((a, b) => a.id.localeCompare(b.id));
    sorted.forEach((spot, idx) => {
        const isChecked = checkins[spot.id] || false;
        const labelText = isChecked ? `✅ ${spot.name}` : `${idx+1}. ${spot.name} 🐷`;
        const marker = new AMap.Marker({
            position: [spot.lng, spot.lat],
            title: spot.name,
            label: { content: `<div style="background:${isChecked ? '#4a9e7a' : '#4a7ad8'};color:white;padding:2px 10px;border-radius:20px;font-size:10px;font-weight:600;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.12);">${labelText}</div>`, direction: 'top' }
        });
        marker.setMap(mapInstance);
        mapMarkers.push(marker);
    });
    if (sorted.length > 1) {
        const path = sorted.map(s => [s.lng, s.lat]);
        mapPolyline = new AMap.Polyline({ path, strokeColor: '#4a7ad8', strokeWeight: 4, strokeStyle: 'solid', lineJoin: 'round', lineCap: 'round', strokeOpacity: 0.7 });
        mapPolyline.setMap(mapInstance);
    }
}

function addSpotToDay() {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    const name = prompt('📍 输入地点名称');
    if (name && name.trim()) { addSpotToDayInternal(name.trim(), center.getLat(), center.getLng()); }
}

function addSpotToDayInternal(name, lat, lng) {
    const id = 's_' + Date.now();
    spots.push({ id, dayIndex: currentDayIndex, name, lat, lng, photos: [] });
    saveSpots();
    renderDaySpots(currentDayIndex);
    renderDayMarkers(currentDayIndex);
    setTimeout(() => { try { mapInstance.setFitView(mapMarkers); } catch (e) {} }, 300);
    updateAllStats();
}

function deleteDaySpot(id) {
    if (!confirm('删除这个地点？🐷')) return;
    spots = spots.filter(s => s.id !== id);
    delete checkins[id];
    saveSpots();
    saveCheckins();
    renderDaySpots(currentDayIndex);
    renderDayMarkers(currentDayIndex);
    updateAllStats();
}

function focusDaySpot(id) {
    const spot = spots.find(s => s.id === id);
    if (!spot || !mapInstance) return;
    mapInstance.setCenter([spot.lng, spot.lat]);
    mapInstance.setZoom(14);
}

function fitDaySpots() {
    if (!mapInstance || mapMarkers.length === 0) return;
    try { mapInstance.setFitView(mapMarkers); } catch (e) {}
}

function clearDaySpots() {
    const daySpots = spots.filter(s => s.dayIndex === currentDayIndex);
    if (daySpots.length === 0) return;
    if (!confirm(`清除 Day ${currentDayIndex+1} 所有地点？🐷`)) return;
    daySpots.forEach(s => { delete checkins[s.id]; });
    spots = spots.filter(s => s.dayIndex !== currentDayIndex);
    saveSpots();
    saveCheckins();
    renderDaySpots(currentDayIndex);
    renderDayMarkers(currentDayIndex);
    updateAllStats();
}

function addPigSpot() {
    if (!mapInstance) return;
    const center = mapInstance.getCenter();
    const pigNames = ['🐷 小猪观景台', '🐷 小猪休息站', '🐷 小猪拍照点', '🐷 小猪美食站'];
    const name = pigNames[Math.floor(Math.random() * pigNames.length)];
    addSpotToDayInternal(name, center.getLat(), center.getLng());
}

// ============================================================
//  照片操作
// ============================================================
function uploadDayPhoto(spotId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = function(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const spot = spots.find(s => s.id === spotId);
        if (!spot) return;
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const dataUrl = ev.target.result;
                if (!spot.photos) spot.photos = [];
                spot.photos.push({ id: 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4), data: dataUrl });
                saveSpots();
                renderDaySpots(currentDayIndex);
                updateAllStats();
            };
            reader.readAsDataURL(file);
        });
    };
    input.click();
}

function removeDayPhoto(spotId, photoId) {
    const spot = spots.find(s => s.id === spotId);
    if (!spot) return;
    spot.photos = spot.photos.filter(p => p.id !== photoId);
    saveSpots();
    renderDaySpots(currentDayIndex);
    updateAllStats();
}

// ============================================================
//  打卡
// ============================================================
function toggleCheckin(spotId) {
    if (checkins[spotId]) { delete checkins[spotId]; } else { checkins[spotId] = true; }
    saveCheckins();
    if (document.getElementById('page-day').classList.contains('active')) { renderDaySpots(currentDayIndex); }
    updateAllStats();
}

function checkinAll() { spots.forEach(s => { checkins[s.id] = true; }); saveCheckins(); updateAllStats(); if (document.getElementById('page-day').classList.contains('active')) { renderDaySpots(currentDayIndex); } }

function resetCheckins() { checkins = {}; saveCheckins(); updateAllStats(); if (document.getElementById('page-day').classList.contains('active')) { renderDaySpots(currentDayIndex); } }

function saveDayNote() {
    const text = document.getElementById('dayNote').value;
    if (text.trim()) { notes[currentDayIndex] = text.trim(); } else { delete notes[currentDayIndex]; }
    saveNotes();
}

// ============================================================
//  完整地图
// ============================================================
function initFullMap() {
    if (typeof AMap === 'undefined') { setTimeout(initFullMap, 500); return; }
    const container = document.getElementById('fullMapContainer');
    if (fullMapInstance) { try { fullMapInstance.destroy(); } catch (e) {} fullMapInstance = null; fullMapMarkers = []; fullMapPolyline = null; }
    const center = spots.length > 0 ? [spots[0].lng, spots[0].lat] : [121.0, 38.5];
    fullMapInstance = new AMap.Map(container, { zoom: 8, center, mapStyle: 'amap://styles/fresh', viewMode: '2D', resizeEnable: true });
    fullMapInstance.on('click', function(e) {
        const lng = e.lnglat.getLng();
        const lat = e.lnglat.getLat();
        const name = prompt('📍 输入地点名称');
        if (name && name.trim()) {
            const id = 's_' + Date.now();
            spots.push({ id, dayIndex: 0, name: name.trim(), lat, lng, photos: [] });
            saveSpots();
            renderFullMapSpotsList();
            initFullMap();
            updateAllStats();
        }
    });
    renderFullMapMarkers();
    if (spots.length > 1) {
        const path = spots.map(s => [s.lng, s.lat]);
        fullMapPolyline = new AMap.Polyline({ path, strokeColor: '#4a7ad8', strokeWeight: 4, strokeStyle: 'solid', lineJoin: 'round', lineCap: 'round', strokeOpacity: 0.7 });
        fullMapPolyline.setMap(fullMapInstance);
    }
    if (spots.length > 0) { setTimeout(() => { try { fullMapInstance.setFitView(fullMapMarkers); } catch (e) {} }, 300); }
}

function renderFullMapMarkers() {
    fullMapMarkers.forEach(m => { try { m.setMap(null); } catch (e) {} }); fullMapMarkers = [];
    spots.forEach((spot, idx) => {
        const isChecked = checkins[spot.id] || false;
        const marker = new AMap.Marker({
            position: [spot.lng, spot.lat],
            title: spot.name,
            label: { content: `<div style="background:${isChecked ? '#4a9e7a' : '#4a7ad8'};color:white;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:600;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.12);">${idx+1}. ${spot.name}</div>`, direction: 'top' }
        });
        marker.setMap(fullMapInstance);
        fullMapMarkers.push(marker);
    });
}

function fitAllSpots() {
    if (!fullMapInstance || fullMapMarkers.length === 0) return;
    try { fullMapInstance.setFitView(fullMapMarkers); } catch (e) {}
}

function addSpotFromMap() {
    if (!fullMapInstance) return;
    const center = fullMapInstance.getCenter();
    const name = prompt('📍 输入地点名称');
    if (name && name.trim()) {
        const id = 's_' + Date.now();
        spots.push({ id, dayIndex: 0, name: name.trim(), lat: center.getLat(), lng: center.getLng(), photos: [] });
        saveSpots();
        renderFullMapSpotsList();
        initFullMap();
        updateAllStats();
    }
}

function clearAllSpots() {
    if (spots.length === 0) return;
    if (!confirm('清除所有地点？照片也会被删除 🐷')) return;
    spots = [];
    checkins = {};
    saveSpots();
    saveCheckins();
    renderFullMapSpotsList();
    initFullMap();
    updateAllStats();
}

function renderFullMapSpotsList() {
    const container = document.getElementById('fullMapSpotsList');
    if (spots.length === 0) {
        container.innerHTML = `<div class="empty-state" style="padding:10px 0;">🐷 还没有地点，点击地图添加</div>`;
        return;
    }
    container.innerHTML = spots.map((spot, idx) =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:1px solid #e8edf5;font-size:12px;flex-wrap:wrap;gap:4px;">
                <span>${idx+1}. ${spot.name} ${checkins[spot.id] ? '✅' : '🐷'}</span>
                <span style="font-size:10px;color:#7a8a9a;">📷 ${spot.photos ? spot.photos.length : 0}</span>
            </div>`
    ).join('');
}

// ============================================================
//  设置
// ============================================================
function exportData() {
    const data = {
        plan: currentPlan,
        spots: spots,
        checkins: checkins,
        notes: notes,
        travelInfo: travelInfo,
        chatHistory: chatHistory,
        exportTime: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `travel_data_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.spots) spots = data.spots;
                if (data.checkins) checkins = data.checkins;
                if (data.notes) notes = data.notes;
                if (data.travelInfo) travelInfo = data.travelInfo;
                if (data.chatHistory) chatHistory = data.chatHistory;
                if (data.plan) currentPlan = data.plan;
                saveSpots();
                saveCheckins();
                saveNotes();
                localStorage.setItem(TRAVEL_INFO_KEY, JSON.stringify(travelInfo));
                localStorage.setItem('chat_history', JSON.stringify(chatHistory));
                localStorage.setItem(PLAN_KEY, currentPlan);
                renderHome();
                if (document.getElementById('page-map').classList.contains('active')) { initFullMap(); }
                alert('🐷 导入成功！');
            } catch (err) {
                alert('导入失败，请检查文件格式 🐷');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (!confirm('⚠️ 确定清空所有数据？包括地点、照片、聊天记录，不可恢复！')) return;
    if (!confirm('🐷 再确认一次：真的要清空吗？')) return;
    spots = [];
    checkins = {};
    notes = {};
    chatHistory = [];
    travelInfo = { train1: '', ferry: '', train2: '', hotelInfo: '', otherNote: '' };
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CHECKINS_KEY);
    localStorage.removeItem(NOTES_KEY);
    localStorage.removeItem(TRAVEL_INFO_KEY);
    localStorage.removeItem('chat_history');
    saveSpots();
    saveCheckins();
    saveNotes();
    renderHome();
    if (document.getElementById('page-map').classList.contains('active')) { initFullMap(); }
    alert('🐷 已清空所有数据');
}

// ============================================================
//  其他
// ============================================================
function refreshWeather() {
    if (typeof AMap === 'undefined' || !AMap.Weather) {
        alert('天气插件加载中，请稍后重试 🐷');
        return;
    }
    const weather = new AMap.Weather();
    weather.getLive('大连', function(err, data) { if (err) { console.warn(err); return; } });
}

function switchPlan(planKey) {
    currentPlan = planKey;
    document.querySelectorAll('.btn-plan').forEach(b => b.classList.toggle('active', b.dataset.plan === planKey));
    savePlan();
    renderHome();
    document.getElementById('planDisplay').textContent = PLANS[currentPlan].name;
    if (document.getElementById('page-day').classList.contains('active')) {
        renderDayDetail(currentDayIndex);
        setTimeout(() => initDayMap(currentDayIndex), 400);
    }
}

// ============================================================
//  初始化
// ============================================================
loadPlan();
loadSpots();
loadCheckins();
loadNotes();
loadTravelInfo();
loadChatHistory();
loadModelPreference();
renderHome();
updateCountdown();

// 暴露全局函数
window.switchPage = switchPage;
window.goHome = goHome;
window.openDay = openDay;
window.switchPlan = switchPlan;
window.refreshWeather = refreshWeather;
window.exportData = exportData;
window.importData = importData;
window.clearAllData = clearAllData;
window.addSpotToDay = addSpotToDay;
window.fitDaySpots = fitDaySpots;
window.clearDaySpots = clearDaySpots;
window.deleteDaySpot = deleteDaySpot;
window.focusDaySpot = focusDaySpot;
window.uploadDayPhoto = uploadDayPhoto;
window.removeDayPhoto = removeDayPhoto;
window.toggleCheckin = toggleCheckin;
window.checkinAll = checkinAll;
window.resetCheckins = resetCheckins;
window.saveDayNote = saveDayNote;
window.addPigSpot = addPigSpot;
window.saveTravelInfo = saveTravelInfo;
window.loadTravelInfo = loadTravelInfo;
window.askAI = askAI;
window.clearAI = clearAI;
window.fitAllSpots = fitAllSpots;
window.addSpotFromMap = addSpotFromMap;
window.clearAllSpots = clearAllSpots;
window.saveModelPreference = saveModelPreference;
window.syncModelSelect = syncModelSelect;

console.log('🐷 旅行足迹看板已加载！');
console.log(`📍 共 ${spots.length} 个地点，📷 ${spots.reduce((s, sp) => s + (sp.photos ? sp.photos.length : 0), 0)} 张照片`);
console.log(`💬 ${chatHistory.length} 条聊天记录`);
console.log(`🧠 当前模型: ${selectedModel}`);
