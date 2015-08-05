redis-server:
  pkg.installed

redis-flush:
  cmd.run:
    - name: redis-cli FLUSHALL
