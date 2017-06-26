const db = require('../database/db.js');

let currentUser = null;

const getUser = (postedUsername) => {
  return db.Users.findOne({
    where: {
      username : postedUsername
    }
  })
  .then(user => {
    console.log('GETUSR');
    if (user) {
      console.log(user.dataValues)
      currentUser = user;
      return user.get('id');
    } else {
      return createUser(postedUsername);
    }
  })
  .catch(err => err);
};

const createUser = (postedUsername) => {
  console.log('CREATE USR')
  return db.Users.create({ username: postedUsername })
  .then(user => {
    currentUser = user;
    console.log(user.get('username'), user.dataValues)
    return user.get('id')
  })
  .catch(err => err);
};

const getFavorites = (userId) => {
  console.log('getting faves for user: utils28 for:', userId);
  //TODO: really only want the 'event' STRING from line 30;
  return currentUser.getFavorites() //TRY: getFavorites('event')
  .then(list => list)
  .catch(err => err);
};

const checkFavorite = (uId, eventApiId) => {
  console.log('QUERY fave');
  //TODO: FIX!!!
  return db.Favorites.findOne({
    where : {
      event: eventApiId
    },
    include: [{
      model:db.Users,
      through: {
        where: {
          userId: uId
        }
      }
    }]
  })
  .then(favorite => {
    if ( favorite ) {
      console.log('FOUND, utils:54')
      return removeFavorite(uId, eventApiId);
    } else {
      console.log('NOT FOUND, NOT ERR, utils:57')
      return postFavorite(uId, eventApiId);
    }
  })
  .catch(err => {
    console.log('ERR: utils:62',err);
    return postFavorite(uId, eventId);
  });
};

const removeFavorite = (uId, eventId) => {
  console.log('REMOVE fave');
  return db.Favorites.destroy({
    where: {
      event: eventId,
      userId: uId
    }
  })
  .then(data => data)
  .catch(err => err);
};

const postFavorite = (uId, eventId) => {
  console.log('POSTING FAVORITE')
  return db.Favorites.create({event: eventId})
  .then(favorite => currentUser.addFavorite(favorite))
  .then(data => data)
  .catch(err => err);
};

module.exports = {
  getUser: getUser,
  checkFavorite: checkFavorite,
  getFavorites: getFavorites
};
