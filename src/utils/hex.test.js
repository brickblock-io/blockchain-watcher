// @flow

const test = require('ava')

const hexUtils = require('./hex')

test('hexUtils.formatHashWithoutPrefix will remove the prefix "0x" when present', t => {
  t.true(hexUtils.formatHashWithoutPrefix('0x123') === '123')
  t.true(hexUtils.formatHashWithoutPrefix('123') === '123')
})

test('hexUtils.formatHashWithPrefix will add the prefix "0x"', t => {
  t.true(hexUtils.formatHashWithPrefix('123') === '0x123')
})

test('hexUtils.numberToHex formats a number to hex', t => {
  t.true(hexUtils.numberToHex(0) === '0x00')
  t.true(hexUtils.numberToHex(123) === '0x7b')
})

test('hexUtils.hexToNumber formats a hex to number', t => {
  t.true(hexUtils.hexToNumber('0x00') === 0)
  t.true(hexUtils.hexToNumber('0x7b') === 123)
})
