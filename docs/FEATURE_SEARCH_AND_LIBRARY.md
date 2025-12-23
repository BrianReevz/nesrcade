# Feature Plan: Enhanced Search & Unlimited Library

## Goal
Implement a live predictive autocomplete search using Firebase Realtime Database and remove the limitation on "My List" items to improve content discovery and library management.

## Prerequisites
1.  **Dependencies**: The frontend (`src`) requires `webrcade-app-common` to be available (fetched via `dist-clone-deps.sh`) and the `firebase` SDK to be installed in the project.
2.  **Access**: The `webrcade-app-common` library code needs to be accessible for modification or extension to remove slide limits.

## Implementation Steps

### 1. Setup & Dependencies
-   **Install Firebase**: Add `firebase` to `package.json` dependencies.
-   **Fetch Sources**: Run `dist-clone-deps.sh` to ensure `webrcade-app-common` and other libraries are present in the workspace for development.

### 2. Backend / Data Structure (Automation)
-   **Flatten Search Index**: Modify `upload-to-firebase.js` to create a secondary, flat path in Firebase (e.g., `/search_index`) containing just `title`, `id`, and minimal metadata.
    -   **Rationale**: Firebase Realtime Database querying is shallow. Searching deep nested categories (e.g., `/feed/categories/X/items/Y`) is inefficient for global search.
    -   **Proposed Structure**:
        ```json
        {
          "search_index": {
            "game_id_1": { "t": "Super Mario Bros", "c": "nes", "i": "path/to/item" },
            "game_id_2": { "t": "Sonic", "c": "genesis", "i": "path/to/item" }
          }
        }
        ```
-   **Indexing**: Update Firebase rules to ensure `title` (or `t`) is indexed for performance.

### 3. Frontend Implementation (`src/react`)

#### A. Search Component
-   **Create Component**: `src/react/components/search/index.js`
-   **UI Elements**:
    -   Input field with "Search..." placeholder.
    -   Dropdown/Popover for live results.
    -   Pill/Chip display for selected items.
-   **Logic**:
    -   Connect to Firebase using the `firebase` SDK.
    -   **On Input Change**: Query `/search_index` using `orderByChild('t').startAt(term).endAt(term + "\uf8ff").limitToFirst(10)`.
    -   **On Select**: Add the selected item to "My List" or navigate to it immediately.

#### B. Integration
-   **Add to Screen**: Integrate the `Search` component into `AppBrowseScreen` (`src/react/screens/appbrowse/index.js`).
    -   Consider placing it in the header or creating a dedicated search tab/mode (`ModeEnum`).

### 4. Remove "My List" Limitation
-   **Locate Constraint**: The limit is currently defined in `src/react/webrcade.js` as `MIN_SLIDES_LENGTH`.
-   **Modify Code**:
    -   Change `MAX_SLIDES_PER_PAGE` or remove the feed truncating logic in `webrcade-app-common` (this requires editing the cloned dependency or overriding it in the main app).
    -   **Verification**: Ensure `loadFeeds` in `feeds.js` can handle and display larger lists without performance degradation.

## Verification Plan
1.  **Search Functionality**:
    -   Type a known game name (e.g., "Mario").
    -   Verify the network request goes to Firebase.
    -   Confirm the dropdown displays matching results.
    -   Verify selecting an item adds it to the list or opens it.
2.  **My List Capacity**:
    -   Add more than 26 items to "My List".
    -   Verify all items persist and display correctly without being truncated.
3.  **Automation Script**:
    -   Run `node upload-to-firebase.js`.
    -   Check the Firebase Console to confirm `/search_index` is being populated correctly.
