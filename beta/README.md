# DuoPy β 0.3

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
