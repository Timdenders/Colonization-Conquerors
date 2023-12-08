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
var player_one_gb_earned: int = 0
var player_two_gb_earned: int = 0

# Updates the population of a player.
func update_population(player):
	var pop = 0
	var base_fert = Global.base_fertility
	var base_mort = Global.base_mortality
	if player == "Player One":
		pop = floor(Global.player_one_population / 10.0)
		if Global.player_one_stash["Crops"][0] > 0:
			var fert = 0
			fert += Global.player_one_stash["Crops"][0] * 3
			base_fert += fert
		if Global.player_one_stash["Hospital"][0] > 0:
			var fert_mort = 0
			fert_mort += Global.player_one_stash["Hospital"][0] * 3
			base_fert += fert_mort
			if fert_mort > base_mort:
				base_mort = 2
			else:
				base_mort -= fert_mort
		if Global.player_one_stash["Housing"][0] > 0:
			var fert = 0
			fert += Global.player_one_stash["Housing"][0] * 1
			base_fert += fert
		if Global.player_one_stash["Factory"][0] > 0:
			var mort = 0
			mort += Global.player_one_stash["Factory"][0] * 1
			base_mort += mort
		if Global.player_one_stash["School"][0] > 0:
			var fert = 0
			fert += Global.player_one_stash["School"][0] * 3
			base_fert -= fert
		if base_fert < 40:
			base_fert = 40
		if base_fert < base_mort:
			base_mort = base_fert - 11
		var pop_fert_1 = pop * (base_fert / 100.0)
		var pop_fert_2 = pop_fert_1 * 100.0
		var pop_mort_1 = pop * (base_mort / 100.0)
		var pop_mort_2 = pop_mort_1 * 100.0
		var total_births = pop_fert_2 * 0.01
		var total_deaths = pop_mort_2 * 0.01
		Global.player_one_population += total_births
		Global.player_one_population -= total_deaths
		Global.player_one_population -= 10
		if Global.player_one_population > 9999:
			Global.player_one_population = 9999
	else:
		pop = floor(Global.player_two_population / 10.0)
		if Global.player_two_stash["Crops"][0] > 0:
			var fert = 0
			fert += Global.player_two_stash["Crops"][0] * 3
			base_fert += fert
		if Global.player_two_stash["Hospital"][0] > 0:
			var fert_mort = 0
			fert_mort += Global.player_two_stash["Hospital"][0] * 3
			base_fert += fert_mort
			if fert_mort > base_mort:
				base_mort = 2
			else:
				base_mort -= fert_mort
		if Global.player_two_stash["Housing"][0] > 0:
			var fert = 0
			fert += Global.player_two_stash["Housing"][0] * 1
			base_fert += fert
		if Global.player_two_stash["Factory"][0] > 0:
			var mort = 0
			mort += Global.player_two_stash["Factory"][0] * 1
			base_mort += mort
		if Global.player_two_stash["School"][0] > 0:
			var fert = 0
			fert += Global.player_two_stash["School"][0] * 3
			base_fert -= fert
		if base_fert < 40:
			base_fert = 40
		if base_fert < base_mort:
			base_mort = base_fert - 11
		var pop_fert_1 = pop * (base_fert / 100.0)
		var pop_fert_2 = pop_fert_1 * 100.0
		var pop_mort_1 = pop * (base_mort / 100.0)
		var pop_mort_2 = pop_mort_1 * 100.0
		var total_births = pop_fert_2 * 0.01
		var total_deaths = pop_mort_2 * 0.01
		int(Global.player_two_population)
		Global.player_two_population += total_births
		Global.player_two_population -= total_deaths
		Global.player_two_population -= 10
		if Global.player_two_population > 9999:
			Global.player_two_population = 9999

# Calculate and add the productivity bonus at the end of each round.
func add_productivity_bonus(user, gb):
	var gb_bonus = 0
	if user == "Player One":
		gb_bonus = (Global.player_one_stash["Factory"][0] * \
		(Global.player_one_stash["School"][0] + Global.player_one_stash["Hospital"][0]) + \
		Global.player_one_stash["Hospital"][0])
		if gb_bonus > Global.productivity_max_gb:
			gb_bonus = Global.productivity_max_gb
		gb += gb_bonus
		player_one_gb_earned = gb - 10
	else:
		gb_bonus = (Global.player_two_stash["Factory"][0] * \
		(Global.player_two_stash["School"][0] + Global.player_two_stash["Hospital"][0]) + \
		Global.player_two_stash["Hospital"][0])
		if gb_bonus > Global.productivity_max_gb:
			gb_bonus = Global.productivity_max_gb
		gb += gb_bonus
		player_two_gb_earned = gb - 10
	return gb

# By default, all players earn 10 gold bars per round.
func add_gold_bars(player):
	var gold_bars = 0
	gold_bars += Global.gold_bars_per_round
	if player == "Player One":
		# Earn gold based on the quantity of Factory objects present.
		if Global.player_one_stash["Factory"][0] > 0:
			var gb = 0
			gb += Global.player_one_stash["Factory"][0] * Global.obj_gold_gain["Factory"]
			gold_bars += gb
		# Earn gold based on the quantity of Fishing Boat objects present.
		if Global.player_one_stash["FishBoat"][0] > 0:
			var gb = 0
			gb += Global.player_one_stash["FishBoat"][0] * Global.obj_gold_gain["FishBoat"]
			gold_bars += gb
	else:
		if Global.player_two_stash["Factory"][0] > 0:
			var gb = 0
			gb += Global.player_two_stash["Factory"][0] * Global.obj_gold_gain["Factory"]
			gold_bars += gb
		if Global.player_two_stash["FishBoat"][0] > 0:
			var gb = 0
			gb += Global.player_two_stash["FishBoat"][0] * Global.obj_gold_gain["FishBoat"]
			gold_bars += gb
	gold_bars = add_productivity_bonus(player, gold_bars)
	return gold_bars

