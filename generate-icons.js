/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Usar canvas si está disponible, si no usar un SVG simple
const { createCanvas } = require('canvas');

const sizes = [192, 512];
const backgroundColor = '#1e40af';
const textColor = '#ffffff';

sizes.forEach((size) => {
  try {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fondo
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Dibujar un carrito de compras simple
    const lineWidth = size / 32;
    ctx.strokeStyle = textColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Carrito (rectángulo)
    const cartX = size * 0.25;
    const cartY = size * 0.35;
    const cartWidth = size * 0.5;
    const cartHeight = size * 0.3;

    ctx.strokeRect(cartX, cartY, cartWidth, cartHeight);

    // Ruedas
    const wheelRadius = size * 0.05;
    ctx.beginPath();
    ctx.arc(size * 0.35, size * 0.68, wheelRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(size * 0.65, size * 0.68, wheelRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Mango del carrito
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.35);
    ctx.lineTo(size * 0.5, size * 0.15);
    ctx.stroke();

    // Guardar imagen
    const buffer = canvas.toBuffer('image/png');
    const filePath = path.join(__dirname, 'public', `icon-${size}.png`);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ icon-${size}.png creado`);
  } catch (error) {
    console.error(`Error generando icon-${size}.png:`, error.message);
  }
});
