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

router.post('/item/search', function (req, res) {
  CLOSET_API.searchItem(req, res)
})

router.get('/item/detail', function (req, res) {
  CLOSET_API.detailItem(req, res)
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