const db = require('../database/db.js');

let currentUser = null;

const getUser = (postedUsername) => {
  return db.Users.findOne({
    where: {
      username : postedUsername
    }
  })
  .then(user => {
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
  return db.Users.create({ username: postedUsername })
  .then(user => {
    currentUser = user;
    console.log(user.get('username'), user.dataValues)
    return user.get('id')
  })
  .catch(err => err);
};

const getFavorites = (userId) => {
  return currentUser.getFavorites()
  .then(list => {
    var newList = {
      results: [],
      meta: {}
    };
    list.forEach(val => {
      newList[val.event] = val.id;
      newList.results.push(val.event_info);
    });
    return newList;
  })
  .catch(err => err);
};

const checkFavorite = (uId, eventApiId, eventInfo) => {
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
      return removeFavorite(uId, eventApiId);
    } else {
      return postFavorite(uId, eventApiId, eventInfo);
    }
  })
  .catch(err => {
    //TODO: factor out postFavorite here; rather, send back and handle error.
     postFavorite(uId, eventId);
     return err;
  });
};

const removeFavorite = (uId, eventId) => {
  return db.Favorites.destroy({
    where: {
      event: eventId
    }
  })
  .then(data => data)
  .catch(err => err);
};

const postFavorite = (uId, eventId, eventInfo) => {
  console.log('UTILS 80:', uId, eventId, eventInfo);
  return db.Favorites.create({event: eventId, event_info: eventInfo})
  .then(favorite => currentUser.addFavorite(favorite))
  .then(data => data)
  .catch(err => err);
};

module.exports = {
  getUser: getUser,
  checkFavorite: checkFavorite,
  getFavorites: getFavorites
};
