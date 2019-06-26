# arc-rapptor
A helper for serving webpages on Lambda using [arc.codes](https://www.npmjs.com/package/@architect/architect)

## installation

```bash
npm install arc-rapptor
```

## usage

```javascript
const { config, log, aug, logRequest, reply } = require('arc-rapptor');
```

These work as follows:

### config

config will be an object containing configuration information. It will include the contents of
```@architect/shared/conf/default.json``` as well as ```conf/default.json```.  You can also specify
conditional config info in ```conf/dev.json```, ```conf/staging.json ```, ```conf/prod.json``` and arc-rapptor will include the appropriate configuration depending on what
NODE_ENV you are using. This helps development by making it easy to switch between production and development credentials. In addition you can use in-line json variables like so:
```
{
  "character": {
    "name": "garfield",
    "type": "cat",
  },
  "fullName": "{{character.name}} the {{character.title}}"
}
```

### log

```javascript
  log(['warning'], 'something is not right!')
```
  ```log``` is a logging function provided by [logr-all](https://github.com/firstandthird/logr-all) that comes with a number of plugins that can send logged info to a variety of outputs. It can be configured using ```config.log``` in your configuration. If you do not specify anything, by default logr-all will have the following settings in config:
  ```
  log: {
    initLog: false,
    unhandledRejection: true,
    uncaughtException: true
  }
  ```

## aug
[aug](https://github.com/firstandthird/aug) is an object merging and cloning function. It works similar to ```Object.assign``` except that it merges sub-objects:
```
const obj1 = {
  subobj: {
    var1: 'this comes from obj1',
    var2: 'this comes from obj1'
  },
  name: 'comes from obj1'
};
const obj2 = {
  subobj: {
    var1: 'this was overwritten by obj2 during merge'
  },
  match: 'comes from obj2'
};
const mergedObject = aug({}, obj1, obj2);
  /*
  mergedObjecdt will be:
  {
    subobj: {
      var1: 'this was overwritten by obj2 during merge',
      var2: 'this comes from obj1'
    },
    name: 'comes from obj1',
    match: 'comes from obj2'    
  }
  */
```
## logRequest
```logrequest``` is just a simple helper for logging info from the incoming HTTP request objects:
```javascript
  logRequest(request);
  /*
  will call:
    log(['request'], { message: `${request.method} ${request.path}`, path: request.path, query: request.query });
  */
```
## reply
is a useful tool for returning valid HTTP responses with the appropriate headers and body:
```javascript
return reply.html('<body> hi </body>', 201);
.
.
.
return reply.json({ error: 'This is an HTTP 500 error', reason: 'because' }, 500);
.
.
.
return reply.redirect('https://firstandthird.com', 'permanent');
```
