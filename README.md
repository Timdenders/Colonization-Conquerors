# Empyria
___

#### Overview:
An ongoing project aimed at developing a game that replicates the gameplay of the classic 1982 game, Utopia.

#### Team Members:
- Timothy Enders (Game Programmer, Game Designer)
- Grant Palmieri (Game Programmer, Gameplay Tester)
- Joshua Murillo (Game Programmer, Sound Engineer)

Link to project repository: https://github.com/Timdenders/Empyria

Communication
- Private: Penn State University – Microsoft Teams, Email, Canvas
  - Throughout the course of this project’s development, the members of our team will actively communicate with each other about
  - the design and production of the Empyria video game.


#### Product Description:
Empyria is set to be developed as a turn-based strategy game inspired by the classic Utopia (1982). The game revolves around building and creating a civilization, resource management, and competitive gameplay to win matches. It aims to blend the nostalgia of Utopia's core gameplay with different visuals, and user experience enhancements.

Major Features
- Island Development:
  - Players can create and advance their island through the construction of diverse structures, including crops, factories, and forts. Each of these structures serves distinct functions, such as sustaining the population, generating revenue, or fortifying against potential attacks.
- Resource Management:
  - Managing resources is a crucial aspect of the game. Players need to allocate resources wisely to ensure the growth and prosperity of their island. Achieving success hinges on the strategic allocation of construction efforts.
- Interaction with Rival Players:
  - "Empyria" delivers a local two-player competitive gaming experience, enabling players to fund rebel activities on their opponent's island and incite confrontations between their PT boats and the rival's fishing boats.
- Natural Disasters & Events:
  - Random disasters and events can occur in the game, adding an element of unpredictability. These events, such as rain storms or hurricanes, can have both positive and negative effects on a player's construction.

Stretch Goals
- User Interface Enhancements:
  - An intuitive and visually appealing user interface with clear navigation.
  - Leaderboards to showcase player rankings and scores.
- Discord Integration:
  - Incorporate an online multiplayer dimension into the game, where a third player assumes the role of the "Gamemaster" responsible for orchestrating dynamic events. The Gamemaster can wield control over various in-game parameters, such as adjusting construction costs, and weather occurrence rates, using Discord as a medium for these modifications.

#### Use Cases:
| Use Case 1    | Player Building & Island Development |
| -------- | ------- |
| Actor | Player |
| Trigger | The player desires to initiate construction and <br />development on an island within Empyria. |
| Preconditions | The player has started a new match. |
| Postconditions <br />(Success Scenario) | The player successfully builds and develops his land in Empyria. |
| List of Steps <br />(Success Scenario) | a. The player constructs objects on the island. <br />b. The player manages resources and continues expanding the island. |
| Extensions/Variations <br />of the Success Scenario | The player can choose different structures and <br />resource allocation strategies. |
| Exceptions: Failure <br />Conditions & Scenarios | If the player’s resources are insufficient, the chosen <br />structures cannot be built. |

| Use Case 2    | Competitive Gameplay & Interaction with Rival Player |
| -------- | ------- |
| Actor | Players |
| Trigger | Player 1 and Player 2 want to engage in competitive <br />gameplay with each other. |
| Preconditions | The players are in the same game. |
| Postconditions <br />(Success Scenario) | Player 1 and Player 2 participate in competitive <br />gameplay. |
| List of Steps <br />(Success Scenario) | a. Both players start a session with each other. <br />b. They allocate resources strategically and expand their island. <br />c. Each player decides to fund rebel activities on the other’s island. <br />d. Otherwise, confrontation between their PT boats and fishing boats occurs. <br />e. Player 1 and Player 2 continue to compete and strategize. |
| Extensions/Variations <br />of the Success Scenario | Player 1 and Player 2 can employ different tactics <br />during gameplay. |
| Exceptions: Failure <br />Conditions & Scenarios | If the session ends too early, they cannot engage in <br />competitive gameplay. |

| Use Case 3    | Dealing with Random Natural Disasters |
| -------- | ------- |
| Actor | Player |
| Trigger | The player encounters a random storm cloud in the game. |
| Preconditions | The player initiates a new game. |
| Postconditions <br />(Success Scenario) | The player copes with the natural disaster. |
| List of Steps <br />(Success Scenario) | a. The player observes the impending storm cloud. <br />b. The player can either opt to move their boat to a different <br />location and/or proactively construct newer structures in a <br />distant area to avoid potential obstacles.|
| Extensions/Variations <br />of the Success Scenario | The outcome of the natural disaster can vary based on <br />the player’s preparations. |
| Exceptions: Failure <br />Conditions & Scenarios | Failure to act may result in a natural disaster <br />inflicting substantial damage upon the player’s <br />constructions. |

