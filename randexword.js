// All clues
var clues = [];

// All answers
var answers = [];

// Index grid
var grid =  [];

// Character grid
var charGrid = [];


// Initialize empty grids
for (var i = 0; i < 15; i++){
	var row = [];
	var charRow = [];
	for (var j = 0; j < 15; j++){
		row.push(0);
		charRow.push(0);
	}
	charGrid.push(charRow);
	grid.push(row);
}


// Generate equal likelihood of first clue being horizontal
function isHorizontal(){
	var myNum = Math.floor(Math.random() * 2);
	if (myNum == 0){
		return true;
	}
	else{
		return false;
	}
}

// Get random clue from dictionary (relationship of answers to clues is one to many)
function getClue(dict, myWord){
	var clues = dict[myWord];
	return clues[Math.floor(Math.random() * clues.length)];
}

// Shuffle an array
function shuffle(array) {
	if (array == undefined) return array
		var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

// Find the next word, and its position, in the crossword
function findNextWord(grid, stack, wordFinder){

	// Assume the result is empty
	var result = {word: undefined, x: undefined, y:undefined, horizontal: undefined};
	if (stack.length == 0){
		return result;
	}

	// Word to build on
	var indices = stack[stack.length-1];
	var myX = indices[0];
	var myY = indices[1];
	var wordLength = indices[2];
	var horizontal = indices[3];


	// Words that could possibly work
	var potentialWords = [];


	// Possible new starting indices of new word
	var newX;
	var newY;



	// How many possible intersect points are there?
	intersectIndices = [];
	for (var i = 0; i < wordLength; i++){
		intersectIndices.push(i);
	}
	intersectIndices = shuffle(intersectIndices);

	// Try all possible intersections
	for (var i = 0; i < intersectIndices.length; i++){

		// How much slack do we have above or left of the word?
		var slack = [0];

		var count = 1;
		if (horizontal) {
			newY = myY + intersectIndices[i];

			
			// Check if there is already a word at this intersect index
			if (myX > 0 && grid[myX - 1][newY] != 0){
				continue;
			}
			if (myX < grid.length - 1 && grid[myX + 1][newY] != 0){
				continue;
			}
			
			// Generate slacks
			var xRange = myX;
			while (xRange > 0 && (xRange == myX || grid[xRange - 1][newY] == 0)){
				xRange -= 1;
				slack.push(count);
				count += 1;
			}
		}
		else {
			newX = myX + intersectIndices[i];

			// Check if there is already a word at this intersect index		
			if (myY > 0 && grid[newX][myY - 1] != 0){
				continue;
			}
			if (myY < grid.length - 1 && grid[newX][myY + 1] != 0){
				continue;
			}

			// Generate slacks
			var yRange = myY;
			while (yRange > 0 && (yRange == myY || grid[newX][yRange - 1] == 0)){
				yRange -= 1;
				slack.push(count);
				count += 1;
			}

		}

		slack = shuffle(slack);


		// Try all possible slacks
		for (var j = 0; j < slack.length; j++){
			if (horizontal) {
				newX = myX - slack[j];

				// There is a word next to this word
				if (newX > 0 && grid[newX - 1][newY] != 0){
					continue;
				}

				potentialWords = wordFinder[myX - newX][grid[myX][newY]];
			}
			else {
				newY = myY - slack[j];

				// There is a word next to this word
				if (newY > 0 && grid[newX][newY - 1] != 0){
					continue;
				}

				potentialWords = wordFinder[myY - newY][grid[newX][myY]];
			}

			// No words at this slack
			if (potentialWords == undefined){
				continue;
			}

			potentialWords.sort(function(a, b){
  				// ASC  -> a.length - b.length
  				// DESC -> b.length - a.length
 				 return b.length - a.length;
			});

			// Try all possible words
			for (var k = 0; k < potentialWords.length; k++){
				var newWord = potentialWords[k];

				if (newWord in answers){
					continue;
				}

				var feasible = true;

				// Check if word works. There are several constraints to check...
				if (horizontal){
					for (var l = 0; l < newWord.length; l++){

						// Can word fit in grid?
						if (newX + l >= grid.length){
							feasible = false;
							break;
						}
						// Is there a word at the end of this word?
						else if(newX + newWord.length < grid.length && grid[newX + newWord.length][newY] != 0){
							feasible = false;
							break;
						}
						// Will the word match up with all existing characters in the grid?
						else if (grid[newX + l][newY] != 0 && grid[newX + l][newY] != newWord.charAt(l)){
							feasible = false;
							break;
						}
						// Is the word adjacent to another word?
						else if (newY > 0 && newY < grid.length - 1 && grid[newX +l][newY - 1] != 0 && grid[newX +l][newY + 1] == 0){
							feasible = false;
							break;
						}
						// Is the word adjacent to another word?
						else if (newY > 0 && newY < grid.length - 1 && grid[newX +l][newY - 1] == 0 && grid[newX +l][newY + 1] != 0){
							feasible = false;
							break;
						}

						// Is the word adjacent to another word?
						else if (l != slack[j] && newY > 0 && newY < grid.length - 1 && grid[newX +l][newY - 1] != 0 && grid[newX +l][newY + 1] != 0){
							feasible = false;
							break;
						}

						// Is the word adjacent to another word?
						else if (newY == 1 && grid[newX +l][newY - 1] != 0){
							feasible = false;
						}
						// Is the word adjacent to another word?
						else if (newY == grid.length - 2 && grid[newX +l][newY + 1] != 0){
							feasible = false;
						}
						// Is the word between two words?
						else if (newY > 0 && newY < grid.length - 1 && grid[newX +l][newY - 1] != 0 && grid[newX +l][newY + 1] != 0){
							if (newX + l < newWord.length - 1 && grid[newX +l + 1][newY - 1] != 0 && grid[newX + l + 1][newY + 1] != 0){
								feasible = false;
								break;
							}
						}
						// Is the word adjacent to another word?
						else if (l != slack[j] && newY == 0 && grid[newX + l][newY + 1] != 0){
							feasible = false;
							break;
						}
						// Is the word adjacent to another word?
						else if (l != slack[j] && newY == grid.length - 1 && grid[newX + l][newY - 1] != 0){
							feasible = false;
							break;
						}

					}
				}
				else {
					for (var l = 0; l < newWord.length; l++){
						// Can the word fit in grid?
						if (newY + l >= grid.length){
							feasible = false;
							break;
						}
						// Is there a word at the end of this word?
						else if (newY + newWord.length < grid.length && grid[newX][newY + newWord.length] != 0){
							feasible = false;
							break;
						}
						// Will the word match up with all existing characters in the grid?
						else if (grid[newX][newY + l] != 0 && grid[newX][newY + l] != newWord.charAt(l)){
							feasible = false;	
							break;
						}
						// Is the word adjacent to another word?
						else if (newX > 0 && newX < grid.length - 1 && grid[newX - 1][newY + l] != 0 && grid[newX + 1][newY + l] == 0){
							feasible = false;
							break;
						}
						// Is the word adjacent to another word?
						else if (newX > 0 && newX < grid.length - 1 && grid[newX - 1][newY + l] == 0 && grid[newX + 1][newY + l] != 0){
							feasible = false;
							break;
						}
						// Is the word adjacent to another word?
						else if (l != slack[j] && newX > 0 && newX < grid.length - 1 && grid[newX - 1][newY + l] != 0 && grid[newX + 1][newY + l] != 0){
							feasible = false;
							break
						}
						// Is the word adjacent to another word?
						else if (newX == 1  && grid[newX - 1][newY + l] != 0 ){
							feasible = false;
						}
						// Is the word adjacent to another word?
						else if (newX == grid.length - 2 && grid[newX + 1][newY + l] != 0){
							feasible = false;
						}
						// Is the word between two words?
						else if (newX > 0 && newX < grid.length - 1 && grid[newX - 1][newY + l] != 0 && grid[newX + 1][newY + l] != 0){
							if (newY + l < newWord.length - 1 && grid[newX - 1 + 1][newY + l] != 0 && grid[newX + 1][newY + l + 1] != 0) {
								feasible = false;
								break;
							}
						}
						// Is the word adjacent to another word?
						else if (l != slack[j] && newX == 0 && grid[newX + 1][newY + l] != 0){
							feasible = false;
							break;
						}
						// Is the word adjacent to another word?
						else if (l != slack[j] && newX == grid.length - 1 && grid[newX - 1][newY + l] != 0){
							feasible = false;
							break;
						}


					}
				}

				// If word words, return it!
				if (feasible && newWord.length > 1 && ($.inArray(newWord, answers) == -1)) {
					result.word = newWord;
					result.x = newX;
					result.y = newY;
					result.horizontal = horizontal;
					return result;
				}
			}
		}
	}

	// Pop word from stack and try again.
	stack.pop();
	return findNextWord(grid, stack, wordFinder);
}


function generateCW(words, dict){
	var wordCount = 1;
	var found = true;
	var myX = 0;
	var myY = 0;

	// Dictionary to find words that have letters at specific indices. 
	var wordFinder = new Array();

	// Stack to keep track of words
	var locationStack = [];


	// Populate wordFinder
	for (var i = 0; i < words.length; i++){
		var word = words[i];

		for (var j = 0; j < word.length; j++){
			if (!(j in wordFinder)){
				wordFinder[j] = {};
			}
			if (!(word.charAt(j) in wordFinder[j])){
				wordFinder[j][word.charAt(j)] = [];
			}
			wordFinder[j][word.charAt(j)].push(word);
		}
	}


	var horizontal = isHorizontal();

	// Generate a starting word
	var myWordIndex = Math.floor(Math.random() * words.length);
	var myWord = words[myWordIndex];
	var myClue = getClue(dict, myWord);

	// Populate lists with starting word
	answers.push(myWord);
	clues.push(myClue);
	locationStack.push([myX, myY, myWord.length, horizontal]);


	while (found){


		// Add word to grids
		if (horizontal){
			for (var i = 0; i < myWord.length; i++){
				if (grid[myX][myY + i] == 0){
					grid[myX][myY + i] = "" + wordCount;
				}
				else{
					grid[myX][myY + i] = grid[myX][myY + i] + "," + wordCount;
				}
				charGrid[myX][myY + i] = myWord.charAt(i);
			}
		}
		else {
			for (var i = 0; i < myWord.length; i++){
				if (grid[myX + i][myY] == 0) {
					grid[myX + i][myY] = wordCount;
				}
				else {
					grid[myX + i][myY] = grid[myX + i][myY] + "," + wordCount;
				}
				charGrid[myX + i][myY] = myWord.charAt(i);
			}
		}


		// Try to find next word
		var update = findNextWord(charGrid, locationStack, wordFinder);
		myWord = update.word;
		myX = update.x;
		myY = update.y;
		horizontal = update.horizontal;

		// If word can't be found, or too many answers, then stop
		if (myWord == undefined){
			found = false;
		}

		// Update lists
		else{
			myClue = getClue(dict, myWord);	
			answers.push(myWord);
			clues.push(myClue);
			locationStack.push([myX, myY, myWord.length, !horizontal]);		
		}

		// Change horizontal and increment the count!
		horizontal = !horizontal;
		wordCount += 1;
	}	

}



// Order clues/answers from left->right and up->down
function reorder(){
	var order = [];
	var translation = {};
	for (var i = 0; i < grid.length; i++){
		for (var j = 0; j < grid.length; j++){
			if (grid[i][j] != 0){
				var elements = String(grid[i][j]).split(",");
				for(var k = 0; k < elements.length; k++){
					if ($.inArray(parseInt(elements[k]) - 1, order) == -1){
						translation[elements[k]] = order.length + 1;
						order.push(parseInt(elements[k]) - 1);
					}
				}
				
				var replacement = translation[elements[0]];	
				for(var k = 1; k < elements.length; k++){
					replacement += "," + translation[elements[k]];
				}
				grid[i][j] = replacement;
			}
		}	
	}


	newAnswers = [];
	newClues = [];
	newGrid = [];
	
	for (var i = 0; i < answers.length; i++){
		newAnswers.push(answers[order[i]]);
		newClues.push(clues[order[i]]);
	}

	answers = newAnswers;
	clues = newClues;
}
