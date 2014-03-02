// development convenience to be able to pass
// ?node=PotatoChampion
// for example in order to test how it looks with different nodes
var params = getParams();
if (params.node) {
    pageConf.node = params.node;
}

// FYI - serverConf is set in config/config.js

$(document).ready(
        function() {
            // change out all the PTP vars for demo
            if (params.node) {
                console.log('changing out the node info');
                $.getJSON(serverConf.apibase + '/nodes/' + pageConf.node , function(res) {
                    var keys = Object.keys(res.data);
                    // a couple special cases
                    pageConf.nodeName = res.data.nodename;
                    $('.PTP_LOGO').attr('src', serverConf.imgbase + res.data.logo);
                    
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i] !== 'logo') {
                            var cls = "PTP_" + keys[i].toUpperCase();
                            console.log('replacing',cls,'with',res.data[keys[i]]);
                            $('.' + cls).text(res.data[keys[i]]);
                        }
                    }
                });
            }
        
            async.parallel([ loadDonors, 
                             loadAboutVideo,
                             loadAboutNodes, 
                             loadMailinglist, 
                             loadNews ], 
                             finished);
        });



function loadAboutVideo(done) {
    console.log('about video');
    dust.render("about_video", {}, function(err, out) {
        if (err)
            throw err;
        $(out).appendTo("#aboutVideo");
        $('body').scrollspy('refresh');
        done();
    });
}

function loadMailinglist(cb) {
    getAndRender(serverConf.apibase + '/rss/ptp', 'rss', function(err, ret) {
        $('<h2>From the mailing list...</h2>' + ret).appendTo("#ptprss");
        cb();
    });
}

function loadDonors(cb) {
    $.getJSON(serverConf.apibase + '/donors', function(res) {
        $('#donors').append(
                '<h2 class="featurette-heading">Thank You to Our Donors</h2>');
        res.data
                .forEach(function(e) {
                    console.log('loading donors', e);
                    $('#donors').append(
                            '<strong class="donorName">' + e + '</strong>&nbsp;&nbsp;&nbsp;');
                });
        cb();
    });
}

function loadAboutNodes(done) {
    console.log('about nodes');
    $.getJSON(serverConf.apibase + '/nodes', function(res) {
        // get all the nodes that have logos
        async.filter(res.data, function(n, cb) {
            var nn = Object.keys(n)[0]; // the key is the node
            console.log('logo', n[nn].logo);
            cb((n && n[nn].logo));
        }, function(list) {
            // and then render them
            async.map(list, function(nodeinfo, next) {
                var nname = Object.keys(nodeinfo)[0];
                var obj = {
                    n : nodeinfo[nname],
                    base : serverConf.imgbase,
                    node: nname
                };
                dust.render("about_nodes", obj, function(err, rendered) {
                    // console.log(url, template);
                    next(err, rendered);
                });
            }, function(err, ret) {
                if (err)
                    throw err;
                nodeScroll(ret, done);
            });
        });
    });
}

var renderedNodes;
function nodeScroll(ret, cb) {
    renderedNodes = shuffle(ret);
    setInterval(function() {
        aboutNode();
    }, 2500);
    cb();
}

var curAboutNode = 0;
function aboutNode() {
    $('#aboutNodes').fadeOut(750, function() {
        $('#aboutNodes').html(renderedNodes[curAboutNode]);
        $('#aboutNodes').fadeIn(750);
        curAboutNode = curAboutNode + 1;
        if (curAboutNode === renderedNodes.length) {
            curAboutNode = 0;
        }
    });
}

