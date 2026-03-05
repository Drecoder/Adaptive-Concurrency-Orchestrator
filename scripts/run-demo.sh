#!/bin/bash
# 🚀 ForMedics Orchestrator Full Demo Runner (Folder-specific)

# --- Colors ---
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
NC="\033[0m" # No Color

echo -e "${YELLOW}🛫 Starting ForMedics Orchestrator Demo...${NC}"

# --- Determine Simulation Mode ---
SIM_MODE=${1:-demo}  # default to 'demo' if no argument
if [[ "$SIM_MODE" == "chaos" ]]; then
    SIM_SCRIPT="scripts/chaos-search-spike.js"
    echo -e "${RED}⚡ Running CHAOS mode simulation!${NC}"
else
    SIM_SCRIPT="scripts/simulates-search-spike.js"
    echo -e "${GREEN}🛡️ Running demo-friendly simulation${NC}"
fi

# --- Cleanup Function ---
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up servers and log tails...${NC}"
    [[ ! -z "$WP_PID" ]] && kill $WP_PID 2>/dev/null
    [[ ! -z "$ORCH_PID" ]] && kill $ORCH_PID 2>/dev/null
    [[ ! -z "$TAIL_WP_PID" ]] && kill $TAIL_WP_PID 2>/dev/null
    [[ ! -z "$TAIL_ORCH_PID" ]] && kill $TAIL_ORCH_PID 2>/dev/null
    rm -f wp.log orch.log
    echo -e "${GREEN}✅ Demo complete.${NC}"
}
trap cleanup EXIT

# --- 1️⃣ Pre-Flight IAM Check ---
echo -e "\n${GREEN}🔍 Step 1: Pre-Flight IAM & Connectivity Check${NC}"
node scripts/verify-gcp-permissions.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Pre-flight failed. Exiting.${NC}"
    exit 1
fi

# --- 2️⃣ Start Mock WordPress Server ---
echo -e "\n${GREEN}📡 Step 2: Starting Mock WordPress Server (http://localhost:8080)${NC}"
node scripts/mock-wp.js > wp.log 2>&1 &
WP_PID=$!
echo -e "Mock WP PID: $WP_PID"

# --- 3️⃣ Start Local Orchestrator ---
echo -e "\n${GREEN}🛡️ Step 3: Starting Local Orchestrator (http://localhost:3000)${NC}"
node scripts/index.js > orch.log 2>&1 &
ORCH_PID=$!
echo -e "Orchestrator PID: $ORCH_PID"

# Give servers a few seconds to start
sleep 5

# --- 4️⃣ Tail Logs in Background ---
tail -f wp.log | while read line; do echo -e "${CYAN}[WP]${NC} $line"; done &
TAIL_WP_PID=$!
tail -f orch.log | while read line; do echo -e "${GREEN}[ORCH]${NC} $line"; done &
TAIL_ORCH_PID=$!

# --- 5️⃣ Run Priority Simulation ---
echo -e "\n${GREEN}🎯 Step 4: Running Priority Simulation${NC}"
node scripts/simulate.js
sleep 2

# --- 6️⃣ Run Selected Search Spike Simulation ---
echo -e "\n${GREEN}🔥 Step 5: Running Search Spike Simulation (${SIM_MODE} mode)${NC}"
node $SIM_SCRIPT
sleep 1