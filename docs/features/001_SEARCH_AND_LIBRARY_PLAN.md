# Feature Plan: Enhanced Search & Unlimited Library

## Context
The goal is to implement a live, predictive autocomplete search feature powered by Firebase Realtime Database to improve game discovery. Additionally, we will remove the artificial limits on the "My List" personal library to allow users to build unrestricted collections. This aligns with the "Live Search Interface" and "Unlimited Personal Library" features outlined in the Product Brief.

## Proposed Changes

### Frontend (`src/react`)

1.  **`package.json`**
    *   **Change**: Add `firebase` (and potentially `rxfire` or similar if needed for observables) to dependencies.

2.  **`src/react/components/search/index.js` (NEW)**
    *   **Create**: A new React component `Search`.
    *   **Logic**:
        *   Render input field and results dropdown.
        *   Initialize Firebase app (if not already done globally).
        *   Listen to input changes (debounce 300ms).
        *   Execute Firebase query on `/search_index`.
        *   Render results as a list of selectable items.
        *   Handle selection: Add to "My List" or navigate to details.

3.  **`src/react/screens/appbrowse/index.js`**
    *   **Modification**: Import and render the `Search` component.
    *   **UI Update**: Place `Search` in the header or as a new mode in `ModeEnum` (e.g., `SEARCH`).
    *   **Layout**: Ensure it works responsively on mobile/desktop.

4.  **`src/react/webrcade.js`**
    *   **Modification**: Locate `MIN_SLIDES_LENGTH` and `MAX_SLIDES_PER_PAGE`.
    *   **Change**: Remove or increase constraints that limit the "My List" feed size.
    *   **Logic**: Ensure state management (`this.state.feeds`) correctly handles larger arrays without slicing/truncating.

### Automation (`feedAutomation`)

5.  **`feedAutomation/upload-to-firebase.js`**
    *   **Modification**: Update `uploadToFirebase` or create a new function `generateSearchIndex`.
    *   **Logic**:
        *   Iterate through all categories and items in `feed.json`.
        *   Construct a flat map: `search_index[itemId] = { t: title.toLowerCase(), i: itemId, ... }`.
        *   Upload this map to `/search_index` node in Firebase.

## Data Model Changes

### Firebase Realtime Database
*   **New Node**: `/search_index`
*   **Schema**:
    ```json
    {
      "search_index": {
        "<unique_game_id>": {
          "t": "game title lowercase",
          "d": "Display Title",
          "c": "category_id",
          "th": "thumbnail_url"
        }
      }
    }
    ```

## API Changes
*   **Firebase Query**:
    *   Path: `search_index`
    *   Query: `orderByChild("t").startAt(searchTerm).endAt(searchTerm + "\uf8ff").limitToFirst(10)`

## Logic/Algorithms

### Search Index Generation
1.  Load `feed.json`.
2.  Initialize `index = {}`.
3.  For each `category` in `feed`:
    *   For each `item` in `category`:
        *   Key = `item.id` (or generated unique ID).
        *   Entry = `{ t: item.title.toLowerCase(), d: item.title, ... }`.
        *   Add to `index`.
4.  Perform specific upload of `index` to `/search_index`.

### Infinite Scroll / List Handling (Frontend)
1.  Verify `Slider` component in `webrcade-app-common` (or locally if overridden) supports virtualization or pagination if the list becomes massive (e.g., > 100 items).
2.  If `webrcade-app-common` hardcodes limits, wrap `Slider` or extend it to support unlimited items.

## Verification Plan

### Automated Verification
*   **Unit Tests**: Not available for frontend UI interactions in this repo.
*   **Script Test**:
    *   Run `node feedAutomation/upload-to-firebase.js`.
    *   Script should output success message for "Search Index Upload".

### Manual Verification
1.  **Search**:
    *   Load App.
    *   Type "zelda".
    *   **Expect**: Dropdown appears with "The Legend of Zelda", "Zelda II", etc.
    *   **Expect**: Console logs show Firebase network activity.
2.  **Add to List**:
    *   Click a result.
    *   **Expect**: Item is added to "My List" (Feed).
3.  **Unlimited List**:
    *   Repeatedly add different games until count > 30.
    *   **Expect**: All 30+ items are visible in the slider/grid.
    *   **Expect**: No crash or visual glitch.
