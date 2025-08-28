## Setup

```bash
docker-compose up -d app-dev
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
docker-compose exec postgres-dev psql -U postgres -d devDB
```
```sql
SELECT * FROM "User";
```
