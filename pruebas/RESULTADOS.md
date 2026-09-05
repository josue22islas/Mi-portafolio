# Pruebas del cursor y los videos — 2026-09-04

## Resultado

Se corrigió el renderizado innecesario del cursor cuando está oculto y se agruparon las lecturas geométricas de la órbita antes de modificar clases. **El bloqueo de los videos con el cursor en movimiento sigue reproducible en este entorno; no está resuelto por completo.**

La configuración visual del cursor sigue siendo la original: 16 tubos, pixel ratio 2, canvas de 2880 × 1800 en una vista de 1440 × 900, bloom con threshold 0, strength 1.5 y radius 0.5. Los dos MP4 originales mantienen 1280 × 720 y no fueron modificados. Tampoco se modificó la transición circular del tema.

## Cambios incorporados

- `../assets/js/app.js`: la detección de contacto obtiene las posiciones de ambos aros y todos los iconos antes de cambiar clases; mantiene el intervalo de 30 ms y las reglas de iluminación.
- `../assets/js/tubes-cursor.js`: no inicializa el cursor mientras no deba verse. Oculta el canvas al entrar en tema claro, móvil o movimiento reducido, y al ocultarse la pestaña. Aprovecha el observador de intersección de la librería para detener su bucle, con protección inmediata de sus callbacks. Reanuda la misma instancia cuando vuelve a ser visible.
- `../index.html`: versiones de caché de los scripts actualizadas.

## Mediciones

Chrome automatizado sin ventana, GPU Intel Iris Xe, controlador 31.0.101.4502. Trayectoria de ratón reproducible, ventanas de 10 segundos. Se recopilaron contadores de video, callbacks de cuadros presentados, intervalos de requestAnimationFrame y métricas de diseño de Chromium. Los callbacks de video cuentan entregas observadas por JavaScript y no sustituyen una medición óptica de la pantalla. La carga del equipo y el modo sin ventana pueden influir en el resultado.

### Trabajo invisible

| Condición | Antes | Después |
| --- | ---: | ---: |
| Invocaciones de render en tema claro durante 2 segundos | 83 | 0 |
| Invocaciones de render en móvil durante 1 segundo | 61 | 0 |
| Canvas móvil | display:block | display:none |
| Reanudación al volver a escritorio oscuro | Sí | Sí |

Estas cifras de estado se pueden comprobar en `antes.json` y `despues-rangos.json`. No se atribuye una mejora porcentual de rendimiento activo al agrupamiento de lecturas: la variabilidad de las ejecuciones no permite demostrarla.

### Videos con la configuración final

Datos de `despues-rangos.json`, servidor con soporte de rangos HTTP:

| Ventana de 10 s | Fondo: cuadros presentados / descartados | Agujero negro: cuadros presentados / descartados |
| --- | ---: | ---: |
| Cursor quieto | 299 / 0 | 296 / 0 |
| Cursor en movimiento | 14 / 31 | 12 / 33 |

Con movimiento, ambos videos permanecieron con `paused:false`, pero bajaron a `readyState:2`. Esto distingue el bloqueo observado de una pausa explícita del código.

## Ensayos que no se incorporaron al sitio

- `ensayo-capas.json`: promover los videos mediante will-change no solucionó el bloqueo.
- `ensayo-webgl.json`: forzar WebGL no solucionó el bloqueo y rindió peor en esta ejecución. El sitio conserva WebGPU y el fallback original de la librería.
- `ensayo-mezcla.json`: quitar mix-blend-mode:screen no solucionó el problema. Se conserva screen.
- `control-sin-cursor.json`: detener las actualizaciones y el dibujo del cursor después de inicializarlo no recuperó los videos ya bloqueados. El contador de render de ese ensayo cuenta llamadas a una función vacía, no dibujos GPU. No demuestra cómo se comportaría una página que nunca inicializa el cursor.
- `control-decodificador.json`: un Chrome temporal con `--disable-accelerated-video-decode` presentó 128 cuadros por video durante el movimiento (aproximadamente 12.8 por segundo); los videos siguieron avanzando y mantuvieron readyState 4, pero continuaron descartando cuadros. La decodificación por software no se aplicó al navegador habitual ni al sitio.

La comparación apunta a la ruta de decodificación/composición gráfica bajo carga. No demuestra por sí sola un defecto del controlador ni justifica prometer reproducción fluida conservando todos los efectos en cualquier equipo.

## Reproducir

Desde la raíz del proyecto:

    node pruebas/rendimiento-cursor.cjs nueva-medicion

El script requiere el Playwright incluido en este entorno de Codex y Chrome instalado. Crea un servidor local temporal, ejecuta Chrome con perfil aislado y lo cierra al acabar. Genera JSON y captura de escritorio en esta carpeta. Los nombres de cada ejecución deben ser diferentes para conservar resultados anteriores.

Las primeras mediciones `antes.json` y `despues.json` usaron un servidor sin rangos HTTP y no cuentan cuadros presentados. Se conservan como historial; no deben utilizarse para comparar la fluidez de los bucles con las mediciones posteriores.

## Pendiente

Revisar la ruta de decodificación gráfica en el navegador visible y contrastar con un controlador/equipo diferente. No se cambiaron preferencias globales de Chrome ni se instalaron controladores. Una reducción de resolución, tubos o bloom no está incluida porque cambiaría el requisito de calidad visual.
