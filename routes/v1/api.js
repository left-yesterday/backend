var mysql_dbc = require('../../config/db_con')()
var connection = mysql_dbc.init()
const async = require('async')
require('dotenv').config()
const upload = require('../util/upload');

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


const registItem = function (req, res) {
  var it_id = ""
  var key = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  for (var j = 0; j < 7; j++) {
    it_id += key.charAt(Math.floor(Math.random() * key.length))
  }
  
  var {
    mb_id,
    name,
    price,
    unavailable_start_date,
    unavailable_end_date,
    size,
    category,
    category_detail,
    quality,
    location
  } = req.body

  var image = ''

  if (!name || !mb_id || !price) {
    res.json({ code: 101, v: 'v1', status: 'PARAMETER_ERR' })
  } else {
    async.waterfall([
      (callback) => {
        //s3 파일 업로드 처리
        upload.upload(req, callback);
      },
      (locationArray, callback) => {
        // s3 image url
        image = locationArray[0];
        var sql = `INSERT INTO item (it_id, mb_id, name, unavailable_start_date, unavailable_end_date) VALUES (?, ?, ?, ?, ?)`
        connection.query(sql, [it_id, mb_id, name, unavailable_start_date, unavailable_end_date], (err, result) => {
          console.log(err)
          if (err) {
            callback({err: 'QUERY', message: err})
          } else {
            callback(null, result)
          }
        })
      },
      (result, callback) => {
        var params = [it_id, size, quality, price, location, category, category_detail, image];
        var sql = `INSERT INTO item_property (it_id, size, quality, price, location, category, category_detail, image) 
        VALUES (?)`
        connection.query(sql, [params], (err, result) => {
          console.log(err)

          if (err) {
            callback({err: 'QUERY', message: err})
          } else {
            callback(null, result)
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

module.exports.registItem = registItem


const searchItem = function (req, res) {
  var {
    quality,
    category,
    category_detail
  } = req.query

  var name = req.query.name
  console.log(name)
  async.waterfall([
    (callback) => {
      var sql = `SELECT i.it_id, mb_id, name, unavailable_start_date, unavailable_end_date, IF(date(NOW()) > unavailable_end_date || date(NOW()) < unavailable_start_date, 0, 1) AS available
      FROM item i
      JOIN item_property ip
      ON i.it_id = ip.it_id
      WHERE is_available = 1`
      var params = [];

      if(category){
        sql += ' AND category = ?'
        params.push(category)
      }

      if(quality){
        sql += ' AND quality = ?'
        params.push(quality)
      }

      if(category_detail){
        sql += ' AND category_detail = ?'
        params.push(category_detail)
      }

      if(name){
        sql += ` AND name like '%${name}%'`
      }

      connection.query(sql, [params], (err, result) => {
        console.log(sql)
        console.log(err)
        if (err) {
          callback({err: 'QUERY', message: err})
        } else {
            callback(null, result)
        }
      })
    }
  ],
  (err, result) => {
    if (err) {
      res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
    } else {
      res.json({ code: 200, v: 'v1', dataList:  result})
    }
  })
}
module.exports.searchItem = searchItem



const detailItem = function (req, res) {
  var {
    it_id
  } = req.params

  async.waterfall([
    (callback) => {
      var sql = `SELECT i.it_id, mb_id, name, unavailable_start_date, unavailable_end_date, size, quality, price, location, category, category_detail, image
      FROM item i
      JOIN item_property ip
      ON i.it_id = ip.it_id
      WHERE i.it_id = ?`

      connection.query(sql, [it_id], (err, result) => {
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
      res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
    } else {
      res.json({ code: 200, v: 'v1', data:  result})
    }
  })
}
module.exports.detailItem = detailItem

const getList = function (req, res) {

  async.waterfall([
    (callback) => {
      var sql = `SELECT i.it_id, mb_id, name, unavailable_start_date, unavailable_end_date, size, quality, price, location, category, category_detail, image,
      IF(date(NOW()) > unavailable_end_date || date(NOW()) < unavailable_start_date, 0, 1) AS available
      FROM item i
      JOIN item_property ip
      ON i.it_id = ip.it_id;`

      connection.query(sql, [], (err, result) => {
        if (err) {
          callback({err: 'QUERY', message: err})
        } else {
            callback(null, result)
        }
      })
    }
  ],
  (err, result) => {
    if (err) {
      res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
    } else {
      res.json({ code: 200, v: 'v1', dataList:  result})
    }
  })
}
module.exports.getList = getList


const order = function (req, res) {
  var {
    owner_mb_id,
    customer_mb_id,
    price,
    start_date,
    end_date,
    it_id
  } = req.query
  var params = [owner_mb_id, customer_mb_id, price, start_date, end_date, it_id]
  async.waterfall([
    (callback) => {
      var sql = `INSERT INTO item_property (owner_mb_id, customer_mb_id, price, start_date, end_date, it_id) 
      VALUES (?);`

      connection.query(sql, [params], (err, result) => {
        if (err) {
          callback({err: 'QUERY', message: err})
        } else {
            callback(null, result)
        }
      })
    }
  ],
  (err, result) => {
    if (err) {
      res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
    } else {
      res.json({ code: 200, v: 'v1', dataList:  result})
    }
  })
}
module.exports.order = order

const saleList = function (req, res) {
  var {
    mb_id
  } = req.params

  async.waterfall([
    (callback) => {
      var sql = `SELECT * FROM order WHERE owner_mb_id = ?`

      connection.query(sql, [mb_id], (err, result) => {
        if (err) {
          callback({err: 'QUERY', message: err})
        } else {
            callback(null, result)
        }
      })
    }
  ],
  (err, result) => {
    if (err) {
      res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
    } else {
      res.json({ code: 200, v: 'v1', dataList:  result})
    }
  })
}
module.exports.saleList = saleList


const rentList = function (req, res) {
  var {
    mb_id
  } = req.params

  async.waterfall([
    (callback) => {
      var sql = `SELECT * FROM order WHERE customer_mb_id = ?`

      connection.query(sql, [mb_id], (err, result) => {
        if (err) {
          callback({err: 'QUERY', message: err})
        } else {
            callback(null, result)
        }
      })
    }
  ],
  (err, result) => {
    if (err) {
      res.json({ code: 500, v: 'v1', status: 'ERR_SIGNIN', detail: err })
    } else {
      res.json({ code: 200, v: 'v1', dataList:  result})
    }
  })
}
module.exports.rentList = rentList