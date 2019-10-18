# dep-copy-file
copy file or directory for Node.js

## Install

With npm do:

`npm install dep-copy-file --save`

## Example

```javascript
const copy = require('dep-copy-file');

const source = './source';
const dest = './dest';

copy(source,dest).then(()=>{
    //dosomething...
})
.catch(()=>{
    //dosomething...
});
```

## API

* copyDep(source,dest);
