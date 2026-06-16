
import widgetsDoc from './docs/widgets_documentation.md?raw';

export type ConfigItemType = 'text' | 'boolean' | 'color' | 'section' | 'array' | 'json';

// Server-side schema management
let serverSchemas: { [fileName: string]: any } | null = null;
let schemasLoaded = false;

export const loadServerSchemas = async (): Promise<{ [fileName: string]: any }> => {
    if (schemasLoaded && serverSchemas) return serverSchemas;

    try {
        const response = await fetch('/api/schemas', {
            headers: {
                'Cache-Control': 'no-cache'
            }
        });
        
        if (response.ok) {
            const { schemas } = await response.json();
            serverSchemas = schemas;
            schemasLoaded = true;
            console.log('Loaded schemas from server:', Object.keys(schemas));
            return schemas;
        }
    } catch (error) {
        console.error('Failed to load schemas from server:', error);
    }
    
    serverSchemas = {};
    schemasLoaded = true;
    return serverSchemas;
};

export const getSchemas = () => {
    if (!schemasLoaded) {
        console.warn('Schemas not loaded yet! Call loadServerSchemas() first.');
    }
    return serverSchemas || {};
};

export interface ConfigItemDefinition {
    key: string;
    label: string;
    type: ConfigItemType;
    value?: any; // Initial/Default value from the JSON
    children?: ConfigItemDefinition[];
    description?: string;
    isRoot?: boolean;
}

export interface ConfigFileDefinition {
    fileName: string;
    items: ConfigItemDefinition[];
    documentation?: string;
    defaultValue: any; // The whole file content
}

const keyDescriptions: Record<string, string> = {
    // Navigation
    navPosition: 'The position of the main navigation bar (e.g., top, bottom, drawer).',
    startDestination: 'The default page to load when the app starts.',
    style: 'The visual style variant of the component.',
    swipeToChangePage: 'Allows the user to swipe left or right to switch between pages.',
    drawerPosition: 'If using a drawer, specifies whether it slides from the left or right.',
    maxItems: 'The maximum number of items to display. The excess items will be displayed in \'More\' section.',
    topRadius: 'The border radius applied to the top corners.',
    bottomRadius: 'The border radius applied to the bottom corners.',
    margin: 'The external spacing or margin applied around the navigation dock.',
    showLabels: 'Determine whether to show text labels alongside icons.',
    routes: 'List of navigation routes available in the application.',
    name: 'The display name or label for this item.',
    icon: 'Icon identifier used to visually represent this item. Currently supports a few icons like Home, Search, Movies, Favorites, Profile, Maps, Music, Videos, Games, News, Flighttakeoff. For Custom icon supply an URL.',
    page: 'The linked page for this navigation route or action.',

    // Predefined Widgets
    bannerCarousel: 'A layout type that auto scrolls horizontally to display items.',
    horizontal_list: 'A layout type that scrolls horizontally to display items.',
    vertical_list: 'A layout type that scrolls vertically to display items.',
    grid: 'A layout type that displays items in rows and columns.',
    mediaList: 'A specialized list for displaying media content.',
    header: 'A top-level header component, usually containing titles or navigation.',
    flightStatus: 'A widget displaying real-time flight status and information.',
    dpad: 'A directional pad interface for navigation.',
    seatPairing: 'A widget for selecting and pairing seats.',
    mediaCard: 'A card layout specifically designed for displaying a media item.',
    weatherWidget: 'A widget displaying current weather information.',
    shimmer: 'A loading placeholder animation indicating content is being fetched.',
    paperFoldLoader: 'A stylized loading animation resembling paper folding.',
    connectivity: 'A widget displaying the current network connectivity status.',
    myList: 'A user-specific list, often used for saved or favorite items.',
    searchScreen: 'A full-screen component or widget for search functionality.',
    profile: 'A widget displaying user profile information and settings.',
    webview: 'A container to display embedded web content.',

    // Widgets and general properties
    widgets: 'A list of child widgets contained within this layout or component.',
    type: 'The specific type or subtype of the widget.',
    parent: 'The parent widget or layout this widget belongs to.',
    title: 'The primary headline or title text.',
    subTitle: 'The secondary text or description below the title.',
    image: 'URL or path to an image resource.',
    action: 'The action or event triggered by interacting with this item.',
    id: 'A unique identifier for this item.',
    enabled: 'Whether this item is currently active or visible.',
    visible: 'Controls the display visibility of this element.',
    targetValue: 'The goal or maximum value for a progress indicator or chart.',
    currentValue: 'The current progress or metric value.',
    url: 'The web address or deep link to navigate to.',
    width: 'The width of the component or image.',
    height: 'The height of the component or image.',
    aspectRatio: 'The ratio of width to height for an image or container.',
    itemType: 'The structural type of item (e.g., list item, grid item, banner).',
    layoutType: 'The specific style of layout used to display child content.',
    showFavorite: 'Toggle visibility of the favorite button.',
    showTitle: 'Toggle visibility of the main title.',
    showGenre: 'Toggle visibility of the genre label.',
    showDescription: 'Toggle visibility of the description text.',
    showProgressBar: 'Toggle visibility of the progress bar.',
    favoriteIcon: 'The icon used to represent the favorite action (e.g., favorite or bookmark).',
    animationType: 'The type of transition animation to apply.',
    slideFrom: 'The direction to slide from (top or bottom). Valid only when animationType is slideInVertically.',
    indicatorStyle: 'The style of the indicator used to display the current slide or item.',

    // Theme Colors
    colors: 'Light theme color palette definitions.',
    darkColors: 'Dark theme color palette definitions.',
    primary: 'Main brand color used for primary actions and highlights.',
    onPrimary: 'Color used for text/icons displayed on top of the primary color.',
    secondary: 'Secondary brand color used for less prominent accents.',
    onSecondary: 'Color used for text/icons displayed on top of the secondary color.',
    background: 'The default background color for the application.',
    onBackground: 'Color used for text/icons displayed on the main background.',
    surface: 'Background color for cards, dialogs, and elevated surfaces.',
    onSurface: 'Color used for text/icons displayed on top of surfaces.',
    onSurfaceVariant: 'A secondary, muted color for text/icons on surfaces.',
    error: 'Color used to indicate errors or warnings.',
    onError: 'Color for text/icons on error backgrounds.',
    text_primary: 'Default high-emphasis color for heading and body text.',
    text_secondary: 'Medium-emphasis color for secondary text and descriptions.',

    // Theme Typo
    fonts: 'Typography configuration defining the font families used.',
    heading: 'The font family designated for large titles and headings.',
    body: 'The default font family for regular body text and paragraphs.',
    caption: 'The font family used for small captions and overlines.',

    // Theme Other
    spacing: 'Global spacing and padding/margin presets.',
    small: 'A small spacing value.',
    medium: 'A medium or standard spacing value.',
    large: 'A large or expansive spacing value.',
    buttons: 'Configuration for button styling and variants.',
    shape: 'The shape style of the component (e.g., rounded, pill, square).',
    cornerRadius: 'The border radius defining how rounded the corners are.',
    variants: 'Defines variations of a single component style.',
    success: 'Color associated with successful actions or states.',
    warning: 'Color associated with caution or warning states.',
    backgroundColor: 'The primary background fill color.',
    borderWidth: 'The thickness of the border stroke.',
    version: 'The configuration version number.',

    // Config
    footerWidget: 'The widget displayed in the footer area.',
    headerWidget: 'The widget displayed in the header area.',
    defaultLanguage: 'The default language of the application.',
    loaderWidget: 'The widget displayed in the loader area.',
    errorWidget: 'The widget displayed in the error area.'
};

