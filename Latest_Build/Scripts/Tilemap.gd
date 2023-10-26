extends TileMap

@onready var sb_length_of_round_timer: Timer = $SBCanvasLayer/SBControl/SBLengthOfRound/SBLengthOfRoundTimer
@onready var po_cfm_dialog: ConfirmationDialog = $SBCanvasLayer/POCanvasLayer/POConfirmationDialog
@onready var w_warning_left = $SBCanvasLayer/WCanvasLayer/WControl/WWarningLeft
@onready var w_warning_right = $SBCanvasLayer/WCanvasLayer/WControl/WWarningRight
const ground_sea_layer: int = 0
const cursor_one_layer: int = 1
const cursor_two_layer: int = 2
const object_layer: int = 3
const ground_sea_id: int = 1
const cursor_id: int = 2
const placeable_object_id: int = 3
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
var island_one_cells = get_used_cells_by_id(ground_sea_layer, ground_sea_id, island_one, no_alt_tile)
var island_two_cells = get_used_cells_by_id(ground_sea_layer, ground_sea_id, island_two, no_alt_tile)
var player_one_start_pos = Vector2i(-17, -5)
var player_two_start_pos = Vector2i(1, -5)
var player_one_curr_pos: Vector2i
var player_two_curr_pos: Vector2i
var player_one_tile_memory = []
var player_two_tile_memory = []
var player_one_crops_life = []
var player_two_crops_life = []
var interaction_mode: int = 0
var allow_delay_1: bool = true
var allow_delay_2: bool = true
var warning_state_1: bool = false
var warning_state_2: bool = false
var prev_w_state_1: bool = false
var prev_w_state_2: bool = false
var place_obj: bool = false
var sailing_mode = true
var user_one = "Player One"
var user_two = "Player Two"

# This is a test comment
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
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, combined_cursor, no_alt_tile)
			print("Player One moved to position: ", player_one_curr_pos)
		else:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, player_two_cursor, no_alt_tile)
			print("Player One moved to position: ", player_one_curr_pos)
		player_one_tile_memory.append(player_one_curr_pos)
		set_cell(cursor_one_layer, player_one_tile_memory[-2], cursor_id, no_tile, no_alt_tile)
		player_one_tile_memory = [player_one_tile_memory[-1]]
	else:
		pass

# Move and update Player Two's position on the tilemap.
func player_two_mov(pos):
	po_cfm_dialog.visible = false
	if check_for_alt_tile(pos):
		player_two_curr_pos = pos
		if player_two_curr_pos == player_one_curr_pos:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, combined_cursor, no_alt_tile)
			print("Player Two moved to position: ", player_two_curr_pos)
		else:
			set_cell(cursor_two_layer, player_two_curr_pos, cursor_id, player_two_cursor, no_alt_tile)
			print("Player Two moved to position: ", player_two_curr_pos)
		player_two_tile_memory.append(player_two_curr_pos)
		set_cell(cursor_two_layer, player_two_tile_memory[-2], cursor_id, no_tile, no_alt_tile)
		player_two_tile_memory = [player_two_tile_memory[-1]]
	else:
		pass

func boat_move(comp, player, obj, pos, at_coords):
	#if obj == pt_boat || obj == fishing_boat:
	var atlas_coords = get_cell_atlas_coords(ground_sea_layer, pos)
	if atlas_coords == at_coords:
		if player == user_one:
			set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
			Global.player_one_stash[comp].append(pos)
		elif player == user_two:
				set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
				Global.player_two_stash[comp].append(pos)
		else:
			pass

# This function deducts the cost of a specified object (retrieved from the "Global.obj_prices"
# dictionary) from the current amount of gold bars and returns the updated number of gold bars.
func alter_gold_bars(gold_bars, cp):
	var new_gb = gold_bars
	new_gb -= Global.obj_prices[cp]
	return new_gb

