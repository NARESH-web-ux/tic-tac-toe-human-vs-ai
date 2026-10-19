
package com.tictactoe.backend;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*")
public class GameController {

    private final char[] board = new char[9];
    private boolean gameOver = false;

    public GameController() {
        Arrays.fill(board, ' ');
    }

    @GetMapping("/new")
    public Map<String, Object> newGame() {
        Arrays.fill(board, ' ');
        gameOver = false;
        return response("Your turn!");
    }

    @PostMapping("/move")
    public Map<String, Object> makeMove(@RequestBody Map<String, Integer> request) {
        int position = request.get("position");

        if (position < 0 || position > 8 ||
            board[position] != ' ' || gameOver) {
            return response("Invalid move!");
        }

        board[position] = 'X';

        if (checkWinner('X')) {
            gameOver = true;
            return response("You win!");
        }

        if (isDraw()) {
            gameOver = true;
            return response("It's a draw!");
        }

        int aiMove = findBestMove();

        if (aiMove != -1) {
            board[aiMove] = 'O';
        }

        if (checkWinner('O')) {
            gameOver = true;
            return response("AI wins!");
        }

        if (isDraw()) {
            gameOver = true;
            return response("It's a draw!");
        }

        return response("Your turn!");
    }

    private int findBestMove() {
        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                board[i] = 'O';
                if (checkWinner('O')) {
                    board[i] = ' ';
                    return i;
                }
                board[i] = ' ';
            }
        }

        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') {
                board[i] = 'X';
                if (checkWinner('X')) {
                    board[i] = ' ';
                    return i;
                }
                board[i] = ' ';
            }
        }

        if (board[4] == ' ') return 4;

        int[] corners = {0, 2, 6, 8};
        for (int i : corners) {
            if (board[i] == ' ') return i;
        }

        for (int i = 0; i < 9; i++) {
            if (board[i] == ' ') return i;
        }

        return -1;
    }

    private boolean checkWinner(char player) {
        int[][] lines = {
            {0,1,2}, {3,4,5}, {6,7,8},
            {0,3,6}, {1,4,7}, {2,5,8},
            {0,4,8}, {2,4,6}
        };

        for (int[] line : lines) {
            if (board[line[0]] == player &&
                board[line[1]] == player &&
                board[line[2]] == player) {
                return true;
            }
        }

        return false;
    }

    private boolean isDraw() {
        for (char cell : board) {
            if (cell == ' ') return false;
        }
        return true;
    }

    private Map<String, Object> response(String message) {
        Map<String, Object> result = new HashMap<>();
        result.put("board", new String(board).replace(' ', '-'));
        result.put("message", message);
        result.put("gameOver", gameOver);
        return result;
    }
}
