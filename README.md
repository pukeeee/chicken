## Setup

```bash
docker-compose up --build
```

---

SQL
```bash
docker ps
```
```bash
docker exec -it kurochka-postgres-1 psql -U postgres -d kurochka
```
```sql
SELECT * FROM "User";
```
---
```bash
alias dbshell='docker exec -it kurochka-postgres-1 psql -U postgres -d myapp'
dbshell
```