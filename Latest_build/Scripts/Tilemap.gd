extends TileMap

@onready var sb_length_of_round_timer: Timer = \
$SBCanvasLayer/SBControl/SBLengthOfRound/SBLengthOfRoundTimer
@onready var po_cfm_dialog: ConfirmationDialog = $SBCanvasLayer/POCanvasLayer/POConfirmationDialog
@onready var w_warning_left = $SBCanvasLayer/WCanvasLayer/WControl/WWarningLeft
@onready var w_warning_right = $SBCanvasLayer/WCanvasLayer/WControl/WWarningRight
@onready var event_spawn_timer: Timer = $SBCanvasLayer/Event_spawn_timer
@onready var pause_menu = $"../PMCanvasLayer"
@onready var resume_button = $"../PMCanvasLayer/PMControl2/PMResume"
const ground_sea_layer: int = 0
const cursor_one_layer: int = 1
const cursor_two_layer: int = 2
const object_layer: int = 3
const sea_two_layer = 4
const ground_sea_id: int = 1
const cursor_id: int = 2
const placeable_object_id: int = 3
const placeable_ocean_id: int = 4
const island_one: Vector2i = Vector2i(0, 0)
const island_two: Vector2i = Vector2i(1, 0)
const sea: Vector2i = Vector2i(2, 0) 
const harbor_one: Vector2i = Vector2i(-13, 6)
const harbor_two: Vector2i = Vector2i(9, -8)
const player_one_cursor: Vector2i = Vector2i(0, 0)
const player_two_cursor: Vector2i = Vector2i(1, 0)
const combined_cursor: Vector2i = Vector2i(2, 0)
const acre_of_crops: Vector2i = Vector2i(0, 0)
const factory: Vector2i = Vector2i(1, 0)
const fishing_boat: Vector2i = Vector2i(2, 0)
const fort: Vector2i = Vector2i(0, 1)
const hospital: Vector2i = Vector2i(1, 1)
const housing_project: Vector2i = Vector2i(2, 1)
const pt_boat: Vector2i = Vector2i(0, 2)
const rebel_soldier: Vector2i = Vector2i(1, 2)
const school: Vector2i = Vector2i(2, 2)
const no_tile: Vector2i = Vector2i(-1, -1)
const no_alt_tile: int = 0
var island_one_cells = get_used_cells_by_id(ground_sea_layer, ground_sea_id, island_one, \
no_alt_tile)
var island_two_cells = get_used_cells_by_id(ground_sea_layer, ground_sea_id, island_two, \
no_alt_tile)
var player_one_start_pos = Vector2i(-17, -5)
var player_two_start_pos = Vector2i(1, -5)
var player_one_curr_pos: Vector2i
var player_two_curr_pos: Vector2i
var player_one_tile_memory = []
var player_two_tile_memory = []
var player_one_crops_life = []
var player_two_crops_life = []
var player_one_food_count: int = 0
var player_two_food_count: int = 0
var player_one_housing_count: int = 0
var player_two_housing_count: int = 0
var interaction_mode: bool = false
var sailing_mode_1: bool = false
var sailing_mode_2: bool = false
var allow_delay_1: bool = true
var allow_delay_2: bool = true
var warning_state_1: bool = false
var warning_state_2: bool = false
var prev_w_state_1: bool = false
var prev_w_state_2: bool = false
var place_obj: bool = false
var is_paused: bool = false
var pirate_count = 0
var fish_count = 0
var event_list = ["rain", "storm", "hurricane"]

# This function is called when the player confirms an action in the confirmation dialog.
# It sets the "place_obj" flag to true, indicating that the player intends to place an object
# on the tilemap.
func _on_po_cfm_dialog_confirmed():
	place_obj = true

# Check for an alternative tile (out-of-bounds) at the specified position.
func check_for_alt_tile(pos):
	var alt_tile = get_cell_alternative_tile(ground_sea_layer, pos)
	if alt_tile == 0:
		return true
	else:
		return false

# Move and update Player One's position on the tilemap.
func player_one_mov(pos):
	po_cfm_dialog.visible = false
	if check_for_alt_tile(pos):
		player_one_curr_pos = pos
		set_cell(cursor_one_layer, player_one_curr_pos, cursor_id, player_one_cursor, no_alt_tile)
		if player_one_curr_pos == player_two_curr_pos:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, combined_cursor, \
			no_alt_tile)
			print("Player One moved to position: ", player_one_curr_pos)
		else:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, player_two_cursor, \
			no_alt_tile)
			print("Player One moved to position: ", player_one_curr_pos)
		player_one_tile_memory.append(player_one_curr_pos)
		set_cell(cursor_one_layer, player_one_tile_memory[-2], cursor_id, no_tile, no_alt_tile)
		player_one_tile_memory = [player_one_tile_memory[-1]]

# Move and update Player Two's position on the tilemap.
func player_two_mov(pos):
	po_cfm_dialog.visible = false
	if check_for_alt_tile(pos):
		player_two_curr_pos = pos
		if player_two_curr_pos == player_one_curr_pos:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, combined_cursor, \
			no_alt_tile)
			print("Player Two moved to position: ", player_two_curr_pos)
		else:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, player_two_cursor, \
			no_alt_tile)
			print("Player Two moved to position: ", player_two_curr_pos)
		player_two_tile_memory.append(player_two_curr_pos)
		set_cell(cursor_two_layer, player_two_tile_memory[-2], cursor_id, no_tile, no_alt_tile)
		player_two_tile_memory = [player_two_tile_memory[-1]]

# A helper function to move and update the position of a boat object on the tilemap based on 
# specified conditions.
func boat_mov_hlpr(comp, player, obj, pos, at_coords):
	var atlas_coords = get_cell_atlas_coords(ground_sea_layer, pos)
	if atlas_coords == at_coords:
		if player == "Player One":
			set_cell(object_layer, pos, placeable_ocean_id, obj, no_alt_tile)
			Global.player_one_stash[comp].append(pos)
		elif player == "Player Two":
				set_cell(object_layer, pos, placeable_ocean_id, obj, no_alt_tile)
				Global.player_two_stash[comp].append(pos)

