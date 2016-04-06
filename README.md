#Tetris - General Assembly :
---
For project one, I wanted to get some practice with the HTML5 canvas, and learn more about writing object oriented javascript. My goals were as follows:

- Learn the new ES6 class syntax
- Build a funtioning tetris game with minimal bugs
- Learn to draw objects and collections of objects inside HTML5 canvas elements
- Write a multiplayer mode for Tetris
- Write an algorithm to allow a person to play against the computer

The current full game can be played [here](http://nyxhemera.github.io/tetris-ga/).

##Original Plans :
---
###SplashScreen Wireframe:
![wireframe one](documentation/tetris-page-001.jpg?raw=true "Wireframe One")
The plans for the SplashScreen did not change much during the development process, and the current iteration reflects this.

###Single-Player Wireframe:
![wireframe two](documentation/tetris-page-002.jpg?raw=true "Wireframe Two")
Single-Player changed slightly, in that I chose to add in a line and a level counter, to demonstrate your progress and show when the board would be speeding up. 

###Multi-Player Wireframe:
![wireframe three](documentation/tetris-page-003.jpg?raw=true "Wireframe Three")
The Multi-player mode changed significantly during development. When working on Multi-player, I accidently loaded both GameBoards side by side, so it just looked like a larger board with two ScoreBoards off to the side. I loved the idea of both players working on the same board, so I stuck with that and it became the Co-op mode that the game currently offers.


##Class Structure : 
---
###GameStateHandler -
GameStateHandler is the highest level class. It controls which GameState is being displayed at the current moment, what switch group is controlling keypresses, and the stopping and starting of music. Active GameBoards are stored in the GBArr variable and are killed and repopulated whenever the state is changed.

###SplashScreen & MainMenuScreen-
The SplashScreen and MainMenuScreen are almost identical, and in future updates will actually be contained within one class. They both randomly generate pieces along the top of the screen, which are then removed once they pass below the bottom of the screen.

The MainMenuScreen allows players to choose between each mode, which then causes the overarching GameStateHandler to switch to the respective GameState.

###GameBoard -
The GameBoard class handles everything to do with the locations of pieces and blocks on the board, as well as managing the removal and creation of lines and pieces. It has a ScoreBoard, which it can update whenever the state of play changes.

###MultiGameBoard -
The MultiGameBoard class is very similar to the GameBoard, but works against an array of currentPieces, allowing it to display multiple pieces on the screen at once.

###ScoreBoard -
The ScoreBoard handles tracking and updating the score, the count of lines and pieces, the next upcoming piece and drawing these to the screen. The ScoreBoard is a separate class but is only instantiated within a GameBoard.

###Piece -
The Piece class is the semi-abstract superclass of each individual piece class. It contains all of the main methods that handle piece movement, collision and clipping detection, and the render methods to loop through its own blocks. Each extension of Piece has their own variables that handle how that individual piece is structured.