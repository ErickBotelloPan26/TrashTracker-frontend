git add Dockerfile nginx.conf README.md ALCANCE-SPRINTS.md ANGULAR-MATERIAL.md CAMBIOS.md# Registro de cambios de TrashTracker frontend

Este registro comienza el 22/11/2026, a partir de la versión que el grupo copió para GitHub. Cada entrada describe un cambio preparado para un commit. Los commits y su autoría quedan a cargo de los integrantes del grupo.

## CH001 — Corregir formularios de autenticación y compartir el encabezado

Fecha: 22/11/2026.

### Objetivo

Corregir las etiquetas desalineadas y los iconos para mostrar u ocultar contraseñas. Utilizar exactamente el componente de encabezado de la landing en login, registro, recuperación y restablecimiento de contraseña.

### Cambios realizados

- Se reemplazó el header duplicado por `EncabezadoComponent` (`app-encabezado`). Se colocó fuera del contenedor del formulario para que conserve la tipografía, tamaño y posiciones de la landing.
- Se eliminaron los estilos del header anterior y las reglas antiguas de padding, borde y tipografía de los inputs que interferían con Angular Material.
- Se ajustaron los campos de autenticación a 56 px de altura mediante los tokens públicos de Material, conservando el espacio de mensajes y validaciones.
- Los botones de contraseña y confirmación usan `matIconSuffix`, centran sus iconos, dejan 8 px adicionales de separación del borde derecho y actualizan `aria-pressed` al alternar su visibilidad.
- Se ajustó la altura mínima de la página al compartir el header, evitando sumar una barra adicional a la altura del viewport.
- Login y registro comparten una tarjeta de 440 px de ancho máximo y 660 px de altura mínima en escritorio, con el enlace inferior al pie y los mismos espacios interiores. Se compactaron el padding vertical, la separación entre campos y el bloque social para reducir el espacio vacío. En móvil la altura se adapta al contenido para evitar espacios innecesarios.

### Archivos para incluir en el commit

Rutas relativas a la carpeta `TrashTracker-angular`:

| Archivo | Modificación |
|---|---|
| `src/app/componentes/autenticacion/autenticacion.component.html` | Encabezado compartido y botones de visibilidad. |
| `src/app/componentes/autenticacion/autenticacion.component.ts` | Import de EncabezadoComponent y retiro del toolbar duplicado. |
| `src/app/componentes/autenticacion/autenticacion.component.css` | Limpieza de estilos antiguos y centrado de iconos. |
| `src/material-overrides.scss` | Altura y padding Material de los campos de autenticación; retiro de la referencia al header anterior. |
| `CAMBIOS.md` | Inicio del registro y detalle de CH001. |

### Verificación realizada

- Compilación de producción Angular: correcta (`npm run build`).
- Suite frontend existente: 44 pruebas aprobadas en 7 archivos (`npm test`).
- Revisión en navegador de login, registro, recuperación y restablecimiento con un token ficticio de inspección, sin enviar formularios a la API.
- Campos vacíos centrados: etiquetas a aproximadamente 1 px del centro vertical del contenedor e iconos a 0 px. Comprobado también el comportamiento de las etiquetas al escribir y el cambio de tipo de ambos campos de contraseña.
- Comparación del header renderizado en landing y login: misma altura de 64 px, fuente Roboto de 16 px, peso de enlaces 700, color de fondo y posiciones de todos los enlaces.
- Revisión móvil a 390 × 844: formulario sin desbordamiento horizontal; apertura del menú y navegación a registro comprobadas.

### Commit sugerido

```text
fix(auth): alinear campos y reutilizar encabezado de la landing
```

No se han creado commits ni enviado cambios a GitHub desde esta sesión. Los ZIP son copias de distribución y no forman parte de los cinco archivos de este commit.

## CH002 — Corregir la lista de reportes del mapa

Fecha: 22/11/2026.

### Objetivo y cambios realizados

Corregir la superposición del estado, título, datos y enlace de detalle en el panel izquierdo del mapa. El botón Material conservaba una altura fija mientras su contenido ocupaba varias líneas.

