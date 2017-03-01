// setup our tabs
$( function() {
    $( "#tabs" ).tabs( {
        show: 'fadeIn', 
        hide: 'fadeOut'
    });
} );

$(function() {      
	//Enable swiping...
    $("#tabs .tab_content").swipe( {
    	//Generic swipe handler for all directions
        swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
			var active = $( "#tabs" ).tabs( "option", "active" );
			var maxIdx = $( '#tabs >ul >li' ).length - 1;
			if (direction == "right") {
				if (active == 0) {
					$( "#tabs" ).tabs( "option", "active", maxIdx );
				}
				else {
					$( "#tabs" ).tabs( "option", "active", active-1 );
				}
			}
			else if (direction == "left") {
				if (active == maxIdx) {
					$( "#tabs" ).tabs( "option", "active", 0);
				}
				else {
					$( "#tabs" ).tabs( "option", "active", active+1 );
				}
			}
		},
		
        //Default is 75px, set to 0 for demo so any distance triggers swipe
		threshold:75
	} );
});

function serverOnConnect() {
    // What to do on connect to the server.
    console.log("I'm connected!");
}

function serverOnDisconnect() {
    // What to do when we drop the connection.
    console.log("I'm disconnected!");
}

function asyncRecv(msg) {
    if(msg.data['event'] == 'HUE') {
    $('#log').append('<br>' + $('<div/>').text('Got HUE Event!').html());
     
    var lights = msg.data['lights'];
    for(var i = 0; i < lights.length; i++) {
        var light = lights[i];
        var $lelem = $('#lights .light[num='+light['id']+']');

        if (!$lelem.length) {
        $lelem = $('<div class="light" num="'+light['id']+'"/>').appendTo('#lights');
        }

        $lelem.html('');

        $('<span class="name">'+light['name']+'</span>').appendTo($lelem);
        $('<br/>').appendTo($lelem);
        $('<span class="bri">'+light['state']['bri']+'</span>').appendTo($lelem);
        $('<br/>').appendTo($lelem);
        $('<span class="color">#'+light['state']['color']+'</span>').appendTo($lelem);
        $('<br/><br/>').appendTo($lelem);
    }
    
    var groups = msg.data['groups'];
    for(var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var $lelem = $('#groups .group[num='+group['id']+']');
        
        if (!$lelem.length) {
        $lelem = $('<div class="group" num="'+group['id']+'"/>').appendTo('#groups');
        }

        $lelem.html('');

        $('<span class="name">'+group['name']+'</span>').appendTo($lelem);
        $('<br/>').appendTo($lelem);
        $('<span class="bri">'+group['action']['bri']+'</span>').appendTo($lelem);
        $('<br/>').appendTo($lelem);
        $('<span class="color">#'+group['action']['color']+'</span>').appendTo($lelem);
        $('<br/><br/>').appendTo($lelem);
    }
    }
};

$(document).ready(function() {
    // Use a "/test" namespace.
    // An application can open a connection on multiple namespaces, and
    // Socket.IO will multiplex all those connections on a single
    // physical channel. If you don't care about multiple channels, you
    // can set the namespace to an empty string.
    namespace = '/test';

    // Connect to the Socket.IO server.
    // The connection URL has the following format:
    //     http[s]://<domain>:<port>[/<namespace>]
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port + namespace);

    // Event handler for new connections.
    // The callback function is invoked when a connection with the
    // server is established.
    socket.on('connect', serverOnConnect);

    // Event handler for a dropped connection.
    // The callback function is invoked when the connection has been dropped.
    socket.on('disconnect', serverOnDisconnect);

    // Event handler for server sent data.
    // The callback function is invoked whenever the server emits data
    // to the client. The data is then displayed in the "Received"
    // section of the page.
    socket.on('my_response', asyncRecv);

    // Interval function that tests message latency by sending a "ping"
    // message. The server then responds with a "pong" message and the
    // round trip time is measured.
    var ping_pong_times = [];
    var start_time;
    window.setInterval(function() {
        start_time = (new Date).getTime();
        socket.emit('my_ping');
    }, 1000);

    // Handler for the "pong" message. When the pong is received, the
    // time from the ping is stored, and the average of the last 30
    // samples is average and displayed.
    socket.on('my_pong', function() {
        var latency = (new Date).getTime() - start_time;
        ping_pong_times.push(latency);
        ping_pong_times = ping_pong_times.slice(-30); // keep last 30 samples
        var sum = 0;
        for (var i = 0; i < ping_pong_times.length; i++)
        sum += ping_pong_times[i];
        $('#ping-pong').text(Math.round(10 * sum / ping_pong_times.length) / 10);
    });

});
