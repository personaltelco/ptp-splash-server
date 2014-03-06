ptp-splash-server aka static server
===================================

Benjamin Foote  
2014-02-21  
ben@bnf.net  

The [PTP Splash page](https://github.com/personaltelco/ptp-splash-page) is backed by some static files from a server

The static files (mostly javascript) are built from js in the src directory using nodejs.

## install

depends on a recent nodejs and npm

first, clone the repo

````bash
    git clone git@github.com:personaltelco/ptp-splash-server.git
    cd ptp-splash-server
````

then run 
    
````bash
    npm install
````

## building the js and css that gets delivered to the browser

before you do anything

````bash
    cp ./config/config.js.example ./config/config.js
````
The config.js file as provided in the example uses a handoff of configuration via a hash named `pageConf` which is set in the browser
(see [ptp-splash-page](https://github.com/personaltelco/ptp-splash-page)).  You probably don't need to change it at all.

then call

````bash
    make
````

## editing the js and dynamic html that gets delivered to the browser

If you're looking to make edits to some of the splashpage sections
that get loaded you'll want to edit the [dustjs](http://linkedin.github.io/dustjs/) (handlebars style)
templates in ./src/dust and then run

````bash
    make
````

Which will call `grunt`, a nodejs build tool.  grunt is configured by Gruntfile.js
to exec build commands including `dustc` (dust compiler) to turn those templates into
javascript.  `uglify` and `cssmin` is then called to each combine and minify all the 
javascript and css respectively (as configured in Gruntfile.js) and spits out
 
``````
    ./htdocs/js/ptp-splash-server.min.js
    ./htdocs/css/ptp-splash-server.min.css
``````

which is what gets called by the HTML in the browser (served from the router) which resides in the repo [ptp-splash-page](https://github.com/personaltelco/ptp-splash-page)

