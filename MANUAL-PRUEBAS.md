# Manual de pruebas de TrashTracker

Versión revisada: 18/11/2026. Punto de partida: ya registraste tu cuenta y pudiste iniciar sesión.

Este manual sirve para ejecutar y registrar pruebas. No certifica resultados que aún no has comprobado. Cada caso comienza **Pendiente**. Que una función responda correctamente no significa que la historia de usuario esté completa: se indican sus brechas conocidas.

## 1. Preparación

- Mantén el backend ejecutándose en `http://localhost:8088` y Angular en `http://localhost:4200`. La conexión PostgreSQL se configura en `application.properties`; no necesitas `.env`.
- **Cuenta A:** la cuenta que acabas de crear. Consérvala durante todo el recorrido.
- **Cuenta B:** otra cuenta de prueba para comprobar reportes comunitarios, chat y asistencia. Ábrela en incógnito u otro perfil del navegador. Dos pestañas normales pueden compartir almacenamiento.
- **Cuenta C:** descartable, exclusiva para probar eliminación de cuenta. No elimines A ni una cuenta personal.
- **Administrador:** cuenta con rol global Administrador ya existente, necesaria para acreditar puntos, conceder logros y cambiar estados administrativos. Registrar una cuenta desde Angular crea un Ciudadano.
- Prepara una foto JPG/PNG pequeña, preferiblemente menor de 2 MB. Para casos negativos puedes usar una imagen mayor de 10 MB y un archivo de otro formato.
- Para algunos casos necesitas tipos de residuo, grupos, eventos futuros y catálogo de recompensas/logros. Si faltan, usa los apéndices R01–R05 o pide su preparación al integrante responsable del backend. No inventes IDs ni contraseñas de cuentas precargadas.
- Una cuenta nueva puede empezar sin reportes, puntos, membresías ni logros. Eso no indica que el registro falló.
- Guarda las evidencias antes de eliminar datos. Los casos reutilizan el reporte, grupo y evento creados.

## 2. Registro de resultados

| Resultado | Cuándo usarlo |
|---|---|
| Pendiente | Todavía no ejecutaste el caso. |
| OK funcional | La parte implementada coincide con los resultados esperados del caso. No elimina las brechas de HU indicadas. |
| Falló | Cumplías las precondiciones y el resultado contradice lo esperado. |
| Bloqueado | Falta rol, dato, dispositivo, conexión o configuración. Indica cuál. |

Registra por caso: fecha, cuenta/rol, IDs utilizados, resultado esperado, resultado observado y evidencia. No incluyas tokens ni contraseñas en las capturas.

## 3. Orden recomendado

Como ya estás dentro de la aplicación:

1. P01–P04 con A: navegación y primer reporte.
2. P05 para preparar B; P06–P14 para mapa, perfil y comunidad.
3. P15–P18 para eventos y asistencia.
4. P19–P21 si cuentas con administrador para preparar saldo/logros.
5. P22–P23 para sesión y recuperación.
6. P26 para gestión administrativa desde Angular; P27 para comprobaciones de nivel mediante API.
7. P28 para persistencia general.
8. P24–P25 al final: eliminación del reporte y de C.

R01–R05 son apéndices de preparación/verificación. No necesitas usar Swagger en cada paso ni copiar sus tokens a Angular.

## 4. Casos de prueba

### Controles de Angular Material

Esta versión utiliza Angular Material. Si actualizas una copia anterior, detén Angular, ejecuta npm ci en la carpeta del frontend y vuelve a ejecutar npm start. El backend se inicia como antes.

- En P04/P06/P07/P11/P12/P14/P26, abre el selector y elige una opción. También puedes usar Tab, flechas, Enter y Escape. Los selectores Material muestran sus opciones en un panel superpuesto.
- En Mis reportes y Gestión de reportes, pulsa una cabecera para ordenar; otra pulsación invierte el orden. Cambia Reportes por página y usa las flechas para recorrer resultados. Los filtros se aplican a todos los registros cargados, antes de paginar, y vuelven a la primera página. En móvil, desliza horizontalmente dentro de la tabla si no caben las columnas.
- En P15, elige la fecha desde el botón Abrir calendario. Revisa el mes y selecciona el día; las fechas anteriores a hoy están deshabilitadas. La fecha guardada debe coincidir con el día elegido.
- En grupos, usa las pestañas Información y eventos, Chat del grupo y Miembros y roles. En Eventos y Logros, utiliza los botones de categoría.
- En P20/P24/P25, las confirmaciones aparecen en un diálogo Material. Comprueba que Cancelar o Escape cierra el diálogo y conserva los datos. Después vuelve a abrirlo para realizar la operación prevista en cada caso. Eliminar cuenta sigue exigiendo escribir ELIMINAR exactamente.
- En P11/P20/P24, el éxito puede mostrarse también como un aviso breve. Revisa los datos y recarga para comprobar persistencia; no uses solo el aviso como evidencia.
- La campana abre un menú Material: comprueba el contenido, ciérralo con Escape y verifica que puedes seguir navegando. Las preguntas frecuentes de la landing se despliegan con paneles Material.

El uso de Material no modifica la autorización ni las operaciones de la API. Los mapas siguen utilizando Leaflet y los archivos se seleccionan con el control nativo del navegador.



### Comprobar el security del ejemplo de clase

- En P22, vuelve a entrar con Recordarme desactivado. La sesión debe funcionar al cambiar de sección y recargar la pestaña. Repite con Recordarme activado: al cerrar y abrir el navegador, dentro de la vigencia del JWT, debe recuperarse la sesión.
- No pegues ningún token en el código. LoginService lo recibe automáticamente de la cabecera Authorization del backend; el interceptor lo envía como Bearer en las peticiones privadas.
- En P22, tras cerrar sesión, intenta abrir directamente cualquier ruta `/app/...`: debe pedir login. La misma comprobación se realiza al cambiar de sección si el token ya expiró.
- En P26, una cuenta ciudadana que intenta abrir gestión administrativa debe ver Acceso denegado. Debe poder volver al inicio sin perder su sesión. Un rechazo 403 del servidor también abre esa pantalla; un 401 privado lleva al login.
- Una contraseña incorrecta debe mostrar el error del login, sin confundirse con una sesión que expiró.

### P01 · Comprobar tu cuenta y navegar

**Historias:** HU002. **Cuenta:** A. **Antes:** ya iniciaste sesión.

1. Comprueba tu nombre en el header y en Inicio.
2. Recorre Reportes, Mapa, Grupos, Eventos, Recompensas, Logros y Mi perfil.
3. Recarga una pantalla privada con F5. Si la sesión expiró, vuelve a entrar.

