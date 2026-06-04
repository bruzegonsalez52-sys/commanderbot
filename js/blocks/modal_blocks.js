// ─── Bloques para Formularios Modales de Discord ───

Blockly.defineBlocksWithJsonArray([
  {
    "type": "event_modal_submit",
    "message0": "Cuando envíen formulario id: %1 %2",
    "args0": [
      {"type": "field_input", "name": "CUSTOM_ID", "text": "mi_formulario"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Ejecuta acciones cuando alguien envía un formulario modal. El ID debe coincidir con el del formulario. Ejemplo: id='sugerencia'",
    "helpUrl": ""
  },
  {
    "type": "show_modal",
    "message0": "Mostrar formulario %1 al usuario %2",
    "args0": [
      {"type": "input_value", "name": "FORM", "check": "Modal"},
      {"type": "input_value", "name": "USER", "check": "String"}
    ],
    "colour": 230,
    "tooltip": "Muestra un formulario modal a un usuario. El formulario debe crearse con el bloque 'Crear formulario'. Ej: mostrar formulario de sugerencias",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "create_modal",
    "message0": "Crear formulario título: %1 id: %2 %3 campos: %4",
    "args0": [
      {"type": "input_value", "name": "TITLE", "check": "String"},
      {"type": "field_input", "name": "CUSTOM_ID", "text": "mi_formulario"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "FIELDS", "check": "Array"}
    ],
    "output": "Modal",
    "colour": 290,
    "tooltip": "Crea un formulario modal con título, ID único y lista de campos. El título máximo es 45 caracteres",
    "helpUrl": ""
  },
  {
    "type": "modal_field_text",
    "message0": "Campo texto etiqueta: %1 id: %2 obligatorio: %3 valor inicial: %4",
    "args0": [
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "field_input", "name": "CUSTOM_ID", "text": "campo_texto"},
      {"type": "field_checkbox", "name": "REQUIRED", "checked": true},
      {"type": "input_value", "name": "VALUE", "check": "String"}
    ],
    "output": "ModalField",
    "colour": 290,
    "tooltip": "Campo de texto corto para formularios. Ej: etiqueta='Nombre', id='nombre'. Máximo 400 caracteres",
    "helpUrl": ""
  },
  {
    "type": "modal_field_paragraph",
    "message0": "Campo párrafo etiqueta: %1 id: %2 obligatorio: %3 valor inicial: %4",
    "args0": [
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "field_input", "name": "CUSTOM_ID", "text": "campo_parrafo"},
      {"type": "field_checkbox", "name": "REQUIRED", "checked": true},
      {"type": "input_value", "name": "VALUE", "check": "String"}
    ],
    "output": "ModalField",
    "colour": 290,
    "tooltip": "Campo de texto largo (párrafo) para formularios. Ej: etiqueta='Descripción', id='desc'. Máximo 1000 caracteres",
    "helpUrl": ""
  },
  {
    "type": "modal_field_dropdown",
    "message0": "Campo menú etiqueta: %1 id: %2 opciones: %3 obligatorio: %4",
    "args0": [
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "field_input", "name": "CUSTOM_ID", "text": "campo_menu"},
      {"type": "input_value", "name": "OPTIONS", "check": "String"},
      {"type": "field_checkbox", "name": "REQUIRED", "checked": true}
    ],
    "output": "ModalField",
    "colour": 290,
    "tooltip": "Menú desplegable con opciones. Separa las opciones con coma. Ej: 'Opción 1,Opción 2,Opción 3'",
    "helpUrl": ""
  },
  {
    "type": "modal_get_value",
    "message0": "Valor del campo %1 del formulario",
    "args0": [
      {"type": "field_input", "name": "FIELD_ID", "text": "campo_texto"}
    ],
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene el valor que el usuario escribió en un campo del formulario. Usa el ID del campo. Ej: campo 'nombre' → 'Juan'",
    "helpUrl": ""
  },
  {
    "type": "make_field_array",
    "message0": "Campos: %1 %2 %3",
    "args0": [
      {"type": "input_value", "name": "A", "check": "ModalField"},
      {"type": "input_value", "name": "B", "check": "ModalField"},
      {"type": "input_value", "name": "C", "check": "ModalField"}
    ],
    "output": "Array",
    "colour": 290,
    "tooltip": "Agrupa varios campos para usarlos en un formulario. Conecta hasta 3 campos (máximo 5 en Discord)",
    "helpUrl": ""
  },
  {
    "type": "modal_reply",
    "message0": "Responder formulario con: %1",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"}
    ],
    "colour": 230,
    "tooltip": "Responde al envío del formulario con un mensaje de confirmación. Ej: 'Formulario recibido correctamente'",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  }
]);

