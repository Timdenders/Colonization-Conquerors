extends CanvasLayer

@onready var sb_player_one_gold_bars: Label = $SBControl/SBPlayerOneGoldBars
@onready var sb_player_one_population: Label = $SBControl/SBPlayerOnePopulation
@onready var sb_player_one_current_score: Label = $SBControl/SBPlayerOneCurrentScore
@onready var sb_player_one_total_score: Label = $SBControl/SBPlayerOneTotalScore
@onready var sb_term_of_office: Label = $SBControl/SBTermOfOffice
@onready var sb_length_of_round: Label = $SBControl/SBLengthOfRound
@onready var sb_player_two_gold_bars: Label = $SBControl/SBPlayerTwoGoldBars
@onready var sb_player_two_population: Label = $SBControl/SBPlayerTwoPopulation
@onready var sb_player_two_current_score: Label = $SBControl/SBPlayerTwoCurrentScore
@onready var sb_player_two_total_score: Label = $SBControl/SBPlayerTwoTotalScore
@onready var sb_final_scores: Label = $SBControl/SBFinalScores
@onready var sb_length_of_round_timer: Timer = $SBControl/SBLengthOfRound/SBLengthOfRoundTimer
var rnd_cntr: int = 0
var ind: bool = true

# Calculates the current score of Player One.
func calc_p1_curr_score():
	var p1_half_pop = int(Global.player_one_population * 0.5)
	var p1_90_pop = int(Global.player_one_population * 0.9)
	if (Global.player_one_food_count >= p1_half_pop && Global.player_one_food_count < p1_90_pop):
		Global.player_one_current_score += 15
	elif (Global.player_one_food_count > p1_90_pop):
		Global.player_one_current_score += 30
	else:
		pass

# Calculates the current score of Player Two.
func calc_p2_curr_score():
	var p2_half_pop = int(Global.player_two_population * 0.5)
	var p2_90_pop = int(Global.player_two_population * 0.9)
	if (Global.player_two_food_count >= p2_half_pop && Global.player_two_food_count < p2_90_pop):
		Global.player_two_current_score += 15
	elif (Global.player_two_food_count > p2_90_pop):
		Global.player_two_current_score += 30
	else:
		pass

# By default, all players earn 10 gold bars per round.
func add_gold_bars():
	var gold_bars = 10
	# TODO - Add additional gold earning calculations.
	return gold_bars

# A helper function for "end_of_round".
func end_of_round_hlpr():
	Global.player_one_current_score = 0
	Global.player_two_current_score = 0
	calc_p1_curr_score()
	calc_p2_curr_score()
	sb_player_one_current_score.text = str(Global.player_one_current_score)
	sb_player_two_current_score.text = str(Global.player_two_current_score)
	Global.player_one_total_score += Global.player_one_current_score
	Global.player_two_total_score += Global.player_two_current_score
	sb_player_one_total_score.text = str(Global.player_one_total_score)
	sb_player_two_total_score.text = str(Global.player_two_total_score)
	if ind == true:
		Global.player_one_gold_bars += add_gold_bars()
		Global.player_two_gold_bars += add_gold_bars()
	sb_term_of_office.text = str(Global.term_of_office)

# This function is called at the end of a game round.
func end_of_round():
	if Global.term_of_office > 1:
		rnd_cntr = rnd_cntr + 1
		Global.term_of_office -= 1
		print("End of round ", rnd_cntr, "!")
		end_of_round_hlpr()
		sb_length_of_round_timer.wait_time = Global.length_of_round
		sb_length_of_round_timer.start()
	elif Global.term_of_office == 1:
		rnd_cntr = rnd_cntr + 1
		Global.term_of_office -= 1
		Global.end_signal = Global.term_of_office
		print("End of match!")
		ind = false
		end_of_round_hlpr()
		sb_player_one_gold_bars.visible = false
		sb_player_one_population.visible = false
		sb_player_one_current_score.visible = false
		sb_player_one_total_score.position = Vector2i(781.5, 59.0)
		sb_term_of_office.visible = false
		sb_length_of_round.visible = false
		sb_player_two_gold_bars.visible = false
		sb_player_two_population.visible = false
		sb_player_two_current_score.visible= false
		sb_player_two_total_score.position = Vector2i(961.5, 59.0)
		sb_final_scores.visible = true
		$OBCanvasLayer.hide()
	else:
		pass

# Called when the node enters the scene tree for the first time.
func _ready():
	sb_term_of_office.text = str(Global.term_of_office)
	sb_length_of_round_timer.wait_time = Global.length_of_round
	sb_length_of_round_timer.start()

# Called every frame. "delta" is the elapsed time since the previous frame.
func _process(_delta):
	if sb_length_of_round_timer.time_left > 0:
		sb_player_one_gold_bars.text = str(Global.player_one_gold_bars)
		sb_player_two_gold_bars.text = str(Global.player_two_gold_bars)
		sb_player_one_population.text = str(Global.player_one_population)
		sb_player_two_population.text = str(Global.player_two_population)
		sb_length_of_round.text = str(round(sb_length_of_round_timer.time_left))
	elif sb_length_of_round_timer.time_left == 0:
		end_of_round()
	else:
		pass
