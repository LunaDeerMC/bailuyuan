document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentStep = 1;
    let selectedDevice = null;
    const totalSteps = 4;

    // Elements
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    // Updated selector for new sidebar structure
    const stepIndicators = document.querySelectorAll('.progress-step');
    const stepContents = document.querySelectorAll('.step-content');
    const conventionContent = document.getElementById('convention-content');
    
    if (!conventionContent) {
        console.error('Critical Error: Element #convention-content not found in DOM');
        return;
    }

    const agreeCheckbox = document.getElementById('agree-checkbox');
    const deviceCards = document.querySelectorAll('.device-card');
    const recommendationSection = document.getElementById('launcher-recommendation');
    const recommendationContent = document.getElementById('recommendation-content');
    const tutorialContent = document.getElementById('tutorial-content');
    const step4Buttons = document.getElementById('step4-buttons');
    const mainWizardActions = document.querySelector('.wizard-actions');

    console.log('DOM Elements loaded. Step contents found:', stepContents.length);
    
    // Fallback if marked is not loading correctly
    if (typeof marked === 'undefined') {
         console.warn("Marked not defined globally, checking for window.marked");
         if (window.marked) {
             console.log("Found window.marked");
             // Assign to local variable if needed or just use window.marked
         }
    }

    // --- Step 1: Convention Loading ---
    console.log('Fetching convention from data/convention.md ...');
    fetch('data/convention.md')
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.text();
        })
        .then(markdown => {
            console.log('Convention loaded, length:', markdown.length);
            
            let parser = null;
            if (typeof marked !== 'undefined') {
                if (typeof marked.parse === 'function') parser = marked.parse;
                else if (typeof marked === 'function') parser = marked;
            } else if (window.marked) {
                if (typeof window.marked.parse === 'function') parser = window.marked.parse;
                else if (typeof window.marked === 'function') parser = window.marked;
            }

            if (parser) {
                try {
                    const result = parser(markdown);
                    if (result instanceof Promise) {
                        result.then(html => conventionContent.innerHTML = html);
                    } else {
                        conventionContent.innerHTML = result;
                    }
                } catch (e) {
                    console.error('Parse error:', e);
                    conventionContent.innerHTML = '<pre>' + markdown + '</pre>';
                }
            } else {
                console.error('No markdown parser found');
                conventionContent.innerHTML = '<pre>' + markdown + '</pre>';
            }
        })
        .catch(error => {
            console.error('Convention fetch error:', error);
            conventionContent.innerHTML = `<p style="color:red">无法加载公约内容: ${error.message}</p>`;
        });

    // --- Navigation Logic ---
    function updateWizard() {
        console.log('UpdateWizard called, step:', currentStep);
        
        // Update Indicators
        stepIndicators.forEach(indicator => {
            const step = parseInt(indicator.dataset.step);
            if (step === currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else if (step < currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });

        // Update Progress Bar Fill
        const progressFill = document.getElementById('progress-fill');
        if (progressFill) {
            const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
            progressFill.style.width = `${progress}%`;
        }

        // Update Content visibility with Animation timeout
        stepContents.forEach(content => {
            if (content.id === `step-${currentStep}`) {
                content.classList.add('active');
                // Optional: ensure display block if handled by CSS alone or JS
            } else {
                content.classList.remove('active');
            }
        });

        // Buttons State
        updateButtons();
    }

    function updateButtons() {
        // Prev Button
        if (prevBtn) prevBtn.disabled = currentStep === 1;

        // Next Button logic
        if (currentStep === 1) {
             // Step 1: Checkbox required
             if (nextBtn) nextBtn.disabled = !agreeCheckbox.checked;
        } else if (currentStep === 2) {
             // Step 2: Device selection required
             if (nextBtn) nextBtn.disabled = !selectedDevice;
        } else {
             if (nextBtn) nextBtn.disabled = false;
        }

        // Step 4 special buttons visibility
        if (currentStep === totalSteps) {
             if (nextBtn) nextBtn.style.display = 'none';
             if (step4Buttons) step4Buttons.classList.remove('hidden');
        } else {
             if (nextBtn) nextBtn.style.display = 'inline-flex';
             if (step4Buttons) step4Buttons.classList.add('hidden');
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateWizard();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentStep < totalSteps) {
                if (currentStep === 2) {
                    renderTutorial(); // Generate step 3 content before showing
                    // Also scroll to top for better ux
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                currentStep++;
                updateWizard();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    // Step 1 Checkbox
    if (agreeCheckbox) {
        agreeCheckbox.addEventListener('change', updateButtons);
    }

    // --- Step 2: Device Selection ---
    const deviceData = {
        pc: {
            title: "电脑版 (Java Edition)",
            recommendations: [
                {
                    name: "PCL2",
                    icon: "fas fa-cube",
                    desc: "界面精美，功能强大的现代化启动器（仅Win）",
                    url: "https://afdian.net/p/0164034c016c11ebafcb52540025c377",
                    primary: true
                },
                {
                    name: "HMCL",
                    icon: "fas fa-horse-head",
                    desc: "历史悠久，跨平台支持好 (Win/Mac/Linux)",
                    url: "https://hmcl.huangyuhui.net/",
                    primary: false
                }
            ],
            note: "推荐使用 PCL2 或 HMCL，均支持极大改善游戏体验。"
        },
        ios: {
            title: "iOS 设备",
            recommendations: [
                {
                    name: "PojavLauncher",
                    icon: "fab fa-app-store-ios",
                    desc: "iOS 上运行 Java 版的唯一选择",
                    url: "https://apps.apple.com/us/app/pojavlauncher/id6443526546", 
                    primary: true
                }
            ],
            note: "需要 iOS 14.0 或更高版本。若未越狱，请保持 JIT 开启以获得最佳性能（部分版本可能需要）。"
        },
        android: {
            title: "安卓设备",
            recommendations: [
                {
                    name: "FCL 启动器",
                    icon: "fab fa-android",
                    desc: "基于 FoldCraft 的高性能启动器",
                    url: "https://github.com/FoldCraftLauncher/FoldCraftLauncher/releases",
                    primary: true
                },
                {
                    name: "PojavLauncher",
                    icon: "fas fa-gamepad",
                    desc: "经典的移动端 Java 版启动器",
                    url: "https://play.google.com/store/apps/details?id=net.kdt.pojavlaunch",
                    primary: false
                }
            ],
            note: "建议设备拥有至少 4GB 运存以流畅运行 1.21 版本。"
        }
    };

    deviceCards.forEach(card => {
        card.addEventListener('click', () => {
            // UI Update
            deviceCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');

            const deviceType = card.dataset.device;
            selectedDevice = deviceType; // Correctly update state
            
            // Show Recommendation
            showRecommendation(deviceType);
            
            // Re-enable next button
            updateButtons();
        });
    });

    function showRecommendation(device) {
        const data = deviceData[device];
        if (!data) return;

        if (recommendationSection) {
            recommendationSection.classList.remove('hidden');
            // Little fade-in effect
            recommendationSection.style.opacity = '0';
            setTimeout(() => recommendationSection.style.opacity = '1', 50);
        }

        let cardsHtml = data.recommendations.map(req => `
            <a href="${req.url}" target="_blank" class="launcher-card ${req.primary ? 'primary' : ''}">
                <div class="launcher-icon">
                    <i class="${req.icon}"></i>
                </div>
                <div class="launcher-details">
                    <h4>${req.name} ${req.primary ? '<span class="badge-rec">推荐</span>' : ''}</h4>
                    <p>${req.desc}</p>
                </div>
                <div class="launcher-action">
                    <i class="fas fa-download"></i>
                </div>
            </a>
        `).join('');

        const html = `
            <div class="recommendation-header">
                <h3>为 ${data.title} 准备启动器</h3>
                <p>${data.note}</p>
            </div>
            <div class="launcher-grid">
                ${cardsHtml}
            </div>
        `;

        if (recommendationContent) recommendationContent.innerHTML = html;
    }

    // --- Step 3: Tutorial Rendering ---
    const deviceTutorials = {
        pc: [
            {
                title: '登录账号',
                desc: '打开启动器（PCL2/HMCL），选择“添加账号”。推荐使用 Microsoft 账号登录拥有正版 Minecraft 的账户。'
            },
            {
                title: '安装游戏',
                desc: '在启动器中创建一个新游戏配置，选择游戏版本 <strong>1.21.x</strong>。强烈建议安装 <a href="https://fabricmc.net/" target="_blank">Fabric</a> 加载器以获得更好的模组支持和性能优化。'
            },
            {
                title: '启动游戏',
                desc: '等待游戏资源文件下载完成，点击启动游戏直到看到 Minecraft 主界面。'
            },
            {
                title: '加入服务器',
                desc: `点击“多人游戏” -> “添加服务器”。<br>
                       服务器名称：<span class="highlight-text">白鹿原</span><br>
                       服务器地址：
                       <div class="server-address-box">
                           <code id="server-address">mcpure.lunadeer.cn</code>
                           <button class="btn-copy" onclick="navigator.clipboard.writeText('mcpure.lunadeer.cn').then(() => { this.innerHTML = '<i class=\\'fas fa-check\\'></i> 已复制'; setTimeout(() => this.innerHTML = '<i class=\\'fas fa-copy\\'></i> 复制', 2000); })">
                               <i class="fas fa-copy"></i> 复制
                           </button>
                       </div>
                       点击“完成”并双击服务器即可加入。`
            }
        ],
        ios: [
            {
                title: '准备环境',
                desc: '打开 PojavLauncher。若您的设备未越狱，请确保已启用 JIT（Just-In-Time）以获得可玩的帧率。'
            },
            {
                title: '登录账号',
                desc: '点击“添加账户”，选择“Microsoft 账户”并完成登录流程。'
            },
            {
                title: '下载并启动',
                desc: '点击“创建新配置”，选择版本 <strong>1.21.x</strong>。建议调整内存分配至设备总内存的 50% 左右，然后点击“启动”。'
            },
            {
                title: '加入服务器',
                desc: `进入主界面后，选择 Multiplayer（多人游戏） -> Add Server（添加服务器）。<br>
                       Address（地址）：
                       <div class="server-address-box">
                           <code id="server-address-ios">mcpure.lunadeer.cn</code>
                           <button class="btn-copy" onclick="navigator.clipboard.writeText('mcpure.lunadeer.cn').then(() => { this.innerHTML = '<i class=\\'fas fa-check\\'></i> 已复制'; setTimeout(() => this.innerHTML = '<i class=\\'fas fa-copy\\'></i> 复制', 2000); })">
                               <i class="fas fa-copy"></i>
                           </button>
                       </div>
                       点击 Done 并加入。`
            }
        ],
        android: [
            {
                title: '配置启动器',
                desc: '打开 FCL 或 PojavLauncher。给予必要的存储权限。'
            },
            {
                title: '登录账号',
                desc: '在账户设置中添加 Microsoft 账户。'
            },
            {
                title: '安装版本',
                desc: '下载 <strong>1.21.x</strong> 游戏核心。FCL 用户可直接使用内置下载源加速下载。建议安装 OptiFine 或 Fabric+Sodium 以提升帧率。'
            },
            {
                title: '加入服务器',
                desc: `启动游戏后，点击 Multiplayer（多人游戏） -> Add Server（添加服务器）。<br>
                       Address（地址）：
                       <div class="server-address-box">
                           <code id="server-address-android">mcpure.lunadeer.cn</code>
                           <button class="btn-copy" onclick="navigator.clipboard.writeText('mcpure.lunadeer.cn').then(() => { this.innerHTML = '<i class=\\'fas fa-check\\'></i> 已复制'; setTimeout(() => this.innerHTML = '<i class=\\'fas fa-copy\\'></i> 复制', 2000); })">
                               <i class="fas fa-copy"></i> 复制
                           </button>
                       </div>
                       点击 Done 并加入。`
            }
        ]
    };

    function renderTutorial() {
        const device = selectedDevice || 'pc'; // default to pc if somehow null
        const steps = deviceTutorials[device] || deviceTutorials['pc'];
        
        let content = '<div class="tutorial-steps">';

        steps.forEach((step, index) => {
            content += `
                <div class="tutorial-step">
                    <div class="step-badge">${index + 1}</div>
                    <div class="step-text">
                        <h4>${step.title}</h4>
                        <p>${step.desc}</p>
                    </div>
                </div>
            `;
        });

        content += '</div>';
        if (tutorialContent) {
            tutorialContent.innerHTML = content;
        }
    }

    // --- Step 4: Playstyle Selection ---
    const playstyleCards = document.querySelectorAll('.playstyle-card');
    const playstyleDetails = document.getElementById('playstyle-details');
    
    const playstyleData = {
        'large-town': {
            title: '融入大型城镇',
            subtitle: '快速启航，共建繁华 (10+人)',
            target: '希望跳过艰难的初期积累，快速投入大规模建造与合作的玩家。',
            pros: ['资源无忧：可直接从公共仓库获取建材与工具。', '工业完善：享受成熟的自动化生产带来的便利。'],
            cons: ['为了整体美观与规划，可能需要遵守城镇的建筑风格与管理安排，自由度相对受限。']
        },
        'small-town': {
            title: '加入小型城镇',
            subtitle: '共同成长，见证历史 (3-10人)',
            target: '喜欢参与从零到一的建设过程，享受亲手打造家园成就感的玩家。',
            pros: ['发展参与感：亲身参与城镇的规划与扩张。', '自由度较高：在发展初期通常有更多的个人发挥空间。'],
            cons: ['初期资源相对有限，需要与同伴共同努力。']
        },
        'friends': {
            title: '与朋友共建家园',
            subtitle: '白手起家，开创时代 (1-3人)',
            target: '拥有固定小团体，渴望一片完全属于自己的领地的玩家。',
            pros: ['绝对自由：从选址到规划，一切由你定义。', '纯粹体验：体验最原始的协作与创造乐趣。'],
            cons: ['这是一条充满挑战的道路，但从无到有建立的一切都将格外珍贵。']
        },
        'solo': {
            title: '独狼求生',
            subtitle: '自力更生，隐于山林',
            target: '享受孤独，崇尚一切亲力亲为的硬核生存玩家。',
            pros: ['极致的自由与独立，你的世界只属于你。', '可尝试与其他玩家进行贸易换取无法独自获得的资源。'],
            cons: ['一切都需要亲力亲为，生存挑战较大。']
        }
    };

    if (playstyleCards.length > 0 && playstyleDetails) {
        playstyleCards.forEach(card => {
            card.addEventListener('click', () => {
                // UI Visual Selection
                playstyleCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');

                // Get Data
                const styleKey = card.dataset.style;
                const data = playstyleData[styleKey];

                if (data) {
                    // Populate Details
                    document.getElementById('detail-title').textContent = data.title;
                    document.getElementById('detail-subtitle').textContent = data.subtitle;
                    document.getElementById('detail-target').textContent = data.target;
                    
                    const prosList = document.getElementById('detail-pros');
                    const consList = document.getElementById('detail-cons');
                    
                    prosList.innerHTML = data.pros.map(p => `<li>${p}</li>`).join('');
                    consList.innerHTML = data.cons.map(c => `<li>${c}</li>`).join('');

                    // Show Details
                    playstyleDetails.classList.add('visible');
                    
                    // Optional: scroll into view gently if needed, or stick to bottom
                    playstyleDetails.scrollIntoView({ behavior: 'smooth', block: 'end' });
                }
            });
        });
    }

    // Initial check
    updateWizard();
});