# A function to handle changing the warning message and state based on certain conditions.
func change_warning(user, w_state, w_num, w_warning):
	if w_state == false:
		if w_num == 2:
			w_warning.text = "AN OBJECT ALREADY OCCUPIES THAT SPACE"
			if user == "Player One":
				warning_state_1 = true
			else:
				prev_w_state_2 = w_state
				warning_state_2 = true
		elif w_num == 3:
			w_warning.text = "THE OBJECT CANNOT BE BUILT THERE"
			if user == "Player One":
				warning_state_1 = true
			else:
				warning_state_2 = true
		else:
			pass
	else:
		if w_num == 1:
			w_warning.text = "INSUFFICENT FUNDS FOR THIS ACTION"
			if user == "Player One":
				warning_state_1 = false
			else:
				warning_state_2 = false
		elif w_num == 3:
			w_warning.text = "THE OBJECT CANNOT BE BUILT THERE"
			if user == "Player One":
				warning_state_1 = false
			else:
				warning_state_2 = false
		else:
			pass

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
			if warning_state_1 == true:
				w_warning_left.text = "AN OBJECT ALREADY OCCUPIES THAT SPACE"
			else:
				w_warning_left.text = "INSUFFICENT FUNDS FOR THIS ACTION"
		else:
			pass
	else:
		change_warning(user, warning_state_2, warning_num, w_warning_right)
		if allow_delay_2:
			allow_delay_2 = false
			w_warning_right.visible = true
			await get_tree().create_timer(1.5).timeout
			w_warning_right.visible = false
			allow_delay_2 = true
			if warning_state_2 == true:
				w_warning_right.text = "AN OBJECT ALREADY OCCUPIES THAT SPACE"
			else:
				w_warning_right.text = "INSUFFICENT FUNDS FOR THIS ACTION"
		else:
			pass

func boat_hlpr(player_id, obj_name, boat, new_boat, boat_local):
	var id = null
	if obj_name == "FishBoat":
		id = fishing_boat
	elif obj_name == "PTBoat":
		id = pt_boat
	if new_boat in Global.player_one_stash["FishBoat"] || new_boat in Global.player_one_stash["PTBoat"]:
		print("Crash risk ahead!")
	elif new_boat in Global.player_two_stash["FishBoat"] || new_boat in Global.player_two_stash["PTBoat"]:
		print("Crash risk ahead!")
	elif player_id == Global.player_one_stash:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_boat)
		if atlas_coords == sea and check_for_alt_tile(new_boat):
			player_one_curr_pos = new_boat
			set_cell(object_layer, boat, -1)
			player_id[obj_name].remove_at(boat_local)
			player_one_mov(player_one_curr_pos)
			boat_move(obj_name, user_one, id, new_boat, sea)
			
	elif player_id == Global.player_two_stash:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_boat)
		if atlas_coords == sea and check_for_alt_tile(new_boat):
			player_two_curr_pos = new_boat
			set_cell(object_layer, boat, -1)
			player_id[obj_name].remove_at(boat_local)
			player_two_mov(player_two_curr_pos)
			boat_move(obj_name, user_two, id, new_boat, sea)
	pass

# A helper function for "player_add_other".
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
					Global.player_one_food_count += 500
				else:
					pass
				print(" The object is placed at position: ", pos)
			else:
				print(" Not enough funds.")
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
					Global.player_two_food_count += 500
				else:
					pass
				print(" The object is placed at position: ", pos)
			else:
				print(" Not enough funds.")
				show_warning(player, 1)
	else:
		print(" An object already occupies position: ", pos)
		show_warning(player, 2)

# Handles the placement of various game objects on the tilemap based on certain conditions.
func player_add_other(comp, player, obj, pos, at_coords):
	if obj == pt_boat || obj == fishing_boat:
		var source_id = get_cell_source_id(object_layer, pos)
		player_add_other_hlpr(source_id, comp, player, obj, pos)
	else:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, pos)
		if atlas_coords == at_coords:
			var source_id = get_cell_source_id(object_layer, pos)
			player_add_other_hlpr(source_id, comp, player, obj, pos)
		else:
			print(" Cannot build at position: ", pos)
			show_warning(player, 3)

