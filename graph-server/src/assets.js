const fs = require('fs');
const path = require('path');


const STYLES_PATH = path.join(__dirname, '../../../assets/graph.css');
const SCRIPT_PATH = path.join(__dirname, '../../../assets/bundle.js');


module.exports = {
    styles: fs.readFileSync(STYLES_PATH, 'utf8'),
    script: fs.readFileSync(SCRIPT_PATH, 'utf8')
};
