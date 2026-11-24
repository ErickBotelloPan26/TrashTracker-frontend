# TrashTracker — frontend conectado a la API

El frontend Angular consume el backend Spring Boot incluido en `TrashTracker-backend`. La aplicación privada usa JWT y datos persistidos en la base de datos del backend. La landing pública conserva sus contenidos ilustrativos y su mapa de ejemplo.

## Ejecutar localmente

1. Abrir `TrashTracker-backend` en IntelliJ IDEA con Java 21. Abrir `src/main/resources/application.properties` y completar `spring.datasource.url`, `spring.datasource.username` y `spring.datasource.password` con la conexion que ya utilizabas en Swagger. `jwt.secret` ya contiene una clave de desarrollo; no necesitas crear un archivo `.env`.
2. Iniciar PostgreSQL y crear la base indicada en `spring.datasource.url` si no existe. El perfil predeterminado recibido usa `spring.jpa.hibernate.ddl-auto=update`, que conserva datos. La carga de datos de prueba está controlada por `app.datos-prueba`; revisar `CargaDatosPrueba` y `data.sql` si se usará una base ya poblada. No se ha ejecutado este proyecto contra una base personal del usuario.
3. Desde la carpeta del backend ejecutar en Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

También se puede ejecutar `TrashTrackerApplication` desde IntelliJ IDEA. La API escucha en `http://localhost:8088`.

4. Abrir `TrashTracker-angular` en WebStorm y ejecutar desde su terminal:

```powershell
npm ci
npm start
```

5. Abrir `http://localhost:4200`. Registrar una cuenta o entrar con una cuenta ya existente en la base del backend. Una cuenta nueva empieza con el saldo asignado por el servidor; no se le otorgan puntos ficticios.

Node: la configuración del proyecto declara `^24.15.0`; se mantiene la versión local de Angular 22.2.3, CLI/build 22.2.4 y TypeScript 6.0.x del proyecto. No hace falta instalar Angular o TypeScript globalmente. Conservar `package-lock.json` y usar `npm ci`.

## Estructura de clase

- `src/app/componentes/`: cada componente en carpeta propia con TS, HTML y CSS.
- `src/app/model/`: clases por entidad con propiedades sin inicializador, conforme al ejemplo de clase.
- `src/app/services/`: servicios por entidad con `HttpClient`, `inject()` y respuestas `Observable`.
- Formularios de autenticación, reporte, evento y perfil con `FormGroup` declarado y construido en el constructor.
- `tsconfig.json`: `strictPropertyInitialization: false`; los objetos que se utilizan inmediatamente se inicializan cuando corresponde.
- `ApplicationService`: mantiene la información compartida de las vistas y adapta los DTO a los componentes; sus operaciones delegan en los servicios HTTP. Los signals existentes se conservan para sincronizar las vistas y los estados de carga.
- `src/app/interceptor/login-interceptor.ts`: adjunta Bearer a la API y gestiona 401 y 403.
- `src/app/guards/auth-guard.ts`: clase AuthGuard con canActivate y canActivateChild; verifica sesión y restaura el perfil desde la API.
- `src/app/guards/admin-guard.ts`: clase AdminGuard; limita la gestión de reportes al Administrador que devuelve el backend.

## Conexión y despliegue

`src/environments/environment.ts` define `apiURL: '/api'`. `proxy.conf.json` reenvía `/api` y `/files` al puerto 8088 durante `npm start`. Si cambia el puerto del backend, cambiar el destino en ese archivo y reiniciar Angular.

El proxy solo funciona en desarrollo. En producción, configurar el servidor para reenviar `/api` y `/files` al backend y servir el fallback de la SPA. Si se decide usar un dominio API diferente, actualizar `environment.prod.ts`, configurar CORS en el backend y asegurar el acceso a sus imágenes. `angular.json` ya incluye el reemplazo del environment de producción.

El JWT se guarda en `sessionStorage`; si se activa Recordarme, en `localStorage`. Cerrar sesión solicita primero la revocación del token al backend. No compartir contrasenas personales, tokens, dependencias ni bases de datos.

## Funciones conectadas

