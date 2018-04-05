// @flow

import type { EthereumAddressT } from 'types/ethereum-general'
import type { EthereumRPCLogFilterT } from 'types/ethereum-filter'
import type { PrefixedHexT, HexT } from 'types/hex'

type EthereumBlockNumberParamT = number | 'latest' | 'pending' | 'earliest'

type FilterParamsT = {
  address?: EthereumAddressT,
  fromBlock?: EthereumBlockNumberParamT,
  toBlock?: EthereumBlockNumberParamT,
  topics?: $ReadOnlyArray<?PrefixedHexT | HexT>
}

// ---

const {
  formatHashWithPrefix,
  formatHashWithoutPrefix,
  numberToHex
} = require('utils/hex')

type LeftPadFilterTopicsParamT = PrefixedHexT => PrefixedHexT
const leftPadFilterTopicsParam: LeftPadFilterTopicsParamT = data =>
  // data is always 32 bytes (64 chars) long
  formatHashWithPrefix(formatHashWithoutPrefix(data).padStart(64, '0'))

type FormatFilterParamsT = FilterParamsT => EthereumRPCLogFilterT
const formatFilterParams: FormatFilterParamsT = params => {
  const formatted = {}
  if (params.address) formatted.address = params.address

  if (params.fromBlock)
    formatted.fromBlock =
      typeof params.fromBlock === 'number'
        ? numberToHex(params.fromBlock)
        : params.fromBlock

  if (params.toBlock)
    formatted.toBlock =
      typeof params.toBlock === 'number'
        ? numberToHex(params.toBlock)
        : params.toBlock

  if (params.topics)
    formatted.topics = params.topics.map(
      // in the topics list, null is a wildcard
      x => (x == null ? x : leftPadFilterTopicsParam(x))
    )

  // $FlowIgnore: there might be an empty object here, and flow treats its as "unsealed"
  return formatted
}

module.exports = {
  formatFilterParams,
  leftPadFilterTopicsParam
}
