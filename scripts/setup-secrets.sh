#!/bin/bash
set -euo pipefail

# Ejecutar: bash scripts/setup-secrets.sh
# Requiere: gh autenticado y acceso de admin al repositorio.

REPO="$(gh repo view --json nameWithOwner -q .nameWithOwner)"

echo "Configurando secrets en $REPO"

# Secrets usados por los workflows y por el despliegue.
gh secret set KUBECONFIG --body "$(base64 < "${HOME}/.kube/config")" --repo "$REPO"
gh secret set GHCR_TOKEN --body "ghp_TU_TOKEN_AQUI" --repo "$REPO"
gh secret set DB_USERNAME --body "agromarket_user" --repo "$REPO"
gh secret set DB_PASSWORD --body "tu_password_db" --repo "$REPO"
gh secret set JDBC_DATABASE_URL --body "jdbc:mysql://hostname:3306/agromarket_db?useSSL=false&serverTimezone=UTC" --repo "$REPO"
gh secret set JWT_SECRET --body "tu_jwt_secret_minimo_32_chars" --repo "$REPO"

# Variables de entorno detectadas en los workflows que no son secretos.
gh variable set TESTCONTAINERS_RYUK_DISABLED --body "true" --repo "$REPO"
gh variable set DOCKER_HOST --body "unix:///var/run/docker.sock" --repo "$REPO"

echo "✅ Secrets y variables configurados en $REPO"