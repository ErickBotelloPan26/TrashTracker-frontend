# Angular Material en TrashTracker

La SPA utiliza Angular Material y CDK 22.2.4, compatibles con Angular 22.2.3. Las versiones están fijadas en package.json y package-lock.json. No se requiere una instalación global ni ejecutar ng add de nuevo: npm ci instala las dependencias del proyecto.

## Ejecutar después de actualizar

1. Detén el servidor Angular anterior con Ctrl+C.
2. En la carpeta TrashTracker-angular ejecuta npm ci.
3. Ejecuta npm start y abre http://localhost:4200.
4. Inicia el backend como antes, con Java 21 y PostgreSQL configurado en application.properties.

## Componentes y carpetas

Cada pantalla conserva su carpeta dentro de src/app/componentes, con archivos .component.ts, .component.html y .component.css. Cada componente standalone importa directamente los módulos Material que utiliza; no hay un módulo que cargue toda la biblioteca.

| Recurso                        | Angular Material                               | Dónde se utiliza                                                          |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------- |
| Botones y acciones             | MatButtonModule                                | Formularios, acciones de aplicación y botones de la pagina-principal               |
| Campos, etiquetas y validación | MatFormFieldModule, MatInputModule             | autenticacion, reporte-nuevo, evento-nuevo, perfil, grupo-detalle y filtros        |
| Selectores desplegables        | MatSelectModule                                | Residuos, estados, grupos, distrito, idioma y roles                       |
| Recordarme                     | MatCheckboxModule                              | autenticacion                                                                      |
| Tablas                         | MatTableModule                                 | mis-reportes, administracion-reportes e historiales de catalogo-recompensas                 |
| Ordenamiento y paginación      | MatSortModule, MatPaginatorModule              | mis-reportes y administracion-reportes                                                |
| Tarjetas y paneles             | MatCardModule                                  | Dashboard, reportes, grupos, eventos, recompensas, logros y perfil        |
| Cabeceras                      | MatToolbarModule                               | encabezado, autenticacion y panel-aplicacion                                                  |
| Confirmaciones                 | MatDialog                                      | dialogo-confirmacion, utilizado desde mis-reportes, perfil y catalogo-recompensas |
| Avisos breves de éxito         | MatSnackBar                                    | Guardar perfil, eliminar reporte y registrar un canje                     |
| Notificaciones                 | MatMenuModule, MatBadgeModule                  | panel-aplicacion                                                                 |
| Pestañas de grupo              | MatTabsModule                                  | grupo-detalle, con contenido dentro de cada pestaña                        |
| Filtros de categorías          | MatButtonToggleModule                          | eventos y logros                                                     |
| Progreso y carga               | MatProgressBarModule, MatProgressSpinnerModule | inicio y panel-aplicacion                                                     |
| Fecha del evento               | MatDatepickerModule                            | evento-nuevo                                                              |
| Preguntas frecuentes           | MatExpansionModule                             | preguntas-frecuentes                                                                       |

Las tablas de reportes ordenan y paginan los datos cargados desde la API. Los filtros buscan en todo ese conjunto, antes de paginar; cambiar un filtro vuelve a la primera página. Los contadores muestran todos los resultados del filtro, no solo la página visible. El listado administrativo mantiene los contadores generales por estado.

El calendario convierte la fecha elegida a yyyy-MM-dd usando la fecha local antes de llamar al servicio, conservando el contrato del backend. Los textos del calendario y paginador están configurados en español.

## Tema y diseño

- angular.json carga `@angular/material/prebuilt-themes/azure-blue.css` y después `src/styles.css`, siguiendo el esquema del ejemplo de proveedores.
- src/styles.css contiene las personalizaciones de color, tipografía, densidad y controles mediante variables CSS de Material, además de las reglas de integración con los estilos existentes.
- No se necesitan archivos SCSS propios para configurar Material. Se retiraron material-theme.scss y material-overrides.scss, conservando sus ajustes efectivos en CSS.
- app.config.ts configura el idioma y el paginador. evento-nuevo proporciona el adaptador de fecha y los textos del calendario.
- Los headers mantienen una altura de 64 px y la navegación compartida de la aplicación.

Las fotografías, logos PNG, iconos Font Awesome, estructuras particulares del Figma y mapas Leaflet se conservan. Los campos de archivo siguen siendo controles nativos para seleccionar fotos y utilizar la cámara cuando el dispositivo lo permite. Angular Material no sustituye Leaflet ni el almacenamiento de imágenes del backend.

Los diálogos Material/CDK gestionan el foco, el cierre con Escape y la devolución del foco al botón de origen. Cancelar no llama a la API. Eliminar cuenta mantiene la escritura exacta de ELIMINAR como confirmación. Las operaciones se ejecutan después de aceptar y conservan el manejo de errores de los servicios.

## Verificación

Ejecutar `npm run build` y seguir `MANUAL-PRUEBAS.html` para la revisión funcional. El frontend entregable no incluye archivos de pruebas automatizadas ni el comando npm test. Las verificaciones automatizadas anteriores se conservaron fuera del proyecto, en la carpeta de trabajo de desarrollo.

Consultar MANUAL-PRUEBAS.html para el recorrido funcional, incluido P26 de administración. Esta migración de interfaz no añade permisos de voluntario autorizado ni cambia las reglas de negocio de la API.

Referencia: [documentación oficial de Angular Material](https://material.angular.dev/).