export const parseJsonToDefinition = (json: any, key: string, fileName?: string): ConfigItemDefinition => {
    const label = key;

    let description = keyDescriptions[key] || undefined;
    if (key === 'backgroundImage') {
        if (fileName === 'config.json') {
            description = 'The global background image for the application.';
        } else if (fileName === 'navigation.json') {
            description = 'The background image for the navigation dock. Only applicable for top and bottom dock and NOT for drawer.';
        }
    } else if (key === 'error') {
        if (fileName === 'widgets.json') {
            description = 'A widget to display error messages or fallback states.';
        }
    }

    const booleanKeys = ['showFavorite', 'showTitle', 'showGenre', 'showDescription', 'showProgressBar'];
    const isForcedBoolean = booleanKeys.includes(key);

    if (json === null || json === undefined) {
        if (isForcedBoolean) {
            return { key, label, type: 'boolean', value: false, description };
        }
        return { key, label, type: 'text', value: '', description };
    }

    if (typeof json === 'boolean' || isForcedBoolean) {
        let val = json;
        if (typeof json === 'string') {
            val = json.toLowerCase() === 'true';
        } else if (typeof json === 'number') {
            val = json !== 0;
        }
        return { key, label, type: 'boolean', value: Boolean(val), description };
    }

    if (typeof json === 'string') {
        if (json.startsWith('#') && (json.length === 4 || json.length === 7 || json.length === 9)) {
            return { key, label, type: 'color', value: json, description };
        }
        return { key, label, type: 'text', value: json, description };
    }

    if (typeof json === 'number') {
        return { key, label, type: 'text', value: json, description };
    }

    if (Array.isArray(json)) {
        const children = json.map((item, index) => parseJsonToDefinition(item, `${index}`, fileName));
        return { key, label, type: 'array', value: json, children, description };
    }

    if (typeof json === 'object') {
        const children = Object.keys(json).map(k => parseJsonToDefinition(json[k], k, fileName));
        return { key, label, type: 'section', value: json, children, description };
    }

    return { key, label, type: 'text', value: String(json), description };
};

const generateItemsFromObject = (obj: any, fileName: string): ConfigItemDefinition[] => {
    return Object.keys(obj).map(key => parseJsonToDefinition(obj[key], key, fileName));
}

const generateDefinitions = (serverSchemas?: { [fileName: string]: any }): ConfigFileDefinition[] => {
    const schemas = serverSchemas || {};
    
    // Helper to get schema with fallback
    const getSchema = (fileName: string) => {
        if (schemas[fileName]) {
            return schemas[fileName];
        }
        console.warn(`No schema found for ${fileName}, using empty object`);
        return {};
    };

    const configFiles = ['widgets.json', 'theme.json', 'navigation.json', 'pages.json', 'config.json'];
    
    return configFiles
        .filter(fileName => schemas[fileName])
        .map(fileName => {
            const schema = getSchema(fileName);
            let documentation: string | undefined;
            
            if (fileName === 'widgets.json') {
                documentation = widgetsDoc;
            }
            
            return {
                fileName,
                items: generateItemsFromObject(schema, fileName),
                documentation,
                defaultValue: schema
            };
        });
};

export let definitions: ConfigFileDefinition[] = [];

// Ensure schemas are loaded before accessing definitions
export const ensureSchemasLoaded = async () => {
    if (definitions.length === 0) {
        console.log('Loading server schemas...');
        const schemas = await loadServerSchemas();
        console.log('Server schemas keys:', Object.keys(schemas));
        
        if (!schemas || Object.keys(schemas).length === 0) {
            console.warn('No schemas returned from server!');
        }
        
        definitions = generateDefinitions(schemas);
        console.log('Generated definitions from server schemas:', definitions.length);
        console.log('Definition fileNames:', definitions.map(d => d.fileName));
    }
};