**Esperado:** se mantiene tu identidad y las pantallas cargan sin errores de conexión. Es válido que una cuenta nueva tenga listas vacías y cero puntos.

**Alcance:** el dashboard muestra cuatro tarjetas de resumen, tus reportes recientes con fotografías y estados, accesos rápidos y barra de nivel. Comprueba que las cifras correspondan a tu cuenta y que los enlaces abran la pantalla indicada. El panel de estadísticas personales de HU049 se encuentra en Mi perfil (P27).

**Registro:** Pendiente · Observado: __________ · Evidencia: __________

### P02 · Crear un reporte con foto y ubicación

**Historias:** HU021, HU022, HU023, HU026. **Cuenta:** A. **Antes:** foto válida y tipos de residuo disponibles en la API.

1. Entra en Reportes → Crear reporte y adjunta una foto. En un móvil compatible prueba la captura de cámara; en escritorio puedes elegir un archivo.
2. Pulsa Usar mi ubicación y concede permiso. Si no tienes geolocalización, pulsa en el mapa o introduce latitud `-12.0464` y longitud `-77.0428` para probar la selección manual.
3. Selecciona un tipo de residuo. Escribe en descripción: `PRUEBA-A-01 — Residuos junto al parque`.
4. Anota la hora aproximada y pulsa Guardar reporte una sola vez.
5. Anota el ID de la URL `/app/reportes/ID`. Revisa foto, descripción, tipo, autor, coordenadas, estado y fecha/hora.
6. Pulsa F5 y comprueba los mismos datos.

**Esperado:** el reporte pertenece a A, está Activo y conserva foto/coordenadas. La fecha/hora la asigna el servidor y es coherente con el envío. Registro y foto sobreviven a F5.

**Alcance:** el título visible se obtiene de la primera línea de la descripción; no se guardan título/dirección/distrito como campos independientes. Elegir un archivo no demuestra captura de cámara. Usa una imagen pequeña en el primer caso positivo: el límite multipart total del backend es 10 MB y puede rechazar archivos al borde de ese tamaño.

**Registro:** Pendiente · ID: __________ · Observado/evidencia: __________

### P03 · Rechazar datos inválidos del reporte

**Historias:** HU021, HU022, HU026. **Cuenta:** A. **Antes:** anota el total de tus reportes.

1. Intenta guardar sin fotografía.
2. Con foto válida, intenta guardar descripción vacía o solo espacios.
3. Prueba latitud `91` y longitud `181`.
4. Si el selector permite elegirlos, prueba otro formato y una imagen mayor de 10 MB.
5. Vuelve al historial sin completar un formulario válido.

**Esperado:** no aparecen registros nuevos por estos intentos. Se rechazan los datos/archivos inválidos y no se anuncia éxito.

**Registro:** Pendiente · Observado/evidencia: __________

### P04 · Historial propio y detalle

**Historias:** HU024, HU015. **Cuenta:** A. **Antes:** P02 completada.

1. En Reportes localiza `PRUEBA-A-01`.
2. Selecciona Activo y después Todos los estados.
3. Pulsa Ver y compara foto, descripción, tipo, fecha/hora, responsable, coordenadas y estado.
4. Recarga listado y detalle.

**Esperado:** el historial es propio, los filtros respetan el estado y el detalle corresponde al registro seleccionado también después de recargar. Un filtro Resuelto vacío es normal si no tienes reportes resueltos.

**Registro:** Pendiente · Observado/evidencia: __________

### P05 · Crear B y validar registro/login

**Historias:** HU001, HU002. **Cuenta:** B en incógnito u otro perfil. **Antes:** A permanece abierta en su ventana.

1. Abre Registro. Usa otro correo de prueba, por ejemplo `pruebas.b@example.com`, nombre `Vecino B` y una contraseña de al menos ocho caracteres.
2. Antes de crear B, prueba correo inválido y contraseñas de confirmación diferentes: el formulario no debe aceptarse.
3. Completa datos válidos y crea B. El registro debe llevar al login.
4. Intenta entrar con contraseña errónea; luego usa la correcta.
5. En una ventana sin sesión vuelve a intentar registrar el correo de B para comprobar duplicados.

**Esperado:** registro válido y login correcto funcionan; credenciales erróneas y correo duplicado se rechazan. A y B muestran identidades distintas.

**Alcance:** la validación actual exige ocho caracteres, sin combinación obligatoria de mayúsculas/minúsculas/números. Si contraseña segura exige mayor complejidad en el curso, HU001 sigue parcial.

**Registro:** Pendiente · Observado/evidencia: __________

### P06 · Mapa comunitario, marcadores y desplazamiento

**Historias:** HU011, HU015, HU016, HU017, HU025. **Cuentas:** A y B. **Antes:** B crea `PRUEBA-B-01` siguiendo P02 en otras coordenadas y, si es posible, otro tipo de residuo.

1. Con A abre `/app/mapa`. Recarga si ya estaba abierto antes de crear el reporte de B.
2. Localiza los reportes A/B en marcadores o lista lateral. Pulsa marcador → Ver detalle y comprueba los autores.
3. Prueba los controles de zoom y arrastra el mapa.
4. Revisa la leyenda: Activo rojo, En proceso amarillo y Resuelto verde. Usa P26 para preparar estados si hace falta.
5. En Reportes de A comprueba que el reporte de B no esté en el historial propio.

**Esperado:** el mapa privado muestra reportes de distintos usuarios con autores correctos. Zoom/desplazamiento responden sin navegar a otra página; colores y leyenda coinciden. El historial propio no se mezcla con el comunitario.

**Alcance:** el mapa de la landing pública es ilustrativo; no sirve como evidencia de esta integración. El fondo de OpenStreetMap necesita internet.

**Registro:** Pendiente · Observado/evidencia: __________

### P07 · Filtros por residuo y estado

**Historias:** HU012, HU016. **Cuenta:** A. **Antes:** reportes de dos tipos; P26 para estados adicionales.

1. En Mapa selecciona el tipo del reporte A y comprueba lista y marcadores.
2. Restablece Todos los residuos y prueba los estados.
3. Combina tipo/estado y busca una combinación sin coincidencias.
4. Al terminar vacía búsqueda y filtros.

**Esperado:** solo aparecen coincidencias. Un filtro vacío no conserva marcadores de resultados anteriores.

**Registro:** Pendiente · Observado/evidencia: __________

### P08 · Búsqueda y brecha de dirección/distrito

**Historia:** HU018. **Cuenta:** A. **Antes:** existe `PRUEBA-A-01`.

1. Sin otros filtros, busca `PRUEBA-A-01` en Mapa.
2. Comprueba que centra el resultado. Después busca una palabra inexistente.
3. Contrasta la búsqueda disponible con buscar por dirección/distrito.

