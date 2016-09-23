#include <pebble.h>

static Window *s_main_window;
static TextLayer *s_time_layer;
static TextLayer *s_nearest_article_layer;
static TextLayer *s_distance_and_direction_layer;


static void update_time() {
  // Get a tm structure
  time_t temp = time(NULL);
  struct tm *tick_time = localtime(&temp);

  // Write the current hours and minutes into a buffer
  static char s_buffer[10];
  strftime(s_buffer, sizeof(s_buffer), clock_is_24h_style() ?
                                          "%H:%M" : "%l:%M %P", tick_time);

  // Display this time on the TextLayer
  text_layer_set_text(s_time_layer, s_buffer);
}

static void tick_handler(struct tm *tick_time, TimeUnits units_changed) {
  update_time();

  // Begin dictionary
  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  // Add a key-value pair
  dict_write_uint8(iter, 0, 0);

  // Send the message!
  app_message_outbox_send();
}

//////////////////////
// Build the window //
//////////////////////
static void main_window_load(Window *window) {
  // Get information about the Window
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  // Create the TextLayer with specific bounds
  s_time_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(15, 10), bounds.size.w, 50));

  
  // Improve the layout to be more like a watchface
  text_layer_set_background_color(s_time_layer, GColorClear);
  text_layer_set_text_color(s_time_layer, GColorLiberty);
  text_layer_set_font(s_time_layer, fonts_get_system_font(FONT_KEY_BITHAM_30_BLACK));
  text_layer_set_text_alignment(s_time_layer, GTextAlignmentCenter);

  // Add it as a child layer to the Window's root layer
  layer_add_child(window_layer, text_layer_get_layer(s_time_layer));

  // Create nearest_article layer and add it
  s_nearest_article_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(65, 60), bounds.size.w, 50));
  text_layer_set_background_color(s_nearest_article_layer, GColorClear);
  text_layer_set_text_color(s_nearest_article_layer, GColorBlack);
  text_layer_set_font(s_nearest_article_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24));
  text_layer_set_text_alignment(s_nearest_article_layer, GTextAlignmentCenter);
  text_layer_set_text(s_nearest_article_layer, "...");
  layer_add_child(window_layer, text_layer_get_layer(s_nearest_article_layer));

  // Create distance_and_direction layer and add it
  s_distance_and_direction_layer = text_layer_create(
      GRect(0, PBL_IF_ROUND_ELSE(135, 130), bounds.size.w, 30));
  text_layer_set_background_color(s_distance_and_direction_layer, GColorClear);
  text_layer_set_text_color(s_distance_and_direction_layer, GColorDarkCandyAppleRed);
  text_layer_set_font(s_distance_and_direction_layer, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_text_alignment(s_distance_and_direction_layer, GTextAlignmentCenter);
  text_layer_set_text(s_distance_and_direction_layer, "");
  layer_add_child(window_layer, text_layer_get_layer(s_distance_and_direction_layer));
}

static void main_window_unload(Window *window) {
  text_layer_destroy(s_time_layer);
  text_layer_destroy(s_nearest_article_layer);
  text_layer_destroy(s_distance_and_direction_layer);
}


///////////////////////
// message callbacks //
///////////////////////
static void inbox_received_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "ohai!");
  // Store incoming information
  static char article_buffer[256];
  //static char new_buffer[8];
  static char distance_buffer[32];

  Tuple *article_tuple = dict_find(iterator, MESSAGE_KEY_ARTICLE);
  Tuple *distance_tuple = dict_find(iterator, MESSAGE_KEY_DISTANCE);

  if(article_tuple && distance_tuple) {
    snprintf(article_buffer, sizeof(article_buffer), "%s", article_tuple->value->cstring);
    text_layer_set_text(s_nearest_article_layer, article_buffer);
    snprintf(distance_buffer, sizeof(distance_buffer), "%s", distance_tuple->value->cstring);
    text_layer_set_text(s_distance_and_direction_layer, distance_buffer);
  }
  APP_LOG(APP_LOG_LEVEL_INFO, "kthxbai!");
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped!");
}

static void outbox_failed_callback(DictionaryIterator *iterator, AppMessageResult reason, void *context) {
  APP_LOG(APP_LOG_LEVEL_ERROR, "Outbox send failed!");
}

static void outbox_sent_callback(DictionaryIterator *iterator, void *context) {
  APP_LOG(APP_LOG_LEVEL_INFO, "Outbox send success!");
}

/////////////////////////////
// Main setup and teardown //
/////////////////////////////
static void init() {
  // Create main Window element and assign to pointer
  s_main_window = window_create();
  
  // Set handlers to manage the elements inside the Window
  window_set_window_handlers(s_main_window, (WindowHandlers) {
    .load = main_window_load,
    .unload = main_window_unload
  });

  // Show the Window on the watch, with animated=true
  window_stack_push(s_main_window, true);
  update_time();

  // Register with TickTimerService
  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

  // Register message callbacks
  app_message_register_inbox_received(inbox_received_callback);
  app_message_register_inbox_dropped(inbox_dropped_callback);
  app_message_register_outbox_failed(outbox_failed_callback);
  app_message_register_outbox_sent(outbox_sent_callback);

  // Open AppMessage
  const int inbox_size = 128;
  const int outbox_size = 128;
  app_message_open(inbox_size, outbox_size);
}

static void deinit() {
  // Destroy Window
  window_destroy(s_main_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}

