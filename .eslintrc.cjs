module.exports = {
	env: {
		browser: true,
		es2021: true,
		node: true,
		es6: true,
	},
	plugins: ['ava', 'import'],
	extends: [
		'airbnb-base',
		'plugin:ava/recommended',
		'prettier',
		'plugin:import/recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'import/no-extraneous-dependencies': 'off',
		'consistent-return': 'off',
		camelcase: 'off',
		'ava/assertion-arguments': 'error',
		'ava/hooks-order': 'error',
		'ava/max-asserts': ['off', 5],
		'no-misleading-character-class': 'error',
		'ava/no-async-fn-without-await': 'error',
		'ava/no-duplicate-modifiers': 'error',
		'ava/no-identical-title': 'error',
		'ava/no-ignored-test-files': 'error',
		'ava/no-import-test-files': 'off', // due to placing mocks in the test folder
		'ava/no-incorrect-deep-equal': 'error',
		'ava/no-inline-assertions': 'error',
		'ava/no-nested-tests': 'error',
		'ava/no-only-test': 'error',
		'ava/no-skip-assert': 'error',
		'ava/no-skip-test': 'error',
		'ava/no-todo-implementation': 'error',
		'ava/no-todo-test': 'warn',
		'ava/no-unknown-modifiers': 'error',
		'ava/prefer-async-await': 'error',
		'ava/prefer-power-assert': 'off',
		'ava/prefer-t-regex': 'error',
		'ava/test-title': 'error',
		'ava/test-title-format': 'off',
		'ava/use-t-well': 'error',
		'ava/use-t': 'error',
		'ava/use-t-throws-async-well': 'error',
		'ava/use-test': 'error',
		'ava/use-true-false': 'error',
	},
	settings: {
		'import/resolver': {
			node: {
				extensions: ['.js', '.jsx'],
			},
			alias: {
				extensions: [
					'.js',
					'.jsx',
					'.es6',
					'.coffee',
				],
				paths: [
					'./lib/**',
					'./utils/**/',
					'./',
					'./**',
				],
				map: [
					['#db', './Database/dbindex.js'],
					['#utilBot', './utils/bot_res'],
					['#cache', './utils/cache'],
					[
						'#LogColor',
						'./utils/bot_res/consoleLog.js',
					],
					['#Logger', './utils/logging.js'],
					[
						'#FileRun',
						'./utils/bot_res/classes/FileRunning.js',
					],
					[
						'#embed',
						'./utils/bot_res/embeds/embedReply.js',
					],
					['#env', './lib/envInit.js'],
					[
						'#register',
						'./utils/db/registerUser.js',
					],
					['#utils', './utils'],
					['util', './utils'],
					[
						'#validateUser',
						'./utils/cmd_res/validateUser.js',
					],
					['#api', './utils/api'],
					['#utilDB', './utils/db'],
					['#utilBetOps', './utils/db/betOps'],
					[
						'#utilValidate',
						'./utils/db/validation',
					],
					[
						'#utilMatchups',
						'./utils/db/matchupOps',
					],
					[
						'#utilCurrency',
						'./utils/db/currency',
					],
					['#lib', './lib'],
					['#cmdUtil', './utils/cmd_res'],
					['#botUtil', './utils/bot_res'],
					[
						'#botClasses',
						'./utils/bot_res/classes',
					],
					['#config', './lib/PlutoConfig.js'],
					['#dateUtil', './utils/date'],
					['#cacheUtil', './utils/cache'],
					['#main', './Pluto.mjs'],
					[
						'#winstonLogger',
						'./utils/logging.js',
					],
					[
						'#qBuilder',
						'./utils/db/queryBuilder.js',
					],
				],
			},
		},
	},
	overrides: [
		{
			files: ['**/*.test.js', '*.js', '*.mjs'],
			rules: {
				'import/extensions': 'off',
				'import/no-unresolved': 'off',
				'import/prefer-default-export': 'off',
				'no-restricted-syntax': 'off',
				'no-use-before-define': 'off',
				'mocha/no-global-tests': 'off',
				'class-methods-use-this': 'off',
			},
		},
	],
}
