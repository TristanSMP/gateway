CREATE USER 'tsmp'@'localhost' WITH PASSWORD 'tsmp';
CREATE DATABASE tsmp;
GRANT ALL PRIVILEGES ON tsmp.* TO 'tsmp'@'localhost';