# SDUI Configuration Guide

This document provides a comprehensive overview of the JSON files used for Server-Driven UI (SDUI) in this application. These files allow for dynamic updates to the app's UI from the server without requiring an application update.

## The Configuration-Driven Approach

The application employs a configuration-driven approach to building its user interface. This strategy relies on a set of JSON files that collectively define the entire user experience—from navigation and screen layouts to individual component styles and application-wide themes.

The process begins with the `config.json` file, which contains global settings and can point to a remote server for fetching the other configuration files. The `ConfigManager` class is responsible for loading and processing these files.

Here's how they interact:

1.  **`navigation.json`**: Defines the primary navigation structure, such as a bottom navigation bar, and lists the available navigation routes.
2.  **`layouts.json`**: Each route in the navigation file maps to a specific layout defined in this file. A layout is essentially a blueprint for a screen, specifying which components to display.
3.  **`components.json`**: This file acts as a library of all available UI components. It details their structure, default properties, and supported variations. Layouts are constructed by referencing components from this library.
4.  **`theme.json`**: Provides a centralized set of design tokens, including colors, fonts, and spacing, that are applied across all components to ensure a consistent look and feel.

By externalizing the UI definition in this manner, the application's appearance and structure can be updated remotely without requiring a new app release.

## The ConfigManager: Local and Remote Configuration

The `ConfigManager` is a singleton class responsible for loading, processing, and caching the application's configuration. It provides a robust mechanism for handling both local (bundled with the app) and remote (fetched from a server) configuration files.

### Initialization

The `ConfigManager` instance can be obtained in two ways, depending on whether the host application uses Hilt for dependency injection.

#### With Hilt (Recommended)

The `ConfigManager` is an injectable singleton. Its lifecycle is tied to the application, and it's typically injected into a ViewModel, as shown below:

```kotlin
@HiltViewModel
class MainViewModel @Inject constructor(
    private val configManager: ConfigManager
) : ViewModel() {

    init {
        loadConfig()
    }

    private fun loadConfig() {
        viewModelScope.launch {
            // ...
            _config.value = configManager.getConfig() // pass an optional baseUrl
            // ...
        }
    }
}
```

In the `MainViewModel`, `configManager.getConfig()` is called to trigger the loading process. The ViewModel then exposes the loaded configuration to the UI.

#### Manual Instantiation (Without Hilt)

If the host application does not use Hilt, `ConfigManager` can be instantiated manually. Since it's designed to be a singleton, the host application is responsible for creating and managing a single instance throughout its lifecycle. A common pattern is to manage this in the `Application` class.

**Example:**

```kotlin
// In your custom Application class
class YourApp : Application() {

    companion object {
        lateinit var configManager: ConfigManager
            private set
    }

    override fun onCreate() {
        super.onCreate()

        // Manually create the dependencies
        val gson = Gson()
        val okHttpClient = OkHttpClient()

        // Create the singleton instance
        configManager = ConfigManager(applicationContext, gson, okHttpClient)
    }
}
```
You can then access the instance from anywhere in the app via `YourApp.configManager`.

### Overriding the Local Configuration

The primary strength of this SDUI module is the ability for a host application (e.g., an airline-specific app) to provide a completely new configuration from a remote server, overriding the local files bundled in `res/raw`.

#### Expected Files

To override the configuration, the host must provide a complete set of the following JSON files on a remote server:

*   `config.json`
*   `components.json`
*   `layouts.json`
*   `navigation.json`
*   `theme.json`

All five files must be present at the same base URL path.

#### Example Scenario: Airline Customization

Imagine "AirlineX" wants to customize the UI. They would host their own set of JSON configuration files on a content delivery network (CDN).

**Remote File Structure:**

```
https://cdn.airlinex.com/sdui-config/
├── config.json
├── components.json
├── layouts.json
├── navigation.json
└── theme.json
```

To make the module use this configuration, the AirlineX host app would launch the `MainActivity` and pass the base URL as an extra in the `Intent`:

```kotlin
val intent = Intent(context, MainActivity::class.java).apply {
    putExtra("config_url", "https://cdn.airlinex.com/sdui-config/")
}
startActivity(intent)
```

#### High-Level Flow

