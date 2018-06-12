import middy from 'middy'
import { jsonBodyParser, httpHeaderNormalizer } from 'middy/middlewares'
import normalizedResponse from '@harijoe/middy-json-response-middleware'
import { doc as dynamoDb } from 'serverless-dynamodb-client'

const objectId = 'example'

const exampleScheduled = async (event, context, callback) => {

  await dynamoDb.put({
    TableName : process.env.DYNAMODB_TABLE,
    Item: {
      id: objectId,
      timestamp: Date.now(),
    }
  }).promise()

  return {
    statusCode: 200,
  }
};

export const example = middy(exampleScheduled)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(normalizedResponse())


const exampleGet = async (event, context, callback) => {
  const { Item: { timestamp } } = await dynamoDb.get({
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: objectId,
    },
  }).promise()

  return {
    statusCode: 200,
    body: {
      lastUpdate: timestamp,
    },
  }
};

export const fixturesGet = middy(exampleGet)
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .use(normalizedResponse())
