// ─── Embed Builder ───
class EmbedBuilder {
  constructor() {
    this.fields = [];
    this.init();
  }

  init() {
    this.formElements = {
      title: document.getElementById('embedTitle'),
      description: document.getElementById('embedDescription'),
      color: document.getElementById('embedColor'),
      authorName: document.getElementById('embedAuthorName'),
      authorUrl: document.getElementById('embedAuthorUrl'),
      authorIcon: document.getElementById('embedAuthorIcon'),
      image: document.getElementById('embedImage'),
      thumbnail: document.getElementById('embedThumbnail'),
      footer: document.getElementById('embedFooter'),
      footerIcon: document.getElementById('embedFooterIcon'),
      fieldsContainer: document.getElementById('embedFields'),
      addFieldBtn: document.getElementById('addFieldBtn'),
      applyBtn: document.getElementById('applyEmbedBtn')
    };

    this.previewElements = {
      title: document.getElementById('previewTitle'),
      description: document.getElementById('previewDescription'),
      author: document.getElementById('previewAuthor'),
      fields: document.getElementById('previewFields'),
      image: document.getElementById('previewImage'),
      thumbnail: document.getElementById('previewThumbnail'),
      footer: document.getElementById('previewFooter'),
      bar: document.getElementById('previewEmbed')
    };

    this.bindEvents();
  }

  bindEvents() {
    const els = this.formElements;

    els.title.addEventListener('input', () => this.updatePreview());
    els.description.addEventListener('input', () => this.updatePreview());
    els.color.addEventListener('input', () => this.updatePreview());
    els.authorName.addEventListener('input', () => this.updatePreview());
    els.authorUrl.addEventListener('input', () => this.updatePreview());
    els.authorIcon.addEventListener('input', () => this.updatePreview());
    els.image.addEventListener('input', () => this.updatePreview());
    els.thumbnail.addEventListener('input', () => this.updatePreview());
    els.footer.addEventListener('input', () => this.updatePreview());
    els.footerIcon.addEventListener('input', () => this.updatePreview());

    els.addFieldBtn.addEventListener('click', () => this.addField());
    els.applyBtn.addEventListener('click', () => this.applyToBlocks());
  }

  addField(name = '', value = '', inline = false) {
    const row = document.createElement('div');
    row.className = 'embed-field-item';

    row.innerHTML = `
      <input type="text" placeholder="Nombre" class="field-name" value="${this.escapeHtml(name)}">
      <input type="text" placeholder="Valor" class="field-value" value="${this.escapeHtml(value)}">
      <button class="btn-icon remove-field" title="Eliminar campo"><i class="fas fa-times"></i></button>
    `;

    row.querySelector('.remove-field').addEventListener('click', () => {
      row.remove();
      this.updatePreview();
    });

    row.querySelectorAll('input').forEach(el => {
      el.addEventListener('input', () => this.updatePreview());
    });

    this.formElements.fieldsContainer.appendChild(row);
    this.updatePreview();
  }

  getFieldData() {
    const fields = [];
    this.formElements.fieldsContainer.querySelectorAll('.embed-field-item').forEach(row => {
      fields.push({
        name: row.querySelector('.field-name').value || '\u200B',
        value: row.querySelector('.field-value').value || '\u200B',
        inline: false
      });
    });
    return fields;
  }

  updatePreview() {
    const els = this.formElements;
    const prev = this.previewElements;

    prev.title.textContent = els.title.value || 'Título del embed';
    prev.title.style.display = els.title.value ? 'block' : 'block';

    prev.description.textContent = els.description.value || 'Descripción aquí...';
    prev.description.style.display = els.description.value ? 'block' : 'block';

    prev.bar.style.borderLeftColor = els.color.value || '#7c5cfc';

    const authorHtml = [];
    if (els.authorIcon.value) {
      authorHtml.push(`<img src="${this.escapeHtml(els.authorIcon.value)}" alt="">`);
    }
    if (els.authorName.value) {
      const name = els.authorName.value;
      if (els.authorUrl.value) {
        authorHtml.push(`<a href="${this.escapeHtml(els.authorUrl.value)}" style="color:var(--text-secondary);text-decoration:none;">${this.escapeHtml(name)}</a>`);
      } else {
        authorHtml.push(this.escapeHtml(name));
      }
    }
    prev.author.innerHTML = authorHtml.join('');
    prev.author.style.display = (els.authorName.value || els.authorIcon.value) ? 'block' : 'none';

    const fields = this.getFieldData();
    prev.fields.innerHTML = fields.map(f => `
      <div class="embed-field ${f.inline ? 'inline' : ''}">
        <div class="embed-field-name">${this.escapeHtml(f.name)}</div>
        <div class="embed-field-value">${this.escapeHtml(f.value)}</div>
      </div>
    `).join('');

    if (els.image.value) {
      prev.image.innerHTML = `<img src="${this.escapeHtml(els.image.value)}" alt="Imagen">`;
      prev.image.style.display = 'block';
    } else {
      prev.image.innerHTML = '';
      prev.image.style.display = 'none';
    }

    if (els.thumbnail.value) {
      prev.thumbnail.innerHTML = `<img src="${this.escapeHtml(els.thumbnail.value)}" alt="Thumbnail">`;
      prev.thumbnail.style.display = 'block';
    } else {
      prev.thumbnail.innerHTML = '';
      prev.thumbnail.style.display = 'none';
    }

    const footerHtml = [];
    if (els.footerIcon.value) {
      footerHtml.push(`<img src="${this.escapeHtml(els.footerIcon.value)}" alt="">`);
    }
    if (els.footer.value) {
      footerHtml.push(this.escapeHtml(els.footer.value));
    }
    prev.footer.innerHTML = footerHtml.join('');
    prev.footer.style.display = (els.footer.value || els.footerIcon.value) ? 'flex' : 'none';
  }

  applyToBlocks() {
    const embedJson = this.generateEmbedJson();
    const code = `const embed = ${JSON.stringify(embedJson, null, 2)};`;

    if (typeof window.generateEmbedCode === 'function') {
      window.generateEmbedCode(embedJson);
    }

    alert('✅ Embed generado. Ve a la pestaña "Exportar" para ver el código.');
  }

  generateEmbedJson() {
    const els = this.formElements;
    const embed = {};

    if (els.title.value) embed.title = els.title.value;
    if (els.description.value) embed.description = els.description.value;
    if (els.color.value) embed.color = parseInt(els.color.value.replace('#', ''), 16);

    if (els.authorName.value) {
      embed.author = { name: els.authorName.value };
      if (els.authorUrl.value) embed.author.url = els.authorUrl.value;
      if (els.authorIcon.value) embed.author.icon_url = els.authorIcon.value;
    }

    const fields = this.getFieldData();
    if (fields.length > 0) {
      embed.fields = fields;
    }

    if (els.image.value) embed.image = { url: els.image.value };
    if (els.thumbnail.value) embed.thumbnail = { url: els.thumbnail.value };

    if (els.footer.value) {
      embed.footer = { text: els.footer.value };
      if (els.footerIcon.value) embed.footer.icon_url = els.footerIcon.value;
    }

    return embed;
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.embedBuilder = new EmbedBuilder();
});