Full Stack Demo Project
=======================

This bundle includes a static HTML, browser-based app that searches
for upcoming Meetups using the Meetup API's [Open Events][events]
method. Open [the app][https://meetupfaves.herokuapp.com/] to try for yourself!

It uses Meetup's locally-grown CSS framework, [Sassquatch][sassquatch].

It also inclues a favorites web API which supports:
  - user "login" (MPV: just based on username for now)
  - toggling event-favorited statuses for each user
  - fetching users' favorites

Additionally, users may list all their favorited Meetups by seraching for
'favorites' or 'my favorites' in the topics input box.

Todo List
--------------

This starter project is pretty good, but it still has broader aspirations.
My most pressing TODOs:
  - Testing! I'm aching to get cracking at some testing for these features!
  - Improved UX: I want the difference between sign in and the rest of the app to be much clearer. Perhaps separating out into two 'screens'
  - App.js: promisified handling of asynchronous requests. The successive ajax requests from app.js lines 34-74 currently work based on node callbacks and a little bit of betting on sufficient response times. I'd like to weed this out.
  - Improved responsive styles: I noticed at small mobile, a style [bug][https://cl.ly/0T2g3l1u2C34] wheretext bled out of boxes.



[events]: http://www.meetup.com/meetup_api/docs/2/open_events/
[sassquatch]: http://meetup.github.io/sassquatch/
