# Estado de las pantallas de Sprints 1 a 4

Esta versión reemplaza el funcionamiento local de demostración por consumo de la API de `Trash_Tracker-corregido.zip`.

Consultar `README.md` para el contrato exacto de reportes, perfil, grupos, eventos, puntos, recompensas, logros y autenticación; allí se detallan las funciones conectadas, las diferencias entre la API y el prototipo y las validaciones realizadas.

Este documento no certifica que todos los criterios de aceptación de todas las historias del curso estén terminados. La conexión conserva las pantallas existentes y sus operaciones disponibles en la API. El dashboard fue ajustado a la referencia Figma: tarjetas de resumen, reportes propios, accesos rápidos y progreso de nivel, conectado a datos reales. Esto no completa por sí solo los criterios de estadísticas personales ni acumulación histórica de puntos.

La API mantiene la autorización, persistencia y reglas de negocio. Los ejemplos de la landing pública son ilustrativos; la aplicación privada carga datos del servidor.

HU013/HU014: se añadió gestión administrativa en Angular para consultar todos los reportes, revisar evidencia y guardar Activo, En proceso o Resuelto mediante la API. HU014 dispone de interfaz; HU013 sigue parcial respecto al voluntario autorizado, porque el backend solo concede esos cambios al Administrador global. Ver P26 del manual.

La interfaz incorpora Angular Material/CDK 22.2.4. La biblioteca sustituye los controles de presentación sin cambiar servicios, JWT, roles ni reglas de negocio. Consultar ANGULAR-MATERIAL.md y el manual actualizado.
