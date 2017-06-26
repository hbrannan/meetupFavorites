const Sequelize = require('sequelize');

const sequelize = new Sequelize('user_favorites', 'usr', 'pwd', {
  host: 'localhost',
  dialect: 'sqlite',
  storage: './database.sqlite'
});

const User = sequelize.define('users', {
  id: {
    type:Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type:Sequelize.STRING
  }
});

const Favorite = sequelize.define('favorites', {
  id: {
    type:Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  event: {
    type:Sequelize.STRING
  }
});
//Does user haveMany Favorites or belong to many favorites?
User.belongsToMany(Favorite, {through: 'UserFavorite'});
Favorite.belongsToMany(User, {through: 'UserFavorite'});

sequelize.sync();
//FOR DEV:
// sequelize.drop()


module.exports = {
  Users: User,
  Favorites: Favorite
};
