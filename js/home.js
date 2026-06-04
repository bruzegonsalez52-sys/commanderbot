// ─── Home / Landing Page ───
class HomePage {
  constructor() {
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.loadConfig();
  }

  cacheDom() {
    this.dom = {
      startBtn: document.getElementById('homeStartBtn'),
      embedBtn: document.getElementById('homeEmbedBtn'),
      formBtn: document.getElementById('homeFormBtn'),
      statBlocks: document.getElementById('statBlocks'),
      statProjects: document.getElementById('statProjects'),
      configBotName: document.getElementById('configBotName'),
      configPrefix: document.getElementById('configPrefix'),
      configLang: document.getElementById('configLang'),
      configToken: document.getElementById('configToken')
    };
  }

  bindEvents() {
    this.dom.startBtn.addEventListener('click', () => {
      document.querySelector('.nav-btn[data-view="blocks"]')?.click();
    });

    this.dom.embedBtn.addEventListener('click', () => {
      document.querySelector('.nav-btn[data-view="embed"]')?.click();
    });

    this.dom.formBtn.addEventListener('click', () => {
      document.querySelector('.nav-btn[data-view="forms"]')?.click();
    });

    this.dom.configBotName.addEventListener('change', () => this.saveConfig());
    this.dom.configPrefix.addEventListener('change', () => this.saveConfig());
    this.dom.configLang.addEventListener('change', () => this.saveConfig());
    this.dom.configToken.addEventListener('change', () => this.saveConfig());
  }

  loadConfig() {
    try {
      const config = JSON.parse(localStorage.getItem(window.getUserStorageKey('config')) || '{}');
      if (config.botName) this.dom.configBotName.value = config.botName;
      if (config.prefix) this.dom.configPrefix.value = config.prefix;
      if (config.lang) this.dom.configLang.value = config.lang;
      if (config.token) this.dom.configToken.value = config.token;
    } catch {}
  }

  saveConfig() {
    const config = {
      botName: this.dom.configBotName.value,
      prefix: this.dom.configPrefix.value,
      lang: this.dom.configLang.value,
      token: this.dom.configToken.value
    };
    localStorage.setItem(window.getUserStorageKey('config'), JSON.stringify(config));
  }

  updateStats(blocksCount, projectsCount) {
    if (this.dom.statBlocks) this.dom.statBlocks.textContent = blocksCount || 0;
    if (this.dom.statProjects) this.dom.statProjects.textContent = projectsCount || 0;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.homePage = new HomePage();
});