// ─── Bloques para Imágenes en Discord ───

Blockly.defineBlocksWithJsonArray([
  {
    "type": "image_url",
    "message0": "Imagen desde URL: %1",
    "args0": [
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "output": "String",
    "colour": 200,
    "tooltip": "Usa una imagen desde una URL directa. La URL debe terminar en .png, .jpg, .gif o .webp. Ej: https://ejemplo.com/imagen.png",
    "helpUrl": ""
  },
  {
    "type": "send_image",
    "message0": "Enviar imagen %1 al canal %2",
    "args0": [
      {"type": "input_value", "name": "URL", "check": "String"},
      {"type": "field_dropdown", "name": "CHANNEL", "options": [["actual", "current"], ["general", "general"]]}
    ],
    "colour": 230,
    "tooltip": "Envía una imagen al canal. Pega la URL directa de una imagen. Ej: https://ejemplo.com/foto.png",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "embed_set_image_url",
    "message0": "Embed poner imagen URL: %1",
    "args0": [
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade una imagen grande al embed usando una URL. La URL debe ser directa a la imagen",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "embed_set_thumbnail_url",
    "message0": "Embed poner thumbnail URL: %1",
    "args0": [
      {"type": "input_value", "name": "URL", "check": "String"}
    ],
    "colour": 290,
    "tooltip": "Añade una miniatura al embed usando una URL directa. Se muestra en la esquina superior derecha",
    "helpUrl": "",
    "previousStatement": null,
    "nextStatement": null
  },
  {
    "type": "get_avatar",
    "message0": "Avatar del usuario que envió el mensaje",
    "output": "String",
    "colour": 60,
    "tooltip": "Obtiene la URL del avatar del usuario que activó el comando. Útil para poner la foto de perfil en un embed",
    "helpUrl": ""
  }
]);

const IMAGE_TOOLBOX_XML = `
  <category name="Imágenes" colour="200">
    <block type="image_url"></block>
    <block type="send_image"></block>
    <block type="embed_set_image_url"></block>
    <block type="embed_set_thumbnail_url"></block>
    <block type="get_avatar"></block>
  </category>
`;

const DISCORD_TOOLBOX_WITH_IMAGES = (typeof DISCORD_TOOLBOX_MODIFIED !== 'undefined' ? DISCORD_TOOLBOX_MODIFIED : DISCORD_TOOLBOX).replace(
  '</xml>',
  IMAGE_TOOLBOX_XML + '\n</xml>'
);