# Linux 知识总结

> 以常见服务器发行版（CentOS / Ubuntu）为主，目标是「会用、能排查」。

## 1. 概述与发行版

- Linux 是类 Unix 内核的开源操作系统，一切皆文件、多用户多任务。
- 主要发行版：
  - **Debian 系**：Ubuntu（apt 包管理）
  - **RedHat 系**：CentOS / Rocky / AlmaLinux（yum / dnf 包管理）
- 内核查看：`uname -r`，发行版查看：`cat /etc/os-release`。

## 2. 目录结构（FHS）

| 目录 | 用途 |
|---|---|
| `/` | 根目录 |
| `/bin` `/sbin` | 基本命令（多为 `/usr/bin` 软链） |
| `/etc` | 配置文件 |
| `/home` | 普通用户家目录 |
| `/root` | root 家目录 |
| `/var` | 可变数据：日志 `/var/log`、`/var/lib` |
| `/tmp` | 临时文件 |
| `/usr` | 软件与库 |
| `/opt` | 第三方软件 |
| `/proc` `/sys` | 内核与进程虚拟文件系统 |
| `/dev` | 设备文件 |
| `/boot` | 内核与引导文件 |

## 3. 文件与权限

```bash
-rw-r--r-- 1 root root 1024 Nov  2 10:00 file.txt
# 类型(1位) + 权限(9位:属主/属组/其他) + 链接数 + 属主 + 属组 + 大小 + 时间 + 名
```

- 权限：`r`(4) 读、`w`(2) 写、`x`(1) 执行。
- 常用操作：

```bash
chmod 755 script.sh        # 数字授权
chmod u+x,g-w file          # 符号授权 (u/g/o/a, +-=)
chown user:group file       # 改属主属组
chown -R user:group dir/    # 递归
umask 022                   # 新建文件默认权限掩码
```

- 特殊权限：`SUID`(4)、`SGID`(2)、`Sticky`(1)，如 `/usr/bin/passwd` 带 SUID。

## 4. 用户与用户组

```bash
useradd -m -s /bin/bash zhangsan   # 建用户
passwd zhangsan                    # 设密码
usermod -aG sudo zhangsan          # 加入 sudo 组
userdel -r zhangsan                # 删用户及家目录

groupadd dev                        # 建组
id zhangsan                         # 查看 uid/gid/组
whoami / who / w                    # 当前用户、在线用户
su - zhangsan                       # 切换用户
sudo command                        # 提权执行
```

## 5. 常用文件与文本命令

```bash
ls -la / pwd / cd / tree
mkdir -p a/b/c ; touch file ; cp -r ; mv ; rm -rf
cat / less / head -n 20 / tail -f  # 查看、跟踪
echo / printf                       # 输出
find / -name "*.log" -type f        # 查找
which / whereis / type              # 定位命令
ln -s /path/target link             # 软链接
wc -l file                          # 统计行数
sort / uniq / cut / tr / paste / join
```

## 6. 文本三剑客

```bash
# grep：过滤
grep -n -i -r "error" /var/log -C 2
grep -E "a|b" file            # 正则

# sed：行编辑
sed -n '5,10p' file           # 打印
sed -i 's/old/new/g' file     # 替换
sed -i '/^#/d' file           # 删注释行

# awk：按列处理
awk '{print $1, $3}' file
awk -F: '/root/{print $6}' /etc/passwd
awk '{sum+=$1} END{print sum}' data.txt
```

## 7. 进程管理

```bash
ps -ef / ps aux              # 查看进程
top / htop                  # 实时监控
pgrep -f "nginx" ; pidof nginx
kill -9 PID ; kill -15 PID  # 强杀 / 优雅退出
killall nginx ; pkill -f pattern

nohup cmd > out.log 2>&1 &  # 后台运行
jobs / fg / bg               # 前后台切换
# 命令后台执行 Ctrl+Z 挂起，bg 继续
```

## 8. 系统服务 systemd

```bash
systemctl status nginx.service     # 状态
systemctl start|stop|restart|reload nginx
systemctl enable|disable nginx     # 开机自启
systemctl list-units --type=service --state=running
journalctl -u nginx -f             # 查看服务日志
journalctl -xe                     # 最近日志（排错）
```

