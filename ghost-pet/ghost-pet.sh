#!/usr/bin/env bash
set -euo pipefail

STATE_FILE="/tmp/ghost-pet.json"

init_state() {
  if [ ! -f "$STATE_FILE" ]; then
    cat > "$STATE_FILE" <<EOF
{"mood":"idle","happiness":80,"last_change":0}
EOF
  fi
}

read_state() { init_state; cat "$STATE_FILE"; }
write_state() { echo "$1" > "$STATE_FILE"; }
now_ts() { date +%s; }

# moods: idle, happy, sad, sleeping, eating, playing, excited
# ghost frames per mood (2 frames each for animation)

ghost_idle() {
cat <<'GHOST'
   .-.     
  (o o)    
  | O |    
  '~~~'    
GHOST
}

ghost_idle2() {
cat <<'GHOST'
   .-.     
  (o o)    
  | O |    
  '~~~'    
GHOST
}

ghost_happy() {
cat <<'GHOST'
   .-.     
  (^ ^)    
  | ♥ |    
  '~~~'    
   boo!    
GHOST
}

ghost_sad() {
cat <<'GHOST'
   .-.     
  (T T)    
  |   |    
  '~~~'    
GHOST
}

ghost_sleeping() {
cat <<'GHOST'
   .-.     
  (- -)    
  | z |    
  '~~~'    
GHOST
}

ghost_eating() {
cat <<'GHOST'
   .-.     
  (o o)    
  | ω |    
  '~~~'    
   nom~    
GHOST
}

ghost_playing() {
cat <<'GHOST'
   .-.     
  (^ ^)    
  | ω |    
  '~~~'    
   ~~~     
GHOST
}

ghost_excited() {
cat <<'GHOST'
   .-.     
  (^ ^)    
  | ♥ |    
  '~~~'    
   BOO!    
GHOST
}

render_ghost() {
  local mood="$1"
  local frame="${2:-0}"
  case "$mood" in
    happy)    ghost_happy    ;;
    sad)      ghost_sad       ;;
    sleeping) ghost_sleeping  ;;
    eating)   ghost_eating    ;;
    playing)  ghost_playing   ;;
    excited)  ghost_excited   ;;
    *)        ghost_idle      ;;
  esac
}

meter_bar() {
  local value="$1"
  local filled=$(( value * 8 / 100 ))
  local empty=$(( 8 - filled ))
  local bar="" i
  for (( i=0; i<filled; i++ )); do bar+="█"; done
  for (( i=0; i<empty; i++ )); do bar+="░"; done
  echo "$bar"
}

mood_emoji() {
  case "$1" in
    happy)    echo "😊" ;;
    sad)      echo "😢" ;;
    sleeping) echo "😴" ;;
    eating)   echo "🍖" ;;
    playing)  echo "🎮" ;;
    excited)  echo "⚡" ;;
    *)        echo "👻" ;;
  esac
}

cmd_show() {
  local state
  state=$(read_state)
  local mood happiness
  mood=$(echo "$state" | jq -r '.mood')
  happiness=$(echo "$state" | jq '.happiness')

  local bar
  bar=$(meter_bar "$happiness")

  echo ""
  render_ghost "$mood"
  echo ""
  echo " 👻 ghost | $(mood_emoji "$mood") $mood | happy: $bar $happiness%"
  echo ""
}

clamp() {
  local val="$1" min="$2" max="$3"
  if [ "$val" -lt "$min" ]; then echo "$min"
  elif [ "$val" -gt "$max" ]; then echo "$max"
  else echo "$val"
  fi
}

cmd_happy() {
  local state
  state=$(read_state)
  local h
  h=$(echo "$state" | jq '.happiness')
  h=$(clamp $((h + 5)) 0 100)
  state=$(echo "$state" | jq --arg h "$h" '.happiness = ($h | tonumber) | .mood = "happy" | .last_change = (now | floor)')
  write_state "$state"
}

cmd_sad() {
  local state
  state=$(read_state)
  local h
  h=$(echo "$state" | jq '.happiness')
  h=$(clamp $((h - 10)) 0 100)
  state=$(echo "$state" | jq --arg h "$h" '.happiness = ($h | tonumber) | .mood = "sad" | .last_change = (now | floor)')
  write_state "$state"
}

cmd_eating() {
  local state
  state=$(read_state)
  local h
  h=$(echo "$state" | jq '.happiness')
  h=$(clamp $((h + 15)) 0 100)
  state=$(echo "$state" | jq --arg h "$h" '.happiness = ($h | tonumber) | .mood = "eating" | .last_change = (now | floor)')
  write_state "$state"
  echo "🍖 Fed the ghost!"
  cmd_show
}

cmd_playing() {
  local state
  state=$(read_state)
  local h
  h=$(echo "$state" | jq '.happiness')
  h=$(clamp $((h + 20)) 0 100)
  state=$(echo "$state" | jq --arg h "$h" '.happiness = ($h | tonumber) | .mood = "playing" | .last_change = (now | floor)')
  write_state "$state"
  echo "🎮 Played with the ghost!"
  cmd_show
}

cmd_pet() {
  local state
  state=$(read_state)
  local h
  h=$(echo "$state" | jq '.happiness')
  h=$(clamp $((h + 10)) 0 100)
  state=$(echo "$state" | jq --arg h "$h" '.happiness = ($h | tonumber) | .mood = "happy" | .last_change = (now | floor)')
  write_state "$state"
  echo "❤️ Pet the ghost!"
  cmd_show
}

cmd_reset() {
  rm -f "$STATE_FILE"
  init_state
  echo "🔄 Ghost reset!"
  cmd_show
}

COMMAND="${1:-show}"

case "$COMMAND" in
  show)   cmd_show   ;;
  feed|eating) cmd_eating ;;
  play|playing) cmd_playing ;;
  pet|happy)    cmd_pet    ;;
  sad)   cmd_sad    ;;
  reset)  cmd_reset  ;;
  *)
    echo "👻 ghost-pet - a little ghost for your terminal"
    echo ""
    echo "Usage: ghost-pet.sh <command>"
    echo ""
    echo "Commands: show, feed, play, pet, sad, reset"
    ;;
esac