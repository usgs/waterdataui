const fs = require('fs');
const path = require('path');
const util = require('util');


// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);


const STYLES_PATH = path.join(__dirname, '../assets/graph.css');
const SCRIPT_PATH = path.join(__dirname, '../assets/bundle.js');

module.exports = async () => {
    return Promise.all([
        readFile(STYLES_PATH, {encoding: 'utf8'}),
        readFile(SCRIPT_PATH, {encoding: 'utf8'})
    ]).then(([styles, script]) => {
        return {
            styles: styles,
            script: script
        }
    });
};
