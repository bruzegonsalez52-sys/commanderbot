// ─── Form Builder ───
class FormBuilder {
  constructor() {
    this.fields = [];
    this.templates = this.loadTemplates();
    this.init();
  }

  init() {
    this.dom = {
      title: document.getElementById('formTitle'),
      customId: document.getElementById('formCustomId'),
      fieldsContainer: document.getElementById('formFieldsContainer'),
      addFieldBtn: document.getElementById('addFormFieldBtn'),
      applyBtn: document.getElementById('applyFormBtn'),
      previewTitle: document.getElementById('previewFormTitle'),
      previewFields: document.getElementById('previewFormFields'),
      templateName: document.getElementById('formTemplateName'),
      saveTemplateBtn: document.getElementById('saveFormTemplateBtn'),
      savedList: document.getElementById('savedTemplatesList')
    };

    this.bindEvents();
    this.addField('Nombre', 'nombre', 'short', true, '');
    this.renderSavedTemplates();
  }

  loadTemplates() {
    try {
      const data = localStorage.getItem(window.getUserStorageKey('forms'));
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  }

  saveTemplates() {
    localStorage.setItem(window.getUserStorageKey('forms'), JSON.stringify(this.templates));
  }

  bindEvents() {
    this.dom.title.addEventListener('input', () => this.updatePreview());
    this.dom.customId.addEventListener('input', () => this.updatePreview());
    this.dom.addFieldBtn.addEventListener('click', () => this.addField());
    this.dom.applyBtn.addEventListener('click', () => this.applyToBlocks());
    this.dom.saveTemplateBtn.addEventListener('click', () => this.saveTemplate());
  }

  addField(label = '', customId = '', type = 'short', required = true, value = '') {
    const id = 'field_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);

    const item = document.createElement('div');
    item.className = 'form-field-item';
    item.dataset.id = id;

    item.innerHTML = `
      <div class="form-field-header">
        <span class="form-field-label">${label || 'Nuevo campo'}</span>
        <button class="form-field-remove" title="Eliminar campo">✕</button>
      </div>
      <div class="form-row">
        <input type="text" class="ff-label" placeholder="Etiqueta" value="${this.escapeHtml(label)}">
        <input type="text" class="ff-id" placeholder="ID único" value="${this.escapeHtml(customId)}">
      </div>
      <div class="form-row">
        <select class="ff-type">
          <option value="short" ${type === 'short' ? 'selected' : ''}>Texto corto</option>
          <option value="paragraph" ${type === 'paragraph' ? 'selected' : ''}>Párrafo</option>
          <option value="dropdown" ${type === 'dropdown' ? 'selected' : ''}>Menú desplegable</option>
        </select>
        <label class="field-required">
          <input type="checkbox" class="ff-required" ${required ? 'checked' : ''}> Obligatorio
        </label>
      </div>
      <div class="ff-extra" style="display: ${type === 'dropdown' ? 'block' : 'none'}">
        <input type="text" class="ff-options" placeholder="Opciones separadas por coma. Ej: Op1,Op2,Op3" value="">
      </div>
    `;

    item.querySelector('.form-field-remove').addEventListener('click', () => {
      item.remove();
      this.updatePreview();
    });

    item.querySelectorAll('.ff-label, .ff-id, .ff-type, .ff-required, .ff-options').forEach(el => {
      el.addEventListener('change', () => this.updatePreview());
      el.addEventListener('input', () => this.updatePreview());
    });

    item.querySelector('.ff-type').addEventListener('change', (e) => {
      const extra = item.querySelector('.ff-extra');
      extra.style.display = e.target.value === 'dropdown' ? 'block' : 'none';
      this.updatePreview();
    });

    this.dom.fieldsContainer.appendChild(item);
    this.updatePreview();
  }

  getFields() {
    const fields = [];
    this.dom.fieldsContainer.querySelectorAll('.form-field-item').forEach(item => {
      fields.push({
        label: item.querySelector('.ff-label').value || 'Campo',
        customId: item.querySelector('.ff-id').value || 'campo_' + fields.length,
        type: item.querySelector('.ff-type').value,
        required: item.querySelector('.ff-required').checked,
        options: item.querySelector('.ff-options')?.value || ''
      });
    });
    return fields;
  }

  updatePreview() {
    this.dom.previewTitle.textContent = this.dom.title.value || 'Mi Formulario';

    const fields = this.getFields();
    if (fields.length === 0) {
      this.dom.previewFields.innerHTML = '<div class="modal-empty">Añade campos para ver la vista previa</div>';
      return;
    }

    this.dom.previewFields.innerHTML = fields.map(f => {
      let inputHtml = '';
      switch (f.type) {
        case 'short':
          inputHtml = `<div class="pf-input short"></div>`;
          break;
        case 'paragraph':
          inputHtml = `<div class="pf-input paragraph"></div>`;
          break;
        case 'dropdown':
          const opts = f.options ? f.options.split(',').map(o => o.trim()).filter(Boolean) : [];
          inputHtml = `<div class="pf-select">${opts.length > 0 ? opts[0] : 'Selecciona...'}</div>`;
          break;
      }
      return `
        <div class="modal-field-preview">
          <label>${this.escapeHtml(f.label)}${f.required ? '<span class="required-star">*</span>' : ''}</label>
          ${inputHtml}
        </div>
      `;
    }).join('');
  }

  saveTemplate() {
    const name = this.dom.templateName.value.trim();
    if (!name) { alert('Escribe un nombre para la plantilla'); return; }

    const formData = {
      title: this.dom.title.value || 'Mi Formulario',
      customId: this.dom.customId.value || 'mi_formulario',
      fields: this.getFields()
    };

    const existing = this.templates.findIndex(t => t.name === name);
    if (existing >= 0) {
      this.templates[existing].data = formData;
    } else {
      this.templates.push({ name, data: formData });
    }

    this.saveTemplates();
    this.renderSavedTemplates();
    this.dom.templateName.value = '';
    if (window.rebuildFormBlocks) window.rebuildFormBlocks();
    alert('✅ Plantilla "' + name + '" guardada');
  }

  loadTemplate(name) {
    const t = this.templates.find(t => t.name === name);
    if (!t) return;
    this.dom.title.value = t.data.title || '';
    this.dom.customId.value = t.data.customId || '';
    this.dom.fieldsContainer.innerHTML = '';
    t.data.fields.forEach(f => {
      this.addField(f.label, f.customId, f.type, f.required, f.options || '');
    });
    this.updatePreview();
  }

  deleteTemplate(name) {
    if (!confirm('¿Eliminar plantilla "' + name + '"?')) return;
    this.templates = this.templates.filter(t => t.name !== name);
    this.saveTemplates();
    this.renderSavedTemplates();
    if (window.rebuildFormBlocks) window.rebuildFormBlocks();
  }

  renderSavedTemplates() {
    const list = this.dom.savedList;
    if (this.templates.length === 0) {
      list.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:4px 0;">Sin plantillas guardadas</div>';
      return;
    }
    list.innerHTML = this.templates.map(t => `
      <div style="display:flex;align-items:center;gap:4px;padding:4px 0;border-bottom:1px solid var(--border);">
        <span style="flex:1;font-size:12px;color:var(--text-primary);">${this.escapeHtml(t.name)}</span>
        <button class="load-template-btn" data-name="${this.escapeHtml(t.name)}" style="border:none;background:transparent;color:var(--accent);cursor:pointer;font-size:12px;">Cargar</button>
        <button class="del-template-btn" data-name="${this.escapeHtml(t.name)}" style="border:none;background:transparent;color:var(--accent-red);cursor:pointer;font-size:12px;">✕</button>
      </div>
    `).join('');

    list.querySelectorAll('.load-template-btn').forEach(btn => {
      btn.addEventListener('click', () => this.loadTemplate(btn.dataset.name));
    });
    list.querySelectorAll('.del-template-btn').forEach(btn => {
      btn.addEventListener('click', () => this.deleteTemplate(btn.dataset.name));
    });
  }

  applyToBlocks() {
    const formData = {
      title: this.dom.title.value || 'Mi Formulario',
      customId: this.dom.customId.value || 'mi_formulario',
      fields: this.getFields()
    };

    if (typeof window.generateFormCode === 'function') {
      window.generateFormCode(formData);
    }

    alert('✅ Formulario generado. Ve a la pestaña "Exportar" para ver el código.');
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.formBuilder = new FormBuilder();
});