**Esperado de la función actual:** encuentra texto de descripciones/coordenadas cargadas e informa cuando no hay coincidencias.

**Alcance:** HU018 no se aprueba completa: no hay geocodificación, búsqueda por cercanía ni dirección/distrito estructurados. Encontrar una descripción que mencione San Miguel no equivale al criterio completo.

**Registro:** Pendiente · Observado/evidencia: __________

### P09 · Ubicación y permisos

**Historias:** HU020, HU026. **Cuenta:** A. **Antes:** navegador con geolocalización; la precisión en computadora puede ser limitada.

1. En Mapa pulsa Mi ubicación, concede permiso y comprueba el centrado aproximado.
2. En Crear reporte pulsa Usar mi ubicación y revisa latitud/longitud.
3. Cambia temporalmente el permiso de ubicación de localhost a Bloquear y vuelve a solicitarla.
4. Comprueba que puedas continuar seleccionando coordenadas manualmente y restablece el permiso.

**Esperado:** con permiso se obtiene posición; al denegarlo aparece un mensaje y la alternativa manual funciona.

**Alcance:** si el equipo no consigue posición, registra Bloqueado por entorno. Una selección manual no acredita detección automática.

**Registro:** Pendiente · Observado/evidencia: __________

### P10 · Confirmación de reporte

**Historia:** HU030. **Cuenta:** A. **Antes:** reporte guardado por A.

1. Abre la campana y busca la confirmación con el número de tu reporte.
2. Pulsa el aviso y comprueba el detalle asociado.
3. Recarga y vuelve a abrir la campana.

**Esperado:** aviso persistido que confirma un reporte existente y enlaza el ID correcto.

**Alcance:** guardar y generar confirmación son llamadas separadas. Si el reporte existe y el aviso falta, registra fallo de HU030, no del guardado. La campana aún no distingue leídos/no leídos.

**Registro:** Pendiente · Observado/evidencia: __________

### P11 · Editar nombre, apodo y fotografía del perfil

**Historia:** HU004. **Cuenta:** A. **Antes:** backend actualizado y una imagen JPG/PNG de hasta 10 MB.

1. En Mi perfil cambia el nombre a `Usuario A Pruebas`, escribe `EcoVecino` como apodo y selecciona un idioma.
2. Selecciona una fotografía: revisa la vista previa y pulsa Guardar cambios.
3. Comprueba el nombre y fotografía del header y el apodo en el resumen del perfil. Recarga; después cierra sesión y vuelve a entrar: los datos deben mantenerse.
4. Guarda otro apodo sin seleccionar foto: la fotografía actual debe conservarse. Borra el apodo y guarda: queda vacío, porque es opcional.
5. Selecciona otra foto y pulsa Restablecer: se descarta la selección sin cambiar los datos guardados. Repite y guarda para sustituir la foto anterior.
6. Prueba nombre vacío, apodo de más de 40 caracteres desde la API y archivo de texto renombrado a PNG: deben rechazarse sin cambios parciales. La pantalla limita nombre a 80 y apodo a 40 caracteres.
7. Con otra cuenta B confirma que su perfil no cambió. El endpoint de guardado obtiene el usuario del JWT, no de un ID enviado por el formulario.

**Esperado:** nombre, apodo, idioma y foto persistidos. La fotografía se guarda al pulsar Guardar cambios, se muestra en el perfil y en el header, y se conserva al editar solo el texto.

**Alcance:** edición implementada; pendiente validación manual en tu entorno. El apodo es opcional y no sustituye el nombre completo. La imagen anterior se elimina del almacenamiento tras confirmar su sustitución. Guardar idioma no demuestra traducción de la interfaz.

**Registro:** Pendiente · Observado/evidencia: __________

### P12 · Buscar grupos y unirse

**Historia:** HU031. **Cuentas:** A/B. **Antes:** un grupo existente. Si falta, prepara uno con A mediante R02 y prueba la unión con B.

1. En Grupos busca por nombre y filtra Distrito, que corresponde a zona de la API.
2. Con una cuenta no miembro abre el detalle y Chat: debe solicitar membresía.
3. Pulsa Unirme al grupo y comprueba aviso, rol y total de integrantes.
4. Recarga; no debe ofrecer otra alta como si no fueras miembro.

**Esperado:** membresía y conteo persistidos; el chat queda habilitado.

**Alcance:** HU031 es parcial: filtro por zona, sin distancias ni recomendaciones GPS. No hay pantalla Crear grupo; R02 es preparación por API.

**Registro:** Pendiente · Observado/evidencia: __________

### P13 · Chat en tiempo real entre dos miembros

**Historia:** HU032. **Cuentas:** A/B, miembros del mismo grupo. **Antes:** ventanas/perfiles separados.

1. A envía `PRUEBA-CHAT-A-01` en Chat del grupo.
2. Sin recargar ni pulsar botones de actualización, B debe recibirlo y responder `PRUEBA-CHAT-B-01`.
3. A recibe automáticamente la respuesta. Comprueba autores, textos, horas y que el mensaje propio no aparezca duplicado. El botón «Actualizar mensajes» ya no existe.
4. Recarga el detalle y prueba enviar solo espacios: el historial persiste y el texto vacío no se envía.
5. Corta temporalmente la conexión de B, envía otro mensaje con A y restaura B. El chat se reconecta y recupera los mensajes perdidos sin duplicados. El borrador no se borra por un corte.
6. Abre un grupo distinto con una tercera cuenta: no debe recibir los mensajes del primero. Un usuario no miembro no puede abrir la conexión ni leer el chat.
7. Cierra sesión o retira la membresía de un usuario conectado: la conexión deja de recibir mensajes privados. No se debe cerrar la sesión completa solo por perder acceso al grupo.

**Esperado:** entrega automática tras guardar en la base de datos, sin recarga manual. Reintentos/reconexiones no duplican mensajes en pantalla; los permisos se mantienen.

**Alcance:** recepción mediante conexión persistente SSE con JWT en Authorization; envío mediante REST. El backend publica después de confirmar la transacción y verifica membresía/sesión antes de entregar, además de latidos cada 15 segundos. Los latidos no son consultas periódicas de mensajes. La conexión se renueva al minuto y el cliente reintenta cortes con espera de 1 a 10 segundos, recuperando el historial al conectar. La difusión funciona dentro de una instancia del backend; varias réplicas requerirían un intermediario compartido.

**Registro:** Pendiente · Observado/evidencia: __________

### P14 · Roles y permisos

**Historia:** HU037. **Cuenta:** A organizador; B miembro. **Antes:** A creador/organizador; preparar R02 si hace falta.