# A helper function for "player_add_rebel".
func player_add_rebel_hlpr(island_cells):
	var used_cells = get_used_cells(object_layer)
	for i in range(used_cells.size() - 1, -1, -1):
		for j in range(island_cells.size() - 1, -1, -1):
			if used_cells[i] == island_cells[j]:
				island_cells.remove_at(j)
			else:
				pass

# Places a "Rebel Soldier" object on the tilemap, considering the specified island_cells
# as potential placement positions.
func player_add_rebel(player, obj, island_cells):
	if player == "Player One":
		if Global.player_one_gold_bars >= Global.obj_prices["Rebel"]:
			player_add_rebel_hlpr(island_cells)
			if island_cells.size() == 0:
				print(" There is no more room for Rebel Soldiers on opponent's island!")
			else:
				var island_cell = island_cells[randi() % island_cells.size()]
				var p1_new_gb = alter_gold_bars(Global.player_one_gold_bars, "Rebel")
				Global.player_one_gold_bars = p1_new_gb
				set_cell(object_layer, island_cell, placeable_object_id, obj, no_alt_tile)
				Global.player_one_stash["Rebel"][0] += 1
				Global.player_one_stash["Rebel"].append(island_cell)
				print(" The object is placed at position: ", island_cell)
		else:
			print(" Not enough funds.")
			show_warning(player, 1)
	else:
		if Global.player_two_gold_bars >= Global.obj_prices["Rebel"]:
			player_add_rebel_hlpr(island_cells)
			if island_cells.size() == 0:
				print(" There is no more room for Rebel Soldiers on opponent's island!")
			else:
				var island_cell = island_cells[randi() % island_cells.size()]
				var p2_new_gb = alter_gold_bars(Global.player_two_gold_bars, "Rebel")
				Global.player_two_gold_bars = p2_new_gb
				set_cell(object_layer, island_cell, placeable_object_id, obj, no_alt_tile)
				Global.player_two_stash["Rebel"][0] += 1
				Global.player_two_stash["Rebel"].append(island_cell)
				print(" The object is placed at position: ", island_cell)
		else:
			print(" Not enough funds.")
			show_warning(player, 1)

# A helper function for the other "on_pressed" button functions.
func on_pressed_other_hlpr(comp, player, obj, pos, at_coords):
	po_cfm_dialog.visible = true
	po_cfm_dialog.disconnect("confirmed", _on_po_cfm_dialog_confirmed)
	po_cfm_dialog.connect("confirmed", _on_po_cfm_dialog_confirmed)
	await(po_cfm_dialog.confirmed)
	if place_obj == true:
		player_add_other(comp, player, obj, pos, at_coords)
		place_obj = false
	else:
		pass

# A helper function for the "Rebel Soldier on_pressed" button function.
func on_pressed_rebel_hlpr(player, obj, island_cells):
	po_cfm_dialog.visible = true
	po_cfm_dialog.disconnect("confirmed", _on_po_cfm_dialog_confirmed)
	po_cfm_dialog.connect("confirmed", _on_po_cfm_dialog_confirmed)
	await(po_cfm_dialog.confirmed)
	if place_obj == true:
		player_add_rebel(player, obj, island_cells)
		place_obj = false
	else:
		pass

