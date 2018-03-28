// @flow

import type { AbiT, AbiTypeT } from 'types/ethereum-abi'
import type { PrefixedHexT } from 'types/hex'

// ---

const BN = require('bn.js')
const sha3 = require('js-sha3')
const rawDecode = require('ethereumjs-abi').rawDecode

const { formatHashWithPrefix, formatHashWithoutPrefix } = require('utils/hex')

// A handy functional utility, and helps get out of a tricky flow type due to
// FunctionAbiT.inputs and EventAbiT.inputs being arrays with different object shapes.
// the usual $ReadOnlyArray typing didn't work, but this did!
type PluckT = (string, $ReadOnlyArray<*>) => *
const pluck: PluckT = (prop, list) => list.map(x => x[prop])

type AbiToSignatureHashT = AbiT => PrefixedHexT
const abiToSignatureHash: AbiToSignatureHashT = abi => {
  const inputTypes = pluck('type', abi.inputs).join(',')
  const abiSignature = `${abi.name}(${inputTypes})`
  const signatureHash = formatHashWithPrefix(sha3.keccak_256(abiSignature))

  // function signature hashes are the first 4 bytes, however we already prefixed here
  // and must take 2 more bytes (slice of 10 instead of 8 chars)
  return abi.type === 'function' ? signatureHash.slice(0, 10) : signatureHash
}

type DecodeDataForAbiTypesT = (
  $ReadOnlyArray<AbiTypeT>,
  PrefixedHexT
) => $ReadOnlyArray<*>
const decodeDataForAbiTypes: DecodeDataForAbiTypesT = (types, data) =>
  rawDecode(types, new Buffer(formatHashWithoutPrefix(data), 'hex')).map(
    (decodedData, i) => {
      const type = types[i]

      // expecting to be using this data for indexing / database lookup
      // - addresses should be prefixed
      // - all bignumbers will be stored as strings
      if (type === 'address') {
        return formatHashWithPrefix(decodedData)
      } else if (decodedData.constructor === BN) {
        return decodedData.toString(10)
      }

      return decodedData
    }
  )

module.exports = {
  abiToSignatureHash,
  decodeDataForAbiTypes
}
