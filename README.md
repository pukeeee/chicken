## Setup

```bash
docker-compose up -d --build
```
```bash
docker-compose exec app npx prisma migrate dev
docker-compose exec app npx prisma db seed
```

---

```bash
docker ps
```

---

SQL
```bash
docker exec -it kurochka-postgres-1 psql -U postgres -d mydb
```
```sql
SELECT * FROM "User";
```
