-- ============================================================================
-- Seed de datos de ejemplo para toda la app (clientes, canchas, reservas, pagos)
-- Idempotente: se puede correr varias veces sin duplicar.
-- Ejecutar DESPUÉS de schema.sql (que ya crea tablas, tipos_cliente,
-- configuraciones, el usuario admin y las 3 canchas).
--
-- Credenciales de los clientes de ejemplo: <email> / Admin123
-- (todos comparten el mismo hash bcrypt que el admin, solo para pruebas).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) Usuarios de los clientes (rol 'cliente')
-- ----------------------------------------------------------------------------
INSERT INTO usuarios (email, password_hash, rol) VALUES
  ('juan@example.com',  '$2a$10$2lq8AVakRzeHBPkqqm0IWOnYJUso7rhxMyAycVckznW3HTAozFPha', 'cliente'),
  ('maria@example.com', '$2a$10$2lq8AVakRzeHBPkqqm0IWOnYJUso7rhxMyAycVckznW3HTAozFPha', 'cliente'),
  ('pedro@example.com', '$2a$10$2lq8AVakRzeHBPkqqm0IWOnYJUso7rhxMyAycVckznW3HTAozFPha', 'cliente'),
  ('lucia@example.com', '$2a$10$2lq8AVakRzeHBPkqqm0IWOnYJUso7rhxMyAycVckznW3HTAozFPha', 'cliente'),
  ('diego@example.com', '$2a$10$2lq8AVakRzeHBPkqqm0IWOnYJUso7rhxMyAycVckznW3HTAozFPha', 'cliente')
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2) Clientes (vinculados a su usuario por email; tipos y estados variados)
-- ----------------------------------------------------------------------------
INSERT INTO clientes (usuario_id, nombre, apellido, telefono, email, tipo_cliente_id, estado) VALUES
  ((SELECT id FROM usuarios WHERE email='juan@example.com'),  'Juan',  'Pérez',     '3415550001', 'juan@example.com',  1, 'activo'),
  ((SELECT id FROM usuarios WHERE email='maria@example.com'), 'María', 'González',  '3415550002', 'maria@example.com', 2, 'activo'),
  ((SELECT id FROM usuarios WHERE email='pedro@example.com'), 'Pedro', 'Ramírez',   '3415550003', 'pedro@example.com', 3, 'activo'),
  ((SELECT id FROM usuarios WHERE email='lucia@example.com'), 'Lucía', 'Fernández', '3415550004', 'lucia@example.com', 1, 'suspendido'),
  ((SELECT id FROM usuarios WHERE email='diego@example.com'), 'Diego', 'Sosa',      '3415550005', 'diego@example.com', 1, 'bloqueado')
ON CONFLICT (email) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 3) Canchas (por si schema.sql no se corrió con el seed de canchas)
-- ----------------------------------------------------------------------------
INSERT INTO canchas (nombre, capacidad, precio_por_hora, descripcion, latitud, longitud) VALUES
  ('Cancha 1 - Fútbol 11', 22, 25000.00, 'Césped sintético, iluminación LED', -32.9468, -60.6393),
  ('Cancha 2 - Fútbol 7',  14, 18000.00, 'Césped sintético techado', -32.9612, -60.6505),
  ('Cancha 3 - Fútbol 5',  10, 14000.00, 'Césped sintético, ideal para grupos chicos', -32.9755, -60.6389),
  ('Caballito Norte',            14, 19000.00, 'Fútbol 7, césped sintético — Av. Avellaneda 1423, Caballito', -34.6183, -58.4398),
  ('Escuela de Fútbol Caballito', 10, 15000.00, 'Fútbol 5, techada — Senillosa 824, Caballito', -34.6188, -58.4378),
  ('El Andén Caballito',          10, 16000.00, 'Fútbol 5, mismo predio con canchas de tenis y pádel — Caballito', -34.6165, -58.4415),
  ('Urquiza Fútbol',              10, 17000.00, 'Fútbol 5, 8 canchas — Roosevelt 5170, Villa Urquiza', -34.5682, -58.5012),
  ('Argentina 2000',              10, 15500.00, 'Fútbol 5 — Nahuel Huapi 5891, Villa Urquiza', -34.5732, -58.5055),
  ('El Campito Villa Urquiza',    14, 18500.00, 'Fútbol 7, césped sintético — Olazábal 5247, Villa Urquiza', -34.5766, -58.4992),
  ('Círculo Penacho Azul',        10, 16500.00, 'Fútbol 5, club de barrio — Tamborini 5676, Villa Urquiza', -34.5717, -58.5042),
  ('Lacroze & Thomas',            14, 20000.00, 'Fútbol 7, techada, piso de goma — Av. Lacroze 3547, Chacarita', -34.5877, -58.4538),
  ('Complejo Chacarita',          10, 17500.00, 'Fútbol 5, alquiler por hora — zona Chacarita', -34.5858, -58.4552),
  ('Cancha Freire Colegiales',    10, 18000.00, 'Fútbol 5, techada — Gral. Ramón Freire 761, Colegiales', -34.5747, -58.4472)
