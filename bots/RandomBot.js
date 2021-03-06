(function(game) {

	game.registerBot('RandomBot', turn);

	function turn(board, myPlayerId, players, isValidMove) {
		var me = players[myPlayerId];

		var validCorners = getValidCorners(board, me);
		if (_.isEmpty(validCorners)) {
			return false;
		}

		validCorners = _.shuffle(validCorners);
		var remainingBlocks = _.shuffle(me.blocks);
		for (var i = 0; i < remainingBlocks.length; i++) {
			var permutations = _.shuffle(getPermutations(remainingBlocks[i]));
			for (var j = 0; j < validCorners.length; j++) {
				for (var k = 0; k < permutations.length; k++) {
					// Pick a cell to anchor on the valid corner
					var cells = permutations[k];
					for (var l = 0; l < cells.length; l++) {
						var offsetX = validCorners[j][0] - cells[l][0];
						var offsetY = validCorners[j][1] - cells[l][1];
						var move = offsetCells(cells, offsetX, offsetY);
						if (isValidMove(move, myPlayerId)) {
							return move;
						}
					}
				}
			}
		}
		return false;
	}

	function getPermutations(cells) {
		var permutations = [];
		_.each([cells, flipBlock(cells)], function(c) {
			for (var i = 0; i < 4; i++) {
				c = rotateBlock(c);
				permutations.push(c);
				// TODO dedupe permutations
			}
		});
		return permutations;
	}

	var MAX_BLOCK_LENGTH = 5;
	var BOARD_LENGTH = 20;

	// Rotates counter clockwise once
	function rotateBlock(cells) {
		return _.map(cells, function(cell) {
			return [MAX_BLOCK_LENGTH - cell[1] - 1, cell[0]];
		});
	}

	function flipBlock(cells) {
		return _.map(cells, function(cell) {
			return [MAX_BLOCK_LENGTH - cell[0] - 1, cell[1]];
		});
	}

	function offsetCells(cells, offsetX, offsetY) {
		return _.map(cells, function(cell) {
			return [cell[0] + offsetX, cell[1] + offsetY];
		});
	}

	function inBounds(cell) {
		return cell[0] >= 0 && cell[0] < BOARD_LENGTH && cell[1] >= 0 && cell[1] < BOARD_LENGTH;
	}

	function getEdgeCells(x, y) {
		return _.filter([[x-1, y], [x+1, y], [x, y-1], [x, y+1]], inBounds);
	}

	function getCornerCells(x, y) {
		return _.filter([[x-1, y-1], [x+1, y+1], [x-1, y+1], [x+1, y-1]], inBounds);
	}

	// Returns valid corners to place a move
	// One of the player's blocks must use one of these cells
	function getValidCorners(board, player) {
		// First move must be played at the start
		if (!board[player.startCell[0]][player.startCell[1]]) {
			return [player.startCell];
		}
		var validCells = [];
		for (var x = 0; x < board.length; x++) {
			for (var y = 0; y < board.length; y++) {
				if (board[x][y] !== player.id) {
					continue;
				}
				var cornerCells = getCornerCells(x, y);
				cornerLoop:
				for (var i = 0; i < cornerCells.length; i++) {
					var cell = cornerCells[i];
					// Already occupied
					if (board[cell[0]][cell[1]]) {
						continue;
					}
					var edgeCells = getEdgeCells(cell[0], cell[1]);
					for (var j = 0; j < edgeCells.length; j++) {
						var edgeCell = edgeCells[j];
						if (board[edgeCell[0]][edgeCell[1]] === player.id) {
							continue cornerLoop;
						}
					}
					validCells.push(cell);
				}
			}
		}
		return validCells;
	}

})(game);