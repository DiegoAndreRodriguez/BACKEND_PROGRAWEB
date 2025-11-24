-- Script para poblar las tablas categories y products

-- Primero, borramos los datos existentes para evitar duplicados al correr el script de nuevo
-- La sentencia TRUNCATE es más rápida que DELETE y reinicia los contadores SERIAL
TRUNCATE TABLE order_items, orders, products, categories RESTART IDENTITY CASCADE;

-- 1. Insertar todas las categorías
INSERT INTO categories (name) VALUES
('Físicos'),
('Mentales'),
('Elementales'),
('Tecnológicos'),
('Místicos'),
('Curativos');

-- 2. Insertar TODOS los productos con sus respectivas categorías
INSERT INTO products (name, category_id, price, description, image_url) VALUES
-- Físicos
('Superfuerza', (SELECT id FROM categories WHERE name = 'Físicos'), 300, 'Incrementa tu fuerza física hasta levantar tanques y abrir caminos imposibles.', '/imagenes/superfuerza.png'),
('Volar', (SELECT id FROM categories WHERE name = 'Físicos'), 350, 'Surca los cielos con total libertad y velocidad, dejando atrás los límites del suelo.', '/imagenes/volar.png'),
('Velocidad Sobrehumana', (SELECT id FROM categories WHERE name = 'Físicos'), 280, 'Corre tan rápido que el mundo parece detenerse a tu alrededor.', '/imagenes/velocidad_sobrehumana.png'),
('Invulnerabilidad', (SELECT id FROM categories WHERE name = 'Físicos'), 400, 'Tu cuerpo se vuelve indestructible frente a armas, fuego o impactos extremos.', '/imagenes/invulnerabilidad.png'),
('Reflejos Felinos', (SELECT id FROM categories WHERE name = 'Físicos'), 220, 'Reacciona con la agilidad de un felino, esquivando cualquier ataque en milisegundos.', '/imagenes/reflejos.png'),
('Resistencia Infinita', (SELECT id FROM categories WHERE name = 'Físicos'), 310, 'Corre, pelea o trabaja sin cansarte jamás, tu energía parece inagotable.', '/imagenes/resistencia_infinita.png'),
('Salto Gigante', (SELECT id FROM categories WHERE name = 'Físicos'), 190, 'Alcanza la cima de edificios o cruza ríos de un solo salto monumental.', '/imagenes/salto.png'),
('Elasticidad Corporal', (SELECT id FROM categories WHERE name = 'Físicos'), 270, 'Estira tu cuerpo como goma, atravesando rendijas y alcanzando cualquier objeto.', '/imagenes/elasticidad.png'),

-- Mentales
('Telepatía', (SELECT id FROM categories WHERE name = 'Mentales'), 320, 'Lee y comunica pensamientos con otras personas sin necesidad de palabras.', '/imagenes/telepatia.png'),
('Telequinesis', (SELECT id FROM categories WHERE name = 'Mentales'), 360, 'Mueve objetos con tu mente, desde una pluma hasta automóviles enteros.', '/imagenes/telequinesis.png'),
('Clarividencia', (SELECT id FROM categories WHERE name = 'Mentales'), 270, 'Anticípate al futuro cercano y cambia tu destino con decisiones inteligentes.', '/imagenes/clarividencia.png'),
('Control Mental', (SELECT id FROM categories WHERE name = 'Mentales'), 500, 'Influye en la voluntad de otros y guía sus acciones a tu favor.', '/imagenes/control_mental.png'),
('Empatía Total', (SELECT id FROM categories WHERE name = 'Mentales'), 210, 'Percibe las emociones ajenas como si fueran tuyas, comprendiendo a todos profundamente.', '/imagenes/empatia.png'),
('Ilusiones Mentales', (SELECT id FROM categories WHERE name = 'Mentales'), 330, 'Crea escenarios falsos en la mente de tus enemigos para confundirlos.', '/imagenes/ilusiones.png'),
('Lenguas Universales', (SELECT id FROM categories WHERE name = 'Mentales'), 260, 'Comprende y habla cualquier idioma humano o alienígena instantáneamente.', '/imagenes/lenguas.png'),
('Memoria Absoluta', (SELECT id FROM categories WHERE name = 'Mentales'), 300, 'Recuerda cada detalle de tu vida y aprende cualquier cosa con solo leerla una vez.', '/imagenes/memoria.png'),

-- Elementales
('Control del Fuego', (SELECT id FROM categories WHERE name = 'Elementales'), 310, 'Genera y manipula llamas a tu antojo, desde una chispa hasta un incendio.', '/imagenes/control_fuego.png'),
('Control del Agua', (SELECT id FROM categories WHERE name = 'Elementales'), 300, 'Manipula corrientes, mares y gotas de agua con un solo gesto.', '/imagenes/control_agua.png'),
('Control de la Tierra', (SELECT id FROM categories WHERE name = 'Elementales'), 330, 'Levanta muros de roca, abre grietas en el suelo y domina montañas enteras.', '/imagenes/control_tierra.png'),
('Control del Aire', (SELECT id FROM categories WHERE name = 'Elementales'), 280, 'Crea ráfagas de viento capaces de derribar edificios o volar enemigos.', '/imagenes/control_aire.png'),
('Tormenta Eléctrica', (SELECT id FROM categories WHERE name = 'Elementales'), 350, 'Invoca rayos y tormentas que arrasan con todo a su paso.', '/imagenes/tormenta_electrica.png'),
('Gélido Invierno', (SELECT id FROM categories WHERE name = 'Elementales'), 290, 'Congela ríos, crea ventiscas y paraliza a tus enemigos con hielo.', '/imagenes/gelido_invierno.png'),
('Luz Radiante', (SELECT id FROM categories WHERE name = 'Elementales'), 260, 'Proyecta haces de luz cegadores que purifican la oscuridad.', '/imagenes/luz.png'),
('Oscuridad Absoluta', (SELECT id FROM categories WHERE name = 'Elementales'), 320, 'Sumérgelo todo en tinieblas, anulando la visión de tus enemigos.', '/imagenes/oscuridad.png'),

