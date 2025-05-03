{module.exports = {
    "extends": "airbnb",
    "installedESLint": true,
    "plugins": [
        "react"
    ],
    "rules": {
        "react/jsx-filename-extension": [2, { extensions: ['.js','.jsx'] }],
        "func-names": [0],
        "new-cap": [2, { newIsCap: true ,capIsNew: true, capIsNewExceptions: ['List', 'Map']}],
        "linebreak-style": [0],
        'arrow-body-style': 'off',
        "max-len": ["off"],
        "no-trailing-spaces": "off",
        "no-console": "off"
    },
    "env": {
        "browser": true
    }
};}