-- Insertar roles básicos
INSERT INTO roles (rol_id, nombre_rol) VALUES 
(1, 'admin'),
(2, 'instructor'),
(3, 'estudiante');

-- Insertar un continente inicial
INSERT INTO continentes (nombre_continente) VALUES ('América');

-- Insertar un país inicial
INSERT INTO paises (nombre_pais, continente_id) VALUES ('Colombia', 1);

-- Insertar usuario administrador
-- La contraseña es '123456' hasheada con bcrypt
INSERT INTO usuarios (nombre, email, password_hash, pais_id, rol_id) VALUES 
('Administrador', 'admin@example.com', '$2a$10$YaF3JxlzKVeZFr3GxsAQPOz3RLX0sNCIaUJ4yC7.H8Lx1JFGQZkOu', 1, 1); 