-- Tecnológicos
('Visión de Rayos X', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 270, 'Mira a través de paredes, objetos o cuerpos con claridad total.', '/imagenes/rayos_x.png'),
('Camuflaje', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 330, 'Vuelve tu cuerpo invisible gracias a la manipulación de la luz.', '/imagenes/camuflaje.png'),
('Nanorregeneración', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 400, 'Miles de nanobots reparan tu cuerpo en segundos ante cualquier herida.', '/imagenes/nano.png'),
('Armadura Energética', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 420, 'Una armadura tecnológica que amplifica fuerza, velocidad y protección.', '/imagenes/armadura.png'),
('Dron de Combate', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 310, 'Un dron personal que te asiste en batallas, exploración o vigilancia.', '/imagenes/dron.png'),
('Arsenal Digital', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 290, 'Convoca armas digitales a partir de energía pura.', '/imagenes/arsenal.png'),
('Interfaz Cibernética', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 250, 'Conéctate con cualquier máquina, hackeando sistemas al instante.', '/imagenes/interfaz.png'),
('Exoesqueleto Avanzado', (SELECT id FROM categories WHERE name = 'Tecnológicos'), 370, 'Un traje robótico que multiplica tu fuerza y resistencia.', '/imagenes/esqueleto.png'),

-- Místicos
('Invisibilidad', (SELECT id FROM categories WHERE name = 'Místicos'), 310, 'Hazte invisible a voluntad y muévete sin ser detectado.', '/imagenes/invi.png'),
('Invocación de Espíritus', (SELECT id FROM categories WHERE name = 'Místicos'), 340, 'Llama a entidades del más allá para que luchen a tu lado.', '/imagenes/invocar.png'),
('Magia Oscura', (SELECT id FROM categories WHERE name = 'Místicos'), 400, 'Canaliza energías prohibidas para desatar hechizos devastadores.', '/imagenes/magia.png'),
('Teletransportación', (SELECT id FROM categories WHERE name = 'Místicos'), 380, 'Desaparece en un lugar y aparece instantáneamente en otro.', '/imagenes/teleport.png'),
('Encantamientos', (SELECT id FROM categories WHERE name = 'Místicos'), 260, 'Imbuye objetos con magia para potenciar sus habilidades.', '/imagenes/encantamiento.png'),
('Viaje Astral', (SELECT id FROM categories WHERE name = 'Místicos'), 290, 'Proyecta tu espíritu fuera del cuerpo y explora otras dimensiones.', '/imagenes/viaje.png'),
('Manipulación del Tiempo', (SELECT id FROM categories WHERE name = 'Místicos'), 500, 'Detén, acelera o retrocede el tiempo a tu voluntad.', '/imagenes/tiempo.png'),
('Alquimia', (SELECT id FROM categories WHERE name = 'Místicos'), 280, 'Transmuta metales, crea pociones y altera la materia misma.', '/imagenes/alquimia.png'),

-- Curativos
('Regeneración Rápida', (SELECT id FROM categories WHERE name = 'Curativos'), 310, 'Sana cortes, golpes y fracturas en segundos.', '/imagenes/regeneracion_rapida.png'),
('Curación Celular', (SELECT id FROM categories WHERE name = 'Curativos'), 330, 'Tus células se regeneran constantemente, evitando enfermedades.', '/imagenes/curacion_celular.png'),
('Inmunidad Absoluta', (SELECT id FROM categories WHERE name = 'Curativos'), 280, 'Vuelve tu cuerpo inmune a cualquier virus, bacteria o veneno.', '/imagenes/inmunidad_absoluta.png'),
('Aura Sanadora', (SELECT id FROM categories WHERE name = 'Curativos'), 350, 'Emite un aura que cura a los que te rodean.', '/imagenes/aura_sanadora.png'),
('Resurrección', (SELECT id FROM categories WHERE name = 'Curativos'), 500, 'Devuelve la vida a quienes han caído en combate.', '/imagenes/revivir.png'),
('Purificación', (SELECT id FROM categories WHERE name = 'Curativos'), 260, 'Elimina toxinas, maldiciones y energías negativas.', '/imagenes/purificar.png'),
('Longevidad', (SELECT id FROM categories WHERE name = 'Curativos'), 400, 'Extiende tu esperanza de vida durante siglos sin envejecer.', '/imagenes/longevidad.png'),
('Reanimación', (SELECT id FROM categories WHERE name = 'Curativos'), 370, 'Recupera a los heridos en estado crítico con un toque.', '/imagenes/reanimar.png'),
('Escudo Vital', (SELECT id FROM categories WHERE name = 'Curativos'), 310, 'Crea un campo de energía que absorbe daño y lo transforma en curación.', '/imagenes/escudo.png'),
('Manos de Luz', (SELECT id FROM categories WHERE name = 'Curativos'), 290, 'Canaliza energía sanadora directamente desde tus manos.', '/imagenes/manos_luz.png');
