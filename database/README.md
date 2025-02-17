# database

For migration

## Create user

On master user,

```sql
create database apkas;
\c apkas apkas_admin

create user apkas_user with password 'xxx';
grant all privileges on database apkas to apkas_user;
grant all on schema public to apkas_user;
```

## Create revision

```bash
uv run alembic revision -m 'xxx'
```

## Upgrade to head

```bash
aws sso login --profile ${PROFILE}
export AWS_PROFILE=${PROFILE}
uv run alembic upgrade head
```
