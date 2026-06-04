// ─── Simulador de Discord con canales ───
class SimDatabase {
  constructor() {
    this.tables = {};
    this.lastId = 0;
  }

  createTable(name, columns) {
    if (!this.tables[name]) {
      this.tables[name] = { columns: columns || [], rows: [], pkFields: (columns || []).filter(c => c.pk).map(c => c.name) };
    }
  }

  _rowMatches(row, sql, params) {
    let where = sql.split('WHERE')[1] || '';
    if (!where.trim()) return true;
    where = where.trim();
    for (const [k, v] of Object.entries(params)) {
      const re = new RegExp('\\{\\{' + k + '\\}\\}', 'g');
      where = where.replace(re, typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : String(v));
    }
    try {
      const keys = Object.keys(row);
      const vals = Object.values(row);
      const fn = new Function(...keys, 'return (' + where + ')');
      return fn(...vals);
    } catch { return true; }
  }

  _applyParams(sql, params) {
    let result = sql;
    for (const [k, v] of Object.entries(params)) {
      const escaped = typeof v === 'string' ? "'" + v.replace(/'/g, "''") + "'" : String(v);
      result = result.replace(new RegExp('\\{\\{' + k + '\\}\\}', 'g'), escaped);
    }
    return result;
  }

  run(sql, params) {
    sql = this._applyParams(sql, params);
    const upper = sql.trim().toUpperCase();

    if (upper.startsWith('INSERT')) {
      const tableMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        if (!this.tables[table]) this.tables[table] = { columns: [], rows: [], pkFields: [] };
        this.lastId++;

        // Parse columns and values
        const colMatch = sql.match(/\(([^)]+)\)\s*(?:VALUES|SELECT)/i);
        const valMatch = sql.match(/VALUES\s*\(([^)]+)\)/i);
        if (colMatch && valMatch) {
          const cols = colMatch[1].split(',').map(s => s.trim().replace(/['"]/g, ''));
          const vals = valMatch[1].split(',').map(s => {
            s = s.trim();
            if (s === 'NULL') return null;
            if (s.startsWith("'") && s.endsWith("'")) return s.slice(1, -1).replace(/''/g, "'");
            const n = parseFloat(s);
            return isNaN(n) ? s : n;
          });
          const row = { _id: this.lastId };
          cols.forEach((c, i) => { row[c] = vals[i] !== undefined ? vals[i] : null; });
          this.tables[table].rows.push(row);
        }
      }
    } else if (upper.startsWith('UPDATE')) {
      const tableMatch = sql.match(/UPDATE\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const setMatch = sql.match(/SET\s+(.+?)(?:\s+WHERE|$)/i);
        const whereIdx = sql.toUpperCase().indexOf('WHERE');
        const whereClause = whereIdx >= 0 ? sql.slice(whereIdx + 5) : '';
        if (setMatch && this.tables[table]) {
          const sets = setMatch[1].split(',').map(s => {
            const [k, ...v] = s.split('=').map(x => x.trim().replace(/['"]/g, ''));
            return { key: k, value: v.join('=') };
          });
          for (const row of this.tables[table].rows) {
            if (this._rowWhere(row, whereClause)) {
              sets.forEach(s => { row[s.key] = s.value; });
            }
          }
        }
      }
    } else if (upper.startsWith('DELETE')) {
      const tableMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        const whereIdx = sql.toUpperCase().indexOf('WHERE');
        const whereClause = whereIdx >= 0 ? sql.slice(whereIdx + 5) : '';
        if (this.tables[table]) {
          this.tables[table].rows = this.tables[table].rows.filter(row => !this._rowWhere(row, whereClause));
        }
      }
    } else if (upper.startsWith('CREATE TABLE')) {
      const tableMatch = sql.match(/CREATE\s+TABLE\s+(?:\w+\s+)?(\w+)/i);
      if (tableMatch) {
        const table = tableMatch[1];
        if (!this.tables[table]) this.tables[table] = { columns: [], rows: [], pkFields: [] };
      }
    }
  }

  _rowWhere(row, clause) {
    if (!clause || !clause.trim()) return true;
    try {
      const keys = Object.keys(row);
      const vals = Object.values(row);
      const fn = new Function(...keys, 'return (' + clause.trim() + ')');
      return fn(...vals);
    } catch { return true; }
  }

  selectAll(sql, params) {
    sql = this._applyParams(sql, params);
    const upper = sql.trim().toUpperCase();
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    if (!tableMatch) return [];
    const table = tableMatch[1];
    if (!this.tables[table]) return [];

    const whereIdx = upper.indexOf('WHERE');
    const whereClause = whereIdx >= 0 ? sql.slice(whereIdx + 5) : '';

    let rows = this.tables[table].rows;
    if (whereClause.trim()) {
      rows = rows.filter(row => this._rowWhere(row, whereClause));
    }

    // ORDER BY
    const orderIdx = upper.indexOf('ORDER BY');
    if (orderIdx >= 0) {
      const orderStr = sql.slice(orderIdx + 8).trim();
      const [field, dir] = orderStr.split(/\s+/);
      rows = [...rows].sort((a, b) => {
        const va = a[field] || 0;
        const vb = b[field] || 0;
        return dir && dir.toUpperCase() === 'DESC' ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
      });
    }

    // LIMIT
    const limitMatch = upper.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      rows = rows.slice(0, parseInt(limitMatch[1]));
    }
    const offsetMatch = upper.match(/OFFSET\s+(\d+)/i);
    if (offsetMatch) {
      rows = rows.slice(parseInt(offsetMatch[1]));
    }

    return rows;
  }
}

class DiscordSimulator {
  constructor() {
    this.messages = [];
    this.commands = {};
    this.channels = ['general', 'random'];
    this.currentChannel = 'general';
    this.db = new SimDatabase();
    this.init();
  }

  init() {
    this.dom = {
      messages: document.getElementById('simMessages'),
      input: document.getElementById('simInput'),
      sendBtn: document.getElementById('simSendBtn'),
      clearBtn: document.getElementById('simClearBtn'),
      resetBtn: document.getElementById('simResetBtn'),
      chipsContainer: document.getElementById('simChips'),
      channelList: document.getElementById('simChannelList'),
      newChannelInput: document.getElementById('simNewChannelInput'),
      addChannelBtn: document.getElementById('simAddChannelBtn'),
      currentChannelLabel: document.getElementById('simCurrentChannelLabel')
    };

    this.renderChannelList();
    this.bindEvents();
    this.loadFromWorkspace();
    this.bindButtonClicks();
  }

  bindEvents() {
    this.dom.sendBtn.addEventListener('click', () => this.sendMessage());
    this.dom.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    this.dom.clearBtn.addEventListener('click', () => this.clearMessages());
    this.dom.resetBtn.addEventListener('click', () => this.resetSimulator());
    this.dom.addChannelBtn.addEventListener('click', () => this.createChannel());
    this.dom.newChannelInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.createChannel();
    });
  }