1. Con A abre Miembros y roles. Cambia B a Moderador y recarga ambas cuentas.
2. Cambia B a Organizador; con B recarga y comprueba Crear evento.
3. Devuelve B a Miembro y verifica que pierda ese permiso al recargar.
4. Con una cuenta miembro comprueba que no aparezcan selectores para administrar roles.
5. Si solo hay un organizador, intenta quitarle ese rol: debe rechazarse.

**Esperado:** cambios persistidos, permisos coherentes y protección del último organizador.

**Alcance:** Organizador del grupo y Administrador global son roles distintos.

**Registro:** Pendiente · Observado/evidencia: __________

### P15 · Crear evento

**Historia:** HU033. **Cuenta:** A organizador. **Antes:** fecha futura, preferiblemente mañana o posterior.

1. En Eventos pulsa Crear evento.
2. Elige grupo, fecha, hora `09:30` y punto de encuentro `PRUEBA-EVENTO-01 — Parque central`.
3. Prueba primero campos vacíos (incluida la hora) y una fecha pasada. Corrige y pulsa Publicar evento.
4. Anota ID y comprueba fecha/hora en detalle, listado y eventos del grupo; recarga y verifica que sigue mostrando `09:30`. Comprueba también el próximo evento en Inicio si corresponde.

**Esperado:** datos obligatorios/fecha pasada se rechazan; el evento válido conserva fecha, hora, grupo y ubicación. La API rechaza altas y actualizaciones sin hora. Al reiniciar el backend, los eventos anteriores sin hora reciben `09:00`; las horas ya registradas se conservan.

**Alcance:** fecha, hora de inicio y lugar implementados. La hora es local, sin conversión de huso horario ni hora de fin. El título se deriva del grupo; no hay nombre/descripción independientes. La finalización sigue siendo al terminar el día del evento.

**Registro:** Pendiente · ID: __________ · Observado/evidencia: __________

### P16 · Asistencia y conteo

**Historia:** HU034. **Cuenta:** B. **Antes:** evento futuro de P15; anota total inicial.

1. B pulsa Inscribirme.
2. Comprueba confirmación y botón deshabilitado. Recarga.
3. A recarga el evento y consulta el total.
4. B vuelve a entrar: no debe incrementarse una segunda vez.

**Esperado:** la confirmación persiste y aumenta el total una sola vez por B; el organizador lo ve al recargar.

**Alcance:** intención de asistir no equivale a acreditación de presencia física.

**Registro:** Pendiente · Observado/evidencia: __________

### P17 · Aviso de evento

**Historia:** HU035. **Cuentas:** A organizador y B miembro distinto de A. **Antes:** B ya pertenece al grupo antes de crear el nuevo evento.

1. A publica un evento con grupo, fecha, hora y punto de encuentro (P15). No existe el botón «Avisar al grupo» ni hace falta una segunda acción.
2. B mantiene la aplicación visible: la campana debe actualizarse en aproximadamente 15 segundos; volver al foco o abrirla también consulta las notificaciones.
3. Comprueba grupo, lugar, fecha y hora. Al pulsar el aviso debe abrirse el detalle del evento recién creado.
4. Recarga la aplicación y vuelve a abrir la campana: no debe aparecer más de un aviso para B por ese evento. A no recibe un aviso de su propio evento; una cuenta que no sea miembro tampoco lo recibe.
5. Como comprobación de compatibilidad, un organizador o administrador puede repetir `POST /api/evento/ID/notificar` desde Swagger: si todos los miembros actuales ya fueron notificados, devuelve cero avisos nuevos y no duplica ni reinicia los estados de lectura. Angular no utiliza esa ruta.

**Esperado:** el aviso interno se guarda automáticamente junto con el evento, una vez por destinatario/evento/tipo. Si se revierte la creación, no quedan avisos de un evento inexistente.

**Alcance:** avisos internos en la campana para los miembros presentes al crear, excepto el organizador. La consulta de notificaciones es periódica, no un canal push del sistema operativo. El endpoint antiguo se conserva solo por compatibilidad y puede generar avisos faltantes para miembros actuales, sin repetir los ya guardados con referencia al evento. Los avisos históricos sin eventoId mantienen su enlace al listado, sin inferir una asociación por su texto. Los nuevos incluyen el ID y abren el detalle.

**Registro:** Pendiente · Observado/evidencia: __________

### P18 · Fotos después de finalizar la jornada

**Historia:** HU039. **Cuenta:** miembro del grupo o participante con inscripción confirmada. **Antes:** evento pasado y una imagen JPG/PNG pequeña. Puedes preparar el evento siguiendo R06.

1. Abre el detalle del evento finalizado y pulsa Subir fotografía.
2. Adjunta una imagen y comprueba que aparece en Fotos de la jornada.
3. Recarga y consulta con otra cuenta autorizada: la imagen debe seguir visible.
4. Repite con un participante inscrito que no sea miembro del grupo: también puede subir.
5. Con una cuenta ajena al grupo y sin inscripción confirmada, comprueba que no se ofrece la subida; un envío directo a la API debe ser rechazado.
6. Comprueba que un miembro conserva la posibilidad de subir a un evento actual o futuro.

**Esperado:** fotografías persistidas y visibles después de finalizar. La fecha ya no bloquea la subida; se mantienen los permisos y la validación de archivos.

**Alcance:** implementado en frontend y backend; pendiente de validación manual en tu entorno. Si falta un evento pasado, registra la comprobación Bloqueada por datos hasta prepararlo.

**Registro:** Pendiente · Observado/evidencia: __________

### P19 · Saldo, acreditación y nivel

**Historias:** HU041, HU046. **Cuentas:** A y Administrador. **Antes:** registrar el saldo inicial de A y crear un reporte propio con estado Activo.

1. En Recompensas anota saldo e historial.
2. Comprueba que crear el reporte o confirmar asistencia no añada puntos por sí solo.
3. El administrador marca el reporte de A como Resuelto. Sin recargar, A deja abierta Recompensas: en un máximo aproximado de 15 segundos debe aparecer saldo inicial + 50 y un movimiento «Reporte #ID resuelto y validado por administración». También puede volver al foco de la ventana para consultar de inmediato.
4. El administrador repite la operación por API y reabre el reporte para resolverlo de nuevo: el saldo no aumenta y sigue existiendo un solo movimiento por ese reporte.
5. Valida un segundo reporte de A: ahora se suman otros 50 puntos. Recarga o cierra/inicia sesión y verifica la persistencia.

**Esperado:** cada reporte validado acredita exactamente 50 puntos al autor, deja un solo movimiento y actualiza nivel según el saldo. Reintentos y reaperturas no vuelven a acreditar. La interfaz consulta el saldo/historial al abrir el panel, cada 15 segundos mientras está visible y al volver al foco.

