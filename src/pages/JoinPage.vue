<script setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';

const currentStep = ref(1);
const totalSteps = 4;
const agreed = ref(false);
const selectedDevice = ref(null);
const selectedEdition = ref('java');
const selectedPlaystyle = ref(null);
const conventionHtml = ref('');
const copiedAddr = ref(null);

onMounted(() => {
  fetch('/data/convention.md')
    .then(r => r.text())
    .then(md => {
      conventionHtml.value = marked.parse(md);
    })
    .catch(() => {
      conventionHtml.value = '<p style="color:red">无法加载公约内容</p>';
    });
});

// Navigation
function nextStep() {
  if (currentStep.value === 2) {
    // renderTutorial happens reactively
  }
  if (currentStep.value < totalSteps) {
    currentStep.value++;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

const canNext = computed(() => {
  if (currentStep.value === 1) return agreed.value;
  if (currentStep.value === 2) return !!selectedDevice.value;
  return true;
});

function selectDevice(d) {
  selectedDevice.value = d;
  selectedEdition.value = 'java';
}

function copyAddr(text, key) {
  navigator.clipboard.writeText(text).then(() => {
    copiedAddr.value = key;
    setTimeout(() => { copiedAddr.value = null; }, 2000);
  });
}

// Device data
const deviceData = {
  pc: {
    title: '电脑版 (Java Edition)',
    recommendations: [
      { name: 'PCL2', icon: 'fas fa-cube', desc: '界面精美，功能强大的现代化启动器（仅Win）', url: 'https://pan.aoe.top/Tools/PCL2', primary: true },
      { name: 'HMCL', icon: 'fas fa-horse-head', desc: '历史悠久，跨平台支持好 (Win/Mac/Linux)', url: 'https://hmcl.huangyuhui.net/download/', primary: false },
    ],
    note: '推荐使用 PCL2 或 HMCL，均支持极大改善游戏体验。',
  },
  ios: {
    title: 'iOS 设备',
    recommendations: [
      { name: 'PojavLauncher', icon: 'fab fa-app-store-ios', desc: 'iOS 上运行 Java 版的唯一选择', url: 'https://pojavlauncher.net/', primary: true },
    ],
    note: '需要 iOS 14.0 或更高版本。若未越狱，请保持 JIT 开启以获得最佳性能。',
  },
  android: {
    title: '安卓设备',
    recommendations: [
      { name: 'FCL 启动器', icon: 'fab fa-android', desc: '基于 FoldCraft 的高性能启动器', url: 'https://fcl-team.github.io/pages/download.html', primary: true },
      { name: 'PojavLauncher', icon: 'fas fa-gamepad', desc: '经典的移动端 Java 版启动器', url: 'https://pojavlauncher.net/', primary: false },
    ],
    note: '建议设备拥有至少 4GB 运存以流畅运行 1.21 版本。',
  },
};

const bedrockDeviceData = {
  pc: {
    title: '电脑版 (Bedrock Edition)',
    recommendations: [
      { name: 'Minecraft 基岩版', icon: 'fas fa-cube', desc: '从 Microsoft Store 获取 Minecraft（需 Windows 10/11）', url: 'https://www.xbox.com/games/store/minecraft/9NBLGGH2JHXJ', primary: true },
    ],
    note: '基岩版通过 Microsoft Store 购买，使用 Xbox / Microsoft 账号登录即可游玩。',
  },
  ios: {
    title: 'iOS 基岩版',
    recommendations: [
      { name: 'Minecraft', icon: 'fas fa-cube', desc: '从 App Store 购买并下载 Minecraft', url: 'https://apps.apple.com/app/minecraft/id479516143', primary: true },
    ],
    note: '基岩版是 iOS 上的原生 Minecraft，性能最佳、操作体验最好。',
  },
  android: {
    title: '安卓基岩版',
    recommendations: [
      { name: 'Minecraft', icon: 'fas fa-cube', desc: '从 Google Play 购买并下载 Minecraft', url: 'https://play.google.com/store/apps/details?id=com.mojang.minecraftpe', primary: true },
    ],
    note: '基岩版是安卓上的原生 Minecraft，性能最佳、操作体验最好。',
  },
};

const currentDeviceData = computed(() => {
  if (!selectedDevice.value) return null;
  const source = selectedEdition.value === 'bedrock' ? bedrockDeviceData : deviceData;
  return source[selectedDevice.value] || null;
});

// Tutorial data
const deviceTutorials = {
  pc: [
    { title: '登录账号', desc: '打开启动器（PCL2/HMCL），选择"添加账号"。推荐使用 Microsoft 账号登录拥有正版 Minecraft 的账户。' },
    { title: '安装游戏', desc: '在启动器中创建一个新游戏配置，选择游戏版本 <strong>1.21.x</strong>。强烈建议安装 <a href="https://fabricmc.net/" target="_blank">Fabric</a> 加载器以获得更好的模组支持和性能优化。' },
    { title: '启动游戏', desc: '等待游戏资源文件下载完成，点击启动游戏直到看到 Minecraft 主界面。' },
    { title: '加入服务器', desc: '点击"多人游戏" → "添加服务器"', serverAddr: 'mcpure.lunadeer.cn' },
  ],
  ios: [
    { title: '准备环境', desc: '打开 PojavLauncher。若您的设备未越狱，请确保已启用 JIT（Just-In-Time）以获得可玩的帧率。' },
    { title: '登录账号', desc: '点击"添加账户"，选择"Microsoft 账户"并完成登录流程。' },
    { title: '下载并启动', desc: '点击"创建新配置"，选择版本 <strong>1.21.x</strong>。建议调整内存分配至设备总内存的 50% 左右，然后点击"启动"。' },
    { title: '加入服务器', desc: '进入主界面后，选择 Multiplayer → Add Server', serverAddr: 'mcpure.lunadeer.cn' },
  ],
  android: [
    { title: '配置启动器', desc: '打开 FCL 或 PojavLauncher。给予必要的存储权限。' },
    { title: '登录账号', desc: '在账户设置中添加 Microsoft 账户。' },
    { title: '安装版本', desc: '下载 <strong>1.21.x</strong> 游戏核心。FCL 用户可直接使用内置下载源加速下载。建议安装 OptiFine 或 Fabric+Sodium 以提升帧率。' },
    { title: '加入服务器', desc: '启动游戏后，点击 Multiplayer → Add Server', serverAddr: 'mcpure.lunadeer.cn' },
  ],
};

const bedrockTutorials = {
  pc: [
    { title: '获取游戏', desc: '从 <a href="https://www.xbox.com/games/store/minecraft/9NBLGGH2JHXJ" target="_blank">Microsoft Store</a> 购买并下载 Minecraft（基岩版/Bedrock Edition），需要 Windows 10 或 Windows 11。' },
    { title: '登录账号', desc: '打开 Minecraft，使用 Microsoft / Xbox 账号登录。' },
    { title: '加入服务器', desc: '点击"游戏" → 切换到"服务器"标签页 → 滚动到底部点击"添加服务器"', serverAddr: 'mcbe.lunadeer.cn', serverPort: '15337' },
  ],
  ios: [
    { title: '获取游戏', desc: '从 <a href="https://apps.apple.com/app/minecraft/id479516143" target="_blank">App Store</a> 购买并下载 Minecraft。' },
    { title: '登录账号', desc: '打开 Minecraft，使用 Microsoft / Xbox 账号登录。' },
    { title: '加入服务器', desc: '点击"游戏" → 切换到"服务器"标签页 → 滚动到底部点击"添加服务器"', serverAddr: 'mcbe.lunadeer.cn', serverPort: '15337' },
  ],
  android: [
    { title: '获取游戏', desc: '从 <a href="https://play.google.com/store/apps/details?id=com.mojang.minecraftpe" target="_blank">Google Play</a> 购买并下载 Minecraft。' },
    { title: '登录账号', desc: '打开 Minecraft，使用 Microsoft / Xbox 账号登录。' },
    { title: '加入服务器', desc: '点击"游戏" → 切换到"服务器"标签页 → 滚动到底部点击"添加服务器"', serverAddr: 'mcbe.lunadeer.cn', serverPort: '15337' },
  ],
};

const currentTutorial = computed(() => {
  const d = selectedDevice.value || 'pc';
  const source = selectedEdition.value === 'bedrock' ? bedrockTutorials : deviceTutorials;
  return source[d] || source['pc'];
});

// Playstyle data
const playstyleData = {
  'large-town': {
    title: '融入大型城镇', subtitle: '快速启航，共建繁华 (10+人)', icon: 'fas fa-city',
    target: '希望跳过艰难的初期积累，快速投入大规模建造与合作的玩家。',
    pros: ['资源无忧：可直接从公共仓库获取建材与工具。', '工业完善：享受成熟的自动化生产带来的便利。'],
    cons: ['为了整体美观与规划，可能需要遵守城镇的建筑风格与管理安排，自由度相对受限。'],
  },
  'small-town': {
    title: '加入小型城镇', subtitle: '共同成长，见证历史 (3-10人)', icon: 'fas fa-home',
    target: '喜欢参与从零到一的建设过程，享受亲手打造家园成就感的玩家。',
    pros: ['发展参与感：亲身参与城镇的规划与扩张。', '自由度较高：在发展初期通常有更多的个人发挥空间。'],
    cons: ['初期资源相对有限，需要与同伴共同努力。'],
  },
  friends: {
    title: '与朋友共建家园', subtitle: '白手起家，开创时代 (1-3人)', icon: 'fas fa-user-friends',
    target: '拥有固定小团体，渴望一片完全属于自己的领地的玩家。',
    pros: ['绝对自由：从选址到规划，一切由你定义。', '纯粹体验：体验最原始的协作与创造乐趣。'],
    cons: ['这是一条充满挑战的道路，但从无到有建立的一切都将格外珍贵。'],
  },
  solo: {
    title: '独狼求生', subtitle: '自力更生，隐于山林', icon: 'fas fa-hiking',
    target: '享受孤独，崇尚一切亲力亲为的硬核生存玩家。',
    pros: ['极致的自由与独立，你的世界只属于你。', '可尝试与其他玩家进行贸易换取无法独自获得的资源。'],
    cons: ['一切都需要亲力亲为，生存挑战较大。'],
  },
};

const playstyleKeys = Object.keys(playstyleData);
const selectedPlaystyleData = computed(() =>
  selectedPlaystyle.value ? playstyleData[selectedPlaystyle.value] : null
);

const stepLabels = ['阅读公约', '选择设备', '加入教程', '游戏风格'];
</script>

<template>
  <section class="join-header">
    <h1>加入白鹿原</h1>
    <p>跟随引导，几分钟内即可开始你的冒险。</p>
  </section>

  <main class="join-container bl-shell">
    <div class="wizard-layout">
      <!-- Sidebar progress -->
      <aside class="wizard-sidebar">
        <div class="progress-steps">
          <div
            v-for="(label, idx) in stepLabels"
            :key="idx"
            class="progress-step"
            :class="{
              active: currentStep === idx + 1,
              completed: currentStep > idx + 1,
            }"
          >
            <span class="step-num">{{ idx + 1 }}</span>
            <span class="step-label">{{ label }}</span>
          </div>
        </div>
        <div class="progress-bar-track">
          <div class="progress-fill" :style="{ width: ((currentStep - 1) / (totalSteps - 1)) * 100 + '%' }"></div>
        </div>
      </aside>

      <!-- Content -->
      <div class="wizard-content">
        <!-- Step 1: Convention -->
        <div v-if="currentStep === 1" class="step-content">
          <h2>📜 服务器公约</h2>
          <p class="step-desc">请仔细阅读以下公约内容，确认后即可继续。</p>
          <div class="convention-box" v-html="conventionHtml"></div>
          <label class="agree-label">
            <input v-model="agreed" type="checkbox">
            <span>我已阅读并同意遵守以上公约</span>
          </label>
        </div>

        <!-- Step 2: Device -->
        <div v-if="currentStep === 2" class="step-content">
          <h2>📱 选择你的设备</h2>
          <p class="step-desc">我们将根据您的设备提供专属的入服指导。</p>
          <div class="device-cards">
            <div
              v-for="d in ['pc', 'ios', 'android']"
              :key="d"
              :class="['device-card', { selected: selectedDevice === d }]"
              @click="selectDevice(d)"
            >
              <i :class="d === 'pc' ? 'fas fa-desktop' : d === 'ios' ? 'fab fa-apple' : 'fab fa-android'"></i>
              <span>{{ d === 'pc' ? '电脑' : d === 'ios' ? 'iOS' : '安卓' }}</span>
            </div>
          </div>

          <!-- Edition selector -->
          <div v-if="selectedDevice" class="edition-selector">
            <button
              :class="['edition-btn', { active: selectedEdition === 'java' }]"
              @click="selectedEdition = 'java'"
            >Java版</button>
            <button
              :class="['edition-btn', { active: selectedEdition === 'bedrock' }]"
              @click="selectedEdition = 'bedrock'"
            >基岩版</button>
          </div>

          <!-- Launcher recommendation -->
          <div v-if="currentDeviceData" class="recommendation-section">
            <div class="recommendation-header">
              <h3>为 {{ currentDeviceData.title }} 准备启动器</h3>
              <p>{{ currentDeviceData.note }}</p>
            </div>
            <div class="launcher-grid">
              <a
                v-for="req in currentDeviceData.recommendations"
                :key="req.name"
                :href="req.url"
                target="_blank"
                rel="noopener"
                :class="['launcher-card', { primary: req.primary }]"
              >
                <div class="launcher-icon"><i :class="req.icon"></i></div>
                <div class="launcher-details">
                  <h4>{{ req.name }} <span v-if="req.primary" class="badge-rec">推荐</span></h4>
                  <p>{{ req.desc }}</p>
                </div>
                <div class="launcher-action"><i class="fas fa-download"></i></div>
              </a>
            </div>
          </div>
        </div>

        <!-- Step 3: Tutorial -->
        <div v-if="currentStep === 3" class="step-content">
          <h2>🎮 加入教程</h2>
          <p class="step-desc">按照以下步骤操作，即可进入白鹿原服务器。</p>
          <div class="tutorial-steps">
            <div v-for="(step, idx) in currentTutorial" :key="idx" class="tutorial-step">
              <div class="step-badge">{{ idx + 1 }}</div>
              <div class="step-text">
                <h4>{{ step.title }}</h4>
                <p v-html="step.desc"></p>
                <template v-if="step.serverAddr">
                  <div class="server-address-box">
                    <span v-if="step.serverPort">地址：</span>
                    <code>{{ step.serverAddr }}</code>
                    <button class="btn-copy" @click="copyAddr(step.serverAddr, 'addr-' + idx)">
                      <template v-if="copiedAddr === 'addr-' + idx"><i class="fas fa-check"></i> 已复制</template>
                      <template v-else><i class="fas fa-copy"></i> 复制</template>
                    </button>
                  </div>
                  <div v-if="step.serverPort" class="server-address-box">
                    <span>端口：</span>
                    <code>{{ step.serverPort }}</code>
                    <button class="btn-copy" @click="copyAddr(step.serverPort, 'port-' + idx)">
                      <template v-if="copiedAddr === 'port-' + idx"><i class="fas fa-check"></i> 已复制</template>
                      <template v-else><i class="fas fa-copy"></i> 复制</template>
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Playstyle -->
        <div v-if="currentStep === 4" class="step-content">
          <h2>🌟 选择游戏风格</h2>
          <p class="step-desc">了解不同的游戏方式，找到最适合你的冒险之旅。</p>
          <div class="playstyle-cards">
            <div
              v-for="key in playstyleKeys"
              :key="key"
              :class="['playstyle-card', { selected: selectedPlaystyle === key }]"
              @click="selectedPlaystyle = key"
            >
              <i :class="playstyleData[key].icon"></i>
              <h4>{{ playstyleData[key].title }}</h4>
              <p>{{ playstyleData[key].subtitle }}</p>
            </div>
          </div>

          <div v-if="selectedPlaystyleData" class="playstyle-details">
            <h3>{{ selectedPlaystyleData.title }}</h3>
            <p class="detail-subtitle">{{ selectedPlaystyleData.subtitle }}</p>
            <p class="detail-target"><strong>适合：</strong>{{ selectedPlaystyleData.target }}</p>
            <div class="pros-cons">
              <div class="pros">
                <h4><i class="fas fa-check-circle"></i> 优势</h4>
                <ul>
                  <li v-for="p in selectedPlaystyleData.pros" :key="p">{{ p }}</li>
                </ul>
              </div>
              <div class="cons">
                <h4><i class="fas fa-exclamation-circle"></i> 注意</h4>
                <ul>
                  <li v-for="c in selectedPlaystyleData.cons" :key="c">{{ c }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Wizard Actions -->
        <div class="wizard-actions">
          <button class="wizard-btn secondary" :disabled="currentStep === 1" @click="prevStep">
            <i class="fas fa-arrow-left"></i> 上一步
          </button>
          <button
            v-if="currentStep < totalSteps"
            class="wizard-btn primary"
            :disabled="!canNext"
            @click="nextStep"
          >
            下一步 <i class="fas fa-arrow-right"></i>
          </button>
          <template v-if="currentStep === totalSteps">
            <router-link to="/" class="wizard-btn primary">
              <i class="fas fa-home"></i> 返回首页
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Header */
.join-header {
  padding: calc(var(--bl-topbar-offset) + 48px) 20px 48px;
  text-align: center;
  background: linear-gradient(135deg, #66ead8 0%, #4ba276 100%);
  color: #fff;
}

.join-header h1 {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 12px;
}

.join-header p {
  font-size: 20px;
  opacity: 0.9;
  margin: 0;
}

.join-container {
  padding: 40px 20px;
}

.wizard-layout {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

/* Sidebar */
.wizard-sidebar {
  flex-shrink: 0;
  width: 200px;
  position: sticky;
  top: calc(var(--bl-topbar-offset) + 20px);
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  transition: var(--bl-transition);
  font-size: 14px;
  color: var(--bl-text-secondary);
}

.progress-step.active {
  background: var(--bl-accent);
  color: #fff;
  font-weight: 600;
}

.progress-step.completed {
  color: var(--bl-accent);
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  background: #f0f0f2;
  flex-shrink: 0;
}

.progress-step.active .step-num {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.progress-step.completed .step-num {
  background: var(--bl-accent);
  color: #fff;
}

.progress-bar-track {
  height: 4px;
  background: #e5e5ea;
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--bl-accent);
  border-radius: 2px;
  transition: width 0.5s ease;
}

/* Content */
.wizard-content {
  flex: 1;
  min-width: 0;
}

.step-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.step-desc {
  font-size: 16px;
  color: var(--bl-text-secondary);
  margin: 0 0 24px;
}

/* Convention */
.convention-box {
  background: var(--bl-surface-strong);
  border: 1px solid var(--bl-border);
  border-radius: var(--bl-radius-lg);
  padding: 32px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
  font-size: 15px;
  line-height: 1.8;
}

.convention-box :deep(h1),
.convention-box :deep(h2),
.convention-box :deep(h3) {
  margin-top: 20px;
  margin-bottom: 10px;
}

.convention-box :deep(p) {
  margin: 0 0 12px;
}

.agree-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}

.agree-label input {
  width: 18px;
  height: 18px;
  accent-color: var(--bl-accent);
}

/* Device cards */
.device-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.device-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 36px;
  border: 2px solid var(--bl-border);
  border-radius: var(--bl-radius-lg);
  cursor: pointer;
  transition: var(--bl-transition);
  background: var(--bl-surface-strong);
  font-weight: 600;
  font-size: 15px;
}

.device-card i {
  font-size: 32px;
  color: var(--bl-text-secondary);
}

.device-card:hover {
  border-color: var(--bl-accent);
}

.device-card.selected {
  border-color: var(--bl-accent);
  background: var(--bl-accent-soft-muted);
}

.device-card.selected i {
  color: var(--bl-accent);
}

/* Edition selector */
.edition-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}

.edition-btn {
  padding: 8px 20px;
  border-radius: 20px;
  border: 1.5px solid var(--bl-border-strong);
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
  font-family: inherit;
  color: var(--bl-text-secondary);
}

.edition-btn.active {
  background: var(--bl-accent);
  color: #fff;
  border-color: var(--bl-accent);
}

/* Launcher recommendation */
.recommendation-section {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  padding: 24px;
  border: 1px solid var(--bl-border);
}

.recommendation-header h3 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px;
}

