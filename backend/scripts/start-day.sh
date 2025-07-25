#!/usr/bin/env bash
# Script to initialize a new feature branch in a trunk-based workflow
# - Vérifie l'état du repo
# - Se place sur main et update
# - Nettoie branches locales mergées
# - Crée une branche feature propre
# Usage: ./startday

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}--- Initialisation Trunk Based ---${NC}"

# Vérifier qu'il n'y a pas de modifications en cours
if ! git diff-index --quiet HEAD --; then
  echo "⚠️ Modifications non commités détectées."
  echo "1) Committer"
  echo "2) Stasher"
  echo "3) Annuler"
  read -p "Choisir une option [1/2/3] : " choix

  case $choix in
    1)
      git add .
      read -p "Message de commit : " msg
      git commit -m "$msg"
      ;;
    2)
      git stash
      ;;
    3)
      git reset --hard
      ;;
    *)
      echo "Option invalide."
      exit 1
      ;;
  esac
fi


# Se mettre sur main et pull
git checkout main
git pull origin main

# Nettoyer les branches locales mergées
echo -e "${GREEN}--- Nettoyage des branches locales mergées ---${NC}"
git fetch --prune
git branch --merged main | grep -v "main" | grep -v "\*" | while read branch; do
  echo -e "Suppression branche locale : $branch"
  git branch -d "$branch"
done

# Créer la nouvelle branche
read -p "Nom court de la feature (ex: login): " FEATURE_NAME
DATE=$(date +%Y-%m-%d)
BRANCH_NAME="feature/${DATE}-${FEATURE_NAME}"

git checkout -b "$BRANCH_NAME"

echo -e "${GREEN}✅ Branche créée et prête : $BRANCH_NAME${NC}"
echo -e "Commencez à coder et committez régulièrement."
