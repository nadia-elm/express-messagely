/** User class for message.ly */


const db = require('../db');
const bcrypt = require('bcrypt');
const errorHandler = require('../expressError')

const { BCRYPT_WORK_FACTOR } = require("../config");



/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) { 
    try {
      const hashedPW = await bcrypt.hash(
        password,
        BCRYPT_WORK_FACTOR
      );
      const join_at = new Date();
      const result = await db.query(
        `INSERT INTO users 
        (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username, password, first_name, last_name, phone, join_at`,
        [username, hashedPW, first_name, last_name, phone, join_at]
      );
      return result.rows[0];
    } catch (error) {
      throw error; 
    }
  }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    try {
      const result = await db.query(
        `SELECT username, password
        FROM users
        WHERE username = $1`,
        [username]
      );
      const user = result.rows[0];
      if(user && await bcrypt.compare(password, user.password)){
        return true;
      }
      return false;
      
    } catch (error) {
      throw error
      
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { }
}


module.exports = User;