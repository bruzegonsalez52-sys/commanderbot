// ─── Supabase ───
const SB_URL = 'https://onnwozcmmudsdcypletl.supabase.co';
const SB_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ubndvemNtbXVkc2RjeXBsZXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MjQ0NTUsImV4cCI6MjA5NjEwMDQ1NX0.eCczc66uROZgpXYDU5BBOvhGQrK6IvLIRm_88xqs1no';
const sbClient = supabase.createClient(SB_URL, SB_ANON_KEY);

// ─── Helper global: claves localStorage por usuario ───
window.getUserStorageKey = function(base) {
  try {
    const key = 'sb-onnwozcmmudsdcypletl-auth-token';
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const uid = parsed?.user?.id || parsed?.access_token;
      if (uid) return 'commanderbot_' + base + '_' + uid;
    }
  } catch {}
  try {
    const session = JSON.parse(localStorage.getItem('commanderbot_session') || 'null');
    if (session && session.username) {
      return 'commanderbot_' + base + '_' + session.username;
    }
  } catch {}
  return 'commanderbot_' + base + '_guest';
};

// ─── App Principal ───
class DiscordBotBuilder {
  constructor() {
    this.workspace = null;
    this.currentUser = this.loadSession();
    this.projects = this.loadProjects();
    this.currentProject = null;
    this.generatedCode = '';
    this.deployCommandsCode = '';
    this.exportTab = 'bot'; // 'bot' or 'deploy'
    this.blockCount = 0;
    this.init();
  }

  init() {
    this.cacheDom();
    this.blocklyInitialized = false;
    this.bindNavigation();
    this.bindToolbar();
    this.bindProjects();
    this.bindAuth();
    this.renderProjects();
    this.updateHomeStats();
    this.updateExportDisplay();
    this.updateAuthUI();
    this.refreshUser();
    this.initAdmin();
    // Show auth after a brief delay if not logged in
    setTimeout(() => {
      if (!this.currentUser) this.showAuth();
    }, 500);
  }

  cacheDom() {
    this.dom = {
      navBtns: document.querySelectorAll('.nav-btn'),
      views: document.querySelectorAll('.view'),
      blocklyDiv: document.getElementById('blocklyDiv'),
      saveBtn: document.getElementById('saveBtn'),
      undoBtn: document.getElementById('undoBtn'),
      redoBtn: document.getElementById('redoBtn'),
      zoomInBtn: document.getElementById('zoomInBtn'),
      zoomOutBtn: document.getElementById('zoomOutBtn'),
      deleteBlocksBtn: document.getElementById('deleteBlocksBtn'),
      codeOutput: document.getElementById('generatedCode'),
      copyCodeBtn: document.getElementById('copyCodeBtn'),
      exportTabBot: document.getElementById('exportTabBot'),
      exportTabDeploy: document.getElementById('exportTabDeploy'),
      exportLabel: document.getElementById('exportLabel'),
      projectsGrid: document.getElementById('projectsGrid'),
      newProjectBtn: document.getElementById('newProjectBtn'),
      emptyNewProjectBtn: document.getElementById('emptyNewProjectBtn'),
      authOverlay: document.getElementById('authOverlay'),
      loginForm: document.getElementById('loginForm'),
      registerForm: document.getElementById('registerForm'),
      loginEmail: document.getElementById('loginEmail'),
      loginPassword: document.getElementById('loginPassword'),
      registerEmail: document.getElementById('registerEmail'),
      registerUsername: document.getElementById('registerUsername'),
      registerPassword: document.getElementById('registerPassword'),
      registerConfirm: document.getElementById('registerConfirm'),
      loginError: document.getElementById('loginError'),
      registerError: document.getElementById('registerError'),
      forgotPasswordBtn: document.getElementById('forgotPasswordBtn'),
      sidebarUser: document.getElementById('sidebarUser'),
      userName: document.getElementById('userName'),
      userPlan: document.getElementById('userPlan'),
      userAvatar: document.getElementById('userAvatar'),
      settingsUsername: document.getElementById('settingsUsername'),
      settingsPlan: document.getElementById('settingsPlan'),
      settingsBadge: document.getElementById('settingsBadge'),
      settingsLoginBtn: document.getElementById('settingsLoginBtn'),
      adminTableBody: document.getElementById('adminTableBody'),
      adminLoading: document.getElementById('adminLoading'),
      adminCount: document.getElementById('adminCount'),
      adminSearch: document.getElementById('adminSearch'),
      adminEditModal: document.getElementById('adminEditModal'),
      adminEditEmail: document.getElementById('adminEditEmail'),
      adminEditUsername: document.getElementById('adminEditUsername'),
      adminEditPlan: document.getElementById('adminEditPlan'),
      adminEditAdminToggle: document.getElementById('adminEditAdminToggle'),
      adminEditClose: document.getElementById('adminEditClose'),
      adminEditCancel: document.getElementById('adminEditCancel'),
      adminEditSave: document.getElementById('adminEditSave'),
      adminEditAvatar: document.getElementById('adminEditAvatar'),
      adminEditDisplayName: document.getElementById('adminEditDisplayName'),
      adminEditDisplayId: document.getElementById('adminEditDisplayId'),
      adminEditCreated: document.getElementById('adminEditCreated'),
      adminEditLastSignIn: document.getElementById('adminEditLastSignIn')
    };
  }

