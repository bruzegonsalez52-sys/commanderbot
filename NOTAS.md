# Notas del Proyecto — Bot Builder con Blockly

## Meta Principal
Crear un configurador visual de bots de Discord usando Blockly (programación por bloques). El usuario arrastra bloques, ve el código generado en tiempo real, y puede probar su bot en un simulador integrado. Compatible con discord.js v14.

---

## Progreso General

### ✅ Completado
- [x] Estructura base del proyecto: `index.html`, `css/style.css`, `js/app.js`
- [x] Landing page (home) con estadísticas, configuración rápida (nombre, prefijo, idioma, token), tips
- [x] Sidebar de navegación tipo acordeón con secciones e iconos
- [x] Workspace de Blockly con inicialización lazy (solo cuando se hace clic en "Bloques")
- [x] Categorías de bloques personalizados: Eventos, Mensajes, Embed, Texto, Usuarios, Control, Imágenes, Botones, Formularios
- [x] Bloques: ready, message, command, modal submit, button click — send message, send embed, reply — embed author, footer, fields, image, thumbnail
- [x] Bloques de botones: single_button (statement), send_message_with_buttons (con botones apilables dentro), on_button_click
- [x] Bloques de imágenes: load image, resize image, image overlay, image to embed, image effects (blur, grayscale, brightness, contrast)
- [x] Bloques de formularios (modales): create modal, show modal, field types (short, paragraph, dropdown), on modal submit
- [x] Generadores JavaScript (Blockly v10 API) para TODOS los bloques personalizados
- [x] Toolbox XML ensamblado desde 3 archivos (discord_blocks → modal_blocks → image_blocks)
- [x] Exportación de código en tiempo real (se actualiza en cada cambio del workspace)
- [x] Embed builder visual (formulario + previsualización estilo Discord)
- [x] Form/modal builder visual (campos arrastrables + previsualización)
- [x] Sidebar acordeón con descripciones y ejemplos rápidos
- [x] Simulador de Discord conectado al workspace (prueba comandos reales de los bloques)
- [x] Estilos oscuros para Blockly (toolbox, flyout, texto, selección)
- [x] Mejoras estéticas generales (transiciones, gradientes, sombras)
- [x] Botón de ejemplo en el workspace inicial (/boton con botones Aceptar/Cancelar)

### 🔄 En Progreso
- (nada ahora)

- [x] Botones clickeables en simulador (ejecutan on_button_click)
- [x] Generación de código para botones (interactionCreate + isButton)
- [x] Plantillas de formularios: guardar/recargar/eliminar desde el form builder
- [x] Bloque "Usar formulario guardado" con dropdown dinámico de plantillas
- [x] Formularios modales interactivos en simulador (overlay con inputs reales, submit/cancel)
- [x] Envío de modal en simulador dispara event_modal_submit (si existe)
- [x] Parseo completo de campos de formulario (text, paragraph, dropdown) para simulación
- [x] Bloques: variables (set/get), arrays (split/get/length/join), bucle for_each
- [x] Bloques: save_data_template, get_data_template (guardar/leer datos en localStorage)
- [x] single_button con CUSTOM_ID y URL dinámicos (input_value)
- [x] Simulador con contexto de variables, expansión de for_each, y plantillas
- [x] list_data_templates: lista nombres de plantillas guardadas
- [x] template_add_value: añade valor a una lista en plantilla (para inscripciones)
- [x] Bot builder completo para hacer CUALQUIER bot de Discord:
  - [x] Eventos: member_join, member_leave, reaction_add, reaction_remove
  - [x] Mensajes avanzados: send_dm, add_reaction, delete_message
  - [x] Roles: add_role, remove_role, has_role, get_role_by_name
  - [x] Moderación: kick_user, ban_user, timeout_user
  - [x] Canales: get_channel_by_name, create_channel
