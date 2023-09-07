-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 07-09-2023 a las 23:02:46
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `assbook`
--
CREATE DATABASE IF NOT EXISTS `assbook` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `assbook`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comment`
--

CREATE TABLE `comment` (
  `id` int(10) UNSIGNED NOT NULL,
  `text` varchar(1000) NOT NULL,
  `date` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `post` int(10) UNSIGNED NOT NULL,
  `user` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `post`
--

CREATE TABLE `post` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `date` timestamp(6) NOT NULL DEFAULT current_timestamp(6),
  `image` varchar(100) DEFAULT NULL,
  `place` varchar(100) DEFAULT NULL,
  `lat` float DEFAULT NULL,
  `lng` float DEFAULT NULL,
  `total_likes` int(11) NOT NULL DEFAULT 0,
  `creator` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user`
--

CREATE TABLE `user` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `avatar` varchar(250) NOT NULL,
  `lat` double(9,6) NOT NULL DEFAULT 0.000000,
  `lng` double(9,6) NOT NULL DEFAULT 0.000000,
  `firebase_token` varchar(200) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_follow_user`
--

CREATE TABLE `user_follow_user` (
  `follower` int(10) UNSIGNED NOT NULL,
  `followed` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_like_post`
--

CREATE TABLE `user_like_post` (
  `likes` tinyint(4) NOT NULL,
  `user` int(10) UNSIGNED NOT NULL,
  `post` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `user_like_post`
--
DELIMITER $$
CREATE TRIGGER `user_changes_like` AFTER UPDATE ON `user_like_post` FOR EACH ROW IF(OLD.likes = 0 AND NEW.likes = 1) THEN
   UPDATE post SET total_likes = total_likes + 2 WHERE id = OLD.post;
ELSEIF(OLD.likes = 1 AND NEW.likes = 0) THEN
   UPDATE post SET total_likes = total_likes - 2 WHERE id = OLD.post;
END IF
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `user_deletes_like` AFTER DELETE ON `user_like_post` FOR EACH ROW IF(OLD.likes = 0) THEN
   UPDATE post SET total_likes = total_likes + 1 WHERE id = OLD.post;
ELSE
   UPDATE post SET total_likes = total_likes - 1 WHERE id = OLD.post;
END IF
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `user_likes_post` AFTER INSERT ON `user_like_post` FOR EACH ROW IF(NEW.likes = 0) THEN
   UPDATE post SET total_likes = total_likes - 1 WHERE id = NEW.post;
ELSE
   UPDATE post SET total_likes = total_likes + 1 WHERE id = NEW.post;
END IF
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post` (`post`),
  ADD KEY `user` (`user`) USING BTREE;

--
-- Indices de la tabla `post`
--
ALTER TABLE `post`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_9e91e6a24261b66f53971d3f96b` (`creator`);

--
-- Indices de la tabla `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `IDX_e12875dfb3b1d92d7d7c5377e2` (`email`);

--
-- Indices de la tabla `user_follow_user`
--
ALTER TABLE `user_follow_user`
  ADD PRIMARY KEY (`follower`,`followed`),
  ADD KEY `IDX_26312a1e34901011fc6f63545e` (`follower`),
  ADD KEY `IDX_110f993e5e9213a7a44f172b26` (`followed`);

--
-- Indices de la tabla `user_like_post`
--
ALTER TABLE `user_like_post`
  ADD PRIMARY KEY (`user`,`post`),
  ADD KEY `FK_8711902eef9ac9548e96d0dc77c` (`post`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comment`
--
ALTER TABLE `comment`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `post`
--
ALTER TABLE `post`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `user`
--
ALTER TABLE `user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comment`
--
ALTER TABLE `comment`
  ADD CONSTRAINT `FK_94a85bb16d24033a2afdd5df060` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_c0354a9a009d3bb45a08655ce3b` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `post`
--
ALTER TABLE `post`
  ADD CONSTRAINT `FK_9e91e6a24261b66f53971d3f96b` FOREIGN KEY (`creator`) REFERENCES `user` (`id`) ON UPDATE NO ACTION;

--
-- Filtros para la tabla `user_follow_user`
--
ALTER TABLE `user_follow_user`
  ADD CONSTRAINT `FK_110f993e5e9213a7a44f172b264` FOREIGN KEY (`followed`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_26312a1e34901011fc6f63545e2` FOREIGN KEY (`follower`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

--
-- Filtros para la tabla `user_like_post`
--
ALTER TABLE `user_like_post`
  ADD CONSTRAINT `FK_8711902eef9ac9548e96d0dc77c` FOREIGN KEY (`post`) REFERENCES `post` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  ADD CONSTRAINT `FK_a113d5dd8f498fd9a71ac9eb102` FOREIGN KEY (`user`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