function loadNews(done) {
    console.log('loading news');
    async.parallel([ function(cb) {
        getAndRender(serverConf.apibase + '/twitter/ptp', 'tweet', cb);
    }, function(cb) {
        getAndRender(serverConf.apibase + '/twitter/' + pageConf.node, 'tweet', cb);
    }, function(cb) {
        getAndRender(serverConf.apibase + '/rss/' + pageConf.node, 'rss', cb);
    } ], function(err, res) {
        if (!res[0] && !res[1] && !res[2]) {
            return;
        }
        dust.render("news", {
            nodeName : pageConf.nodeName
        }, function(err1, newsRender) {
            if (err1)
                throw err1;
            
            $(newsRender).insertAfter("#newsFromServer");

            var targets = ['ptptweets','nodetweets','noderss'];
            var active = [];
            for (var i = 0; i < targets.length; i++) {
                if (res[i]) {
                    active.push(targets[i]);
                    addNewsContent(res[i],targets[i]);
                }
            }
            // bootstrap grid is based on 12 boxes
            // var colClass = 'col-md-' + (12 / active.length);
            // turns out that looks like crap
            colClass = 'col-md-4';
            for (var i = 0; i < active.length; i++) {
                console.log('adding ' + colClass + ' to ' + active[i]);
                $('#' + active[i]).addClass(colClass)
            }
            addNav('news', 'News');
            done();
        });
    });
}

function addNewsContent(content, target) {
    var c = $('<div id="'+ target +'"></div>').html(content);
    $("#news").append(c);
}


function getAndRender(url, template, cb) {
    $.getJSON(url, function(res) {
        if (!res || res.type === 'error' ){
            console.log('not found: ', url);
            return cb(null, null);  // don't pass an error back because it kills async.parallel
        } else {
            async.map(res.data, function(e, next) {
                dust.render(template, e, function(err, rendered) {
                    console.log(url, template);
                    next(err, rendered);
                });
            }, function(err, ret) {
                if (err)
                    throw err;
                cb(err, ret.join(''));
            });
        }
    });
}

function addNav(target, nav) {
    $('#navs').append('<li><a href="#' + target + '">' + nav + '</a></li>');
    smoothScrolling();
    $('body').scrollspy('refresh');
}

// this function is duplicated here from the splash page
// but due to the compresssion / mangling of function names on the router
// you can't count on those function names being valid.
// we could probably get away with NOT compressing the splash page
function smoothScrolling() {
    $("a[href^='#']").on('click', function(e) {

        // prevent default anchor click behavior
        e.preventDefault();

        // store hash
        var hash = this.hash;
        var further = 0;
        if (hash == '#home' || hash == '#Carousel') {
            further = 50;
        }
        // animate
        $('html, body').animate({
            scrollTop : $(this.hash).offset().top - further
        }, 1250, function() {
            // when done, add hash to url
            // (default click behaviour)
            window.location.hash = hash;
        });

    });
}

function finished() {
    $('.ago').each(function(index, elem) {
        var time = Date.parse($(elem).attr('data-date'));
        $(elem).text(howLongAgo(time));
    });
    $('body').scrollspy('refresh');
}

function howLongAgo(time) {
    var now = new Date();
    var agoS = ((now.getTime() - time) / 1000).toFixed(0);
    if (agoS < 3) {
        return "just now";
    }
    if (agoS < 60) {
        return agoS + " seconds ago";
    }
    var agoM = (agoS / 60).toFixed(0);
    if (agoM < 2) {
        return "a minute ago";
    }
    if (agoM < 61) {
        return agoM + " minutes ago";
    }

    var agoH = (agoM / 60).toFixed(0);
    if (agoH < 2) {
        return "an hour ago";
    }
    if (agoH < 25) {
        return agoH + " hours ago";
    }
    var agoD = (agoH / 24).toFixed(0);
    if (agoD < 2) {
        return "yesterday";
    }
    if (agoD < 6) {
        return agoD + " days ago";
    }
    return prettyDate(time);
}

function prettyDate(time) {
    time = time - 0; // force int;
    var when = new Date(time);
    return when.toDateString();
}

// http://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
function getParams() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? toAssocArray(prmstr) : {};
}

function toAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}

// from
// https://github.com/coolaj86/knuth-shuffle/blob/master/index.js
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