- [x] Simulador con botones de disparo de eventos (miembro entra/sale, reacción +/-)
- [x] Toolbox con 4 nuevas categorías: Roles, Moderación, Canales (en discord_blocks.js)
- [x] **Nivel Albion Bot alcanzable**: Base de Datos SQL, Select Menus, Opciones de comando, JS Raw, Scheduling y más
  - [x] Base de Datos simulada en navegador (SimDatabase): CREATE TABLE, INSERT, SELECT, UPDATE, DELETE con WHERE
  - [x] Bloques DB: db_create_table, db_column, db_run, db_select_all, db_select_one, db_get, db_count, db_param, db_result, db_result_array, db_last_id
  - [x] Menús Select: send_select_menu, select_option (stackable), on_select_menu, select_get_value, select_get_label
  - [x] Opciones de Comando Slash: event_command_with_options, command_option (String/User/Integer/Boolean), get_option
  - [x] Bucles for_i (con contador, para paginación)
  - [x] Objetos y Arrays: create_object, object_pair, object_get, object_set, array_create, array_item, array_push
  - [x] JS Raw: raw_javascript (multilínea), raw_javascript_expr (expresión)
  - [x] Temporizadores: schedule_after (setTimeout)
  - [x] Utilidades: number_format (con separador de miles)
  - [x] Simulador: SimDatabase en memoria, selects desplegables clickeables, scheduling con setTimeout real
  - [x] Generadores para todos los nuevos bloques (better-sqlite3, discord.js v14)
  - [x] Toolbox categorías: Base de Datos, Menús Select, Opciones de Comando, Avanzado, Objetos y Arrays

### ⏳ Pendiente / Ideas
- [ ] Integrar editor de código real (Monaco/CodeMirror) para la vista de exportación
- [ ] Sistema de proyectos guardados (localStorage) — mejorar UI de gestión
- [ ] Drag & drop para reordenar campos en el form builder
- [ ] Temas de color adicionales
- [ ] Subida de imágenes (en lugar de solo URLs)
- [ ] Vista móvil responsiva pulida

---

## Decisiones Técnicas Clave

### Blockly v10.4.3 (NO v11)
- **Problema:** v11 cambió el API de generadores, causaba error _"JavaScript generator does not know how to generate code"_
- **Solución:** Usar Blockly v10.4.3 desde CDN `unpkg.com/blockly@10.4.3`
- **Archivos afectados:** `js/blocks/generators.js`, `js/app.js`

### Inicialización Lazy de Blockly
- **Problema:** Blockly se renderizaba con tamaño 0 si el contenedor estaba oculto (display:none)
- **Solución:** Crear el workspace solo cuando el usuario hace clic en "Bloques" por primera vez
- **Implementación:** `blocklyInitialized = false`, `ensureBlocklyReady()` en `js/app.js`

### Toolbox XML Ensamblado
- discord_blocks.js define `DISCORD_TOOLBOX` (eventos, mensajes, embed, texto, usuarios, control, botones)
- modal_blocks.js lo modifica -> `DISCORD_TOOLBOX_MODIFIED` (agrega categoría Formularios)
- image_blocks.js lo modifica -> `DISCORD_TOOLBOX_WITH_IMAGES` (agrega categoría Imágenes)
- util_blocks.js lo modifica -> `DISCORD_TOOLBOX_COMPLETE` (agrega Variables, Texto Avanzado, Bucles, Plantillas)
- complex_blocks.js lo modifica -> `DISCORD_TOOLBOX_ULTIMATE` (agrega Base de Datos, Menús Select, Opciones, Avanzado, Objetos)
- app.js usa `DISCORD_TOOLBOX_ULTIMATE` con fallback a COMPLETE/WITH_IMAGES/TOOLBOX
- Cada archivo reemplaza `</xml>` con el nuevo contenido + `</xml>` para insertar dentro del root

### Generadores (archivo único)
- Todos los generadores están en `generators.js` usando `Blockly.JavaScript['tipo'] = function(block) {...}`
- Los bloques con salida (output) retornan `[código, orden]`
- Los bloques con conexión (previous/next statement) retornan solo el string

