extends Node

var term_of_office: int = 0
var length_of_round: int = 0
var player_one_gold_bars: int = 100
var player_one_population: int = 1000
var player_one_current_score: int = 0
var player_one_total_score: int = 0
var player_one_food_count: int = 0
var player_two_gold_bars: int = 100
var player_two_population: int = 1000
var player_two_current_score: int = 0
var player_two_total_score: int = 0
var player_two_food_count: int = 0
var max_crops_life: int = 5
var end_signal: int = 1

var obj_gains = {
	"Fort" : 0,
	"Factory" : 4,
	"Crops" : 1,
	"School" : 0,
	"Hospital" : 0,
	"Housing" : 0,
	"Rebel" : 0,
	"PTBoat" : 0,
	"FishBoat" : 1
}
var obj_prices = {
	"Fort" : 50,
	"Factory" : 40,
	"Crops" : 3,
	"School" : 35,
	"Hospital" : 75,
	"Housing" : 60,
	"Rebel" : 30,
	"PTBoat" : 40,
	"FishBoat" : 25
}
var player_one_stash = {
	"Fort" : [0],
	"Factory" : [0],
	"Crops" : [0],
	"School" : [0],
	"Hospital" : [0],
	"Housing" : [0],
	"Rebel" : [0],
	"PTBoat" : [0],
	"FishBoat" : [0]
}
var player_two_stash = {
	"Fort" : [0],
	"Factory" : [0],
	"Crops" : [0],
	"School" : [0],
	"Hospital" : [0],
	"Housing" : [0],
	"Rebel" : [0],
	"PTBoat" : [0],
	"FishBoat" : [0]
}
