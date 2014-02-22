ptp-splash-server
=================

Benjamin Foote
2014-02-21
ben@bnf.net

The Splash page (ptp-splash-page) is backed by some static files from a server

The static files (mostly javascript) are built from the src directory using nodejs.

## install

first, clone the repo

````bash
    git clone git@github.com:personaltelco/ptp-splash-server.git
````

then run 
    
````bash
    npm install
    grunt 
````

## editing the splash page content that's loaded from the server

If you're looking to make edits to some of the splashpage sections
that get loaded you'll want to edit the dustjs (handlebars style)
templates in ./src/dustjs and then run

````bash
    grunt 
````
Which will call 'dustc' (dust compiler) to turn those templates into
javascript which go into the ./src directory.  Uglify is then called 
to combine and minify all *.js in the ./src directory and a few dependencies
in src/bower_components into
 
    ./htdocs/js/ws-ptp-splash-static.min.js

which is what gets sent to the browser.

