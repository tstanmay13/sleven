# Elevens Game - Alternative Mechanics

This file contains alternative game mechanics that were considered for making the dice rolling challenging when drunk.

## 1. Precision Flick Challenge (Implemented)
- Draw a specific path/angle with your finger
- Must flick along the path to roll dice
- Drunk people naturally lose fine motor control
- No artificial difficulty - just requires steady, precise movement

## 2. Balance & Tilt
Use phone's gyroscope to "balance" dice on screen:
- Tilt phone to keep dice in center zone for 3 seconds
- Then quick tilt to "roll" them
- Drunk people naturally have worse balance
- Could show a bubble level indicator
- Dice could slide around based on tilt

## 3. Pattern Trace
Show a simple pattern that must be traced:
- Display patterns like figure-8, infinity symbol, or star
- Must trace it accurately to charge up the roll
- Natural difficulty when drunk due to shaky hands
- Could increase pattern complexity over time

## 4. Focus & Timing
Dice spin rapidly on screen:
- Must tap both when they show the same face
- Requires focus and timing (hard when drunk)
- Could add "ghost" dice as distractions
- Speed could vary to throw off timing

## 5. Find and Balance the Dice
Original "drunk simulation" concept:
- Dice appear randomly on screen and move/wobble
- Player must tap and hold both dice simultaneously
- Screen effects like blur/wobble (artificial difficulty)
- Decoy dice appear as distractions

## Additional Difficulty Modifiers Considered

### Dynamic Difficulty
- Path gets thinner (harder to stay on)
- Add "precision zones" where you must go extra slow
- Time pressure - path fades if you're too slow
- Multiple paths appear, only one is correct

### Additional Challenges
- Path moves/wobbles slightly
- Need to maintain constant speed (not too fast/slow)
- "Danger zones" on the path that reset your progress
- Must collect checkpoints along the path

### Physical Challenges
- Two-finger mode: trace with one finger while holding another point
- Reverse tracing: go backwards along the path
- Pressure sensitivity: must press harder/lighter in certain zones

## Technical Notes
- Shake detection was attempted but iOS shake-to-undo gesture interferes
- HTTPS required for motion sensors on iOS 13+
- Touch events more reliable than motion events across devices