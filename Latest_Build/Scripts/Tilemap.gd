extends TileMap

@onready var po_cfm_dialog: ConfirmationDialog = $SBCanvasLayer/POCanvasLayer/POConfirmationDialog
@onready var fw_funds_warning_1 = $SBCanvasLayer/FWCanvasLayer/FWControl/FWFundsWarning1
@onready var fw_funds_warning_2 = $SBCanvasLayer/FWCanvasLayer/FWControl/FWFundsWarning2
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
var player_one_curr_pos = []
var player_two_curr_pos = []
var player_one_pos = []
var player_two_pos = []
var player_one_tile_memory = []
var player_two_tile_memory = []
var user_one = "Player One"
var user_two = "Player Two"
var interaction_mode: int = 0
var allow_delay_1: bool = true
var allow_delay_2: bool = true
var place_obj: bool = false
var sailing_mode = true

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

func boat_move(comp, player, obj, pos, at_coords):
	if obj == pt_boat || obj == fishing_boat:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, pos)
		if atlas_coords == at_coords:
			if player == user_one:
				set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
				Global.player_one_stash[comp].append(pos)
			else:
				if player == user_two:
					set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
					Global.player_two_stash[comp].append(pos)

# Move and update Player One's position on the tilemap.
func player_one_mov():
	po_cfm_dialog.visible = false
	if check_for_alt_tile(player_one_pos):
		player_one_curr_pos = player_one_pos
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
func player_two_mov():
	po_cfm_dialog.visible = false
	if check_for_alt_tile(player_two_pos):
		player_two_curr_pos = player_two_pos
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

# This function deducts the cost of a specified object (retrieved from the "Global.obj_prices"
# dictionary) from the current amount of gold bars and returns the updated number of gold bars.
func alter_gold_bars(gold_bars, cp):
	var new_gb = gold_bars
	new_gb -= Global.obj_prices[cp]
	return new_gb

# This function is capable of showing a "funds warning" for 1.5 seconds before hiding it.
func transaction_failed(user):
	print(" Not enough funds.")
	if user == user_one:
		if allow_delay_1:
			allow_delay_1 = false
			fw_funds_warning_1.visible = true
			await get_tree().create_timer(1.5).timeout
			fw_funds_warning_1.visible = false
			allow_delay_1 = true
		else:
			pass
	else:
		if allow_delay_2:
			allow_delay_2 = false
			fw_funds_warning_2.visible = true
			await get_tree().create_timer(1.5).timeout
			fw_funds_warning_2.visible = false
			allow_delay_2 = true
		else:
			pass