# Calculates the current score of Player One.
func calc_p1_curr_score():
	var pop = floor(Global.player_one_population * 0.01)
	var house_mult = Global.player_one_stash["Housing"][0] * 500
	var housing_score = int((house_mult / pop) / 3)
	if housing_score > 30:
		housing_score = 30
	var gb_earned = player_one_gb_earned
	gb_earned *= 100
	var gdp_score = int((gb_earned / pop) / 12)
	if gdp_score > 30:
		gdp_score = 30
	var food_supply_score = int((((Global.player_one_stash["Crops"][0] + \
	Global.player_one_stash["FishBoat"][0]) * 500) / pop) / 3)
	if food_supply_score > 30:
		food_supply_score = 30
	Global.player_one_current_score = housing_score + gdp_score + food_supply_score
	# Add points based on the amount of School objects.
	if Global.player_one_stash["School"][0] > 0:
		var points = 0
		points += Global.player_one_stash["School"][0] * Global.obj_points_gain["School"]
		Global.player_one_current_score += points
	# Add points based on the amount of Hospital objects.
	if Global.player_one_stash["Hospital"][0] > 0:
		var points = 0
		points += Global.player_one_stash["Hospital"][0] * Global.obj_points_gain["Hospital"]
		Global.player_one_current_score += points
	if Global.player_one_current_score > 100:
		Global.player_one_current_score = 100

# Calculates the current score of Player Two.
func calc_p2_curr_score():
	var pop = floor(Global.player_two_population * 0.01)
	var house_mult = Global.player_two_stash["Housing"][0] * 500
	var housing_score = int((house_mult / pop) / 3)
	if housing_score > 30:
		housing_score = 30
	var gb_earned = player_two_gb_earned
	gb_earned *= 100
	var gdp_score = int((gb_earned / pop) / 12)
	if gdp_score > 30:
		gdp_score = 30
	var food_supply_score = int((((Global.player_two_stash["Crops"][0] + \
	Global.player_two_stash["FishBoat"][0]) * 500) / pop) / 3)
	if food_supply_score > 30:
		food_supply_score = 30
	Global.player_two_current_score = housing_score + gdp_score + food_supply_score
	if Global.player_two_stash["School"][0] > 0:
		var points = 0
		points += Global.player_two_stash["School"][0] * Global.obj_points_gain["School"]
		Global.player_two_current_score += points
	if Global.player_two_stash["Hospital"][0] > 0:
		var points = 0
		points += Global.player_two_stash["Hospital"][0] * Global.obj_points_gain["Hospital"]
		Global.player_two_current_score += points
	if Global.player_two_current_score > 100:
		Global.player_two_current_score = 100

# A helper function for "end_of_round".
func end_of_round_hlpr():
	update_population("Player One")
	update_population("Player Two")
	sb_player_one_population.text = str(Global.player_one_population)
	sb_player_two_population.text = str(Global.player_two_population)
	Global.player_one_gold_bars += add_gold_bars("Player One")
	Global.player_two_gold_bars += add_gold_bars("Player Two")
	# Reset the current score to 0 at the conclusion of each round.
	Global.player_one_prev_score = Global.player_one_current_score
	Global.player_two_prev_score = Global.player_two_current_score
	Global.player_one_current_score = 0
	Global.player_two_current_score = 0
	calc_p1_curr_score()
	calc_p2_curr_score()
	# Refresh the label to display the current score.
	sb_player_one_current_score.text = str(Global.player_one_current_score)
	sb_player_two_current_score.text = str(Global.player_two_current_score)
	# Add the current score to the total score.
	Global.player_one_total_score += Global.player_one_current_score
	Global.player_two_total_score += Global.player_two_current_score
	# Update the label to show the total score.
	sb_player_one_total_score.text = str(Global.player_one_total_score)
	sb_player_two_total_score.text = str(Global.player_two_total_score)
	# Set the text to the value of the "Global term_of_office".
	sb_term_of_office.text = str(Global.term_of_office)

# This function is called at the end of a game round.
func end_of_round():
	if Global.term_of_office > 1:
		# Keep track of current round number.
		Global.rnd_cntr += 1
		# Decrement the number of rounds by 1.
		Global.term_of_office -= 1
		print("End of round ", Global.rnd_cntr, "!")
		end_of_round_hlpr()
		# Set timer to the value of 'length_of_round' variable.
		sb_length_of_round_timer.wait_time = Global.length_of_round
		sb_length_of_round_timer.start()
	elif Global.term_of_office == 1:
		Global.rnd_cntr += 1
		Global.term_of_office -= 1
		Global.end_signal = true
		print("End of match!")
		end_of_round_hlpr()
		# Disable labels/buttons and rearrange labels on scoreboard. Show the final scores.
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

# Called when the node enters the scene tree for the first time.
func _ready():
	# Set text to the number of rounds and start timer.
	sb_term_of_office.text = str(Global.term_of_office)
	sb_length_of_round_timer.wait_time = Global.length_of_round
	sb_length_of_round_timer.start()

# Called every frame. "delta" is the elapsed time since the previous frame.
func _process(_delta):
	if sb_length_of_round_timer.time_left > 0:
		# Update the labels at every frame.
		sb_player_one_gold_bars.text = str(Global.player_one_gold_bars)
		sb_player_two_gold_bars.text = str(Global.player_two_gold_bars)
		sb_length_of_round.text = str(round(sb_length_of_round_timer.time_left))
	elif sb_length_of_round_timer.time_left == 0:
		end_of_round()
