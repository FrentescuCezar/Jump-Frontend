/**
 * Week View Layout Constants
 */

// Row Heights
export const BASE_ROW_HEIGHT = 90 // Base height for each hour row in pixels (when events are present)
export const EMPTY_ROW_HEIGHT = 50 // Height for empty hour rows with no events (much shorter to save space)
export const BASE_EVENT_HEIGHT = 80 // Minimum height for event cards in pixels
export const HEIGHT_PER_OVERLAP = 100 // Additional height per overlapping event in pixels (increased for more vertical spacing)

// Event Positioning
export const OFFSET_PER_EVENT = 22 // Horizontal offset between overlapping events in pixels
export const EVENT_HORIZONTAL_PADDING = 8 // Left/right padding for events in pixels
export const EVENT_VERTICAL_PADDING = 2 // Top/bottom padding for events in pixels

// Header & Layout
export const WEEK_VIEW_HEADER_HEIGHT = 64 // Height of the header (time column top) in pixels
export const DAY_HEADER_HEIGHT = 56 // Height of day column headers (h-14 = 56px)
export const BASE_COLUMN_WIDTH = 160 // Base width for day columns in pixels
export const TIME_COLUMN_WIDTH = 72 // Width of the time column (w-18 = 72px)

// Z-Index Layers
export const Z_INDEX_TIME_COLUMN = 40
export const Z_INDEX_DAY_HEADER = 50
export const Z_INDEX_CURRENT_TIME = 5
export const Z_INDEX_EVENT_BASE = 10 // Base z-index for events, higher index = on top

// Time Display
export const HOURS_PER_DAY = 24
export const MINUTES_PER_HOUR = 60
export const UPDATE_TIME_INTERVAL_MS = 60000 // Update current time indicator every minute

// Event Card Styling
export const EVENT_CARD_BORDER_WIDTH = 2 // Border width in pixels
export const EVENT_CARD_ROUNDED = "rounded-2xl" // Border radius class