# A function for managing boat objects and ensuring valid moves.
func boat_mov(lbl, player, curr_pos, new_pos, local_pos):
	var boat_obj = null
	if lbl == "PTBoat":
		boat_obj = Vector2i(0, 6) # pt_boat
	elif lbl == "FishBoat":
		boat_obj = Vector2i(0, 0) # fishing_boat
	if new_pos in Global.player_one_stash["PTBoat"]:
		print("Player Two: Crash risk ahead!")
	elif new_pos in Global.player_two_stash["PTBoat"]:
		print("Player One: Crash risk ahead!")
	elif get_cell_atlas_coords(sea_two_layer, new_pos) == Vector2i(0, 3):
		print("Pirate Ahead! Re-route!")
	elif get_cell_atlas_coords(sea_two_layer, new_pos) == Vector2i(0, 7):
		print("Storm Ahead! Re-route!")
	elif get_cell_atlas_coords(sea_two_layer, new_pos) == Vector2i(0, 8):
		print("Hurricane Ahead! Re-route!")
	elif new_pos in Global.player_two_stash["FishBoat"] and  lbl == "FishBoat" \
	|| new_pos in Global.player_two_stash["FishBoat"]  and  lbl == "FishBoat":
		print("We're just fish'n")
	elif new_pos in Global.player_one_stash["FishBoat"]:
		if lbl == "PTBoat" and player == "Player Two":
			var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_pos)
			if atlas_coords == sea && check_for_alt_tile(new_pos):
				player_two_curr_pos = new_pos
				set_cell(object_layer, curr_pos, -1)
				Global.player_two_stash[lbl].remove_at(local_pos)
				player_two_mov(player_two_curr_pos)
				boat_mov_hlpr(lbl, "Player Two", boat_obj, new_pos, sea)
				set_cell(object_layer, new_pos, placeable_ocean_id, Vector2i(0, 5))
				var index = Global.player_one_stash["FishBoat"].find(new_pos, 1)
				sailing_mode_1 = false
				remove_stash_obj("FishBoat", "Player one", (index - 1))
				await get_tree().create_timer(0.5).timeout
				set_cell(object_layer, new_pos, placeable_ocean_id, Vector2i(0, 2))
				await get_tree().create_timer(0.5).timeout
				set_cell(object_layer, new_pos, placeable_ocean_id, boat_obj)
				await get_tree().create_timer(0.5).timeout
				set_cell(object_layer, new_pos, -1)
	elif new_pos in Global.player_two_stash["FishBoat"]:
		if lbl == "PTBoat" and player == "Player One":
			var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_pos)
			if atlas_coords == sea && check_for_alt_tile(new_pos):
				player_one_curr_pos = new_pos
				set_cell(object_layer, curr_pos, -1)
				Global.player_one_stash[lbl].remove_at(local_pos)
				player_one_mov(player_one_curr_pos)
				boat_mov_hlpr(lbl, "Player One", boat_obj, new_pos, sea)
				set_cell(object_layer, new_pos, placeable_ocean_id, Vector2i(0, 5))
				var index = Global.player_two_stash["FishBoat"].find(new_pos, 1)
				sailing_mode_2 = false
				remove_stash_obj("FishBoat", "Player Two", (index - 1))
				await get_tree().create_timer(0.5).timeout
				set_cell(object_layer, new_pos, placeable_ocean_id, Vector2i(0, 2))
				await get_tree().create_timer(0.5).timeout
				set_cell(object_layer, new_pos, placeable_ocean_id, boat_obj)
				await get_tree().create_timer(0.5).timeout
				set_cell(object_layer, new_pos, -1)
	elif player == "Player One":
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_pos)
		if atlas_coords == sea && check_for_alt_tile(new_pos):
			player_one_curr_pos = new_pos
			set_cell(object_layer, curr_pos, -1)
			Global.player_one_stash[lbl].remove_at(local_pos)
			player_one_mov(player_one_curr_pos)
			boat_mov_hlpr(lbl, "Player One", boat_obj, new_pos, sea)
			if lbl == "FishBoat" and get_cell_atlas_coords(sea_two_layer, new_pos) == Vector2i(0, 4):
				set_cell(sea_two_layer, new_pos, placeable_ocean_id, Vector2i(0, 0))
				Global.player_one_gold_bars += 1
				await get_tree().create_timer(0.2).timeout
				set_cell(sea_two_layer, new_pos, -1)
	elif player == "Player Two":
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_pos)
		if atlas_coords == sea && check_for_alt_tile(new_pos):
			player_two_curr_pos = new_pos
			set_cell(object_layer, curr_pos, -1)
			Global.player_two_stash[lbl].remove_at(local_pos)
			player_two_mov(player_two_curr_pos)
			boat_mov_hlpr(lbl, "Player Two", boat_obj, new_pos, sea)
			if lbl == "FishBoat" and get_cell_atlas_coords(sea_two_layer, new_pos) == Vector2i(0, 4):
				set_cell(sea_two_layer, new_pos, placeable_ocean_id, Vector2i(0, 0))
				Global.player_two_gold_bars += 1
				await get_tree().create_timer(0.2).timeout
				set_cell(sea_two_layer, new_pos, -1)

# This function gets neighbors of a given tile and returns a valid next position
func getHexNeighbors(pos: Vector2i, event) -> Vector2i:
	var directions: Array = [
		Vector2i(pos[0], pos[1] - 1),
		Vector2i(pos[0] - 1, pos[1]),
		Vector2i(pos[0], pos[1] + 1),
		Vector2i(pos[0] + 1, pos[1]),
	]
	var valid_neighbors: Array = []
	if event == "pirate" || event == "fishing":
		for dir in directions:
			var atlas_coords = get_cell_atlas_coords(ground_sea_layer, dir)
			if atlas_coords == sea and check_for_alt_tile(dir):
				valid_neighbors.append(dir)
	else:
		for dir in directions:
			if check_for_alt_tile(dir):
				valid_neighbors.append(dir)
	if valid_neighbors.size() > 0:
		var next_pos = valid_neighbors[randi_range(0, valid_neighbors.size() - 1)]
		return next_pos
	else:
		return pos

# This function returns an random valid point on the edge of the tilemap
func get_random_edge_point():
	var corner1 = Vector2i(-18, -9)
	var corner2 = Vector2i(18, -9)
	var corner3 = Vector2i(-18, 13)
	var corner4 = Vector2i(18, 13)
	var edge = randi() % 4
	var random_coordinate: Vector2i
	var out = [Vector2i(-18, -8), Vector2i(-18, -6), Vector2i(-18, -4), Vector2i(-18, -2), \
	Vector2i(-18, 0), Vector2i(-18, 2), Vector2i(-18, 4), Vector2i(-18, 6), Vector2i(-18, 8), \
	Vector2i(-18, 10), Vector2i(-18, 12), Vector2i(-18, 14)]
	while true:
		if edge == 0:  # Top edge
			random_coordinate = Vector2i(randi_range(corner1.x, corner2.x), corner1.y)
		elif edge == 1:  # Bottom edge
			random_coordinate = Vector2i(randi_range(corner3.x, corner4.x), corner3.y)
		elif edge == 2:  # Left edge
			random_coordinate = Vector2i(corner1.x, randi_range(corner1.y, corner3.y))
		elif edge == 3:  # Right edge
			random_coordinate = Vector2i(corner2.x, randi_range(corner2.y, corner4.y))
		if random_coordinate not in out:
			break
	return random_coordinate

