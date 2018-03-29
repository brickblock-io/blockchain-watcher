// @flow

type GetEnvVarT = string => string
const getEnvVar: GetEnvVarT = name => {
  if (!process.env[name]) throw Error(`process.env.${name} is missing`)

  return process.env[name]
}

module.exports = getEnvVar
