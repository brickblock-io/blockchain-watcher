// @flow

type FirstT = (Array<*>) => *
const first: FirstT = xs => xs[0]

type IsEmptyT = (Array<*>) => boolean
const isEmpty: IsEmptyT = xs => xs.length === 0

module.exports = {
  first,
  isEmpty
}
