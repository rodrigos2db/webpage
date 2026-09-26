# speak2db Webpage

Página web estática alojada en Google Cloud App Engine.

## Despliegue

```bash
# 1. Activar el entorno virtual
.\venv\Scripts\Activate.ps1

# 2. Asegurarse de tener invoke instalado
pip install invoke

# 3. Configurar gcloud (solo la primera vez)
gcloud config configurations create website-prod
gcloud config set project steadfast-wares-471223-v3
gcloud auth login

# 4. Desplegar
invoke deploy
```

El comando `invoke deploy` ejecuta `tasks.py`, que activa la configuración `website-prod` de gcloud y corre `gcloud app deploy app.yaml --quiet`.
