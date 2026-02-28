document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    setupModal();
    setupSearch();
    setupLoadMore();
});



let allPlayers = [];
let displayedPlayers = [];
let currentPage = 1;
const pageSize = 24;

async function fetchStats() {
    try {
        const response = await fetch('stats/summary.json');
        if (!response.ok) throw new Error('Failed to load stats');
        
        const data = await response.json();
        allPlayers = data.players;
        
        // Hide loading
        document.getElementById('loading-indicator').style.display = 'none';
        
        // Render things
        renderLeaderboards();
        
        // Initial Grid Render
        displayedPlayers = allPlayers; // Start with all
        renderPlayerGrid(true); // reset
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading-indicator').innerText = "加载数据失败，请稍后重试。";
    }
}

function renderLeaderboards() {
    // Helper to sort and slice
    const getTop = (key, subKey) => {
        return [...allPlayers]
            .sort((a, b) => {
                let valA = subKey ? a.stats[key] : a.stats[key]; // if structure allows direct access
                let valB = subKey ? b.stats[key] : b.stats[key];
                
                // Special case for walk which has raw sorting value
                if (key === 'walk_fmt') valA = a.stats.walk_raw;
                if (key === 'walk_fmt') valB = b.stats.walk_raw;
                
                // Special case for play_time which has raw sorting value
                if (key === 'play_time_fmt') valA = a.stats.play_time_raw;
                if (key === 'play_time_fmt') valB = b.stats.play_time_raw;
                
                return valB - valA;
            })
            .slice(0, 4); // Top 4
    };

    const renderCard = (elementId, players, valueFormatter) => {
        const container = document.getElementById(elementId);
        if (!players || players.length === 0) {
            container.innerHTML = '<div class="lb-top-player">暂无数据</div>';
            return;
        }

        const top1 = players[0];
        let html = `
            <div class="lb-top-player">
                <img src="${top1.avatar}" onerror="this.src='https://crafatar.com/avatars/${top1.uuid}?size=64&overlay'">
                <div style="font-weight:700; margin-bottom:4px;">${top1.name}</div>
                <div class="lb-top-data">${valueFormatter(top1)}</div>
            </div>
            <div class="lb-list">
        `;

        for (let i = 1; i < players.length; i++) {
            const p = players[i];
            html += `
                <div class="lb-item">
                    <div style="display:flex; alignItems:center;">
                        <span class="lb-rank">${i+1}</span>
                        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100px;">${p.name}</span>
                    </div>
                    <span>${valueFormatter(p)}</span>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    };

    // 1. Walk (stats.walk_raw)
    const topWalkers = getTop('walk_fmt'); // uses walk_raw internally
    renderCard('lb-walk', topWalkers, p => p.stats.walk_fmt);

    // 2. Placed (stats.placed)
    const topPlacers = getTop('placed');
    renderCard('lb-placed', topPlacers, p => p.stats.placed.toLocaleString());

    // 3. Mined (stats.mined)
    const topMiners = getTop('mined');
    renderCard('lb-mined', topMiners, p => p.stats.mined.toLocaleString());

    // 4. Deaths (stats.deaths)
    const topDeaths = getTop('deaths');
    renderCard('lb-deaths', topDeaths, p => p.stats.deaths.toLocaleString());

    // 5. Play Time (stats.play_time_raw)
    const topPlayTime = getTop('play_time_fmt'); // uses play_time_raw internally
    renderCard('lb-playtime', topPlayTime, p => p.stats.play_time_fmt);

    // 6. Kills (stats.kills)
    const topKills = getTop('kills');
    renderCard('lb-kills', topKills, p => p.stats.kills.toLocaleString());
}

function renderPlayerGrid(reset = false) {
    const grid = document.getElementById('players-grid');
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    if (reset) {
        grid.innerHTML = '';
        currentPage = 1;
    }

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const items = displayedPlayers.slice(start, end);

    items.forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.onclick = () => openModal(p);
        
        card.innerHTML = `
            <img src="${p.avatar}" onerror="this.src='https://crafatar.com/avatars/${p.uuid}?size=64&overlay'">
            <h3>${p.name}</h3>
            <!-- <div class="p-uuid">${p.uuid.substring(0,8)}...</div> -->
        `;
        grid.appendChild(card);
    });

    if (end >= displayedPlayers.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-block';
    }
}

function setupLoadMore() {
    document.getElementById('load-more-btn').addEventListener('click', () => {
        currentPage++;
        renderPlayerGrid(false);
    });
}

function setupSearch() {
    const input = document.getElementById('player-search');
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            displayedPlayers = allPlayers;
        } else {
            displayedPlayers = allPlayers.filter(p => 
                p.name.toLowerCase().includes(term) || 
                p.uuid.toLowerCase().includes(term)
            );
        }
        renderPlayerGrid(true);
    });
}

// Modal Logic
const modal = document.getElementById("player-modal");
const span = document.getElementsByClassName("close-modal")[0];

function setupModal() {
    span.onclick = function() {
        modal.style.display = "none";
    }
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

function openModal(player) {
    const modal = document.getElementById("player-modal");
    
    // Top Section: Identity
    document.getElementById('modal-name').innerText = player.name;
    document.getElementById('modal-uuid').innerText = player.uuid;
    const avatar = document.getElementById('modal-avatar');
    avatar.src = player.avatar;
    avatar.onerror = () => { avatar.src = `https://crafatar.com/avatars/${player.uuid}?size=64&overlay`; };

    // Top Section: Summary Stats
    // These are from summary.json which is already formatted
    document.getElementById('modal-walk').innerText = player.stats.walk_fmt;
    document.getElementById('modal-placed').innerText = player.stats.placed.toLocaleString();
    document.getElementById('modal-mined').innerText = player.stats.mined.toLocaleString();
    document.getElementById('modal-deaths').innerText = player.stats.deaths;
    document.getElementById('modal-kills').innerText = player.stats.kills;
    document.getElementById('modal-playtime').innerText = player.stats.play_time_fmt;
    
    // Bottom Section: Reset and Load Details
    const accordion = document.getElementById('stats-accordion');
    accordion.innerHTML = ''; 
    document.getElementById('loading-details').style.display = 'block';
    document.getElementById('loading-details').innerText = '正在加载详细数据...';

    modal.style.display = "flex";
    
    // Load existing details
    loadPlayerDetails(player.uuid);
}

async function loadPlayerDetails(uuid) {
    const accordion = document.getElementById('stats-accordion');
    const loading = document.getElementById('loading-details');
    
    try {
        const response = await fetch(`stats/${uuid}.json`);
        if (!response.ok) throw new Error('Stats file not found');
        
        const data = await response.json();
        
        if (!data.stats) {
            loading.innerText = '暂无详细统计数据。';
            return;
        }

        loading.style.display = 'none';
        renderDetailsAccordion(data.stats);

    } catch (error) {
        console.error('Error loading details:', error);
        loading.innerText = '无法加载详细数据。';
    }
}

function renderDetailsAccordion(statsObj) {
    const accordion = document.getElementById('stats-accordion');
    
    // Define category mappings for better display names
    const categoryMap = {
        'minecraft:custom': { name: '通用统计', icon: 'fa-chart-bar' },
        'minecraft:mined': { name: '挖掘统计', icon: 'fa-hammer' },
        'minecraft:used': { name: '使用统计', icon: 'fa-hand-paper' },
        'minecraft:crafted': { name: '合成统计', icon: 'fa-tools' },
        'minecraft:broken': { name: '破坏统计', icon: 'fa-heart-broken' },
        'minecraft:picked_up': { name: '拾取统计', icon: 'fa-box-open' },
        'minecraft:dropped': { name: '丢弃统计', icon: 'fa-trash' },
        'minecraft:killed': { name: '击杀统计', icon: 'fa-crosshairs' },
        'minecraft:killed_by': { name: '死亡统计', icon: 'fa-skull' }
    };

    // Helper to format keys (minecraft:stone -> Stone)
    const formatKey = (key) => {
        if (key.includes(':')) key = key.split(':')[1];
        return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    // Sort categories to put 'custom' first, then others alphabetically
    const sortedKeys = Object.keys(statsObj).sort((a, b) => {
        if (a === 'minecraft:custom') return -1;
        if (b === 'minecraft:custom') return 1;
        return a.localeCompare(b);
    });

    sortedKeys.forEach(catKey => {
        const subStats = statsObj[catKey];
        if (Object.keys(subStats).length === 0) return;

        const catInfo = categoryMap[catKey] || { name: formatKey(catKey), icon: 'fa-folder' };
        
        // Create Accordion Item
        const item = document.createElement('div');
        item.className = 'accordion-item';
        
        // Header
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <span><i class="fas ${catInfo.icon} icon"></i> ${catInfo.name}</span>
            <i class="fas fa-chevron-down arrow"></i>
        `;
        
        // Content
        const content = document.createElement('div');
        content.className = 'accordion-content';
        
        // Grid for stats
        const grid = document.createElement('div');
        grid.className = 'detail-stats-grid';
        
        // Sort sub-items by value descending
        const subItems = Object.entries(subStats).sort((a, b) => b[1] - a[1]);
        
        subItems.forEach(([k, v]) => {
            let label = formatKey(k);
            let val = v.toLocaleString();
            
            // Special formatting for time/distance in 'custom'
            if (catKey === 'minecraft:custom') {
                if (k.includes('time') || k.includes('minute')) {
                     // ticks to hours/min? 
                     // Assuming 'play_time' is ticks (1/20s)
                     if (k.includes('play_time') || k.includes('time_since')) {
                        const sec = v / 20;
                        if (sec > 3600) val = (sec/3600).toFixed(1) + ' h';
                        else if (sec > 60) val = (sec/60).toFixed(1) + ' m';
                        else val = sec.toFixed(0) + ' s';
                     }
                }
                if (k.includes('cmt') || k.includes('one_cm')) { // one_cm
                     const m = v / 100;
                     if (m > 1000) val = (m/1000).toFixed(2) + ' km';
                     else val = m.toFixed(1) + ' m';
                }
            }

            const statDiv = document.createElement('div');
            statDiv.className = 'detail-stat-item';
            statDiv.innerHTML = `
                <span class="detail-stat-label" title="${label}">${label}</span>
                <span class="detail-stat-value">${val}</span>
            `;
            grid.appendChild(statDiv);
        });

        content.appendChild(grid);
        item.appendChild(header);
        item.appendChild(content);
        accordion.appendChild(item);

        // Click Event
        header.addEventListener('click', () => {
            const isActive = header.classList.contains('active');
            
            // Close all others? Optional. Let's keep multiple openable.
            // But if we want accordion behavior:
            // document.querySelectorAll('.accordion-header').forEach(h => {
            //    h.classList.remove('active');
            //    h.nextElementSibling.classList.remove('show');
            // });

            if (!isActive) {
                header.classList.add('active');
                content.classList.add('show');
            } else {
                header.classList.remove('active');
                content.classList.remove('show');
            }
        });
    });
}