### Simulador conectado al workspace
- `app.js` expone `getSimulatorCommands()` que recorre el workspace y extrae comandos + acciones
- Soporta: send_message, reply_message, send_embed, send_message_with_buttons, show_modal, send_image
- `simulator.js` llama a este método cada vez que se envía un mensaje y al cargar
- Los chips de comandos se generan dinámicamente desde el workspace
- `onWorkspaceChange()` llama a `window.reloadSimulator()` para mantener sincronizado

### Plantillas de formularios
- Form builder tiene sección "Plantillas guardadas" con nombre, guardar, cargar y eliminar
- Se guardan en localStorage bajo `discord_form_templates`
- Bloque `use_form_template` en categoría Formularios — dropdown con plantillas guardadas
- Dropdown se actualiza al guardar/eliminar plantillas (vía `window.rebuildFormBlocks()`)
- Generador busca la plantilla en localStorage y genera el código `ModalBuilder` completo
- Simulador también lee plantillas guardadas para probar comandos

### Formularios modales interactivos en el simulador
- Cuando un comando ejecuta `show_modal` o `use_form_template`, el simulador muestra un overlay modal con campos reales
- Soporta: inputs de texto corto, textareas (párrafo), selects desplegables
- Botones Enviar/Cancelar + clic fuera + tecla Escape para cerrar
- Al enviar, recoge los valores de los campos y los muestra en el chat
- Si existe un bloque `event_modal_submit` con el mismo `customId`, ejecuta sus acciones
- `getSimulatorCommands()` extrae también `event_modal_submit` como `__modal_<id>`
- `parseModalBlock()` y `parseTemplateModal()` devuelven `fields[]` con type, label, customId, required, value/options
- Nuevos métodos: `parseFieldArray()`, `parseFieldBlock()` en app.js

### Simulador con canales
- El simulador ahora tiene un panel lateral izquierdo con lista de canales (como Discord)
- Canales por defecto: #general, #random
- Botón "+" para crear canales nuevos (solo minúsculas, números, guiones)
- Los mensajes se almacenan por canal; al cambiar de canal se muestran solo los de ese canal
- Al ejecutar un comando, el mensaje del usuario va al canal actual
- Los bloques `send_message`, `send_embed`, `send_message_with_buttons` tienen campo CHANNEL:
  - "actual" → el mensaje va al canal donde se escribió el comando
  - "general" → el mensaje va al canal #general (u otro si se cambia)
- Si un bloque envía un mensaje a un canal que no existe, se crea automáticamente
- El indicador activo del canal muestra una barra azul a la izquierda (estilo Discord)

### Bloques de utilidad (nuevos)
- **Variables**: `set_variable` (statement) guarda un valor, `get_variable` (output/String) lo recupera
- **Arrays**: `text_split` (divide texto), `array_get` (elemento por índice), `array_length`, `array_join`
- **Bucles**: `for_each` — itera sobre un array, ejecuta el cuerpo con cada elemento como variable
- **Plantillas de datos**: `save_data_template` guarda clave→valor en localStorage (`discord_data_template_<nombre>`), `get_data_template` lo recupera
- `single_button` rediseñado: `CUSTOM_ID` y `URL` ahora son `input_value` (dinámicos), se les conecta un bloque `text` o `get_variable`
- Generadores para todos los nuevos bloques (código JavaScript real)
- Nuevo archivo `util_blocks.js` (debe cargarse antes de `app.js`)

### Simulador con variables y loops
- `traverseStatements()` ahora acepta y mantiene un `context` (mapa de variables)
- `set_variable` → almacena en context
- `for_each` → evalúa el array (puede ser `text_split` estático), expande el cuerpo una vez por elemento con la variable del loop en context
- `save_data_template` → escribe en localStorage durante la simulación
- `parseBlockAction()` y métodos relacionados ahora aceptan `context` y usan `evalInputValue()`/`evalBlock()` para resolver variables
- `evalBlock()` soporta: text, math_number, colour_picker, get_variable, text_concat, text_split, array_get, array_length, array_join, get_data_template
- `evalArrayBlock()` convierte el resultado de evalBlock a array (text → split por coma)

