// ─── Categorías de Bloques para Discord ───

Blockly.defineBlocksWithJsonArray([
  // ─── Eventos ───
  {
    "type": "event_ready",
    "message0": "Cuando el bot esté listo %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Este bloque se ejecuta cuando el bot inicia sesión correctamente en Discord",
    "helpUrl": "",
    "extensions": ["discord_event_extension"]
  },
  {
    "type": "event_message",
    "message0": "Cuando alguien envía un mensaje %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Se ejecuta cada vez que alguien escribe un mensaje en un canal que el bot puede ver",
    "helpUrl": ""
  },
  {
    "type": "event_command",
    "message0": "Cuando usen el comando %1 %2",
    "args0": [
      {"type": "field_input", "name": "COMMAND", "text": "hola"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Responde cuando alguien escribe /comando en Discord. Ejemplo: /hola",
    "helpUrl": ""
  },

  // ─── Enviar Mensajes ───
  {
    "type": "send_message",
    "message0": "Enviar mensaje %1 al canal %2",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["actual", "current"], ["general", "general"]]}
    ],
    "colour": 230,
    "tooltip": "Envía un mensaje de texto al canal. Escribe lo que quieras que diga el bot",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "send_embed",
    "message0": "Enviar embed %1 al canal %2",
    "args0": [
      {"type": "input_value", "name": "EMBED", "check": "Embed"},
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["actual", "current"], ["general", "general"]]}
    ],
    "colour": 230,
    "tooltip": "Envía un mensaje con formato embed (tarjeta visual con color, título, descripción)",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "reply_message",
    "message0": "Responder al mensaje con %1",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"}
    ],
    "colour": 230,
    "tooltip": "Responde directamente al mensaje que activó el evento. El usuario recibirá una notificación",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },

  // ─── Texto ───
  {
    "type": "text_concat",
    "message0": "Unir textos %1 %2",
    "args0": [
      {"type": "input_value", "name": "A", "check": "String"},
      {"type": "input_value", "name": "B", "check": "String"}
    ],
    "output": "String",
    "colour": 160,
    "tooltip": "Junta dos textos en uno. Ejemplo: 'Hola' + ' mundo' = 'Hola mundo'",
    "helpUrl": ""
  },
  {
    "type": "text_contains",
    "message0": "El texto %1 contiene %2",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "input_value", "name": "SUB", "check": "String"}
    ],
    "output": "Boolean",
    "colour": 160,
    "tooltip": "Revisa si un texto contiene otro. Ejemplo: 'Hola mundo' contiene 'mundo' → Verdadero",
    "helpUrl": ""
  },

  // ─── Embed ───
  {
    "type": "create_embed",
    "message0": "Crear embed %1 título: %2 %3 descripción: %4 %5 color: %6 %7 añadir campo nombre: %8 valor: %9 inline: %10",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_value", "name": "TITLE", "check": "String"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "DESC", "check": "String"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "COLOR", "check": "Colour"},
      {"type": "input_dummy"},
      {"type": "input_value", "name": "FIELD_NAME", "check": "String"},
      {"type": "input_value", "name": "FIELD_VAL", "check": "String"},
      {"type": "field_checkbox", "name": "FIELD_INLINE", "checked": false}
    ],
    "output": "Embed",
    "colour": 290,
    "tooltip": "Crea un embed con título, descripción, color y un campo. Los embeds son mensajes con formato visual en Discord",
    "helpUrl": ""
  },
  {
    "type": "embed_set_author",
    "message0": "Embed poner autor: %1 icono: %2 url: %3",
    "args0": [
      {"type": "input_value", "name": "NAME", "check": "String"},
      {"type": "input_value", "name": "ICON", "check": "String"},
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade un autor al embed con nombre, foto y enlace. Ej: nombre='Bot Oficial'",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "embed_set_footer",
    "message0": "Embed poner footer: %1 icono: %2",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "input_value", "name": "ICON", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade un pie de página al embed con texto y opcionalmente un icono pequeño",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "embed_add_field",
    "message0": "Embed añadir campo nombre: %1 valor: %2 inline: %3",
    "args0": [
      {"type": "input_value", "name": "NAME", "check": "String"},
      {"type": "input_value", "name": "VALUE", "check": "String"},
      {"type": "field_checkbox", "name": "INLINE", "checked": false}
    ],
    "colour": 290,
    "tooltip": "Añade un campo adicional al embed. 'Inline' hace que los campos se muestren lado a lado",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "embed_set_image",
    "message0": "Embed poner imagen: %1",
    "args0": [
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade una imagen grande al embed. Pega la URL directa de la imagen (debe terminar en .png/.jpg/.gif)",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "embed_set_thumbnail",
    "message0": "Embed poner thumbnail: %1",
    "args0": [
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade una miniatura (imagen pequeña) en la esquina superior derecha del embed",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },

  // ─── Botones ───
  {
    "type": "add_button",
    "message0": "Añadir botón texto: %1 estilo: %2 url: %3 id: %4",
    "args0": [
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "field_dropdown", "name": "STYLE", "options": [
        ["Primario (azul)", "Primary"],
        ["Secundario (gris)", "Secondary"],
        ["Éxito (verde)", "Success"],
        ["Peligro (rojo)", "Danger"],
        ["Enlace (abre URL)", "Link"]
      ]},
      {"type": "input_value", "name": "URL", "check": "String"},
      {"type": "field_input", "name": "CUSTOM_ID", "text": "btn_click"}
    ],
    "colour": 330,
    "tooltip": "Añade un botón al mensaje. Los estilos cambian el color: Primario=azul, Éxito=verde, Peligro=rojo, Enlace=abre URL",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "on_button_click",
    "message0": "Cuando hagan clic en botón id: %1 %2",
    "args0": [
      {"type": "field_input", "name": "CUSTOM_ID", "text": "btn_click"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 330,
    "tooltip": "Ejecuta acciones cuando alguien hace clic en un botón específico. El ID debe coincidir con el del botón",
    "helpUrl": ""
  },
  {
    "type": "send_message_with_buttons",
    "message0": "Enviar mensaje %1 al canal %2 %3 botones: %4",
    "args0": [
      {"type": "input_value", "name": "TEXT", "check": "String"},
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["actual", "current"], ["general", "general"]]},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "BUTTONS"}
    ],
    "colour": 330,
    "tooltip": "Envía un mensaje con botones. Apila los botones que quieras dentro de esta sección",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "single_button",
    "message0": "Botón %1 texto: %2 id: %3 url: %4",
    "args0": [
      {"type": "field_dropdown", "name": "STYLE", "options": [
        ["Primario", "Primary"],
        ["Secundario", "Secondary"],
        ["Éxito", "Success"],
        ["Peligro", "Danger"],
        ["Enlace", "Link"]
      ]},
      {"type": "input_value", "name": "LABEL", "check": "String"},
      {"type": "input_value", "name": "CUSTOM_ID", "check": "String"},
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 330,
    "tooltip": "Un botón para poner dentro de 'Enviar mensaje con botones'. Conecta bloques de texto a 'id' y 'url' para valores dinámicos. 'url' solo para estilo Enlace",
    "helpUrl": ""
  },

  // ─── Lógica ───
  {
    "type": "user_mention",
    "message0": "Mencionar al usuario que envió el mensaje",
    "output": "String",
    "colour": 60,
    "tooltip": "Esto se convierte en una mención al usuario que activó el comando. Ej: @usuario",
    "helpUrl": ""
  },
  {
    "type": "channel_mention",
    "message0": "Mencionar al canal actual",
    "output": "String",
    "colour": 60,
    "tooltip": "Esto se convierte en una mención al canal donde se ejecutó el comando. Ej: #general",
    "helpUrl": ""
  },
  {
    "type": "get_username",
    "message0": "Nombre del usuario que envió el mensaje",
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene el nombre de usuario de quien escribió el mensaje. Ej: Juan123",
    "helpUrl": ""
  },
  {
    "type": "get_user_id",
    "message0": "ID del usuario que envió el mensaje",
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene el ID único del usuario en Discord. Ej: 123456789012345678",
    "helpUrl": ""
  },
  {
    "type": "random_number",
    "message0": "Número aleatorio entre %1 y %2",
    "args0": [
      {"type": "input_value", "name": "MIN", "check": "Number"},
      {"type": "input_value", "name": "MAX", "check": "Number"}
    ],
    "output": "Number",
    "colour": 60,
    "tooltip": "Genera un número al azar entre dos valores. Ej: entre 1 y 10 → 7",
    "helpUrl": ""
  },
  {
    "type": "if_condition",
    "message0": "Si %1 entonces %2 %3 sino %4",
    "args0": [
      {"type": "input_value", "name": "COND", "check": "Boolean"},
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"},
      {"type": "input_statement", "name": "ELSE"}
    ],
    "colour": 210,
    "tooltip": "Ejecuta diferentes acciones según una condición. Si es verdadero hace una cosa, si no, hace otra",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },

  // ─── Eventos de servidor ───
  {
    "type": "event_member_join",
    "message0": "Cuando un miembro se une %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Se ejecuta cuando un nuevo miembro se une al servidor. Úsalo para mensajes de bienvenida o asignar roles automáticos"
  },
  {
    "type": "event_member_leave",
    "message0": "Cuando un miembro se va %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Se ejecuta cuando un miembro abandona el servidor"
  },
  {
    "type": "event_reaction_add",
    "message0": "Cuando añadan reacción %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Se ejecuta cuando alguien añade una reacción a un mensaje. Úsalo para roles por reacción"
  },
  {
    "type": "event_reaction_remove",
    "message0": "Cuando quiten reacción %1 %2",
    "args0": [
      {"type": "input_dummy"},
      {"type": "input_statement", "name": "DO"}
    ],
    "colour": 120,
    "tooltip": "Se ejecuta cuando alguien quita una reacción de un mensaje"
  },

  // ─── Roles ───
  {
    "type": "add_role",
    "message0": "Añadir rol %1 al usuario %2",
    "args0": [
      {"type": "input_value", "name": "ROLE", "check": "String"},
      {"type": "input_value", "name": "USER", "check": "String"}
    ],
    "colour": 60,
    "tooltip": "Añade un rol a un usuario. Ej: rol='Mago', usuario='@Juan'. El rol debe existir en el servidor",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "remove_role",
    "message0": "Quitar rol %1 al usuario %2",
    "args0": [
      {"type": "input_value", "name": "ROLE", "check": "String"},
      {"type": "input_value", "name": "USER", "check": "String"}
    ],
    "colour": 60,
    "tooltip": "Quita un rol a un usuario. Ej: rol='Mago', usuario='@Juan'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "has_role",
    "message0": "El usuario %1 tiene el rol %2",
    "args0": [
      {"type": "input_value", "name": "USER", "check": "String"},
      {"type": "input_value", "name": "ROLE", "check": "String"}
    ],
    "output": "Boolean",
    "colour": 60,
    "tooltip": "Revisa si un usuario tiene un rol específico. Devuelve Verdadero o Falso"
  },
  {
    "type": "get_role_by_name",
    "message0": "Rol por nombre %1",
    "args0": [
      {"type": "input_value", "name": "NAME", "check": "String"}
    ],
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene un rol del servidor por su nombre. Devuelve el ID del rol o vacío si no existe"
  },

  // ─── Mensajes avanzados ───
  {
    "type": "send_dm",
    "message0": "Enviar DM a %1 mensaje: %2",
    "args0": [
      {"type": "input_value", "name": "USER", "check": "String"},
      {"type": "input_value", "name": "TEXT", "check": "String"}
    ],
    "colour": 230,
    "tooltip": "Envía un mensaje directo a un usuario. Ej: a='@Juan', mensaje='Hola!'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "add_reaction",
    "message0": "Añadir reacción %1 al mensaje",
    "args0": [
      {"type": "input_value", "name": "EMOJI", "check": "String"}
    ],
    "colour": 230,
    "tooltip": "Añade una reacción al mensaje que activó el comando. Ej: '👍', '🎉', '✅'",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "delete_message",
    "message0": "Eliminar este mensaje",
    "args0": [],
    "colour": 230,
    "tooltip": "Elimina el mensaje que activó el comando (solo el mensaje del usuario)",
    "previousStatement": null,
    "nextStatement": null
  },

  // ─── Moderación ───
  {
    "type": "kick_user",
    "message0": "Expulsar usuario %1 razón: %2",
    "args0": [
      {"type": "input_value", "name": "USER", "check": "String"},
      {"type": "input_value", "name": "REASON", "check": "String"}
    ],
    "colour": 0,
    "tooltip": "Expulsa a un usuario del servidor. Requiere permisos de administrador",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "ban_user",
    "message0": "Banear usuario %1 razón: %2",
    "args0": [
      {"type": "input_value", "name": "USER", "check": "String"},
      {"type": "input_value", "name": "REASON", "check": "String"}
    ],
    "colour": 0,
    "tooltip": "Banea a un usuario del servidor permanentemente. Requiere permisos de administrador",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "timeout_user",
    "message0": "Silenciar usuario %1 minutos: %2 razón: %3",
    "args0": [
      {"type": "input_value", "name": "USER", "check": "String"},
      {"type": "input_value", "name": "MINUTES", "check": "Number"},
      {"type": "input_value", "name": "REASON", "check": "String"}
    ],
    "colour": 0,
    "tooltip": "Silencia temporalmente a un usuario por X minutos. Ej: 10 minutos",
    "previousStatement": null,
    "nextStatement": null
  },

  // ─── Canales ───
  {
    "type": "get_channel_by_name",
    "message0": "Canal por nombre %1",
    "args0": [
      {"type": "input_value", "name": "NAME", "check": "String"}
    ],
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene un canal del servidor por su nombre. Devuelve la mención del canal o vacío si no existe"
  },
  {
    "type": "create_channel",
    "message0": "Crear canal de texto %1",
    "args0": [
      {"type": "input_value", "name": "NAME", "check": "String"}
    ],
    "colour": 60,
    "tooltip": "Crea un nuevo canal de texto en el servidor. Ej: nombre='nuevo-canal'",
    "previousStatement": null,
    "nextStatement": null
  }
]);

// ─── Extensión para evento ready (tooltip más detallado) ───
Blockly.Extensions.register('discord_event_extension',
  function() {
    this.setTooltip(
      'Este bloque se ejecuta cuando el bot inicia sesión correctamente en Discord. ' +
      'Úsalo para mostrar un mensaje de "Bot online!" o para cargar datos al iniciar.'
    );
  }
);

// ─── Toolbox XML ───
const DISCORD_TOOLBOX = `
<xml xmlns="http://www.w3.org/1999/xhtml" id="toolbox" style="display: none;">
  <category name="Eventos" colour="120">
    <block type="event_ready"></block>
    <block type="event_message"></block>
    <block type="event_command">
      <field name="COMMAND">hola</field>
    </block>
    <block type="on_button_click">
      <field name="CUSTOM_ID">btn_click</field>
    </block>
    <block type="event_member_join"></block>
    <block type="event_member_leave"></block>
    <block type="event_reaction_add"></block>
    <block type="event_reaction_remove"></block>
  </category>
  <category name="Enviar" colour="230">
    <block type="send_message"></block>
    <block type="send_embed"></block>
    <block type="reply_message"></block>
    <block type="send_dm"></block>
    <block type="add_reaction"></block>
    <block type="delete_message"></block>
  </category>
  <category name="Embed" colour="290">
    <block type="create_embed"></block>
    <block type="embed_set_author"></block>
    <block type="embed_set_footer"></block>
    <block type="embed_add_field"></block>
    <block type="embed_set_image"></block>
    <block type="embed_set_thumbnail"></block>
  </category>
  <category name="Botones" colour="330">
    <block type="send_message_with_buttons"></block>
    <block type="single_button">
      <value name="LABEL">
        <block type="text">
          <field name="TEXT">Click</field>
        </block>
      </value>
      <value name="CUSTOM_ID">
        <block type="text">
          <field name="TEXT">btn_1</field>
        </block>
      </value>
    </block>
  </category>
  <category name="Texto" colour="160">
    <block type="text"></block>
    <block type="text_concat"></block>
    <block type="text_contains"></block>
  </category>
  <category name="Usuarios" colour="60">
    <block type="user_mention"></block>
    <block type="channel_mention"></block>
    <block type="get_username"></block>
    <block type="get_user_id"></block>
  </category>
  <category name="Matemáticas" colour="60">
    <block type="math_number"></block>
    <block type="random_number"></block>
    <block type="math_arithmetic"></block>
  </category>
  <category name="Lógica" colour="210">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_boolean"></block>
    <block type="logic_operation"></block>
    <block type="if_condition"></block>
  </category>
  <category name="Roles" colour="60">
    <block type="add_role"></block>
    <block type="remove_role"></block>
    <block type="has_role"></block>
    <block type="get_role_by_name"></block>
  </category>
  <category name="Moderación" colour="0">
    <block type="kick_user"></block>
    <block type="ban_user"></block>
    <block type="timeout_user"></block>
  </category>
  <category name="Canales" colour="60">
    <block type="get_channel_by_name"></block>
    <block type="create_channel"></block>
  </category>
  <category name="Colores" colour="200">
    <block type="colour_picker"></block>
  </category>
</xml>
`;