.recommendation-header p {
  font-size: 14px;
  color: var(--bl-text-secondary);
  margin: 0 0 20px;
}

.launcher-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.launcher-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1.5px solid var(--bl-border);
  text-decoration: none;
  color: var(--bl-text);
  transition: var(--bl-transition);
  background: var(--bl-surface-strong);
}

.launcher-card.primary {
  border-color: var(--bl-accent);
  background: var(--bl-accent-soft-muted);
}

.launcher-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--bl-shadow-card);
}

.launcher-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bl-surface-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--bl-accent);
  flex-shrink: 0;
}

.launcher-details {
  flex: 1;
}

.launcher-details h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
}

.launcher-details p {
  font-size: 13px;
  color: var(--bl-text-secondary);
  margin: 0;
}

.badge-rec {
  display: inline-block;
  background: var(--bl-accent);
  color: #fff;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 6px;
  vertical-align: middle;
}

.launcher-action {
  font-size: 16px;
  color: var(--bl-text-secondary);
}

/* Tutorial */
.tutorial-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tutorial-step {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-badge {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bl-accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-text {
  flex: 1;
}

.step-text h4 {
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 8px;
}

.step-text p {
  font-size: 15px;
  line-height: 1.6;
  margin: 0 0 12px;
  color: var(--bl-text-secondary);
}

.step-text :deep(a) {
  color: var(--bl-accent);
  text-decoration: underline;
}

.server-address-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bl-surface-muted);
  padding: 10px 16px;
  border-radius: 10px;
  margin-bottom: 8px;
}

