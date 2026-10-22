#!/usr/bin/env bash
# Post-deploy smoke test against the live site.   usage: scripts/smoke.sh [https://sakhilebhayi.com]
set -uo pipefail
BASE="${1:-https://sakhilebhayi.com}"; HOST="${BASE#https://}"; fail=0
ok(){ echo "  ok   $1"; }; bad(){ echo "  FAIL $1"; fail=1; }
for path in / /work/ /approach/ /about/ /contact/; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE$path"); [ "$code" = 200 ] && ok "$path 200" || bad "$path -> $code"
done
# read the page into a variable first: with pipefail, `curl | grep -q` fails when grep exits early and closes the pipe
home=$(curl -s --max-time 20 "$BASE/")
case "$home" in *'Dot.Eco-system'*) ok "home carries the new copy";; *) bad "home does not carry the new copy";; esac
code=$(curl -s -o /tmp/nf.html -w '%{http_code}' --max-time 20 "$BASE/nope-$RANDOM"); [ "$code" = 404 ] && grep -q 'Page not found' /tmp/nf.html && ok "unknown path -> 404 page" || bad "unknown path -> $code (expected the 404 page)"
loc=$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 20 "http://$HOST/"); [ "$loc" = "$BASE/" ] && ok "http -> https" || bad "http redirect gave '$loc'"
loc=$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 20 "https://www.$HOST/"); [ "$loc" = "$BASE/" ] && ok "www -> apex" || bad "www redirect gave '$loc'"
for f in /site.css /assets/js/motion.js /sitemap.xml /llms.txt; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "$BASE$f"); [ "$code" = 200 ] && ok "$f 200" || bad "$f -> $code"
done
exit $fail