- Registro e inicio de sesión reales.
- Recuperación y restablecimiento desde `recuperar-contrasena?token=...`.
- Perfil: consulta, edición de nombre/idioma y eliminación de cuenta propia.
- Reportes: tipos desde API, foto multipart, descripción, coordenadas, creación, mapa, detalle, historial propio, confirmación y borrado propio.
- Ubicación: lectura y guardado de coordenadas personales; el navegador pide permiso para obtener la ubicación.
- Grupos: listado, membresía, mensajes persistidos, actualización manual del chat y asignación de roles según permisos del servidor.
- Eventos: creación, listado, asistencia, fotos y avisos internos al grupo.
- Recompensas: catálogo, saldo del perfil, canje transaccional e historial.
- Logros: catálogo y desbloqueos del usuario desde la API.
- Notificaciones: lectura desde el backend y actualización al abrir la campana.

Las mutaciones muestran éxito tras la respuesta HTTP. El servidor decide el saldo, stock, IDs, permisos, estados y fechas de registro. El botón que entraba a la demo sin autenticación fue retirado.

## Ajustes al contrato real del backend

El ZIP entregado no tiene todos los campos que existían en la demostración visual. Para evitar formularios que aparenten guardar campos que se descartan:

- Reportes: se guarda descripción, tipo, foto y coordenadas. El título visible se obtiene de la primera línea de la descripción; la ubicación textual muestra coordenadas. No se guardan título, dirección y distrito como campos independientes.
- Perfil: solo se editan nombre e idioma. El backend no recibe apodo, distrito ni avatar.
- Eventos: se guarda fecha y punto de encuentro. El nombre visible se deriva del grupo; no se inventan horas de inicio/fin ni se ofrecen campos de nombre/descripción que la API no persiste.
- Grupos: la API devuelve zona y total de miembros, pero no coordenadas. Se retiró la ordenación por distancia. Las imágenes existentes se mantienen como presentación asociada al nombre del grupo.
- Canjes: la API de historial no devuelve el costo histórico, por lo que se muestra fecha, recompensa y estado; los movimientos de puntos se consultan en su historial correspondiente.
- Las fotos de eventos se permiten hasta el día del evento, conforme a la regla del backend recibido, y requieren membresía o asistencia.
- El acceso con redes sociales requiere OAuth y no está implementado en la API recibida. Los botones informan de ello. El widget externo de chatbot preexistente conserva su integración independiente.

La landing pública y sus marcadores ilustrativos no sustituyen al mapa privado de reportes reales.

## Cambios del backend incluido

Se añadió `GET /api/grupo/{id}/miembros`, necesario para la pantalla de roles. Solo pueden consultarlo integrantes del grupo o administradores. No se modificaron entidades ni el esquema SQL para esta conexión.

Se añadió `FrontendApiTests` y una prueba de permisos de lectura de miembros. Se habilitó explícitamente Swagger en la clase de pruebas que comprueba Swagger; el perfil general de pruebas lo desactiva.

Para recuperación por correo se necesitan SMTP (`spring.mail.*`), `app.recovery.from` y una `app.recovery.url` HTTPS que apunte a `/recuperar-contrasena`. Sin esa configuración el backend responde 503 y el frontend muestra el error; no se simula el envío de correo. Ver la configuración de correo en el backend.

## Validación de la entrega base

- Compilación de producción Angular.
- 35 pruebas frontend: rutas, contratos HTTP, JWT, multipart, saldo del servidor, errores, recuperación y cierre de sesión; incluyen las pruebas de imágenes existentes.
- 30 pruebas backend con H2: cero fallos y cero errores. Incluyen el recorrido HTTP de registro, login, lecturas de la aplicación, reporte, chat, evento, asistencia, aviso, canje, perfil, borrado de reporte y revocación.
- Prueba adicional con ambos servidores ejecutándose y peticiones reales a través del proxy Angular: registro, login, perfil, tipos, subida multipart, descarga de imagen, mapa, borrado y rechazo del token después del logout.

Las pruebas usaron una base H2 temporal; no comprueban las credenciales de tu PostgreSQL ni un envío SMTP real.

```powershell
# Dentro del frontend
npm test
npm run build

# Dentro del backend
.\mvnw.cmd -Dspring.profiles.active=integracion-test test
```

## Manual de pruebas funcionales