.server-address-box span {
  font-size: 13px;
  color: var(--bl-text-secondary);
  flex-shrink: 0;
}

.server-address-box code {
  font-family: 'Inter', monospace;
  font-size: 15px;
  font-weight: 700;
  flex: 1;
  color: var(--bl-text);
}

.btn-copy {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  background: var(--bl-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
  font-family: inherit;
  white-space: nowrap;
}

.btn-copy:hover {
  background: var(--bl-accent-strong);
}

/* Playstyle */
.playstyle-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.playstyle-card {
  text-align: center;
  padding: 28px 16px;
  border: 2px solid var(--bl-border);
  border-radius: var(--bl-radius-lg);
  cursor: pointer;
  transition: var(--bl-transition);
  background: var(--bl-surface-strong);
}

.playstyle-card:hover {
  border-color: var(--bl-accent);
}

.playstyle-card.selected {
  border-color: var(--bl-accent);
  background: var(--bl-accent-soft-muted);
}

.playstyle-card i {
  font-size: 32px;
  color: var(--bl-accent);
  margin-bottom: 12px;
}

.playstyle-card h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px;
}

.playstyle-card p {
  font-size: 13px;
  color: var(--bl-text-secondary);
  margin: 0;
}

.playstyle-details {
  background: var(--bl-surface-strong);
  border-radius: var(--bl-radius-lg);
  padding: 28px;
  border: 1px solid var(--bl-border);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.playstyle-details h3 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 4px;
}

