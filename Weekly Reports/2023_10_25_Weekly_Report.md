# **Colonization Conquerors: Weekly Report**
___

### Team Status Update:
#### **Goals:**
- Complete isolated mechanics of individual game objects.
  - Isolated mechanics refers to mechanics specific to each object. Other mechanics, such as weather events damaging objects, will be added after the weather event's implementation.
- Design, delegate, and begin implementation of random weather events.

#### **Progress:**
- Congregated for a 27 minute meeting to discuss the project's progression and future plans.

#### **Plans:**
- Complete isolated mechanics of individual game objects.
  - Isolated mechanics refers to mechanics specific to each object. Other mechanics, such as weather events damaging objects, will be added after the weather event's implementation.
- Design, delegate, and begin implementation of random weather events.

#
### Individual Contributions:

#### **Timothy Enders:**
- **Goals:**
  - Completion of Fort, Factory, and Crop-related mechanics.
- **Progress:**
  - Completed the base implementation of Crop-related mechanics.
    - Crop objects will now disappear on Tilemap after 1 - 5 rounds. Its life value will increase if it is rained upon, which will be implemented after rain/tropical storm mechanics are introduced.
      - Each one that disappears will decrease the player's food count by 500.
  - Added more warnings.
    - If the object cannot be placed in that position.
    - If there is already an object in that position.
- **Plans:**
  - Completion of Fort, Factory-related mechanics.

#
#### **Grant Palmieri:**
- **Goals:**
  - Completion of School and Hospital-related mechanics.
- **Progress:**
  - Continued working on implementation of School and Hospital.
- **Plans:**
  - Completion of School and Hospital-related mechanics.

#
#### **Joshua Murillo:**
- **Goals:**
  - Completion of PT Boat and Fishing Boat-related mechanics.
  - Look into Godot Build Systems using Scons.
- **Progress:**
  - Looked into building Godot projects using scons.
    Using Python, pip, scons, and either MinGW-w64 or Visual Studio, I can do the following:
    
    $ python --version
    
    $ pip --version
    
    $ git clone https://github.com/godotengine/godot.git
    
    $ python -m pip install scons
    
    $ cd godot
    
    $ scons -j8 platform=windows vsproj=yes

    (NOTE -j followed by some integer refers to the number of threads you wish to dedicate to compiling the engine)
    
    This will create a bin folder in the godot directory which will allow the godot engine to be opened from its source code.

    Current issues with this method include:
    - Using this method takes roughly 25 to 50 minutes for the engine to compile.
      - Godot's Documentation states that using the MinGW-w64 method without VS code will take longer than the VS route.
    - While I was able to get the Godot engine running straight from its source on my machine using the platform=windows command. Github codespaces have only been able to detect the linuxbsd version despite the cloned Godot folder containing android, ios, linuxbsd, macos, web, and windows within its platform directory. Perhaps this is due to Github codespace's Linux environment, I will have to look into it more to find out.
- Attempted to implement Continuous Integration using GitHub Actions.
  - Currently running into issues with OS presets not being recognized.
- Completed Fishing and Patrol Boat movement for both players. (Non-Collision)
  - Boats can move using arrow keys whenever a player's cursor is placed over the boat that the player owns.
- **Plans:**
  - Continue working on implementing Continous Integration using GitHub Actions.
  - Work on using GUT (Gotdot Unit Testing) with GitHub Actions to automatically run unit tests.
  - Implement game mechanics related to object collision between boats and world events.

#
#### **Zachary Thomas:**
- **Goals:**
  - Completion of Housing and Rebel-related mechanics.
- **Progress:**
  - Continued working on the implementation of Housing and Rebel-related mechanics.
- **Plans:**
  - Completion of Housing and Rebel-related mechanics.
