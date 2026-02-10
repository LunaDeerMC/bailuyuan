function copyIp() {
    const ipText = document.getElementById('server-ip').innerText;
    const tooltip = document.getElementById('copy-tooltip');

    navigator.clipboard.writeText(ipText).then(() => {
        tooltip.innerText = "已复制!";
        tooltip.classList.add('show');

        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => {
                tooltip.innerText = "点击复制 IP";
            }, 200); // Wait for fade out
        }, 2000);
    }).catch(err => {
        console.error('无法复制文本: ', err);
        tooltip.innerText = "复制失败";
        tooltip.classList.add('show');
        setTimeout(() => {
            tooltip.classList.remove('show');
        }, 2000);
    });
}

// Sponsors Logic
document.addEventListener('DOMContentLoaded', () => {
    fetchSponsors();
    fetchCrowdfunding();
    setupModal();
    fetchServerStatus();
    startRuntimeTimer();
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

function startRuntimeTimer() {
    const startTime = new Date("2021-09-14T09:57:59").getTime();

    function update() {
        const now = new Date().getTime();
        const diff = now - startTime;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        const daysEl = document.getElementById("runtime-days");
        const hoursEl = document.getElementById("runtime-hours");
        const minutesEl = document.getElementById("runtime-minutes");
        const secondsEl = document.getElementById("runtime-seconds");

        if (daysEl) daysEl.innerText = days;
        if (hoursEl) hoursEl.innerText = hours;
        if (minutesEl) minutesEl.innerText = minutes;
        if (secondsEl) secondsEl.innerText = seconds;
    }

    update();
    setInterval(update, 1000);
}

async function fetchServerStatus() {
    const countElement = document.getElementById('online-count');
    const listElement = document.getElementById('players-list');
    const dotElement = document.querySelector('.status-dot');

    try {
        const response = await fetch('https://api.mcstatus.io/v2/status/java/mcpure.lunadeer.cn');
        const data = await response.json();

        if (data.online) {
            countElement.innerText = `在线人数: ${data.players.online} / ${data.players.max}`;
            dotElement.classList.remove('offline');
            
            if (data.players.list && data.players.list.length > 0) {
                listElement.innerHTML = data.players.list.map(player => `
                    <div class="player-item">
                        <img src="https://minotar.net/avatar/${player.name_raw}/16" class="player-avatar" onerror="this.style.display='none'">
                        <span>${player.name_raw}</span>
                    </div>
                `).join('');
            } else {
                listElement.innerHTML = '<div class="player-item" style="justify-content: center; color: #86868b;">暂无玩家在线</div>';
            }
        } else {
            countElement.innerText = '服务器离线';
            dotElement.classList.add('offline');
            listElement.innerHTML = '<div class="player-item" style="justify-content: center; color: #ff3b30;">服务器离线</div>';
        }
    } catch (error) {
        console.error('Error fetching server status:', error);
        countElement.innerText = '无法获取状态';
        dotElement.classList.add('offline');
        listElement.innerHTML = '<div class="player-item" style="justify-content: center; color: #ff3b30;">获取失败</div>';
    }
}

async function fetchCrowdfunding() {
    try {
        console.log('Fetching crowdfunding data...');
        const response = await fetch('fund_progress.txt');
        if (!response.ok) {
            console.error('Failed to fetch fund_progress.txt:', response.status, response.statusText);
            return; 
        }
        
        const text = await response.text();
        console.log('Crowdfunding data received:', text);
        const lines = text.trim().split('\n');
        
        const funds = [];
        lines.forEach(line => {
            // Replace Chinese comma with English comma just in case
            const normalizedLine = line.replace(/，/g, ',');
            const parts = normalizedLine.split(',');
            if (parts.length >= 3) {
                const name = parts[0].trim();
                const current = parseFloat(parts[1].trim());
                const target = parseFloat(parts[2].trim());
                
                if (name && !isNaN(current) && !isNaN(target)) {
                    funds.push({ name, current, target });
                }
            }
        });
        console.log('Parsed funds:', funds);

        if (funds.length > 0) {
            renderCrowdfunding(funds);
            const section = document.getElementById('crowdfunding-section');
            if (section) {
                section.style.display = 'block';
                console.log('Crowdfunding section displayed');
            } else {
                console.error('Crowdfunding section element not found');
            }
        } else {
            console.warn('No valid crowdfunding data found');
        }

    } catch (error) {
        console.error('Error loading crowdfunding data:', error);
    }
}

function renderCrowdfunding(funds) {
    const container = document.getElementById('crowdfunding-grid');
    
    container.innerHTML = funds.map(fund => {
        const percentage = Math.min(100, Math.max(0, (fund.current / fund.target) * 100));
        return `
        <div class="fund-card">
            <div class="fund-header">
                <div class="fund-title">${fund.name}</div>
                <div class="fund-stats">
                    <span>¥${fund.current}</span> / ¥${fund.target}
                </div>
            </div>
            <div class="progress-bar-bg">
                <div class="progress-bar-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="fund-percentage">${percentage.toFixed(1)}%</div>
        </div>
    `;
    }).join('');
}

async function fetchSponsors() {
    try {
        const response = await fetch('sponsors.txt');
        const text = await response.text();
        const lines = text.trim().split('\n');
        
        const sponsors = [];
        const userTotals = {};

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 3) {
                const name = parts[0].trim();
                const project = parts[1].trim();
                const amountStr = parts[2].trim().replace('￥', '');
                const amount = parseFloat(amountStr);
                const date = parts[3] ? parts[3].trim() : '';

                if (!isNaN(amount)) {
                    sponsors.push({ name, project, amount, date });

                    if (userTotals[name]) {
                        userTotals[name] += amount;
                    } else {
                        userTotals[name] = amount;
                    }
                }
            }
        });

        // Sort users by total amount for Top 3
        const sortedUsers = Object.keys(userTotals).map(name => ({
            name,
            total: userTotals[name]
        })).sort((a, b) => b.total - a.total);

        renderTopSponsors(sortedUsers.slice(0, 3));
        renderSponsorsTable(sponsors);

    } catch (error) {
        console.error('Error loading sponsors:', error);
    }
}

function renderTopSponsors(topUsers) {
    const container = document.getElementById('top-sponsors');
    const medals = ['🥇', '🥈', '🥉'];
    
    container.innerHTML = topUsers.map((user, index) => `
        <div class="sponsor-card">
            <div class="sponsor-rank">${medals[index]}</div>
            <div class="sponsor-name">${user.name}</div>
            <div class="sponsor-amount">¥${user.total.toFixed(2)}</div>
        </div>
    `).join('');
}

function renderSponsorsTable(sponsors) {
    const tbody = document.querySelector('#sponsors-table tbody');
    // Sort by date descending (newest first) or keep original order? 
    // Usually original order in file is chronological. Let's reverse it to show newest first.
    const reversedSponsors = [...sponsors].reverse();

    tbody.innerHTML = reversedSponsors.map(s => `
        <tr>
            <td>${s.name}</td>
            <td>${s.project}</td>
            <td>¥${s.amount.toFixed(2)}</td>
            <td>${s.date}</td>
        </tr>
    `).join('');
}

function setupModal() {
    const modal = document.getElementById('sponsors-modal');
    const btn = document.getElementById('view-sponsors-btn');
    const span = document.getElementsByClassName('close-modal')[0];

    btn.onclick = function() {
        modal.style.display = "flex";
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}