.detail-subtitle {
  font-size: 14px;
  color: var(--bl-text-secondary);
  margin: 0 0 16px;
}

.detail-target {
  font-size: 15px;
  margin: 0 0 20px;
  line-height: 1.5;
}

.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.pros h4 { color: #16a34a; }
.cons h4 { color: #dc2626; }

.pros h4 i,
.cons h4 i {
  margin-right: 6px;
}

.pros ul,
.cons ul {
  padding-left: 20px;
  margin: 8px 0 0;
}

.pros li,
.cons li {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 6px;
}

/* Wizard actions */
.wizard-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--bl-border);
}

.wizard-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--bl-transition);
  border: none;
  text-decoration: none;
  font-family: inherit;
}

.wizard-btn.primary {
  background: var(--bl-accent);
  color: #fff;
}

.wizard-btn.primary:hover:not(:disabled) {
  background: var(--bl-accent-strong);
  transform: translateY(-1px);
}

.wizard-btn.secondary {
  background: transparent;
  color: var(--bl-text-secondary);
  border: 1.5px solid var(--bl-border-strong);
}

.wizard-btn.secondary:hover:not(:disabled) {
  border-color: var(--bl-accent);
  color: var(--bl-accent);
}

.wizard-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 800px) {
  .wizard-layout {
    flex-direction: column;
    gap: 24px;
  }

  .wizard-sidebar {
    width: 100%;
    position: static;
  }

  .progress-steps {
    flex-direction: row;
    overflow-x: auto;
    gap: 2px;
  }

  .step-label {
    display: none;
  }

  .join-header h1 { font-size: 32px; }
  .device-cards { flex-direction: column; }
  .pros-cons { grid-template-columns: 1fr; }
  .playstyle-cards { grid-template-columns: 1fr 1fr; }
}
</style>
