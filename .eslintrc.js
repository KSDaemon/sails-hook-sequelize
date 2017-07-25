module.exports = {
  "env": {
      "es6": true,
      "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
      "sourceType": "module"
  },
  "rules": {
      "indent": [
          "error",
          2
      ],
      "linebreak-style": [
          "error",
          "unix"
      ],
      "quotes": [
          "error",
          "double"
      ],
      "semi": [
          "error",
          "always"
      ],
      "dot-location": [
        "error",
        "property",
      ],
      "no-extra-parens": [
        "error",
      ],
      "curly": [
        "error",
      ],
      "eqeqeq": [
        "error",
      ],
      "dot-notation": [
        "error",
      ],
      "no-empty-function": [
        "error",
      ],
      "no-eval": [
        "error",
      ],
      "no-multi-spaces": [
        "error",
      ],
      "no-multi-str": [
        "error",
      ],
      "no-return-assign": [
        "error",
      ],
      "no-return-await": [
        "error",
      ],
      "no-self-compare": [
        "error",
      ],
      "no-throw-literal": [
        "error",
      ],
      "yoda": [
        "error",
      ],
      "vars-on-top": [
        "error",
      ],
      "prefer-promise-reject-errors": [
        "warn",
      ],
      "no-with": [
        "error",
      ],
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: ["const", "let", "var"], next: "*"},
        { blankLine: "never",    prev: ["const", "let", "var"], next: ["const", "let", "var"]},
        { blankLine: "always", prev: "import", next: "*"},
        { blankLine: "never", prev: "import", next: "import"},
      ],
      "no-delete-var": [
        "error",
      ],
      "no-undef": [
        "off",
      ],
      "no-path-concat": [
        "error",
      ],
      "no-path-concat": [
        "error",
      ],
      "no-mixed-requires": [
        "error",
      ],
      "global-require": [
        "error",
      ],
      "array-bracket-newline": [
        "error",
        {
          "multiline": true,
        },
      ],
      "array-bracket-spacing": [
        "error",
        "never",
      ],
      "func-call-spacing": [
        "error",
        "never",
      ],
      "comma-style": [
        "error",
        "first",
      ],
      "linebreak-style": [
        "error",
        "unix",
      ],
      "eol-last": [
        "error",
        "always",
      ],
      "no-multiple-empty-lines": [
        "error",
      ],
      "no-nested-ternary": [
        "error",
      ],
      "no-trailing-spaces": [
        "error",
      ],
      "one-var-declaration-per-line": [
        "error",
        "initializations",
      ],
      "space-in-parens": [
        "error",
        "never",
      ],
      "prefer-const": [
        "error",
      ],
      "space-before-function-paren": [
        "error",
        {
          "anonymous": "never",
          "named": "never",
          "asyncArrow": "always"
        },
      ],
      "comma-dangle": [
        "error",
        {
          "arrays": "always",
          "objects": "always",
          "imports": "never",
          "exports": "never",
          "functions": "never"
        }
      ],
  }
};
