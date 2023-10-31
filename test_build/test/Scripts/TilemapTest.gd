# GdUnit generated TestSuite
class_name TilemapTest
extends GdUnitTestSuite
@warning_ignore('unused_parameter')
@warning_ignore('return_value_discarded')

# TestSuite generated from
const __source = 'res://Scripts/Tilemap.gd'


func test_check_for_alt_tile() -> void:
	var tilemap = preload(__source).new()
	assert_that(tilemap.check_for_alt_tile(Vector2i(1,1))).is_equal(false)
	tilemap.free()