# This function spawns a random event and takes actions for or against objects as a resut of collison
func randomEvent(event):
	var sprite = Vector2i(0, 0)
	var alive = true
	if event == "pirate" || event == "fishing":
		if event == "pirate":
			sprite = Vector2i(0, 3)
			if pirate_count >= 2:
				return
			elif pirate_count < 2:
				pirate_count += 1
		elif event == "fishing":
			sprite = Vector2i(0, 4)
			if fish_count >= 2:
				return
			elif fish_count < 2:
				fish_count += 1
		var start_pos = get_random_edge_point()
		set_cell(sea_two_layer, start_pos, placeable_ocean_id, sprite, no_alt_tile)
		var randpath = []
		randpath.append(start_pos)
		while alive:
			var new_pos = getHexNeighbors(randpath[-1], event)
			if event == "pirate":
				if get_cell_atlas_coords(object_layer, new_pos) == Vector2i(0, 6):
					set_cell(sea_two_layer, new_pos, -1)
					print("PATROL AHEAD!!!")
					if new_pos in randpath:
						randpath.erase(new_pos)
				else:
					randpath.append(new_pos)
			var next_pos = randpath[-1]
			var current_pos = next_pos
			if randpath.size() < 2:
				current_pos = next_pos
			else:
				current_pos = randpath[-2]
			await get_tree().create_timer(1.0).timeout
			if randpath.size() > 4:
				randpath.remove_at(0)
			
			if get_cell_atlas_coords(sea_two_layer, current_pos) == Vector2i(0, 8):
				if randf() < 0.67:
					set_cell(sea_two_layer, current_pos, -1)
					if event == "pirate":
						pirate_count -= 1
					elif event == "fishing":
						fish_count -= 1
					alive = false
					break
				else:
					pass
			elif get_cell_atlas_coords(sea_two_layer, current_pos) == Vector2i(0, 7):
				if randf() < 0.20:
					set_cell(sea_two_layer, current_pos, -1)
					if event == "pirate":
						pirate_count -= 1
					elif event == "fishing":
						fish_count -= 1
					alive = false
					break
				else:
					pass
			elif event == "pirate" and get_cell_atlas_coords(object_layer, new_pos) == Vector2i(0, 0):
				set_cell(sea_two_layer, current_pos, -1)
				if next_pos in Global.player_one_stash["FishBoat"]:
					sailing_mode_1 = false
					var index = Global.player_one_stash["FishBoat"].find(next_pos, 1)
					remove_stash_obj("FishBoat", "Player One", (index - 1))
					set_cell(object_layer, next_pos, placeable_ocean_id, Vector2i(0, 5))
					await get_tree().create_timer(0.5).timeout
					set_cell(object_layer, next_pos, placeable_ocean_id, Vector2i(0, 2))
					await get_tree().create_timer(0.4).timeout
					set_cell(object_layer, next_pos, -1)
				elif next_pos in Global.player_two_stash["FishBoat"]:
					sailing_mode_2 = false
					var index = Global.player_two_stash["FishBoat"].find(next_pos, 1)
					remove_stash_obj("FishBoat", "Player Two", (index - 1))
					set_cell(object_layer, next_pos, placeable_ocean_id, Vector2i(0, 5))
					await get_tree().create_timer(0.5).timeout
					set_cell(object_layer, next_pos, placeable_ocean_id, Vector2i(0, 2))
					await get_tree().create_timer(0.4).timeout
					set_cell(object_layer, next_pos, -1)
				else:
					print("NO POSITION MATCH FOUND")
			else:
				set_cell(sea_two_layer, current_pos, -1)
				set_cell(sea_two_layer, next_pos, placeable_ocean_id, sprite, no_alt_tile)
	else:
		if event == "hurricane":
			sprite = Vector2i(0, 8)
		elif event == 'rain':
			sprite = Vector2i(0, 1)
		elif event == 'storm':
			sprite = Vector2i(0, 7)
		var comps = ["Fort", "Factory", "Crops", "School", "Hospital", "Housing", "Rebel", "PTBoat", "FishBoat"]
		var comp_vec = [Vector2i(0, 0), Vector2i(0, 1), Vector2i(0, 2), Vector2i(1, 0), \
		Vector2i(1, 1), Vector2i(1, 2), Vector2i(2, 0), Vector2i(2, 1), Vector2i(2, 2), Vector2i(0, 6)]
		var start_pos = get_random_edge_point()
		set_cell(sea_two_layer, start_pos, placeable_ocean_id, sprite, no_alt_tile)
		var randpath = []
		randpath.append(start_pos)
		var count = 0
		
		while count <= 30:
			var new_pos = getHexNeighbors(randpath[-1], event)
			randpath.append(new_pos)
			await get_tree().create_timer(1.0).timeout
			count += 1
			var current_pos = randpath[-2]
			var next_pos = randpath[-1]
			
			if event == "hurricane":
				set_cell(sea_two_layer, current_pos, -1)
				set_cell(sea_two_layer, next_pos, placeable_ocean_id, sprite, no_alt_tile)
				if get_cell_atlas_coords(object_layer, next_pos) in comp_vec:
					#print("Hurricane Collision Detected!")
					for i in comps:
						if next_pos in Global.player_one_stash[i]:
							var index = Global.player_one_stash[i].find(next_pos, 1)
							if randf() < 0.67:  
								if i == "FishBoat" || i == "PTBoat":
									sailing_mode_1 = false
								print("Deleting: ", i)
								remove_stash_obj(i, "Player One", (index - 1))
						elif next_pos in Global.player_two_stash[i]:
							print("Deleting: ", i)
							var index = Global.player_two_stash[i].find(next_pos, 1)
							if randf() < 0.67:  
								if i == "FishBoat" || i == "PTBoat":
									sailing_mode_2 = false
								print("Deleting: ", i)
								remove_stash_obj(i, "Player Two", (index - 1))
								
			elif event == "rain":
				set_cell(sea_two_layer, current_pos, -1)
				set_cell(sea_two_layer, next_pos, placeable_ocean_id, sprite, no_alt_tile)
				if get_cell_atlas_coords(object_layer, next_pos) == Vector2i(0, 0):
					if next_pos in Global.player_one_stash["Crops"]:
						Global.player_one_gold_bars += 1
					elif next_pos in Global.player_two_stash["Crops"]:
						Global.player_two_gold_bars += 1
						
			elif event == "storm":
				set_cell(sea_two_layer, current_pos, -1)
				set_cell(sea_two_layer, next_pos, placeable_ocean_id, sprite, no_alt_tile)
				for i in comps:
					if next_pos in Global.player_one_stash[i]:
						print("Deleting: ", i)
						var index = Global.player_one_stash[i].find(next_pos, 1)
						if i == "Crops":
							if randf() < 0.15:
								remove_stash_obj(i, "Player One", (index - 1))
							else:
								Global.player_one_gold_bars += 1
						elif randf() < 0.20:
							if i == "FishBoat" || i == "PTBoat":
								sailing_mode_1 = false
							remove_stash_obj(i, "Player One", (index - 1))
							
					elif next_pos in Global.player_two_stash[i]:
						print("Deleting: ", i)
						var index = Global.player_two_stash[i].find(next_pos, 1)
						if i == "Crops":
							if randf() < 0.15:
								remove_stash_obj(i, "Player Two", (index - 1))
							else:
								Global.player_two_gold_bars += 1
						elif randf() < 0.20:
							if i == "FishBoat" || i == "PTBoat":
								sailing_mode_2 = false
							remove_stash_obj(i, "Player Two", (index - 1))
								
		set_cell(sea_two_layer, randpath[-1], -1)

