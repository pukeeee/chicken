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

# 3. Генеруємо назву для PR з першого комміту в гілці
# (git log з --reverse показує комміти від старіших до новіших)
PR_TITLE=$(git log "$BASE_BRANCH..HEAD" --reverse --pretty=format:"%s" | head -n 1)

# 4. Генеруємо тіло для PR зі списком всіх коммітів
COMMIT_LIST=$(git log "$BASE_BRANCH..HEAD" --pretty=format:"- %s")
PR_BODY="### Зміни в цьому PR:\n\n$COMMIT_LIST\n---\n*PR створено та заповнено автоматично."

echo "Створюю Pull Request..."
echo "======================="
echo "  Гілка:    $CURRENT_BRANCH -> $BASE_BRANCH"
echo "  Назва:    $PR_TITLE"
echo "  Мітка:    $AUTOMEGE_LABEL"
echo "--- Тіло PR: ---"
echo "$PR_BODY"
echo "------------------"

# 5. Створюємо Pull Request з автоматично згенерованими даними
gh pr create \
  --base "$BASE_BRANCH" \
  --head "$CURRENT_BRANCH" \
  --title "$PR_TITLE" \
  --body "$PR_BODY" \
  --label "$AUTOMEGE_LABEL"

echo "✅ Pull Request успішно створено!"