- El botón para centrar un reporte usa altura automática, con un mínimo de 44 px y padding interior.
- Su contenido se organiza en una cuadrícula vertical con separación entre estado, título y fecha/tipo de residuo.
- Los títulos largos pueden dividirse en varias líneas, incluso si contienen palabras sin espacios.
- El enlace «Ver detalle» queda debajo del botón, dentro de su propia fila de reporte. Se conservan las acciones de centrar el mapa y abrir el detalle.
- El resaltado al pasar el cursor tiene esquinas de 7 px y el enlace «Ver detalle» comparte la alineación izquierda del contenido (12 px de margen interior).

### Archivos para incluir en el commit

Rutas relativas a `TrashTracker-angular`:

- `src/app/componentes/mapa-comunitario/mapa-comunitario.component.html`
- `src/app/componentes/mapa-comunitario/mapa-comunitario.component.css`
- `CAMBIOS.md`

### Verificación realizada

- Compilación de producción Angular correcta.
- Revisión de los estilos y la plantilla: altura automática y separación del contenido, sin modificar filtros ni llamadas a la API.

### Commit sugerido

```text
fix(mapa): evitar superposicion en la lista de reportes
```

El parche CH002 parte de la versión final de CH001. No se han creado commits ni enviado cambios a GitHub.

## CH003 — Conservar el panel del usuario en acceso denegado

Fecha: 22/11/2026.

### Causa y solución

El error era visual y de navegación: la respuesta 403 ya conservaba la sesión, pero la página de acceso denegado era una ruta pública con el encabezado de la landing.

- La pantalla ahora se encuentra en `/app/acceso-denegado`, dentro del panel protegido por AuthGuard, con el mismo header, perfil y navegación del usuario.
- `/acceso-denegado` redirige a esa ruta, conservando compatibilidad con AdminGuard y el interceptor de errores 403.
- Se retiraron el encabezado público duplicado, el botón para iniciar sesión y la altura de pantalla completa adicional. Se conserva «Volver al inicio».
- AdminGuard continúa bloqueando la administración para ciudadanos; las respuestas 401 mantienen su comportamiento de sesión expirada.

### Archivos para incluir en el commit

Rutas relativas a `TrashTracker-angular`:

- `src/app/app.routes.ts`
- `src/app/app.routes.spec.ts`
- `src/app/componentes/acceso-denegado/acceso-denegado.component.html`
- `src/app/componentes/acceso-denegado/acceso-denegado.component.ts`
- `src/app/componentes/acceso-denegado/acceso-denegado.component.css`
- `CAMBIOS.md`

### Verificación realizada

- Compilación de producción correcta y 46 pruebas aprobadas en 7 archivos.
- Prueba de navegación: ciudadano rechazado en administración, perfil visible en el panel, token y rol conservados, y posterior navegación al perfil correcta.
- Prueba de acceso directo sin sesión: el enlace de acceso denegado redirige al login.
- Las pruebas existentes de 401 y 403 del interceptor siguen pasando.

### Commit sugerido

```text
fix(security): conservar panel y sesion en acceso denegado
```

El parche CH003 parte de la versión final de CH002. No se han creado commits ni enviado cambios a GitHub.

## CH004 — Configurar Material con un tema predefinido y CSS

Fecha: 22/11/2026.

### Causa y cambios realizados

El ejemplo actualizado de proveedores carga `azure-blue.css` desde `angular.json`. TrashTracker utilizaba un tema Sass personalizado y un archivo Sass adicional de ajustes; ambos son opciones válidas de Material, pero no son obligatorios.

- `angular.json` ahora carga `@angular/material/prebuilt-themes/azure-blue.css` seguido de `src/styles.css`, como el esquema del profesor.
- Se eliminaron `src/material-theme.scss` y `src/material-overrides.scss`.
- Se conservaron en `src/styles.css` los ajustes de colores, tipografía, densidad, campos, botones, tablas, menús y overlays. Las variables CSS sustituyen los mixins Sass, sin modificar versiones ni dependencias.
- Se actualizó `ANGULAR-MATERIAL.md`. Las referencias de CH001 al archivo retirado se mantienen como historial de ese cambio.
- Se conserva la URL de la API en environment, sin incluir esa modificación en el parche CH004.

### Archivos para incluir en el commit

