#!/bin/bash
# End-to-end smoke test of CampConnect DB logic via Supabase REST (spec-driven, not code-driven)
set -u
URL=$(grep URL "$(dirname "$0")/../.env" | cut -d= -f2)
KEY=$(grep ANON "$(dirname "$0")/../.env" | cut -d= -f2)
PASS=test123456
j() { python -c "import sys,json;d=json.load(sys.stdin);print(d$1)" 2>/dev/null; }

token() { # email -> token (signs up if needed)
  local t
  t=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" \
    -d "{\"email\":\"$1\",\"password\":\"$PASS\"}" | j "['access_token']")
  if [ -z "$t" ]; then
    t=$(curl -s -X POST "$URL/auth/v1/signup" -H "apikey: $KEY" -H "Content-Type: application/json" \
      -d "{\"email\":\"$1\",\"password\":\"$PASS\",\"data\":{\"display_name\":\"$2\"}}" | j "['access_token']")
  fi
  echo "$t"
}
api() { # token method path [body]
  local T=$1 M=$2 P=$3 B=${4:-}
  if [ -n "$B" ]; then
    curl -s -X "$M" "$URL$P" -H "apikey: $KEY" -H "Authorization: Bearer $T" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "$B"
  else
    curl -s -X "$M" "$URL$P" -H "apikey: $KEY" -H "Authorization: Bearer $T" -H "Prefer: return=representation"
  fi
}
check() { # name expected actual
  if [ "$2" = "$3" ]; then echo "PASS: $1"; else echo "FAIL: $1 (expected [$2] got [$3])"; fi
}

T1=$(token campconnect.test1@example.com "Test One")
T2=$(token campconnect.test2@example.com "Test Two")
T3=$(token campconnect.test3@example.com "Test Three")

# --- hike with capacity 2, hosted by user1 ---
HIKE=$(api "$T1" POST /rest/v1/hikes '{"host_id":"'$(api "$T1" GET "/rest/v1/profiles?select=id&display_name=eq.Test%20One" | j "[0]['id']")'","name":"Smoke Hike","description":"d","location_name":"Testwald","lat":47.0,"lng":8.0,"date":"2027-01-01","time":"09:00","capacity":2,"carpool_enabled":true}' | j "[0]['id']")
echo "hike: $HIKE"

check "host joins own hike" "" "$(api "$T1" POST /rest/v1/rpc/join_hike "{\"p_hike_id\":\"$HIKE\"}" | j "['message']")"
check "second join ok"      "" "$(api "$T2" POST /rest/v1/rpc/join_hike "{\"p_hike_id\":\"$HIKE\"}" | j "['message']")"
check "third join -> hike_full" "hike_full" "$(api "$T3" POST /rest/v1/rpc/join_hike "{\"p_hike_id\":\"$HIKE\"}" | j "['message']")"
UID3=$(api "$T3" GET "/rest/v1/profiles?select=id&display_name=eq.Test%20Three" | j "[0]['id']")
check "direct insert into participants blocked" "42501" "$(api "$T3" POST /rest/v1/hike_participants "{\"hike_id\":\"$HIKE\",\"user_id\":\"$UID3\"}" | j "['code']")"

# --- carpool: user1 adds a 2-seat car, user2 joins, user3 (not participant) rejected ---
CAR=$(api "$T1" POST /rest/v1/rpc/add_car "{\"p_hike_id\":\"$HIKE\",\"p_capacity\":2}" | tr -d '"')
echo "car: $CAR"
check "rider joins car" "" "$(api "$T2" POST /rest/v1/rpc/join_car "{\"p_car_id\":\"$CAR\"}" | j "['message']")"
check "non-participant join_car rejected" "not_participant" "$(api "$T3" POST /rest/v1/rpc/join_car "{\"p_car_id\":\"$CAR\"}" | j "['message']")"
check "driver join_car rejected" "driver_has_car" "$(api "$T1" POST /rest/v1/rpc/join_car "{\"p_car_id\":\"$CAR\"}" | j "['message']")"

# --- car_full: car of capacity 2 = driver + 1 rider, so a 2nd rider must fail ---
# user2 leaves hike then rejoin as... simpler: temporarily raise hike capacity so a 3rd user can test car_full
api "$T1" PATCH "/rest/v1/hikes?id=eq.$HIKE" '{"capacity":5}' > /dev/null
api "$T3" POST /rest/v1/rpc/join_hike "{\"p_hike_id\":\"$HIKE\"}" > /dev/null
check "car_full enforced" "car_full" "$(api "$T3" POST /rest/v1/rpc/join_car "{\"p_car_id\":\"$CAR\"}" | j "['message']")"

# --- items ---
ITEM=$(api "$T2" POST /rest/v1/items "{\"hike_id\":\"$HIKE\",\"owner_id\":\"$(api "$T2" GET "/rest/v1/profiles?select=id&display_name=eq.Test%20Two" | j "[0]['id']")\",\"name\":\"Tent\",\"kind\":\"tool\"}" | j "[0]['id']")
check "participant adds item" "36" "${#ITEM}"
check "non-owner cannot load item" "not_your_car" "$(api "$T2" POST /rest/v1/rpc/set_item_car "{\"p_item_id\":\"$ITEM\",\"p_car_id\":\"$CAR\"}" | j "['message']")"
check "driver loads item into car" "" "$(api "$T1" POST /rest/v1/rpc/set_item_car "{\"p_item_id\":\"$ITEM\",\"p_car_id\":\"$CAR\"}" | j "['message']")"
DELCODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$URL/rest/v1/items?id=eq.$ITEM" -H "apikey: $KEY" -H "Authorization: Bearer $T3")
api "$T2" GET "/rest/v1/items?id=eq.$ITEM&select=id" | grep -q "$ITEM" && echo "PASS: non-owner delete blocked (item still there, code $DELCODE)" || echo "FAIL: non-owner deleted item"

# --- leave_hike cascades: user2 leaves -> rider row + item gone ---
api "$T2" POST /rest/v1/rpc/leave_hike "{\"p_hike_id\":\"$HIKE\"}" > /dev/null
RIDERS=$(api "$T1" GET "/rest/v1/car_riders?car_id=eq.$CAR&select=user_id")
check "leave_hike removes rider seat" "[]" "$RIDERS"
ITEMS=$(api "$T1" GET "/rest/v1/items?id=eq.$ITEM&select=id")
check "leave_hike removes items" "[]" "$ITEMS"

# --- cleanup ---
api "$T1" DELETE "/rest/v1/hikes?id=eq.$HIKE" > /dev/null
echo "cleaned up"
