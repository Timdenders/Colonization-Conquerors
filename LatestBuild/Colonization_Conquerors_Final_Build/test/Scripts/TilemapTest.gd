# GdUnit generated TestSuite
class_name TilemapCheckAltTileTest
extends GdUnitTestSuite
@warning_ignore('unused_parameter')
@warning_ignore('return_value_discarded')

# TestSuite generated from
const __source = 'res://Scripts/Tilemap.gd'

var tilemap = preload(__source).new()

var ground_sea_layer = 0

func test_check_for_alt_tile() -> void:
	assert_that(tilemap.check_for_alt_tile(Vector2i(1,1))).is_equal(false)

func test_check_for_alt_tile_true() -> void:
	var alt_tile = tilemap.get_cell_alternative_tile(ground_sea_layer, Vector2i(-19, 13))
	assert_that(alt_tile).is_not_equal(0)
