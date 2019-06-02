const express = require('express')
const router = express.Router()

const CLOSET_API = require('./api')

router.get('/', function (req, res) {
  res.json({ code: 200, v: 'v1', status: 'OK' })
})

router.post('/auth/signin', function (req, res) {
  CLOSET_API.signIn(req, res)
})

router.post('/auth/signup', function (req, res) {
  CLOSET_API.signUp(req, res)
})

router.post('/item/regist', function (req, res) {
  CLOSET_API.registItem(req, res)
})

router.get('/item/search', function (req, res) {
  CLOSET_API.searchItem(req, res)
})

router.get('/item/detail/:it_id', function (req, res) {
  CLOSET_API.detailItem(req, res)
})

router.get('/list', function (req, res) {
  CLOSET_API.getList(req, res)
})

router.post('/order', function (req, res) {
  CLOSET_API.order(req, res)
})

router.get('/order/list/:mb_id', function (req, res) {
  CLOSET_API.orderList(req, res)
})

router.get('/order/sale/:mb_id', function (req, res) {
  CLOSET_API.saleList(req, res)
})

router.get('/order/rent/:mb_id', function (req, res) {
  CLOSET_API.rentList(req, res)
})


router.get('/notification/list', function (req, res) {
  CLOSET_API.listNotification(req, res)
})

router.post('/rental/apply', function (req, res) {
  CLOSET_API.applyRental(req, res)
})

router.post('/rental/approve', function (req, res) {
  CLOSET_API.approveRental(req, res)
})

router.post('/rental/decline', function (req, res) {
  CLOSET_API.declineRental(req, res)
})

router.get('/list/rentaled', function (req, res) {
  CLOSET_API.rentaledList(req, res)
})

router.get('/list/pending', function (req, res) {
  CLOSET_API.pendingList(req, res)
})

router.post('/favorite/add', function (req, res) {
  CLOSET_API.addFavorite(req, res)
})

module.exports = router