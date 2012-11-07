/**
 * app.js
 *
 *= require_self
 */

// Note for anyone reading this IN THE FUTURE
// I clearly don't know how to write idiomatic js.
// I am moderately ashamed about this, don't worry.

// I CAN TELL this is lame code, but I didn't have time
// to finish reading 'The Good Parts' before the party date.
// If this were ruby, maybe I would have a class or a module
// but I don't entirely grok the js inheritance model as of yet

// VARIABLES I (DISGUSTINGLY) STORE GLOBALLY:

// store images to be loaded on to the main waterfall
$images = [];

$tagged_hsh = {};
$tagged_arr = [];
$to_display = []
$new_tag = []

$jmp = $("#jmpress");

// store the integer count of the span containing 
// a row of images that have been loaded, but should now
// be garbage collected.
$loaded_img = []

// counter used to keep track of the number of rows injected
// into the waterfall so we can then GC them later.
// HINT: refactor
$counter = 0;

// waterfall container
$container = $('#pics');


// hash containing the pagination ids necessary for traversing
// the instagram tag feed
$next_id = {}

// array containing the tags we are using for waterfall
$tags = []

// pause waterfall and the auto slide transitions
$PAUSED = false;
$PAUSE_WATERFALL = false;

// number of images per row
$WIDTH = 8;

// number of rows in the DOM, before garbage collection gets triggered
$MAX_SIZE = 16;

// number of images remaining in the $images array before we'll trigger
// a new request for more images.
$BUFFER = 24;

$FIRST_RUN = true;

$tr_t = 3000;

$tracks = [
  [ ["#home", 50000], [ "#step-2", $tr_t], ["#step-3", $tr_t], ["#step-4", $tr_t], ["#step-5", $tr_t] ],
  [ ["#home", 50000], [ "#left", $tr_t], ["#left-2", $tr_t], ["#left-3", $tr_t], ["#left-4", $tr_t], ["#left-5", $tr_t] ],
  [ ["#home", 30000], ["#up", $tr_t], ["#up-2", $tr_t], ["#up-3", $tr_t], ["#up-4", $tr_t], ["#up-5", $tr_t], ["#up-6", $tr_t],  ["#up-7", $tr_t] ]
];

$current_track = 0;
$track_pos = 0;

function draw(){

  if ($PAUSED || $PAUSE_WATERFALL)
  {
    setTimeout("draw()", 1000);
    return;

  }


  if($images.length < $BUFFER)
  {
    load_items();
  }

  if($images.length > 0)
  {

    var html = ""
    if ($new_tag.length > 0) {
      for(var i = ($new_tag.length - 1); i >= 0; i--) {
        $images.splice(0, 0, $new_tag[i]);
      }

      $new_tag = [];
    }
    len = ($images.length < $WIDTH ? $images.length : $WIDTH)
    for(var i = 0; i < len; i++) {
      img = $images.shift();
      html = html + "<div class='item'><img src='" + img + "' /></div>";
    }

    var new_items = $("<span id='container" + $counter + "'>" + html + "</span");

    $loaded_img = $loaded_img.concat($counter)
    $counter++;
    new_items.imagesLoaded(function() {

      $container.prepend(new_items).isotope( 'reloadItems').isotope({ sortBy: 'original-order', gutterWidth: 10 });
      if ($loaded_img.length > $MAX_SIZE) {
        $("#container" + $loaded_img.shift()).remove();
      }

      setTimeout("draw()", 1000);

    });
  }
  else
  {
    // refactoring would be smart. Such spaghetti!
    setTimeout("draw()", 1000);

  }

}

function draw_slides()
{
  while ($to_display.length < 50)
    {
      for(var i = 0; i < $tagged_arr.length; i++)
      {
        rand = Math.ceil(Math.random() * 10);
        if(i < 20)
          {
            if(rand > 4)
              {
                $to_display.push($tagged_arr[i])
              }
          }
          else
            {
              if(rand > 7)
                {
                  $to_display.push($tagged_arr[i])
                }
            }
      }
    }

    $(".dyn_img").each(function(i, elem) { 
      $(elem).html("<img src='" + $to_display.shift() + "' />");
    });

    setTimeout("draw_slides()", 10000);
}

function load_items(callback)
{
  $.post("/moar", { next_id: $next_id, tags: $tags }, function(data) {
    $next_id = data[0]

    $images = $images.concat(data[1]);

    // every five draw events or so add another prev pic
    if((Math.ceil(Math.random() * 100) % 3) == 0){
      inject_prev_tags()
    }
    if(callback !== undefined) {
      callback();
    }
  }, 'json');

}

function poll_tag(callback)
{
  $.getJSON("/tagged", function(data) {
    if(data != "" && data !== null){

      for(var i in data) {
        if ($tagged_hsh[i] === undefined) {
          $tagged_hsh[i] = data[i]
          if(!$FIRST_RUN) {
            $new_tag.push(data[i]);
          }
        }
      }

      var arr = []
      for(var tstamp in $tagged_hsh) {
        arr.push(tstamp);
      }

      arr = arr.sort();
      $tagged_arr = []
      for(var i = (arr.length - 1); i >= 0; i--){
        $tagged_arr.push($tagged_hsh[arr[i]])
      }

      $FIRST_RUN = false;

      if(callback !== undefined) {
        callback();
      }
    }

  });
  setTimeout("poll_tag()", 3000);
}

function inject_prev_tags(){
  rand = Math.ceil(Math.random() * 1000) % $tagged_arr.length;
  img = $tagged_arr[rand];

  if(img !== undefined){
    $images.push(img);
  }
}



$(window).load(function(){

  $tags = $("#tag_input").attr("value").split(" ");

  $("#question").remove();

  $(".step").each(function(i, elem) {
    $(elem).removeClass("hidden");
  });

  $jmp.jmpress();

  $container.isotope( {
    itemSelector: '.item',
    gutterWidth: 10,
    animationEngine: 'css'
  });

  load_items(draw);

  poll_tag(draw_slides);

  do_slides();

});



function do_slides()
{
  var curr = $tracks[$current_track][$track_pos];
  var next = undefined;

  // if moving ahead in the current track doesn't overflow
  if (($track_pos + 1) < $tracks[$current_track].length)
  {
    $track_pos = $track_pos + 1;
  }
  else
  {
    // it overflowed! time to move to next track
    $track_pos = 0;
    if(($current_track+1) >= $tracks.length)
    {
      $current_track = 0;
    }
    else
    {
      $current_track = $current_track + 1;
    }
  }

  
  leave_in = curr[1];
  slide = curr[0];

  // CAN YOU TELL THIS STUFF SHOULD BE IN ITS OWN DATASTRUCTURE?!?!?!
  next_slide =  $tracks[$current_track][$track_pos][0]

  if(slide != "#home")
  {
    $PAUSE_WATERFALL = true;
  }
  if(next_slide == "#home")
  {
    $PAUSE_WATERFALL = false;
  }

  $jmp.jmpress('select', slide);

  setTimeout("do_slides()", leave_in);
}

function next_slide(count){

  if(!$PAUSED)
  {
    jmp.jmpress("next");
  }
 
   next_count = (count++ % 5) + 1;
  if(next_count === 1)
  {
    timeout = 10000;
    $PAUSE_WATERFALL = false;
    draw_slides();

  }
  else
  {
    $PAUSE_WATERFALL = true;
    timeout = 2000;
  }
  setTimeout("next_slide(" + next_count + ")", timeout);
    

}