# This function sinks a given ship
func sink_ship(layer, pos, obj):
	if pos in Global.player_one_stash["FishBoat"] || pos in Global.player_one_stash["PTBoat"]:
		Global.player_one_stash[obj].erase(pos)
		Global.player_one_stash[obj][0] -= 1
	elif pos in Global.player_two_stash["FishBoat"] || pos in Global.player_two_stash["PTBoat"]:
		Global.player_two_stash[obj].erase(pos)
		Global.player_two_stash[obj][0] -= 1
	if obj == "FishBoat":
		set_cell(object_layer, pos, placeable_ocean_id, Vector2i(0, 2), no_alt_tile)
		await get_tree().create_timer(1.5).timeout
	set_cell(layer, pos, 3, no_tile, no_alt_tile)
	pass


# This function deducts the cost of a specified object (retrieved from the "Global.obj_prices"
# dictionary) from the current amount of gold bars and returns the updated number of gold bars.
func alter_gold_bars(gold_bars, cp):
	var new_gb = gold_bars
	new_gb -= Global.obj_prices[cp]
	return new_gb

# A function to handle changing the warning message and state based on certain conditions.
func change_warning(user, w_state, w_num, w_warning):
	if !w_state:
		if w_num == 2:
			w_warning.text = "AN OBJECT ALREADY OCCUPIES THAT SPACE"
			if user == "Player One":
				warning_state_1 = true
			else:
				prev_w_state_2 = w_state
				warning_state_2 = true
		elif w_num == 3:
			w_warning.text = "THE OBJECT CANNOT BE BUILT"
			if user == "Player One":
				warning_state_1 = true
			else:
				warning_state_2 = true
	else:
		if w_num == 1:
			w_warning.text = "INSUFFICENT FUNDS FOR THIS ACTION"
			if user == "Player One":
				warning_state_1 = false
			else:
				warning_state_2 = false
		elif w_num == 3:
			w_warning.text = "THE OBJECT CANNOT BE BUILT"
			if user == "Player One":
				warning_state_1 = false
			else:
				warning_state_2 = false

# This function is capable of showing a warning for 1.5 seconds before hiding it.
func show_warning(user, warning_num):
	if user == "Player One":
		change_warning(user, warning_state_1, warning_num, w_warning_left)
		if allow_delay_1:
			allow_delay_1 = false
			w_warning_left.visible = true
			await get_tree().create_timer(1.5).timeout
			w_warning_left.visible = false
			allow_delay_1 = true
			if warning_state_1:
				w_warning_left.text = "AN OBJECT ALREADY OCCUPIES THAT SPACE"
			else:
				w_warning_left.text = "INSUFFICENT FUNDS FOR THIS ACTION"
	else:
		change_warning(user, warning_state_2, warning_num, w_warning_right)
		if allow_delay_2:
			allow_delay_2 = false
			w_warning_right.visible = true
			await get_tree().create_timer(1.5).timeout
			w_warning_right.visible = false
			allow_delay_2 = true
			if warning_state_2:
				w_warning_right.text = "AN OBJECT ALREADY OCCUPIES THAT SPACE"
			else:
				w_warning_right.text = "INSUFFICENT FUNDS FOR THIS ACTION"

# A helper function for "player_add_other". It can carry out a transaction, initiate the
# addition of the specified object to the player's inventory, update the tilemap accordingly,
# and more.
func player_add_other_hlpr(source_id, comp, player, obj, pos):
	if source_id != placeable_object_id:
		if player == "Player One":
			if Global.player_one_gold_bars >= Global.obj_prices[comp]:
				var p1_new_gb = alter_gold_bars(Global.player_one_gold_bars, comp)
				Global.player_one_gold_bars = p1_new_gb
				set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
				Global.player_one_stash[comp][0] += 1
				Global.player_one_stash[comp].append(pos)
				if comp == "Crops":
					player_one_crops_life.append(randi_range(1, Global.max_crops_life))
					player_one_food_count += 500
				if comp == "Housing":
					player_one_housing_count += 500
				if comp == "FishBoat":
					player_one_food_count += 500
				print(" The object is placed at position: ", pos)
			else:
				print(" Not enough funds")
				show_warning(player, 1)
		else:
			if Global.player_two_gold_bars >= Global.obj_prices[comp]:
				var p2_new_gb = alter_gold_bars(Global.player_two_gold_bars, comp)
				Global.player_two_gold_bars = p2_new_gb
				set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
				Global.player_two_stash[comp][0] += 1
				Global.player_two_stash[comp].append(pos)
				if comp == "Crops":
					player_two_crops_life.append(randi_range(1, Global.max_crops_life))
					player_one_food_count += 500
				if comp == "Housing":
					player_two_housing_count += 500
				if comp == "FishBoat":
					player_one_food_count += 500
				print(" The object is placed at position: ", pos)
			else:
				print(" Not enough funds")
				show_warning(player, 1)
	else:
		print(" An object already occupies position: ", pos)
		show_warning(player, 2)

# Handles the placement of various game objects by the player on the tilemap based on certain
# conditions.
func player_add_other(comp, player, obj, pos, at_coords):
	if comp == "PTBoat":
		if player == "Player One":
			if Global.player_one_stash[comp][0] < Global.max_pt_boats:
				var source_id = get_cell_source_id(object_layer, pos)
				player_add_other_hlpr(source_id, comp, player, obj, pos)
			else:
				print(" Cannot place a PT Boat, the maximum amount is reached!")
				show_warning(player, 3)
		else:
			if Global.player_two_stash[comp][0] < Global.max_pt_boats:
				var source_id = get_cell_source_id(object_layer, pos)
				player_add_other_hlpr(source_id, comp, player, obj, pos)
			else:
				print(" Cannot place a PT Boat, the maximum amount is reached!")
				show_warning(player, 3)
	elif comp == "FishBoat":
		if player == "Player One":
			if Global.player_one_stash[comp][0] < Global.max_fish_boats:
				var source_id = get_cell_source_id(object_layer, pos)
				player_add_other_hlpr(source_id, comp, player, obj, pos)
			else:
				print(" Cannot place a Fishing Boat, the maximum amount is reached!")
				show_warning(player, 3)
		else:
			if Global.player_two_stash[comp][0] < Global.max_fish_boats:
				var source_id = get_cell_source_id(object_layer, pos)
				player_add_other_hlpr(source_id, comp, player, obj, pos)
			else:
				print(" Cannot place a Fishing Boat, the maximum amount is reached!")
				show_warning(player, 3)
	else:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, pos)
		if atlas_coords == at_coords:
			var source_id = get_cell_source_id(object_layer, pos)
			player_add_other_hlpr(source_id, comp, player, obj, pos)
		else:
			print(" Cannot build at position: ", pos)
			show_warning(player, 3)

# A helper function for "add_rebel". It helps ensure that rebel soldiers are placed only
# on valid, unoccupied cells of the tilemap.
func add_rebel_hlpr(island_cells):
	var used_cells = get_used_cells(object_layer)
	for i in range(used_cells.size() - 1, -1, -1):
		for j in range(island_cells.size() - 1, -1, -1):
			if used_cells[i] == island_cells[j]:
				island_cells.remove_at(j)

