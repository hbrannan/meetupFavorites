(function($, Mustache) {

  var template, //Storing mustache template we're grabbing from the DOM.
    $events, //DOM element for appending events, spinners, etc.
    $topic, //Topic search input field.
    $user,
    currentUser  = null,
    currentUserFavorites = {},
    months       = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], //Short-hand months for display.
    spinner_opts = { lines: 13, length: 20, width: 10, radius: 60, color: '#333', className: 'spinner' }; //Options for spin.js.

  var getEvents = function(e) {

    if (e !== undefined) {
      e.preventDefault();
    }

    var submittedTopic = $topic.val().toLowerCase()

    if ( submittedTopic === 'favorites' || submittedTopic === 'my favorites') {
      console.log('specail case');
      //render only my favorites
    }

    //spin.js -- http://fgnass.github.io/spin.js/
    new Spinner(spinner_opts).spin($events[0]);

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
      success: renderEvents,
      error: ajaxError
    });

//MODIFY RENDER EVENTS, so you can handle data.api & data.db

    if (currentUser) {
      console.log('registered current user and recalling render', currentUser)
      $.ajax({
        method: 'GET',
        url: '/favorites',
        data: { 'user' : currentUser },
        success: function (responseObj){
          currentUserFavorites = responseObj.favorites;
          console.log('successFaveList', responseObj.favorites);
          // if ($topic === 'favorites') {
          //   console.log('specail case');
          // //   renderFavoritesList(userFavorites);
          // } // else {
          //   renderEvents(responseObj.favorites);
          // }
        },
        error: function (err){console.log(err)}
      });
    }

  };

  const renderFavoritesList = (favoritesList) => {
    console.log('render faves only');
  };

  const renderEvents = function(data) {
    console.log('events data', data);
    // var favorited = data.favoriteList;

    //Make sure there are events and that there isn't an error.
    if (typeof(data.results) !== "undefined" && data.meta.count > 0) {

      for(var i=0, len=data.results.length; i<len; i++) {

        var e    = data.results[i],
          date = new Date(e.time);

        e.month = months[date.getMonth()]
        e.date =  date.getDate();
        if (currentUserFavorites[e.id]){
          e.favoritedStatus = '★';
        } else {
          e.favoritedStatus = '☆';
        }

      }

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
          console.log('in User/POST succ.', responseObj.userId, currentUser);
          getEvents();
        },
        error: function(xhr, ajaxOptions, thrownError) {
         console.log(xhr.responseText);
       }
      });

    });

  });

})($, Mustache);
