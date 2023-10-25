extends LineEdit

# Function to handle text changes in SMInput1.
func text_change(input):
	if caret_column == 2:
		var num = int(input)
		num = clamp(num, 1, 50)
		text = str(num)
		input = str(num)
		caret_column = text.length()
	var regex = RegEx.new()
	regex.compile("^[^1-9]*$")
	var result = regex.search(input)
	var cached_caret_col = caret_column
	if result:
		text = regex.sub(text, "", true)
		caret_column = cached_caret_col - 1

# Called when the node enters the scene tree for the first time.
func _ready():
	$".".connect("text_changed", text_change)
