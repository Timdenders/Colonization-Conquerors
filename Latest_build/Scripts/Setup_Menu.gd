extends Control

@onready var sm_label_2: Label = $SMMarginContainer3/SMVBoxContainer3/SMLabel2
@onready var sm_input_1: LineEdit = $SMMarginContainer2/SMVBoxContainer2/SMInput1
@onready var sm_input_2: LineEdit = $SMMarginContainer4/SMVBoxContainer4/SMInput2

# Function to handle the submission of text in sm_input_1.
func text_submit_1(input):
	Global.term_of_office = int(input)
	# Accept input only if it falls within the range of 1 to 50.
	if Global.term_of_office >= 1 && Global.term_of_office <= 50:
		sm_label_2.visible = true
		sm_input_2.visible = true
		sm_input_2.grab_focus()
	else:
		print("The 'Term of office' value must fall within the range of 1 to 50!")

# Function to handle the submission of text in sm_input_2.
func text_submit_2(input):
	Global.length_of_round = int(input)
	# Accept input only if it falls within the range of 10 to 120.
	if Global.length_of_round >= 10 && Global.length_of_round <= 120:
		get_tree().change_scene_to_file("res://Interface/World.tscn") # Start game!
	else:
		print("The 'Length of office' value must fall within the range of 30 to 120!")

# Called when the node enters the scene tree for the first time.
func _ready():
	await get_tree().create_timer(1.0).timeout
	sm_input_1.grab_focus()
	sm_input_1.connect("text_submitted", text_submit_1)
	sm_input_2.connect("text_submitted", text_submit_2)
