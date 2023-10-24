# **Colonization Conquerors: Weekly Report**
___

### Team Status Update:
#### **Goals:**
- Complete isolated mechanics of individual game objects.
  - Isolated mechanics refers to mechanics specific to each object. Other mechanics, such as weather events damaging objects, will be added after the weather event's implementation.
- Design, delegate, and begin implementation of random weather events.

#### **Progress:**
- Congregated for a 27 minute meeting to disscuss the project's progression and future plans.

#### **Plans:**
- 

#
### Individual Contributions:

#### **Timothy Enders:**
- **Goals:**
  - Completion of Fort, Factory, and Crop-related mechanics.
- **Progress:**
  - 
- **Plans:**
  - 

#
#### **Grant Palmieri:**
- **Goals:**
  - Completion of School and Hospital-related mechanics.
- **Progress:**
  - 
- **Plans:**
  - 

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
- **Plans:**
  - 

#
#### **Zachary Thomas:**
- **Goals:**
  - Completion of Housing and Rebel-related mechanics.
- **Progress:**
  - 
- **Plans:**
  - 