Rutas relativas a `TrashTracker-angular`:

- `angular.json`
- `src/styles.css`
- `src/material-theme.scss` (eliminar)
- `src/material-overrides.scss` (eliminar)
- `ANGULAR-MATERIAL.md`
- `CAMBIOS.md`

### Verificación realizada

- Compilación de producción correcta y 46 pruebas aprobadas en 7 archivos.
- Comparación automática de las 212 variables emitidas por el tema anterior: los valores efectivos se conservan al superponer las personalizaciones CSS al tema predefinido.
- Se conservaron las reglas CSS de integración del archivo de ajustes anterior.

### Commit sugerido

```text
refactor(material): usar tema predefinido y centralizar estilos en CSS
```

El parche CH004 parte de la versión de trabajo con CH003 y la configuración directa de environment. No se creó un commit Git: esta carpeta no contiene un repositorio inicializado. No se enviaron cambios a GitHub.

## CH007 — HU033: capturar y mostrar la hora de eventos (frontend)

Fecha: 22/11/2026. Requiere el backend CH006.

- Se añadió «Hora de inicio» al formulario Crear evento, usando `matInput` de tipo `time`, con precisión de minutos y validación obligatoria de HH:mm.
- La hora elegida se envía como `hora` mediante EventoService y se conserva al cargar los datos del servidor. La fecha se sigue enviando en formato local yyyy-MM-dd.
- Se muestra la hora en el listado, detalle, eventos del grupo y tarjeta del próximo evento en Inicio. La ordenación incorpora la hora real, en lugar de usar siempre medianoche.
- Como protección ante respuestas antiguas, una hora ausente se muestra como «Hora por confirmar». El backend CH006 completa los eventos antiguos a las 09:00 al arrancar.
- Se actualizó el caso P15 y la matriz HU033 del manual de pruebas. Se conserva la finalización al terminar el día, ya que no se ha añadido hora de fin.

Archivos para el commit, relativos a `TrashTracker-angular`:

- `src/app/model/evento.ts` y `src/app/model/interfaces/application.ts`.
- `src/app/services/evento-service.ts` y `src/app/services/application-service.ts`.
- `src/app/componentes/evento-nuevo/evento-nuevo.component.ts` y `.html`.
- Plantillas de `eventos`, `evento-detalle`, `grupo-detalle` e `inicio`.
- `src/app/shared/material-integration.spec.ts` y `src/app/services/api-integration.spec.ts`.
- `MANUAL-PRUEBAS.html`, `MANUAL-PRUEBAS.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta y 48 pruebas aprobadas. Se comprobó el envío de la hora en JSON, su recuperación en el modelo y el bloqueo del formulario sin hora o con formato inválido. El manual HTML pasó las comprobaciones de 28 casos, 35 historias, controles y guardado local. Queda el recorrido P15 sobre tu PostgreSQL.

Commit sugerido:

```text
feat(eventos): capturar y mostrar hora de inicio
```

No se creó un commit Git ni se enviaron cambios a GitHub. CH006 y CH007 tienen parches separados por proyecto.

## CH009 — HU041: sincronizar saldo e historial de puntos (frontend)

Fecha: 22/11/2026. Requiere backend CH008.

- `ApplicationService.refreshPoints` consulta el perfil y el historial de la API y actualiza saldo, nivel y movimientos del usuario actual una vez recibidas ambas respuestas. No calcula ni acredita puntos en el navegador.
- El panel consulta al abrirse, cada 15 segundos mientras la pestaña está visible y al volver a la ventana. No solapa consultas y cancela la suscripción al destruir el panel. Las respuestas pendientes de una sesión anterior se descartan.
- Cuando un administrador resuelve un reporte propio, la sincronización se intenta también después de guardar. Un fallo de consulta no presenta como fallida una validación ya guardada por la API.
- Recompensas muestra la regla de 50 puntos por reporte resuelto y un aviso si la sincronización falla; se vuelve a intentar automáticamente.
- Se actualizó P19 y la matriz HU041 del manual, incluyendo la validación por el administrador y la prueba de no duplicación tras reintentos/reaperturas.

Archivos para el commit, relativos a `TrashTracker-angular`:

- `src/app/services/application-service.ts` y `src/app/services/api-integration.spec.ts`.
- `src/app/componentes/panel-aplicacion/panel-aplicacion.component.ts` y `.spec.ts` (prueba nueva).
- `src/app/componentes/catalogo-recompensas/catalogo-recompensas.component.html`.
- `MANUAL-PRUEBAS.html`, `MANUAL-PRUEBAS.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta y 51 pruebas aprobadas en 8 archivos. Las nuevas pruebas comprueban saldo/historial confirmados por servidor, filtrado por propietario, descarte de respuestas al cerrar sesión y consultas cada 15 segundos/al foco, pausa al ocultarse y cancelación al destruir. Manual HTML validado con 28 casos y 35 historias. Queda P19 sobre tu PostgreSQL con dos sesiones.

