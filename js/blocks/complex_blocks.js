// ─── Bloques avanzados: Base de Datos, Select Menus, Opciones de Comando, JS Raw ───

Blockly.defineBlocksWithJsonArray([
  // ─── Base de Datos ───
  {
    "type": "db_create_table",
    "message0": "Crear tabla %1 %2 %3",
    "args0": [
      {"type": "field_input", "name": "TABLE", "text": "mi_tabla"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "COLUMNS"}
    ],
    "colour": 180,
    "tooltip": "Crea una tabla en la base de datos. Ej: tabla='balances' con columnas 'user_id', 'balance'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "db_column",
    "message0": "Columna %1 tipo %2 %3 %4 %5",
    "args0": [
      {"type": "field_input", "name": "NAME", "text": "campo"},
      {"type": "field_dropdown", "name": "TYPE", "options": [["Texto", "TEXT"], ["Número", "REAL"], ["Entero", "INTEGER"], ["Sí/No", "BOOLEAN"]]},
      {"type": "field_checkbox", "name": "PK", "checked": false},
      {"type": "input_value", "name": "DEFAULT", "check": null, "align": "RIGHT", "optional": true},
      {"type": "field_checkbox", "name": "NOT_NULL", "checked": false}
    ],
    "colour": 180,
    "tooltip": "Define una columna para una tabla. Marca PK si es clave primaria. Ej: 'user_id' tipo Texto con PK",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "db_run",
    "message0": "Ejecutar SQL: %1 parámetros %2",
    "args0": [
      {"type": "input_value", "name": "SQL", "check": "String"},
      {"type": "input_statement", "name": "PARAMS"}
    ],
    "colour": 180,
    "tooltip": "Ejecuta una consulta SQL de escritura (INSERT, UPDATE, DELETE). Usa {{nombre}} para parámetros. Ej: INSERT INTO balances (user_id, balance) VALUES ({{uid}}, {{bal}})",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "db_select_all",
    "message0": "Seleccionar: %1 parámetros %2",
    "args0": [
      {"type": "input_value", "name": "SQL", "check": "String"},
      {"type": "input_statement", "name": "PARAMS"}
    ],
    "output": "Array",
    "colour": 180,
    "tooltip": "Ejecuta SELECT y devuelve todas las filas como array. Ej: SELECT * FROM balances WHERE user_id = {{uid}}"
  },
  {
    "type": "db_select_one",
    "message0": "Seleccionar uno: %1 parámetros %2",
    "args0": [
      {"type": "input_value", "name": "SQL", "check": "String"},
      {"type": "input_statement", "name": "PARAMS"}
    ],
    "colour": 180,
    "tooltip": "Ejecuta SELECT y devuelve la primera fila. Ej: SELECT * FROM balances WHERE user_id = {{uid}}",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "db_get",
    "message0": "Obtener valor: %1 parámetros %2",
    "args0": [
      {"type": "input_value", "name": "SQL", "check": "String"},
      {"type": "input_statement", "name": "PARAMS"}
    ],
    "output": "String",
    "colour": 180,
    "tooltip": "Ejecuta SELECT y devuelve el primer campo de la primera fila. Ej: SELECT balance FROM balances WHERE user_id = {{uid}}"
  },
  {
    "type": "db_count",
    "message0": "Contar filas: %1 parámetros %2",
    "args0": [
      {"type": "input_value", "name": "SQL", "check": "String"},
      {"type": "input_statement", "name": "PARAMS"}
    ],
    "output": "Number",
    "colour": 180,
    "tooltip": "Ejecuta SELECT COUNT(*) y devuelve el número. Ej: SELECT COUNT(*) FROM balances WHERE balance > {{min}}"
  },
  {
    "type": "db_param",
    "message0": "Donde %1 = %2",
    "args0": [
      {"type": "field_input", "name": "NAME", "text": "uid"},
      {"type": "input_value", "name": "VALUE", "check": null}
    ],
    "colour": 180,
    "tooltip": "Define un parámetro para una consulta SQL. El nombre {{uid}} en el SQL se reemplaza con este valor",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "db_result",
    "message0": "De la fila %1 campo %2",
    "args0": [
      {"type": "input_value", "name": "ROW", "check": null},
      {"type": "field_input", "name": "FIELD", "text": "campo"}
    ],
    "output": "String",
    "colour": 180,
    "tooltip": "Obtiene el valor de un campo de una fila. Ej: de fila 'campo' llamado 'balance' → 100"
  },
  {
    "type": "db_result_array",
    "message0": "Del resultado %1 fila %2 campo %3",
    "args0": [
      {"type": "input_value", "name": "ROWS", "check": "Array"},
      {"type": "input_value", "name": "INDEX", "check": "Number"},
      {"type": "field_input", "name": "FIELD", "text": "campo"}
    ],
    "output": "String",
    "colour": 180,
    "tooltip": "Obtiene un campo de una fila específica en un array de resultados. Ej: fila 0 campo 'balance' del resultado de SELECT"
  },
  {
    "type": "db_last_id",
    "message0": "Último ID insertado",
    "args0": [],
    "output": "Number",
    "colour": 180,
    "tooltip": "Devuelve el ID de la última fila insertada con INSERT"
  },
  // ─── Transacciones ───
  {
    "type": "db_transaction",
    "message0": "Transacción %1 nombre %2 %3 %4",
    "args0": [
      {"type": "input_dummy"},
      {"type": "field_input", "name": "NAME", "text": "transferencia"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 180,
    "tooltip": "Ejecuta operaciones de DB de forma atómica. Si algo falla todo se revierte (rollback). Útil para transferencias de saldo, movimientos bancarios, etc.",
    "previousStatement": null,
    "nextStatement": null
  },
  // ─── Menús Select ───
  {
    "type": "send_select_menu",
    "message0": "Enviar menú %1 texto %2 %3 opciones %4",
    "args0": [
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["canal actual", "current"], ["general", "general"]]},
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "OPTIONS"}
    ],
    "colour": 290,
    "tooltip": "Envía un mensaje con un menú desplegable de selección. Conecta bloques 'Opción' dentro",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "select_option",
    "message0": "Opción: %1 valor %2 %3 descripción %4",
    "args0": [
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "field_input", "name": "VALUE", "text": "opcion_1"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "DESC", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Define una opción para un menú de selección. El label es lo que ve el usuario, el value es el dato interno",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "on_select_menu",
    "message0": "Cuando seleccionen %1 %2 %3 %4",
    "args0": [
      {"type": "input_dummy"},
      {"type": "field_input", "name": "CUSTOM_ID", "text": "menu_1"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 290,
    "tooltip": "Se ejecuta cuando alguien selecciona una opción de un menú. El CUSTOM_ID debe coincidir con el del menú",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "select_get_value",
    "message0": "Valor seleccionado",
    "args0": [],
    "output": "String",
    "colour": 290,
    "tooltip": "Obtiene el valor que el usuario seleccionó en un menú. Úsalo dentro de 'Cuando seleccionen...'"
  },
  {
    "type": "select_get_label",
    "message0": "Texto seleccionado",
    "args0": [],
    "output": "String",
    "colour": 290,
    "tooltip": "Obtiene el texto visible que el usuario seleccionó en un menú. Úsalo dentro de 'Cuando seleccionen...'"
  },
  // ─── Menús Dinámicos ───
  {
    "type": "send_select_menu_dynamic",
    "message0": "Enviar menú dinámico %1 texto %2 %3 opciones %4 %5 canal %6",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "OPTIONS", "check": "Array"},
      {"type": "input_dummy"},
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["canal actual", "current"], ["general", "general"]]}
    ],
    "colour": 290,
    "tooltip": "Envía un menú con opciones desde variables o base de datos. Las opciones deben ser un array de objetos {label, value, description}",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "build_option",
    "message0": "Opción label %1 value %2 desc %3",
    "args0": [
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "input_value", "name": "VALUE", "check": "String"},
      {"type": "input_value", "name": "DESC", "check": "String"}
    ],
    "output": null,
    "colour": 290,
    "tooltip": "Crea una opción para menú dinámico. label = texto visible, value = valor interno, desc = descripción opcional"
  },
  // ─── Paginación ───
  {
    "type": "send_paginated_embeds",
    "message0": "Enviar embeds paginados %1 texto %2 %3 páginas %4 %5 canal %6",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_value", "name": "CONTENT", "check": "String"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "PAGES", "check": "Array"},
      {"type": "input_dummy"},
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["canal actual", "current"], ["general", "general"]]}
    ],
    "colour": 290,
    "tooltip": "Envía un mensaje con botones ◀ ▶ para navegar entre páginas. Las páginas deben ser un array de embeds creados con 'Crear embed'",
    "previousStatement": null,
    "nextStatement": null
  },
  // ─── Opciones de Comando ───
  {
    "type": "event_command_with_options",
    "message0": "Comando slash %1 %2 con opciones: %3 %4 %5",
    "args0": [
      {"type": "input_dummy"},
      {"type": "field_input", "name": "COMMAND", "text": "comando"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "OPTIONS"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Comando con parámetros. Ej: /addbal [usuario] [cantidad]. Las opciones se definen abajo",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "command_option",
    "message0": "Opción %1 tipo %2 %3 requerida %4 descripción %5",
    "args0": [
      {"type": "field_input", "name": "NAME", "text": "param"},
      {"type": "field_dropdown", "name": "TYPE", "options": [["Texto", "String"], ["Usuario", "User"], ["Número", "Integer"], ["Sí/No", "Boolean"]]},
      {"type": "input_dummy"},
      {"type": "field_checkbox", "name": "REQUIRED", "checked": true},
      {"type": "field_input", "name": "DESC", "text": "Descripción del parámetro"}
    ],
    "colour": 120,
    "tooltip": "Define un parámetro para un comando slash. Ej: nombre='usuario', tipo='Usuario', requerido=true",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "get_option",
    "message0": "Opción %1",
    "args0": [
      {"type": "field_input", "name": "NAME", "text": "param"}
    ],
    "output": "String",
    "colour": 120,
    "tooltip": "Obtiene el valor de un parámetro del comando. Ej: opción 'usuario' → @Juan. Úsalo dentro de un comando"
  },
  // ─── Subcomandos ───
  {
    "type": "event_command_with_subcommands",
    "message0": "Comando con subcomandos /%1 %2 %3",
    "args0": [
      {"type": "field_input", "name": "COMMAND", "text": "plantilla"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "SUBCOMMANDS"}
    ],
    "colour": 120,
    "tooltip": "Define un comando principal con subcomandos. Ej: /plantilla crear, /plantilla editar. Conecta bloques Subcomando dentro",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "subcommand",
    "message0": "Subcomando %1 %2 descripción %3 %4 %5",
    "args0": [
      {"type": "field_input", "name": "NAME", "text": "crear"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "DESC", "check": "String"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 195,
    "tooltip": "Define un subcomando. Conecta varios para tener múltiples como /plantilla crear, /plantilla editar",
    "previousStatement": null,
    "nextStatement": null
  },
  // ─── Buques Avanzados ───
  {
    "type": "for_i",
    "message0": "Repetir %1 desde %2 hasta %3 %4 %5",
    "args0": [
      {"type": "field_input", "name": "VAR", "text": "i"},
      {"type": "input_value", "name": "FROM", "check": "Number"},
      {"type": "input_value", "name": "TO", "check": "Number"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 210,
    "tooltip": "Repite acciones con un contador. La variable 'i' toma valores desde 'desde' hasta 'hasta'. Ej: desde 0 hasta 5 → i=0,1,2,3,4,5",
    "previousStatement": null,
    "nextStatement": null
  },
  // ─── JS Raw ───
  {
    "type": "raw_javascript",
    "message0": "JavaScript: %1",
    "args0": [
      {"type": "field_multilinetext", "name": "CODE", "text": "// código aquí"}
    ],
    "colour": 0,
    "tooltip": "Escribe código JavaScript directamente. Peligro: no valida errores. Úsalo para lógica que no se puede hacer con bloques",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "raw_javascript_expr",
    "message0": "JS expresión: %1",
    "args0": [
      {"type": "field_input", "name": "CODE", "text": "Math.floor(x / y)"}
    ],
    "output": "String",
    "colour": 0,
    "tooltip": "Escribe una expresión JavaScript que devuelve un valor. Ej: Math.floor(x / y)" 
  },
  // ─── Utilidades ───
  {
    "type": "number_format",
    "message0": "Formatear número %1 con %2 decimales",
    "args0": [
      {"type": "input_value", "name": "NUM", "check": "Number"},
      {"type": "input_value", "name": "DECIMALS", "check": "Number"}
    ],
    "output": "String",
    "colour": 60,
    "tooltip": "Formatea un número con separador de miles y decimales. Ej: 1234567 → '1,234,567'"
  },
  {
    "type": "create_object",
    "message0": "Crear objeto %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "PAIRS"}
    ],
    "output": null,
    "colour": 60,
    "tooltip": "Crea un objeto con pares clave=valor. Úsalo para estructuras de datos. Conecta bloques 'Par' dentro"
  },
  {
    "type": "object_pair",
    "message0": "Par: %1 → %2",
    "args0": [
      {"type": "field_input", "name": "KEY", "text": "clave"},
      {"type": "input_value", "name": "VALUE", "check": null}
    ],
    "colour": 60,
    "tooltip": "Define un par clave=valor para un objeto. Ej: 'nombre' → 'Juan'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "object_get",
    "message0": "Del objeto %1 clave %2",
    "args0": [
      {"type": "input_value", "name": "OBJ", "check": null},
      {"type": "field_input", "name": "KEY", "text": "clave"}
    ],
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene el valor de una clave de un objeto. Ej: del objeto 'usuario' clave 'nombre' → 'Juan'"
  },
  {
    "type": "object_set",
    "message0": "En objeto %1 clave %2 = %3",
    "args0": [
      {"type": "input_value", "name": "OBJ", "check": null},
      {"type": "field_input", "name": "KEY", "text": "clave"},
      {"type": "input_value", "name": "VALUE", "check": null}
    ],
    "colour": 60,
    "tooltip": "Establece el valor de una clave en un objeto. Ej: en 'usuario' clave 'edad' = 25",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "array_create",
    "message0": "Crear array %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "ITEMS"}
    ],
    "output": "Array",
    "colour": 60,
    "tooltip": "Crea un array con elementos. Conecta bloques dentro para añadir elementos"
  },
  {
    "type": "array_item",
    "message0": "Elemento: %1",
    "args0": [
      {"type": "input_value", "name": "VALUE", "check": null}
    ],
    "colour": 60,
    "tooltip": "Define un elemento del array",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "array_push",
    "message0": "Añadir %1 al array %2",
    "args0": [
      {"type": "input_value", "name": "VALUE", "check": null},
      {"type": "input_value", "name": "ARRAY", "check": "Array"}
    ],
    "output": "Array",
    "colour": 60,
    "tooltip": "Añade un elemento al final del array y devuelve el array actualizado"
  },
  // ─── Temporizadores ───
  {
    "type": "schedule_after",
    "message0": "Esperar %1 segundos y hacer %2",
    "args0": [
      {"type": "input_value", "name": "SECONDS", "check": "Number"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 0,
    "tooltip": "Ejecuta acciones después de una espera. Ej: esperar 10 segundos y enviar mensaje. También genera setTimeout() en el código real",
    "previousStatement": null,
    "nextStatement": null
  }
]);

// ─── Toolbox extension ───
const COMPLEX_TOOLBOX_XML = `
  <category name="Base de Datos" colour="180">
    <block type="db_create_table">
      <field name="TABLE">balances</field>
    </block>
    <block type="db_column">
      <field name="NAME">user_id</field>
      <field name="TYPE">TEXT</field>
    </block>
    <block type="db_run">
      <value name="SQL">
        <block type="text">
          <field name="TEXT">INSERT INTO balances (user_id, balance) VALUES ({{uid}}, {{bal}})</field>
        </block>
      </value>
    </block>
    <block type="db_select_all">
      <value name="SQL">
        <block type="text">
          <field name="TEXT">SELECT * FROM balances</field>
        </block>
      </value>
    </block>
    <block type="db_select_one">
      <value name="SQL">
        <block type="text">
          <field name="TEXT">SELECT * FROM balances WHERE user_id = {{uid}}</field>
        </block>
      </value>
    </block>
    <block type="db_get">
      <value name="SQL">
        <block type="text">
          <field name="TEXT">SELECT balance FROM balances WHERE user_id = {{uid}}</field>
        </block>
      </value>
    </block>
    <block type="db_count">
      <value name="SQL">
        <block type="text">
          <field name="TEXT">SELECT COUNT(*) FROM balances</field>
        </block>
      </value>
    </block>
    <block type="db_param">
      <field name="NAME">uid</field>
    </block>
    <block type="db_result">
      <field name="FIELD">balance</field>
    </block>
    <block type="db_result_array">
      <field name="FIELD">balance</field>
    </block>
    <block type="db_last_id"></block>
    <block type="db_transaction">
      <field name="NAME">transferencia</field>
    </block>
  </category>
  <category name="Menús Select" colour="290">
    <block type="send_select_menu">
      <value name="TEXT">
        <block type="text">
          <field name="TEXT">Selecciona una opción:</field>
        </block>
      </value>
    </block>
    <block type="select_option">
      <field name="VALUE">opcion_1</field>
    </block>
    <block type="on_select_menu">
      <field name="CUSTOM_ID">menu_1</field>
    </block>
    <block type="select_get_value"></block>
    <block type="select_get_label"></block>
    <block type="send_select_menu_dynamic">
      <value name="TEXT">
        <block type="text">
          <field name="TEXT">Elige una opción:</field>
        </block>
      </value>
    </block>
    <block type="build_option">
      <value name="LABEL">
        <block type="text">
          <field name="TEXT">Opción 1</field>
        </block>
      </value>
      <value name="VALUE">
        <block type="text">
          <field name="TEXT">opcion_1</field>
        </block>
      </value>
    </block>
  </category>
  <category name="Opciones de Comando" colour="120">
    <block type="event_command_with_options">
      <field name="COMMAND">addbal</field>
    </block>
    <block type="command_option">
      <field name="NAME">usuario</field>
      <field name="TYPE">User</field>
    </block>
    <block type="get_option">
      <field name="NAME">usuario</field>
    </block>
  </category>
  <category name="Subcomandos" colour="195">
    <block type="event_command_with_subcommands">
      <field name="COMMAND">plantilla</field>
    </block>
    <block type="subcommand">
      <field name="NAME">crear</field>
    </block>
  </category>
  <category name="Avanzado" colour="0">
    <block type="for_i">
      <field name="VAR">i</field>
    </block>
    <block type="schedule_after"></block>
    <block type="raw_javascript"></block>
    <block type="raw_javascript_expr">
      <field name="CODE">variable.toString()</field>
    </block>
  </category>
  <category name="Objetos y Arrays" colour="60">
    <block type="create_object"></block>
    <block type="object_pair">
      <field name="KEY">clave</field>
    </block>
    <block type="object_get">
      <field name="KEY">clave</field>
    </block>
    <block type="object_set">
      <field name="KEY">clave</field>
    </block>
    <block type="array_create"></block>
    <block type="array_item"></block>
    <block type="array_push"></block>
    <block type="number_format"></block>
  </category>
  <category name="Paginación" colour="290">
    <block type="send_paginated_embeds">
      <value name="CONTENT">
        <block type="text">
          <field name="TEXT">Páginas:</field>
        </block>
      </value>
    </block>
  </category>
`;

const DISCORD_TOOLBOX_ULTIMATE = (typeof DISCORD_TOOLBOX_COMPLETE !== 'undefined' ? DISCORD_TOOLBOX_COMPLETE : 
  (typeof DISCORD_TOOLBOX_WITH_IMAGES !== 'undefined' ? DISCORD_TOOLBOX_WITH_IMAGES : 
  (typeof DISCORD_TOOLBOX_MODIFIED !== 'undefined' ? DISCORD_TOOLBOX_MODIFIED : DISCORD_TOOLBOX)))
  .replace('</xml>', COMPLEX_TOOLBOX_XML + '\n</xml>');