# Places a "Rebel Soldier" object on the tilemap, considering the specified island cells
# as potential placement positions. It is capable of executing a transaction, initiating the
# addition of the specified object to the player's inventory, updating the tilemap accordingly,
# and more.
func add_rebel(player, obj, island_cells):
	if player == "Player One":
		var is_spent = false
		for n in range(5):
			var in_fort_area = false
			if Global.player_two_stash["Rebel"][0] < 135:
				if Global.player_one_gold_bars >= Global.obj_prices["Rebel"] || is_spent:
					add_rebel_hlpr(island_cells)
					if island_cells.size() == 0:
						print(" There is no more room for Rebel Soldiers on opponent's island!")
					else:
						var island_cell = island_cells[randi() % island_cells.size()]
						# Check Fort placement and prohibit Rebel spawning in the 3x3 grid around
						# the Fort.
						for x in range(-1, 2):
							for y in range(-1, 2):
								if abs(x + y) <= 1:
									var check_pos = Vector2i(island_cell.x + x, island_cell.y + y)
									if check_pos in Global.player_two_stash["Fort"]:
										if !in_fort_area:
											print(" Cannot place a Rebel Soldier near a Fort!")
											in_fort_area = true
						if !is_spent && !in_fort_area:
							var p1_new_gb = \
							alter_gold_bars(Global.player_one_gold_bars, "Rebel")
							Global.player_one_gold_bars = p1_new_gb
							is_spent = true
						if !in_fort_area:
							set_cell(object_layer, island_cell, placeable_object_id, obj, \
							no_alt_tile)
							Global.player_two_stash["Rebel"][0] += 1
							Global.player_two_stash["Rebel"].append(island_cell)
							print(" The object is placed at position: ", island_cell)
				else:
					print(" Not enough funds")
					show_warning(player, 1)
			else:
				print(" Cannot place a Rebel Soldier, the maximum amount is reached!")
				show_warning(player, 3)
	else:
		var is_spent = false
		for n in range(5):
			var in_fort_area = false
			if Global.player_one_stash["Rebel"][0] < 135:
				if Global.player_two_gold_bars >= Global.obj_prices["Rebel"]  || is_spent:
					add_rebel_hlpr(island_cells)
					if island_cells.size() == 0:
						print(" There is no more room for Rebel Soldiers on opponent's island!")
					else:
						var island_cell = island_cells[randi() % island_cells.size()]
						for x in range(-1, 2):
							for y in range(-1, 2):
								if abs(x + y) <= 1:
									var check_pos = Vector2i(island_cell.x + x, island_cell.y + y)
									if check_pos in Global.player_one_stash["Fort"]:
										if !in_fort_area:
											print(" Cannot place a Rebel Soldier near a Fort!")
											in_fort_area = true
						if !is_spent && !in_fort_area:
							var p1_new_gb = \
							alter_gold_bars(Global.player_two_gold_bars, "Rebel")
							Global.player_two_gold_bars = p1_new_gb
							is_spent = true
						if !in_fort_area:
							set_cell(object_layer, island_cell, placeable_object_id, obj, \
							no_alt_tile)
							Global.player_one_stash["Rebel"][0] += 1
							Global.player_one_stash["Rebel"].append(island_cell)
							print(" The object is placed at position: ", island_cell)
				else:
					print(" Not enough funds")
					show_warning(player, 1)
			else:
				print(" Cannot place a Rebel Soldier, the maximum amount is reached!")
				show_warning(player, 3)

# Checks the well-being of both populations and takes appropriate actions.
func chk_if_happy():
	if Global.player_one_stash["Rebel"][0] <= 135:
		var diff_score = Global.player_one_current_score - Global.player_one_prev_score
		if diff_score >= 10 || Global.player_one_current_score >= 70:
			if Global.player_one_stash["Rebel"][0] > 0:
				remove_stash_obj("Rebel", "Player One", 0)
		if diff_score <= -10 || Global.player_one_current_score < 30:
			var is_displayed = false
			for n in range(5):
				var in_fort_area = false
				if Global.player_one_stash["Rebel"][0] != 135:
					var isl_one_cells = island_one_cells
					add_rebel_hlpr(isl_one_cells)
					if isl_one_cells.size() == 0:
						pass
					else:
						var island_cell = isl_one_cells[randi() % isl_one_cells.size()]
						for x in range(-1, 2):
							for y in range(-1, 2):
								if abs(x + y) <= 1:
									var check_pos = Vector2i(island_cell.x + x, island_cell.y + y)
									if check_pos in Global.player_one_stash["Fort"]:
										if !is_displayed:
											print("Player One: The population is not happy")
											is_displayed = true
										if !in_fort_area:
											print(" Cannot place a Rebel Soldier near a Fort!")
											in_fort_area = true
						if !in_fort_area:
							set_cell(object_layer, island_cell, placeable_object_id, \
							rebel_soldier, no_alt_tile)
							Global.player_one_stash["Rebel"][0] += 1
							Global.player_one_stash["Rebel"].append(island_cell)
							if !is_displayed:
								print("Player One: The population is not happy")
								is_displayed = true
							print(" A Rebel Soldier is placed at position: ", island_cell)
				else:
					if !is_displayed:
						print("Player One: The population is not happy")
						is_displayed = true
	if Global.player_two_stash["Rebel"][0] <= 135:
		var diff_score = Global.player_two_current_score - Global.player_two_prev_score
		if diff_score >= 10 || Global.player_two_current_score >= 70:
			if Global.player_two_stash["Rebel"][0] > 0:
				remove_stash_obj("Rebel", "Player Two", 0)
		if diff_score <= -10 || Global.player_two_current_score < 30:
			var is_displayed = false
			for n in range(5):
				var in_fort_area = false
				if Global.player_two_stash["Rebel"][0] != 135:
					var isl_two_cells = island_two_cells
					add_rebel_hlpr(isl_two_cells)
					if isl_two_cells.size() == 0:
						pass
					else:
						var island_cell = isl_two_cells[randi() % isl_two_cells.size()]
						for x in range(-1, 2):
							for y in range(-1, 2):
								if abs(x + y) <= 1:
									var check_pos = Vector2i(island_cell.x + x, island_cell.y + y)
									if check_pos in Global.player_two_stash["Fort"]:
										if !is_displayed:
											print("Player Two: The population is not happy")
											is_displayed = true
										if !in_fort_area:
											print(" Cannot place a Rebel Soldier near a Fort!")
											in_fort_area = true
						if !in_fort_area:
							set_cell(object_layer, island_cell, placeable_object_id, \
							rebel_soldier, no_alt_tile)
							Global.player_two_stash["Rebel"][0] += 1
							Global.player_two_stash["Rebel"].append(island_cell)
							if !is_displayed:
								print("Player Two: The population is not happy")
								is_displayed = true
							print(" A Rebel Soldier is placed at position: ", island_cell)
				else:
					if !is_displayed:
						print("Player Two: The population is not happy")
						is_displayed = true