### Bloques completos para cualquier bot de Discord
- **Eventos de servidor**: `event_member_join` (guildMemberAdd), `event_member_leave` (guildMemberRemove), `event_reaction_add` (messageReactionAdd), `event_reaction_remove` (messageReactionRemove)
- **Roles**: `add_role`, `remove_role` (statement, buscan miembro y rol por nombre), `has_role`, `get_role_by_name` (output)
- **Mensajes avanzados**: `send_dm` (busca usuario por ID/username), `add_reaction` (emoji como input_value), `delete_message` (elimina el mensaje del comando)
- **Moderación**: `kick_user`, `ban_user` (con razón), `timeout_user` (con minutos y razón)
- **Canales**: `get_channel_by_name` (output, devuelve mención del canal), `create_channel` (crea canal de texto)
- **Simulador**: botones naranjas de evento (👋 Miembro entra/sale, 😊 Reacción +/-) en la zona de chips, solo aparecen si hay bloques de evento configurados
- **Toolbox**: categorías Roles (colour 60 verde), Moderación (colour 0 rojo), Canales (colour 60 verde)
- **Generadores**: código discord.js v14 completo con `client.on()`, `member.roles.add/remove`, `message.react()`, `message.delete()`, `member.kick/ban/timeout`, `guild.channels.create`
- **Simulador `executeAction`**: casos para send_dm, add_reaction, delete_message, add_role, remove_role, kick_user, ban_user, timeout_user, create_channel — con emojis y mensajes de sistema
- **Mensajes de sistema**: nuevo tipo `system` en simulador (gris, itálico) para eventos, roles, moderación
- `getSimulatorCommands()` extrae también event_member_join/leave/reaction_add/reaction_remove como `__event_*`

### Bloques de botones (rediseñado)
- `send_message_with_buttons` tiene un espacio interno (`input_statement`) donde se apilan los botones
- `single_button` ahora es un bloque de declaración (statement) con previous/next — se apila dentro de send_message_with_buttons
- El usuario arrastra `single_button` dentro de la sección "botones:" de `send_message_with_buttons`
- No más problemas de tipos: todo son statements apilables
- `make_button_row` y `add_button` eliminados del toolbox (mantenidos por compatibilidad)
- Colores: 330 (rosa/magenta)

---

## Arquitectura de Archivos

```
Prueba pagina discord/
├── index.html              # Página principal + todas las vistas
├── css/
│   └── style.css           # Estilos completos (dark theme, layout, componentes)
├── js/
│   ├── app.js              # App principal: Blockly init, navegación, código, proyectos
│   ├── home.js             # Landing page: stats, config, tips
│   ├── embed-builder.js    # Editor visual de embeds
│   ├── form-builder.js     # Editor visual de formularios/modales
│   ├── simulator.js        # Simulador de Discord (chat, embeds, botones)
│   └── blocks/
│       ├── discord_blocks.js   # Bloques core + botones + toolbox base
│       ├── modal_blocks.js     # Bloques de formularios + toolbox modificado
│       ├── image_blocks.js     # Bloques de imágenes + toolbox final
│       ├── util_blocks.js      # Bloques de utilidad (variables, arrays, loops, plantillas)
│       ├── complex_blocks.js   # Bloques avanzados (BD, Select, Opciones, JS Raw, Objetos, Scheduling)
│       └── generators.js       # Generadores JS para todos los bloques
└── NOTAS.md                # Este archivo
```

---

