# MySQL 具体操作指南

> 环境：MySQL 8 / InnoDB

## 1. 连接与库表管理

```sql
-- 连接
mysql -uroot -p -h127.0.0.1 -P3306

-- 数据库
SHOW DATABASES;
CREATE DATABASE demo CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE demo;

-- 建表
CREATE TABLE users (
  id        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name      VARCHAR(50)     NOT NULL,
  email     VARCHAR(100)    NOT NULL,
  age       TINYINT UNSIGNED DEFAULT 0,
  balance   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  created_at DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email (email),
  KEY idx_age (age)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 查看/修改表结构
SHOW CREATE TABLE users;
DESC users;
ALTER TABLE users ADD COLUMN status TINYINT NOT NULL DEFAULT 1;
ALTER TABLE users DROP COLUMN status;
```

## 2. 增删改查（DML / DQL）

```sql
INSERT INTO users (name, email, age, balance)
VALUES ('张三', 'zs@example.com', 28, 100.50);

UPDATE users SET balance = balance + 10 WHERE id = 1;
DELETE FROM users WHERE id = 1;

SELECT id, name FROM users
WHERE age >= 18 AND balance > 0
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;

-- 聚合与分组
SELECT age, COUNT(*) AS cnt, AVG(balance) AS avg_bal
FROM users GROUP BY age HAVING cnt > 1;
```

## 3. 索引操作

```sql
-- 查看某表索引
SHOW INDEX FROM users;

-- 建/删索引
CREATE INDEX idx_name ON users(name);
CREATE INDEX idx_age_name ON users(age, name);   -- 联合索引
DROP INDEX idx_name ON users;
```

## 4. EXPLAIN 分析执行计划

```sql
EXPLAIN
SELECT * FROM users WHERE age = 28 AND name = '张三';

-- 关键列：type=ref/const 好，ALL 全表扫；key=命中的索引；
-- Extra 若出现 Using filesort / Using temporary 需优化
```

## 5. 事务与隔离级别

```sql
-- 查看/设置隔离级别
SELECT @@transaction_isolation;
SET SESSION transaction_isolation = 'READ-COMMITTED';

START TRANSACTION;
UPDATE users SET balance = balance - 10 WHERE id = 1;
-- 确认前未提交，其它事务不可见（取决于隔离级别）
COMMIT;   -- 或 ROLLBACK;

-- 显式加锁
SELECT * FROM users WHERE id = 1 FOR UPDATE;           -- 排他锁
SELECT * FROM users WHERE id = 1 LOCK IN SHARE MODE;   -- 共享锁（8.0 用 FOR SHARE）
```

## 6. 查看锁与死锁

```sql
-- 当前事务与锁
SELECT * FROM information_schema.INNODB_TRX;        -- 活动事务
SELECT * FROM information_schema.INNODB_LOCKS;      -- 锁（8.0 用 performance_schema.data_locks）
SELECT * FROM performance_schema.data_locks;
-- 最近一次死锁
SHOW ENGINE INNODB STATUS\G   -- 找 LATEST DETECTED DEADLOCK
```

## 7. 日志与慢查询

```sql
-- 开启慢查询定位
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;              -- 超过 1 秒记录
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';

-- redo / undo / binlog 状态
SHOW VARIABLES LIKE 'log_bin%';
SHOW BINARY LOGS;
SHOW MASTER STATUS;
```

## 8. 主从复制（简版）

```sql
-- 主库配置 my.cnf：[mysqld] server-id=1, log_bin=mysql-bin, 并创建复制账号
CREATE USER 'repl'@'%' IDENTIFIED BY 'pass';
GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
-- 记下 SHOW MASTER STATUS 的 File 与 Position

-- 从库配置 my.cnf：[mysqld] server-id=2，然后执行
CHANGE MASTER TO
  MASTER_HOST='主库IP', MASTER_USER='repl', MASTER_PASSWORD='pass',
  MASTER_LOG_FILE='mysql-bin.000001', MASTER_LOG_POS=154;
START REPLICA;      -- 8.0（老版本用 START SLAVE）
SHOW REPLICA STATUS\G   -- 看 Slave_IO_Running / Slave_SQL_Running 是否为 Yes
```

## 9. 备份与恢复

```bash
# 逻辑备份
mysqldump -uroot -p --single-transaction --master-data=2 demo > demo.sql
# 恢复
mysql -uroot -p demo < demo.sql

# 只导出结构 / 只导出数据
mysqldump -uroot -p --no-data demo > schema.sql
mysqldump -uroot -p --no-create-info demo > data.sql
```