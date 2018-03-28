// @flow

import type { PrefixedHexT, HexT } from 'types/hex'

// ---

type FormatHashWithoutPrefixT = PrefixedHexT => HexT
const formatHashWithoutPrefix: FormatHashWithoutPrefixT = x =>
  x.replace(/^0x(.*)$/, '$1')

type FormatHashWithPrefixT = HexT => PrefixedHexT
const formatHashWithPrefix: FormatHashWithPrefixT = x => `0x${x}`

type NumberToHexT = number => PrefixedHexT
const numberToHex: NumberToHexT = x =>
  formatHashWithPrefix(x.toString(16).padStart(2, '0'))

type HexToIntT = HexT => number
const hexToNumber: HexToIntT = hex => Number.parseInt(hex, 16)

module.exports = {
  formatHashWithoutPrefix,
  formatHashWithPrefix,
  hexToNumber,
  numberToHex
}
