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
      let user = result.rows[0];
      if(user && await bcrypt.compare(password, user.password)){
        return true;
      }
      return false;
      
    } catch (error) {
      throw error
      
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1
      RETURNING username`,
      [username]
    );
    if(!result.rows[0]){
      throw new errorHandler(`User With ${username} Not Found`,404)
    }
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      `SELECT username,
      first_name,
      last_name,
      phone
      FROM users`
    )
    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
    SELECT username,
    first_name,
    last_name,
    phone, 
    join_at,last_login_at
    FROM users
    WHERE username = $1
    `,[username])
    if (!result.rows[0]) {
      throw new errorHandler(`User With ${username} Not Found`, 404);
    }
    return result.rows[0]
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    const result = await db.query(`
    SELECT m.id,
    m.to_username,
    u.first_name,
    u.last_name,
    u.phone,
    m.body,
    m.sent_at,
    m.read_at
    FROM messages AS m
    JOIN users AS u ON m.to_username = u.username
    WHERE from_username = $1`,
    [username]
    )
    return result.rows.map((m) => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at,
    }));
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
  const result = await db.query(
        `SELECT m.id,
                m.from_username,
                u.first_name,
                u.last_name,
                u.phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
           JOIN users AS u ON m.from_username = u.username
          WHERE to_username = $1`,
        [username]);

    return result.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }  
  }



module.exports = User;