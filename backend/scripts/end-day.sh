#!/usr/bin/env bash
# Script de fin de journée pour trunk-based dev
# ➡ Lint JSX et SCSS, fixer ce qui peut l'être
# ➡ Commit final, merge dans main et clean branche

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}--- Lint JSX (fix auto) ---${NC}"
npx eslint . --ext .js --fix || true

echo -e "${GREEN}--- Vérification post-fix ESLint ---${NC}"
npx eslint . --ext .js

echo -e "${GREEN}✅ Lint terminé sans erreurs restantes.${NC}"

echo -e "${GREEN}--- Format code avec Prettier ---${NC}"
# Prettier pour formatter
npx prettier --write "*.js" "**/*.js" || true
npx prettier --write ".md" "**/*.md" || true
echo -e "${GREEN}✅  format terminés.${NC}"

# Ajout des modifications
git add .

# Message de commit
read -p "Message du commit final: " COMMIT_MSG
git commit -m "$COMMIT_MSG"

# Branche courante
CURRENT_BRANCH=$(git branch --show-current)

# Push de la branche
git push origin "$CURRENT_BRANCH"

# Merge dans main
git checkout main
git pull origin main
git merge --no-ff "$CURRENT_BRANCH"
git push origin main

# Suppression de la branche
git branch -d "$CURRENT_BRANCH"
git push origin --delete "$CURRENT_BRANCH"

echo -e "${GREEN}✅ Fin de journée : Merge & Clean OK.${NC}"
