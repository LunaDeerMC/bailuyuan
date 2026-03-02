let allSponsors = [];
let grandTotal = 0;
let filterState = { search: '', project: 'all' };

document.addEventListener('DOMContentLoaded', () => {
    try {
        setupUI();
    } catch (e) {
        console.error("UI Setup failed", e);
    }
    fetchSponsorsData();
    setupListeners();
});

function setupUI() {
    // Mobile menu toggle handled by components.js

    // Modal Logic
    const modal = document.getElementById('sponsor-modal');
    const btn = document.getElementById('open-sponsor-modal');
    const span = document.querySelector('.close-modal');
    const desktopView = document.getElementById('desktop-qr-view');
    const mobileView = document.getElementById('mobile-btn-view');

    // Detect Mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (isMobile) {
        if(desktopView) desktopView.style.display = 'none';
        if(mobileView) mobileView.style.display = 'block';
    } else {
        if(desktopView) desktopView.style.display = 'block';
        if(mobileView) mobileView.style.display = 'none';
    }

    if (modal && btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = "flex";
            // Trigger reflow
            void modal.offsetWidth; 
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
        });
    }

    if (span && modal) {
        span.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = "none";
            }, 300);
        });
    }

    window.addEventListener('click', (event) => {
        if (modal && event.target == modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = "none";
            }, 300);
        }
    });
}


function setupListeners() {
    const searchInput = document.getElementById('sponsor-search');
    const filterContainer = document.getElementById('project-filters');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterState.search = e.target.value.toLowerCase().trim();
            applyFilters();
        });
    }

    if (filterContainer) {
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tag')) {
                // Update active class
                document.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update filter state
                filterState.project = e.target.dataset.project;
                applyFilters();
            }
        });
    }
}

async function fetchSponsorsData() {
    try {
        const response = await fetch('data/sponsors.txt');
        if (!response.ok) {
            throw new Error('Failed to fetch data/sponsors.txt');
        }
        const text = await response.text();
        const sponsors = DataUtils.parseSponsorsText(text);
        const projects = new Set();
        grandTotal = 0;

        sponsors.forEach(item => {
            grandTotal += item.amount;
            projects.add(item.project);
        });

        allSponsors = [...sponsors].reverse(); // Start with newest

        // Animate Total
        animateValue(grandTotal);

        // Render everything
        renderFilters(Array.from(projects));
        applyFilters(); // Renders the grid initially

    } catch (error) {
        console.error('Error loading sponsors:', error);
        const grid = document.getElementById('donation-list');
        if(grid) grid.innerHTML = '<div class="sponsor-load-error">加载数据失败，请刷新重试</div>';
    }
}

function animateValue(end) {
    const obj = document.getElementById('total-amount-display');
    if (!obj) return;
    
    // Simple count up
    let startTimestamp = null;
    const duration = 2000;
    const start = 0;

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Easing out Quart
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        const current = Math.floor(easeProgress * (end - start) + start);
        
        obj.innerHTML = `¥${current.toLocaleString('en-US')}`;
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = `¥${end.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        }
    };
    window.requestAnimationFrame(step);
}

function renderFilters(projects) {
    const container = document.getElementById('project-filters');
    if (!container) return;

    // Remove existing project buttons, keep "All"
    const existingButtons = container.querySelectorAll('button:not([data-project="all"])');
    existingButtons.forEach(btn => btn.remove());
    
    // Add project buttons
    projects.forEach(proj => {
        if (!proj) return;
        const btn = document.createElement('button');
        btn.className = 'filter-tag';
        btn.textContent = proj;
        btn.dataset.project = proj;
        container.appendChild(btn);
    });
}

function applyFilters() {
    const { search, project } = filterState;
    const grid = document.getElementById('donation-list');
    const noResults = document.getElementById('no-results');
    
    if (!grid) return;
    
    const filtered = allSponsors.filter(item => {
        const matchesProject = project === 'all' || item.project === project;
        const matchesSearch = item.name.toLowerCase().includes(search);
        return matchesProject && matchesSearch;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
        if (noResults) noResults.style.display = 'block';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';

    filtered.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'donation-card';
        // Max delay 1s to prevent long waits on huge lists
        const delay = Math.min(index * 0.05, 1);
        card.style.animationDelay = `${delay}s`;

        const avatarUrl = `https://minotar.net/helm/${item.name}/64.png`;

        card.innerHTML = `
            <div class="donation-header">
                <div class="donor-info">
                    <img src="${avatarUrl}" class="mini-avatar" onerror="this.src='https://minotar.net/helm/MHF_Steve/64.png'" alt="${item.name}">
                    <div class="donor-name">${item.name}</div>
                </div>
                <div class="donation-amount">¥${item.amount}</div>
            </div>
            
            <div class="donation-card-body">
                <div class="donation-purpose">${item.project}</div>
                <div class="donation-date">
                    <i class="far fa-clock donation-date-icon"></i>${item.date}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

