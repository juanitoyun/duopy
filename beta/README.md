# DuoPy β 0.4

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
