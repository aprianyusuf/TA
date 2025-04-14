import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import _import from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	_import.flatConfigs.recommended,
	{
		ignores: ["**/node_modules/", "**/dist/", "**/build/"],
	},
	...fixupConfigRules(
		compat.extends(
			"prettier",
			"eslint:recommended",
			"eslint-config-prettier",
			"plugin:react/recommended",
			"plugin:react/jsx-runtime",
			"plugin:react-hooks/recommended",
		),
	),
	{
		files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],

		plugins: {
			"react-refresh": reactRefresh,
			react: fixupPluginRules(react),
		},

		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},

			ecmaVersion: "latest",
			sourceType: "module",

			parserOptions: {
				requireConfigFile: false,

				babelOptions: {
					presets: ["@babel/preset-react"],
				},
			},
		},

		settings: {
			react: {
				version: "detect",
			},

			"import/resolver": {
				node: {
					extensions: [".js", ".jsx", ".ts", ".tsx"],
				},
			},
			"import/core-modules": ["@tanstack/react-table"],
		},

		rules: {
			"react/jsx-no-target-blank": "off",

			"no-unused-vars": [
				"warn",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],

			"react/jsx-uses-vars": "error",
			"react/jsx-uses-react": "error",
			"react/display-name": "off",
			"react/prop-types": "warn",
			"no-console": "error",
			"no-debugger": "error",
			"react/no-unknown-property": "off",
			"import/no-unresolved": "off",
			"react-hooks/rules-of-hooks": "warn",

			"sort-imports": [
				"error",
				{
					ignoreCase: true,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
					allowSeparatedGroups: false,
				},
			],

			"import/order": [
				"error",
				{
					groups: [
						["external", "builtin"],
						"internal",
						["sibling", "parent"],
						"index",
					],

					pathGroups: [
						{
							pattern: "@(react)",
							group: "external",
							position: "before",
						},
						{
							pattern: "@/**",
							group: "internal",
						},
					],

					pathGroupsExcludedImportTypes: ["internal", "react"],
					"newlines-between": "always",

					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],
		},
	},
];
