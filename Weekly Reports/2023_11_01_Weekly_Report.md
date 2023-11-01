# **Colonization Conquerors: Weekly Report**
___

### Team Status Update:
#### **Goals:**
- Complete isolated mechanics of individual game objects.
  - Isolated mechanics refers to mechanics specific to each object. Other mechanics, such as weather events damaging objects, will be added after the weather event's implementation.
- Design, delegate, and begin implementation of random weather events.
- Implement a testing framework for Godot.

#### **Progress:**
- Completed testing and release of continuous integration frameworks for Godot.

#### **Plans:**
- Complete isolated mechanics of individual game objects.
  - Isolated mechanics refers to mechanics specific to each object. Other mechanics, such as weather events damaging objects, will be added after the weather event's implementation.
- Design, delegate, and begin implementation of random weather events.


#
### Individual Contributions:

#### **Timothy Enders:**
- **Goals:**
  - Completion of Fort, Factory-related mechanics.
- **Progress:**
  - Continued working on implementation of Fort, Factory-related mechanics.
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
  - Completion of Continuous Integration of Godot unit testing framework
    - Framework should work to automatically check if all unit tests in the latest build of our project pass. If so, another workflow builds and releases the passed updated version to a Windows executable file.
  - Continue working on Fishing/PTBoat collision mechanics
- **Progress:**
  - Completed implementation of Continuous Integration of both automatic build release and automatic testing sweeps using GitHub Actions and gdUnit4 Godot extension.
    - Switched out Godot unit testing framework, GUT, for another lesser-used extension called, gdUnit4.
      - Previous issues with the GUT framework center around the inability to get GUT to work well on GitHub despite how well the framework operated in both the Godot editor and VSCode.
        - GitHub related issues included:
          - Missing permissions to do certain operations during workflow execution.
          - File dependencies that were automatically imported into the project via the GUT extension addon are not being found despite being present in the correct directory.
    - Much like my previous experience with CI for releasing builds for Godot, using gdUnit4, I was able to quickly implement the automated testing system without much issue.
- **Plans:**
  - Implement game mechanics related to object collision between boats and world events.

#
#### **Zachary Thomas:**
- **Goals:**
  - Completion of Housing-related mechanics.
- **Progress:**
  - Continued working on the implementation of Housing-related mechanics.
- **Plans:**
  - Completion of Housing-related mechanics.