**Alcance:** HU041 aplica la regla acordada: 50 puntos al autor por reporte validado como Resuelto por un administrador, una sola vez, incluso con reintentos o reaperturas. No se acreditan puntos retroactivamente al arrancar ni por inscribirse a eventos. Los reportes antiguos sin marcador pueden recibir su primera acreditación al volver a validarlos explícitamente. HU046 actualiza el nivel al acreditar, pero el recálculo tras canjes continúa pendiente. Los logros con reglas configuradas se evalúan automáticamente (P21).

**Registro:** Pendiente · Saldo anterior/posterior: __________ · Evidencia: __________

### P20 · Canje y cancelación

**Historia:** HU042. **Cuenta:** A. **Antes:** producto con stock/costo positivo y saldo suficiente, preparado con R03.

1. Antes de preparar saldo, si no alcanza, revisa Puntos insuficientes. Si hay un producto sin stock, debe indicar Agotado.
2. Con saldo suficiente anota saldo S, costo C y stock Q.
3. Pulsa Canjear recompensa y Cancelar: los valores deben permanecer iguales.
4. Confirma un canje una sola vez.
5. Comprueba saldo S−C, stock Q−1, una fila en Historial de canjes y un movimiento negativo.
6. Recarga, cierra sesión y vuelve a entrar para comprobar persistencia.

**Esperado:** cancelar no modifica datos; confirmar produce un único descuento y una unidad menos, con registros persistidos. Sin saldo/stock no debe aparecer éxito.

**Alcance:** el costo histórico se comprueba en el movimiento de puntos. Sin saldo o stock, registra Bloqueado por datos para la prueba positiva, no OK.

**Registro:** Pendiente · S/C/Q: __________ · Observado/evidencia: __________

### P21 · Desbloqueo automático y consulta de logros

**Historia:** HU048. **Cuentas:** A; Administrador para resolver un reporte y organizador para verificar presencia. **Antes:** catálogo configurado; usar una cuenta nueva sin concesiones manuales para demostrar los criterios.

1. En Logros prueba Todos, Desbloqueados y Por desbloquear.
2. A publica su primer reporte: se obtiene «Primer Reporte». Comprueba el estado en Logros; usa «Actualizar logros» si hace falta. No uses R04 para acreditar esta prueba.
3. A completa diez reportes persistidos: el décimo desbloquea «10 Reportes»; con nueve no debe concederse.
4. Un administrador resuelve un reporte de A: se obtiene «Reciclador Novato», bajo la regla provisional de un reporte resuelto. Este criterio concreta una descripción ambigua del catálogo y debe confirmarse con el Product Backlog.
5. A se inscribe a un evento: eso no desbloquea «Asistente de Evento». Después de finalizar la jornada, el organizador valida presencia (P27/R06): ahora sí se concede.
6. Deja la pestaña visible: la consulta periódica de 15 segundos debe reflejar concesiones de otra sesión. Los nuevos desbloqueos conocidos muestran un aviso en Logros.
7. Repite resolución, validación y «Actualizar logros»: no deben crearse concesiones duplicadas. Cierra e inicia sesión para comprobar persistencia.

**Esperado:** el backend comprueba los datos reales y guarda fecha de obtención una sola vez. Angular solo presenta las concesiones confirmadas por la API; los filtros se actualizan.

**Alcance:** se soportan reglas explícitas de cantidad de reportes publicados, reportes resueltos y asistencias verificadas. Los textos libres no se interpretan: un logro sin regla sigue siendo manual. Las concesiones son permanentes, aunque después se borren reportes, se reabran o se corrija una presencia. «Actualizar logros» solicita una reevaluación de los hechos existentes del propio usuario; no permite enviar contadores o elegir el usuario. R04 conserva su utilidad administrativa pero no demuestra automatización.

**Registro:** Pendiente · Observado/evidencia: __________

### P22 · Cierre de sesión y acceso privado

**Historias:** HU006, HU002. **Cuenta:** A. **Antes:** guarda evidencias; aún no elimines la cuenta.

1. Pulsa Cerrar sesión en el header: debe abrir Login.
2. Intenta abrir directamente `/app/reportes` y utiliza Atrás. Recarga si ves una pantalla en caché.
3. Comprueba que exige autenticación y vuelve a iniciar sesión.
4. Opcional: antes de cerrar, conserva solo para la prueba el token exacto de Angular. Después del logout envía `GET /api/usuario/yo` con ese mismo token desde Swagger: espera 401. No uses otro token de un login diferente.

**Esperado:** no se cargan datos privados sin sesión y el token revocado se rechaza en backend.

**Alcance:** el JWT vence en 20 minutos por defecto. Si expira durante el manual, vuelve a entrar. No publiques el token en evidencias.

**Registro:** Pendiente · Observado/evidencia: __________

### P23 · Recuperación y nueva contraseña

**Historia:** HU005. **Cuenta:** B con correo real accesible. **Antes:** SMTP, `app.recovery.from` y `app.recovery.url` HTTPS configurados para el positivo.

1. En Login pulsa ¿Olvidé mi contraseña? y solicita recuperación para B.
2. Si aparece correo no configurado, registra Bloqueado por SMTP: no se envió un enlace.
3. Con entorno preparado, abre el correo y sigue el enlace antes de 15 minutos.
4. Guarda contraseña nueva con mínimo 12 caracteres y máximo 72 bytes UTF-8, con confirmación coincidente.
5. Comprueba acceso con la nueva y rechazo de la anterior.
6. Intenta reutilizar el enlace; debe rechazarse. Un enlace vencido también debe rechazarse.

**Esperado:** recepción real del correo y cambio válido de un solo uso; errores de correo/token no se presentan como éxito.

**Alcance:** Revisa tu correo por sí solo no acredita HU005. Sin SMTP/enlace HTTPS, el recorrido completo queda bloqueado.

**Registro:** Pendiente · Observado/evidencia: __________

### P24 · Eliminar un reporte propio

**Historia:** HU028. **Cuenta:** A. **Antes:** hacer al final y conservar ID/evidencias de un reporte de prueba.

1. En Reportes pulsa Eliminar y Cancelar; debe conservarse.
2. Repite, confirma y recarga Reportes/Mapa.
3. Abre la URL antigua del detalle: no debe mostrarlo como existente.
4. Comprueba que el reporte B sigue disponible. A no tiene el borrado propio de ese registro en el mapa.

**Esperado:** cancelar conserva; confirmar elimina de las consultas y no borra reportes ajenos.

**Alcance:** los avisos históricos pueden persistir y no demuestran que el reporte exista.

**Registro:** Pendiente · Observado/evidencia: __________

