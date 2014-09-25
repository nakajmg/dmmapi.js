"use strict"

gulp = require("gulp")
$ = require("gulp-load-plugins")()
runSequence = require("run-sequence")
browserSync = require("browser-sync")
reload = browserSync.reload
exec = require("child_process").exec
spawn = require("child_process").spawn
pj = require("./package.json")
_ = require("underscore")


# dirctory settings
src =
  coffee: "src/coffee/**/*.coffee"
  
dest =
  js: "dist/js"
  lib: "dist/js"

baseDir = "./dist"  

libOrder = ->
  _.map pj.libs, (lib) ->
    return "src/lib/#{lib.src}"


src.lib = libOrder()

# handler function
plumberWithNotify = ->
  $.plumber({errorHandler: $.notify.onError("<%= error.message %>")})


# Compile Any Other Coffee Files You Added (src/coffee)
gulp.task "coffee", ->
  gulp.src(src.coffee)
    .pipe $.cached("coffee")
    .pipe plumberWithNotify()
    .pipe $.coffee({bare: true})
    .pipe gulp.dest(dest.js)
    

gulp.task "lib", ->
  gulp.src(src.lib)
    .pipe $.concat("libs.js")
    .pipe gulp.dest(dest.lib)
    # .pipe $.uglify()
    # .pipe $.rename( extname: ".min.js")
    # .pipe gulp.dest(dest.lib)


# Watch Files For Changes & Reload
gulp.task "default", ->
  browserSync.init null,
    server:
      baseDir: [baseDir]
    notify: false
    host: "localhost"
  gulp.watch ["src/coffee/**/*.coffee"], ["coffee", reload]
  gulp.watch ["dist/*.html"], reload
