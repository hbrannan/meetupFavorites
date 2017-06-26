(function($, Mustache) {

  var template, //Storing mustache template we're grabbing from the DOM.
    $events, //DOM element for appending events, spinners, etc.
    $topic, //Topic search input field.
    $user,
    currentUser  = null,
    currentUserFavorites = {},
    currentData = {},
    months       = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], //Short-hand months for display.
    spinner_opts = { lines: 13, length: 20, width: 10, radius: 60, color: '#333', className: 'spinner' }; //Options for spin.js.

  var getEvents = function(e) {

    if (e !== undefined) {
      e.preventDefault();
    }

    var submittedTopic = $topic.val().toLowerCase();

    //spin.js -- http://fgnass.github.io/spin.js/
    new Spinner(spinner_opts).spin($events[0]);


    //Get favorites information for currentUser if set.
    if (currentUser) {

      if ( submittedTopic === 'favorites' || submittedTopic === 'my favorites') {
        console.log('in')
        renderEvents(currentData, currentUserFavorites, true);
        return;
      }

      $.ajax({
        method: 'GET',
        url: '/favorites',
        data: { 'user' : currentUser },
        success: function (responseObj){
          currentUserFavorites = responseObj.favorites;
          console.log('successFaveList', currentUserFavorites);
        },
        error: function (err){console.log(err)}
      });
    }

    //Get API information based on topic.
    $.ajax({
      url:"http://api.meetup.com/2/open_events/?callback=?",
      data: {
        zip:"10012",
        text:$topic.val(),
        page:"10",
        key:"6752511f3291b2b182ee4d2ef312",
        time:"1w,"
      },
      dataType:"json",
      success: function (data) {
        currentData = data;
        // if ( submittedTopic === 'favorites' || submittedTopic === 'my favorites') {
        //   console.log(submittedTopic);
        //   renderEvents(data, currentUserFavorites, true);
        // } else {
          renderEvents(data, currentUserFavorites);
        // }
      },
      error: ajaxError
    });
  };

  const renderEvents = function(data, favorites, displayOnlyFavorites) {
    //data is an Object {results:[{},{},{}], meta:?};
    //if you are only displaying favorites, filter out non_needed data (which, bc in array will be a linear sort anyway)

    var renderData = [];
    console.log(currentUser, data, favorites);

    //Make sure there are events and that there isn't an error.
    if (typeof(data.results) !== "undefined" && data.meta.count > 0) {

      for(var i=0, len=data.results.length; i<len; i++) {

        var e    = data.results[i],
          date = new Date(e.time);

        e.month = months[date.getMonth()]
        e.date =  date.getDate();
        if (favorites[e.id]){
          console.log('one exists');
          renderData.push(e);
          e.favoritedStatus = '★';
        } else {
          e.favoritedStatus = '☆';
        }
      }

      if (displayOnlyFavorites){
        console.log('specail case', renderData);
        data.results = renderData;
      }

      console.log('renderData', renderData);

      $events.html(Mustache.render(template, data));

    } else {

      $events.html('<p class="big bold">We couldn\'t find any matching events :(</p>');

    }

  };

  var ajaxError = function() {

    $events.html('<p class="big bold">Uh oh. Something went wrong here.</p>');

  };

  var init = function() {

    template = $("#meetup-template").html();
    $events = $("#events");
    $topic = $("#topic");

    $("#search-button").on("click", getEvents);

    getEvents();

  };

  $(init);

  $(document).ready(function () {
    //CACHE SELECTORS
    $signIn = $('#user-signin');
    $user = $('#user');

    $events.on('click', '.favoritedStatus', function (e) {
      var $el = $(this);
      var text = $el.text();
      var eventId = $el.attr('id');
      var $formResponse = $('.form-response');

      if (currentUser){
        if (text === '★')  {
          $el.text('☆');
        } else {
          $el.text('★');
        }

        $.ajax({
          method: 'POST',
          url: '/favorites',
          data: {
            event_id: eventId,
            user_id: currentUser
          },
          success: function (data){console.log(data)},
          error: function (err){console.log(err)}
        });

      } else {
        console.log('no user is registered yet.. must sign in!')
        $formResponse.removeClass('hidden');
        $formResponse.addClass('visible');
      }
    });

    $signIn.submit(function (e){
      e.preventDefault();
      var userEntered = JSON.stringify($user.val());

      $.ajax({
        type: "POST",
        url: "/users",
        data: { 'user' : userEntered },
        dataType: 'json',
        success: function(responseObj) {
          currentUser = responseObj.userId;
          getEvents();
        },
        error: function(xhr, ajaxOptions, thrownError) {
         console.log(xhr.responseText);
       }
      });
    });

  });

})($, Mustache);
