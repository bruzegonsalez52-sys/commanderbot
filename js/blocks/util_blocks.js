// ─── Bloques de utilidad: variables, arrays, loops, plantillas ───

Blockly.defineBlocksWithJsonArray([
  // ─── Variables ───
  {
    "type": "set_variable",
    "message0": "Guardar en variable %1 el valor %2",
    "args0": [
      {"type": "field_input", "name": "VAR_NAME", "text": "variable"},
      {"type": "input_value", "name": "VALUE", "check": "String"}
    ],
    "colour": 160,
    "tooltip": "Guarda un valor en una variable para usarla después. Ej: variable='nombre', valor='Juan'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "get_variable",
    "message0": "Variable %1",
    "args0": [
      {"type": "field_input", "name": "VAR_NAME", "text": "variable"}
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "Obtiene el valor guardado en una variable. Úsalo después de 'Guardar en variable'"
  },
  // ─── Arrays / Texto ───
  {
    "type": "text_split",
    "message0": "Dividir texto %1 separador %2",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "input_value", "name": "DELIM", "check": "String"}
    ],
    "output": "Array",
    "colour": 160,
    "tooltip": "Divide un texto en partes usando un separador. Ej: 'a,b,c' por ',' → ['a','b','c']"
  },
  {
    "type": "array_get",
    "message0": "Elemento %1 de %2",
    "args0": [
      {"type": "input_value", "name": "INDEX", "check": "Number"},
      {"type": "input_value", "name": "ARRAY", "check": "Array"}
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "Obtiene un elemento del array por su posición. El primer elemento es 0. Ej: [0] de ['a','b'] → 'a'"
  },
  {
    "type": "array_length",
    "message0": "Largo de %1",
    "args0": [
      {"type": "input_value", "name": "ARRAY", "check": "Array"}
    ],
    "output": "Number",
    "colour": 160,
    "tooltip": "Obtiene cuántos elementos tiene un array. Ej: ['a','b','c'] → 3"
  },
  {
    "type": "array_join",
    "message0": "Unir %1 con %2",
    "args0": [
      {"type": "input_value", "name": "ARRAY", "check": "Array"},
      {"type": "input_value", "name": "SEPARATOR", "check": "String"}
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "Une todos los elementos de un array en un texto con un separador. Ej: ['a','b'] + '-' → 'a-b'"
  },
  // ─── Loop ───
  {
    "type": "for_each",
    "message0": "Repetir %1 con cada %2 en %3 %4",
    "args0": [
      {"type": "input_dummy"},
      {"type": "field_input", "name": "VAR", "text": "item"},
      {"type": "input_value", "name": "ARRAY", "check": "Array"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 210,
    "tooltip": "Ejecuta acciones para cada elemento de un array. El elemento actual se guarda en la variable. Ej: repetir con cada 'fruta' en ['manzana','pera']",
    "previousStatement": null,
    "nextStatement": null
  },
  // ─── Plantillas de datos ───
  {
    "type": "save_data_template",
    "message0": "Guardar en plantilla %1 clave %2 valor %3",
    "args0": [
      {"type": "field_input", "name": "TEMPLATE_NAME", "text": "mi_plantilla"},
      {"type": "input_value", "name": "KEY", "check": "String"},
      {"type": "input_value", "name": "VALUE", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Guarda un valor en una plantilla con nombre. Úsalo dentro de 'Cuando envíen formulario' para guardar respuestas. Después puedes obtener el valor con 'De plantilla ... clave ...'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "get_data_template",
    "message0": "De plantilla %1 clave %2",
    "args0": [
      {"type": "field_input", "name": "TEMPLATE_NAME", "text": "mi_plantilla"},
      {"type": "input_value", "name": "KEY", "check": "String"}
    ],
    "output": "String",
    "colour": 290,
    "tooltip": "Obtiene el valor de una clave guardada en una plantilla. Ej: de plantilla 'roles' clave 'mago' → 'Mago Poderoso'"
  },
  {
    "type": "list_data_templates",
    "message0": "Listar plantillas guardadas",
    "args0": [],
    "output": "Array",
    "colour": 290,
    "tooltip": "Obtiene una lista con los nombres de todas las plantillas de datos guardadas. Ej: ['roles', 'evento']"
  },
  {
    "type": "template_add_value",
    "message0": "Añadir a plantilla %1 clave %2 valor %3",
    "args0": [
      {"type": "field_input", "name": "TEMPLATE_NAME", "text": "mi_plantilla"},
      {"type": "input_value", "name": "KEY", "check": "String"},
      {"type": "input_value", "name": "VALUE", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade un valor a una lista guardada en una plantilla. Ej: añadir usuario a lista 'inscritos' en plantilla 'evento'",
    "previousStatement": null,
    "nextStatement": null
  }
]);

// ─── Toolbox extension ───
const UTIL_TOOLBOX_XML = `
  <category name="Variables" colour="160">
    <block type="set_variable">
      <field name="VAR_NAME">variable</field>
    </block>
    <block type="get_variable">
      <field name="VAR_NAME">variable</field>
    </block>
  </category>
  <category name="Texto Avanzado" colour="160">
    <block type="text_split"></block>
    <block type="array_get"></block>
    <block type="array_length"></block>
    <block type="array_join"></block>
  </category>
  <category name="Bucles" colour="210">
    <block type="for_each"></block>
  </category>
  <category name="Plantillas" colour="290">
    <block type="save_data_template">
      <field name="TEMPLATE_NAME">mi_plantilla</field>
    </block>
    <block type="get_data_template">
      <field name="TEMPLATE_NAME">mi_plantilla</field>
    </block>
    <block type="list_data_templates"></block>
    <block type="template_add_value">
      <field name="TEMPLATE_NAME">mi_plantilla</field>
    </block>
  </category>
`;

// Replace the previous TOOLBOX_WITH_IMAGES
const DISCORD_TOOLBOX_COMPLETE = (typeof DISCORD_TOOLBOX_WITH_IMAGES !== 'undefined' ? DISCORD_TOOLBOX_WITH_IMAGES : (typeof DISCORD_TOOLBOX_MODIFIED !== 'undefined' ? DISCORD_TOOLBOX_MODIFIED : DISCORD_TOOLBOX))
  .replace('</xml>', UTIL_TOOLBOX_XML + '\n</xml>');