# A helper function for "player_add_other".
func player_add_other_hlpr(source_id, comp, player, obj, pos):
	if check_for_alt_tile(pos):
		if player == user_one:
			if Global.player_one_gold_bars >= Global.obj_prices[comp]:
				var p1_new_gb = alter_gold_bars(Global.player_one_gold_bars, comp)
				Global.player_one_gold_bars = p1_new_gb
				set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
				if comp == "Crops":
					Global.player_one_food_count += 500
				else:
					pass
				Global.player_one_stash[comp][0] += 1
				Global.player_one_stash[comp].append(pos)
				print(" The object is placed at position: ", pos)
			else:
				transaction_failed(player)
		else:
			if Global.player_two_gold_bars >= Global.obj_prices[comp]:
				var p2_new_gb = alter_gold_bars(Global.player_two_gold_bars, comp)
				Global.player_two_gold_bars = p2_new_gb
				set_cell(object_layer, pos, placeable_object_id, obj, no_alt_tile)
				if comp == "Crops":
					Global.player_two_food_count += 500
				else:
					pass
				Global.player_two_stash[comp][0] += 1
				Global.player_two_stash[comp].append(pos)
				print(" The object is placed at position: ", pos)
			else:
				transaction_failed(player)
	else:
		print(" An object already occupies position: ", pos)

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
	var cp = "Rebel"
	if player == user_one:
		if Global.player_one_gold_bars >= Global.obj_prices[cp]:
			player_add_rebel_hlpr(island_cells)
			if island_cells.size() == 0:
				print(" There is no more room for Rebel Soldiers on opponent's island!")
			else:
				var island_cell = island_cells[randi() % island_cells.size()]
				var p1_new_gb = alter_gold_bars(Global.player_one_gold_bars, cp)
				Global.player_one_gold_bars = p1_new_gb
				set_cell(object_layer, island_cell, placeable_object_id, obj, no_alt_tile)
				Global.player_one_stash[cp][0] += 1
				Global.player_one_stash[cp].append(island_cell)
				print(" The object is placed at position: ", island_cell)
		else:
			transaction_failed(player)
	else:
		if Global.player_two_gold_bars >= Global.obj_prices[cp]:
			player_add_rebel_hlpr(island_cells)
			if island_cells.size() == 0:
				print(" There is no more room for Rebel Soldiers on opponent's island!")
			else:
				var island_cell = island_cells[randi() % island_cells.size()]
				var p2_new_gb = alter_gold_bars(Global.player_two_gold_bars, cp)
				Global.player_two_gold_bars = p2_new_gb
				set_cell(object_layer, island_cell, placeable_object_id, obj, no_alt_tile)
				Global.player_two_stash[cp][0] += 1
				Global.player_two_stash[cp].append(island_cell)
				print(" The object is placed at position: ", island_cell)
		else:
			transaction_failed(player)

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
	var comp = "Fort"
	var obj = fort
	if interaction_mode == 0:
		print("Player One: Place a Fort?")
		on_pressed_other_hlpr(comp, user_one, obj, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Fort?")
		on_pressed_other_hlpr(comp, user_two, obj, player_two_curr_pos, island_two)

# Handles the action of placing a "Factory" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFactoryButton():
	var comp = "Factory"
	var obj = factory
	if interaction_mode == 0:
		print("Player One: Place a Factory?")
		on_pressed_other_hlpr(comp, user_one, obj, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Factory?")
		on_pressed_other_hlpr(comp, user_two, obj, player_two_curr_pos, island_two)

# Handles the action of placing a "Acre of Crops" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBAOCButton():
	var comp = "Crops"
	var obj = acre_of_crops
	if interaction_mode == 0:
		print("Player One: Place a Acre of Crops?")
		on_pressed_other_hlpr(comp, user_one, obj, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Acre of Crops?")
		on_pressed_other_hlpr(comp, user_two, obj, player_two_curr_pos, island_two)

# Handles the action of placing a "School" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode. 
func on_pressed_OBSchoolButton():
	var comp = "School"
	var obj = school
	if interaction_mode == 0:
		print("Player One: Place a School?")
		on_pressed_other_hlpr(comp, user_one, obj, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a School?")
		on_pressed_other_hlpr(comp, user_two, obj, player_two_curr_pos, island_two)

# Handles the action of placing a "Hospital" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBHospitalButton():
	var comp = "Hospital"
	var obj = hospital
	if interaction_mode == 0:
		print("Player One: Place a Hospital?")
		on_pressed_other_hlpr(comp, user_one, obj, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Hospital?")
		on_pressed_other_hlpr(comp, user_two, obj, player_two_curr_pos, island_two)

# Handles the action of placing a "Housing Project" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBHousingButton():
	var comp = "Housing"
	var obj = housing_project
	if interaction_mode == 0:
		print("Player One: Place a Housing Project?")
		on_pressed_other_hlpr(comp, user_one, obj, player_one_curr_pos, island_one)
	else:
		print("Player Two: Place a Housing Project?")
		on_pressed_other_hlpr(comp, user_two, obj, player_two_curr_pos, island_two)

# Handles the action of placing a "Rebel Soldier" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBRSButton():
	if interaction_mode == 0:
		print("Player One: Place a Rebel Soldier?")
		var isl_two_cells = island_two_cells
		on_pressed_rebel_hlpr(user_one, rebel_soldier, isl_two_cells)
	else:
		print("Player Two: Place a Rebel Soldier?")
		var isl_one_cells = island_one_cells
		on_pressed_rebel_hlpr(user_two, rebel_soldier, isl_one_cells)

# Handles the action of placing a "PT Boat" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBPTBoatButton():
	var comp = "PTBoat"
	var obj = pt_boat
	if interaction_mode == 0:
		print("Player One: Place a PT Boat?")
		on_pressed_other_hlpr(comp, user_one, obj, harbor_one, sea)
	else:
		print("Player Two: Place a PT Boat?")
		on_pressed_other_hlpr(comp, user_two, obj, harbor_two, sea)

# Handles the action of placing a "Fishing Boat" object on the tilemap for either Player One or
# Player Two, depending on the current interaction mode.
func on_pressed_OBFBoatButton():
	var comp = "FishBoat"
	var obj = fishing_boat
	if interaction_mode == 0:
		print("Player One: Place a Fishing Boat?")
		on_pressed_other_hlpr(comp, user_one, obj, harbor_one, sea)
	else:
		print("Player Two: Place a Fishing Boat?")
		on_pressed_other_hlpr(comp, user_two, obj, harbor_two, sea)

func boat_helper(player_id, obj_name, boat, new_boat, boat_local):
	if new_boat in Global.player_one_stash["FishBoat"] || new_boat in Global.player_one_stash["PTBoat"]:
		print("Crash risk ahead!")
	elif new_boat in Global.player_two_stash["FishBoat"] || new_boat in Global.player_two_stash["PTBoat"]:
		print("Crash risk ahead!")
		
	elif player_id == Global.player_one_stash:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_boat)
		if atlas_coords == sea and check_for_alt_tile(new_boat):
			player_one_pos = new_boat
			set_cell(object_layer, boat, -1)
			player_id[obj_name].remove_at(boat_local)
			player_one_mov()
			boat_move(obj_name, user_one, fishing_boat, new_boat, sea)
			
	elif player_id == Global.player_two_stash:
		var atlas_coords = get_cell_atlas_coords(ground_sea_layer, new_boat)
		if atlas_coords == sea and check_for_alt_tile(new_boat):
			player_two_pos = new_boat
			set_cell(object_layer, boat, -1)
			player_id[obj_name].remove_at(boat_local)
			player_two_mov()
			boat_move(obj_name, user_two, fishing_boat, new_boat, sea)
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
		player_one_pos = player_one_curr_pos
		player_one_pos = Vector2i(player_one_pos[0], player_one_pos[1] - 1)
		player_one_mov()
	elif event.is_action_pressed("Move Left (Player One)"):
		player_one_pos = player_one_curr_pos
		player_one_pos = Vector2i(player_one_pos[0] - 1, player_one_pos[1])
		player_one_mov()
	elif event.is_action_pressed("Move Down (Player One)"):
		player_one_pos = player_one_curr_pos
		player_one_pos = Vector2i(player_one_pos[0], player_one_pos[1] + 1)
		player_one_mov()
	elif event.is_action_pressed("Move Right (Player One)"):
		player_one_pos = player_one_curr_pos
		player_one_pos = Vector2i(player_one_pos[0] + 1, player_one_pos[1])
		player_one_mov()
	elif event.is_action_pressed("Move Up (Player Two)"):
		player_two_pos = player_two_curr_pos
		player_two_pos = Vector2i(player_two_pos[0], player_two_pos[1] - 1)
		player_two_mov()
	elif event.is_action_pressed("Move Left (Player Two)"):
		player_two_pos = player_two_curr_pos
		player_two_pos = Vector2i(player_two_pos[0] - 1, player_two_pos[1])
		player_two_mov()
	elif event.is_action_pressed("Move Down (Player Two)"):
		player_two_pos = player_two_curr_pos
		player_two_pos = Vector2i(player_two_pos[0], player_two_pos[1] + 1)
		player_two_mov()
	elif event.is_action_pressed("Move Right (Player Two)"):
		player_two_pos = player_two_curr_pos
		player_two_pos = Vector2i(player_two_pos[0] + 1, player_two_pos[1])
		player_two_mov()
		
	elif interaction_mode == 0 and (player_one_curr_pos in Global.player_one_stash["FishBoat"] || player_one_curr_pos in Global.player_one_stash["PTBoat"]):
		var player_id = Global.player_one_stash
		var boat_local = Vector2i(0,0)
		var name_of_obj = ""
		if player_one_curr_pos in Global.player_one_stash["FishBoat"]:
			name_of_obj = "FishBoat"
			boat_local = Global.player_one_stash["FishBoat"].find(player_one_curr_pos)
		else:
			name_of_obj = "PTBoat"
			boat_local = Global.player_one_stash["PTBoat"].find(player_one_curr_pos)
		
		if sailing_mode == true:
			var boat = player_one_curr_pos
			if event.is_action_pressed("Move Up (Boat)"):
				var new_boat = Vector2i(player_one_pos[0], player_one_pos[1] - 1)
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Left (Boat)"):
				var new_boat = Vector2i(player_one_pos[0] - 1, player_one_pos[1])
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Down (Boat)"):
				var new_boat = Vector2i(player_one_pos[0], player_one_pos[1] + 1)
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Right (Boat)"):
				var new_boat = Vector2i(player_one_pos[0] + 1, player_one_pos[1])
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event is InputEventMouseButton:
				if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
					var pos_clicked = local_to_map(to_local(event.position))
					if interaction_mode == 0:
						player_one_pos = pos_clicked
						if player_one_pos != player_one_curr_pos:
							player_one_mov()
						else:
							pass
					else:
						player_two_pos = pos_clicked
						if player_two_pos != player_two_curr_pos:
							player_two_mov()
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
		else:
			name_of_obj = "PTBoat"
			boat_local = Global.player_two_stash["PTBoat"].find(player_two_curr_pos)
		
		if sailing_mode == true:
			var boat = player_two_curr_pos
			if event.is_action_pressed("Move Up (Boat)"):
				var new_boat = Vector2i(player_two_pos[0], player_two_pos[1] - 1)
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Left (Boat)"):
				var new_boat = Vector2i(player_two_pos[0] - 1, player_two_pos[1])
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Down (Boat)"):
				var new_boat = Vector2i(player_two_pos[0], player_two_pos[1] + 1)
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event.is_action_pressed("Move Right (Boat)"):
				var new_boat = Vector2i(player_two_pos[0] + 1, player_two_pos[1])
				boat_helper(player_id, name_of_obj, boat, new_boat, boat_local)
				
			elif event is InputEventMouseButton:
				if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
					var pos_clicked = local_to_map(to_local(event.position))
					if interaction_mode == 0:
						player_one_pos = pos_clicked
						if player_one_pos != player_one_curr_pos:
							player_one_mov()
						else:
							pass
					else:
						player_two_pos = pos_clicked
						if player_two_pos != player_two_curr_pos:
							player_two_mov()
						else:
							pass
		else:
			pass
		
	elif event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.is_pressed():
			var pos_clicked = local_to_map(to_local(event.position))
			if interaction_mode == 0:
				player_one_pos = pos_clicked
				if player_one_pos != player_one_curr_pos:
					player_one_mov()
				else:
					pass
			else:
				player_two_pos = pos_clicked
				if player_two_pos != player_two_curr_pos:
					player_two_mov()
				else:
					pass
		else:
			pass
	elif event.is_action_pressed("Add Fort (Player One)"):
		var comp = "Fort"
		print("Player One: Place a Fort?")
		player_add_other(comp, user_one, fort, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Fort (Player Two)"):
		var comp = "Fort"
		print("Player Two: Place a Fort?")
		player_add_other(comp, user_two, fort, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Factory (Player One)"):
		var comp = "Factory"
		print("Player One: Place a Factory?")
		player_add_other(comp, user_one, factory, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Factory (Player Two)"):
		var comp = "Factory"
		print("Player Two: Place a Factory?")
		player_add_other(comp, user_two, factory, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Acre of Crops (Player One)"):
		var comp = "Crops"
		print("Player One: Place a Acre of Crops?")
		player_add_other(comp, user_one, acre_of_crops, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Acre of Crops (Player Two)"):
		var comp = "Crops"
		print("Player Two: Place a Acre of Crops?")
		player_add_other(comp, user_two, acre_of_crops, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add School (Player One)"):
		var comp = "School"
		player_add_other(comp, user_one, school, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add School (Player Two)"):
		var comp = "School"
		print("Player Two: Place a School?")
		player_add_other(comp, user_two, school, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Hospital (Player One)"):
		var comp = "Hospital"
		print("Player One: Place a Hospital?")
		player_add_other(comp, user_one, hospital, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Hospital (Player Two)"):
		var comp = "Hospital"
		print("Player Two: Place a Hospital?")
		player_add_other(comp, user_two, hospital, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Housing Project (Player One)"):
		var comp = "Housing"
		print("Player One: Place a Housing Project?")
		player_add_other(comp, user_one, housing_project, player_one_curr_pos, island_one)
	elif event.is_action_pressed("Add Housing Project (Player Two)"):
		var comp = "Housing"
		print("Player Two: Place a Housing Project?")
		player_add_other(comp, user_two, housing_project, player_two_curr_pos, island_two)
	elif event.is_action_pressed("Add Rebel Soldier (Player One)"):
		print("Player One: Place a Rebel Soldier?")
		var isl_two_cells = island_two_cells
		player_add_rebel(user_one, rebel_soldier, isl_two_cells)
	elif event.is_action_pressed("Add Rebel Soldier (Player Two)"):
		print("Player Two: Place a Rebel Soldier?")
		var isl_one_cells = island_one_cells
		player_add_rebel(user_two, rebel_soldier, isl_one_cells)
	elif event.is_action_pressed("Add PT Boat (Player One)"):
		var comp = "PTBoat"
		print("Player One: Place a PT Boat?")
		player_add_other(comp, user_one, pt_boat, harbor_one, sea)
	elif event.is_action_pressed("Add PT Boat (Player Two)"):
		var comp = "PTBoat"
		print("Player Two: Place a PT Boat?")
		player_add_other(comp, user_two, pt_boat, harbor_two, sea)
	elif event.is_action_pressed("Add Fishing Boat (Player One)"):
		var comp = "FishBoat"
		print("Player One: Place a Fishing Boat?")
		player_add_other(comp, user_one, fishing_boat, harbor_one, sea)
	elif event.is_action_pressed("Add Fishing Boat (Player Two)"):
		var comp = "FishBoat"
		print("Player Two: Place a Fishing Boat?")
		player_add_other(comp, user_two, fishing_boat, harbor_two, sea)
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
	if Global.end_signal == 0:
		set_process_unhandled_input(false)
		Global.end_signal = 1
	else:
		pass
