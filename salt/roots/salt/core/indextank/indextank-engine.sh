#!/bin/bash

start() {
        echo "Starting Indextank server"
        cd /usr/share/indextank-engine
        exec java -cp target/indextank-engine-1.0.0-jar-with-dependencies.jar com.flaptor.indextank.api.Launcher --load-state true < /dev/null > /tmp/indextank-engine.log 2>&1 &

        ### Create the lock file ###
        echo $! > /var/run/indextank.pid
        echo
}

stop() {
        echo "Stopping IndexTank server"
        kill -9 $(cat /var/run/indextank.pid)
        ### Now, delete the lock file ###
        rm -f /var/run/indextank.pid
        echo
}

### main logic ###
case "$1" in
  start)
        start
        ;;
  stop)
        stop
        ;;
  restart)
        stop
        start
        ;;
  *)
        echo $"Usage: $0 {start|stop|restart}"
        exit 1
esac
exit 0