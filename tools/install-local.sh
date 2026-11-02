#!/usr/bin/env bash
# Local install (macOS / Linux) for the AI-augmented PDLC hackathon, without admin rights.
#   curl -fsSL <raw url of this file> | bash -s -- squad-a-policy      (or squad-b-outreach, squad-c-insight)
# Clones the Context Nexus and the squad's starter into ~/kolecto-hackathon/, then runs the starter's setup script.
set -euo pipefail

SQUAD="${1:-}"
ORG="${ORG:-https://github.com/Zenika-Training}"
DIR="${HACKATHON_DIR:-$HOME/kolecto-hackathon}"
case "$SQUAD" in squad-a-policy|squad-b-outreach|squad-c-insight) ;; *) echo "Usage: … | bash -s -- squad-a-policy|squad-b-outreach|squad-c-insight"; exit 2;; esac

command -v git >/dev/null || { echo "✗ Git is required"; exit 1; }
command -v node >/dev/null || { echo "✗ Node.js ≥ 22.12 is required (https://nodejs.org)"; exit 1; }
node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&b>=12)?0:1)' || { echo "✗ Node.js ≥ 22.12 is required (found $(node -v))"; exit 1; }

mkdir -p "$DIR" && cd "$DIR"
[ -d context-nexus/.git ] || git clone --quiet "$ORG/kolecto-sdlc-workshop-context-nexus.git" context-nexus
[ -d "starter-$SQUAD/.git" ] || git clone --quiet "$ORG/kolecto-sdlc-workshop-$SQUAD.git" "starter-$SQUAD"
cd "starter-$SQUAD"
SQUAD="$SQUAD" bash .devcontainer/post-create.sh

echo
echo "Next: cd \"$DIR/starter-$SQUAD\" && claude auth login && claude   (then type /welcome)"
