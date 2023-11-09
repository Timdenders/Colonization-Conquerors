# **Colonization Conquerors: Weekly Report**
___

### Team Status Update:
#### **Goals:**
- Complete isolated mechanics of individual game objects.
  - Isolated mechanics refers to mechanics specific to each object. Other mechanics, such as weather events damaging objects, will be added after the weather event's implementation.
- Design, delegate, and begin implementation of random weather events.

#### **Progress:**
- Congregated for a 9-minute meeting to discuss the project's progression and future plans.
- Implemented more game object-related mechanics.

#### **Plans:**
- Finish game object-related mechanics.
- Implement random events.
- Look into which remaining aspects of our game's development we need to complete before the Alpha's due date.
- Record a demo of our game software in use.
- Update main GitHub repository README to reflect who the game is for, how to run the game, as well as how to play the game.


#
### Individual Contributions:

#### **Timothy Enders:**
- **Goals:**
  - Completion of Fort, Factory-related mechanics.
- **Progress:**
  - A splash screen has been incorporated at the beginning of the game to display on startup.
  - Implemented game mechanics involving Factory, School, Hospital, Housing Project, and Rebel Soldier objects.
    - Fertility rate is influenced by the quantity of specific objects.
    - Factory objects produce gold bars for the player, and the quantity of gold bars generated depends on the number of Factories, Hospitals, and Schools present.
      - Mortality rate rises in correlation with the number of Factories.
    - Schools increase the productivity rate of Factories.
    - Hospitals greatly increase the productivity rate of Factories.
      - Mortality rate rises in correlation with the number of Hospitals.
  - The player population now updates on screen.
    -  The player population is calculated by adding the number of births and subtracting the number of deaths from the existing population.
  - Player scores are now based on the number of specific objects, the population, and the amount of gold bars earned in a round.
- **Plans:**
  - Finish the Fort mechanics and complete any remaining mechanics prior to the Alpha release.
  - Develop a user interface for a pause menu in advance of the Alpha release.
    - Include a button in the UI that allows the user to return to the setup menu for starting a new game and another button for exiting the application.
    - Following the Alpha release, consider exploring the development of leaderboards for the game.

#
#### **Grant Palmieri:**
- **Goals:**
  - Completion of School and Hospital-related mechanics.
- **Progress:**
  - Presented the logic for the mechanics related to Schools and Hospitals.
- **Plans:**
  - Test the game before the Alpha release.

#
#### **Joshua Murillo:**
- **Goals:**
  - Implement game mechanics related to object collision between boats and world events.
- **Progress:**
  - Created animated sprites for sea-related objects/events, including fishing boats, pirates, fishing spots, collision spots, and PT boats.
    - These sprites are more detailed placeholders and will need to be updated in the future.
  - Added collision to PT boats and fishing boats of opposing player ownership. (Still tweaking specifics to this mechanic).
  - Conducted research into random pathing of pirate ships.
    - Most Godot developers suggest using path-finding algorithms like A* or Dijkstra's algorithm to find a path from some starting point to some random end coordinate.
- **Plans:**
  - Fully complete the collision-related mechanics of fishing boats.
  - Implement some path-finding algorithms to have the pirate sprite move through the sea portion of the tilemap and potentially sink fishing boats.
  - Create sprites for weather events and reuse experience gained from developing the pirate pathing mechanic to the weather events.
  - Look into controller support for ease of LAN multiplayer gameplay.

#
#### **Zachary Thomas:**
- **Goals:**
  - Completion of Housing-related mechanics.
- **Progress:**
  - Continued working on Housing-related mechanics.
- **Plans:**
  - Prepare any more ideas for the Alpha release.
