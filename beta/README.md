# DuoPy β 0.2

Consola Python horizontal, sin dependencias de build. Abrir https://juanitoyun.github.io/duopy/beta/ si GitHub Pages publica main desde la raíz.

- EDIT/RUN: ejecuta el script al entrar en RUN; volver a EDIT interrumpe una ejecución pendiente.
- Joystick analógico: mueve un puntero virtual por la pantalla activa; L coloca el caret y R abre el menú. El puntero cambia de pantalla con EDIT/RUN. Cruceta independiente para mover el caret o recorrer el historial.
- Rueda vertical: arrastrar para desplazar suavemente la pantalla activa, sin cambiar el caret. Teclado integrado con números, símbolos y atajos.
- Menú radial ✳: abrir, guardar, nuevo, deshacer, selección (SEL), copiar/pegar (CPY/PST); en RUN, SAVE, STOP y CLR. Autoguardado local.
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