Commit sugerido:

```text
feat(puntos): sincronizar saldo e historial automaticamente
```

Parche CH009 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH011 — HU049: panel personal y validación de asistencia (frontend)

Fecha: 22/11/2026. Requiere backend CH010.

- Mi perfil consulta `GET /api/usuario/{id}/estadisticas` y muestra reportes realizados, eventos asistidos, EcoPuntos disponibles y nivel, con carga, error y actualización manual. Saldo/nivel siguen recibiendo además la sincronización del panel.
- Los estados vacíos muestran cifras reales de la API. No se deduce presencia a partir de inscripciones ni se inventan valores si falla la consulta. Las respuestas de otro propietario o de una vista ya destruida se descartan.
- El detalle de una jornada finalizada ofrece «Consultar participantes», «Marcar asistió» y «Marcar no asistió» para el organizador/administrador autorizado. Las filas cambian únicamente tras confirmar la API y bloquean envíos repetidos mientras se guarda.
- La identidad del organizador se conserva en el modelo de eventos para mostrar los controles adecuados. La API vuelve a comprobar los permisos y la fecha.
- Los botones de inscripción se denominan «Inscribirme»/«Inscripción confirmada», distinguiéndolos de la validación de presencia.
- Se añadieron modelos de EstadisticasUsuario y ParticipanteEvento, métodos en los servicios correspondientes y estilos adaptables del panel/lista.
- Se actualizaron P27, R06 y la matriz HU049 del manual para probar la inscripción, validación y corrección de presencia con dos cuentas.

Archivos para el commit, relativos a `TrashTracker-angular`:

- Modelos `src/app/model/estadisticas-usuario.ts`, `participante-evento.ts` e `interfaces/application.ts`.
- Servicios `src/app/services/usuario-service.ts`, `evento-service.ts` y `application-service.ts`.
- Archivos `.ts`, `.html`, `.css` y `.spec.ts` de `src/app/componentes/perfil` y `evento-detalle`.
- `src/app/componentes/eventos/eventos.component.ts` y `.html` (textos de inscripción).
- `src/app/shared/material-integration.spec.ts` (aislamiento del test existente de eliminar cuenta).
- `MANUAL-PRUEBAS.html`, `MANUAL-PRUEBAS.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta y 56 pruebas aprobadas en 10 archivos. Las nuevas pruebas comprueban cifras de la API, ceros reales, error y reintento, controles del organizador, bloqueo para participantes/eventos futuros, payload de validación y actualización tras respuesta del servidor. Manual HTML validado con 28 casos y 35 historias. Queda la revisión P27 en tu PostgreSQL.

Commit sugerido:

```text
feat(perfil): mostrar estadisticas y validar asistencia
```

Parche CH011 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH013 — HU048: actualizar y avisar de logros desbloqueados (frontend)

Fecha: 22/11/2026. Requiere backend CH012.

- Al entrar en Logros o usar «Actualizar logros» se solicita la reevaluación de criterios al backend para el propio usuario y después se consulta catálogo/concesiones. Angular no calcula criterios ni envía contadores.
- El panel consulta los logros cada 15 segundos mientras está visible y al recuperar el foco, junto con los puntos. Los errores de un recurso no cancelan la actualización del otro; se cancelan ambas suscripciones al salir del panel.
- Publicar un reporte o actualizar uno propio refresca también los logros tras guardar. Si falla esa consulta, no se presenta como fallida una operación ya guardada.
- El catálogo y los filtros se actualizan con las concesiones del servidor. Una transición de pendiente a obtenido produce un aviso accesible en Logros, sin repetirlo en cada consulta. Se descartan respuestas de sesiones anteriores.
- Se muestra error y se ofrece actualización manual. Se corrigió el identificador del icono de medalla para evitar duplicar el prefijo fa-.
- Se actualizó el modelo de Logro y el manual P21/R04, con las reglas explícitas y el criterio provisional de Reciclador Novato.

Archivos para el commit, relativos a `TrashTracker-angular`:

- `src/app/model/logro.ts`.
- `src/app/services/logro-service.ts`, `application-service.ts` y `api-integration.spec.ts`.
- `src/app/componentes/panel-aplicacion/panel-aplicacion.component.ts`.
- `src/app/componentes/logros/logros.component.ts`, `.html` y `.spec.ts` (prueba nueva).
- `MANUAL-PRUEBAS.html`, `MANUAL-PRUEBAS.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta y 60 pruebas aprobadas en 11 archivos. Las nuevas pruebas comprueban reevaluación sin IDs del cliente, actualización confirmada por API, aviso de obtención, ausencia de desbloqueos inventados, descarte al cerrar sesión y filtros tras la carga. Manual HTML validado con 28 casos y 35 historias. Queda P21 sobre tu PostgreSQL.

