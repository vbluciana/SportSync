## Table `estados_reservas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_estado` | `int4` | Primary |
| `nombre` | `varchar` |  |
| `descripcion` | `varchar` |  Nullable |

## Table `estados_partidos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_estado` | `int4` | Primary |
| `nombre` | `varchar` |  |
| `descripcion` | `varchar` |  Nullable |

## Table `estados_asistencia`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_estado` | `int2` | Primary |
| `nombre` | `varchar` |  |
| `descripcion` | `varchar` |  Nullable |

## Table `notificaciones_push`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_notificacion` | `int4` | Primary Identity |
| `usuario_id` | `uuid` |  |
| `endpoint` | `text` |  Unique |
| `p256dh` | `text` |  |
| `auth` | `text` |  |
| `fecha_creacion` | `timestamptz` |  |
| `leida` | `bool` |  Nullable |

## Table `roles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_rol` | `int2` | Primary Identity |
| `nombre` | `varchar` |  Unique |

## Table `categorias`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_categoria` | `int2` | Primary Identity |
| `nombre` | `varchar` |  Unique |

## Table `ramas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_rama` | `int2` | Primary Identity |
| `nombre` | `varchar` |  Unique |

## Table `estados_canchas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_estado` | `int4` | Primary |
| `nombre` | `varchar` |  |
| `descripcion` | `varchar` |  Nullable |

## Table `planteles`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_plantel` | `int4` | Primary Identity |
| `categoria_id` | `int2` |  |
| `rama_id` | `int2` |  |
| `dt_id` | `uuid` |  |
| `temporada` | `int4` |  |

## Table `usuarios`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_usuario` | `uuid` | Primary |
| `rol_id` | `int2` |  |
| `plantel_id` | `int4` |  Nullable |
| `dni` | `varchar` |  Unique |
| `email` | `varchar` |  Unique |
| `nombre` | `varchar` |  |
| `apellido` | `varchar` |  |
| `telefono` | `varchar` |  Nullable |
| `fecha_creacion` | `timestamptz` |  |
| `estado_activo` | `bool` |  Nullable |
| `categoria` | `text` |  Nullable |

## Table `suscripciones_push`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_notificacion` | `int4` | Primary Identity |
| `usuario_id` | `uuid` |  |
| `endpoint` | `text` |  Unique |
| `p256dh` | `text` |  |
| `auth` | `text` |  |
| `fecha_creacion` | `timestamptz` |  |

## Table `historial_notificaciones`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int4` | Primary Identity |
| `usuario_id` | `uuid` |  |
| `titulo` | `varchar` |  |
| `mensaje` | `varchar` |  |

## Table `canchas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_cancha` | `int2` | Primary |
| `estado_id` | `int4` |  |
| `nombre` | `varchar` |  |
| `tipo` | `varchar` |  |

## Table `reservas`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_reserva` | `int4` | Primary Identity |
| `cancha_id` | `int2` |  |
| `plantel_id` | `int4` |  |
| `dt_id` | `uuid` |  |
| `estado` | `varchar` |  |
| `fecha` | `date` |  |
| `hora_inicio` | `time` |  |
| `hora_fin` | `time` |  |
| `tipo_actividad` | `varchar` |  |

## Table `partidos`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_partido` | `int4` | Primary Identity |
| `plantel_id` | `int4` |  |
| `reserva_id` | `int4` |  Nullable |
| `estado` | `varchar` |  |
| `motivo_cancelacion` | `varchar` |  Nullable |
| `equipo_rival` | `varchar` |  |
| `fecha_hora` | `timestamptz` |  |
| `condicion` | `varchar` |  |
| `direccion_rival` | `varchar` |  Nullable |
| `url_gps` | `text` |  Nullable |

## Table `asistencias_convocatorias`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id_asistencia` | `int4` | Primary Identity |
| `partido_id` | `int4` |  |
| `jugador_id` | `uuid` |  |
| `estado` | `varchar` |  |
| `recordatorio_24h` | `bool` |  Nullable |
| `fecha_respuesta` | `timestamptz` |  Nullable |

