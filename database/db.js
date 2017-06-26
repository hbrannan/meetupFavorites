const Sequelize = require('sequelize');
const dbName = process.env.dbName || 'user_favorites';
const dbUsr = process.env.dbUsr || 'usr';
const dbPwd = process.env.dbPwd || 'pwd';

const sequelize = new Sequelize(dbName, dbUsr, dbPwd, {
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
  },
  event_info: {
    type: Sequelize.STRING
  }
});

User.belongsToMany(Favorite, {through: 'users_favorites'});
Favorite.belongsToMany(User, {through: 'users_favorites'});

sequelize.sync();

module.exports = {
  Users: User,
  Favorites: Favorite
};
