const Sequelize = require('sequelize');
const dbName = process.env.dbName;
const dbUsr = process.env.dbUsr;
const dbPwd = process.env.dbPwd;
const dbHost = process.env.dbHost;

const sequelize = new Sequelize('postgres://fmfnnbnevmthci:94d87605d4fe485641cb10561bddfd23551dacfd751b92a61141b9e1535a4cd5@ec2-184-73-249-56.compute-1.amazonaws.com:5432/dc6naiustshdja',
  dbUsr, dbPwd, {dialect: 'sqlite'});

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