### P25 · Eliminar cuenta descartable

**Historia:** HU010. **Cuenta:** C. **Antes:** cuenta creada solo para este caso; no usar A ni una cuenta personal.

1. En Mi perfil → Eliminar cuenta, comprueba que no se habilita confirmar sin escribir exactamente `ELIMINAR`.
2. Cancela y comprueba que C sigue operativa.
3. Repite, escribe ELIMINAR y confirma.
4. Comprueba redirección al login y rechazo de las credenciales de C.
5. Verifica que A/B y sus datos propios siguen disponibles.

**Esperado:** cancelación sin efecto; eliminación permanente que impide nuevos accesos de C y no borra otras cuentas.

**Alcance:** grupos/eventos compartidos pueden transferirse a otro miembro para conservar la comunidad; eliminar cuenta no significa borrar todos los grupos compartidos.

**Registro:** Pendiente · Observado/evidencia: __________

### P26 · Gestionar reportes como administrador en Angular

**Historias:** HU013, HU014, HU016. **Cuentas:** Administrador global y A (ciudadano) en Angular. **Antes:** reporte de A no eliminado y cuenta administradora existente.

1. Inicia sesión como administrador. Pulsa **Reportes** en el header: debe abrir **Gestión de reportes**, con reportes de todos los usuarios, autores y contadores por estado. **Mis reportes** abre por separado los creados por esa cuenta.
2. Busca el reporte de A por título, ID o autor. Prueba el filtro de estado y restablece Todos los estados. Pulsa **Actualizar lista** para obtener nuevamente los datos del servidor.
3. Pulsa **Ver y gestionar**. Revisa foto de evidencia (si existe), descripción, autor, fecha, tipo, coordenadas y mapa.
4. Selecciona **En proceso** en Nuevo estado y pulsa **Guardar estado** una sola vez. Espera **Estado guardado: En proceso.** El estado actual y la etiqueta deben cambiar tras la respuesta de la API. Mientras guarda, los controles se deshabilitan.
5. Vuelve a Gestión de reportes y comprueba filtro/contadores. Recarga la página para comprobar persistencia. En A recarga mapa, detalle e historial: debe aparecer En proceso (amarillo).
6. Como administrador vuelve al detalle y pulsa **Marcar como resuelto**. Espera la confirmación y comprueba Resuelto en lista/detalle y, tras recargar A, en su mapa (verde) e historial. La API almacena este estado como LIMPIADO.
7. Si necesitas restablecer el reporte para otras pruebas, selecciona **Activo** y guarda; comprueba la etiqueta roja tras recargar. También puedes seleccionar Resuelto directamente desde Nuevo estado.
8. Como ciudadano, comprueba que Reportes abre solo el historial propio y que el detalle no muestra controles administrativos. Intenta abrir directamente '/app/administracion/reportes': debe mostrar Acceso denegado. Sin sesión debe pedir iniciar sesión.

**Esperado:** el administrador gestiona reportes ajenos desde Angular y los cambios persisten mediante la API. Si falla el guardado se muestra un error y se conserva el estado anterior; no debe aparecer una confirmación falsa. El backend rechaza los cambios administrativos de ciudadanos aunque intenten llamar la API directamente (403).

**Alcance:** disponible para el rol global Administrador devuelto por la API; no depende del correo de la cuenta. HU013 también menciona voluntario autorizado: ese permiso aún no existe en el backend y no se concede desde esta pantalla. Las demás sesiones necesitan recargar para recibir cambios; no hay actualización en tiempo real. Si acabas de cambiar el rol en la base, cierra sesión e inicia sesión nuevamente.

**Registro:** Pendiente · Observado/evidencia: __________

### P27 · Estadísticas del perfil y asistencia verificada

**Historias:** HU046, HU049. **Cuentas:** A y organizador o Administrador para validar presencia. **Antes:** conocer el ID de A y disponer de una jornada finalizada con inscripción confirmada (R06).

1. Abre Mi perfil y consulta «Mis estadísticas»: reportes realizados, eventos asistidos, EcoPuntos disponibles y nivel. Usa «Actualizar estadísticas» para volver a consultar.
2. Compara `GET /api/usuario/ID_A/estadisticas` con las cifras del panel. Los reportes corresponden a los registros actuales de A, no a reportes de B ni a un total histórico de registros eliminados.
3. Una inscripción confirmada por sí sola no aumenta «Eventos asistidos», aunque su fecha ya haya pasado. Para una prueba reproducible con un evento pasado, consulta R06.
4. El organizador o administrador abre el detalle de una jornada finalizada, pulsa «Consultar participantes» y marca «Marcar asistió» para A. A actualiza sus estadísticas: el total aumenta una vez por evento, incluso si se repite la validación o existen inscripciones duplicadas.
5. El organizador corrige con «Marcar no asistió»: A actualiza y el evento deja de contar. Un participante corriente no ve los controles y no puede validarse por API (403).
6. Comprueba una cuenta nueva: cero reportes y asistencias verificadas; saldo y nivel reales. Un fallo de consulta muestra un error y permite reintentar, sin inventar cifras.

**Esperado:** panel y API muestran datos propios. Solo cuentan eventos finalizados con `asistio=true` y fecha de validación. Se impide validar jornadas futuras y consultar estadísticas de otro usuario.

**Alcance:** la presencia la acredita el organizador o administrador, no una inscripción ni una inferencia automática. Los datos antiguos sin validación no cuentan. Una jornada se considera finalizada al terminar su fecha, ya que no hay hora de fin. Los contadores del perfil se actualizan al entrar o mediante el botón; saldo y nivel también reciben la sincronización del panel. HU046 sigue usando saldo actual, sin garantía de puntos históricos acumulados de por vida.

**Registro:** Pendiente · Observado/evidencia: __________

### P28 · Persistencia general y cierre de pruebas

**Historias:** comprobación transversal. **Cuentas:** A/B. **Antes:** conservar reporte, mensaje y asistencia antes de limpiar datos.

1. Anota IDs/valores, cierra sesión y vuelve a entrar.
2. Comprueba reporte/foto, membresía, conversación, asistencia, saldo y canjes/logros que preparaste.
3. Si puedes reiniciar el backend sin afectar otras pruebas, vuelve a arrancar con la misma base y `ddl-auto=update`, y consulta tus datos.
4. Registra diferencias con caso, esperado, observado y evidencia. Usa Bloqueado cuando falten datos/roles/SMTP.

**Esperado:** datos confirmados sobreviven a recargas, nuevas sesiones y reinicio con la misma base.

**Alcance:** un caso OK no convierte una HU parcial en completa. Este manual no ejecutó el recorrido sobre tu PostgreSQL.