# A helper function for the other "on_pressed" button functions.
func on_pressed_other_hlpr(comp, player, obj, pos, at_coords):
	po_cfm_dialog.visible = true
	po_cfm_dialog.disconnect("confirmed", _on_po_cfm_dialog_confirmed)
	po_cfm_dialog.connect("confirmed", _on_po_cfm_dialog_confirmed)
	await(po_cfm_dialog.confirmed)
	if place_obj:
		player_add_other(comp, player, obj, pos, at_coords)
		place_obj = false

# A helper function for the "Rebel Soldier on_pressed" button function.
func on_pressed_rebel_hlpr(player, obj, island_cells):
	po_cfm_dialog.visible = true
	po_cfm_dialog.disconnect("confirmed", _on_po_cfm_dialog_confirmed)
	po_cfm_dialog.connect("confirmed", _on_po_cfm_dialog_confirmed)
	await(po_cfm_dialog.confirmed)
	if place_obj:
		add_rebel(player, obj, island_cells)
		place_obj = false

# Handles the action of placing a "Fort" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFortButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Fort?")
			on_pressed_other_hlpr("Fort", "Player One", fort, player_one_curr_pos, island_one)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Fort?")
			on_pressed_other_hlpr("Fort", "Player Two", fort, player_two_curr_pos, island_two)

# Handles the action of placing a "Factory" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFactoryButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Factory?")
			on_pressed_other_hlpr("Factory", "Player One", factory, player_one_curr_pos, \
			island_one)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Factory?")
			on_pressed_other_hlpr("Factory", "Player Two", factory, player_two_curr_pos, \
			island_two)

# Handles the action of placing a "Acre of Crops" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBAOCButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Acre of Crops?")
			on_pressed_other_hlpr("Crops", "Player One", acre_of_crops, player_one_curr_pos, \
			island_one)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Acre of Crops?")
			on_pressed_other_hlpr("Crops", "Player Two", acre_of_crops, player_two_curr_pos, \
			island_two)

# Handles the action of placing a "School" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode. 
func on_pressed_OBSchoolButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a School?")
			on_pressed_other_hlpr("School", "Player One", school, player_one_curr_pos, island_one)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a School?")
			on_pressed_other_hlpr("School", "Player Two", school, player_two_curr_pos, island_two)

# Handles the action of placing a "Hospital" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBHospitalButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Hospital?")
			on_pressed_other_hlpr("Hospital", "Player One", hospital, player_one_curr_pos, \
			island_one)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Hospital?")
			on_pressed_other_hlpr("Hospital", "Player Two", hospital, player_two_curr_pos, \
			island_two)

# Handles the action of placing a "Housing Project" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBHousingButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Housing Project?")
			on_pressed_other_hlpr("Housing", "Player One", housing_project, player_one_curr_pos, \
			island_one)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Housing Project?")
			on_pressed_other_hlpr("Housing", "Player Two", housing_project, player_two_curr_pos, \
			island_two)

# Handles the action of placing a "Rebel Soldier" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBRSButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Rebel Soldier?")
			var isl_two_cells = island_two_cells
			on_pressed_rebel_hlpr("Player One", rebel_soldier, isl_two_cells)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Rebel Soldier?")
			var isl_one_cells = island_one_cells
			on_pressed_rebel_hlpr("Player Two", rebel_soldier, isl_one_cells)

# Handles the action of placing a "PT Boat" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBPTBoatButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a PT Boat?")
			on_pressed_other_hlpr("PTBoat", "Player One", pt_boat, harbor_one, sea)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a PT Boat?")
			on_pressed_other_hlpr("PTBoat", "Player Two", pt_boat, harbor_two, sea)

# Handles the action of placing a "Fishing Boat" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFBoatButton():
	if !interaction_mode:
		if !sailing_mode_1:
			print("Player One: Place a Fishing Boat?")
			on_pressed_other_hlpr("FishBoat", "Player One", fishing_boat, harbor_one, sea)
	else:
		if !sailing_mode_2:
			print("Player Two: Place a Fishing Boat?")
			on_pressed_other_hlpr("FishBoat", "Player Two", fishing_boat, harbor_two, sea)

func on_pressed_PMResume():
	get_tree().paused = false
	pause_menu.visible = false
	is_paused = false
	resume_button.visible = false

func on_pressed_PMRetry():
	Global.player_one_stash = Global.player_one_stash_bk
	Global.player_two_stash = Global.player_two_stash_bk
	Global.player_one_gold_bars = 100
	Global.player_one_population = 1000
	Global.player_one_current_score = 0
	Global.player_one_prev_score = 0
	Global.player_one_total_score = 0
	Global.player_two_gold_bars = 100
	Global.player_two_population = 1000
	Global.player_two_current_score = 0
	Global.player_two_prev_score = 0
	Global.player_two_total_score = 0
	Global.rnd_cntr = 0
	Global.end_signal = false
	get_tree().paused = false
	get_tree().change_scene_to_file("res://Interface/Setup_Menu.tscn")

func on_pressed_PMExit():
	get_tree().quit()

# A function to remove an object from a player's stash and update the tilemap.
func remove_stash_obj(cp, player, idx):
	if player == "Player One":
		if cp == "Crops":
			player_one_food_count -= 500
			player_one_crops_life.pop_at(idx)
		elif cp == "Housing":
			player_one_housing_count -= 500
		elif cp == "FishBoat":
			player_one_food_count -= 500
		if cp == "Rebel":
			var is_avail = true
			for n in range(5):
				if is_avail == true:
					var pos = Global.player_one_stash[cp].pop_at(idx + 1)
					Global.player_one_stash[cp][0] -= 1
					set_cell(object_layer, pos, placeable_object_id, no_tile, no_alt_tile)
				if Global.player_one_stash[cp][0] == 0 && is_avail == true:
					is_avail = false
		else:
			var pos = Global.player_one_stash[cp].pop_at(idx + 1)
			Global.player_one_stash[cp][0] -= 1
			set_cell(object_layer, pos, placeable_object_id, no_tile, no_alt_tile)
	else:
		if cp == "Crops":
			player_two_food_count -= 500
			player_two_crops_life.pop_at(idx)
		elif cp == "Housing":
			player_two_housing_count -= 500
		elif cp == "FishBoat":
			player_two_food_count -= 500
			
		if cp == "Rebel":
			var is_avail = true
			for n in range(5):
				if is_avail == true:
					var pos = Global.player_two_stash[cp].pop_at(idx + 1)
					Global.player_two_stash[cp][0] -= 1
					set_cell(object_layer, pos, placeable_object_id, no_tile, no_alt_tile)
				if Global.player_two_stash[cp][0] == 0 && is_avail == true:
					is_avail = false
		else:
			var pos = Global.player_two_stash[cp].pop_at(idx + 1)
			Global.player_two_stash[cp][0] -= 1
			set_cell(object_layer, pos, placeable_object_id, no_tile, no_alt_tile)

