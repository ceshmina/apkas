# database

For migration

## Create user

On master user,

```sql
create database apkas;

create user apkas_user with password 'xxx';
grant connect on database apkas to apkas_user;
grant create on database apkas to apkas_user;
```
