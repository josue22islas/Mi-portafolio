# Rendimiento general — 2026-09-05

## Hallazgos y alcance

Se comprobó la versión publicada en https://josue22islas.github.io/Mi-portafolio/ y se modificó únicamente la copia local. No se ha publicado ningún cambio en GitHub.

El GIF del encabezado era el recurso principal: 13.478.401 bytes, 1200 fotogramas de 1920 × 1080, mostrado a 285 × 70 en escritorio. Ambos videos originales sumaban 5,29 MB, tenían el bloque moov al final y continuaban reproduciéndose bajo el tema claro, aunque CSS los ocultaba.

## Cambios

- Logo animado WebP de 4.456.968 bytes y 864 × 212 por fotograma (más de 3x el tamaño visible). Conserva los 1200 cuadros, los tiempos de cada cuadro, el bucle y la transparencia. El encuadre reproduce object-fit:cover del encabezado. La reducción incluye remuestreo y cuantización; no es idéntica píxel por píxel al original. Se comparó también al tamaño real: `logo-tamano-real.png` (original arriba, optimizado abajo). El GIF original permanece intacto.
- Dos copias MP4 faststart, sin recomprimir ni reducir resolución, frecuencia de cuadros o calidad. Se adelantó moov y se ajustaron las tablas de offsets; el hash SHA-256 del contenido mdat es idéntico al de cada original. Se verificó reproducción en Chrome.
- `media-performance.js` pausa videos en tema claro, al ocultar la pestaña y fuera del área visible. Reanuda desde la posición actual, sin cambiar currentTime, y tolera rechazos de autoplay del dispositivo.
- No se modificaron la calidad/resolución del cursor 3D, sus tubos, el bloom, la órbita, los botones, idiomas, CV ni el cálculo de la transición circular.

## Medición comparativa

Chrome automatizado en el mismo equipo, servidor local con rangos HTTP, contextos nuevos de escritorio y móvil emulado. `control` sirve los recursos previos y omite el nuevo controlador sin restaurar archivos. Las conversiones no estaban ejecutándose durante estas dos mediciones.

| Medida | Control | Optimizado |
| --- | ---: | ---: |
| Recursos transferidos móvil | 19.258.090 bytes | 10.238.106 bytes |
| Recursos transferidos escritorio | 19.465.620 bytes | 10.445.636 bytes |
| Intervalo p95 entre cuadros móvil | 33,5 ms | 33,5 ms |
| Intervalo p95 entre cuadros escritorio | 33,5 ms | 33,5 ms |
| Videos pausados en claro | 0 de 2 | 2 de 2 |
| Videos con paused=false al volver a oscuro | 2 de 2 | 2 de 2 |
| Errores JavaScript observados | 0 | 0 |

Reducción de descarga en móvil: aproximadamente 47 %. No equivale a una mejora medida del 47 % en tiempo de carga ni FPS. No hubo mejora demostrada de p95 en estas muestras. Volver a paused=false tampoco garantiza que el decodificador entregue cuadros fluidamente: en escritorio se siguió observando falta de avance en algunas muestras.

La visita publicada previa descargó aproximadamente 19 MB. Los resultados de GitHub y los locales tienen distinta red y no deben compararse como un antes/después de velocidad. `general-antes.json` es exploratorio y coincidió con una conversión; usar `general-control.json` y `general-optimizado.json` para la comparación.

## Limitaciones y siguiente paso

El cursor 3D y la composición simultánea de videos siguen siendo una carga importante en GPU. Las pruebas anteriores (`RESULTADOS.md`) ya documentaban bloqueos del decodificador con el cursor. No se consideran resueltos por estos cambios. Un teléfono emulado no reproduce el rendimiento de un teléfono físico. Hace falta volver a probar la versión publicada en el dispositivo del usuario una vez subidos los cambios.

## Archivos para publicar

- `index.html`
- `assets/images/navbar-logo-optimized.webp`
- `assets/videos/portfolio-background-faststart.mp4`
- `assets/videos/hero-black-hole-overlay-faststart.mp4`
- `assets/js/media-performance.js`

Mantener el resto del sitio. No se requieren paquetes nuevos en GitHub Pages. Los recursos originales no se eliminaron y permiten revertir las referencias.

## Reproducir

- `node pruebas/optimizar-logo.cjs` regenera el logo con Sharp del entorno local.
- `node pruebas/preparar-videos.cjs` regenera las copias faststart y verifica los datos de medios.
- `node pruebas/rendimiento-general.cjs control` y luego `node pruebas/rendimiento-general.cjs optimizado` comparan ambos estados.
- `node pruebas/transicion-tema-visual.cjs` comprueba el círculo renderizado en tamaños de escritorio, tablet y móvil.

No ejecutar conversiones y mediciones de rendimiento simultáneamente. El GIF intermedio de pruebas se retiró; se puede regenerar mediante el script, sin perder el original.