  // ─── Canales ───
  renderChannelList() {
    const list = this.dom.channelList;
    list.innerHTML = this.channels.map(ch => `
      <div class="sim-channel-item${ch === this.currentChannel ? ' active' : ''}" data-channel="${this.escapeHtml(ch)}">
        <span class="sim-channel-hash">#</span>
        <span class="sim-channel-name">${this.escapeHtml(ch)}</span>
      </div>
    `).join('');

    list.querySelectorAll('.sim-channel-item').forEach(item => {
      item.addEventListener('click', () => {
        this.switchChannel(item.dataset.channel);
      });
    });
  }

  switchChannel(name) {
    if (name === this.currentChannel) return;
    if (!this.channels.includes(name)) return;
    this.currentChannel = name;
    this.renderChannelList();
    this.dom.currentChannelLabel.textContent = name;
    this.renderMessages();
  }

  createChannel() {
    const name = this.dom.newChannelInput.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!name) return;
    if (this.channels.includes(name)) { this.dom.newChannelInput.value = ''; return; }
    this.channels.push(name);
    this.dom.newChannelInput.value = '';
    this.renderChannelList();
    this.switchChannel(name);
  }

  // ─── Mensajes ───
  addMessage(type, content, extra, channel) {
    const ch = channel || this.currentChannel;
    if (!this.channels.includes(ch)) this.channels.push(ch);

    this.messages.push({ channel: ch, type, content, extra, time: this.getTime() });

    if (ch === this.currentChannel) {
      this.renderMessageDOM(ch, type, content, extra);
    }

    if (type !== 'user' && ch !== this.currentChannel) {
      this.renderChannelList();
    }
  }

  renderMessages() {
    this.dom.messages.innerHTML = '';
    const msgs = this.messages.filter(m => m.channel === this.currentChannel);
    if (msgs.length === 0) {
      this.dom.messages.innerHTML = `
        <div class="sim-welcome">
          <div class="sim-welcome-icon">◆</div>
          <h3>#${this.escapeHtml(this.currentChannel)}</h3>
          <p>Bienvenido al canal <strong>#${this.escapeHtml(this.currentChannel)}</strong>. Escribe un comando para probar tu bot.</p>
        </div>
      `;
      return;
    }
    const names = Object.keys(this.commands);
    msgs.forEach(m => this.renderMessageDOM(m.channel, m.type, m.content, m.extra));
    this.dom.messages.scrollTop = this.dom.messages.scrollHeight;
  }

  renderMessageDOM(channel, type, content, extra) {
    const div = document.createElement('div');
    div.className = 'sim-msg sim-msg-' + type;

    if (type === 'system') {
      div.innerHTML = `
        <div class="sim-msg-avatar" style="background:#888;color:#fff;">●</div>
        <div class="sim-msg-body">
          <div class="sim-msg-author">
            <span class="sim-msg-name" style="color:#aaa;">Sistema</span>
            <span class="sim-msg-time">${this.getTime()}</span>
          </div>
          <div class="sim-msg-text">${this.escapeHtml(content)}</div>
        </div>
      `;
    } else if (type === 'user') {
      div.innerHTML = `
        <div class="sim-msg-avatar" style="background:#5865F2;">U</div>
        <div class="sim-msg-body">
          <div class="sim-msg-author">
            <span class="sim-msg-name">Tú</span>
            <span class="sim-msg-time">${this.getTime()}</span>
          </div>
          <div class="sim-msg-text">/${this.escapeHtml(content)}</div>
        </div>
      `;
    } else {
      let extraHtml = '';
      if (extra) {
        if (extra.embed) extraHtml += this.renderEmbed(extra.embed);
        if (extra.buttons) extraHtml += this.renderButtons(extra.buttons);
        if (extra.selectMenu && extra.options) extraHtml += this.renderSelectMenu(extra.options, extra.menuId);
      }
      div.innerHTML = `
        <div class="sim-msg-avatar" style="background:#57F287;color:#000;">B</div>
        <div class="sim-msg-body">
          <div class="sim-msg-author">
            <span class="sim-msg-name" style="color:#57F287;">Bot</span>
            <span class="sim-msg-tag">BOT</span>
            <span class="sim-msg-time">${this.getTime()}</span>
          </div>
          <div class="sim-msg-text">${this.escapeHtml(content)}</div>
          ${extraHtml}
        </div>
      `;
    }

    this.dom.messages.appendChild(div);
    this.dom.messages.scrollTop = this.dom.messages.scrollHeight;
  }

  // ─── Comandos ───
  sendMessage() {
    const text = this.dom.input.value.trim();
    if (!text) return;
    this.dom.input.value = '';

    this.loadFromWorkspace();

    const cmdChannel = this.currentChannel;

    this.addMessage('user', text, null, cmdChannel);

    const parts = text.split(' ');
    let searchCmd = parts.slice(0, 2).join('_');
    let cmd = parts[0];
    if (this.commands[searchCmd]) {
      cmd = searchCmd;
    } else {
      cmd = parts[0];
    }
    if (cmd === 'ayuda') {
      setTimeout(() => this.cmd_ayuda(), 500);
    } else if (this.commands[cmd]) {
      setTimeout(() => this.executeActions(this.commands[cmd], cmdChannel), 500);
    } else {
      const known = Object.keys(this.commands);
      let hint = '';
      if (known.length > 0) {
        hint = ' Comandos disponibles: /' + known.join(', /').replace(/_/g, ' ');
      } else {
        hint = ' Crea comandos en la sección Bloques.';
      }
      setTimeout(() => this.addMessage('bot', '❌ Comando desconocido: /' + cmd + '.' + hint, null, cmdChannel), 500);
    }
  }

  executeActions(actions, cmdChannel) {
    if (!actions || actions.length === 0) {
      this.addMessage('bot', '✅ Comando ejecutado (sin acciones definidas)', null, cmdChannel);
      return;
    }

    actions.forEach((action, i) => {
      setTimeout(() => this.executeAction(action, cmdChannel), i * 600);
    });
  }

  executeAction(action, cmdChannel) {
    if (!action) return;
    const ch = action.channel === 'current' || !action.channel ? cmdChannel : action.channel;

    switch (action.type) {
      case 'send_message':
        this.addMessage('bot', action.text || '(mensaje vacío)', null, ch);
        break;
      case 'reply_message':
        this.addMessage('bot', '↩️ ' + (action.text || '(respuesta vacía)'), null, cmdChannel);
        break;
      case 'send_embed':
        this.addMessage('bot', '', { embed: action.embed || { title: 'Embed', description: 'Sin contenido' } }, ch);
        break;
      case 'send_message_buttons':
        this.addMessage('bot', action.text || '', { buttons: action.buttons || [] }, ch);
        break;
      case 'show_modal':
        this.showModal(action.modal, cmdChannel);
        break;
      case 'send_image':
        this.addMessage('bot', '🖼️ Imagen enviada', {
          embed: { image: { url: action.url || '' }, title: 'Imagen' }
        }, ch);
        break;
      case 'send_dm':
        this.addMessage('bot', '📬 DM enviado a ' + (action.user || 'usuario') + ': ' + (action.text || ''), null, cmdChannel);
        break;
      case 'add_reaction':
        this.addMessage('bot', '✅ Reacción añadida: ' + (action.emoji || '👍'), null, cmdChannel);
        break;
      case 'delete_message':
        this.addMessage('system', '🗑️ Mensaje eliminado', null, cmdChannel);
        break;
      case 'add_role':
        this.addMessage('system', '🔰 Rol "' + (action.role || '') + '" añadido a ' + (action.user || 'usuario'), null, cmdChannel);
        break;
      case 'remove_role':
        this.addMessage('system', '🔰 Rol "' + (action.role || '') + '" quitado de ' + (action.user || 'usuario'), null, cmdChannel);
        break;
      case 'kick_user':
        this.addMessage('system', '👢 Usuario ' + (action.user || '') + ' expulsado. Razón: ' + (action.reason || 'Sin especificar'), null, cmdChannel);
        break;
      case 'ban_user':
        this.addMessage('system', '🔨 Usuario ' + (action.user || '') + ' baneado. Razón: ' + (action.reason || 'Sin especificar'), null, cmdChannel);
        break;
      case 'timeout_user':
        this.addMessage('system', '🔇 Usuario ' + (action.user || '') + ' silenciado por ' + (action.minutes || '0') + ' min. Razón: ' + (action.reason || 'Sin especificar'), null, cmdChannel);
        break;
      case 'create_channel':
        this.addMessage('system', '📁 Canal "' + (action.name || 'nuevo-canal') + '" creado', null, cmdChannel);
        break;
      case 'send_select_menu':
        this.addMessage('bot', action.text || '', { selectMenu: action.options || [], menuId: action.menuId || 'menu_1' }, ch);
        break;
      case 'send_paginated_embeds':
        this.sendPaginatedEmbeds(action, ch);
        break;
      case 'db_run':
        this.addMessage('system', '🗄️ DB: ' + (action.sql || '').substring(0, 80), null, cmdChannel);
        break;
      case 'db_create_table':
        this.addMessage('system', '🗄️ Tabla "' + (action.table || '') + '" creada', null, cmdChannel);
        break;
      case '_transaction_commit':
        this.addMessage('system', '✅ Transacción "' + (action.name || '') + '" completada (commit)', null, cmdChannel);
        break;
      case '_transaction_rollback':
        this.addMessage('system', '⚠️ Transacción "' + (action.name || '') + '" revertida (rollback)', null, cmdChannel);
        break;
      case 'defer_reply':
        this.addMessage('system', '⏳ Respuesta diferida' + (action.ephemeral ? ' (efímera)' : ''), null, cmdChannel);
        break;
      case 'edit_reply':
        this.addMessage('bot', '✏️ Respuesta editada: ' + (action.text || ''), null, cmdChannel);
        break;
      default:
        this.addMessage('bot', '⚙️ Acción: ' + action.type, null, cmdChannel);
    }
  }

  // ─── Botones ───
  bindButtonClicks() {
    this.dom.messages.addEventListener('click', (e) => {
      const btn = e.target.closest('.sim-btn');
      if (!btn) return;
      const btnId = btn.dataset.id;
      if (!btnId) return;

      // Pagination buttons
      if (btnId === '__page_prev' || btnId === '__page_next') {
        const msgDiv = btn.closest('.sim-msg');
        if (!msgDiv) return;
        const pagesRaw = msgDiv.dataset.pages;
        if (!pagesRaw) return;
        try {
          const pages = JSON.parse(pagesRaw);
          let current = parseInt(msgDiv.dataset.currentPage || '0');
          if (btnId === '__page_prev') current = Math.max(0, current - 1);
          else current = Math.min(pages.length - 1, current + 1);
          msgDiv.dataset.currentPage = String(current);
          const embed = typeof pages[current] === 'object' ? pages[current] : { title: 'Página ' + (current + 1), description: String(pages[current]) };
          const embedEl = msgDiv.querySelector('.sim-embed');
          if (embedEl) {
            embedEl.outerHTML = this.renderEmbed(embed);
          }
        } catch {}
        return;
      }

      const key = '__btn_' + btnId;
      const cmdChannel = this.currentChannel;
      if (this.commands[key]) {
        this.addMessage('bot', '🖱️ Click en botón `' + btnId + '`', null, cmdChannel);
        setTimeout(() => this.executeActions(this.commands[key], cmdChannel), 400);
      } else {
        this.addMessage('bot', '⚠️ Botón "' + btnId + '" presionado (sin bloque de acción configurado)', null, cmdChannel);
      }
    });

    this.dom.messages.addEventListener('change', (e) => {
      const sel = e.target.closest('.sim-select-menu');
      if (!sel) return;
      const menuId = sel.dataset.menuId;
      const selectedValue = sel.value;
      const selectedLabel = sel.options[sel.selectedIndex]?.text || '';
      const key = '__select_' + menuId;
      const cmdChannel = this.currentChannel;
      if (this.commands[key]) {
        this.addMessage('bot', '📋 Seleccionado: `' + selectedValue + '`', null, cmdChannel);
        const ctx = { _selectedValue: selectedValue, _selectedLabel: selectedLabel };
        setTimeout(() => {
          const actions = this.commands[key];
          if (actions && actions.length > 0) {
            actions.forEach((a, i) => {
              a._context = Object.assign({}, a._context, ctx);
              setTimeout(() => this.executeAction(a, cmdChannel), i * 600);
            });
          }
        }, 400);
      } else {
        this.addMessage('bot', '⚠️ Menú "' + menuId + '" seleccionado (sin bloque de acción configurado)', null, cmdChannel);
      }
    });
  }

  // ─── Embeds y Botones (render) ───
  renderEmbed(embed) {
    let html = '<div class="sim-embed">';
    html += '<div class="sim-embed-bar" style="background:' + (embed.color || '#5865F2') + '"></div>';
    html += '<div class="sim-embed-body">';
    if (embed.author) {
      html += '<div class="sim-embed-author">';
      if (embed.author.icon_url) html += '<img src="' + embed.author.icon_url + '" onerror="this.style.display=\'none\'">';
      html += this.escapeHtml(embed.author.name || '') + '</div>';
    }
    if (embed.title) html += '<div class="sim-embed-title">' + this.escapeHtml(embed.title) + '</div>';
    if (embed.description) html += '<div class="sim-embed-desc">' + this.escapeHtml(embed.description) + '</div>';
    if (embed.fields) {
      html += '<div class="sim-embed-fields">';
      embed.fields.forEach(f => {
        html += '<div class="sim-embed-field' + (f.inline ? ' inline' : '') + '">';
        html += '<div class="sim-embed-fname">' + this.escapeHtml(f.name) + '</div>';
        html += '<div class="sim-embed-fval">' + this.escapeHtml(f.value) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    if (embed.image && embed.image.url) html += '<img class="sim-embed-img" src="' + embed.image.url + '" onerror="this.style.display=\'none\'">';
    if (embed.thumbnail && embed.thumbnail.url) {
      html += '<img class="sim-embed-thumb" src="' + embed.thumbnail.url + '" onerror="this.style.display=\'none\'">';
    }
    if (embed.footer) {
      html += '<div class="sim-embed-footer">';
      if (embed.footer.icon_url) html += '<img src="' + embed.footer.icon_url + '" onerror="this.style.display=\'none\'">';
      html += this.escapeHtml(embed.footer.text) + '</div>';
    }
    html += '</div></div>';
    return html;
  }

  renderButtons(buttons) {
    if (!buttons || !buttons.length) return '';
    let html = '<div class="sim-buttons">';
    buttons.forEach(btn => {
      const styleMap = { Primary: '#5865F2', Secondary: '#4e5058', Success: '#57F287', Danger: '#ED4245', Link: '#5865F2' };
      html += '<button class="sim-btn" data-id="' + (btn.id || '') + '" style="background:' + (styleMap[btn.style] || '#5865F2') + '">';
      html += this.escapeHtml(btn.label || 'Botón');
      html += '</button>';
    });
    html += '</div>';
    return html;
  }

  renderSelectMenu(options, menuId) {
    if (!options || !options.length) return '';
    let html = '<div class="sim-select-wrapper"><select class="sim-select-menu" data-menu-id="' + this.escapeHtml(menuId || 'menu') + '">';
    html += '<option value="">— Selecciona —</option>';
    options.forEach(opt => {
      const label = typeof opt === 'string' ? opt : (opt.label || opt.value || 'Opción');
      const value = typeof opt === 'string' ? opt : (opt.value || opt.label || '');
      html += '<option value="' + this.escapeHtml(value) + '">' + this.escapeHtml(label) + '</option>';
    });
    html += '</select></div>';
    return html;
  }

  // ─── Formularios modales interactivos ───
  showModal(modal, cmdChannel) {
    if (!modal) return;
    this.currentModal = modal;
    this.currentModalChannel = cmdChannel || this.currentChannel;
    this.addMessage('bot', '📋 Abriendo formulario: <strong>' + this.escapeHtml(modal.title || 'Formulario') + '</strong>', null, this.currentModalChannel);

    const overlay = document.createElement('div');
    overlay.className = 'sim-modal-overlay';
    overlay.id = 'simModalOverlay';

    const dialog = document.createElement('div');
    dialog.className = 'sim-modal-dialog';

    const fieldsHtml = (modal.fields || []).map((f, i) => this.renderModalField(f, i)).join('');
    const hasFields = (modal.fields || []).length > 0;

    dialog.innerHTML = `
      <div class="sim-modal-title">${this.escapeHtml(modal.title || 'Formulario')}</div>
      ${hasFields ? `<div class="sim-modal-fields">${fieldsHtml}</div>` : '<div class="sim-modal-empty">Este formulario no tiene campos definidos.</div>'}
      <div class="sim-modal-actions">
        <button class="btn-secondary sim-modal-cancel">Cancelar</button>
        <button class="btn-primary sim-modal-submit">Enviar</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    dialog.querySelector('.sim-modal-cancel').addEventListener('click', () => {
      this.closeModal();
      this.addMessage('bot', '❌ Formulario cancelado', null, this.currentModalChannel);
    });

    dialog.querySelector('.sim-modal-submit').addEventListener('click', () => {
      this.submitModal();
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeModal();
        this.addMessage('bot', '❌ Formulario cancelado', null, this.currentModalChannel);
      }
    });

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.addMessage('bot', '❌ Formulario cancelado', null, this.currentModalChannel);
      }
      if (e.key === 'Enter' && e.ctrlKey) {
        this.submitModal();
      }
    });

    const firstInput = dialog.querySelector('input, textarea, select');
    if (firstInput) setTimeout(() => firstInput.focus(), 100);
  }

  renderModalField(field, index) {
    const label = field.label || 'Campo';
    const customId = field.customId || 'campo_' + index;
    const required = field.required;
    const id = 'modal-field-' + index;

    let inputHtml = '';
    switch (field.type) {
      case 'short':
        inputHtml = `<input type="text" class="sim-modal-input" id="${id}" data-id="${this.escapeHtml(customId)}" ${required ? 'required' : ''} placeholder="${this.escapeHtml(label)}" value="${this.escapeHtml(field.value || '')}">`;
        break;
      case 'paragraph':
        inputHtml = `<textarea class="sim-modal-textarea" id="${id}" data-id="${this.escapeHtml(customId)}" ${required ? 'required' : ''} placeholder="${this.escapeHtml(label)}">${this.escapeHtml(field.value || '')}</textarea>`;
        break;
      case 'dropdown': {
        const options = (field.options || '').split(',').map(o => o.trim()).filter(Boolean);
        inputHtml = `<select class="sim-modal-select" id="${id}" data-id="${this.escapeHtml(customId)}" ${required ? 'required' : ''}>
          ${options.map(o => `<option value="${this.escapeHtml(o)}">${this.escapeHtml(o)}</option>`).join('')}
        </select>`;
        break;
      }
    }

    return `
      <div class="sim-modal-field">
        <label class="sim-modal-label" for="${id}">${this.escapeHtml(label)}${required ? '<span class="required-star">*</span>' : ''}</label>
        ${inputHtml}
      </div>
    `;
  }

  closeModal() {
    const overlay = document.getElementById('simModalOverlay');
    if (overlay) overlay.remove();
    this.currentModal = null;
  }

  submitModal() {
    if (!this.currentModal) return;
    const modal = this.currentModal;
    const ch = this.currentModalChannel || this.currentChannel;

    const values = {};
    (modal.fields || []).forEach((f, i) => {
      const el = document.getElementById('modal-field-' + i);
      if (el) values[f.customId || 'campo_' + i] = el.value;
    });

    const customId = modal.customId || 'form';
    const key = '__modal_' + customId;

    this.closeModal();

    this.addMessage('bot', '📋 Formulario "' + this.escapeHtml(modal.title || 'Formulario') + '" enviado', null, ch);

    if (Object.keys(values).length > 0) {
      const valStr = Object.entries(values).map(([k, v]) => '  **' + this.escapeHtml(k) + '**: ' + this.escapeHtml(v)).join('\n');
      this.addMessage('bot', 'Valores recibidos:\n' + valStr, null, ch);
    }

    if (this.commands[key]) {
      setTimeout(() => this.executeActions(this.commands[key], ch), 600);
    } else {
      this.addMessage('bot', '✅ Formulario procesado (sin acciones posteriores configuradas)', null, ch);
    }
  }

  // ─── Workspace ───
  loadFromWorkspace() {
    if (window.app && window.app.workspace) {
      this.commands = window.app.getSimulatorCommands();
      this.renderChips();
    }
  }

  renderChips() {
    if (!this.dom.chipsContainer) return;
    const names = Object.keys(this.commands);
    let html = '';
    if (names.length > 0) {
      names.forEach(n => {
        if (n.startsWith('__')) return;
        const display = n.replace(/_/g, ' ');
        html += '<button class="sim-chip" data-cmd="' + n + '" data-display="' + display + '">/' + display + '</button>';
      });
    } else {
      html = '<span class="sim-chip-label">Tus comandos aparecerán aquí cuando crees bloques.</span>';
    }
    html += '<button class="sim-chip" data-cmd="ayuda">/ayuda</button>';

    // Eventos de servidor
    const eventTriggers = {
      '__event_member_join': '👋 Miembro entra',
      '__event_member_leave': '👋 Miembro sale',
      '__event_reaction_add': '😊 Reacción +',
      '__event_reaction_remove': '😢 Reacción -'
    };
    let hasEvents = false;
    let evHtml = '';
    for (const [key, label] of Object.entries(eventTriggers)) {
      if (this.commands[key]) {
        hasEvents = true;
        evHtml += '<button class="sim-chip sim-chip-event" data-event="' + key + '">' + label + '</button>';
      }
    }
    if (hasEvents) {
      html += '<span class="sim-chip-sep">│</span>' + evHtml;
    }

    this.dom.chipsContainer.innerHTML = html;

    this.dom.chipsContainer.querySelectorAll('.sim-chip').forEach(chip => {
      if (chip.dataset.event) {
        chip.addEventListener('click', () => {
          const key = chip.dataset.event;
          const actions = this.commands[key];
          const ch = this.currentChannel;
          if (actions) {
            this.addMessage('system', '🔄 Evento disparado: ' + key.replace('__event_', ''), null, ch);
            setTimeout(() => this.executeActions(actions, ch), 400);
          }
        });
      } else {
        chip.addEventListener('click', () => {
          this.dom.input.value = chip.dataset.cmd;
          this.sendMessage();
        });
      }
    });
  }

  // ─── Limpiar / Reset ───
  clearMessages() {
    this.messages = [];
    this.renderMessages();
  }

  resetSimulator() {
    this.channels = ['general', 'random'];
    this.currentChannel = 'general';
    this.messages = [];
    this.dom.currentChannelLabel.textContent = 'general';
    this.loadFromWorkspace();
    this.renderChannelList();
    this.renderMessages();
    this.dom.input.value = '';
  }

  getTime() {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Paginación ───
  sendPaginatedEmbeds(action, cmdChannel) {
    const pages = action.pages || [];
    if (pages.length === 0) {
      this.addMessage('bot', action.content || '(sin páginas)', null, cmdChannel);
      return;
    }
    const firstEmbed = typeof pages[0] === 'object' ? pages[0] : { title: 'Página 1', description: String(pages[0]) };
    this.addMessage('bot', action.content || '', {
      embed: firstEmbed,
      buttons: [
        { id: '__page_prev', label: '◀', style: 'Primary' },
        { id: '__page_next', label: '▶', style: 'Primary' }
      ]
    }, cmdChannel);
    const lastMsg = this.dom.messages.lastElementChild;
    if (lastMsg) {
      lastMsg.dataset.pages = JSON.stringify(pages);
      lastMsg.dataset.currentPage = '0';
    }
  }

  // ─── Ayuda ───
  cmd_ayuda() {
    const names = Object.keys(this.commands);
    let cmdList = names.map(n => '• /' + n.replace(/_/g, ' ')).join('\n');
    if (!cmdList) cmdList = '(Crea comandos en la sección Bloques)';
    this.addMessage('bot', 'Comandos de tu bot (' + names.length + ' disponible' + (names.length === 1 ? '' : 's') + '):\n' + cmdList + '\n\n• /ayuda - Esta ayuda');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.simulator = new DiscordSimulator();
});

window.reloadSimulator = () => {
  if (window.simulator) {
    window.simulator.loadFromWorkspace();
  }
};
