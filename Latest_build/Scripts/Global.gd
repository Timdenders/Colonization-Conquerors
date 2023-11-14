extends Node

var term_of_office: int = 0 # Count of rounds.
var length_of_round: int = 0
var player_one_gold_bars: int = 100
var player_one_population: int = 1000
var player_one_current_score: int = 0
var player_one_prev_score: int = 0
var player_one_total_score: int = 0
var player_two_gold_bars: int = 100
var player_two_population: int = 1000
var player_two_current_score: int = 0
var player_two_prev_score: int = 0
var player_two_total_score: int = 0
var base_mortality: int = 11
var base_fertility: int = 50
var gold_bars_per_round: int = 10
var productivity_max_gb: int = 30
var max_crops_life: int = 5
var max_fish_boats: int = 5
var max_pt_boats: int = 2
var rnd_cntr: int = 0 # Maintain a record of the current round number.
# Disable input controls for the tilemap when the value is set to 'true'.
var end_signal: bool = false

# Gold obtained from each object.
var obj_gold_gain = {
	"Factory" : 4,
	"Crops" : 1, # Gold bars from rain.
	"FishBoat" : 1 # Gold bars per round and gold bars from School of Fish each second.
}
# Points acquired from each object.
var obj_points_gain = {
	"School" : 1,
	"Hospital" : 1
}
# Prices for each individual object.
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
# Track both the quantity of each object held by the player and the coordinates of every
# individual object.
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
var player_one_stash_bk = {
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
var player_two_stash_bk = {
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