# Subtracts one from the remaining life of each crop and removes any crops that have no
# remaining life.
func sub_crops_life():
	var to_remove = []
	for index in range(player_one_crops_life.size() - 1, -1, -1):
		player_one_crops_life[index] -= 1
		if player_one_crops_life[index] == 0:
			to_remove.append(index)
	if !to_remove.is_empty():
		for index in to_remove:
			remove_stash_obj("Crops", "Player One", index)
		to_remove.clear()
	for index in range(player_two_crops_life.size() - 1, -1, -1):
		player_two_crops_life[index] -= 1
		if player_two_crops_life[index] == 0:
			to_remove.append(index)
	if !to_remove.is_empty():
		for index in to_remove:
			remove_stash_obj("Crops", "Player Two", index)
		to_remove.clear()

# Handle player movement inputs and update their positions on the tilemap.
func _unhandled_input(event):
	if event.is_action_pressed("Open Pause Menu"):
		if is_paused:
			get_tree().paused = false
			pause_menu.visible = false
			is_paused = false
		else:
			get_tree().paused = true
			pause_menu.visible = true
			resume_button.visible = true
			for button in $"../PMCanvasLayer/PMControl2".get_children():
				button.pressed.connect(func(): call("on_pressed_"+button.name))
			is_paused = true
	elif event.is_action_pressed("Switch Player Interaction Mode"):
		if !interaction_mode:
			interaction_mode = true
			po_cfm_dialog.position = Vector2i(1453, 944)
			print("Interaction mode switched: Player Two can now use mouse controls")
		else:
			interaction_mode = false
			po_cfm_dialog.position = Vector2i(283, 944)
			print("Interaction mode switched: Player One can now use mouse controls")
	elif event.is_action_pressed("Sailing Mode (Player One)"):
		if sailing_mode_1:
			sailing_mode_1 = false
			print("Player One is no longer sailing")
		elif (player_one_curr_pos in Global.player_one_stash["FishBoat"] || \
		player_one_curr_pos in Global.player_one_stash["PTBoat"]):
			sailing_mode_1 = true
			print("Player One is sailing")
	elif event.is_action_pressed("Sailing Mode (Player Two)"):
		if sailing_mode_2:
			sailing_mode_2 = false
			print("Player Two is no longer sailing")
		elif (player_two_curr_pos in Global.player_two_stash["FishBoat"] || \
		player_two_curr_pos in Global.player_two_stash["PTBoat"]):
			sailing_mode_2 = true
			print("Player Two is sailing")
	elif event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT && event.is_pressed():
			var pos_clicked = local_to_map(to_local(event.position))
			if !interaction_mode:
				if pos_clicked != player_one_curr_pos:
					player_one_mov(pos_clicked)
					if sailing_mode_1:
						sailing_mode_1 = false
						print("Player One is no longer sailing")
			else:
				if pos_clicked != player_two_curr_pos:
					player_two_mov(pos_clicked)
					if sailing_mode_2:
						sailing_mode_2 = false
						print("Player Two is no longer sailing")
	if !sailing_mode_1:
		if event.is_action_pressed("Move Up (Player One)"):
			var player_one_pos = player_one_curr_pos
			player_one_pos = Vector2i(player_one_pos[0], player_one_pos[1] - 1)
			player_one_mov(player_one_pos)
		elif event.is_action_pressed("Move Left (Player One)"):
			var player_one_pos = player_one_curr_pos
			player_one_pos = Vector2i(player_one_pos[0] - 1, player_one_pos[1])
			player_one_mov(player_one_pos)
		elif event.is_action_pressed("Move Down (Player One)"):
			var player_one_pos = player_one_curr_pos
			player_one_pos = Vector2i(player_one_pos[0], player_one_pos[1] + 1)
			player_one_mov(player_one_pos)
		elif event.is_action_pressed("Move Right (Player One)"):
			var player_one_pos = player_one_curr_pos
			player_one_pos = Vector2i(player_one_pos[0] + 1, player_one_pos[1])
			player_one_mov(player_one_pos)
		elif event.is_action_pressed("Add Fort (Player One)"):
			print("Player One: Place a Fort?")
			player_add_other("Fort", "Player One", fort, player_one_curr_pos, island_one)
		elif event.is_action_pressed("Add Factory (Player One)"):
			print("Player One: Place a Factory?")
			player_add_other("Factory", "Player One", factory, player_one_curr_pos, island_one)
		elif event.is_action_pressed("Add Acre of Crops (Player One)"):
			print("Player One: Place a Acre of Crops?")
			player_add_other("Crops", "Player One", acre_of_crops, player_one_curr_pos, island_one)
		elif event.is_action_pressed("Add School (Player One)"):
			print("Player One: Place a School?")
			player_add_other("School", "Player One", school, player_one_curr_pos, island_one)
		elif event.is_action_pressed("Add Hospital (Player One)"):
			print("Player One: Place a Hospital?")
			player_add_other("Hospital", "Player One", hospital, player_one_curr_pos, island_one)
		elif event.is_action_pressed("Add Housing Project (Player One)"):
			print("Player One: Place a Housing Project?")
			player_add_other("Housing", "Player One", housing_project, player_one_curr_pos, \
			island_one)
		elif event.is_action_pressed("Add Rebel Soldier (Player One)"):
			print("Player One: Place a Rebel Soldier?")
			var isl_two_cells = island_two_cells
			add_rebel("Player One", rebel_soldier, isl_two_cells)
		elif event.is_action_pressed("Add PT Boat (Player One)"):
			print("Player One: Place a PT Boat?")
			player_add_other("PTBoat", "Player One", pt_boat, harbor_one, sea)
		elif event.is_action_pressed("Add Fishing Boat (Player One)"):
			print("Player One: Place a Fishing Boat?")
			player_add_other("FishBoat", "Player One", fishing_boat, harbor_one, sea)
	elif sailing_mode_1:
		var boat_local = null
		var obj_name = ""
		if player_one_curr_pos in Global.player_one_stash["FishBoat"]:
			obj_name = "FishBoat"
			boat_local = Global.player_one_stash["FishBoat"].find(player_one_curr_pos)
		elif player_one_curr_pos in Global.player_one_stash["PTBoat"]:
			obj_name = "PTBoat"
			boat_local = Global.player_one_stash["PTBoat"].find(player_one_curr_pos)
		if event.is_action_pressed("Move Up (Player One)"):
			var new_boat_pos = Vector2i(player_one_curr_pos[0], player_one_curr_pos[1] - 1)
			boat_mov(obj_name, "Player One", player_one_curr_pos, new_boat_pos, \
			boat_local)
		elif event.is_action_pressed("Move Left (Player One)"):
			var new_boat_pos = Vector2i(player_one_curr_pos[0] - 1, player_one_curr_pos[1])
			boat_mov(obj_name, "Player One", player_one_curr_pos, new_boat_pos, \
			boat_local)
		elif event.is_action_pressed("Move Down (Player One)"):
			var new_boat_pos = Vector2i(player_one_curr_pos[0], player_one_curr_pos[1] + 1)
			boat_mov(obj_name, "Player One", player_one_curr_pos, new_boat_pos, \
			boat_local)
		elif event.is_action_pressed("Move Right (Player One)"):
			var new_boat_pos = Vector2i(player_one_curr_pos[0] + 1, player_one_curr_pos[1])
			boat_mov(obj_name, "Player One", player_one_curr_pos, new_boat_pos, \
			boat_local)
	if !sailing_mode_2:
		if event.is_action_pressed("Move Up (Player Two)"):
			var player_two_pos = player_two_curr_pos
			player_two_pos = Vector2i(player_two_pos[0], player_two_pos[1] - 1)
			player_two_mov(player_two_pos)
		elif event.is_action_pressed("Move Left (Player Two)"):
			var player_two_pos = player_two_curr_pos
			player_two_pos = Vector2i(player_two_pos[0] - 1, player_two_pos[1])
			player_two_mov(player_two_pos)
		elif event.is_action_pressed("Move Down (Player Two)"):
			var player_two_pos = player_two_curr_pos
			player_two_pos = Vector2i(player_two_pos[0], player_two_pos[1] + 1)
			player_two_mov(player_two_pos)
		elif event.is_action_pressed("Move Right (Player Two)"):
			var player_two_pos = player_two_curr_pos
			player_two_pos = Vector2i(player_two_pos[0] + 1, player_two_pos[1])
			player_two_mov(player_two_pos)
		elif event.is_action_pressed("Add Fort (Player Two)"):
			print("Player Two: Place a Fort?")
			player_add_other("Fort", "Player Two", fort, player_two_curr_pos, island_two)
		elif event.is_action_pressed("Add Factory (Player Two)"):
			print("Player Two: Place a Factory?")
			player_add_other("Factory", "Player Two", factory, player_two_curr_pos, island_two)
		elif event.is_action_pressed("Add Acre of Crops (Player Two)"):
			print("Player Two: Place a Acre of Crops?")
			player_add_other("Crops", "Player Two", acre_of_crops, player_two_curr_pos, island_two)
		elif event.is_action_pressed("Add School (Player Two)"):
			print("Player Two: Place a School?")
			player_add_other("School", "Player Two", school, player_two_curr_pos, island_two)
		elif event.is_action_pressed("Add Hospital (Player Two)"):
			print("Player Two: Place a Hospital?")
			player_add_other("Hospital", "Player Two", hospital, player_two_curr_pos, island_two)
		elif event.is_action_pressed("Add Housing Project (Player Two)"):
			print("Player Two: Place a Housing Project?")
			player_add_other("Housing", "Player Two", housing_project, player_two_curr_pos, \
			island_two)
		elif event.is_action_pressed("Add Rebel Soldier (Player Two)"):
			print("Player Two: Place a Rebel Soldier?")
			var isl_one_cells = island_one_cells
			add_rebel("Player Two", rebel_soldier, isl_one_cells)
		elif event.is_action_pressed("Add PT Boat (Player Two)"):
			print("Player Two: Place a PT Boat?")
			player_add_other("PTBoat", "Player Two", pt_boat, harbor_two, sea)
		elif event.is_action_pressed("Add Fishing Boat (Player Two)"):
			print("Player Two: Place a Fishing Boat?")
			player_add_other("FishBoat", "Player Two", fishing_boat, harbor_two, sea)
	elif sailing_mode_2:
		var boat_local = null
		var obj_name = ""
		if player_two_curr_pos in Global.player_two_stash["FishBoat"]:
			obj_name = "FishBoat"
			boat_local = Global.player_two_stash["FishBoat"].find(player_two_curr_pos)
		elif player_two_curr_pos in Global.player_two_stash["PTBoat"]:
			obj_name = "PTBoat"
			boat_local = Global.player_two_stash["PTBoat"].find(player_two_curr_pos)
		if event.is_action_pressed("Move Up (Player Two)"):
			var new_boat_pos = Vector2i(player_two_curr_pos[0], player_two_curr_pos[1] - 1)
			boat_mov(obj_name, "Player Two", player_two_curr_pos, new_boat_pos, \
			boat_local)
		elif event.is_action_pressed("Move Left (Player Two)"):
			var new_boat_pos = Vector2i(player_two_curr_pos[0] - 1, player_two_curr_pos[1])
			boat_mov(obj_name, "Player Two", player_two_curr_pos, new_boat_pos, \
			boat_local)
		elif event.is_action_pressed("Move Down (Player Two)"):
			var new_boat_pos = Vector2i(player_two_curr_pos[0], player_two_curr_pos[1] + 1)
			boat_mov(obj_name, "Player Two", player_two_curr_pos, new_boat_pos, \
			boat_local)
		elif event.is_action_pressed("Move Right (Player Two)"):
			var new_boat_pos = Vector2i(player_two_curr_pos[0] + 1, player_two_curr_pos[1])
			boat_mov(obj_name, "Player Two", player_two_curr_pos, new_boat_pos, \
			boat_local)