Commit sugerido:

```text
feat(logros): sincronizar desbloqueos y mostrar avisos
```

Parche CH013 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH014 — Retirar pruebas automatizadas del frontend entregable

Fecha: 22/11/2026.

Por indicación del usuario, el frontend se entrega sin archivos de pruebas automatizadas. Un `.component.spec.ts` comprueba un componente; no forma parte de su funcionamiento en la aplicación.

- Se retiraron los once archivos `.spec.ts` de componentes, servicios, rutas e integración Material.
- Se retiró `tsconfig.spec.json`, el target `test` de angular.json y el comando `npm test`.
- Se retiraron las dependencias directas de desarrollo `vitest` y `jsdom`, actualizando package-lock.json de forma offline. Se conservaron las dependencias de aplicación y sus versiones.
- Se conserva `skipTests: true` en los generadores de componentes y servicios, para evitar que Angular CLI vuelva a crear archivos spec.
- Se actualizó ANGULAR-MATERIAL.md para indicar compilación y recorrido manual, sin recomendar comandos de pruebas retirados.
- Las pruebas anteriores se respaldaron fuera del entregable, en `work/pruebas-frontend-antes-CH014`, como material de verificación de desarrollo. Los registros anteriores conservan el historial de las pruebas que se ejecutaron en cada cambio.
- No se modificaron componentes de ejecución ni el backend.

Archivos para el commit, relativos a `TrashTracker-angular`:

