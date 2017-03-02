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
                $( "#tabs" ).tabs( {
                    show: { effect: 'slide', direction: 'right', duration: 500 },
                    hide: { effect: 'slide', direction: 'right', duration: 500 }
                });
				if (active == 0) {
					$( "#tabs" ).tabs( "option", "active", maxIdx );
				}
				else {
					$( "#tabs" ).tabs( "option", "active", active-1 );
				}
			}
			else if (direction == "left") {
                $( "#tabs" ).tabs( {
                    show: { effect: 'slide', direction: 'left', duration: 500 },
                    hide: { effect: 'slide', direction: 'left', duration: 500 }
                });

				if (active == maxIdx) {
					$( "#tabs" ).tabs( "option", "active", 0);
				}
				else {
					$( "#tabs" ).tabs( "option", "active", active+1 );
				}
			}

            $( "#tabs" ).tabs( {
                show: 'fadeIn', 
                hide: 'fadeOut'
            });
		},
		
        //Default is 75px, set to 0 for demo so any distance triggers swipe
		threshold:75
	} );
});