# Handles the action of placing a "Fort" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFortButton():
	if interaction_mode == 0:
		print("Player One: Place a Fort?")
		on_pressed_other_hlpr("Fort", "Player One", fort, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Fort?")
		on_pressed_other_hlpr("Fort", "Player Two", fort, player_two_curr_pos, island_two)

# Handles the action of placing a "Factory" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFactoryButton():
	if interaction_mode == 0:
		print("Player One: Place a Factory?")
		on_pressed_other_hlpr("Factory", "Player One", factory, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Factory?")
		on_pressed_other_hlpr("Factory", "Player Two", factory, player_two_curr_pos, island_two)

# Handles the action of placing a "Acre of Crops" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBAOCButton():
	if interaction_mode == 0:
		print("Player One: Place a Acre of Crops?")
		on_pressed_other_hlpr("Crops", "Player One", acre_of_crops, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Acre of Crops?")
		on_pressed_other_hlpr("Crops", "Player Two", acre_of_crops, player_two_curr_pos, island_two)

# Handles the action of placing a "School" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode. 
func on_pressed_OBSchoolButton():
	if interaction_mode == 0:
		print("Player One: Place a School?")
		on_pressed_other_hlpr("School", "Player One", school, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a School?")
		on_pressed_other_hlpr("School", "Player Two", school, player_two_curr_pos, island_two)

# Handles the action of placing a "Hospital" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBHospitalButton():
	if interaction_mode == 0:
		print("Player One: Place a Hospital?")
		on_pressed_other_hlpr("Hospital", "Player One", hospital, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Hospital?")
		on_pressed_other_hlpr("Hospital", "Player Two", hospital, player_two_curr_pos, island_two)

# Handles the action of placing a "Housing Project" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBHousingButton():
	if interaction_mode == 0:
		print("Player One: Place a Housing Project?")
		on_pressed_other_hlpr("Housing", "Player One", housing_project, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Housing Project?")
		on_pressed_other_hlpr("Housing", "Player Two", housing_project, player_two_curr_pos, island_two)

# Handles the action of placing a "Rebel Soldier" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBRSButton():
	if interaction_mode == 0:
		print("Player One: Place a Rebel Soldier?")
		var isl_two_cells = island_two_cells
		on_pressed_rebel_hlpr("Player One", rebel_soldier, isl_two_cells)
	else:
		print("Player Two: Place a Rebel Soldier?")
		var isl_one_cells = island_one_cells
		on_pressed_rebel_hlpr("Player Two", rebel_soldier, isl_one_cells)

# Handles the action of placing a "PT Boat" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBPTBoatButton():
	if interaction_mode == 0:
		print("Player One: Place a PT Boat?")
		on_pressed_other_hlpr("PTBoat", "Player One", pt_boat, harbor_one, sea)
	else:
		print("Player Two: Place a PT Boat?")
		on_pressed_other_hlpr("PTBoat", "Player Two", pt_boat, harbor_two, sea)

# Handles the action of placing a "Fishing Boat" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFBoatButton():
	if interaction_mode == 0:
		print("Player One: Place a Fishing Boat?")
		on_pressed_other_hlpr("FishBoat", "Player One", fishing_boat, harbor_one, sea)
	else:
		print("Player Two: Place a Fishing Boat?")
		on_pressed_other_hlpr("FishBoat", "Player Two", fishing_boat, harbor_two, sea)

# A function to remove an object from a player's stash and update the tilemap.
func remove_stash_obj(cp, player, idx):
	if player == "Player One":
		player_one_crops_life.pop_at(idx)
		var pos = Global.player_one_stash[cp].pop_at(idx + 1)
		Global.player_one_stash[cp][0] -= 1
		set_cell(object_layer, pos, placeable_object_id, no_tile, no_alt_tile)
		if cp == "Crops":
			Global.player_one_food_count -= 500
	else:
		player_two_crops_life.pop_at(idx)
		var pos = Global.player_two_stash[cp].pop_at(idx + 1)
		Global.player_two_stash[cp][0] -= 1
		set_cell(object_layer, pos, placeable_object_id, no_tile, no_alt_tile)
		if cp == "Crops":
			Global.player_two_food_count -= 500

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
	else:
		pass
	for index in range(player_two_crops_life.size() - 1, -1, -1):
		player_two_crops_life[index] -= 1
		if player_two_crops_life[index] == 0:
			to_remove.append(index)
	if !to_remove.is_empty():
		for index in to_remove:
			remove_stash_obj("Crops", "Player Two", index)
		to_remove.clear()
	else:
		pass

# This function is called at the end of a game round.
func end_of_round():
	pass

# Handle player movement inputs and update their positions on the tilemap.
func _unhandled_input(event):
	if event.is_action_pressed("Switch Player Interaction Mode"):
		if interaction_mode == 0:
			interaction_mode = 1
			po_cfm_dialog.position = Vector2i(1453, 944)
			print("Interaction mode switched: Player Two can now use mouse controls.")
		else:
			interaction_mode = 0
			po_cfm_dialog.position = Vector2i(283, 944)
			print("Interaction mode switched: Player One can now use mouse controls.")
	elif event.is_action_pressed("Move Up (Player One)"):
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
	elif event.is_action_pressed("Move Up (Player Two)"):
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

	elif interaction_mode == 0 and (player_one_curr_pos in Global.player_one_stash["FishBoat"] || player_one_curr_pos in Global.player_one_stash["PTBoat"]):
		var player_id = Global.player_one_stash
		var boat_local = Vector2i(0,0)
		var name_of_obj = ""
		if player_one_curr_pos in Global.player_one_stash["FishBoat"]:
			name_of_obj = "FishBoat"
			boat_local = Global.player_one_stash["FishBoat"].find(player_one_curr_pos)
		elif player_one_curr_pos in Global.player_one_stash["PTBoat"]:
			name_of_obj = "PTBoat"
			boat_local = Global.player_one_stash["PTBoat"].find(player_one_curr_pos)
		
		if sailing_mode == true:
			print("\nNAME OF OBJECT:", name_of_obj)
			var boat = player_one_curr_pos
			if event.is_action_pressed("Move Up (Boat)"):
				var new_boat = Vector2i(player_one_curr_pos[0], player_one_curr_pos[1] - 1)
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Left (Boat)"):
				var new_boat = Vector2i(player_one_curr_pos[0] - 1, player_one_curr_pos[1])
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Down (Boat)"):
				var new_boat = Vector2i(player_one_curr_pos[0], player_one_curr_pos[1] + 1)
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Right (Boat)"):
				var new_boat = Vector2i(player_one_curr_pos[0] + 1, player_one_curr_pos[1])
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event is InputEventMouseButton:
				if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
					var pos_clicked = local_to_map(to_local(event.position))
					if interaction_mode == 0:
						if pos_clicked != player_one_curr_pos:
							player_one_mov(pos_clicked)
						else:
							pass
					else:
						if pos_clicked != player_two_curr_pos:
							player_two_mov(pos_clicked)
						else:
							pass
				else:
					pass
		else:
			pass
			
	elif interaction_mode == 1 and (player_two_curr_pos in Global.player_two_stash["FishBoat"] || player_two_curr_pos in Global.player_two_stash["PTBoat"]):
		var player_id = Global.player_two_stash
		var boat_local = Vector2i(0,0)
		var name_of_obj = ""
		if player_two_curr_pos in Global.player_two_stash["FishBoat"]:
			name_of_obj = "FishBoat"
			boat_local = Global.player_two_stash["FishBoat"].find(player_two_curr_pos)
		elif player_two_curr_pos in Global.player_two_stash["PTBoat"]:
			name_of_obj = "PTBoat"
			boat_local = Global.player_two_stash["PTBoat"].find(player_two_curr_pos)
		
		if sailing_mode == true:
			var boat = player_two_curr_pos
			if event.is_action_pressed("Move Up (Boat)"):
				var new_boat = Vector2i(player_two_curr_pos[0], player_two_curr_pos[1] - 1)
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Left (Boat)"):
				var new_boat = Vector2i(player_two_curr_pos[0] - 1, player_two_curr_pos[1])
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Down (Boat)"):
				var new_boat = Vector2i(player_two_curr_pos[0], player_two_curr_pos[1] + 1)
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Right (Boat)"):
				var new_boat = Vector2i(player_two_curr_pos[0] + 1, player_two_curr_pos[1])
				boat_hlpr(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event is InputEventMouseButton:
				if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
					var pos_clicked = local_to_map(to_local(event.position))
					if interaction_mode == 0:
						if pos_clicked != player_one_curr_pos:
							player_one_mov(pos_clicked)
						else:
							pass
					else:
						if pos_clicked != player_two_curr_pos:
							player_two_mov(pos_clicked)
						else:
							pass
				else:
					pass
	
	elif event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
			var pos_clicked = local_to_map(to_local(event.position))
			if interaction_mode == 0:
				if pos_clicked != player_one_curr_pos:
					player_one_mov(pos_clicked)
				else:
					pass
			else:
				if pos_clicked != player_two_curr_pos:
					player_two_mov(pos_clicked)
				else:
					pass
		else:
			pass
	elif event.is_action_pressed("Add Fort (Player One)"):
		print("Player One: Place a Fort?")
		player_add_other("Fort", "Player One", fort, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Fort (Player Two)"):
		print("Player Two: Place a Fort?")
		player_add_other("Fort", "Player Two", fort, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Factory (Player One)"):
		print("Player One: Place a Factory?")
		player_add_other("Factory", "Player One", factory, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Factory (Player Two)"):
		print("Player Two: Place a Factory?")
		player_add_other("Factory", "Player Two", factory, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Acre of Crops (Player One)"):
		print("Player One: Place a Acre of Crops?")
		player_add_other("Crops", "Player One", acre_of_crops, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Acre of Crops (Player Two)"):
		print("Player Two: Place a Acre of Crops?")
		player_add_other("Crops", "Player Two", acre_of_crops, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add School (Player One)"):
		player_add_other("School", "Player One", school, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add School (Player Two)"):
		print("Player Two: Place a School?")
		player_add_other("School", "Player Two", school, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Hospital (Player One)"):
		print("Player One: Place a Hospital?")
		player_add_other("Hospital", "Player One", hospital, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Hospital (Player Two)"):
		print("Player Two: Place a Hospital?")
		player_add_other("Hospital", "Player Two", hospital, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Housing Project (Player One)"):
		print("Player One: Place a Housing Project?")
		player_add_other("Housing", "Player One", housing_project, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Housing Project (Player Two)"):
		print("Player Two: Place a Housing Project?")
		player_add_other("Housing", "Player Two", housing_project, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Rebel Soldier (Player One)"):
		print("Player One: Place a Rebel Soldier?")
		var isl_two_cells = island_two_cells
		player_add_rebel("Player One", rebel_soldier, isl_two_cells)
	elif event.is_action_pressed("Add Rebel Soldier (Player Two)"):
		print("Player Two: Place a Rebel Soldier?")
		var isl_one_cells = island_one_cells
		player_add_rebel("Player Two", rebel_soldier, isl_one_cells)
	elif event.is_action_pressed("Add PT Boat (Player One)"):
		print("Player One: Place a PT Boat?")
		player_add_other("PTBoat", "Player One", pt_boat, harbor_one, sea)
	elif event.is_action_pressed("Add PT Boat (Player Two)"):
		print("Player Two: Place a PT Boat?")
		player_add_other("PTBoat", "Player Two", pt_boat, harbor_two, sea)
	elif event.is_action_pressed("Add Fishing Boat (Player One)"):
		print("Player One: Place a Fishing Boat?")
		player_add_other("FishBoat", "Player One", fishing_boat, harbor_one, sea)
	elif event.is_action_pressed("Add Fishing Boat (Player Two)"):
		print("Player Two: Place a Fishing Boat?")
		player_add_other("FishBoat", "Player Two", fishing_boat, harbor_two, sea)
	else:
		pass

# Called when the node enters the scene tree for the first time.
func _ready():
	set_cell(cursor_one_layer, player_one_start_pos, cursor_id, player_one_cursor, no_alt_tile)
	print("Player One starting position: ", player_one_start_pos)
	player_one_tile_memory.append(player_one_start_pos)
	player_one_curr_pos = player_one_start_pos
	player_one_start_pos = []
	set_cell(cursor_two_layer, player_two_start_pos, cursor_id, player_two_cursor, no_alt_tile)
	print("Player Two starting position: ", player_two_start_pos)
	player_two_tile_memory.append(player_two_start_pos)
	player_two_curr_pos = player_two_start_pos
	player_two_start_pos = []
	for button in $SBCanvasLayer/OBCanvasLayer/OBControl.get_children():
		button.pressed.connect(func(): call("on_pressed_"+button.name))

# Called every frame. "delta" is the elapsed time since the previous frame.
func _process(_delta):
	if sb_length_of_round_timer.time_left == 0 and Global.term_of_office > 1:
		sub_crops_life()
	else:
		pass
	if Global.end_signal == 0:
		set_process_unhandled_input(false)
		Global.end_signal = 1
	else:
		pass