Abre [MANUAL-PRUEBAS.html](MANUAL-PRUEBAS.html) en el navegador para seguir 28 casos, anotar resultados y consultar la trazabilidad de 35 historias de usuario. Puedes imprimirlo como PDF o exportar tus resultados. La version de texto esta en [MANUAL-PRUEBAS.md](MANUAL-PRUEBAS.md). Incluye las diferencias conocidas con los criterios de aceptacion; no certifica que todas las historias esten completas.

## Dashboard ajustado al Figma

Inicio reproduce la estructura de la referencia: cuatro tarjetas de resumen, reportes propios recientes con miniaturas/estados, cuatro accesos rápidos y barra de nivel. Fondo blanco, tarjetas con sombras suaves y distribución adaptable a móvil. El header utiliza el mismo formato en Inicio y el resto de secciones, incluido el acceso Mi perfil.

Se conserva el nivel devuelto por la API y se utilizan sus umbrales (100, 300, 600 y 1000), no el valor ilustrativo 1500 del Figma. Si el saldo ya supera el umbral de su nivel registrado, se muestra Meta alcanzada; el dashboard no modifica el nivel del servidor al visualizarse. Se muestran estados vacíos para cuentas sin eventos/grupos/reportes y marcadores visuales para fotografías no disponibles. Las pruebas del dashboard verifican reportes propios, contadores, selección de evento/grupo, estados vacíos y progreso.

El header compartido mantiene una altura de 64 px y fondo opaco. Se reserva el espacio de la barra vertical para que las secciones cortas y largas no desplacen el menu. Se comprobaron posiciones y medidas iguales de logo, menu y cuenta en las ocho secciones; el menu movil se despliega sin cambiar la altura del header.

## Gestión administrativa de reportes (HU013/HU014)

Con una cuenta cuyo perfil de API tenga rol Administrador, el enlace Reportes del header abre '/app/administracion/reportes'. Incluye todos los reportes, búsqueda por ID/texto/autor/tipo, filtro de estado, contadores, actualización de lista y acceso a evidencia/detalle. Mis reportes conserva el historial personal.

Ver y gestionar abre el detalle con el componente 'editor-estado-reporte': Guardar estado llama PATCH '/api/reportes/admin/{id}/estado' con ACTIVO, EN_PROCESO o LIMPIADO; Marcar como resuelto llama PATCH '/api/reportes/admin/{id}/limpiar'. Los datos compartidos se actualizan solo después de una respuesta exitosa. Los errores conservan el estado anterior. Otras sesiones deben recargar.

El guard administrativo y la interfaz usan el rol devuelto por '/api/usuario/yo'; el backend sigue comprobando ADMINISTRADOR en ambos endpoints. Ciudadanos y sesiones anónimas no acceden a la gestión. No se añadió un permiso de voluntario autorizado, por lo que ese criterio de HU013 sigue pendiente. No se requieren cambios de esquema ni nuevos endpoints para esta pantalla.

P26 del MANUAL-PRUEBAS explica el recorrido desde Angular. Las pruebas adicionales verifican rutas por rol, listado comunitario, contratos PATCH, errores, ausencia de controles ciudadanos y persistencia/autorización de estados con H2.

## Angular Material

La interfaz utiliza Angular Material y CDK 22.2.4: campos, selectores, botones, tarjetas, tablas, ordenamiento/paginación, confirmaciones, notificaciones, calendario, pestañas y paneles de preguntas frecuentes. Cada componente standalone importa sus módulos Material dentro de su carpeta. El tema verde y las dimensiones compartidas de los headers se conservan.

Después de actualizar una copia anterior, detén Angular, ejecuta npm ci y vuelve a iniciar con npm start. No necesitas instalar Angular Material globalmente ni volver a ejecutar ng add.

Consultar ANGULAR-MATERIAL.md para la relación de módulos, carpetas, tema, archivos de configuración y límites de esta migración. El manual incluye los pasos para probar los nuevos controles. Las ocho pruebas adicionales comprueban interacciones Material, cancelación sin borrado, confirmación escrita, fecha local y campos de restablecimiento.


## Actualización de security según el ejemplo de proveedores