  // ─── Blockly ───
  initBlockly() {
    const toolboxXml = this.getToolbox();
    const toolboxParser = new DOMParser();
    const toolboxDoc = toolboxParser.parseFromString(toolboxXml, 'text/xml');
    const toolbox = toolboxDoc.getElementById('toolbox');

    this.workspace = Blockly.inject(this.dom.blocklyDiv, {
      toolbox: toolbox,
      grid: { spacing: 20, length: 3, colour: '#2a2a3a', snap: true },
      zoom: { controls: false, wheel: true, startScale: 0.95, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
      trashcan: true,
      move: { scrollbars: true, drag: true, wheel: true },
      renderer: 'zelos',
      theme: Blockly.Theme.defineTheme('discord', {
        base: Blockly.Themes.Classic,
        componentStyles: {
          workspaceBackgroundColour: '#07070d',
          toolboxBackgroundColour: '#0c0c18',
          flyoutBackgroundColour: '#0c0c18',
          flyoutOpacity: 1,
          scrollbarColour: '#1a1a2a',
          insertionMarkerColour: '#7c5cfc',
          insertionMarkerOpacity: 0.3
        }
      })
    });

    this.workspace.addChangeListener(() => this.onWorkspaceChange());
    this.loadExample();
  }

  getToolbox() {
    return DISCORD_TOOLBOX_ULTIMATE || DISCORD_TOOLBOX_COMPLETE || DISCORD_TOOLBOX_WITH_IMAGES || DISCORD_TOOLBOX;
  }

  loadExample() {
    const exampleXml = `
      <xml xmlns="http://www.w3.org/1999/xpath">
        <block type="event_ready" x="30" y="20">
          <statement name="DO">
            <block type="send_message">
              <value name="TEXT">
                <shadow type="text">
                  <field name="TEXT">¡Bot online! 🚀</field>
                </shadow>
              </value>
            </block>
          </statement>
        </block>
        <block type="event_command" x="30" y="150">
          <field name="COMMAND">hola</field>
          <statement name="DO">
            <block type="reply_message">
              <value name="TEXT">
                <shadow type="text">
                  <field name="TEXT">¡Hola! ¿Cómo estás?</field>
                </shadow>
              </value>
            </block>
          </statement>
        </block>
        <block type="event_command" x="30" y="280">
          <field name="COMMAND">embed</field>
          <statement name="DO">
            <block type="send_embed">
              <value name="EMBED">
                <block type="create_embed">
                  <value name="TITLE">
                    <shadow type="text">
                      <field name="TEXT">Mi Embed</field>
                    </shadow>
                  </value>
                  <value name="DESC">
                    <shadow type="text">
                      <field name="TEXT">Esto es un embed creado con bloques</field>
                    </shadow>
                  </value>
                  <value name="COLOR">
                    <shadow type="colour_picker">
                      <field name="COLOUR">#5865F2</field>
                    </shadow>
                  </value>
                </block>
              </value>
            </block>
          </statement>
        </block>
        <block type="event_command" x="30" y="430">
          <field name="COMMAND">sugerencia</field>
          <statement name="DO">
            <block type="show_modal">
              <value name="FORM">
                <block type="create_modal">
                  <value name="TITLE">
                    <shadow type="text">
                      <field name="TEXT">Enviar sugerencia</field>
                    </shadow>
                  </value>
                  <field name="CUSTOM_ID">sugerencia</field>
                  <value name="FIELDS">
                    <block type="make_field_array">
                      <value name="A">
                        <block type="modal_field_text">
                          <value name="LABEL">
                            <shadow type="text">
                              <field name="TEXT">Título</field>
                            </shadow>
                          </value>
                          <field name="CUSTOM_ID">titulo</field>
                          <field name="REQUIRED">TRUE</field>
                        </block>
                      </value>
                      <value name="B">
                        <block type="modal_field_paragraph">
                          <value name="LABEL">
                            <shadow type="text">
                              <field name="TEXT">Descripción</field>
                            </shadow>
                          </value>
                          <field name="CUSTOM_ID">desc</field>
                          <field name="REQUIRED">TRUE</field>
                        </block>
                      </value>
                    </block>
                  </value>
                </block>
              </value>
            </block>
          </statement>
        </block>
        <block type="event_command" x="420" y="20">
          <field name="COMMAND">boton</field>
          <statement name="DO">
            <block type="send_message_with_buttons">
              <value name="TEXT">
                <shadow type="text">
                  <field name="TEXT">Mensaje con botones:</field>
                </shadow>
              </value>
              <statement name="BUTTONS">
                <block type="single_button">
                  <field name="STYLE">Success</field>
                  <field name="CUSTOM_ID">btn_ok</field>
                  <value name="LABEL">
                    <shadow type="text">
                      <field name="TEXT">Aceptar</field>
                    </shadow>
                  </value>
                  <next>
                    <block type="single_button">
                      <field name="STYLE">Danger</field>
                      <field name="CUSTOM_ID">btn_no</field>
                      <value name="LABEL">
                        <shadow type="text">
                          <field name="TEXT">Cancelar</field>
                        </shadow>
                      </value>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </statement>
        </block>
        <block type="on_button_click" x="420" y="220">
          <field name="CUSTOM_ID">btn_ok</field>
          <statement name="DO">
            <block type="reply_message">
              <value name="TEXT">
                <shadow type="text">
                  <field name="TEXT">¡Gracias por aceptar! ✅</field>
                </shadow>
              </value>
            </block>
          </statement>
        </block>
        <block type="on_button_click" x="420" y="340">
          <field name="CUSTOM_ID">btn_no</field>
          <statement name="DO">
            <block type="reply_message">
              <value name="TEXT">
                <shadow type="text">
                  <field name="TEXT">Has cancelado. ❌</field>
                </shadow>
              </value>
            </block>
          </statement>
        </block>
      </xml>
    `;

    try {
      const xml = Blockly.utils.xml.textToDom(exampleXml);
      this.workspace.clear();
      Blockly.Xml.domToWorkspace(xml, this.workspace);
    } catch (e) {
      console.log('No se pudo cargar el ejemplo:', e);
    }
  }

  onWorkspaceChange() {
    this.blockCount = this.workspace.getAllBlocks(false).length;
    this.generateCode();
    this.updateHomeStats();
    if (window.reloadSimulator) window.reloadSimulator();
  }

  // ─── Generación de código en tiempo real ───
  generateCode() {
    try {
      const rawCode = Blockly.JavaScript.workspaceToCode(this.workspace);
      this.generatedCode = this.wrapCode(rawCode);
      this.deployCommandsCode = this.generateDeployCommands();
    } catch (e) {
      this.generatedCode = '// ' + t('block.codeError') + e.message;
      this.deployCommandsCode = '// ' + t('block.noDeploy') + e.message;
    }

    this.updateExportDisplay();
  }

  updateExportDisplay() {
    if (!this.dom.codeOutput) return;
    const showDeploy = this.exportTab === 'deploy';
    const code = showDeploy ? this.deployCommandsCode : this.generatedCode;
    this.dom.codeOutput.innerHTML = '<code>' + this.escapeHtml(code) + '</code>';
    this.dom.exportLabel.textContent = showDeploy ? t('export.deployLabel') : t('export.label');
    if (this.dom.exportTabBot && this.dom.exportTabDeploy) {
      this.dom.exportTabBot.className = showDeploy ? 'btn-secondary btn-sm' : 'btn-primary btn-sm active-tab';
      this.dom.exportTabDeploy.className = showDeploy ? 'btn-primary btn-sm active-tab' : 'btn-secondary btn-sm';
    }
  }

  wrapCode(code) {
    if (!code.trim()) return '// Arrastra bloques al área de trabajo para generar código';

    return `const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log('✅ Bot conectado como', client.user.tag);
  // --- Cuando el bot esté listo ---
${this.indent(this.extractBlock(code, 'event_ready'), 2)}
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  // --- Cuando alguien envía un mensaje ---
  ${this.extractBlock(code, 'event_message') || '// (sin bloques de mensaje)'}

  // --- Comandos ---
${this.extractCommands(code)}
});

// --- Botones ---
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
${this.indent(this.extractButtons(code), 2)}
  }

  // --- Formularios Modales ---
  if (!interaction.isModalSubmit()) return;
${this.extractModals(code)}
});

client.login(process.env.TOKEN);`;
  }

  generateDeployCommands() {
    if (!this.workspace) return '// ' + t('block.noWorkspace');
    const topBlocks = this.workspace.getTopBlocks(false);
    const commands = [];

    for (const block of topBlocks) {
      if (block.type === 'event_command') {
        const name = block.getFieldValue('COMMAND') || 'comando';
        commands.push({ name, description: 'Comando /' + name, options: [] });
      }
      if (block.type === 'event_command_with_options') {
        const name = block.getFieldValue('COMMAND') || 'comando';
        const options = [];
        let optBlock = block.getInputTargetBlock('OPTIONS');
        while (optBlock) {
          if (optBlock.type === 'command_option') {
            const optName = optBlock.getFieldValue('NAME') || 'param';
            const optType = optBlock.getFieldValue('TYPE') || 'String';
            const optRequired = optBlock.getFieldValue('REQUIRED') === 'TRUE';
            const optDesc = optBlock.getFieldValue('DESC') || 'Descripción';
            const typeMap = { String: 3, Integer: 4, Boolean: 5, User: 6 };
            options.push({
              type: typeMap[optType] || 3,
              name: optName,
              description: optDesc,
              required: optRequired
            });
          }
          optBlock = optBlock.getNextBlock();
        }
        commands.push({ name, description: 'Comando /' + name, options });
      }
      if (block.type === 'event_command_with_subcommands') {
        const name = block.getFieldValue('COMMAND') || 'comando';
        const subOptions = [];
        let subBlock = block.getInputTargetBlock('SUBCOMMANDS');
        while (subBlock) {
          if (subBlock.type === 'subcommand') {
            const subName = subBlock.getFieldValue('NAME') || 'sub';
            const descBlock = subBlock.getInputTargetBlock('DESC');
            const desc = descBlock ? this.evalBlock(descBlock, {}) : 'Subcomando /' + name + ' ' + subName;
            subOptions.push({
              type: 1,
              name: subName,
              description: String(desc),
              options: []
            });
          }
          subBlock = subBlock.getNextBlock();
        }
        if (subOptions.length > 0) {
          commands.push({ name, description: 'Comando /' + name, options: subOptions });
        }
      }
    }

    if (commands.length === 0) return '// ' + t('block.noCommands');

    const json = JSON.stringify(commands, null, 2);
    return `const { REST, Routes } = require('discord.js');

const commands = ${json};

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log('🔄 Registrando ' + commands.length + ' comando(s)...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Comandos registrados exitosamente');
  } catch (error) {
    console.error('❌ Error al registrar comandos:', error);
  }
})();
`;
  }

  extractBlock(code, blockName) {
    if (!code.includes(blockName)) return '';
    const lines = code.split('\n');
    const result = [];
    let capturing = false;
    let depth = 0;

    for (const line of lines) {
      if (line.includes(blockName + ':')) {
        capturing = true;
        continue;
      }
      if (capturing) {
        if (line.includes('event_') && !line.includes(blockName)) break;
        result.push(line);
      }
    }
    return result.join('\n');
  }

  extractCommands(code) {
    const lines = code.split('\n');
    const commands = [];
    let currentCmd = null;
    let inCmd = false;

    for (const line of lines) {
      const m = line.match(/event_command_(.+):/);
      if (m) {
        if (currentCmd) commands.push(currentCmd);
        currentCmd = { name: m[1], body: [] };
        inCmd = true;
      } else if (inCmd) {
        if (line.includes('event_') && !line.includes('event_command')) {
          inCmd = false;
          if (currentCmd) commands.push(currentCmd);
          currentCmd = null;
        } else if (currentCmd) {
          currentCmd.body.push(line);
        }
      }
    }
    if (currentCmd) commands.push(currentCmd);

    if (commands.length === 0) return '  // (sin comandos definidos)';

    return commands.map(cmd => `
  if (message.content.startsWith('/${cmd.name}')) {
${cmd.body.map(l => '    ' + l).join('\n')}
  }`).join('\n');
  }

  extractModals(code) {
    const lines = code.split('\n');
    const modals = [];
    let currentModal = null;

    for (const line of lines) {
      const m = line.match(/event_modal_submit_(.+):/);
      if (m) {
        if (currentModal) modals.push(currentModal);
        currentModal = { id: m[1], body: [] };
      } else if (currentModal) {
        if (line.includes('event_')) {
          if (currentModal) modals.push(currentModal);
          currentModal = null;
        } else {
          currentModal.body.push(line);
        }
      }
    }
    if (currentModal) modals.push(currentModal);

    if (modals.length === 0) return '  // (sin formularios)';

    return modals.map(m => `
  if (interaction.customId === '${m.id}') {
${m.body.map(l => '    ' + l).join('\n')}
  }`).join('\n');
  }

  extractButtons(code) {
    const lines = code.split('\n');
    const buttons = [];
    let currentBtn = null;

    for (const line of lines) {
      const m = line.match(/event_button_(.+):/);
      if (m) {
        if (currentBtn) buttons.push(currentBtn);
        currentBtn = { id: m[1], body: [] };
      } else if (currentBtn) {
        if (line.includes('event_')) {
          if (currentBtn) buttons.push(currentBtn);
          currentBtn = null;
        } else {
          currentBtn.body.push(line);
        }
      }
    }
    if (currentBtn) buttons.push(currentBtn);

    if (buttons.length === 0) return '  // (sin botones)';

    return buttons.map(b => `
  if (interaction.customId === '${b.id}') {
${b.body.map(l => '    ' + l).join('\n')}
  }`).join('\n');
  }

  indent(text, spaces) {
    if (!text) return '';
    const indent = ' '.repeat(spaces);
    return text.split('\n').map(l => l.trim() ? indent + l : '').join('\n');
  }

  // ─── Funciones expuestas para embed-builder y form-builder ───
  generateEmbedCode(embedJson) {
    const code = `const embed = new EmbedBuilder()${this.buildEmbedChain(embedJson)};`;
    this.generatedCode += '\n\n// --- Embed generado ---\n' + code;
    this.generateCode();
    document.querySelector('.nav-btn[data-view="export"]')?.click();
  }

  generateFormCode(formData) {
    const fieldsCode = formData.fields.map(f => {
      let style = f.type === 'paragraph' ? 'TextInputStyle.Paragraph' : 'TextInputStyle.Short';
      let extra = '';
      if (f.type === 'dropdown') extra = `.addOptions([${f.options.split(',').map(o => `'${o.trim()}'`).join(', ')}])`;
      return `new TextInputBuilder()
    .setCustomId('${f.customId}')
    .setLabel('${f.label}')
    .setStyle(${style})
    .setRequired(${f.required})${extra}`;
    }).join(',\n    ');

    const code = `
const modal = new ModalBuilder()
  .setCustomId('${formData.customId}')
  .setTitle('${formData.title}')
  .addComponents(
    new ActionRowBuilder().addComponents(${fieldsCode})
  );

await interaction.showModal(modal);`;

    this.generatedCode += '\n\n// --- Formulario generado ---\n' + code;
    this.generateCode();
    document.querySelector('.nav-btn[data-view="export"]')?.click();
  }

  buildEmbedChain(embed) {
    let chain = '';
    if (embed.title) chain += `\n  .setTitle('${embed.title.replace(/'/g, "\\'")}')`;
    if (embed.description) chain += `\n  .setDescription('${embed.description.replace(/'/g, "\\'")}')`;
    if (embed.color) chain += `\n  .setColor(${embed.color})`;
    if (embed.author) {
      chain += `\n  .setAuthor({ name: '${embed.author.name.replace(/'/g, "\\'")}'`;
      if (embed.author.icon_url) chain += `, iconURL: '${embed.author.icon_url}'`;
      if (embed.author.url) chain += `, url: '${embed.author.url}'`;
      chain += ' })';
    }
    if (embed.fields) {
      embed.fields.forEach(f => {
        chain += `\n  .addFields({ name: '${f.name.replace(/'/g, "\\'")}', value: '${f.value.replace(/'/g, "\\'")}', inline: ${f.inline} })`;
      });
    }
    if (embed.image) chain += `\n  .setImage('${embed.image.url}')`;
    if (embed.thumbnail) chain += `\n  .setThumbnail('${embed.thumbnail.url}')`;
    if (embed.footer) {
      chain += `\n  .setFooter({ text: '${embed.footer.text.replace(/'/g, "\\'")}'`;
      if (embed.footer.icon_url) chain += `, iconURL: '${embed.footer.icon_url}'`;
      chain += ' })';
    }
    return chain;
  }

  // ─── Navegación ───
  bindNavigation() {
    // Navegar a una vista
    const navigateTo = (view) => {
      if (!view) return;

      this.dom.navBtns.forEach(b => b.classList.remove('active'));
      this.dom.views.forEach(v => v.classList.remove('active'));

      const btn = document.querySelector(`.nav-btn[data-view="${view}"]`);
      if (btn) btn.classList.add('active');

      const target = document.getElementById('view-' + view);
      if (target) target.classList.add('active');

      // Inicializar Blockly solo cuando la vista esté visible
      if (view === 'blocks') {
        if (!this.blocklyInitialized) {
          this.blocklyInitialized = true;
          requestAnimationFrame(() => this.initBlockly());
        } else {
          requestAnimationFrame(() => Blockly.svgResize(this.workspace));
        }
      }

      // Cargar admin cuando se abra la vista
      if (view === 'admin') {
        this.loadAdminUsers();
      }

      // Cerrar dropdown después de navegar
      document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.nav-expand.open').forEach(e => e.classList.remove('open'));
    };

    // Click en botones de navegación
    document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateTo(btn.dataset.view);
      });
    });

    // Click en links dentro de dropdowns
    document.querySelectorAll('.drop-link[data-view]').forEach(link => {
      link.addEventListener('click', () => {
        navigateTo(link.dataset.view);
      });
    });

    // Click en expansión del acordeón
    document.querySelectorAll('.nav-expand').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.dataset.target;
        const drop = document.getElementById('drop-' + target);
        if (!drop) return;

        const isOpen = drop.classList.contains('open');

        // Cerrar todos
        document.querySelectorAll('.nav-dropdown.open').forEach(d => d.classList.remove('open'));
        document.querySelectorAll('.nav-expand.open').forEach(e => e.classList.remove('open'));

        // Abrir el actual si no estaba abierto
        if (!isOpen) {
          drop.classList.add('open');
          btn.classList.add('open');
        }
      });
    });

    // Click en el header también navega
    document.querySelectorAll('.nav-section-header[data-view]').forEach(header => {
      header.addEventListener('click', (e) => {
        if (e.target.closest('.nav-expand')) return;
        navigateTo(header.dataset.view);
      });
    });
  }

  // ─── Toolbar ───
  bindToolbar() {
    this.dom.saveBtn.addEventListener('click', () => this.saveProject());

    this.dom.undoBtn.addEventListener('click', () => {
      if (this.workspace) this.workspace.undo(false);
    });

    this.dom.redoBtn.addEventListener('click', () => {
      if (this.workspace) this.workspace.undo(true);
    });

    this.dom.zoomInBtn.addEventListener('click', () => {
      if (this.workspace) {
        const scale = this.workspace.getScale();
        this.workspace.setScale(Math.min(scale * 1.3, 3));
      }
    });

    this.dom.zoomOutBtn.addEventListener('click', () => {
      if (this.workspace) {
        const scale = this.workspace.getScale();
        this.workspace.setScale(Math.max(scale * 0.7, 0.3));
      }
    });

    this.dom.deleteBlocksBtn.addEventListener('click', () => {
      if (this.workspace && confirm('¿Limpiar todos los bloques?')) {
        this.workspace.clear();
      }
    });

    this.dom.copyCodeBtn.addEventListener('click', () => {
      const code = this.exportTab === 'deploy' ? this.deployCommandsCode : this.generatedCode;
      navigator.clipboard.writeText(code).then(() => {
        const orig = this.dom.copyCodeBtn.innerHTML;
        this.dom.copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> ' + t('copied');
        setTimeout(() => { this.dom.copyCodeBtn.innerHTML = orig; }, 2000);
      });
    });

    if (this.dom.exportTabBot) {
      this.dom.exportTabBot.addEventListener('click', () => {
        this.exportTab = 'bot';
        this.updateExportDisplay();
      });
    }
    if (this.dom.exportTabDeploy) {
      this.dom.exportTabDeploy.addEventListener('click', () => {
        this.exportTab = 'deploy';
        this.updateExportDisplay();
      });
    }
  }

  // ─── Proyectos ───
  bindProjects() {
    this.dom.newProjectBtn.addEventListener('click', () => this.createNewProject());
    if (this.dom.emptyNewProjectBtn) {
      this.dom.emptyNewProjectBtn.addEventListener('click', () => this.createNewProject());
    }
  }

  ensureBlocklyReady() {
    if (!this.blocklyInitialized) {
      this.blocklyInitialized = true;
      // Mostrar vista de bloques temporalmente para inicializar
      const blocksBtn = document.querySelector('.nav-btn[data-view="blocks"]');
      this.dom.views.forEach(v => v.classList.remove('active'));
      document.getElementById('view-blocks').classList.add('active');
      this.dom.navBtns.forEach(b => b.classList.remove('active'));
      if (blocksBtn) blocksBtn.classList.add('active');
      this.initBlockly();
    }
  }

  createNewProject() {
    this.ensureBlocklyReady();
    const name = prompt('Nombre del proyecto:');
    if (!name) return;

    const project = {
      id: Date.now().toString(36),
      name: name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.workspace))
    };

    this.projects.push(project);
    this.saveProjects();
    this.renderProjects();
    this.currentProject = project;
    this.updateHomeStats();
    alert('✅ Proyecto guardado: ' + name);
  }

  saveProject() {
    if (!this.currentProject) {
      this.createNewProject();
      return;
    }
    this.ensureBlocklyReady();

    this.currentProject.updatedAt = new Date().toISOString();
    this.currentProject.blocks = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(this.workspace));
    this.saveProjects();
    alert('✅ Proyecto guardado');
  }

  loadProject(project) {
    this.ensureBlocklyReady();
    this.currentProject = project;
    try {
      const xml = Blockly.utils.xml.textToDom(project.blocks);
      this.workspace.clear();
      Blockly.Xml.domToWorkspace(xml, this.workspace);
    } catch (e) {
      console.error('Error al cargar proyecto:', e);
      alert('Error al cargar el proyecto');
    }
  }

  deleteProject(id) {
    if (!confirm('¿Eliminar este proyecto?')) return;
    this.projects = this.projects.filter(p => p.id !== id);
    if (this.currentProject && this.currentProject.id === id) {
      this.currentProject = null;
    }
    this.saveProjects();
    this.renderProjects();
    this.updateHomeStats();
  }

  renderProjects() {
    const grid = this.dom.projectsGrid;
    if (this.projects.length === 0) {
      grid.innerHTML = `
        <div class="project-card empty">
          <div class="empty-icon"><i class="fas fa-folder-open"></i></div>
          <h3>No hay proyectos aún</h3>
          <p>Crea tu primer proyecto con bloques</p>
          <button class="btn-primary" id="emptyNewProjectBtn"><i class="fas fa-plus"></i> Crear proyecto</button>
        </div>
      `;
      document.getElementById('emptyNewProjectBtn')?.addEventListener('click', () => this.createNewProject());
      return;
    }

    grid.innerHTML = this.projects.map(p => `
      <div class="project-card" data-id="${p.id}">
        <h3>${this.escapeHtml(p.name)}</h3>
        <p class="project-date">Creado: ${new Date(p.createdAt).toLocaleDateString()}</p>
        <p class="project-date">Modificado: ${new Date(p.updatedAt).toLocaleDateString()}</p>
        <div class="project-card-actions">
          <button class="btn-primary load-project-btn" data-id="${p.id}"><i class="fas fa-folder-open"></i> Abrir</button>
          <button class="btn-secondary delete-project-btn" data-id="${p.id}"><i class="fas fa-trash-can"></i> Eliminar</button>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.load-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const project = this.projects.find(p => p.id === id);
        if (project) {
          this.loadProject(project);
          document.querySelector('.nav-btn[data-view="blocks"]')?.click();
        }
      });
    });

    grid.querySelectorAll('.delete-project-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteProject(btn.dataset.id);
      });
    });
  }

  loadProjects() {
    try {
      const key = window.getUserStorageKey('projects');

      // Migrar proyectos viejos (discord_bot_projects) al nuevo sistema por usuario
      const oldData = localStorage.getItem('discord_bot_projects');
      if (oldData) {
        const newData = localStorage.getItem(key);
        if (!newData) {
          localStorage.setItem(key, oldData);
        }
        localStorage.removeItem('discord_bot_projects');
      }

      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveProjects() {
    localStorage.setItem(window.getUserStorageKey('projects'), JSON.stringify(this.projects));
  }

  // ─── Autenticación ───
  async bindAuth() {

    // Tabs login/register
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.auth + 'Form').classList.add('active');
      });
    });

    // Login
    this.dom.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this.dom.loginEmail.value.trim();
      const password = this.dom.loginPassword.value;
      if (!email || !password) {
        this.dom.loginError.textContent = t('auth.fullFields');
        this.dom.loginError.style.display = 'block';
        return;
      }
      this.dom.loginError.style.display = 'none';
      const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
      if (error) {
        this.dom.loginError.textContent = error.message === 'Invalid login credentials'
          ? t('auth.wrongCredentials')
          : error.message;
        this.dom.loginError.style.display = 'block';
        return;
      }
      this.currentUser = this._sbUserToLocal(data.user);
      this.updateAuthUI();
      this.hideAuth();
    });

    // Register
    this.dom.registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = this.dom.registerEmail.value.trim();
      const username = this.dom.registerUsername.value.trim();
      const password = this.dom.registerPassword.value;
      const confirm = this.dom.registerConfirm.value;
      if (!email || !username || !password || !confirm) {
        this.dom.registerError.textContent = t('auth.fullFields');
        this.dom.registerError.style.display = 'block';
        return;
      }
      if (password.length < 6) {
        this.dom.registerError.textContent = t('auth.minLength');
        this.dom.registerError.style.display = 'block';
        return;
      }
      if (password !== confirm) {
        this.dom.registerError.textContent = t('auth.passMismatch');
        this.dom.registerError.style.display = 'block';
        return;
      }
      this.dom.registerError.style.display = 'none';
      const { data, error } = await sbClient.auth.signUp({
        email,
        password,
        options: {
          data: { username, plan: 'free' }
        }
      });
      if (error) {
        this.dom.registerError.textContent = error.message;
        this.dom.registerError.style.display = 'block';
        return;
      }
      // Manually sign in after signup (user is auto-confirmed)
      const { data: signInData, error: signInError } = await sbClient.auth.signInWithPassword({ email, password });
      if (signInError) {
        this.dom.registerError.textContent = t('auth.registered');
        this.dom.registerError.style.display = 'block';
        return;
      }
      this.currentUser = this._sbUserToLocal(signInData.user);
      this.updateAuthUI();
      this.hideAuth();
    });

    // Forgot password
    this.dom.forgotPasswordBtn?.addEventListener('click', () => {
      const email = this.dom.loginEmail.value.trim();
      if (!email) {
        this.dom.loginError.textContent = t('auth.emailFirst');
        this.dom.loginError.style.display = 'block';
        return;
      }
      sbClient.auth.resetPasswordForEmail(email).then(({ error }) => {
        if (error) {
          this.dom.loginError.textContent = error.message;
          this.dom.loginError.style.display = 'block';
        } else {
          this.dom.loginError.textContent = t('auth.checkEmail');
          this.dom.loginError.style.display = 'block';
        }
      });
    });

    // Settings login button (toggle logout/login)
    this.dom.settingsLoginBtn?.addEventListener('click', () => {
      if (this.currentUser) {
        if (confirm(t('settings.logoutConfirm'))) this.clearSession();
      } else {
        this.showAuth();
      }
    });

    // Close auth on overlay click
    this.dom.authOverlay?.addEventListener('click', (e) => {
      if (e.target === this.dom.authOverlay) this.hideAuth();
    });

    // Sidebar user click -> go to settings
    document.getElementById('sidebarUser')?.addEventListener('click', () => {
      document.querySelector('[data-view="settings"]')?.click();
    });

    // Toggle animations
    document.getElementById('toggleAnimations')?.addEventListener('change', (e) => {
      document.querySelectorAll('.view').forEach(v => {
        v.style.animation = e.target.checked ? '' : 'none';
      });
    });

    // Toggle dark mode
    document.getElementById('toggleDarkMode')?.addEventListener('change', (e) => {
      if (e.target.checked) {
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
      }
      localStorage.setItem('commanderbot_dark_mode', e.target.checked ? '1' : '0');
    });

    // Restore dark mode preference
    const darkModePref = localStorage.getItem('commanderbot_dark_mode');
    if (darkModePref === '0') {
      document.getElementById('toggleDarkMode').checked = false;
      document.documentElement.classList.add('light');
    }

    // Listen for auth state changes
    sbClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.currentUser = null;
        this.updateAuthUI();
      }
    });
  }

  _sbUserToLocal(sbUser) {
    if (!sbUser) return null;
    const meta = sbUser.user_metadata || {};
    const isAdmin = meta.admin === true;
    return {
      id: sbUser.id,
      email: sbUser.email,
      username: meta.username || sbUser.email?.split('@')[0] || 'Usuario',
      plan: isAdmin ? 'premium' : (meta.plan || 'free'),
      admin: isAdmin,
      createdAt: sbUser.created_at
    };
  }

  isAdmin() {
    return this.currentUser && this.currentUser.admin === true;
  }

  refreshUser() {
    sbClient.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const fresh = this._sbUserToLocal(user);
        const changed = fresh.admin !== this.currentUser?.admin ||
          fresh.plan !== this.currentUser?.plan ||
          fresh.username !== this.currentUser?.username;
        if (changed) {
          console.log('[Auth] refreshUser: user updated', { admin: fresh.admin, plan: fresh.plan, username: fresh.username });
          this.currentUser = fresh;
          this.updateAuthUI();
        }
      }
    }).catch(err => console.error('[Auth] refreshUser error:', err));
  }

  loadSession() {
    try {
      const key = 'sb-onnwozcmmudsdcypletl-auth-token';
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user) return this._sbUserToLocal(parsed.user);
      }
    } catch {}
    try {
      const data = JSON.parse(localStorage.getItem('commanderbot_session') || 'null');
      if (data && data.username) {
        const users = JSON.parse(localStorage.getItem('commanderbot_users') || '{}');
        if (users[data.username]) return users[data.username];
      }
    } catch {}
    return null;
  }

  async clearSession() {
    await sbClient.auth.signOut();
    localStorage.removeItem('commanderbot_session');
    this.currentUser = null;
    this.updateAuthUI();
  }

  showAuth() {
    this.dom.authOverlay?.classList.add('active');
    this.dom.loginEmail.value = '';
    this.dom.loginPassword.value = '';
    this.dom.registerEmail.value = '';
    this.dom.registerUsername.value = '';
    this.dom.registerPassword.value = '';
    this.dom.registerConfirm.value = '';
    this.dom.loginError.style.display = 'none';
    this.dom.registerError.style.display = 'none';
  }

  hideAuth() {
    this.dom.authOverlay?.classList.remove('active');
  }

  updateAuthUI() {
    if (this.currentUser) {
      this.dom.sidebarUser.style.display = 'flex';
      this.dom.userName.textContent = this.currentUser.username;
      const plan = this.currentUser.plan || 'free';
      const planLabels = { free: t('free'), pro: t('pro'), premium: t('premium') };
      this.dom.userPlan.textContent = planLabels[plan] || t('free');
      if (plan === 'premium') this.dom.userPlan.className = 'user-plan premium';
      else this.dom.userPlan.className = 'user-plan';
      const initials = this.currentUser.username.substring(0, 2).toUpperCase();
      this.dom.userAvatar.textContent = initials;
      this.dom.settingsUsername.textContent = this.currentUser.username;
      const planDesc = plan === 'free' ? t('settings.freePlan')
        : plan === 'pro' ? t('settings.proPlan')
        : t('settings.premiumPlan');
      this.dom.settingsPlan.textContent = planDesc;
      this.dom.settingsBadge.textContent = planLabels[plan] || t('free');
      this.dom.settingsBadge.className = 'settings-badge ' + plan;
      if (this.isAdmin()) {
        this.dom.settingsBadge.textContent = '👑 Admin';
        this.dom.settingsBadge.className = 'settings-badge premium';
        this.dom.userPlan.textContent = 'Admin';
        this.dom.userPlan.className = 'user-plan premium';
      }
      const adminNav = document.getElementById('navAdmin');
      if (adminNav) adminNav.style.display = this.isAdmin() ? 'block' : 'none';
      this.dom.settingsLoginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> ' + t('settings.logout');
    } else {
      this.dom.sidebarUser.style.display = 'none';
      this.dom.settingsUsername.textContent = t('settings.notLogged');
      this.dom.settingsPlan.textContent = t('settings.freePlan');
      this.dom.settingsBadge.textContent = t('free');
      this.dom.settingsBadge.className = 'settings-badge free';
      this.dom.settingsLoginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + t('settings.login');
      const adminNav = document.getElementById('navAdmin');
      if (adminNav) adminNav.style.display = 'none';
    }
    // Update data-i18n elements that were translated via attributes
    translatePage();
  }

  // ─── Extraer comandos del workspace para el simulador ───
  getSimulatorCommands() {
    const commands = {};
    if (!this.workspace) return commands;

    const topBlocks = this.workspace.getTopBlocks(false);
    for (const block of topBlocks) {
      if (block.type === 'event_command') {
        const cmdName = block.getFieldValue('COMMAND');
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands[cmdName] = actions;
      }
      if (block.type === 'on_button_click') {
        const btnId = block.getFieldValue('CUSTOM_ID');
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__btn_' + btnId] = actions;
      }
      if (block.type === 'event_modal_submit') {
        const modalId = block.getFieldValue('CUSTOM_ID');
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__modal_' + modalId] = actions;
      }
      if (block.type === 'event_member_join') {
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__event_member_join'] = actions;
      }
      if (block.type === 'event_member_leave') {
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__event_member_leave'] = actions;
      }
      if (block.type === 'event_reaction_add') {
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__event_reaction_add'] = actions;
      }
      if (block.type === 'event_reaction_remove') {
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__event_reaction_remove'] = actions;
      }
      if (block.type === 'event_command_with_options') {
        const cmdName = block.getFieldValue('COMMAND');
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands[cmdName] = actions;
      }
      if (block.type === 'event_command_with_subcommands') {
        const cmdName = block.getFieldValue('COMMAND');
        let subBlock = block.getInputTargetBlock('SUBCOMMANDS');
        while (subBlock) {
          if (subBlock.type === 'subcommand') {
            const subName = subBlock.getFieldValue('NAME') || 'sub';
            const actions = [];
            this.traverseStatements(subBlock.getInputTargetBlock('DO'), actions);
            commands[cmdName + '_' + subName] = actions;
          }
          subBlock = subBlock.getNextBlock();
        }
      }
      if (block.type === 'on_select_menu') {
        const menuId = block.getFieldValue('CUSTOM_ID');
        const actions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), actions);
        commands['__select_' + menuId] = actions;
      }
    }
    return commands;
  }

  traverseStatements(block, actions, context) {
    context = context || {};
    while (block) {
      if (block.type === 'set_variable') {
        context[block.getFieldValue('VAR_NAME') || 'variable'] = this.evalBlock(block.getInputTargetBlock('VALUE'), context);
      } else if (block.type === 'for_each') {
        const varName = block.getFieldValue('VAR') || 'item';
        const items = this.evalArrayBlock(block.getInputTargetBlock('ARRAY'), context);
        if (items && items.length > 0) {
          items.forEach(item => {
            const ctx = Object.assign({}, context, { [varName]: item });
            this.traverseStatements(block.getInputTargetBlock('DO'), actions, ctx);
          });
        }
      } else if (block.type === 'save_data_template') {
        const templateName = block.getFieldValue('TEMPLATE_NAME') || 'mi_plantilla';
        const key = this.evalBlock(block.getInputTargetBlock('KEY'), context);
        const value = this.evalBlock(block.getInputTargetBlock('VALUE'), context);
        if (key) {
          try {
            const storageKey = window.getUserStorageKey('data_' + templateName);
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            data[key] = value;
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch(e) { /* localStorage not available */ }
        }
      } else if (block.type === 'template_add_value') {
        const templateName = block.getFieldValue('TEMPLATE_NAME') || 'mi_plantilla';
        const key = this.evalBlock(block.getInputTargetBlock('KEY'), context);
        const value = this.evalBlock(block.getInputTargetBlock('VALUE'), context);
        if (key) {
          try {
            const storageKey = window.getUserStorageKey('data_' + templateName);
            const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
            const arr = data[key] || [];
            arr.push(value);
            data[key] = arr;
            localStorage.setItem(storageKey, JSON.stringify(data));
          } catch(e) { /* localStorage not available */ }
        }
      } else if (block.type === 'if_condition') {
        const cond = !!this.evalBlock(block.getInputTargetBlock('COND'), context);
        if (cond) {
          this.traverseStatements(block.getInputTargetBlock('DO'), actions, context);
        } else {
          this.traverseStatements(block.getInputTargetBlock('ELSE'), actions, context);
        }
      } else if (block.type === 'for_i') {
        const varName = block.getFieldValue('VAR') || 'i';
        const from = parseInt(this.evalBlock(block.getInputTargetBlock('FROM'), context)) || 0;
        const to = parseInt(this.evalBlock(block.getInputTargetBlock('TO'), context)) || 0;
        for (let i = from; i <= to; i++) {
          const ctx = Object.assign({}, context, { [varName]: i });
          this.traverseStatements(block.getInputTargetBlock('DO'), actions, ctx);
        }
      } else if (block.type === 'schedule_after') {
        const secs = parseFloat(this.evalBlock(block.getInputTargetBlock('SECONDS'), context)) || 0;
        const scheduledActions = [];
        this.traverseStatements(block.getInputTargetBlock('DO'), scheduledActions, Object.assign({}, context));
        setTimeout(() => {
          scheduledActions.forEach((a, i) => {
            setTimeout(() => {
              if (window.simulator) window.simulator.executeAction(a, window.simulator.currentChannel);
            }, i * 600);
          });
        }, secs * 1000);
        actions.push({ type: '_scheduled', seconds: secs });
      } else if (block.type === 'db_transaction') {
        const name = block.getFieldValue('NAME') || 'transaccion';
        const db = window.simulator?.db;
        if (db) {
          const savedState = JSON.parse(JSON.stringify(db.tables));
          const savedId = db.lastId;
          try {
            this.traverseStatements(block.getInputTargetBlock('DO'), actions, Object.assign({}, context));
            actions.push({ type: '_transaction_commit', name });
          } catch (e) {
            db.tables = savedState;
            db.lastId = savedId;
            actions.push({ type: '_transaction_rollback', name });
          }
        } else {
          this.traverseStatements(block.getInputTargetBlock('DO'), actions, Object.assign({}, context));
          actions.push({ type: '_transaction_commit', name });
        }
      } else if (block.type === 'raw_javascript') {
        const code = block.getFieldValue('CODE') || '';
        actions.push({ type: '_raw_js', code });
      } else if (block.type === 'db_run') {
        const sql = this.evalBlock(block.getInputTargetBlock('SQL'), context);
        const params = this.parseDbParams(block, context);
        if (window.simulator && window.simulator.db) {
          try { window.simulator.db.run(sql, params); } catch(e) { console.warn('DB error:', e); }
        }
        actions.push({ type: '_db_run', sql, params });
      } else if (block.type === 'db_create_table') {
        const tableName = block.getFieldValue('TABLE') || 'mi_tabla';
        const columns = [];
        let colBlock = block.getInputTargetBlock('COLUMNS');
        while (colBlock) {
          if (colBlock.type === 'db_column') {
            const col = {
              name: colBlock.getFieldValue('NAME') || 'campo',
              type: colBlock.getFieldValue('TYPE') || 'TEXT',
              pk: colBlock.getFieldValue('PK') === 'TRUE',
              notNull: colBlock.getFieldValue('NOT_NULL') === 'TRUE',
              default: this.evalBlock(colBlock.getInputTargetBlock('DEFAULT'), context)
            };
            columns.push(col);
          }
          colBlock = colBlock.getNextBlock();
        }
        if (window.simulator && window.simulator.db) {
          window.simulator.db.createTable(tableName, columns);
        }
        actions.push({ type: '_db_create_table', table: tableName, columns });
      } else {
        const action = this.parseBlockAction(block, context);
        if (action) actions.push(action);
      }
      block = block.getNextBlock();
    }
  }

  evalBlock(block, context) {
    if (!block) return '';
    if (block.type === 'text') return block.getFieldValue('TEXT') || '';
    if (block.type === 'math_number') return parseFloat(block.getFieldValue('NUM')) || 0;
    if (block.type === 'colour_picker') return block.getFieldValue('COLOUR') || '#5865F2';
    if (block.type === 'get_variable') {
      const varName = block.getFieldValue('VAR_NAME') || 'variable';
      return context[varName] !== undefined ? context[varName] : '';
    }
    if (block.type === 'text_concat') {
      const a = this.evalBlock(block.getInputTargetBlock('A'), context);
      const b = this.evalBlock(block.getInputTargetBlock('B'), context);
      return (a || '') + (b || '');
    }
    if (block.type === 'text_split') {
      const text = this.evalBlock(block.getInputTargetBlock('TEXT'), context);
      const delim = this.evalBlock(block.getInputTargetBlock('DELIM'), context);
      return (text || '').split(delim || ',');
    }
    if (block.type === 'array_get') {
      const arr = this.evalArrayBlock(block.getInputTargetBlock('ARRAY'), context);
      const idx = this.evalBlock(block.getInputTargetBlock('INDEX'), context);
      return (arr && idx != null) ? (arr[parseInt(idx)] || '') : '';
    }
    if (block.type === 'array_length') {
      const arr = this.evalArrayBlock(block.getInputTargetBlock('ARRAY'), context);
      return arr ? arr.length : 0;
    }
    if (block.type === 'array_join') {
      const arr = this.evalArrayBlock(block.getInputTargetBlock('ARRAY'), context);
      const sep = this.evalBlock(block.getInputTargetBlock('SEPARATOR'), context);
      return (arr || []).join(sep || ',');
    }
    if (block.type === 'get_data_template') {
      const templateName = block.getFieldValue('TEMPLATE_NAME') || 'mi_plantilla';
      const key = this.evalBlock(block.getInputTargetBlock('KEY'), context);
      try {
        const storageKey = window.getUserStorageKey('data_' + templateName);
        const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
        return data[key] || '';
      } catch { return ''; }
    }
    if (block.type === 'list_data_templates') {
      try {
        const names = [];
        const prefix = 'commanderbot_data_';
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(prefix)) {
            names.push(key.substring(prefix.length));
          }
        }
        return names;
      } catch { return []; }
    }
    if (block.type === 'list_form_templates') {
      try {
        const data = localStorage.getItem(window.getUserStorageKey('forms'));
        const templates = data ? JSON.parse(data) : [];
        return templates.map(t => t.name);
      } catch { return []; }
    }
    if (block.type === 'has_role') {
      const user = this.evalBlock(block.getInputTargetBlock('USER'), context);
      const role = this.evalBlock(block.getInputTargetBlock('ROLE'), context);
      return user && role; // Simulación simplificada: true si ambos tienen valor
    }
    if (block.type === 'get_role_by_name') {
      return this.evalBlock(block.getInputTargetBlock('NAME'), context) || '';
    }
    if (block.type === 'get_channel_by_name') {
      const name = this.evalBlock(block.getInputTargetBlock('NAME'), context);
      const sim = window.simulator;
      return sim && sim.channels && sim.channels.includes(name) ? '#' + name : '';
    }
    if (block.type === 'user_mention') return '@usuario';
    if (block.type === 'channel_mention') {
      const sim = window.simulator;
      return sim ? '#' + sim.currentChannel : '#general';
    }
    if (block.type === 'get_username') return 'Usuario_' + Date.now().toString().slice(-4);
    if (block.type === 'get_user_id') return '123456789012345678';
    if (block.type === 'random_number') {
      const min = parseInt(this.evalBlock(block.getInputTargetBlock('MIN'), context)) || 0;
      const max = parseInt(this.evalBlock(block.getInputTargetBlock('MAX'), context)) || 100;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    if (block.type === 'text_contains') {
      const text = this.evalBlock(block.getInputTargetBlock('TEXT'), context) || '';
      const substr = this.evalBlock(block.getInputTargetBlock('SUBSTR'), context) || '';
      return text.includes(substr);
    }
    if (block.type === 'math_arithmetic') {
      const a = parseFloat(this.evalBlock(block.getInputTargetBlock('A'), context)) || 0;
      const b = parseFloat(this.evalBlock(block.getInputTargetBlock('B'), context)) || 0;
      const op = block.getFieldValue('OP');
      switch (op) {
        case 'ADD': return a + b;
        case 'MINUS': return a - b;
        case 'MULTIPLY': return a * b;
        case 'DIVIDE': return b !== 0 ? a / b : 0;
        case 'POWER': return Math.pow(a, b);
        default: return 0;
      }
    }
    if (block.type === 'logic_compare') {
      const a = this.evalBlock(block.getInputTargetBlock('A'), context);
      const b = this.evalBlock(block.getInputTargetBlock('B'), context);
      const op = block.getFieldValue('OP');
      switch (op) {
        case 'EQ': return a === b;
        case 'NEQ': return a !== b;
        case 'LT': return a < b;
        case 'LTE': return a <= b;
        case 'GT': return a > b;
        case 'GTE': return a >= b;
        default: return false;
      }
    }
    if (block.type === 'logic_boolean') return block.getFieldValue('BOOL') === 'TRUE';
    if (block.type === 'logic_operation') {
      const a = !!this.evalBlock(block.getInputTargetBlock('A'), context);
      const b = !!this.evalBlock(block.getInputTargetBlock('B'), context);
      const op = block.getFieldValue('OP');
      return op === 'AND' ? (a && b) : (a || b);
    }
    // DB queries
    if (block.type === 'db_select_all') {
      const sql = this.evalBlock(block.getInputTargetBlock('SQL'), context);
      const params = this.parseDbParams(block, context);
      if (window.simulator && window.simulator.db) {
        try { return window.simulator.db.selectAll(sql, params); } catch { return []; }
      }
      return [];
    }
    if (block.type === 'db_select_one') {
      const all = this.evalBlock(block, context);
      return Array.isArray(all) && all.length > 0 ? all[0] : null;
    }
    if (block.type === 'db_get') {
      const sql = this.evalBlock(block.getInputTargetBlock('SQL'), context);
      const params = this.parseDbParams(block, context);
      if (window.simulator && window.simulator.db) {
        try {
          const rows = window.simulator.db.selectAll(sql, params);
          if (rows.length > 0) {
            const vals = Object.values(rows[0]);
            return vals.length > 0 ? String(vals[0]) : '';
          }
        } catch { return ''; }
      }
      return '';
    }
    if (block.type === 'db_count') {
      const sql = this.evalBlock(block.getInputTargetBlock('SQL'), context);
      const params = this.parseDbParams(block, context);
      if (window.simulator && window.simulator.db) {
        try {
          const rows = window.simulator.db.selectAll(sql, params);
          return rows.length;
        } catch { return 0; }
      }
      return 0;
    }
    if (block.type === 'db_result') {
      const row = this.evalBlock(block.getInputTargetBlock('ROW'), context);
      const field = block.getFieldValue('FIELD') || 'campo';
      return (row && typeof row === 'object') ? (row[field] !== undefined ? String(row[field]) : '') : '';
    }
    if (block.type === 'db_result_array') {
      const rows = this.evalBlock(block.getInputTargetBlock('ROWS'), context);
      const index = parseInt(this.evalBlock(block.getInputTargetBlock('INDEX'), context)) || 0;
      const field = block.getFieldValue('FIELD') || 'campo';
      if (Array.isArray(rows) && rows[index]) {
        return rows[index][field] !== undefined ? String(rows[index][field]) : '';
      }
      return '';
    }
    if (block.type === 'db_last_id') {
      if (window.simulator && window.simulator.db) return window.simulator.db.lastId;
      return 0;
    }
    // Select menus
    if (block.type === 'select_get_value') {
      return context._selectedValue || '';
    }
    if (block.type === 'select_get_label') {
      return context._selectedLabel || '';
    }
    // Command options
    if (block.type === 'get_option') {
      const name = block.getFieldValue('NAME') || 'param';
      return context._options && context._options[name] !== undefined ? context._options[name] : '';
    }
    // Raw JS
    if (block.type === 'raw_javascript_expr') {
      try {
        const code = block.getFieldValue('CODE') || 'null';
        const fn = new Function(...Object.keys(context), 'return (' + code + ')');
        return fn(...Object.values(context));
      } catch { return ''; }
    }
    // Utils
    if (block.type === 'number_format') {
      const num = parseFloat(this.evalBlock(block.getInputTargetBlock('NUM'), context)) || 0;
      const dec = parseInt(this.evalBlock(block.getInputTargetBlock('DECIMALS'), context)) || 0;
      return num.toLocaleString('es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    }
    if (block.type === 'create_object') {
      const obj = {};
      let pBlock = block.getInputTargetBlock('PAIRS');
      while (pBlock) {
        if (pBlock.type === 'object_pair') {
          const key = pBlock.getFieldValue('KEY') || 'clave';
          obj[key] = this.evalBlock(pBlock.getInputTargetBlock('VALUE'), context);
        }
        pBlock = pBlock.getNextBlock();
      }
      return obj;
    }
    if (block.type === 'object_get') {
      const obj = this.evalBlock(block.getInputTargetBlock('OBJ'), context);
      const key = block.getFieldValue('KEY') || 'clave';
      return (obj && typeof obj === 'object') ? (obj[key] !== undefined ? String(obj[key]) : '') : '';
    }
    if (block.type === 'object_set') {
      const obj = this.evalBlock(block.getInputTargetBlock('OBJ'), context);
      const key = block.getFieldValue('KEY') || 'clave';
      const val = this.evalBlock(block.getInputTargetBlock('VALUE'), context);
      if (obj && typeof obj === 'object') obj[key] = val;
      return '';
    }
    if (block.type === 'array_create') {
      const arr = [];
      let iBlock = block.getInputTargetBlock('ITEMS');
      while (iBlock) {
        if (iBlock.type === 'array_item') {
          arr.push(this.evalBlock(iBlock.getInputTargetBlock('VALUE'), context));
        }
        iBlock = iBlock.getNextBlock();
      }
      return arr;
    }
    if (block.type === 'array_push') {
      const arr = this.evalArrayBlock(block.getInputTargetBlock('ARRAY'), context);
      const val = this.evalBlock(block.getInputTargetBlock('VALUE'), context);
      arr.push(val);
      return arr;
    }
    if (block.type === 'build_option') {
      return {
        label: this.evalBlock(block.getInputTargetBlock('LABEL'), context) || 'Opción',
        value: this.evalBlock(block.getInputTargetBlock('VALUE'), context) || 'opcion',
        description: this.evalBlock(block.getInputTargetBlock('DESC'), context) || ''
      };
    }
    return '';
  }

  parseDbParams(block, context) {
    const params = {};
    let pBlock = block.getInputTargetBlock('PARAMS');
    while (pBlock) {
      if (pBlock.type === 'db_param') {
        const name = pBlock.getFieldValue('NAME') || 'p';
        const val = this.evalBlock(pBlock.getInputTargetBlock('VALUE'), context);
        params[name] = val;
      }
      pBlock = pBlock.getNextBlock();
    }
    return params;
  }

  evalArrayBlock(block, context) {
    const val = this.evalBlock(block, context);
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }

  parseBlockAction(block, context) {
    context = context || {};
    switch (block.type) {
      case 'send_message':
        return { type: 'send_message', text: this.evalInputValue(block, 'TEXT', context), channel: block.getFieldValue('CHANNEL') || 'current' };
      case 'reply_message':
        return { type: 'reply_message', text: this.evalInputValue(block, 'TEXT', context) };
      case 'send_embed':
        return { type: 'send_embed', embed: this.parseEmbedBlock(block.getInputTargetBlock('EMBED'), context), channel: block.getFieldValue('CHANNEL') || 'current' };
      case 'send_message_with_buttons':
        return {
          type: 'send_message_buttons',
          text: this.evalInputValue(block, 'TEXT', context),
          buttons: this.parseButtonStack(block.getInputTargetBlock('BUTTONS'), context),
          channel: block.getFieldValue('CHANNEL') || 'current'
        };
      case 'show_modal':
        return { type: 'show_modal', modal: this.parseModalBlock(block.getInputTargetBlock('FORM'), context) };
      case 'use_form_template':
        return { type: 'show_modal', modal: this.parseTemplateModal(block) };
      case 'send_image':
        return { type: 'send_image', url: this.evalInputValue(block, 'URL', context) };
      case 'send_dm':
        return { type: 'send_dm', user: this.evalInputValue(block, 'USER', context), text: this.evalInputValue(block, 'TEXT', context) };
      case 'add_reaction':
        return { type: 'add_reaction', emoji: this.evalInputValue(block, 'EMOJI', context) };
      case 'delete_message':
        return { type: 'delete_message' };
      case 'add_role':
        return { type: 'add_role', role: this.evalInputValue(block, 'ROLE', context), user: this.evalInputValue(block, 'USER', context) };
      case 'remove_role':
        return { type: 'remove_role', role: this.evalInputValue(block, 'ROLE', context), user: this.evalInputValue(block, 'USER', context) };
      case 'kick_user':
        return { type: 'kick_user', user: this.evalInputValue(block, 'USER', context), reason: this.evalInputValue(block, 'REASON', context) };
      case 'ban_user':
        return { type: 'ban_user', user: this.evalInputValue(block, 'USER', context), reason: this.evalInputValue(block, 'REASON', context) };
      case 'timeout_user':
        return { type: 'timeout_user', user: this.evalInputValue(block, 'USER', context), minutes: this.evalInputValue(block, 'MINUTES', context), reason: this.evalInputValue(block, 'REASON', context) };
      case 'create_channel':
        return { type: 'create_channel', name: this.evalInputValue(block, 'NAME', context) };
      case 'send_select_menu':
        return {
          type: 'send_select_menu',
          text: this.evalInputValue(block, 'TEXT', context),
          options: this.parseSelectOptions(block, context),
          menuId: 'menu_' + Date.now(),
          channel: block.getFieldValue('CHANNEL') || 'current'
        };
      case 'send_select_menu_dynamic':
        return {
          type: 'send_select_menu',
          text: this.evalInputValue(block, 'TEXT', context),
          options: this.evalArrayBlock(block.getInputTargetBlock('OPTIONS'), context) || [],
          menuId: 'menu_' + Date.now(),
          channel: block.getFieldValue('CHANNEL') || 'current'
        };
      case 'send_paginated_embeds':
        return {
          type: 'send_paginated_embeds',
          content: this.evalInputValue(block, 'CONTENT', context) || '',
          pages: this.evalArrayBlock(block.getInputTargetBlock('PAGES'), context) || [],
          channel: block.getFieldValue('CHANNEL') || 'current'
        };
      case 'defer_reply':
        return { type: 'defer_reply', ephemeral: block.getFieldValue('EPHEMERAL') === 'TRUE' };
      case 'edit_reply':
        return { type: 'edit_reply', text: this.evalInputValue(block, 'CONTENT', context) || '' };
      default:
        return { type: block.type };
    }
  }

  evalInputValue(block, inputName, context) {
    if (!block) return '';
    const target = block.getInputTargetBlock(inputName);
    if (!target) return '';
    return this.evalBlock(target, context) || '';
  }

  getFieldTextValue(block, fieldName) {
    if (!block) return '';
    const target = block.getInputTargetBlock(fieldName);
    if (!target) return '';
    if (target.type === 'text') return target.getFieldValue('TEXT') || '';
    if (target.type === 'colour_picker') return target.getFieldValue('COLOUR') || '#5865F2';
    if (target.type === 'math_number') return target.getFieldValue('NUM') || '0';
    return `[${fieldName}]`;
  }

  parseEmbedBlock(block, context) {
    if (!block || block.type !== 'create_embed') return null;
    const colorBlock = block.getInputTargetBlock('COLOR');
    const embed = {
      title: this.evalInputValue(block, 'TITLE', context),
      description: this.evalInputValue(block, 'DESC', context),
      color: colorBlock && colorBlock.type === 'colour_picker' ? (colorBlock.getFieldValue('COLOUR') || '#5865F2') : '#5865F2'
    };
    const fieldName = this.evalInputValue(block, 'FIELD_NAME', context);
    const fieldVal = this.evalInputValue(block, 'FIELD_VAL', context);
    if (fieldName && fieldVal) {
      embed.fields = [{ name: fieldName, value: fieldVal, inline: block.getFieldValue('FIELD_INLINE') === 'TRUE' }];
    }
    return embed;
  }

  parseButtonStack(block, context) {
    const buttons = [];
    let btnBlock = block;
    while (btnBlock) {
      if (btnBlock.type === 'single_button') {
        buttons.push({
          label: this.evalInputValue(btnBlock, 'LABEL', context) || 'Botón',
          style: btnBlock.getFieldValue('STYLE') || 'Primary',
          id: this.evalInputValue(btnBlock, 'CUSTOM_ID', context) || 'btn'
        });
      }
      btnBlock = btnBlock.getNextBlock();
    }
    return buttons;
  }

  parseSelectOptions(block, context) {
    const options = [];
    let optBlock = block.getInputTargetBlock('OPTIONS');
    while (optBlock) {
      if (optBlock.type === 'select_option') {
        options.push({
          label: this.evalInputValue(optBlock, 'LABEL', context) || 'Opción',
          value: optBlock.getFieldValue('VALUE') || 'opcion',
          description: this.evalInputValue(optBlock, 'DESC', context) || ''
        });
      }
      optBlock = optBlock.getNextBlock();
    }
    return options;
  }

  parseModalBlock(block, context) {
    if (!block || block.type !== 'create_modal') return null;
    return {
      title: this.evalInputValue(block, 'TITLE', context),
      customId: block.getFieldValue('CUSTOM_ID') || 'form',
      fields: this.parseFieldArray(block.getInputTargetBlock('FIELDS'), context)
    };
  }

  parseFieldArray(block, context) {
    if (!block || block.type !== 'make_field_array') return [];
    const fields = [];
    ['A', 'B', 'C'].forEach(key => {
      const fb = block.getInputTargetBlock(key);
      if (fb) {
        const f = this.parseFieldBlock(fb, context);
        if (f) fields.push(f);
      }
    });
    return fields;
  }

  parseFieldBlock(block, context) {
    if (!block) return null;
    const ftype = block.type;
    if (ftype === 'modal_field_text' || ftype === 'modal_field_paragraph') {
      return {
        type: ftype === 'modal_field_text' ? 'short' : 'paragraph',
        label: this.evalInputValue(block, 'LABEL', context),
        customId: block.getFieldValue('CUSTOM_ID') || 'campo',
        required: block.getFieldValue('REQUIRED') === 'TRUE',
        value: this.evalInputValue(block, 'VALUE', context)
      };
    }
    if (ftype === 'modal_field_dropdown') {
      return {
        type: 'dropdown',
        label: this.evalInputValue(block, 'LABEL', context),
        customId: block.getFieldValue('CUSTOM_ID') || 'campo',
        required: block.getFieldValue('REQUIRED') === 'TRUE',
        options: this.evalInputValue(block, 'OPTIONS', context)
      };
    }
    return null;
  }

  parseTemplateModal(block) {
    const name = block.getFieldValue('TEMPLATE');
    if (!name) return null;
    try {
      const data = localStorage.getItem('discord_form_templates');
      const templates = data ? JSON.parse(data) : [];
      const t = templates.find(t => t.name === name);
      if (!t) return null;
      return {
        title: t.data.title || 'Formulario',
        customId: t.data.customId || 'form',
        fields: t.data.fields || []
      };
    } catch { return null; }
  }

  updateHomeStats() {
    if (window.homePage) {
      window.homePage.updateStats(this.blockCount, this.projects.length);
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Admin Panel ───
  initAdmin() {
    this.adminEditingId = null;
    this.adminUsers = [];

    this.dom.adminSearch.addEventListener('input', () => this.filterAdminUsers());

    this.dom.adminEditClose.addEventListener('click', () => this.closeAdminEdit());
    this.dom.adminEditCancel.addEventListener('click', () => this.closeAdminEdit());
    this.dom.adminEditModal.addEventListener('click', (e) => {
      if (e.target === this.dom.adminEditModal) this.closeAdminEdit();
    });
    this.dom.adminEditSave.addEventListener('click', () => this.saveAdminEdit());
  }

  openAdminEditFromTable(id) {
    const user = this.adminUsers.find(u => u.id === id);
    if (user) this.openAdminEdit(user);
  }

  async loadAdminUsers() {
    this.dom.adminLoading.style.display = 'block';
    this.dom.adminTableBody.innerHTML = '';
    try {
      const { data: { session }, error: sessErr } = await sbClient.auth.getSession();
      if (sessErr) throw new Error('Session error: ' + sessErr.message);
      if (!session) throw new Error('No hay sesión activa. Inicia sesión.');
      console.log('[Admin] Session OK, fetching users...');
      const resp = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (!resp.ok) {
        const errBody = await resp.text();
        console.error('[Admin] API error:', resp.status, errBody);
        if (resp.status === 403) {
          this.dom.adminLoading.innerHTML = '<span style="color:var(--danger);">⛔ Acceso denegado (no eres admin)</span>';
          return;
        }
        throw new Error('HTTP ' + resp.status + ': ' + errBody);
      }
      const data = await resp.json();
      console.log('[Admin] Users loaded:', data.users?.length || 0);
      this.adminUsers = data.users || [];
      this.renderAdminTable(this.adminUsers);
      this.dom.adminLoading.style.display = 'none';
      this.dom.adminCount.textContent = this.adminUsers.length + ' ' + t('admin.users');
    } catch (err) {
      console.error('[Admin] Load error:', err);
      this.dom.adminLoading.innerHTML = '<span style="color:var(--danger);">⚠️ ' + this.escapeHtml(err.message || t('admin.loadError')) + '</span>';
    }
  }

  renderAdminTable(users) {
    const tbody = this.dom.adminTableBody;
    if (!users.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);"><i class="fas fa-inbox"></i> ' + t('admin.noUsers') + '</td></tr>';
      return;
    }
    tbody.innerHTML = users.map(u => {
      const meta = u.user_metadata || {};
      const plan = meta.plan || 'free';
      const isAdmin = meta.admin === true;
      const created = u.created_at ? new Date(u.created_at).toLocaleDateString() : '-';
      const email = this.escapeHtml(u.email || '');
      const username = this.escapeHtml(meta.username || email.split('@')[0] || '-');
      return `<tr>
        <td>${email}</td>
        <td><strong>${username}</strong></td>
        <td><span class="plan-badge ${plan}">${plan}</span></td>
        <td>${isAdmin ? '<span class="admin-badge"><i class="fas fa-check-circle"></i> ' + t('admin.yes') + '</span>' : t('admin.no')}</td>
        <td>${created}</td>
        <td><button class="btn-icon" onclick="window.app.openAdminEditFromTable('${u.id}')"><i class="fas fa-edit"></i></button></td>
      </tr>`;
    }).join('');
  }

  filterAdminUsers() {
    const q = this.dom.adminSearch.value.toLowerCase().trim();
    if (!q) {
      this.renderAdminTable(this.adminUsers);
      this.dom.adminCount.textContent = this.adminUsers.length + ' ' + t('admin.users');
      return;
    }
    const filtered = this.adminUsers.filter(u => {
      const meta = u.user_metadata || {};
      const email = (u.email || '').toLowerCase();
      const username = (meta.username || '').toLowerCase();
      return email.includes(q) || username.includes(q);
    });
    this.renderAdminTable(filtered);
    this.dom.adminCount.textContent = filtered.length + ' ' + t('admin.users');
  }

  openAdminEdit(user) {
    this.adminEditingId = user.id;
    const meta = user.user_metadata || {};
    this.dom.adminEditEmail.value = user.email || '';
    this.dom.adminEditUsername.value = meta.username || '';
    this.dom.adminEditPlan.value = meta.plan || 'free';
    this.dom.adminEditAdminToggle.checked = meta.admin === true;

    // Datos adicionales del modal mejorado
    const name = meta.username || (user.email ? user.email.split('@')[0] : 'Usuario');
    this.dom.adminEditAvatar.textContent = name.substring(0, 2).toUpperCase();
    this.dom.adminEditDisplayName.textContent = name;
    this.dom.adminEditDisplayId.textContent = 'ID: ' + (user.id ? user.id.substring(0, 8) + '...' : '—');
    this.dom.adminEditCreated.textContent = user.created_at ? new Date(user.created_at).toLocaleDateString() : '—';
    this.dom.adminEditLastSignIn.textContent = user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—';

    this.dom.adminEditModal.style.display = 'flex';
  }

  closeAdminEdit() {
    this.dom.adminEditModal.style.display = 'none';
    this.adminEditingId = null;
  }

  async saveAdminEdit() {
    if (!this.adminEditingId) return;
    const username = this.dom.adminEditUsername.value.trim() || 'Usuario';
    const plan = this.dom.adminEditPlan.value;
    const admin = this.dom.adminEditAdminToggle.checked;

    const payload = {
      user_metadata: {
        username,
        plan,
        admin: admin ? true : false
      }
    };

    try {
      const { data: { session } } = await sbClient.auth.getSession();
      if (!session) throw new Error('No session');
      const resp = await fetch('/api/admin/users/' + this.adminEditingId, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'HTTP ' + resp.status);
      }
      this.closeAdminEdit();
      alert(t('admin.saved'));
      // Si editamos nuestro propio perfil, actualizar UI inmediatamente
      if (this.currentUser && this.adminEditingId === this.currentUser.id) {
        this.currentUser.username = username;
        this.currentUser.plan = plan;
        this.currentUser.admin = admin;
        this.currentUser = this._sbUserToLocal({ id: this.currentUser.id, email: this.currentUser.email, user_metadata: { username, plan, admin } });
        this.updateAuthUI();
      }
      this.loadAdminUsers();
    } catch (err) {
      console.error('Admin save error:', err);
      alert(t('admin.error') + ': ' + err.message);
    }
  }
}

// ─── Exponer funciones para otros módulos ───
window.generateEmbedCode = (embedJson) => {
  if (window.app) window.app.generateEmbedCode(embedJson);
};

window.generateFormCode = (formData) => {
  if (window.app) window.app.generateFormCode(formData);
};

// ─── Inicializar ───
document.addEventListener('DOMContentLoaded', () => {
  window.app = new DiscordBotBuilder();
});