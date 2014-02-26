

// development convenience to be able to pass
// ?nodeName=PotatoChampion
// for example in order to test how it looks with different nodes
var params = getParams();
if (params.nodeName) {
    pageConf.nodeName = params.nodeName;
}

// pageConf is set in splash.html in ptp-splash-page repo
// https://github.com/personaltelco/ptp-splash-page
// it is meant to be the place for handoff of information to this js
var nodeName = pageConf.nodeName;  

// these must correspond to the server for ptp-api
// https://github.com/personaltelco/ptp-api
var apiserver = 'http://api.personaltelco.net';
var apibase = apiserver + '/api/v0';

$(document).ready(function() {
    async.parallel([internetWorks,
                    loadDonors,
                    loadAboutVideo,
                    loadAboutNodes,
                    loadMailinglist,
                    loadNews
                   ], 
                   finished);
});

function internetWorks(cb) {
	console.log('internet works');
	$( "#works" ).text("Dynamic content successfully loaded from " + apiserver);	
	
	$("#statusSidebarWords").text("connected");
	$("#statusSidebarWords").removeClass('text-danger').addClass('text-success');
	$("#statusSidebarIcons").html('<i class="fa fa-sitemap text-success"></i>');
	// tempting to load some overall network stats
	// number of nodes active
	// number of connected users
	cb();
}

function loadAboutVideo(done) {
    console.log('about video');
    dust.render("about_video", {}, function(err, out) {
        if (err)
            throw err;
        $( out ).appendTo( "#aboutVideo" );
        $('body').scrollspy('refresh');
        done();
    });    
}

function loadMailinglist(cb) {
	getAndRender(apibase + '/rss/ptp', 'rss', function(err, ret) {
		$( '<h2>From the mailing list...</h2>' + ret ).appendTo( "#ptprss" );
		cb();
	});	
}

function loadDonors(cb) {
	$.getJSON(apibase + '/donors', function(res) {
		$( '#donors' ).append('<h2 class="featurette-heading">Thank You Donors!!!</h2>');
		res.data.forEach(function(e) {
			console.log('loading donors', e);
			$( '#donors' ).append('<strong>'+e+'</strong>&nbsp;&nbsp;&nbsp;');
		});
		cb();
	});	
}



function loadAboutNodes(done) {
    console.log('about nodes');
    $.getJSON(apibase + '/nodes', function(res) {

        // get all the nodes that have logos
        async.filter(res.data,function(n, cb){
            var nodeName = Object.keys(n)[0];
            console.log('logo',n[nodeName].logo);
            cb((n && n[nodeName].logo));
        },function(list){
            // and then render them
            async.map(list,function(node, next) {
                var nodeName = Object.keys(node)[0];
                var obj = {n: node[nodeName],
                    base: "http://static.personaltelco.net/images/nodes/"};
                dust.render("about_nodes", obj , function(err, rendered) {
//                    console.log(url, template);
                    next(err, rendered);
                });
            }, function(err, ret) {
                if (err)
                    throw err;
                nodeScroll(ret,done);
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
	async.parallel([
        function(cb){getAndRender(apibase + '/twitter/ptp', 'tweet', cb);},
        function(cb){getAndRender(apibase + '/twitter/' + nodeName, 'tweet', cb);},
        function(cb){getAndRender(apibase + '/rss/' + nodeName, 'rss', cb);}
    ], 
    function(err, res) {
		if (!res[0] && !res[1] && !res[2]) {
			return; 
		}
		dust.render("news", {nodeName: nodeName}, function(err1, out) {
			if (err)
				throw err;
			$( out ).insertAfter( "#newsFromServer" );
			$( res[0] ).appendTo( "#ptptweets" );
			$( res[1] ).appendTo( "#nodetweets" );
			$( res[2] ).appendTo( "#noderss" );
			addNav('news','News');
			done();
		});
	});
}


function getAndRender (url, template, cb) {
	$.getJSON(url, function(res) {
		async.map(res.data,function(e, next) {
			dust.render(template, e, function(err, rendered) {
				console.log(url, template);
				next(err, rendered);
			});
		}, function(err, ret) {
			if (err)
				throw err;
			cb(err, ret.join(''));
		});
	});
}


function addNav (target, nav) {
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

function finished () {
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

//http://stackoverflow.com/questions/5448545/how-to-retrieve-get-parameters-from-javascript
function getParams() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? toAssocArray(prmstr) : {};
}

function toAssocArray( prmstr ) {
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
    var currentIndex = array.length
      , temporaryValue
      , randomIndex
      ;

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



