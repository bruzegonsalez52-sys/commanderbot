// ─── Generadores de JavaScript para bloques personalizados ───
const gen = Blockly.JavaScript;

// ─── Eventos ───
gen['event_ready'] = function(block) {
  const statements = gen.statementToCode(block, 'DO');
  return 'event_ready:\n' + statements;
};

gen['event_message'] = function(block) {
  const statements = gen.statementToCode(block, 'DO');
  return 'event_message:\n' + statements;
};

gen['event_command'] = function(block) {
  const command = block.getFieldValue('COMMAND');
  const statements = gen.statementToCode(block, 'DO');
  return 'event_command_' + command + ':\n' + statements;
};

gen['on_button_click'] = function(block) {
  const customId = block.getFieldValue('CUSTOM_ID');
  const statements = gen.statementToCode(block, 'DO');
  return 'event_button_' + customId + ':\n' + statements;
};

// ─── Enviar Mensajes ───
gen['send_message'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  const channel = block.getFieldValue('CHANNEL');
  let ch = channel === 'current' ? 'message.channel' : "client.channels.cache.find(c => c.name === 'general')";
  return ch + '.send(' + text + ');\n';
};

gen['send_embed'] = function(block) {
  const embed = gen.valueToCode(block, 'EMBED', gen.ORDER_ATOMIC) || 'null';
  const channel = block.getFieldValue('CHANNEL');
  let ch = channel === 'current' ? 'message.channel' : "client.channels.cache.find(c => c.name === 'general')";
  return ch + '.send({ embeds: [' + embed + '] });\n';
};

gen['reply_message'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  return 'message.reply(' + text + ');\n';
};

// ─── Texto ───
gen['text_concat'] = function(block) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_ADDITION) || "''";
  const b = gen.valueToCode(block, 'B', gen.ORDER_ADDITION) || "''";
  return [a + ' + ' + b, gen.ORDER_ADDITION];
};

gen['text_contains'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_MEMBER) || "''";
  const sub = gen.valueToCode(block, 'SUB', gen.ORDER_MEMBER) || "''";
  return [text + '.includes(' + sub + ')', gen.ORDER_MEMBER];
};

// ─── Embed ───
gen['create_embed'] = function(block) {
  const title = gen.valueToCode(block, 'TITLE', gen.ORDER_ATOMIC) || "''";
  const desc = gen.valueToCode(block, 'DESC', gen.ORDER_ATOMIC) || "''";
  const color = gen.valueToCode(block, 'COLOR', gen.ORDER_ATOMIC) || "'#5865F2'";
  const fieldName = gen.valueToCode(block, 'FIELD_NAME', gen.ORDER_ATOMIC) || "''";
  const fieldVal = gen.valueToCode(block, 'FIELD_VAL', gen.ORDER_ATOMIC) || "''";
  const fieldInline = block.getFieldValue('FIELD_INLINE') === 'TRUE';

  let code = 'new EmbedBuilder()';
  if (title) code += '\n  .setTitle(' + title + ')';
  if (desc) code += '\n  .setDescription(' + desc + ')';
  if (color) code += '\n  .setColor(' + color + ')';
  if (fieldName && fieldVal) {
    code += '\n  .addFields({ name: ' + fieldName + ', value: ' + fieldVal + ', inline: ' + fieldInline + ' })';
  }
  return [code, gen.ORDER_ATOMIC];
};

gen['embed_set_author'] = function(block) {
  const name = gen.valueToCode(block, 'NAME', gen.ORDER_ATOMIC) || "''";
  const icon = gen.valueToCode(block, 'ICON', gen.ORDER_ATOMIC) || "''";
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  let code = 'const embed = new EmbedBuilder()';
  code += '\n  .setAuthor({ name: ' + name;
  if (icon) code += ', iconURL: ' + icon;
  if (url) code += ', url: ' + url;
  code += ' });\n';
  return code;
};

gen['embed_set_footer'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  const icon = gen.valueToCode(block, 'ICON', gen.ORDER_ATOMIC) || "''";
  let code = 'const embed = new EmbedBuilder()';
  code += '\n  .setFooter({ text: ' + text;
  if (icon) code += ', iconURL: ' + icon;
  code += ' });\n';
  return code;
};

gen['embed_add_field'] = function(block) {
  const name = gen.valueToCode(block, 'NAME', gen.ORDER_ATOMIC) || "''";
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "''";
  const inline = block.getFieldValue('INLINE') === 'TRUE';
  return 'const embed = new EmbedBuilder()\n  .addFields({ name: ' + name + ', value: ' + value + ', inline: ' + inline + ' });\n';
};

gen['embed_set_image'] = function(block) {
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  return 'const embed = new EmbedBuilder()\n  .setImage(' + url + ');\n';
};

gen['embed_set_thumbnail'] = function(block) {
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  return 'const embed = new EmbedBuilder()\n  .setThumbnail(' + url + ');\n';
};

