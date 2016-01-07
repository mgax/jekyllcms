var fs = require('fs')
var gulp = require('gulp')
var babel = require('gulp-babel')
var concat = require('gulp-concat')
var sourcemaps = require('gulp-sourcemaps')
var Handlebars = require('handlebars')
var https = require('https')
var qs = require('querystring')
var express = require('express')
var path = require('path')

var env = function(name, defaultValue) {
  var value = process.env[name]
  if(!value) {
    if(defaultValue !== undefined) { return defaultValue }
    throw(new Error("Missing " + name + " env variable"))
  }
  return value
}

gulp.task('js', function() {
  return gulp.src('src/*.jsx')
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('build'))
})

gulp.task('build', ['js'], function() {
  var template = function(name) {
    return Handlebars.compile(fs.readFileSync(name, {encoding: 'utf-8'}))
  }
  var index_html = template('src/index.html')({t: (new Date()).getTime()})
  fs.writeFileSync('build/index.html', index_html)
  fs.writeFileSync('build/style.css', fs.readFileSync('src/style.css'))
})

gulp.task('devel', ['build'], function() {
  gulp.watch('src/*.jsx', ['build'])
  server()
})

gulp.task('default', ['build'])


function authMiddleware() {
  // github oauth (code from github.com/prose/gatekeeper)

  var app = express()

  function authenticate(code, cb) {
    var data = qs.stringify({
      client_id: env('GITHUB_OAUTH_KEY'),
      client_secret: env('GITHUB_OAUTH_SECRET'),
      code: code
    })

    var reqOptions = {
      host: 'github.com',
      port: 443,
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {'content-length': data.length}
    }

    var body = ''
    var req = https.request(reqOptions, function(res) {
      res.setEncoding('utf8')
      res.on('data', function(chunk) { body += chunk; })
      res.on('end', function() {
        cb(null, qs.parse(body).access_token)
      })
    })

    req.write(data)
    req.end()
    req.on('error', function(e) { cb(e.message); })
  }

  app.get('/authenticate/:code', function(req, res) {
    console.log('authenticating code:' + req.params.code)
    authenticate(req.params.code, function(err, token) {
      var result = err || !token ? {'error': 'bad_code'} : {'token': token}
      console.log(result)
      res.json(result)
    })
  })

  return app
}


function server() {
  var app = express()
  app.use(authMiddleware())
  app.use(express.static('build'))
  app.get('/config.json', function(req, res) {
    res.json({
      "url": env('APP_URL'),
      "gatekeeper": env('APP_URL'),
      "clientId": env('GITHUB_OAUTH_KEY'),
      "dropboxKey": env('DROPBOX_KEY', ''),
    })
  })

  app.get('*', function(request, response) {
    response.sendFile(path.resolve(__dirname, 'build', 'index.html'))
  })

  var port = +env('PORT', 9999)
  app.listen(port, null, function(err) {
    console.log('Gatekeeper, at your service: http://localhost:' + port)
  })
}