- Todos los once `src/**/*.spec.ts` (eliminar).
- `tsconfig.spec.json` (eliminar).
- `angular.json`, `package.json` y `package-lock.json`.
- `ANGULAR-MATERIAL.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta; comprobación de ausencia de `.spec.ts` en src, eliminación del target/comando de pruebas y conservación de `skipTests`. Los ZIP del frontend y combinado no incluyen estos archivos ni las copias de trabajo.

Commit sugerido:

```text
chore(frontend): retirar pruebas del proyecto entregable
```

Parche CH014 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH015 — Integrar datos y ordenamiento en sus componentes

Fecha: 22/11/2026.

Por indicación del usuario, se retiraron las carpetas `src/app/data` y `src/app/shared` para mantener los datos de presentación y la lógica de cada pantalla dentro de su componente.

- Los 14 marcadores de ejemplo del mapa de la landing se trasladaron a la propiedad privada `marcadores` de MapaImpactoComponent, conservando coordenadas, textos y estados. El mapa privado de reportes reales continúa consumiendo la API.
- El ordenamiento de tablas se trasladó al método privado `ordenarReportes` de MisReportesComponent y AdministracionReportesComponent, manteniendo MatSort, filtros y paginación.
- Se retiraron las importaciones de data/shared y se eliminaron sus dos archivos y carpetas vacías. No se añadieron carpetas auxiliares ni pruebas.
- Los modelos e interfaces siguen en model; los servicios de API siguen en services. No se modificó el backend.

Archivos para el commit, relativos a `TrashTracker-angular`:

- `src/app/componentes/mapa-impacto/mapa-impacto.component.ts`.
- `src/app/componentes/mis-reportes/mis-reportes.component.ts`.
- `src/app/componentes/administracion-reportes/administracion-reportes.component.ts`.
- `src/app/data/report-markers.ts` (eliminar).
- `src/app/shared/report-table.ts` (eliminar).
- `CAMBIOS.md`.

Verificación: compilación de producción correcta, ausencia de carpetas/importaciones data y shared y preservación del contenido original de los marcadores y del algoritmo de ordenamiento durante el traslado. El frontend continúa sin archivos spec.

Commit sugerido:

```text
refactor(frontend): integrar datos y logica en componentes
```

Parche CH015 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH017 — HU032: recibir mensajes sin actualización manual (frontend)

Fecha: 22/11/2026. Requiere backend CH016.

- Se añadió ChatTiempoRealService en services y el tipo de eventos en model/interfaces. Se utiliza fetch con streaming y Authorization, tomando la URL exclusivamente de environment; no se expone el token en la URL ni se añaden dependencias.
- El detalle del grupo abre el canal solo para un miembro, lo cierra al salir o cambiar de grupo y muestra estado de conexión. Se retiró «Actualizar mensajes».
- La reconexión tiene espera progresiva de 1 a 10 segundos y consulta el historial al conectar. Los mensajes recibidos, la respuesta del envío y el historial se combinan por ID y se ordenan, sin perder mensajes en vivo por una respuesta tardía ni duplicar el mensaje propio.
- El envío actualiza el mensaje desde la respuesta guardada por la API, sin depender de otra consulta para declararlo correcto. Se bloquean dobles envíos mientras se guarda.
- Una pérdida de membresía limpia los mensajes y la membresía local. Un 403 no cierra toda la sesión; un 401/expiración redirige al login y limpia datos de una sesión inválida. Un corte de red conserva el borrador.
- Se actualizó P13 y la matriz HU032. El frontend sigue sin carpetas data/shared ni archivos spec.

Archivos para el commit, relativos a `TrashTracker-angular`:

- `src/app/model/interfaces/evento-chat-tiempo-real.ts` (nuevo).
- `src/app/services/chat-tiempo-real-service.ts` (nuevo) y `application-service.ts`.
- `src/app/componentes/grupo-detalle/grupo-detalle.component.ts` y `.html`.
- `MANUAL-PRUEBAS.html`, `MANUAL-PRUEBAS.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta. En scripts externos de desarrollo se comprobaron fragmentación SSE/UTF-8, JWT en cabecera, reconexión, cierre al desuscribirse, tratamiento de 401/403, aislamiento por grupo y combinación/deduplicación con historial tardío. No se incluyeron scripts de verificación ni archivos spec en el entregable. El manual HTML se validó con sus 28 casos y 35 historias. Queda P13 en dos sesiones reales contra tu PostgreSQL.

Commit sugerido:

```text
feat(chat): recibir mensajes automaticamente y retirar actualizacion manual
```

Parche CH017 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH019 — HU035: mostrar avisos automáticos sin botón manual (frontend)

Fecha: 22/11/2026. Requiere backend CH018.

- Se eliminaron «Avisar al grupo», el método notify del detalle y la llamada manual del servicio de eventos. Publicar el evento basta para generar el aviso.
- La campana consulta las notificaciones junto con puntos y logros al entrar, cada 15 segundos mientras la pestaña está visible y al recuperar el foco; abrirla también actualiza los datos.
- Se incorporó eventoId al modelo de notificación y eventId al modelo de presentación. La carga inicial y las actualizaciones enlazan los avisos nuevos al detalle del evento, conservando enlaces a reportes y el listado para avisos antiguos sin ID.
- Si el evento recibido por notificación todavía no está en la lista local, el detalle lo carga por ID con sus inscripciones/fotos y muestra un estado de carga. El mapeo de eventos se reutiliza dentro del servicio para conservar fecha/hora y evitar exigir una recarga completa.
- La consulta descarta respuestas de una sesión anterior y solo muestra filas del propietario. Un fallo de notificaciones se muestra dentro de la campana y no cancela las consultas de puntos/logros.
- Se actualizó la etiqueta accesible del menú y el recorrido P17/matriz HU035 del manual. No se añadieron archivos spec ni carpetas data/shared.

