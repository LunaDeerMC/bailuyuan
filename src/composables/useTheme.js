import { computed, ref } from 'vue';

const THEME_STORAGE_KEY = 'bl-theme-mode';
const VALID_THEME_MODES = new Set(['system', 'light', 'dark']);
const THEME_META_COLORS = {
	light: '#f3f4f7',
	dark: '#0b1117',
};

const themeMode = ref('light');
const systemTheme = ref('light');

let hasInitialized = false;
let removeSystemThemeListener = null;

export const themeOptions = [
	{
		value: 'system',
		label: '跟随系统',
		shortLabel: '系统',
		iconClass: 'fa-solid fa-desktop',
	},
	{
		value: 'light',
		label: '浅色',
		shortLabel: '浅色',
		iconClass: 'fa-solid fa-sun',
	},
	{
		value: 'dark',
		label: '深色',
		shortLabel: '深色',
		iconClass: 'fa-solid fa-moon',
	},
];

const resolvedTheme = computed(() =>
	themeMode.value === 'system' ? systemTheme.value : themeMode.value
);

function normalizeThemeMode(value) {
	return VALID_THEME_MODES.has(value) ? value : 'light';
}

function getStoredThemeMode() {
	if (typeof window === 'undefined') {
		return 'light';
	}

	try {
		return normalizeThemeMode(window.localStorage.getItem(THEME_STORAGE_KEY) ?? 'light');
	} catch {
		return 'light';
	}
}

function getSystemTheme() {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return 'light';
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme() {
	if (typeof document === 'undefined') {
		return;
	}

	const currentTheme = resolvedTheme.value;
	const root = document.documentElement;
	const themeColorMeta = document.querySelector('meta[name="theme-color"]');

	root.dataset.themeMode = themeMode.value;
	root.dataset.theme = currentTheme;
	root.style.colorScheme = currentTheme;

	if (themeColorMeta) {
		themeColorMeta.setAttribute('content', THEME_META_COLORS[currentTheme]);
	}
}

function persistThemeMode(value) {
	if (typeof window === 'undefined') {
		return;
	}

	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, value);
	} catch {
		// Ignore storage failures and keep the in-memory preference.
	}
}

function ensureSystemThemeListener() {
	if (
		typeof window === 'undefined'
		|| typeof window.matchMedia !== 'function'
		|| removeSystemThemeListener
	) {
		return;
	}

	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	const handleChange = (event) => {
		systemTheme.value = event.matches ? 'dark' : 'light';
		applyTheme();
	};

	if (typeof mediaQuery.addEventListener === 'function') {
		mediaQuery.addEventListener('change', handleChange);
		removeSystemThemeListener = () => mediaQuery.removeEventListener('change', handleChange);
		return;
	}

	mediaQuery.addListener(handleChange);
	removeSystemThemeListener = () => mediaQuery.removeListener(handleChange);
}

export function initializeTheme() {
	if (typeof window === 'undefined') {
		return;
	}

	systemTheme.value = getSystemTheme();
	themeMode.value = getStoredThemeMode();
	ensureSystemThemeListener();
	applyTheme();
	hasInitialized = true;
}

export function setThemeMode(nextThemeMode) {
	themeMode.value = normalizeThemeMode(nextThemeMode);
	persistThemeMode(themeMode.value);

	if (typeof window === 'undefined') {
		return;
	}

	if (!hasInitialized) {
		systemTheme.value = getSystemTheme();
		ensureSystemThemeListener();
		hasInitialized = true;
	}

	applyTheme();
}

export function useTheme() {
	return {
		themeMode,
		resolvedTheme,
		themeOptions,
		initializeTheme,
		setThemeMode,
	};
}