
const fs = require('fs');
const yaml = require('js-yaml');

class YamlParser {
  parse(file) {
    const data = fs.readFileSync(file, 'utf8');
    return yaml.safeLoad(data);
  }
}

// export singleton
const singleton = new YamlParser();
singleton.YamlParser = YamlParser;
module.exports = singleton;