Archivos para el commit, relativos a `TrashTracker-angular`:

- `src/app/model/notificacion.ts` y `src/app/model/interfaces/application.ts`.
- `src/app/services/evento-service.ts` y `application-service.ts`.
- Archivos `.ts` y `.html` de `src/app/componentes/evento-detalle` y `panel-aplicacion`.
- `MANUAL-PRUEBAS.html`, `MANUAL-PRUEBAS.md` y `CAMBIOS.md`.

Verificación: compilación de producción correcta. En un script externo se comprobó el filtrado por propietario, enlace y carga por ID de un evento nuevo sin recarga global ni duplicación local, compatibilidad con avisos de reportes, limpieza del error tras consulta correcta, descarte de una sesión anterior y retirada del botón. Manual HTML validado con 28 casos y 35 historias. Queda P17 en dos sesiones contra tu PostgreSQL.

Commit sugerido:

```text
feat(notificaciones): actualizar avisos y retirar envio manual
```

Parche CH019 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH021 — HU039: habilitar fotos en jornadas finalizadas (frontend)

Fecha: 23/11/2026. Requiere backend CH020.

- La autorización de subida deja de depender de la fecha; permite miembros del grupo o participantes con inscripción confirmada también en eventos finalizados.
- Se actualizó el texto de la galería para explicar la disponibilidad después de la jornada y el caso P18/matriz HU039 del manual.
- Se conservan los controles de archivos y las restricciones para cuentas ajenas.

Archivos para el commit: `src/app/services/application-service.ts`, `src/app/componentes/evento-detalle/evento-detalle.component.html`, `MANUAL-PRUEBAS.md`, `MANUAL-PRUEBAS.html` y `CAMBIOS.md`.

Verificación: compilación de producción y comprobación externa del permiso real para miembros, inscritos y cuentas ajenas, tanto en eventos pasados como futuros. No se añadieron archivos spec al proyecto. Falta validación visual P18 contra el backend actualizado.

Commit sugerido: `fix(eventos): habilitar fotos en jornadas finalizadas`.

Parche CH021 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

## CH023 — HU004: editar apodo y fotografía en Mi perfil (frontend)

Fecha: 23/11/2026. Requiere backend CH022.

- Mi perfil añade apodo opcional de hasta 40 caracteres y selección de JPG/PNG de hasta 10 MB, vista previa, descarte y restablecimiento. Guardar cambios envía texto y fotografía en una solicitud multipart.
- La foto se conserva al guardar solo texto; la respuesta del servidor actualiza perfil/header. La carga de sesión recupera apodo y foto persistidos; se mantiene el nombre completo.
- Se liberan las URL de vista previa al descartar, guardar o destruir el componente; se bloquean acciones de fotografía/restablecimiento mientras se guarda. Una respuesta de una sesión anterior no cambia el perfil de otra cuenta.
- Se actualiza P11 y la matriz HU004 del manual. No se añaden dependencias, archivos spec ni carpetas fuera del esquema acordado.

Archivos para el commit, relativos a TrashTracker-angular:

- `src/app/model/usuario.ts`.
- `src/app/services/usuario-service.ts` y `application-service.ts`.
- Los tres archivos del componente `src/app/componentes/perfil`.
- `MANUAL-PRUEBAS.md`, `MANUAL-PRUEBAS.html` y `CAMBIOS.md`.

Verificación: compilación de producción correcta y comprobación externa de multipart con/sin foto, apodo vacío, actualización del perfil con la respuesta y descarte de respuestas de otra sesión. Manual validado. Queda P11 visual en el entorno del usuario.

Commit sugerido: `feat(perfil): editar apodo y fotografia desde el formulario`.

Parche CH023 exclusivo del frontend. No se creó un commit Git ni se enviaron cambios a GitHub.