### Base de Datos simulada (SimDatabase)
- `SimDatabase` es una clase ES6 dentro de `simulator.js` que emula SQLite en memoria
- Soporta: CREATE TABLE, INSERT, SELECT (con WHERE, ORDER BY, LIMIT, OFFSET), UPDATE, DELETE
- Las tablas se almacenan en `this.db.tables[name] = { columns, rows, pkFields }`
- Los parámetros usan sintaxis `{{nombre}}` que se reemplaza con valores escapados
- Bloque `db_create_table` con columnas apilables (nombre, tipo, PK, NOT NULL, default)
- Bloque `db_run` para INSERT/UPDATE/DELETE/CREATE — apila `db_param` blocks como `{{nombre}} = valor`
- Bloques `db_select_all` (output Array), `db_select_one` (output row), `db_get` (output primer campo), `db_count` (output número)
- `db_result` extrae campo de una fila (objeto), `db_result_array` extrae de array por índice
- `db_last_id` devuelve el último ID insertado
- Generadores producen código better-sqlite3: `db.prepare(sql).run/ all/ get(params)`

### Select Menus interactivos
- `send_select_menu` envía un mensaje con un `<select>` HTML en el simulador
- `select_option` se apila dentro (label, value, description)
- `on_select_menu` captura el `CustomID` y ejecuta acciones
- `select_get_value` / `select_get_label` obtienen lo seleccionado
- En el simulador: el evento `change` del `<select>` dispara `__select_{id}` con contexto `_selectedValue` y `_selectedLabel`
- Generadores producen `StringSelectMenuBuilder` con `ActionRowBuilder`

### Opciones de Comando Slash
- `event_command_with_options` reemplaza al `event_command` simple cuando necesitas parámetros
- `command_option` define nombre, tipo (String/User/Integer/Boolean), requerido, descripción
- `get_option` obtiene el valor del parámetro por nombre
- En el simulador: se extrae como comando normal (sin validación de opciones aún)
- Generadores permiten deploy de comandos slash con opciones tipadas

### JS Raw y Scheduling
- `raw_javascript` (statement): código JS multilínea arbitrario, se inyecta tal cual
- `raw_javascript_expr` (output): expresión JS que devuelve un valor, evaluada con `new Function()`
- `schedule_after`: programa acciones para ejecutarse después de N segundos (setTimeout real en simulador y código)
- Peligro: `raw_javascript_expr` usa `new Function()` en el simulador, no apto para código no confiable

### Arquitectura de Toolbox
- `DISCORD_TOOLBOX` → `DISCORD_TOOLBOX_MODIFIED` → `DISCORD_TOOLBOX_WITH_IMAGES` → `DISCORD_TOOLBOX_COMPLETE` → `DISCORD_TOOLBOX_ULTIMATE`
- Cada archivo de bloques agrega sus categorías reemplazando el `</xml>` final
- Orden de carga en index.html: discord → modal → image → util → complex → generators → app

## Convenciones de Código

- **Sin comentarios** en el código (salvo los separadores `// ───`)
- CSS: Clases semánticas con prefijo (`sim-`, `embed-`, `form-`, `nav-`, `blockly-`)
- JS: Clases ES6 sin transpilación. `DOMContentLoaded` para inicializar.
- Bloques Blockly: definidos con `Blockly.defineBlocksWithJsonArray`
- Toolbox: Constante global que se sobrescribe para agregar categorías (DISCORD_TOOLBOX → MODIFIED → WITH_IMAGES → COMPLETE)
- Simulador: usa `innerHTML` con `escapeHtml()` para sanitizar

---

## Cómo Probar

Abrir `index.html` en cualquier navegador moderno. No requiere servidor ni build step.

---

## Servicios Externos (CDN)

- Blockly: `https://unpkg.com/blockly@10.4.3/blockly.min.js`
- - `https://unpkg.com/blockly@10.4.3/blocks_compressed.js`
- - `https://unpkg.com/blockly@10.4.3/javascript_compressed.js`
- - `https://unpkg.com/blockly@10.4.3/msg/es.js`
