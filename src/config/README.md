
# Config

## Usage

```javascript
const config = require('relative/path/to/config');
const apiDomain = config.env.api.domain;
```

## Environments

Recognized environments
- preprod
- test
- prod

Environment properties are hierarchical. Defaulted to `preprod` and overridden with current environment.
