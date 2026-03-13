# Step 6-03: DB 영속화

## Status: TODO

## Description
localStorage → DB 마이그레이션으로 히스토리/캐시 영속화

## Tasks
- [ ] DB 선택 (PostgreSQL + Prisma / Supabase / PlanetScale)
- [ ] 스키마 설계 (users, estimates, cache)
- [ ] Prisma ORM 설정 및 마이그레이션
- [ ] history.ts를 DB 기반으로 교체
- [ ] cache.ts를 DB 기반으로 교체 (선택)
- [ ] 레이트 리밋을 Redis/DB 기반으로 교체

## Files
- `prisma/schema.prisma`
- `lib/db.ts`
- `lib/history.ts` (DB 전환)

## Estimate
~2시간
