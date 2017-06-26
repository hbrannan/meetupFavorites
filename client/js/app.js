(function($, Mustache) {

  var template, //Storing mustache template we're grabbing from the DOM.
    $events, //DOM element for appending events, spinners, etc.
    $searchButton,
    $topic, //Topic search input field.
    $signIn, //DOM sign in form
    $user, //Username input field.
    $formResponse, // Sign in form response container
    currentUser  = null,
    currentUserFavorites = {},
    currentData = {},
    months       = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], //Short-hand months for display.
    spinner_opts = { lines: 13, length: 20, width: 10, radius: 60, color: '#333', className: 'spinner' }; //Options for spin.js.

  // If a user is logged in, also fetch their favorites from data store.
  // If user searching for favorites only, render favorites.
  // Else, also fetch data from Meetup API.
  // TODO: needs refactor to more responsibly handle conditional if user/ if favorites only async.
  var getEvents = function(e) {

    if (e !== undefined) {
      e.preventDefault();
    }

    var submittedTopic = $topic.val().toLowerCase();

    //spin.js -- http://fgnass.github.io/spin.js/
    new Spinner(spinner_opts).spin($events[0]);

    //Get favorites information for currentUser if set.
    if (currentUser) {

      $.ajax({
        method: 'GET',
        url: '/favorites',
        data: { 'user' : currentUser },
        success: function (responseObj){
          responseObj.favorites.results = responseObj.favorites.results.map(function (val) {
            return JSON.parse(val);
          });
          responseObj.favorites.meta.count = responseObj.favorites.results.length;
          currentUserFavorites = responseObj.favorites;
        },
        error: function (err){
          //TODO: Display error message for user to refresh/ retry to retrieve favorites.
          console.log(err)
        }
      });

      //TODO: refactor the flow of conditional render call to asynchronous, refactor render func. to not need redundant data in this case.

      if ( submittedTopic === 'favorites' || submittedTopic === 'my favorites') {
        renderEvents(currentUserFavorites, currentUserFavorites);
        return;
      }
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
        renderEvents(data, currentUserFavorites);
      },
      error: ajaxError
    });
  };

  var renderEvents = function(data, favorites) {

    console.log('rendercall', data);

    //Make sure there are events and that there isn't an error.
    if (typeof(data.results) !== "undefined" && data.meta.count > 0) {

      for(var i=0, len=data.results.length; i<len; i++) {

        var e    = data.results[i],
          date = new Date(e.time);

        e.month = months[date.getMonth()]
        e.date =  date.getDate();
        e.idx = i;
        if (favorites[e.id]){
          e.favoritedStatus = '★';
        } else {
          e.favoritedStatus = '☆';
        }
        console.log('each', e)
      }


      $events.html(Mustache.render(template, data));

    } else {

      $events.html('<p class="big bold">We couldn\'t find any matching events :(</p>');

    }

  };

  var signIn = function (e) {
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
        $formResponse.removeClass('visible');
        $formResponse.addClass('hidden');
        //TODO: timeout response: You're signed in!
      },
      error: function(xhr, ajaxOptions, thrownError) {
        //TODO: display error message on .form-response (on timeout cycle, and fade out)
     }
    });
  };

  var markFavorite = function () {
    var $el = $(this);
    var text = $el.text();
    var eventId = $el.attr('id');
    var eventIdx= $el.attr('key');
    var eventInfo = JSON.stringify(currentData.results[eventIdx]);

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
          user_id: currentUser,
          event_info: eventInfo
        },
        success: function (data){console.log(data)},
        error: function (err){console.log(err)}
      });

    } else {
      //TODO: add additional styles to make Sign In more visible & effective. Ex:
      // only sign in  `page` -> only content || centered, position fixed until signed in, then hidden
      console.log('no user is registered yet.. must sign in!')
      $formResponse.removeClass('hidden');
      $formResponse.addClass('visible');
    }
  };

  var ajaxError = function() {

    $events.html('<p class="big bold">Uh oh. Something went wrong here.</p>');

  };

  var init = function() {

    //Cache Selectors
    template = $("#meetup-template").html();
    $events = $("#events");
    $searchButton = $("#search-button");
    $topic = $("#topic");
    $signIn = $('#user-signin');
    $user = $('#user');
    $formResponse = $('.form-response');

    //Event Listeners
    $searchButton.on("click", getEvents);
    $events.on('click', '.favoritedStatus', markFavorite);
    $signIn.submit(signIn);

    getEvents();

  };

  $(init);

})($, Mustache);