**Registro:** Pendiente · Observado/evidencia: __________

## 5. Apéndices de preparación/verificación con Swagger

### R01 · Autorización e identificadores

Abre `http://localhost:8088/swagger-ui.html`. Ejecuta `POST /api/authenticate` con la cuenta que realizará la operación. Usa `jwt` de la respuesta en Authorize; si el esquema es HTTP Bearer, pega solo el token, sin duplicar Bearer.

```text
POST /api/authenticate
{
  "correo": "CORREO_DE_PRUEBA",
  "contrasena": "CONTRASENA_DE_PRUEBA"
}

GET /api/usuario/yo
```

La segunda ruta da tu `idUsuario`. Sustituye `ID_A`, `ID_REPORTE` e `ID_LOGRO` por IDs reales. Los ejemplos con identificadores simbólicos no son JSON ejecutable hasta reemplazarlos.

Para puntos/logros/estados necesitas una cuenta Administrador existente. El registro Angular no la crea y no existe una pantalla para elevar privilegios. Sin administrador, marca esos casos Bloqueados.

Angular consigue su token automáticamente. Este apoyo con Swagger no exige copiarle tokens al frontend.

### R02 · Grupo con A como organizador

Con token de A ejecuta:

```text
POST /api/grupo/insertar
{
  "nombre": "Grupo de pruebas A y B",
  "zona": "San Miguel"
}

GET /api/grupo/listar
```

Omite `creadorId`: el backend toma al usuario autenticado y lo incorpora como Organizador. Anota `idGrupo`, recarga Grupos con A/B y une a B. Si ya tienes un grupo administrable puedes reutilizarlo.

No presentes esta preparación como una pantalla implementada: Angular aún no tiene Crear grupo.

### R03 · Acreditar saldo con administrador

Obtén el ID de A y el costo de la recompensa. Con administrador ejecuta:

```text
POST /api/historial-puntos/agregar-puntos
{
  "idUsuario": ID_A,
  "puntos": 500,
  "motivo": "PRUEBA-MANUAL: saldo para validar canje"
}
```

500 es un ejemplo: ajusta según catálogo y anota saldo previo. A recarga Recompensas. No uses insertar/modificar del historial para simular saldo: el flujo transaccional es agregar-puntos.

Esta preparación administrativa altera datos reales de prueba. No es necesaria para probar HU041: el flujo automático exige validar un reporte como Resuelto (P19), no simplemente reportar o inscribirse a un evento.

### R04 · Preparar un logro concedido

Consulta un ID real y, con administrador, concede el logro a A. Si el catálogo está vacío, puedes crear el logro de ejemplo primero.

```text
GET /api/logro/listar

POST /api/logro/insertar
{
  "nombre": "Logro de prueba manual",
  "criterio": "Dato de prueba para comprobar visualizacion"
}

POST /api/logro-usuario/usuario/desbloquear-logro
{
  "idUsuario": ID_A,
  "idLogro": ID_LOGRO
}
```

A actualiza Logros. Esta concesión manual no evalúa criterios y no demuestra HU048. Para un nuevo logro automático, el administrador debe configurar campos explícitos, por ejemplo:

```text
POST /api/logro/insertar
{
  "nombre": "Dos reportes publicados",
  "criterio": "Publicar dos reportes en la comunidad",
  "tipoCriterio": "REPORTES_PUBLICADOS",
  "cantidadObjetivo": 2
}
```

Tipos permitidos: `REPORTES_PUBLICADOS`, `REPORTES_RESUELTOS`, `ASISTENCIAS_VERIFICADAS`; la cantidad debe ser positiva. Para reevaluar los datos anteriores, con token de A ejecutar `POST /api/logro-usuario/usuario/evaluar`, sin IDs ni contadores en el cuerpo, o usar «Actualizar logros».

### R05 · Nivel y estadísticas propias

Con token de A:

```text
GET /api/usuario/yo
GET /api/usuario/ID_A/estadisticas
POST /api/usuario/actualizar-nivel/ID_A
```

| Saldo de puntos | Nivel calculado |
|---|---|
| Menos de 100 | 1 |
| 100–299 | 2 |
| 300–599 | 3 |
| 600–999 | 4 |
| Desde 1000 | 5 |

Con 500 puntos y sin saldo previo, la acreditación asigna nivel 3. El cálculo usa saldo actual; no demuestra acumulación histórica de por vida. El dashboard muestra el nivel registrado por el servidor y el progreso hacia su umbral. Mi perfil muestra además el panel de estadísticas personales (P27).

### R06 · Preparar asistencia verificable de una jornada pasada

Puedes utilizar un evento pasado existente donde A tenga inscripción confirmada. Si necesitas crear datos de prueba sin esperar al día siguiente, con token de Administrador:

```text
POST /api/evento/insertar
{"grupoId": ID_GRUPO, "organizadorId": ID_ORGANIZADOR, "fecha": "FECHA_DE_AYER_yyyy-MM-dd", "hora": "09:00", "ubicacion": "PRUEBA-HU049"}

POST /api/asistencia-evento/insertar
{"eventoId": ID_EVENTO_CREADO, "usuarioId": ID_A, "confirmado": true}
```

Sustituye todos los marcadores, incluida la fecha de ayer. A consulta su perfil: la inscripción todavía no cuenta como presencia. Después, con el organizador o Administrador, usa el detalle del evento para validar. También puede probarse por API:

```text
GET /api/evento/ID_EVENTO_CREADO/participantes
PATCH /api/evento/ID_EVENTO_CREADO/asistencia/ID_A?asistio=true
```

Repite con `asistio=false` para corregir. Esta validación no acredita puntos, pero la primera presencia verificada puede desbloquear «Asistente de Evento» según su regla. El logro obtenido es permanente. No se debe marcar presencia ficticia en datos reales; estos pasos preparan únicamente el recorrido de prueba.

El total de eventos cuenta registros de asistencia, no presencia física ni solo jornadas celebradas.

## 6. Matriz de trazabilidad de historias

Se incluyen 35 historias únicas del Product Backlog revisado. HU049 se cuenta una vez aunque el documento la repita. Esta matriz no reasigna historias a Sprints ni sustituye las tablas del informe. Cobertura de implementación y resultados de ejecución se registran por separado.