1.  **Launch**: The host app launches `MainActivity` with the `config_url` in the intent extras.
2.  **URL Extraction**: `MainActivity` retrieves the `config_url` from the intent.
3.  **Config Loading**: It calls `configManager.getConfig(configUrl)`.
4.  **Remote Fetch**: The `ConfigManager` sees the provided URL and attempts to download `config.json`, `components.json`, etc., from that base URL.
5.  **Success**: If all files are fetched successfully, `ConfigManager` parses, processes (including component inheritance), and caches the remote configuration. The UI is then built using AirlineX's custom configuration.
6.  **Failure (Fallback)**: If the remote fetch fails (e.g., no network, server error, missing file), `ConfigManager` logs the error and automatically falls back to loading the default configuration from the `res/raw` directory. This ensures the UI is always rendered, providing a reliable offline or default experience.

### Component Resolution and Caching

Once the JSON files are loaded (either remotely or locally), `ConfigManager` processes them:

1.  **Component Inheritance:** It resolves the `parent`-child relationships within `components.json`. All properties from a parent component are merged into its children, with the child's properties taking precedence. This creates a final, flattened map of fully configured components.
2.  **Caching:** The processed configuration (including layouts, resolved components, navigation, and theme) is stored in a `LoadedConfig` object and cached in memory. All subsequent requests for the configuration will receive this cached instance, ensuring optimal performance by avoiding repeated file parsing and network requests.

## `components.json`

The `components.json` file is a core part of the SDUI framework. It contains a dictionary of all the available UI components that can be rendered on a screen. Each entry in the JSON file defines a component's properties, such as its `type`, styling, and behavior.

### Component Inheritance

Components can inherit properties from a `parent` component. This allows for creating reusable base components and specializing them for specific use cases. When a component has a `parent` attribute, it inherits all the properties of the parent component. The child component can then override any of the inherited properties or add new ones.

**Example:**

```json
"flightStatus": {
  "type": "flightStatus",
  "cornerRadius": 0
},
"flightStatusRounded": {
  "parent": "flightStatus",
  "cornerRadius": 10
}
```

In this example, `flightStatusRounded` inherits from `flightStatus` and overrides the `cornerRadius` to be `10` instead of `0`.

## `navigation.json`

The `navigation.json` file defines the navigation structure of the application. It specifies the type of navigation (e.g., bottom navigation bar), the initial screen, and the different routes or destinations in the app. Each route is associated with a layout from `layouts.json`.

### `navigation.json` Properties

*   **`type`**: The type of navigation, e.g., "bottom" for a bottom navigation bar.
*   **`startDestination`**: The name of the route that should be displayed when the app starts.
*   **`style`**: The animation style for transitions, e.g., "animated".
*   **`swipeToChangePage`**: A boolean (`true` or `false`) to enable or disable swiping between pages.
*   **`drawerPosition`**: The position of the navigation drawer, e.g., "left".
*   **`maxItems`**: The maximum number of items to display in the navigation bar.
*   **`topRadius`**, **`bottomRadius`**, **`margin`**: Styling properties for the navigation bar.

### Routes

The `routes` array defines the individual navigation destinations.

*   **`name`**: The name of the route, used for navigation.
*   **`icon`**: The name of the icon to display for the route.
*   **`layout`**: The layout from `layouts.json` that should be rendered for this route.

## `layouts.json`

The `layouts.json` file defines the layout for each screen in the application. Each layout is a dictionary where the key is the name of the layout (e.g., `homeLayout`), and the value is an object containing a `components` array. This array lists the components from `components.json` that will be rendered on the screen.

**Example:**

```json
"homeLayout": {
  "components": [
    "topFeatureMovies",
    "myList",
    "trendingNow"
  ]
}
```

In this example, the `homeLayout` will render the `topFeatureMovies`, `myList`, and `trendingNow` components in a vertical sequence.

## `theme.json`

The `theme.json` file defines the visual theme of the application. It allows for customizing colors, fonts, spacing, and button styles for both light and dark modes.

### Theme Properties

*   **`colors`**: Defines the color palette for the light theme.
*   **`darkColors`**: Defines the color palette for the dark theme.
*   **`fonts`**: Specifies the font families for different text styles like `heading`, `body`, and `caption`.
*   **`spacing`**: Defines the spacing values for `small`, `medium`, and `large` gaps.
*   **`buttons`**: Allows for customizing button styles. You can define primary and secondary button styles with properties like `shape`, `cornerRadius`, and `borderWidth`. You can also define variants for different button states (e.g., `success`, `warning`).
*   **`version`**: The version of the theme file.
