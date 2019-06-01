var mysql_dbc = require('../../config/db_con')()
var connection = mysql_dbc.init()
const async = require('async')
require('dotenv').config()

const signIn = function (req, res) {
  var {
    email,
    password
  } = req.body
  if (!email || !password) {
    res.json({ code: 400, v: 'v1', status: 'ERR_FIELD' })
  } else {
    async.waterfall([
      (callback) => {
        var sql = `SELECT COUNT(*) AS count FROM member WHERE email = ? AND password = PASSWORD(?)`
        connection.query(sql, [email, password], (err, result) => {
          if (err) {
            callback({err: 'QUERY', message: err})
          } else {
            if (result[0].count == 1) {
              callback(null, result[0].count)
            } else {
              callback({err: 'FAIL', message: 'LOGIN CREDENTIAL IS INCORRECT'})
            }
          }
        })
      }
    ],
    (err, result) => {
      if (err) {
        res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
      } else {
        res.json({ code: 200, v: 'v1', status: 'SUCCESS' })
      }
    })
  }
}

module.exports.signIn = signIn

const signUp = function (req, res) {
  var {
    email,
    password,
    password_retype,
    name
  } = req.body
  if (password !== password_retype) {
    res.json({ code: 400, v: 'v1', status: 'ERR_DIFFERENT_PASSWORD' })
  } else {
    async.waterfall([
      (callback) => {
        var sql = `SELECT COUNT(*) AS count FROM member WHERE email = ?`
        connection.query(sql, [email], (err, result) => {
          if (err) {
            callback({err: 'QUERY', message: err})
          } else {
            if (result[0].count == 1) {
              callback({err: 'LOGIC', message: 'ALREADY EXISTING MEMBER'})
            } else {
              callback(null, result[0].count)
            }
          }
        })
      },
      (results, callback) => {
        var sql = `INSERT INTO member(email, password, name) VALUES(?, ?, PASSWORD(?))`
        connection.query(sql, [email, password, name], (err, result) => {
          if (err) {
            callback({err: 'QUERY', message: err})
          } else {
            callback(null, result[0])
          }
        })
      }
    ],
    (err, result) => {
      if (err) {
        res.json({ code: 500, v: 'v1', status: 'ERR_SIGNUP', detail: err })
      } else {
        res.json({ code: 200, v: 'v1', status: 'SUCCESS' })
      }
    })
  }
}

module.exports.signUp = signUp