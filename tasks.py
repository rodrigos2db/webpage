import os
from invoke import task, Context

# --- Configuración ---
GCLOUD_CONFIG = "website-prod"
PROJECT_ID = "steadfast-wares-471223-v3"
SERVICE_NAME = "default"
# ---------------------

@task
def deploy(c: Context):
    """
    Despliega la página web estática a App Engine (Producción).
    """
    print(f"⚠️  ATENCIÓN: Desplegando Página Web a App Engine (PROD)")
    print(f"Proyecto: {PROJECT_ID}")
    
    confirm = input("¿Seguro que quieres continuar? (y/n) ")
    if confirm.lower() != 'y':
        print("❌ Cancelado")
        exit(1)

    # Detectar Cloud Shell
    if os.environ.get("CLOUD_SHELL"):
        print("💻 Cloud Shell detectado. Usando proyecto activo:")
        c.run(f"gcloud config set project {PROJECT_ID}")
    else:
        # Activa la configuración específica
        print(f"Activando configuración: {GCLOUD_CONFIG}")
        c.run(f"gcloud config configurations activate {GCLOUD_CONFIG}")

    # Build: embebe i18n + versiona CSS
    print("🔨 Ejecutando build (npm run build)...")
    c.run("npm run build")

    # El comando de deploy
    print(f"🚀 Desplegando servicio [{SERVICE_NAME}] a App Engine...")
    c.run("gcloud app deploy app.yaml --quiet")
    
    print("✅ Deploy de Página Web a App Engine completado")