- `services/login-service.ts`: LoginService recibe RequestDto, llama a `/authenticate` con `observe: "response"`, obtiene el JWT de la cabecera Authorization y guarda el rol de ResponseDto.
- `model/request-dto.ts` y `model/response-dto.ts`: clases con propiedades declaradas sin inicializador. TrashTracker mantiene `correo` y `contrasena`, que son los campos de su API; no utiliza `username/password` de proveedores.
- `services/session-service.ts`: guarda `token`, `rol` y `roles`. Con Recordarme usa localStorage; sin Recordarme usa sessionStorage. El cierre de sesión y un 401 privado limpian únicamente las claves de TrashTracker.
- `interceptor/login-interceptor.ts`: loginInterceptor está registrado mediante `provideHttpClient(withInterceptors([loginInterceptor]))` en app.config.ts. Omite las rutas públicas y los servidores externos. Un 401 privado lleva a login; un 403 lleva a `/acceso-denegado`, conservando la sesión.
- `guards/auth-guard.ts` y `guards/admin-guard.ts`: guards de clase como en el ejemplo del profesor. Las rutas hijas también comprueban que el token no haya expirado. El rol administrativo se contrasta con el perfil de la API.
- El menú mantiene sus opciones según el rol del perfil. `ROLE_ADMINISTRADOR` y `ROLE_CIUDADANO` son los roles de TrashTracker; no se sustituyen por los roles de proveedores.
- El backend existente ya devuelve y expone Authorization por CORS. Esta actualización no modifica el backend ni requiere cambiar PostgreSQL, copiar tokens manualmente o instalar dependencias nuevas.
- A diferencia del ejemplo, los errores HTTP se vuelven a emitir para que los formularios terminen su estado de carga y muestren el error correspondiente.

Validación de esta actualización: compilación de producción y 44 pruebas frontend aprobadas. Incluyen los contratos existentes, captura del JWT de la cabecera, rol, Recordarme, 401, 403, ausencia de token en servicios externos y guards. Estas comprobaciones usan el backend HTTP simulado de Angular; no modifican la base personal de PostgreSQL.

## Componentes en español

Se conservan las rutas públicas y privadas, el diseño y los controles Material. Se actualizaron carpetas, nombres de archivo, clases, selectores, imports, carga diferida y pruebas. El componente raíz App conserva el nombre estándar del proyecto.

| Carpeta anterior | Carpeta actual dentro de src/app/componentes | Clase |
|---|---|---|
| achievements | logros | LogrosComponent |
| admin-reports | administracion-reportes | AdministracionReportesComponent |
| auth | autenticacion | AutenticacionComponent |
| community-map | mapa-comunitario | MapaComunitarioComponent |
| confirmation-dialog | dialogo-confirmacion | DialogoConfirmacionComponent |
| cta | llamada-accion | LlamadaAccionComponent |
| dashboard | inicio | InicioComponent |
| event-create | evento-nuevo | EventoNuevoComponent |
| event-detail | evento-detalle | EventoDetalleComponent |
| events | eventos | EventosComponent |
| faq | preguntas-frecuentes | PreguntasFrecuentesComponent |
| footer | pie-pagina | PiePaginaComponent |
| group-detail | grupo-detalle | GrupoDetalleComponent |
| groups | grupos | GruposComponent |
| header | encabezado | EncabezadoComponent |
| hero | presentacion | PresentacionComponent |
| how-it-works | funcionamiento | FuncionamientoComponent |
| impact-map | mapa-impacto | MapaImpactoComponent |
| landing | pagina-principal | PaginaPrincipalComponent |
| my-reports | mis-reportes | MisReportesComponent |
| not-found | pagina-no-encontrada | PaginaNoEncontradaComponent |
| problem | problema | ProblemaComponent |
| profile | perfil | PerfilComponent |
| report-create | reporte-nuevo | ReporteNuevoComponent |
| report-detail | reporte-detalle | ReporteDetalleComponent |
| report-map | mapa-reporte | MapaReporteComponent |
| report-status-editor | editor-estado-reporte | EditorEstadoReporteComponent |
| reward-catalog | catalogo-recompensas | CatalogoRecompensasComponent |
| rewards | recompensas | RecompensasComponent |
| team | equipo | EquipoComponent |
| testimonials | testimonios | TestimoniosComponent |
| video | video | VideoComponent |
| workspace | panel-aplicacion | PanelAplicacionComponent |
| — | acceso-denegado | AccesoDenegadoComponent |
