# **Colonization Conquerors: Weekly Report**
___

### Team Status Update:
#### **Goals:**
- **Complete rough draft of...**
  - Interactive game map.
  - UI system.
  - Object select/placement.
  - Numerical player variables.
    - Score count.
    - Currency count.
    - Asset count.
#### **Progress:**
- **Started draft of...**
  - Interactive game map.
  - UI system.
  - Object select.
  - Numerical player variables.
    - Score count.
    - Currency count.
    - Asset count.
#### **Plans:**
- **Connect game map and UI system functionality to player variables and add sprites.**
- **Continue to design and delegate other game mechanics/resources:**
  - Weather events.
  - Fishing events.
  - Rebel events.
  - Better in-game sprites.
  - More fleshed out UI/map design.
#
### Individual Contributions:

#### **Timothy Enders:**
- **Goals:**
  - Complete the sprite creation process.
  - Complete the process of ensuring that the game's user interface is fully functional and responsive for both players, free from any issues.
- **Progress:**
  - The world user interface underwent modifications.
    - Increased tile size for improved visibility into the cell interior.
    - The land and sea illustration sprite has been updated to eliminate any noticeable clipping.
    - Modified the dimensions and placements of the tilemap and scoreboard to enhance the overall design.
    - Incorporated an out-of-bounds tilemap to occupy the remaining screen space.
    - Slight adjustments to the size of each island to ensure equal spacing for fairness.
  - When a game match begins, two cursors appear—one for player one and another for player two.
    - The cursors can be moved using keyboard keys in any direction, but it cannot go beyond the boundaries of the tilemap.
    - If the cursors are on the same tile space, the merged cursors will display a distinct color.
- **Plans:**
  - Start generating sprites for the game.
  - Add a keybinding to enable cursor switching, allowing it to move to a tile upon a mouse click.
  - Create keyboard shortcuts to swiftly generate constructible items.

#
#### **Grant Palmieri:**
- **Goals:**
  - Complete the sprite creation process.
- **Progress:**
  - Designed a range of sprites for in-game objects that can be placed within the game environment.
  - Examined and resolved issues related to player movement through the implementation of keybindings.
- **Plans:**
  - Keep generating sprites for the game.

#
#### **Joshua Murillo:**
- **Goals:**
  -  Finish tilemap.
    - Tilemap includes a crude layout of the two territories (land and sea) used for gameplay mechanics.
  - Add sidebar buttons.
    - Buttons are selectable (one at a time for an individual player).
    - While held, the game will place the respective object onto the last selected tile.
    - If player currency is more than object price, the object is placed onto that tile.
- **Progress:**
  - Crude tilemap was completed:
    - Map tiles can be selected by a single player (For multiple players to move around separately, see Timothy Enders' progress section).
  - Sidebar buttons in-progress:
    - Sidebar starter UI is complete.
    - Buttons are selectable and can access global player selected tile memory.
    - Buttons cannot place objects yet, but functionality for this will be completed soon.
- **Plans:**
  - Complete sidebar button functionality.
    - Add connections between player numerical info, map data, and button functionality.
#
#### **Zachary Thomas:**
- **Goals:**
  - ?
- **Progress:**
  - ?
- **Plans:**
  - ?
