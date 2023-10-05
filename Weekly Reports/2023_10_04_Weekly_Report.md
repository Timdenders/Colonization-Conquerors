# **Colonization Conquerors: Weekly Report**
___

### Team Status Update:
#### **Goals:**
- **Connect game map and UI system functionality to player variables and add sprites.**
- **Working player variables.**
  - Score count.
  - Currency count.
  - Asset count.

#### **Progress:**
- **Keeping track of object placements and player to object relations.**
- **Created better in-game sprites.**
- **Congregated for a 15 minute meeting to disscuss the project's progression and assign more roles to team members.**

#### **Plans:**
- **Have a working protoype of the game's core mechanics.**
- **Begin implementation of secondary game mechanics:**
  - Weather events.
  - Fishing events.
  - Rebel events.
  - More fleshed out UI/map design.

#
### Individual Contributions:

#### **Timothy Enders:**
- **Goals:**
  - Start generating sprites for the game.
  - Add a keybinding to enable cursor switching, allowing it to move to a tile upon a mouse click.
  - Create keyboard shortcuts to swiftly generate constructible items.
- **Progress:**
  - Established a new overlay layer on the tile map for precise object placement on the map.
    - Repeated these steps for player one and two cursors.
  - Introduced player distinctions while using the player cursors in conjunction with the Sidebar buttons.
  - Made minor adjustments to the World UI to improve aesthetics.
  - Implemented the ability to place objects using keybinds.
  - Refined object placement:
    - Added a feature where a rebel soldier appear randomly on the opponent's island when the corresponding key is pressed.
    - Implemented the functionality for a boat to appear at the player's harbor when the corresponding key is pressed.
    - Restructured the game to allow players to place land objects only on their own island.
  - Enhanced the user experience by disabling input controls at the end of the match to prevent unintended actions.
  - Continued development of in-game sprites.
  - Standardized the game's frame rate to a consistent 30 frames per second (fps) across all game scenes.
- **Plans:**
  - Work on game logic.
  - Continuously enhance and fine-tune the existing game mechanics.

#
#### **Grant Palmieri:**
- **Goals:**
  - Keep generating sprites for the game.
- **Progress:**
  - Finished the creation of in-game sprites.
- **Plans:**
  - Work on game logic.

#
#### **Joshua Murillo:**
- **Goals:**
  - Complete sidebar button functionality.
    - Add connections between player numerical info, map data, and button functionality.
- **Progress:**
  - Reworked buttons to be place in a more appropriate position.
  - Attempted to hack at the object placement relative to the tile map positions that were last clicked.
- **Issues:**
  - Had consistent issues with the placement of objects not aligning with the intended tile positions.
    - Reasons for this may include:
      - Unfamiliarity with tilemap related functions in Godot.
        - Initial mistake of working with object placement and tilemap interaction in separate scenes.
        - Lack of available time that was able to be allocated towards the project this past week.
- **Plans:**
  - Allocate more time to the project.
  - Add interaction between object buttons and player-related variables.
  - Add conditional constraints to the object buttons.
    - Add a pop-up window that will ask for confirmation when attempting to place an object and rejects the attempt if cost is unable to be paid.

#
#### **Zachary Thomas:**
- **Goals:**
  - Get more familiar with the Godot engine and project progression.
- **Progress:**
  - Look further into implemented game mechanics.
- **Plans:**
  - Work on game logic.
