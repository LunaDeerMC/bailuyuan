
const Components = {
    navbarHTML: `
    <nav class="navbar">
        <div class="nav-content">
            <button class="mobile-toggle" id="mobile-toggle" aria-label="菜单">
                <i class="fas fa-bars"></i>
            </button>
            <div class="logo">
                <a href="/">
                    <img src="https://img.lunadeer.cn/i/2024/04/22/6625ce6c8ddc1.png" alt="白鹿原 Minecraft 服务器 Logo">
                </a>
            </div>
            <div class="nav-links desktop-only">
                <a href="/doc.html">文档</a>
                <a href="/map.html">地图</a>
                <a href="/facilities.html">设施</a>
                <a href="/towns.html">城镇</a>
                <a href="/announcements.html">公告</a>
                <a href="/photo.html">相册</a>
                <a href="/stats.html">数据</a>
                <a href="/sponsor.html">赞助</a>
                <a href="https://qm.qq.com/q/9izlHDoef6" target="_blank" rel="noopener noreferrer">群聊</a>
            </div>
            <div class="nav-cta-container">
                <a href="join.html" class="nav-cta">加入游戏</a>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobile-menu">
        <div class="mobile-menu-links">
            <a href="/doc.html">文档</a>
            <a href="/map.html">地图</a>
            <a href="/facilities.html">设施</a>
            <a href="/towns.html">城镇</a>
            <a href="/announcements.html">公告</a>
            <a href="/photo.html">相册</a>
            <a href="/stats.html">数据</a>
            <a href="/sponsor.html">赞助</a>
            <a href="https://qm.qq.com/q/9izlHDoef6" target="_blank" rel="noopener noreferrer">群聊</a>
            <a href="join.html">加入游戏</a>
        </div>
    </div>
    `,
    
    footerHTML: `
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-logo">白鹿原</div>
                <p>&copy; 2026 白鹿原 Minecraft 服务器.</p>
            </div>
        </div>
    </footer>
    `,

    initPageHero: function() {
        const heroContainer = document.getElementById('hero-component');
        if (heroContainer) {
            const title = heroContainer.dataset.title || '';
            const subtitle = heroContainer.dataset.subtitle || '';
            const extraClass = heroContainer.dataset.class || '';
            heroContainer.className = `hero page-hero ${extraClass}`;
            heroContainer.innerHTML = `
                <div class="hero-overlay"></div>
                <div class="hero-content">
                    <h1 class="hero-title">${title}</h1>
                    <p class="hero-subtitle">${subtitle}</p>
                </div>`;
        }
    },

    init: function() {
        // Inject Navbar
        const navContainer = document.getElementById('navbar-component');
        if (navContainer) {
            navContainer.innerHTML = this.navbarHTML;
        }

        // Inject Page Hero
        this.initPageHero();

        // Inject Footer
        const footerContainer = document.getElementById('footer-component');
        if (footerContainer) {
            footerContainer.innerHTML = this.footerHTML;
        }

        // Setup Mobile Menu Logic
        this.setupMobileMenu();
        
        // Highlight current page
        this.highlightCurrentPage();
    },

    setupMobileMenu: function() {
        const toggle = document.getElementById('mobile-toggle');
        const menu = document.getElementById('mobile-menu');
        
        if (toggle && menu) {
            const icon = toggle.querySelector('i');
            // Remove old listeners if any to avoid duplicates? 
            // Since we just injected the HTML, there are no listeners.
            
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
    },
    
    highlightCurrentPage: function() {
        const currentPath = window.location.pathname;
        const links = document.querySelectorAll('.nav-links a, .mobile-menu-links a');
        
        links.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active'); // You might need to add CSS for .active
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Components.init();
});
