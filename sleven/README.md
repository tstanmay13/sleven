# Elevens Dice Game

## How to Run Locally

1. Navigate to the game directory:
```bash
cd /Users/tanmay/Documents/personal/sleven/sleven
```

2. Start the HTTPS server (required for mobile):
```bash
python3 server.py
```

3. On your phone:
- Connect to the same WiFi network as your computer
- Open your mobile browser
- Visit: `https://192.168.4.70:8443`
- **Accept the security warning** (this is normal for self-signed certificates)

## How to Play

**The Challenge:**
1. 📐 **Trace the Path** - Follow the curved line with your finger
2. 🎯 **Stay Accurate** - The accuracy bar shows how well you're doing
3. 🚀 **Flick to Roll** - At the end, flick upward to throw the dice!

**Why it's hard when drunk:**
- Requires precise finger control
- Needs steady hand movement
- Demands good hand-eye coordination
- The worse your tracing, the weaker your roll!

**Game Rules:**
- Roll 7 or 11: Take a drink
- Roll doubles: Give out drinks
- Snake eyes (1,1): Everyone drinks
- Other rolls: Pass the phone

## About the Files

- **server.py**: Creates HTTPS server for mobile access
- **server.pem**: Auto-generated SSL certificate (created when you run server.py)
- **app.js**: Main game logic with path tracing mechanics
- **styles.css**: Modern mobile-first styling
- **index.html**: Game interface

## Troubleshooting

- **Certificate warning?** This is normal for local testing - accept it to continue
- **Can't connect?** Check your local IP with `ifconfig | grep "inet "`
- **Path too easy?** The paths change each roll, but drunk fingers make it harder!

## Technical Notes

- Uses SVG for smooth path rendering
- Touch events for precise tracking
- Real-time accuracy calculation
- Haptic feedback for better feel