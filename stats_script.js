document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    setupModal();
    setupSearch();
    setupLoadMore();
    setupMobileMenu();
});

function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    
    if (toggle && menu) {
        const icon = toggle.querySelector('i');
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
            
            if (menu.classList.contains('active')) {
                if(icon) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times');
                }
            } else {
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
        
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                document.body.classList.remove('menu-open');
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }
}

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
    renderCard('lb-deaths', topDeaths, p => p.stats.deaths);
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
    document.getElementById('modal-name').innerText = player.name;
    document.getElementById('modal-uuid').innerText = player.uuid;
    const avatar = document.getElementById('modal-avatar');
    avatar.src = player.avatar;
    avatar.onerror = () => { avatar.src = `https://crafatar.com/avatars/${player.uuid}?size=64&overlay`; };

    document.getElementById('modal-walk').innerText = player.stats.walk_fmt;
    document.getElementById('modal-placed').innerText = player.stats.placed.toLocaleString();
    document.getElementById('modal-mined').innerText = player.stats.mined.toLocaleString();
    document.getElementById('modal-deaths').innerText = player.stats.deaths;

    modal.style.display = "flex";
}
