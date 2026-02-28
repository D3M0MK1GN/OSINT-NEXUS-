#!/bin/bash

# --- Script para crear la base de datos y el usuario de la aplicación en PostgreSQL ---

# Cargar variables de entorno desde .env
if [ -f .env ]; then
    source .env
else
    echo "Error: El archivo .env no se encontró en la raíz del proyecto."
    echo "Por favor, asegúrate de que existe y contiene DATABASE_URL."
    exit 1
fi

# Verificar que DATABASE_URL esté definida
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL no está definida en el archivo .env."
    echo "Por favor, edita .env y añade tu cadena de conexión a PostgreSQL."
    exit 1
fi

echo "--- Configuración de la base de datos PostgreSQL ---"

# Extraer componentes de la DATABASE_URL
# Ejemplo: postgresql://user:password@host:port/dbname
DB_APP_USER=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/\([^:]*\):.*/\1/p')
DB_APP_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/[^:]*:\([^@]*\).*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/[^@]*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/postgresql:\/\/[^@]*@[^:]*:\([0-9]*\).*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | awk -F'/' '{print $NF}')

echo "Nombre de la Base de Datos: $DB_NAME"
echo "Usuario de la Aplicación: $DB_APP_USER"
echo "Host: $DB_HOST"
echo "Puerto: $DB_PORT"

# Solicitar la contraseña del superusuario de PostgreSQL (ej. 'postgres')
read -s -p "Introduce la contraseña del superusuario de PostgreSQL (ej. para el usuario 'postgres'): " PG_SUPERUSER_PASSWORD
echo

# Exportar la contraseña para que psql la use
export PGPASSWORD="$PG_SUPERUSER_PASSWORD"

# --- Crear la base de datos ---
echo "Verificando si la base de datos '$DB_NAME' existe..."
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "postgres" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo "La base de datos '$DB_NAME' ya existe. Saltando la creación."
else
    echo "Creando base de datos '$DB_NAME' நான"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "postgres" -d postgres -c "CREATE DATABASE \"$DB_NAME\";"; then
        echo "Base de datos '$DB_NAME' creada exitosamente."
    else
        echo "Error al crear la base de datos '$DB_NAME'. Por favor, verifica tus credenciales de superusuario y el estado del servidor PostgreSQL."
        unset PGPASSWORD
        exit 1
    fi
fi

# --- Crear el usuario de la aplicación ---
echo "Verificando si el usuario '$DB_APP_USER' existe..."
USER_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "postgres" -d postgres -tAc "SELECT 1 FROM pg_user WHERE usename='$DB_APP_USER'")

if [ "$USER_EXISTS" = "1" ]; then
    echo "El usuario '$DB_APP_USER' ya existe. Saltando la creación."
else
    echo "Creando usuario '$DB_APP_USER' நான"
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "postgres" -d postgres -c "CREATE USER \"$DB_APP_USER\" WITH PASSWORD '$DB_APP_PASSWORD';"; then
        echo "Usuario '$DB_APP_USER' creado exitosamente."
    else
        echo "Error al crear el usuario '$DB_APP_USER'. Por favor, verifica tus credenciales de superusuario."
        unset PGPASSWORD
        exit 1
    fi
fi

# --- Otorgar privilegios al usuario en la base de datos ---
echo "Otorgando todos los privilegios al usuario '$DB_APP_USER' en la base de datos '$DB_NAME'..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "postgres" -d postgres -c "GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO \"$DB_APP_USER\";"; then
    echo "Privilegios sobre la base de datos otorgados exitosamente."
else
    echo "Error al otorgar privilegios sobre la base de datos. Por favor, verifica tus credenciales de superusuario."
    unset PGPASSWORD
    exit 1
fi

echo "Otorgando privilegios de USAGE y CREATE en el esquema 'public' al usuario '$DB_APP_USER'..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "postgres" -d "$DB_NAME" -c "GRANT USAGE, CREATE ON SCHEMA public TO \"$DB_APP_USER\";"; then
    echo "Privilegios sobre el esquema 'public' otorgados exitosamente."
else
    echo "Error al otorgar privilegios sobre el esquema 'public'. Por favor, verifica tus credenciales de superusuario."
    unset PGPASSWORD
    exit 1
fi

# Limpiar la variable de entorno de la contraseña por seguridad
unset PGPASSWORD

echo "Configuración de la base de datos completada."
