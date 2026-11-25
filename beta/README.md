# DuoPy β 0.7

Consola Python horizontal, sin dependencias de build. Abrir https://juanitoyun.github.io/duopy/beta/ si GitHub Pages publica main desde la raíz.

- EDIT/RUN: ejecuta el script al entrar en RUN; volver a EDIT interrumpe una ejecución pendiente.
- Cruceta derecha: una pulsación, un paso del cursor (sin repetición por presión larga). Touchpad izquierdo: scroll vertical y horizontal de la pantalla activa, sin mover el cursor.
- Menú radial: archivos, selección, copiar/pegar, STOP/CLR en RUN y SPD (sensibilidad de 0.4× a 3×, persistente).
- Iconos i: nombre del script en el editor y entorno Python, directorio virtual, ejemplos de módulos disponibles y paquetes cargados en la consola. Información temporal, sin ocupar espacio permanente.
- Python 3.12 mediante Pyodide 0.27.7 en un Web Worker. REPL de una línea después de ejecutar el script, compartiendo sus variables. Requiere conexión para cargar el motor y paquetes.
- input() usa SharedArrayBuffer; isolation.js habilita aislamiento mediante service worker dentro de /beta/. Abrir directamente por HTTPS, no dentro de iframe. Puede recargar una vez. Si no hay aislamiento, input() termina con EOF en lugar de bloquear.
- Beta: no se garantiza compatibilidad con todos los navegadores ni paquetes, ni uso offline. No hay consola gráfica, audio ni integración con el sistema de archivos más allá de importar/exportar.
- La página original del repositorio no se modifica.

## Pruebas manuales
1. Ejecutar el script inicial: 0 a 4.
2. En RUN escribir n + 2 y Enter: 7.
3. EDIT y probar print(input("Nombre: ")); en RUN responder con el teclado integrado.
4. Probar while True: pass y STOP; la interfaz debe seguir respondiendo.
5. Editar, guardar, recargar, abrir .py y comprobar contenido.
6. Verificar orientación horizontal y los tres renglones visibles en cada visor.

## Biblioteca y visualización
- VIEW: Duo (3+3 líneas), Swap (intercambia las pantallas), Focus (6 líneas en pantalla activa; teclado permanente). No cambia EDIT/RUN.
- SPD: 0.4× por defecto, mantiene preferencias guardadas.
- LIB (EDIT): lee beta/scripts/index.json y copia archivos .py al editor; no escribe en GitHub. El borrador personal permanece en localStorage; la copia temporal se conserva en sessionStorage hasta cerrar la pestaña. LIB → Mi script restaura el borrador. SAVE descarga la copia actual.
- Para incorporar algoritmos: añadir un .py en beta/scripts/ y una entrada {"file":"nombre.py","title":"Título","category":"Tema"} al índice JSON.

## Notebooks
- ⌃ sube al visor de notebooks; ⌄ vuelve a la consola. Ambos paneles permanecen montados y la animación respeta prefers-reduced-motion.
- Visor .ipynb v4 Python de solo lectura. Abrir archivo local o biblioteca en beta/notebooks/. Las celdas se ejecutan individualmente o con ▶▶; mantienen un worker independiente del editor. ■ interrumpe y reinicia el kernel; ↻ reinicia y limpia outputs. Run All se detiene ante error.
- ⧉ copia selección de texto o código de la celda al portapapeles interno (PST en EDIT) y, cuando el navegador lo permita, al portapapeles del sistema. No se escriben notebooks originales. Touchpad y flechas para navegar.
- Markdown básico, texto de salida y PNG/JPEG guardados; no HTML activo, widgets, LaTeX renderizado ni gráficos nuevos inline. No es JupyterLab ni IPython completo. input() usa un campo nativo opcional y requiere aislamiento como en la consola. El estado del notebook vive en memoria de la pestaña, no sobrevive a recargar.
- Abrir una celda no ejecuta código automáticamente. Ejecutar solo notebooks de confianza.

## AED oficial
El catálogo completo de 314 archivos está en beta/notebooks/aed-index.json, fijado al commit 7d8ef60e45a1923f855b5777b60696b074a7a445 de https://github.com/ivansipiran/AED-Apuntes. Se accede directamente a los originales de GitHub: no hay copia redistribuida ni modificación del contenido. Los notebooks se verifican por tamaño y SHA-1 de blob cuando Web Crypto está disponible. En NB se incluyen 10 capítulos, 7 guías, índice, README, recursos y checkpoints. Los enlaces de recursos apuntan a la misma revisión. Markdown, fórmulas KaTeX, imágenes y GIF originales se visualizan en el visor con conexión; si no cargan las dependencias CDN se usa Markdown básico. Para ejecutar se mantienen las celdas originales; el worker adapta en memoria las directivas %matplotlib inline, %pylab inline y las instalaciones de aed-utilities, e intenta capturar gráficos matplotlib. No se garantiza compatibilidad con aed-utilities, IPython, widgets o todos los notebooks: abrir el original desde ↗ permite usar Jupyter/Colab. El repo upstream no declara licencia de redistribución. No se almacenan copias de sus archivos.

## STUDY 0.7
Carrusel de celdas de AED y slides propias en modo oscuro; las previsualizaciones laterales y el índice permiten navegación arbitraria. ▣/☰ alterna carrusel y lista. LINKED conserva un namespace por documento activo; SOLO reinicia el namespace de cada celda (los módulos del intérprete pueden persistir). ▶ … reinicia y ejecuta hasta la celda elegida; detiene en errores o espera input. Al cambiar de capítulo se reinicia el kernel. LAB y STUDY independientes. Los originales no se modifican.
OPEN admite .ipynb, .qmd y .md. El lector QMD interpreta Markdown, encabezados y bloques {python}/{pyodide} como unidades; no es el compilador Quarto completo. El ejemplo beta/study/memoria.qmd puede renderizarse aparte con Quarto + Quarto Live usando build.sh (requiere Quarto instalado; no validado en esta revisión). En DuoPy el motor existente Pyodide ejecuta los bloques, sin JupyterLite. Graphviz WASM renderiza DOT y el visor acepta SVG como imágenes aisladas. El puente IPython/Graphviz es experimental y no implementa widgets ni todos los mecanismos de visualización de aed-utilities. No se ejecuta código automáticamente al navegar. Abrir contenido de confianza. Se mantiene GitHub Pages estático.