## 9. 磁盘与文件系统

```bash
df -h       # 分区使用率
du -sh *    # 目录大小
lsblk       # 块设备
fdisk -l / parted -l
mount /dev/sdb1 /mnt ; umount /mnt
blkid       # 查看 UUID
```

- 分区/格式化/挂载（示例）：

```bash
parted /dev/sdb mklabel gpt mkpart primary 0% 100%
mkfs.ext4 /dev/sdb1        # 或 mkfs.xfs
mkdir -p /data && mount /dev/sdb1 /data
# 开机挂载：写入 /etc/fstab，格式：设备 挂载点 类型 defaults 0 0
```

- inode 与磁盘满排查：`df -i`（inode 占用）；`du -sh` 定位大文件。

## 10. 网络

```bash
ip addr / ip route / ip link     # 现代网络配置
ifconfig / route (旧)            # net-tools
ping / traceroute / mtr
ss -tlnp                         # 监听端口
ss -anp                          # 连接状态
netstat -tlnp (旧)
curl -I https://example.com ; wget url
scp file user@host:/path ; rsync -avz src/ dst/
```

- 防火墙（firewalld）：

```bash
systemctl status firewalld
firewall-cmd --list-ports
firewall-cmd --add-port=8080/tcp --permanent && firewall-cmd --reload
```

- DNS / hosts：`cat /etc/resolv.conf`、`cat /etc/hosts`。

## 11. 性能监控

```bash
top                     # CPU/内存/负载
free -h                 # 内存
vmstat 1 5              # CPU/内存/IO 采样
iostat -x 1             # 磁盘 IO
sar -u 1 5              # 历史性能
uptime                  # 负载 1/5/15 分钟
dmesg | tail            # 内核 OOM 等
```

- 关键指标：load average（1/5/15）、CPU us/sy/wa、内存 free/available、磁盘 `%util`、`wa`(IO 等待)。

## 12. 软件包管理

```bash
# Debian/Ubuntu (apt)
apt update && apt upgrade
apt install pkg ; apt remove pkg ; apt search pkg

# RedHat/CentOS (yum/dnf)
yum install pkg ; yum update ; yum remove pkg
rpm -qa | grep pkg        # 查询已装

# 源码安装
./configure --prefix=/usr/local/app && make && make install
```

## 13. Shell 脚本基础

```bash
#!/bin/bash
set -euo pipefail          # 遇错退出、未定义变量报错

NAME="world"
ARR=(a b c)
echo "hello ${NAME}"        # $1 第一个参数, $# 参数个数, $? 上条退出码

if [ "$1" = "start" ]; then
  echo "start"
elif [ -f /etc/x ]; then
  echo "file exists"
else
  echo "other"
fi

for i in "${ARR[@]}"; do echo "$i"; done
while read line; do echo "$line"; done < file.txt

function hello() { echo "$@"; }
hello a b c
```

- 条件判断：`-f` 文件、`-d` 目录、`-n/-z` 字符串、`-eq/-ne/-lt/-gt` 数字、`&&/||`。

## 14. 高频排错清单

| 现象 | 排查命令 |
|---|---|
| 端口占用 | `ss -tlnp \| grep 8080` |
| 磁盘满 | `df -h`、`du -sh /*` 定位 |
| inode 满 | `df -i`、`find / -xdev -type f \| wc -l` |
| 内存不足 / OOM | `free -h`、`dmesg \| grep -i oom` |
| CPU 高 | `top` 找进程 → `top -Hp PID` 找线程 |
| 负载高 | `uptime`、`vmstat 1`、`iostat -x 1` |
| 网络不通 | `ping`→`traceroute`→`ss -tln`→`firewall-cmd` |
| 服务起不来 | `systemctl status`、`journalctl -xe -u 服务` |
| 文件/命令找不到 | `which`、`echo $PATH`、`rpm -qa \| grep` |

---

> 掌握以上内容即可覆盖日常运维、开发部署与面试中大多数 Linux 考点。