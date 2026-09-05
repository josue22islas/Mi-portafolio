# TechNova — Horizonte

Demo independiente de una intro de 9.8 segundos inspirada en la imagen del horizonte azul/violeta. Recrea la escena mediante SVG, CSS y animaciones del navegador. No es un MP4 ni una edición fotograma a fotograma de la imagen.

## Abrir

Abre `index.html` con doble clic o con Live Server en VS Code. Todos los recursos están dentro de esta carpeta; no requiere dependencias externas, instalación ni conexión a internet.

El logo SVG está integrado directamente en `index.html`: sus letras y puntos pueden animarse tanto con `file://` como con un servidor local, sin depender de la carga de un documento externo.

## Secuencia

- 0–3 s: ascenso lento del horizonte y encendido de la atmósfera.
- 2–5 s: formación progresiva del emblema dorado.
- 3–6 s: aparición de las letras originales de TechNova Solutions.
- 4–7 s: trazado de la línea dorada y halo tenue.
- 1.35–4 s: una luz recorre la curva del planeta hasta el centro.
- 6.2–7.4 s: un reflejo tenue cruza la silueta del logo una sola vez.
- 7.4–9.8 s: pausa visual con la marca completa; no redirige ni abre el portafolio.

Los puntos del emblema entran con desfase entre anillos. SOLUTIONS aclara temporalmente su azul y vuelve al color original. Los controles inferiores se ocultan durante la secuencia y reaparecen con ratón, toque o foco de teclado; Saltar intro permanece accesible. Al terminar o pausar, los controles quedan visibles. La limitación a una reproducción por sesión se reserva para una futura integración; esta demo siempre se puede repetir.

Controles: pausar/reanudar, saltar, repetir y pantalla completa. Respeta movimiento reducido y pausa las animaciones al ocultar la pestaña.

## Recursos

- `index.html`: contiene el SVG que se anima. Si editas el archivo SVG de referencia, sincroniza también esta copia integrada.
- `assets/technova-logo.svg`: copia del logo vectorial existente, sin rectángulo de fondo y con viewBox ajustado. Los trazados, puntos y colores originales se conservan.
- `assets/horizon.svg`: escena vectorial propia basada en la referencia visual suministrada; el texto EDGE no forma parte de ella.
- `styles.css`: composición responsive y controles.
- `intro.js`: secuencia temporal y controles, sin librería 3D ni video.

Los filtros del horizonte son estáticos. El movimiento se concentra en opacidad y transformaciones, con un solo trazo animado para la línea del logo. No se ha integrado en la página principal.
