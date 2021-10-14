module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    extends: [
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier",
        "plugin:jsdoc/recommended",

        // Ignored for now.
        // "plugin:security/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        createDefaultProgram: true,
        project: [
            "./tsconfig.json",
            "./packages/*/tsconfig.json",
            "./packages/chains/*/tsconfig.json",
        ],
        sourceType: "module",
    },
    plugins: [
        "eslint-plugin-react",
        "eslint-plugin-import",
        "eslint-plugin-no-null",
        "eslint-plugin-prefer-arrow",
        "eslint-plugin-jsdoc",
        "@typescript-eslint",
        "security",
        "jsdoc",
    ],
    rules: {
        "jsdoc/newline-after-description": "warn",
        "jsdoc/check-indentation": "warn",
        "no-console": [
            "warn",
            {
                allow: [
                    "error",
                    "dir",
                    "time",
                    "timeEnd",
                    "timeLog",
                    "trace",
                    "assert",
                    "clear",
                    "count",
                    "countReset",
                    "group",
                    "groupEnd",
                    "table",
                    "dirxml",
                    "warn",
                    "groupCollapsed",
                    "Console",
                    "profile",
                    "profileEnd",
                    "timeStamp",
                    "context",
                ],
            },
        ],
        "@typescript-eslint/no-shadow": [
            "warn",
            {
                hoist: "all",
            },
        ],
        "@typescript-eslint/promise-function-async": "warn",
        "spaced-comment": [
            "warn",
            "always",
            {
                markers: ["/"],
            },
        ],
        "@typescript-eslint/dot-notation": "warn",
        "no-constant-condition": ["warn", { checkLoops: false }],
        "no-empty": "warn",
        "id-blacklist": [
            "warn",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined",
        ],
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                allowTemplateLiterals: true,
            },
        ],
        "prefer-arrow/prefer-arrow-functions": "warn",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            },
        ],
        "@typescript-eslint/restrict-template-expressions": [
            "warn",
            {
                allowNumber: true,
                allowBoolean: true,
                allowAny: false,
                allowNullish: false,
            },
        ],
        "@typescript-eslint/array-type": [
            "warn",
            {
                default: "array-simple",
            },
        ],

        "jsdoc/no-types": 1,
        "jsdoc/require-param-type": 0,
        "jsdoc/require-property-type": 0,
        "jsdoc/require-returns-type": 0,
        "jsdoc/require-jsdoc": [
            "warn",
            {
                publicOnly: true,
                require: {
                    ArrowFunctionExpression: true,
                    ClassDeclaration: true,
                    ClassExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                    MethodDefinition: true,
                },
            },
        ],
        // Disabled until require-jsdoc warnings are fixed.
        "jsdoc/require-param": 0,
        "jsdoc/require-returns": 0,

        // Ignored for now:
        "import/no-extraneous-dependencies": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-call": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/unbound-method": "off",
        "@typescript-eslint/no-inferrable-types": "off",
        "@typescript-eslint/no-empty-interface": "off",

        // Implementation seems to be buggy:
        "@typescript-eslint/no-unnecessary-condition": [
            "off",
            {
                allowConstantLoopConditions: true,
            },
        ],

        "require-await": "off",
        "@typescript-eslint/require-await": "warn",

        // Often causing issues in CI.
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",

        // TSLint rules
        // "@typescript-eslint/tslint/config": [
        //     "warn",
        //     {
        //         rules: {
        //             "chai-prefer-contains-to-index-of": true,
        //             "chai-vague-errors": true,
        //             "detect-child-process": true,
        //             "informative-docs": true,
        //             "insecure-random": true,
        //             "jquery-deferred-must-complete": true,
        //             "mocha-avoid-only": true,
        //             "mocha-no-side-effect-code": true,
        //             "mocha-unneeded-done": true,
        //             "no-cookies": true,
        //             "no-delete-expression": true,
        //             "no-disable-auto-sanitization": true,
        //             "no-document-domain": true,
        //             "no-document-write": true,
        //             "no-exec-script": true,
        //             "no-function-expression": true,
        //             "no-http-string": [
        //                 true,
        //                 "http://www.example.com/?.*",
        //                 "http://localhost:?.*",
        //             ],
        //             "no-inner-html": true,
        //             "no-jquery-raw-elements": true,
        //             "no-string-based-set-immediate": true,
        //             "no-string-based-set-interval": true,
        //             "no-string-based-set-timeout": true,
        //             "no-typeof-undefined": true,
        //             "no-unnecessary-field-initialization": true,
        //             "no-unnecessary-override": true,
        //             "no-unsupported-browser-code": true,
        //             "no-useless-files": true,
        //             "no-with-statement": true,
        //             "non-literal-fs-path": true,
        //             "non-literal-require": true,
        //             "promise-must-complete": true,
        //             "react-a11y-accessible-headings": true,
        //             "react-a11y-anchors": true,
        //             "react-a11y-aria-unsupported-elements": true,
        //             "react-a11y-event-has-role": true,
        //             "react-a11y-iframes": true,
        //             "react-a11y-image-button-has-alt": true,
        //             "react-a11y-img-has-alt": true,
        //             "react-a11y-lang": true,
        //             "react-a11y-meta": true,
        //             "react-a11y-mouse-event-has-key-event": true,
        //             "react-a11y-no-onchange": true,
        //             "react-a11y-props": true,
        //             "react-a11y-proptypes": true,
        //             "react-a11y-required": true,
        //             "react-a11y-role": true,
        //             "react-a11y-role-supports-aria-props": true,
        //             "react-a11y-tabindex-no-positive": true,
        //             "react-a11y-titles": true,
        //             "react-anchor-blank-noopener": true,
        //             "react-iframe-missing-sandbox": true,
        //             "react-no-dangerous-html": true,
        //             "react-this-binding-issue": true,
        //             "react-unused-props-and-state": true,
        //             "strict-type-predicates": true,
        //             typedef: true,
        //             "underscore-consistent-invocation": true,
        //             "use-named-parameter": true,
        //             "void-zero": true,
        //         },
        //     },
        // ],
    },
};