// ─── Botones ───
gen['add_button'] = function(block) {
  const label = gen.valueToCode(block, 'LABEL', gen.ORDER_ATOMIC) || "'Botón'";
  const style = block.getFieldValue('STYLE');
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  const customId = block.getFieldValue('CUSTOM_ID') || 'btn_click';

  let code = 'new ActionRowBuilder().addComponents(\n    new ButtonBuilder()';
  code += '\n      .setCustomId(' + (style === 'Link' ? "'" + url.replace(/'/g, "\\'") + "'" : "'" + customId + "'") + ')';
  code += '\n      .setLabel(' + label + ')';
  code += '\n      .setStyle(ButtonStyle.' + style + ')';
  if (style === 'Link' && url) {
    code += '\n      .setURL(' + url + ')';
  }
  code += '\n  )';
  return code;
};

gen['send_message_with_buttons'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  const channel = block.getFieldValue('CHANNEL');
  let ch = channel === 'current' ? 'message.channel' : "client.channels.cache.find(c => c.name === 'general')";

  // Collect all button blocks stacked in the BUTTONS statement
  let buttonsCode = '';
  let btnBlock = block.getInputTargetBlock('BUTTONS');
  while (btnBlock) {
    if (btnBlock.type === 'single_button') {
      const label = gen.valueToCode(btnBlock, 'LABEL', gen.ORDER_ATOMIC) || "'Botón'";
      const style = btnBlock.getFieldValue('STYLE');
      const customId = gen.valueToCode(btnBlock, 'CUSTOM_ID', gen.ORDER_ATOMIC) || "'btn_id'";
      const url = gen.valueToCode(btnBlock, 'URL', gen.ORDER_ATOMIC) || "''";
      if (style === 'Link') {
        buttonsCode += 'new ActionRowBuilder().addComponents(\n    new ButtonBuilder()\n      .setLabel(' + label + ')\n      .setStyle(ButtonStyle.Link)\n      .setURL(' + url + ')\n  ), ';
      } else {
        buttonsCode += 'new ActionRowBuilder().addComponents(\n    new ButtonBuilder()\n      .setCustomId(' + customId + ')\n      .setLabel(' + label + ')\n      .setStyle(ButtonStyle.' + style + ')\n  ), ';
      }
    }
    btnBlock = btnBlock.getNextBlock();
  }
  if (buttonsCode) buttonsCode = buttonsCode.slice(0, -2); // remove trailing comma+space

  return ch + '.send({ content: ' + text + ', components: [' + buttonsCode + '] });\n';
};

gen['single_button'] = function(block) {
  // single_button now generates nothing standalone — it's collected by send_message_with_buttons
  return '';
};

// ─── Usuarios ───
gen['user_mention'] = function(block) {
  return ['`<@${message.author.id}>`', gen.ORDER_ATOMIC];
};

gen['channel_mention'] = function(block) {
  return ['`<#${message.channel.id}>`', gen.ORDER_ATOMIC];
};

gen['get_username'] = function(block) {
  return ['message.author.username', gen.ORDER_ATOMIC];
};

gen['get_user_id'] = function(block) {
  return ['message.author.id', gen.ORDER_ATOMIC];
};

// ─── Matemáticas ───
gen['random_number'] = function(block) {
  const min = gen.valueToCode(block, 'MIN', gen.ORDER_ATOMIC) || '1';
  const max = gen.valueToCode(block, 'MAX', gen.ORDER_ATOMIC) || '10';
  return ['Math.floor(Math.random() * (' + max + ' - ' + min + ' + 1)) + ' + min, gen.ORDER_MEMBER];
};

// ─── Lógica ───
gen['if_condition'] = function(block) {
  const cond = gen.valueToCode(block, 'COND', gen.ORDER_ATOMIC) || 'true';
  const doCode = gen.statementToCode(block, 'DO');
  const elseCode = gen.statementToCode(block, 'ELSE');
  let code = 'if (' + cond + ') {\n' + doCode + '}';
  if (elseCode.trim()) {
    code += ' else {\n' + elseCode + '}';
  }
  return code + '\n';
};

// ─── Imágenes ───
gen['image_url'] = function(block) {
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  return [url, gen.ORDER_ATOMIC];
};

gen['send_image'] = function(block) {
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  const channel = block.getFieldValue('CHANNEL');
  let ch = channel === 'current' ? 'message.channel' : "client.channels.cache.find(c => c.name === 'general')";
  return ch + '.send({ files: [' + url + '] });\n';
};

gen['embed_set_image_url'] = function(block) {
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  return 'const embed = new EmbedBuilder()\n  .setImage(' + url + ');\n';
};

gen['embed_set_thumbnail_url'] = function(block) {
  const url = gen.valueToCode(block, 'URL', gen.ORDER_ATOMIC) || "''";
  return 'const embed = new EmbedBuilder()\n  .setThumbnail(' + url + ');\n';
};

gen['get_avatar'] = function(block) {
  return ['message.author.displayAvatarURL()', gen.ORDER_ATOMIC];
};

// ─── Formularios Modales ───
gen['event_modal_submit'] = function(block) {
  const customId = block.getFieldValue('CUSTOM_ID');
  const statements = gen.statementToCode(block, 'DO');
  return 'event_modal_submit_' + customId + ':\n' + statements;
};

gen['show_modal'] = function(block) {
  const form = gen.valueToCode(block, 'FORM', gen.ORDER_ATOMIC) || 'null';
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || 'message.author';
  return 'await ' + user + '.send({ content: "Abre el formulario:", components: [' + form + '] });\n';
};

gen['create_modal'] = function(block) {
  const title = gen.valueToCode(block, 'TITLE', gen.ORDER_ATOMIC) || "'Formulario'";
  const customId = block.getFieldValue('CUSTOM_ID') || 'mi_formulario';
  const fieldsCode = gen.valueToCode(block, 'FIELDS', gen.ORDER_ATOMIC) || '[]';

  let code = 'new ModalBuilder()';
  code += '\n  .setCustomId(' + "'" + customId + "'" + ')';
  code += '\n  .setTitle(' + title + ')';
  code += '\n  .addComponents(' + fieldsCode + ')';
  return [code, gen.ORDER_ATOMIC];
};

gen['modal_field_text'] = function(block) {
  const label = gen.valueToCode(block, 'LABEL', gen.ORDER_ATOMIC) || "'Campo'";
  const customId = block.getFieldValue('CUSTOM_ID') || 'campo';
  const required = block.getFieldValue('REQUIRED') === 'TRUE';
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "''";

  let code = 'new ActionRowBuilder().addComponents(\n    new TextInputBuilder()';
  code += '\n      .setCustomId(' + "'" + customId + "'" + ')';
  code += '\n      .setLabel(' + label + ')';
  code += '\n      .setStyle(TextInputStyle.Short)';
  code += '\n      .setRequired(' + required + ')';
  if (value) code += '\n      .setValue(' + value + ')';
  code += '\n  )';
  return [code, gen.ORDER_ATOMIC];
};

gen['modal_field_paragraph'] = function(block) {
  const label = gen.valueToCode(block, 'LABEL', gen.ORDER_ATOMIC) || "'Descripción'";
  const customId = block.getFieldValue('CUSTOM_ID') || 'desc';
  const required = block.getFieldValue('REQUIRED') === 'TRUE';
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "''";

  let code = 'new ActionRowBuilder().addComponents(\n    new TextInputBuilder()';
  code += '\n      .setCustomId(' + "'" + customId + "'" + ')';
  code += '\n      .setLabel(' + label + ')';
  code += '\n      .setStyle(TextInputStyle.Paragraph)';
  code += '\n      .setRequired(' + required + ')';
  if (value) code += '\n      .setValue(' + value + ')';
  code += '\n  )';
  return [code, gen.ORDER_ATOMIC];
};

gen['modal_field_dropdown'] = function(block) {
  const label = gen.valueToCode(block, 'LABEL', gen.ORDER_ATOMIC) || "'Opción'";
  const customId = block.getFieldValue('CUSTOM_ID') || 'menu';
  const optionsStr = gen.valueToCode(block, 'OPTIONS', gen.ORDER_ATOMIC) || "'Op1,Op2'";
  const required = block.getFieldValue('REQUIRED') === 'TRUE';

  let code = 'new ActionRowBuilder().addComponents(\n    new StringSelectMenuBuilder()';
  code += '\n      .setCustomId(' + "'" + customId + "'" + ')';
  code += '\n      .setPlaceholder(' + label + ')';
  code += '\n      .addOptions(' + optionsStr + '.split(",").map((o,i) => ({ label: o.trim(), value: o.trim().toLowerCase().replace(/\\s+/g, "_") })))';
  code += '\n  )';
  return [code, gen.ORDER_ATOMIC];
};

gen['modal_get_value'] = function(block) {
  const fieldId = block.getFieldValue('FIELD_ID') || 'campo';
  return ['interaction.fields.getTextInputValue("' + fieldId + '")', gen.ORDER_ATOMIC];
};

gen['make_field_array'] = function(block) {
  const a = gen.valueToCode(block, 'A', gen.ORDER_ATOMIC) || 'null';
  const b = gen.valueToCode(block, 'B', gen.ORDER_ATOMIC) || 'null';
  const c = gen.valueToCode(block, 'C', gen.ORDER_ATOMIC) || 'null';
  const parts = [a];
  if (b !== 'null') parts.push(b);
  if (c !== 'null') parts.push(c);
  return ['[\n    ' + parts.join(',\n    ') + '\n  ]', gen.ORDER_ATOMIC];
};

gen['modal_reply'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "'Recibido'";
  return 'await interaction.reply({ content: ' + text + ', ephemeral: true });\n';
};

gen['use_form_template'] = function(block) {
  const name = block.getFieldValue('TEMPLATE');
  if (!name) return '// (selecciona una plantilla guardada)\n';

  try {
    const key = window.getUserStorageKey ? window.getUserStorageKey('forms') : 'commanderbot_forms_guest';
    const data = localStorage.getItem(key);
    const templates = data ? JSON.parse(data) : [];
    const t = templates.find(t => t.name === name);
    if (!t) return '// Plantilla "' + name + '" no encontrada\n';

    const form = t.data;
    const fieldsCode = form.fields.map(f => {
      let style = f.type === 'paragraph' ? 'TextInputStyle.Paragraph' : 'TextInputStyle.Short';
      let extra = '';
      if (f.type === 'dropdown') {
        const opts = (f.options || '').split(',').map(o => o.trim()).filter(Boolean);
        extra = '\n      .addOptions([' + opts.map(o => "'" + o.replace(/'/g, "\\'") + "'").join(', ') + '])';
      }
      return 'new ActionRowBuilder().addComponents(\n    new TextInputBuilder()\n      .setCustomId(\'' + (f.customId || 'campo').replace(/'/g, "\\'") + '\')\n      .setLabel(\'' + (f.label || 'Campo').replace(/'/g, "\\'") + '\')\n      .setStyle(' + style + ')\n      .setRequired(' + (f.required ? 'true' : 'false') + ')' + extra + '\n  )';
    }).join(',\n  ');

    return 'const modal = new ModalBuilder()\n  .setCustomId(\'' + form.customId.replace(/'/g, "\\'") + '\')\n  .setTitle(\'' + (form.title || 'Formulario').replace(/'/g, "\\'") + '\')\n  .addComponents(\n  ' + fieldsCode + '\n  );\n\nawait interaction.showModal(modal);\n';
  } catch (e) {
    return '// Error al leer plantilla: ' + e.message + '\n';
  }
};

// ─── Variables ───
gen['set_variable'] = function(block) {
  const name = block.getFieldValue('VAR_NAME') || 'variable';
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "''";
  return 'let ' + name + ' = ' + value + ';\n';
};

gen['get_variable'] = function(block) {
  const name = block.getFieldValue('VAR_NAME') || 'variable';
  return [name, gen.ORDER_ATOMIC];
};

// ─── Arrays ───
gen['text_split'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  const delim = gen.valueToCode(block, 'DELIM', gen.ORDER_ATOMIC) || "','";
  return [text + '.split(' + delim + ')', gen.ORDER_MEMBER];
};

gen['array_get'] = function(block) {
  const index = gen.valueToCode(block, 'INDEX', gen.ORDER_ATOMIC) || '0';
  const array = gen.valueToCode(block, 'ARRAY', gen.ORDER_ATOMIC) || '[]';
  return [array + '[' + index + '] || ""', gen.ORDER_MEMBER];
};

gen['array_length'] = function(block) {
  const array = gen.valueToCode(block, 'ARRAY', gen.ORDER_ATOMIC) || '[]';
  return [array + '.length', gen.ORDER_MEMBER];
};

gen['array_join'] = function(block) {
  const array = gen.valueToCode(block, 'ARRAY', gen.ORDER_ATOMIC) || '[]';
  const sep = gen.valueToCode(block, 'SEPARATOR', gen.ORDER_ATOMIC) || "','";
  return [array + '.join(' + sep + ')', gen.ORDER_MEMBER];
};

// ─── Loop ───
gen['for_each'] = function(block) {
  const varName = block.getFieldValue('VAR') || 'item';
  const array = gen.valueToCode(block, 'ARRAY', gen.ORDER_ATOMIC) || '[]';
  const body = gen.statementToCode(block, 'DO');
  return 'for (const ' + varName + ' of ' + array + ') {\n' + body + '}\n';
};

// ─── Plantillas de datos ───
gen['save_data_template'] = function(block) {
  const templateName = block.getFieldValue('TEMPLATE_NAME') || 'mi_plantilla';
  const key = gen.valueToCode(block, 'KEY', gen.ORDER_ATOMIC) || "''";
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "''";
  return `// Guardar en plantilla "${templateName}"
const __tmpl_${templateName} = __tmpl_${templateName} || {};
__tmpl_${templateName}[${key}] = ${value};
// En producción: guarda __tmpl_${templateName} en base de datos o archivo JSON
`;
};

gen['get_data_template'] = function(block) {
  const templateName = block.getFieldValue('TEMPLATE_NAME') || 'mi_plantilla';
  const key = gen.valueToCode(block, 'KEY', gen.ORDER_ATOMIC) || "''";
  return ['(__tmpl_' + templateName + ' || {})[' + key + '] || ""', gen.ORDER_MEMBER];
};

gen['list_data_templates'] = function(block) {
  return ['Object.keys(__data_templates || {})', gen.ORDER_MEMBER];
};

gen['list_form_templates'] = function(block) {
  return ['Object.keys(__form_templates || {})', gen.ORDER_MEMBER];
};

gen['template_add_value'] = function(block) {
  const templateName = block.getFieldValue('TEMPLATE_NAME') || 'mi_plantilla';
  const key = gen.valueToCode(block, 'KEY', gen.ORDER_ATOMIC) || "''";
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "''";
  return `// Añadir a plantilla "${templateName}"
const __tmplArr_${templateName} = __tmpl_${templateName}[${key}] || [];
__tmplArr_${templateName}.push(${value});
__tmpl_${templateName}[${key}] = __tmplArr_${templateName};
`;
};

// ─── Eventos de servidor ───
gen['event_member_join'] = function(block) {
  const body = gen.statementToCode(block, 'DO');
  return 'client.on("guildMemberAdd", async (member) => {\n' + body + '});\n';
};

gen['event_member_leave'] = function(block) {
  const body = gen.statementToCode(block, 'DO');
  return 'client.on("guildMemberRemove", async (member) => {\n' + body + '});\n';
};

gen['event_reaction_add'] = function(block) {
  const body = gen.statementToCode(block, 'DO');
  return 'client.on("messageReactionAdd", async (reaction, user) => {\n' + body + '});\n';
};

gen['event_reaction_remove'] = function(block) {
  const body = gen.statementToCode(block, 'DO');
  return 'client.on("messageReactionRemove", async (reaction, user) => {\n' + body + '});\n';
};

// ─── Roles ───
gen['add_role'] = function(block) {
  const role = gen.valueToCode(block, 'ROLE', gen.ORDER_ATOMIC) || "''";
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  return `// Añadir rol - requiere member y role objects
const __target = message.guild.members.cache.find(m => m.user.id === ${user} || m.user.username === ${user});
const __role = message.guild.roles.cache.find(r => r.name === ${role});
if (__target && __role) await __target.roles.add(__role);
`;
};

gen['remove_role'] = function(block) {
  const role = gen.valueToCode(block, 'ROLE', gen.ORDER_ATOMIC) || "''";
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  return `// Quitar rol
const __target = message.guild.members.cache.find(m => m.user.id === ${user} || m.user.username === ${user});
const __role = message.guild.roles.cache.find(r => r.name === ${role});
if (__target && __role) await __target.roles.remove(__role);
`;
};

gen['has_role'] = function(block) {
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  const role = gen.valueToCode(block, 'ROLE', gen.ORDER_ATOMIC) || "''";
  return ['(message.member.roles.cache.some(r => r.name === ' + role + '))', gen.ORDER_MEMBER];
};

gen['get_role_by_name'] = function(block) {
  const name = gen.valueToCode(block, 'NAME', gen.ORDER_ATOMIC) || "''";
  return ['(message.guild.roles.cache.find(r => r.name === ' + name + ')?.id || "")', gen.ORDER_MEMBER];
};

// ─── Mensajes avanzados ───
gen['send_dm'] = function(block) {
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  return `// Enviar DM
const __user = client.users.cache.find(u => u.id === ${user} || u.username === ${user});
if (__user) await __user.send(${text});
`;
};

gen['add_reaction'] = function(block) {
  const emoji = gen.valueToCode(block, 'EMOJI', gen.ORDER_ATOMIC) || "'👍'";
  return 'await message.react(' + emoji + ');\n';
};

gen['delete_message'] = function(block) {
  return 'await message.delete();\n';
};

// ─── Moderación ───
gen['kick_user'] = function(block) {
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  const reason = gen.valueToCode(block, 'REASON', gen.ORDER_ATOMIC) || "''";
  return `// Expulsar usuario
const __kickTarget = message.guild.members.cache.find(m => m.user.id === ${user} || m.user.username === ${user});
if (__kickTarget) await __kickTarget.kick(${reason});
`;
};

gen['ban_user'] = function(block) {
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  const reason = gen.valueToCode(block, 'REASON', gen.ORDER_ATOMIC) || "''";
  return `// Banear usuario
const __banTarget = message.guild.members.cache.find(m => m.user.id === ${user} || m.user.username === ${user});
if (__banTarget) await __banTarget.ban({ reason: ${reason} });
`;
};

gen['timeout_user'] = function(block) {
  const user = gen.valueToCode(block, 'USER', gen.ORDER_ATOMIC) || "''";
  const minutes = gen.valueToCode(block, 'MINUTES', gen.ORDER_ATOMIC) || '10';
  const reason = gen.valueToCode(block, 'REASON', gen.ORDER_ATOMIC) || "''";
  return `// Silenciar usuario
const __timeTarget = message.guild.members.cache.find(m => m.user.id === ${user} || m.user.username === ${user});
if (__timeTarget) await __timeTarget.timeout(${minutes} * 60 * 1000, ${reason});
`;
};

// ─── Canales ───
gen['get_channel_by_name'] = function(block) {
  const name = gen.valueToCode(block, 'NAME', gen.ORDER_ATOMIC) || "''";
  return ['(message.guild.channels.cache.find(c => c.name === ' + name + ')?.toString() || "")', gen.ORDER_MEMBER];
};

gen['create_channel'] = function(block) {
  const name = gen.valueToCode(block, 'NAME', gen.ORDER_ATOMIC) || "'nuevo-canal'";
  return 'await message.guild.channels.create({ name: ' + name + ', type: ChannelType.GuildText });\n';
};

// ─── Base de Datos ───
gen['db_create_table'] = function(block) {
  const table = block.getFieldValue('TABLE') || 'mi_tabla';
  let cols = [];
  let colBlock = block.getInputTargetBlock('COLUMNS');
  while (colBlock) {
    if (colBlock.type === 'db_column') {
      const name = colBlock.getFieldValue('NAME') || 'campo';
      const type = colBlock.getFieldValue('TYPE') || 'TEXT';
      const pk = colBlock.getFieldValue('PK') === 'TRUE';
      const notNull = colBlock.getFieldValue('NOT_NULL') === 'TRUE';
      const def = gen.valueToCode(colBlock, 'DEFAULT', gen.ORDER_ATOMIC);
      let s = name + ' ' + type;
      if (pk) s += ' PRIMARY KEY';
      if (notNull) s += ' NOT NULL';
      if (def) s += ' DEFAULT ' + def;
      cols.push(s);
    }
    colBlock = colBlock.getNextBlock();
  }
  return 'db.exec(`CREATE TABLE IF NOT EXISTS ' + table + ' (\\n  ' + cols.join(',\\n  ') + '\\n)`);\n';
};

gen['db_run'] = function(block) {
  const sql = gen.valueToCode(block, 'SQL', gen.ORDER_ATOMIC) || "''";
  let paramsObj = {};
  let pBlock = block.getInputTargetBlock('PARAMS');
  while (pBlock) {
    if (pBlock.type === 'db_param') {
      const name = pBlock.getFieldValue('NAME') || 'p';
      const val = gen.valueToCode(pBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      paramsObj[name] = val;
    }
    pBlock = pBlock.getNextBlock();
  }
  const paramsStr = Object.keys(paramsObj).length > 0 ? '{ ' + Object.entries(paramsObj).map(([k, v]) => k + ': ' + v).join(', ') + ' }' : '{}';
  const sqlClean = sql.replace(/\\{\\{\\w+\\}\\}/g, '?');
  return 'const stmt = db.prepare(' + sqlClean + ');\\nstmt.run(' + paramsStr + ');\\n';
};

gen['db_select_all'] = function(block) {
  const sql = gen.valueToCode(block, 'SQL', gen.ORDER_ATOMIC) || "''";
  let paramsObj = {};
  let pBlock = block.getInputTargetBlock('PARAMS');
  while (pBlock) {
    if (pBlock.type === 'db_param') {
      const name = pBlock.getFieldValue('NAME') || 'p';
      const val = gen.valueToCode(pBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      paramsObj[name] = val;
    }
    pBlock = pBlock.getNextBlock();
  }
  const paramsStr = Object.keys(paramsObj).length > 0 ? '{ ' + Object.entries(paramsObj).map(([k, v]) => k + ': ' + v).join(', ') + ' }' : '{}';
  const sqlClean = sql.replace(/\\{\\{\\w+\\}\\}/g, '?');
  return ['db.prepare(' + sqlClean + ').all(' + paramsStr + ')', gen.ORDER_MEMBER];
};

gen['db_select_one'] = function(block) {
  const sql = gen.valueToCode(block, 'SQL', gen.ORDER_ATOMIC) || "''";
  let paramsObj = {};
  let pBlock = block.getInputTargetBlock('PARAMS');
  while (pBlock) {
    if (pBlock.type === 'db_param') {
      const name = pBlock.getFieldValue('NAME') || 'p';
      const val = gen.valueToCode(pBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      paramsObj[name] = val;
    }
    pBlock = pBlock.getNextBlock();
  }
  const paramsStr = Object.keys(paramsObj).length > 0 ? '{ ' + Object.entries(paramsObj).map(([k, v]) => k + ': ' + v).join(', ') + ' }' : '{}';
  const sqlClean = sql.replace(/\\{\\{\\w+\\}\\}/g, '?');
  return ['db.prepare(' + sqlClean + ').get(' + paramsStr + ')', gen.ORDER_MEMBER];
};

gen['db_get'] = function(block) {
  const sql = gen.valueToCode(block, 'SQL', gen.ORDER_ATOMIC) || "''";
  let paramsObj = {};
  let pBlock = block.getInputTargetBlock('PARAMS');
  while (pBlock) {
    if (pBlock.type === 'db_param') {
      const name = pBlock.getFieldValue('NAME') || 'p';
      const val = gen.valueToCode(pBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      paramsObj[name] = val;
    }
    pBlock = pBlock.getNextBlock();
  }
  const paramsStr = Object.keys(paramsObj).length > 0 ? '{ ' + Object.entries(paramsObj).map(([k, v]) => k + ': ' + v).join(', ') + ' }' : '{}';
  const sqlClean = sql.replace(/\\{\\{\\w+\\}\\}/g, '?');
  return ['(db.prepare(' + sqlClean + ').get(' + paramsStr + ')?.{{field}} || "")', gen.ORDER_MEMBER];
};

gen['db_count'] = function(block) {
  const sql = gen.valueToCode(block, 'SQL', gen.ORDER_ATOMIC) || "''";
  let paramsObj = {};
  let pBlock = block.getInputTargetBlock('PARAMS');
  while (pBlock) {
    if (pBlock.type === 'db_param') {
      const name = pBlock.getFieldValue('NAME') || 'p';
      const val = gen.valueToCode(pBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      paramsObj[name] = val;
    }
    pBlock = pBlock.getNextBlock();
  }
  const paramsStr = Object.keys(paramsObj).length > 0 ? '{ ' + Object.entries(paramsObj).map(([k, v]) => k + ': ' + v).join(', ') + ' }' : '{}';
  const sqlClean = sql.replace(/\\{\\{\\w+\\}\\}/g, '?');
  return ['(db.prepare(' + sqlClean + ').get(' + paramsStr + ')?.count || 0)', gen.ORDER_MEMBER];
};

gen['db_param'] = function(block) {
  return '';
};

gen['db_result'] = function(block) {
  const row = gen.valueToCode(block, 'ROW', gen.ORDER_ATOMIC) || '{}';
  const field = block.getFieldValue('FIELD') || 'campo';
  return ['(' + row + '?.' + field + ' || "")', gen.ORDER_MEMBER];
};

gen['db_result_array'] = function(block) {
  const rows = gen.valueToCode(block, 'ROWS', gen.ORDER_ATOMIC) || '[]';
  const index = gen.valueToCode(block, 'INDEX', gen.ORDER_ATOMIC) || '0';
  const field = block.getFieldValue('FIELD') || 'campo';
  return ['(' + rows + '?.[' + index + ']?.' + field + ' || "")', gen.ORDER_MEMBER];
};

gen['db_last_id'] = function(block) {
  return ['(db.prepare("SELECT last_insert_rowid() as id").get()?.id || 0)', gen.ORDER_MEMBER];
};

// ─── Transacciones ───
gen['db_transaction'] = function(block) {
  const name = block.getFieldValue('NAME') || 'transaccion';
  const body = gen.statementToCode(block, 'DO');
  return `// TransacciA3n: ${name}\ndb.transaction(() => {\n${body}});\n`;
};

// ─── Select Menus ───
gen['send_select_menu'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  let opts = [];
  let oBlock = block.getInputTargetBlock('OPTIONS');
  while (oBlock) {
    if (oBlock.type === 'select_option') {
      const label = gen.valueToCode(oBlock, 'LABEL', gen.ORDER_ATOMIC) || "'OpciA3n'";
      const value = oBlock.getFieldValue('VALUE') || 'opcion';
      const desc = gen.valueToCode(oBlock, 'DESC', gen.ORDER_ATOMIC) || "''";
      opts.push('{ label: ' + label + ', value: "' + value + '", description: ' + desc + ' }');
    }
    oBlock = oBlock.getNextBlock();
  }
  const ch = block.getFieldValue('CHANNEL') || 'current';
  let channel = ch === 'current' ? 'message.channel' : "client.channels.cache.find(c => c.name === '" + ch + "')";
  return channel + '.send({ content: ' + text + ', components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("menu_' + Date.now() + '").addOptions(' + opts.join(', ') + '))] });\n';
};

gen['select_option'] = function(block) {
  return '';
};

gen['on_select_menu'] = function(block) {
  const customId = block.getFieldValue('CUSTOM_ID') || 'menu_1';
  const body = gen.statementToCode(block, 'DO');
  return 'event_select_menu_' + customId + ':\n' + body;
};

gen['select_get_value'] = function(block) {
  return ['interaction.values?.[0] || ""', gen.ORDER_MEMBER];
};

gen['select_get_label'] = function(block) {
  return ['(interaction.component?.options?.find(o => o.value === interaction.values?.[0])?.label || "")', gen.ORDER_MEMBER];
};

// ─── Menús Dinámicos ───
gen['send_select_menu_dynamic'] = function(block) {
  const text = gen.valueToCode(block, 'TEXT', gen.ORDER_ATOMIC) || "''";
  const options = gen.valueToCode(block, 'OPTIONS', gen.ORDER_ATOMIC) || '[]';
  const ch = block.getFieldValue('CHANNEL') || 'current';
  let channel = ch === 'current' ? 'message.channel' : "client.channels.cache.find(c => c.name === '" + ch + "')";
  return channel + '.send({ content: ' + text + ', components: [new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId("menu_' + Date.now() + '").addOptions(' + options + '))] });\n';
};

gen['build_option'] = function(block) {
  const label = gen.valueToCode(block, 'LABEL', gen.ORDER_ATOMIC) || "'Opción'";
  const value = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || "'opcion'";
  const desc = gen.valueToCode(block, 'DESC', gen.ORDER_ATOMIC) || "''";
  return ['{ label: ' + label + ', value: ' + value + ', description: ' + desc + ' }', gen.ORDER_ATOMIC];
};

// ─── Opciones de Comando ───
gen['event_command_with_options'] = function(block) {
  const cmd = block.getFieldValue('COMMAND') || 'comando';
  const body = gen.statementToCode(block, 'DO');
  return 'event_command_options_' + cmd + ':\n' + body;
};

gen['command_option'] = function(block) {
  return '';
};

gen['get_option'] = function(block) {
  const name = block.getFieldValue('NAME') || 'param';
  return ['interaction.options.get("' + name + '")?.value || ""', gen.ORDER_MEMBER];
};

// ─── Subcomandos ───
gen['event_command_with_subcommands'] = function(block) {
  const cmd = block.getFieldValue('COMMAND') || 'comando';
  let code = '';
  let subBlock = block.getInputTargetBlock('SUBCOMMANDS');
  while (subBlock) {
    if (subBlock.type === 'subcommand') {
      const name = subBlock.getFieldValue('NAME') || 'sub';
      const body = gen.statementToCode(subBlock, 'DO');
      code += 'event_command_' + cmd + '_' + name + ':\n' + body;
    }
    subBlock = subBlock.getNextBlock();
  }
  return code;
};

gen['subcommand'] = function(block) {
  return '';
};

// ─── Bucles Avanzados ───
gen['for_i'] = function(block) {
  const varName = block.getFieldValue('VAR') || 'i';
  const from = gen.valueToCode(block, 'FROM', gen.ORDER_ATOMIC) || '0';
  const to = gen.valueToCode(block, 'TO', gen.ORDER_ATOMIC) || '10';
  const body = gen.statementToCode(block, 'DO');
  return 'for (let ' + varName + ' = ' + from + '; ' + varName + ' <= ' + to + '; ' + varName + '++) {\n' + body + '}\n';
};

// ─── JS Raw ───
gen['raw_javascript'] = function(block) {
  const code = block.getFieldValue('CODE') || '// cA3digo';
  return code + '\n';
};

gen['raw_javascript_expr'] = function(block) {
  const code = block.getFieldValue('CODE') || 'null';
  return [code, gen.ORDER_ATOMIC];
};

// ─── Utilidades ───
gen['number_format'] = function(block) {
  const num = gen.valueToCode(block, 'NUM', gen.ORDER_ATOMIC) || '0';
  const dec = gen.valueToCode(block, 'DECIMALS', gen.ORDER_ATOMIC) || '0';
  return ['Number(' + num + ').toLocaleString("es-ES", { minimumFractionDigits: ' + dec + ', maximumFractionDigits: ' + dec + ' })', gen.ORDER_MEMBER];
};

gen['create_object'] = function(block) {
  let pairs = [];
  let pBlock = block.getInputTargetBlock('PAIRS');
  while (pBlock) {
    if (pBlock.type === 'object_pair') {
      const key = pBlock.getFieldValue('KEY') || 'clave';
      const val = gen.valueToCode(pBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      pairs.push(key + ': ' + val);
    }
    pBlock = pBlock.getNextBlock();
  }
  return ['{ ' + pairs.join(', ') + ' }', gen.ORDER_ATOMIC];
};

gen['object_pair'] = function(block) {
  return '';
};

gen['object_get'] = function(block) {
  const obj = gen.valueToCode(block, 'OBJ', gen.ORDER_ATOMIC) || '{}';
  const key = block.getFieldValue('KEY') || 'clave';
  return ['(' + obj + '?.["' + key + '"] || "")', gen.ORDER_MEMBER];
};

gen['object_set'] = function(block) {
  const obj = gen.valueToCode(block, 'OBJ', gen.ORDER_ATOMIC) || '{}';
  const key = block.getFieldValue('KEY') || 'clave';
  const val = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || 'null';
  return obj + '["' + key + '"] = ' + val + ';\n';
};

gen['array_create'] = function(block) {
  let items = [];
  let iBlock = block.getInputTargetBlock('ITEMS');
  while (iBlock) {
    if (iBlock.type === 'array_item') {
      const val = gen.valueToCode(iBlock, 'VALUE', gen.ORDER_ATOMIC) || 'null';
      items.push(val);
    }
    iBlock = iBlock.getNextBlock();
  }
  return ['[' + items.join(', ') + ']', gen.ORDER_ATOMIC];
};

gen['array_item'] = function(block) {
  return '';
};

gen['array_push'] = function(block) {
  const val = gen.valueToCode(block, 'VALUE', gen.ORDER_ATOMIC) || 'null';
  const arr = gen.valueToCode(block, 'ARRAY', gen.ORDER_ATOMIC) || '[]';
  return ['((' + arr + ').concat([' + val + ']))', gen.ORDER_MEMBER];
};

// ─── Temporizadores ───
gen['schedule_after'] = function(block) {
  const secs = gen.valueToCode(block, 'SECONDS', gen.ORDER_ATOMIC) || '0';
  const body = gen.statementToCode(block, 'DO');
  return 'setTimeout(async () => {\n' + body + '}, ' + secs + ' * 1000);\n';
};