ON CONFLICT (nombre) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4) Reservas + pagos (idempotente vía guards NOT EXISTS).
--    Precios = precio_hora × horas × (1 - descuento); seña = 30% del total.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  ca1 INT; ca2 INT; ca3 INT;
  cl_juan INT; cl_maria INT; cl_pedro INT; cl_lucia INT; cl_diego INT;
  r INT;
BEGIN
  SELECT id INTO ca1 FROM canchas WHERE nombre='Cancha 1 - Fútbol 11';
  SELECT id INTO ca2 FROM canchas WHERE nombre='Cancha 2 - Fútbol 7';
  SELECT id INTO ca3 FROM canchas WHERE nombre='Cancha 3 - Fútbol 5';
  SELECT id INTO cl_juan  FROM clientes WHERE email='juan@example.com';
  SELECT id INTO cl_maria FROM clientes WHERE email='maria@example.com';
  SELECT id INTO cl_pedro FROM clientes WHERE email='pedro@example.com';
  SELECT id INTO cl_lucia FROM clientes WHERE email='lucia@example.com';
  SELECT id INTO cl_diego FROM clientes WHERE email='diego@example.com';

  -- R1: Juan (regular) — Cancha 1, pasada, COMPLETADA, pagada por completo
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_juan AND cancha_id=ca1 AND fecha=DATE '2026-06-10' AND hora_inicio=TIME '18:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca1, cl_juan, '2026-06-10', '18:00', '19:00', 25000, 0, 7500, 'completada') RETURNING id INTO r;
    INSERT INTO pagos (reserva_id, monto, tipo_pago, metodo_pago) VALUES
      (r, 7500,  'seña',  'transferencia'),
      (r, 17500, 'saldo', 'efectivo');
  END IF;

  -- R2: Juan — Cancha 2, futura, CONFIRMADA, solo seña paga
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_juan AND cancha_id=ca2 AND fecha=DATE '2026-06-28' AND hora_inicio=TIME '20:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca2, cl_juan, '2026-06-28', '20:00', '21:00', 18000, 0, 5400, 'confirmada') RETURNING id INTO r;
    INSERT INTO pagos (reserva_id, monto, tipo_pago, metodo_pago) VALUES (r, 5400, 'seña', 'tarjeta');
  END IF;

  -- R3: María (frecuente 10%) — Cancha 1, 2h, pasada, COMPLETADA
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_maria AND cancha_id=ca1 AND fecha=DATE '2026-06-15' AND hora_inicio=TIME '19:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca1, cl_maria, '2026-06-15', '19:00', '21:00', 45000, 10, 13500, 'completada') RETURNING id INTO r;
    INSERT INTO pagos (reserva_id, monto, tipo_pago, metodo_pago) VALUES
      (r, 13500, 'seña',  'transferencia'),
      (r, 31500, 'saldo', 'tarjeta');
  END IF;

  -- R4: María — Cancha 3, futura, PENDIENTE (sin pago todavía)
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_maria AND cancha_id=ca3 AND fecha=DATE '2026-06-30' AND hora_inicio=TIME '17:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca3, cl_maria, '2026-06-30', '17:00', '18:00', 12600, 10, 3780, 'pendiente');
  END IF;

  -- R5: Pedro (vip 20%) — Cancha 1, 2h, futura, CONFIRMADA, seña paga
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_pedro AND cancha_id=ca1 AND fecha=DATE '2026-07-02' AND hora_inicio=TIME '21:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca1, cl_pedro, '2026-07-02', '21:00', '23:00', 40000, 20, 12000, 'confirmada') RETURNING id INTO r;
    INSERT INTO pagos (reserva_id, monto, tipo_pago, metodo_pago) VALUES (r, 12000, 'seña', 'transferencia');
  END IF;

  -- R6: Pedro (vip 20%) — Cancha 2, pasada, COMPLETADA, pago completo de una
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_pedro AND cancha_id=ca2 AND fecha=DATE '2026-06-05' AND hora_inicio=TIME '20:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca2, cl_pedro, '2026-06-05', '20:00', '21:00', 14400, 20, 4320, 'completada') RETURNING id INTO r;
    INSERT INTO pagos (reserva_id, monto, tipo_pago, metodo_pago) VALUES (r, 14400, 'completo', 'efectivo');
  END IF;

  -- R7: Lucía — Cancha 3, pasada, CANCELADA (seña pagada y luego devuelta)
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_lucia AND cancha_id=ca3 AND fecha=DATE '2026-06-12' AND hora_inicio=TIME '16:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado, fecha_cancelacion, razon_cancelacion)
    VALUES (ca3, cl_lucia, '2026-06-12', '16:00', '17:00', 14000, 0, 4200, 'cancelada', '2026-06-11 10:30', 'Cancelada por el cliente con anticipación') RETURNING id INTO r;
    INSERT INTO pagos (reserva_id, monto, tipo_pago, metodo_pago, observaciones) VALUES
      (r, 4200, 'seña',       'transferencia', NULL),
      (r, 4200, 'devolucion', 'transferencia', 'Reintegro por cancelación con anticipación');
  END IF;

  -- R8, R9, R10: Diego — tres NO_SHOW (queda auto-bloqueado por 3 no-shows)
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_diego AND cancha_id=ca1 AND fecha=DATE '2026-06-01' AND hora_inicio=TIME '18:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca1, cl_diego, '2026-06-01', '18:00', '19:00', 25000, 0, 7500, 'no_show');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_diego AND cancha_id=ca2 AND fecha=DATE '2026-06-08' AND hora_inicio=TIME '19:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca2, cl_diego, '2026-06-08', '19:00', '20:00', 18000, 0, 5400, 'no_show');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE cliente_id=cl_diego AND cancha_id=ca3 AND fecha=DATE '2026-06-18' AND hora_inicio=TIME '20:00') THEN
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado)
    VALUES (ca3, cl_diego, '2026-06-18', '20:00', '21:00', 14000, 0, 4200, 'no_show');
  END IF;

  -- ------------------------------------------------------------------------
  -- 5) Reservas "recientes" (fechas relativas a CURRENT_DATE, no fijas como las de
  --    arriba) para que GET /reservas/insights tenga siempre datos de las últimas
  --    semanas sin importar cuándo se corra este seed. Muestran una tendencia bajista
  --    general y una caída marcada en Cancha 2 - Fútbol 7 (2 → 2 → 1 → 0), a propósito,
  --    para que el resumen de IA tenga algo concreto que contar.
  -- ------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM reservas WHERE observaciones = 'seed-tendencia') THEN
    -- Semana -3
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado, observaciones) VALUES
      (ca1, cl_juan,  date_trunc('week', CURRENT_DATE)::date - 21, '18:00', '19:00', 25000, 0,  7500, 'completada', 'seed-tendencia'),
      (ca2, cl_maria, date_trunc('week', CURRENT_DATE)::date - 20, '19:00', '20:00', 18000, 10, 5400, 'completada', 'seed-tendencia'),
      (ca2, cl_pedro, date_trunc('week', CURRENT_DATE)::date - 18, '20:00', '21:00', 18000, 20, 5400, 'completada', 'seed-tendencia'),
      (ca3, cl_juan,  date_trunc('week', CURRENT_DATE)::date - 17, '17:00', '18:00', 14000, 0,  4200, 'completada', 'seed-tendencia');
    -- Semana -2
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado, observaciones) VALUES
      (ca1, cl_maria, date_trunc('week', CURRENT_DATE)::date - 14, '18:00', '19:00', 25000, 10, 7500, 'completada', 'seed-tendencia'),
      (ca2, cl_pedro, date_trunc('week', CURRENT_DATE)::date - 13, '19:00', '20:00', 18000, 20, 5400, 'completada', 'seed-tendencia'),
      (ca2, cl_juan,  date_trunc('week', CURRENT_DATE)::date - 11, '20:00', '21:00', 18000, 0,  5400, 'completada', 'seed-tendencia'),
      (ca3, cl_maria, date_trunc('week', CURRENT_DATE)::date - 10, '17:00', '18:00', 14000, 10, 4200, 'completada', 'seed-tendencia');
    -- Semana -1
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado, observaciones) VALUES
      (ca1, cl_pedro, date_trunc('week', CURRENT_DATE)::date - 7, '18:00', '19:00', 25000, 20, 7500, 'completada', 'seed-tendencia'),
      (ca2, cl_juan,  date_trunc('week', CURRENT_DATE)::date - 6, '19:00', '20:00', 18000, 0,  5400, 'completada', 'seed-tendencia'),
      (ca3, cl_pedro, date_trunc('week', CURRENT_DATE)::date - 4, '17:00', '18:00', 14000, 20, 4200, 'completada', 'seed-tendencia');
    -- Semana actual (sin reservas en Cancha 2: la caída que va a mencionar el resumen)
    INSERT INTO reservas (cancha_id, cliente_id, fecha, hora_inicio, hora_fin, precio_total, descuento_aplicado, sena_requerida, estado, observaciones) VALUES
      (ca1, cl_juan,  date_trunc('week', CURRENT_DATE)::date,     '18:00', '19:00', 25000, 0,  7500, 'confirmada', 'seed-tendencia'),
      (ca3, cl_maria, date_trunc('week', CURRENT_DATE)::date + 2, '17:00', '18:00', 14000, 10, 4200, 'pendiente',  'seed-tendencia');
  END IF;
END $$;