| HU | Historia | Casos | Cobertura actual | Verificación / brecha |
|---|---|---|---|---|
| HU001 | Registro seguro | P05 | Parcial | Registro/duplicados; contraseña mínima sin complejidad. |
| HU002 | Inicio de sesión | P01, P05, P22 | Disponible | Credenciales y sesión. |
| HU004 | Nombre, apodo y foto | P11 | Implementado; pendiente validación manual | Edición con vista previa y persistencia; fotografía en perfil y header. |
| HU005 | Recuperación por correo | P23 | Condicionada | Requiere SMTP y enlace HTTPS. |
| HU006 | Cerrar sesión | P22 | Disponible | Revocación y salida. |
| HU010 | Eliminar cuenta | P25 | Disponible | Cuenta propia descartable. |
| HU011 | Mapa interactivo | P06 | Disponible | Mapa privado de reportes reales. |
| HU012 | Filtro por residuo | P07 | Disponible | Filtro de registros cargados. |
| HU013 | Marcar limpiada | P26 | Disponible para administrador / parcial | Pantalla y API; pendiente permiso de voluntario autorizado. |
| HU014 | Actualizar estado | P26 | Disponible | Gestión en Angular, persistencia y autorización en API. |
| HU015 | Detalle de marcador | P04, P06 | Disponible | Foto, tipo, autor, fecha y estado. |
| HU016 | Leyenda y colores | P06, P07, P26 | Disponible | Activo/En proceso/Resuelto. |
| HU017 | Zoom/desplazamiento | P06 | Disponible | Interacción sin navegar. |
| HU018 | Buscar dirección/distrito | P08 | Parcial | Texto local, sin geocodificación/cercanía. |
| HU020 | Mi ubicación en mapa | P09 | Condicionada | Permiso y navegador. |
| HU021 | Foto como evidencia | P02, P03 | Disponible / cámara condicionada | Subida; captura depende del dispositivo. |
| HU022 | Descripción de reporte | P02, P03 | Disponible | Descripción, tipo y coordenadas. |
| HU023 | Fecha/hora del servidor | P02 | Disponible | Asignada al guardar. |
| HU024 | Historial propio | P04, P06 | Disponible | Solo reportes propios. |
| HU025 | Reportes comunitarios | P06 | Disponible | Contrastar con B. |
| HU026 | Ubicación al reportar | P02, P09 | Condicionada | Automática con permiso previo; botón para solicitar. |
| HU028 | Eliminar reporte propio | P24 | Disponible | Cancelación y borrado. |
| HU030 | Confirmación de reporte | P10 | Disponible | Aviso interno por llamada separada. |
| HU031 | Unirse a grupos cercanos | P12 | Parcial | Membresía/zona, sin distancia GPS. |
| HU032 | Chat en tiempo real | P13 | Implementado; pendiente validación manual | Entrega SSE autenticada, reconexión y recuperación; sin botón de actualización. |
| HU033 | Evento: fecha, hora y lugar | P15 | Implementado; pendiente validación manual | Fecha, hora de inicio y lugar persistidos. |
| HU034 | Confirmar asistencia | P16 | Disponible | Confirmación y total. |
| HU035 | Aviso de nuevo evento | P17 | Implementado; pendiente validación manual | Aviso interno automático al crear, sin botón manual, con enlace al evento y deduplicación. |
| HU037 | Asignar roles | P14 | Disponible con organizador | Permiso del creador/organizador. |
| HU039 | Fotos tras finalizar | P18 | Implementado; pendiente validación manual | Miembros e inscritos confirmados pueden subir también después de la jornada. |
| HU041 | Puntos por acción válida | P19 | Implementado; pendiente validación manual | 50 puntos al autor por reporte resuelto, una sola vez. |
| HU042 | Canjear recompensa | P20 | Condicionada por datos | Saldo suficiente y stock. |
| HU046 | Nivel por puntos acumulados | P01, P19, P27 | Parcial | Dashboard con nivel/progreso; cálculo por saldo y recálculo tras canjes pendiente. |
| HU048 | Desbloqueo de logros | P21 | Implementado con reglas explícitas; pendiente validación manual | Automatismos por reportes/presencias; confirmar criterio provisional de Reciclador Novato. |
| HU049 | Estadísticas personales | P27 | Implementado; pendiente validación manual | Panel de perfil y presencia verificada en eventos finalizados; conteo distinto por evento. |

## 7. Evidencias e incidencias

- Usa nombres como `P02-reporte-despues-F5.png`.
- Evidencias principales: reporte tras F5, mapa con autores A/B, aviso con ID, chat de ambos, rol, evento/asistencia, saldo antes/después, movimiento de canje y logro concedido.
- Un mensaje de éxito aislado no prueba persistencia; comprueba tras F5 o nuevo login.
- Si algo falla, registra URL, pasos y mensaje. Para apoyo técnico añade método/ruta/estado HTTP de Network (F12), ocultando credenciales/tokens.
- Para aprobar HU004 verifica también apodo, foto y persistencia; HU032 sin verificar la recepción automática entre dos sesiones ni HU039 por subir antes de finalizar.

```text
Caso / HU: __________
Fecha / probador: __________
Cuenta / rol / IDs: __________
Esperado: __________
Observado: __________
Resultado: Pendiente / OK funcional / Falló / Bloqueado
Evidencia / incidencia: __________
```

| Síntoma | Siguiente comprobación |
|---|---|
| No aparece Crear evento | Falta rol Organizador. Preparar R02 o recibirlo en P14. |
| No puedo canjear | Revisar stock/saldo; validar reportes según P19 o preparar R03. Crear un reporte por sí solo no otorga puntos. |
| No llega un mensaje | Comprobar pertenencia al grupo, estado de conexión, backend actualizado y endpoint /api/grupo/ID/mensajes/stream. Al reconectar se recupera el historial. |
| No puedo subir foto a evento pasado | Reinicia el backend actualizado y verifica membresía o inscripción confirmada, formato y tamaño del archivo. La fecha no debe impedirlo. |
| Cambio de estado no visible | Recargar mapa/detalle; no hay consulta continua automática. |
| No llega recuperación | Comprobar respuesta 503/SMTP; requiere correo real y enlace HTTPS. |
| Vuelve a Login | JWT vencido/revocado; iniciar sesión otra vez. |
| 401 / 403 / 404 / 409 | 401 sesión; 403 permiso; 404 ID inexistente; 409 conflicto. Leer mensaje. |
| No conecta la API | Comprobar 8088, Angular 4200 y proxy.conf.json; reiniciar Angular si cambió el proxy. |

## 8. Cierre de revisión

Cuenta casos OK, Fallidos, Bloqueados y Pendientes. Mantén cada HU parcial con su brecha específica aunque la parte disponible funcione. Aprueba una historia solo cuando se cumplan todos sus criterios de aceptación.

Fuentes revisadas: Product Backlog del documento del curso (extracción local en `work/requirements/document-text.txt`), rutas/componentes/servicios del frontend y controladores/servicios/DTO del backend entregado. No se ejecutaron estas pruebas sobre tu PostgreSQL ni se modificaron tus cuentas para elaborar este manual.