#### Non-Functional Requirements:
User Support & Documentation
- Provide clear and comprehensive in-game help and tutorials to assist new players.

 Accessibility
- Guarantee that the game accommodates players who desire customizable control features.

Security
- Implement security measures to prevent cheating or hacking.
- Ensure data privacy for user information if Discord integration is utilized.


#### External Requirements:
Given the game's aim to facilitate multiplayer competition and incorporate features like leaderboards, ensuring system stability is of paramount importance to our team. Preventing unintended user inputs that could potentially disrupt the game's integrity is crucial for a seamless gaming experience, whether played solo or with others.

Furthermore, since our software will be available for download by users, it's imperative that individual users are unable to modify the program intentionally or accidentally in a manner that could disrupt the game environment.

In addition to code stability, our team is committed to maintaining robust documentation. This approach ensures that our design and implementation processes remain well-organized. This organization, in turn, allows for easy reference to previous production steps and facilitates the onboarding of new team members, ensuring they are up to speed with the project's progress.


#### Team Process Description:
For our project, we have chosen Godot as our game engine because of its exceptional beginner-friendliness for crafting 2D games, complemented by its integrated networking capabilities. Our coding will predominantly be conducted in Python, as it is the programming language in which our team collectively possesses the highest proficiency. In terms of audio production, we will employ Audacity as our software of choice due to its user-friendly interface and fundamental feature set, which adequately fulfills our requirements. Each team member's role has been thoughtfully assigned based on their individual skill sets and aptitude, ensuring that they are best equipped to contribute effectively to the project's success.

Group Roles
- Timothy Enders
  - Game Programmer (responsible for coding and implementing the software and functionality of the game)
  - Game Designer (responsible for conceptualizing the core gameplay elements, mechanics, and user experience)
- Grant Palmieri
  - Game Programmer (responsible for coding and implementing the software and functionality of the game)
  - Gameplay Tester (evaluates the game's functionality and balance to ensure a smooth and enjoyable player experience)
- Joshua Murillo
  - Game Programmer (responsible for coding and implementing the software and functionality of the game)
  - Sound Engineer (specializes in creating and integrating audio elements, including music and sound effects, to enhance the overall auditory experience of the game)

Schedule 
- To execute this project concept, our team will need to follow a series of sequential steps that will guide us toward the successful completion of Empyria. These steps encompass:

| Date              | Task                            |
|-------------------|---------------------------------|
| 9/10/23 - 9/16/23 | Getting familiar with our tools |
| 9/17/23 - 9/23/23 | Creating Empyria Prototype (Game Mechanics Focused) |
| 9/24/23 - 9/30/23 | Continue Prototype Creation/Testing |
| 10/1/23 - 10/7/23 | Redesign Game Implementation/Testing |
| 10/8/23 - 10/14/23 | Begin Development Of Final Version |
| 10/15/23 - 10/21/23 | Finalization Of Mechanics |
| 10/22/23 - 10/28/23 | Finalization Of GUI |
| 10/29/23 - 11/4/23 | Finalization Of In-Game Sprites |
| 11/5/23 - 11/11/23 | Finalization Of Sound Design |
| 11/12/23 - 11/18/23 | Work On Extra Features (Leaderboards/Discord Integration) |
| 11/26/23 - 12/2/23 | Finalization of Empyria |
| 12/3/23 - 12/9/23 | Empyria Project Final Presentation |

Major Risks
- One significant risk involves succumbing to the allure of incorporating non-essential features, potentially diverting resources from core development efforts.
- Another notable risk stems from our team's lack of prior experience working together, especially considering the project's scope; unforeseen challenges may arise.
- Additionally, our chosen engine, although seemingly straightforward and suitable for the game, poses a risk as none of us have prior experience with it and as development progresses, unforeseen complexities may emerge.

External Feedback
- We believe the optimal moment to seek external assistance is during the initial testing phase, as it allows for potential refinements if certain aspects do not resonate with the audience. The most effective approach to gathering this input is by involving external individuals to playtest the game and share their feedback and impressions.
