"""
Скрипт для автоматизації створення GitHub Pull Request.

Цей скрипт виконує наступні дії:
1. Перевіряє, що ви не на основній гілці.
2. Відправляє (push) вашу поточну гілку на GitHub.
3. Генерує заголовок та тіло PR на основі історії коммітів.
4. Створює Pull Request за допомогою GitHub CLI (`gh`).
5. (Опційно) Переходить в режим спостереження за PR і автоматично
   видаляє локальну гілку після її успішного злиття (merge).

Вимоги:
- Встановлений `git`.
- Встановлений та налаштований `gh` (GitHub CLI).
"""
import subprocess
import sys
import time
import json

# --- Глобальні налаштування ---
BASE_BRANCH = "master"
AUTOMEGE_LABEL = "automerge"


def run_command(command, check=True):
    """
    Безпечно виконує зовнішню команду і повертає її результат (stdout).

    Args:
        command (list): Команда та її аргументи у вигляді списку.
        check (bool): Якщо True, викличе виняток у разі помилки виконання.

    Returns:
        str: Текстовий вивід команди.

    Raises:
        SystemExit: Завершує роботу скрипта, якщо команда не знайдена
                    або завершилася з помилкою.
    """
    try:
        result = subprocess.run(
            command,
            check=check,
            capture_output=True,
            text=True,
            encoding='utf-8'
        )
        return result.stdout.strip()
    except FileNotFoundError:
        print(f"❌ Помилка: Команда '{command[0]}' не знайдена. Переконайтесь, що git та gh CLI встановлені.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"❌ Помилка виконання команди: {' '.join(command)}")
        print(f"   Stderr: {e.stderr.strip()}")
        sys.exit(1)


def main():
    """Основна функція, що керує процесом створення та моніторингу PR."""
    
    # --- Крок 1: Базові перевірки ---
    current_branch = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"])

    # Переконуємося, що ми не намагаємося створити PR з основної гілки.
    if current_branch == BASE_BRANCH:
        print(f"❌ Помилка: Ви знаходитесь на гілці '{BASE_BRANCH}'. Спочатку перейдіть на свою гілку з фічею.")
        sys.exit(1)

    # --- Крок 2: Синхронізація з віддаленим репозиторієм ---
    # Відправляємо поточну гілку на GitHub. Це гарантує, що PR буде створено
    # з останніми локальними змінами. Команда також створить віддалену гілку,
    # якщо її не існує.
    print(f"🅿️  Спроба відправити зміни гілки '{current_branch}' на GitHub...")
    run_command(["git", "push", "--set-upstream", "origin", current_branch])
    print("✅ Гілка успішно оновлена на GitHub.")

    # Отримуємо актуальний стан основної гілки, щоб коректно порівняти комміти.
    print(f"🔄 Оновлюю стан гілки '{BASE_BRANCH}' з репозиторію...")
    run_command(["git", "fetch", "origin", BASE_BRANCH])

    # --- Крок 3: Генерація контенту для Pull Request ---
    # Шукаємо комміти, які є в нашій гілці, але відсутні в `origin/master`.
    # `check=False` дозволяє нам самим обробити випадок, коли нових коммітів немає.
    commit_log = run_command(
        ["git", "log", f"origin/{BASE_BRANCH}..HEAD", "--reverse", "--pretty=format:%s"],
        check=False
    )

    # Якщо нових коммітів не знайдено, робота скрипта не має сенсу.
    if not commit_log:
        print(f"❌ Помилка: Не знайдено нових коммітів у гілці '{current_branch}' порівняно з '{BASE_BRANCH}'.")
        print("Можливо, ви забули зробити комміт або ваша гілка не відрізняється від master.")
        sys.exit(1)

    # Перший комміт у гілці стає заголовком PR.
    commits = commit_log.split('\n')
    pr_title = commits[0]

    # Формуємо красивий список всіх змін для тіла PR.
    commit_list_for_body = run_command(
        ["git", "log", f"origin/{BASE_BRANCH}..HEAD", "--pretty=format:- %s"]
    )
    pr_body = f"""### Зміни в цьому PR:

{commit_list_for_body}
---
*PR створено та заповнено автоматично.*"""

    # --- Крок 4: Створення Pull Request ---
    # Виводимо інформацію про майбутній PR для користувача.
    print("\nСтворюю Pull Request...")
    print("=======================")
    print(f"  Гілка:    {current_branch} -> {BASE_BRANCH}")
    print(f"  Назва:    {pr_title}")
    print(f"  Мітка:    {AUTOMEGE_LABEL}")
    print("--- Тіло PR: ---")
    print(pr_body)
    print("------------------")

    # Використовуємо GitHub CLI для створення PR з усіма зібраними даними.
    gh_command = [
        "gh", "pr", "create",
        "--base", BASE_BRANCH,
        "--head", current_branch,
        "--title", pr_title,
        "--body", pr_body,
        "--label", AUTOMEGE_LABEL
    ]
    run_command(gh_command)
    print("✅ Pull Request успішно створено!")

    # --- Крок 5: Опційне спостереження та очищення ---
    # Запитуємо користувача, чи потрібно автоматично видалити гілку після мерджу.
    answer = input("\n❓ Видалити локальну гілку після успішного мерджу PR? (y/N): ").lower()
    if answer != 'y':
        print("👋 Завершую роботу. Не забудьте видалити гілку вручну після мерджу.")
        return

    print(f"\n⏳ Добре, буду стежити за PR для гілки '{current_branch}'.")
    print("Натисніть Ctrl+C, щоб зупинити спостереження у будь-який момент.")

    # Запускаємо цикл спостереження, який триватиме до мерджу, закриття PR або помилки.
    while True:
        try:
            # Отримуємо актуальний статус PR (state) та статус перевірок (statusCheckRollup).
            pr_info_json = run_command([
                "gh", "pr", "view",
                "--head", current_branch,
                "--json", "number,state,statusCheckRollup"
            ], check=False)

            # Якщо PR ще не з'явився в API, чекаємо і пробуємо знову.
            if not pr_info_json or pr_info_json.strip() == '[]':
                print("⏳ Не можу знайти PR. Можливо, він ще не з'явився в API. Повторна спроба через 10 секунд...")
                time.sleep(10)
                continue

            pr_info = json.loads(pr_info_json)[0]
            pr_number = pr_info.get("number")
            pr_state = pr_info.get("state")
            pr_checks = pr_info.get("statusCheckRollup")

            # Обробляємо різні стани PR.
            if pr_state == "MERGED":
                print(f"✅ PR #{pr_number} успішно змерджено!")
                print(f"...Перемикаюсь на гілку '{BASE_BRANCH}'...")
                run_command(["git", "checkout", BASE_BRANCH])
                print(f"...Видаляю локальну гілку '{current_branch}'...")
                run_command(["git", "branch", "-D", current_branch])
                print(f"✅ Локальну гілку '{current_branch}' видалено. Роботу завершено.")
                break

            elif pr_state == "CLOSED":
                print(f"❌ PR #{pr_number} було закрито без мерджу. Локальна гілка не буде видалена.")
                break

            elif pr_state == "OPEN":
                check_status = pr_checks if pr_checks else "PENDING"
                
                # Якщо тести впали, виходимо, щоб користувач міг виправити помилки.
                if check_status == "FAILURE":
                    print(f"❌ Тести на PR #{pr_number} провалилися. Автоматичне видалення скасовано.")
                    print("Будь ласка, перевірте PR і виправте проблеми.")
                    break
                # В іншому випадку — чекаємо та повторюємо перевірку.
                elif check_status == "SUCCESS":
                    print(f"⏳ PR #{pr_number} відкритий, тести пройшли успішно. Очікуємо на мердж... (Перевірка через 30с)")
                else:  # PENDING
                    print(f"⏳ PR #{pr_number} відкритий, тести виконуються... (Перевірка через 30с)")
                
                time.sleep(30)

        # Дозволяємо користувачу перервати спостереження за допомогою Ctrl+C.
        except KeyboardInterrupt:
            print("\n👋 Спостереження зупинено користувачем.")
            break
        except Exception as e:
            print(f"\nПомилка під час спостереження: {e}")
            print("Зупиняю спостереження.")
            break


# Точка входу в скрипт: якщо файл запускається напряму, виконати функцію main.
if __name__ == "__main__":
    main()