# DuoPy β 0.8.1

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

Para compilar con el motor nativo de Quarto: instalar Quarto y Python con Jupyter, ejecutar bash beta/study/build.sh. El formato documentado es live-revealjs; el HTML generado es independiente del visor de DuoPy. El ejemplo DOT usa la extensión visual propia de DuoPy; la gráfica Matplotlib es el ejemplo portable. No se necesita servidor Jupyter en ejecución.

## STUDY 0.8
Una única barra lateral con AED, opciones, touchpad y retorno a LAB. Run está en cada celda; STOP aparece en el encabezado solo mientras se ejecuta. El menú ⋯ agrupa OPEN, LINKED/SOLO, Slides/Lista, copiar, ejecutar todas, ejecutar hasta aquí y reset. Las flechas del pie y las tarjetas vecinas navegan. Código arriba, output debajo (incluye gráficas). Los mensajes de carga de paquetes Pyodide se separan del output de Python; el estado del encabezado indica carga. Matplotlib usa Agg en STUDY para evitar dependencias DOM y captura PNG al finalizar la celda; las excepciones reales siguen visibles. No se alteran los archivos AED ni la interfaz LAB.

## 0.8.1
Assets versionados con nombres independientes para evitar mezclar HTML nuevo con JS/CSS cacheado de versiones anteriores. Service worker revalida navegación y scripts/estilos. setBusy tolera controles opcionales ausentes. Abrir /beta/?v=0.8.1 para evitar una navegación cacheada.

## 0.9 · Edición temporal
Pulsar STUDY en el encabezado alterna EDIT. En EDIT cada celda tiene ✎. Abre una escena independiente, con copia del teclado LAB, touchpad, cruceta, selección, deshacer y opción de teclado nativo. Sin consola, worker ni almacenamiento propios. Aplicar modifica solo el texto de la celda activa; el output previo se conserva y se marca desactualizado hasta ejecutar. Cancelar descarta el borrador. No se persiste el contenido editado: se conserva en el documento activo al navegar, pasar a LAB o resetear kernel; al abrir otro documento o refrescar se recupera el original. La edición estructural se reserva para una fase posterior. El editor usa textarea nativo con números de línea y no colorea sintaxis en tiempo real; al regresar el resaltado se conserva. LAB y el worker original son idénticos.

## 0.9.1
CELL EDITOR ya no contiene textarea, input editable ni teclado nativo. Replica el editor LAB de spans coloreados, cursor manual, selección SEL/CPY/PST, navegación de un paso y teclado de seis filas. Lee la preferencia de sensibilidad de LAB sin escribirla. Estado de edición independiente; no toca el script ni el intérprete LAB. Aplicar/Cancelar conservan la semántica 0.9.
