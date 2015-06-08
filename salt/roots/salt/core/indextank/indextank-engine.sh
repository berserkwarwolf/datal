#!/bin/bash

cd /usr/share/indextank-engine
exec java -cp target/indextank-engine-1.0.0-jar-with-dependencies.jar com.flaptor.indextank.api.Launcherc --load-state true < /dev/null > /tmp/indextank-engine.log 2>&1 &

