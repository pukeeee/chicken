#!/bin/bash
# Ця команда змусить скрипт негайно зупинитися, якщо щось піде не так
set -e

# --- Налаштування ---
BASE_BRANCH="master"
AUTOMEGE_LABEL="automerge"
# --------------------

# 1. Отримуємо назву поточної гілки
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# 2. Перевіряємо, чи ми не на master гілці
if [ "$CURRENT_BRANCH" == "$BASE_BRANCH" ]; then
  echo "❌ Помилка: Ви знаходитесь на гілці '$BASE_BRANCH'. Спочатку перейдіть на свою гілку з фічею."
  exit 1
fi

# 3. Оновлюємо інформацію про стан гілок з GitHub
echo "🔄 Оновлюю стан гілок з репозиторію..."
git fetch origin "$BASE_BRANCH"

# 4. Генеруємо назву для PR з першого комміту в гілці (порівнюючи з origin/master)
PR_TITLE=$(git log "origin/$BASE_BRANCH..HEAD" --reverse --pretty=format:"%s" | head -n 1)

# 5. Генеруємо тіло для PR зі списком всіх коммітів (порівнюючи з origin/master)
COMMIT_LIST=$(git log "origin/$BASE_BRANCH..HEAD" --pretty=format:"- %s%n")

# Перевіряємо, чи є взагалі комміти для PR
if [ -z "$PR_TITLE" ]; then
  echo "❌ Помилка: Не знайдено нових коммітів у гілці '$CURRENT_BRANCH' порівняно з '$BASE_BRANCH'."
  echo "Можливо, ви забули зробити комміт або ваша гілка не відрізняється від master."
  exit 1
fi

PR_BODY="### Зміни в цьому PR:

${COMMIT_LIST}
---
*PR створено та заповнено автоматично.*"

echo "Створюю Pull Request..."
echo "======================="
echo "  Гілка:    $CURRENT_BRANCH -> $BASE_BRANCH"
echo "  Назва:    $PR_TITLE"
echo "  Мітка:    $AUTOMEGE_LABEL"
echo "--- Тіло PR: ---"
echo "$PR_BODY"
echo "------------------"

# 6. Створюємо Pull Request з автоматично згенерованими даними
gh pr create \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --label "$AUTOMEGE_LABEL"

echo "✅ Pull Request успішно створено!"