func _on_event_spawn_timer_timeout():
	var index = randi_range(0, (event_list.size() - 1))
	var event = event_list[index]
	randomEvent(event)
	randomEvent("pirate")
	randomEvent("fishing")
	event_spawn_timer.start()

# Called when the node enters the scene tree for the first time.
func _ready():
	# Set Player One cursor on the tilemap and obtain its position.
	set_cell(cursor_one_layer, player_one_start_pos, cursor_id, player_one_cursor, no_alt_tile)
	print("Player One starting position: ", player_one_start_pos)
	player_one_tile_memory.append(player_one_start_pos)
	player_one_curr_pos = player_one_start_pos
	player_one_start_pos = []
	# Set Player Two cursor on the tilemap and obtain its position.
	set_cell(cursor_two_layer, player_two_start_pos, cursor_id, player_two_cursor, no_alt_tile)
	print("Player Two starting position: ", player_two_start_pos)
	player_two_tile_memory.append(player_two_start_pos)
	player_two_curr_pos = player_two_start_pos
	player_two_start_pos = []
	# This code iterates through buttons within a specific hierarchy and connects their "pressed"
	# signals to corresponding functions using their names.
	for button in $SBCanvasLayer/OBCanvasLayer/OBControl.get_children():
		button.pressed.connect(func(): call("on_pressed_"+button.name))
	#$SBCanvasLayer/OBCanvasLayer/OBControl/OBFortButton.grab_focus()
	event_spawn_timer.start()
	randomEvent("pirate")
	randomEvent("fishing")
	await get_tree().create_timer(0.5).timeout
	randomEvent("pirate")
	randomEvent("fishing")

# Called every frame. "delta" is the elapsed time since the previous frame.
func _process(_delta):
	if sb_length_of_round_timer.time_left == 0 && Global.term_of_office > 1:
		set_process_unhandled_input(false)
		await get_tree().create_timer(0.5).timeout
		chk_if_happy()
		sub_crops_life()
		set_process_unhandled_input(true)
	if Global.end_signal:
		get_tree().paused = true
		pause_menu.visible = true
		resume_button.visible = false
		for button in $"../PMCanvasLayer/PMControl2".get_children():
			if button.name != "PMResume":
				button.pressed.connect(func(): call("on_pressed_"+button.name))
		is_paused = true
		Global.end_signal = false
