
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
                    loadAbout,
                    loadMailinglist,
                    loadNews
                   ], 
                   finished);
});

function internetWorks(cb) {
	console.log('internet works');
	$( "#works" ).text("Dynamic content successfully loaded from " + apiserver);	
	// tempting to load some overall network stats
	// number of nodes active
	// number of connected users
	cb();
}

function loadAbout(done) {
    console.log('about video');
    dust.render("about", {}, function(err, out) {
        if (err)
            throw err;
        $( out ).appendTo( "#aboutDynamic" );
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

function loadNews(done) {
	console.log('loading news');
	async.parallel([
        function(cb){getAndRender(apibase + '/tweets/ptp', 'tweet', cb);},
        function(cb){getAndRender(apibase + '/tweets/' + nodeName, 'tweet', cb);},
        function(cb){getAndRender(apibase + '/rss/' + nodeName, 'rss', cb);}
    ], 
    function(err, res) {
		if (!res[0] && !res[1] && !res[2]) {
			return; 
		}
		dust.render("news", {nodeName: nodeName}, function(err1, out) {
			if (err)
				throw err;
			$( out ).insertAfter( "#about" );
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


