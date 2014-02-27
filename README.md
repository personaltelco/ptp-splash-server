ptp-splash-server
=================

Benjamin Foote
2014-02-21
ben@bnf.net

The Splash page (ptp-splash-page) is backed by some static files from a server

The static files (mostly javascript) are built from the src directory using nodejs.

## install

depends on nodejs

first, clone the repo

````bash
    git clone git@github.com:personaltelco/ptp-splash-server.git
````

then run 
    
````bash
    npm install
````

## editing the splash page content that's loaded from the server

If you're looking to make edits to some of the splashpage sections
that get loaded you'll want to edit the [dustjs](http://linkedin.github.io/dustjs/) (handlebars style)
templates in ./src/dustjs and then run

````bash
    make
````
Which will call grunt, a nodejs build tool.  grunt is configured by Gruntfile.js
to exec build commnands including 'dustc' (dust compiler) to turn those templates into
javascript.  Uglify is then called to combine and minify all the 
javascript (as configured in Gruntfile.js) and spits out
 
    ./htdocs/js/ws-ptp-splash-static.min.js

which is what gets called by the browser.