// ─── Bloque para listar plantillas de formularios ───
Blockly.defineBlocksWithJsonArray([{
  "type": "list_form_templates",
  "message0": "Listar plantillas de formularios",
  "args0": [],
  "output": "Array",
  "colour": 290,
  "tooltip": "Obtiene los nombres de todas las plantillas de formularios guardadas en el Constructor de Formularios"
}]);

// ─── Bloque dinámico: Usar plantilla de formulario guardada ───
function getFormTemplateOptions() {
  try {
    const key = window.getUserStorageKey ? window.getUserStorageKey('forms') : 'commanderbot_forms_guest';
    const data = localStorage.getItem(key);
    const templates = data ? JSON.parse(data) : [];
    if (templates.length === 0) return [['(sin plantillas)', '']];
    return templates.map(t => [t.name, t.name]);
  } catch { return [['(sin plantillas)', '']]; }
}

Blockly.Blocks['use_form_template'] = {
  init: function() {
    this.jsonInit({
      "type": "use_form_template",
      "message0": "Usar formulario guardado: %1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TEMPLATE",
          "options": getFormTemplateOptions()
        }
      ],
      "colour": 290,
      "tooltip": "Usa un formulario guardado en el Constructor de Formularios. Guarda la plantilla primero allí",
      "helpUrl": "",
      "previousStatement": null,
      "nextStatement": null
    });
  }
};

// Función para refrescar el dropdown cuando cambian las plantillas
window.rebuildFormBlocks = function() {
  try {
    const ws = Blockly.getMainWorkspace();
    if (!ws) return;
    const blocks = ws.getAllBlocks(false) || [];
    blocks.forEach(b => {
      if (b.type === 'use_form_template') {
        const field = b.getField('TEMPLATE');
        if (field) {
          field.menuGenerator_ = getFormTemplateOptions;
        }
      }
    });
  } catch(e) { console.log('rebuildFormBlocks:', e); }
};

// ─── Añadir al toolbox ───
const MODAL_TOOLBOX_XML = `
  <category name="Formularios" colour="290">
    <block type="create_modal"></block>
    <block type="show_modal"></block>
    <block type="modal_field_text">
      <field name="CUSTOM_ID">nombre</field>
    </block>
    <block type="modal_field_paragraph">
      <field name="CUSTOM_ID">descripcion</field>
    </block>
    <block type="modal_field_dropdown">
      <field name="CUSTOM_ID">opcion</field>
    </block>
    <block type="make_field_array"></block>
    <block type="event_modal_submit">
      <field name="CUSTOM_ID">mi_formulario</field>
    </block>
    <block type="modal_get_value">
      <field name="FIELD_ID">nombre</field>
    </block>
    <block type="modal_reply"></block>
    <block type="use_form_template"></block>
    <block type="list_form_templates"></block>
  </category>
`;

// Insertar en el toolbox global (se hace en app.js)
const DISCORD_TOOLBOX_MODIFIED = DISCORD_TOOLBOX.replace(
  '</xml>',
  MODAL_TOOLBOX_XML + '\n</xml>'
);