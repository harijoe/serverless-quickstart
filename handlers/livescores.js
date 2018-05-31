import middy from 'middy'
import { jsonBodyParser, doNotWaitForEmptyEventLoop, httpHeaderNormalizer } from 'middy/middlewares'
import normalizedResponse from '../middlewares/normalizedResponse'
import axios from 'axios'
import { doc as dynamoDb } from 'serverless-dynamodb-client'
import fetchRetry from '../utils/fetchRetry'

const livescoresHandler = async (event, context, callback) => {
  const { data: { data: { match: scores } } } = await fetchRetry(() => axios.get('scores/live.json'))
  // const { data: { data: { match: scores } } } = await fetchRetry(() => axios.get('scores/live.json', { params: { country: 85 }}))

  await dynamoDb.put({
    TableName : process.env.DYNAMODB_TABLE,
    Item: {
      id: 'livescores',
      timestamp: Date.now(),
      livescores: JSON.stringify(scores),
    }
  }).promise()

  return {
    statusCode: 200,
  }
};

export const livescores = middy(livescoresHandler)
  .use(httpHeaderNormalizer())
  .use(doNotWaitForEmptyEventLoop())
  .use(jsonBodyParser())
  .use(normalizedResponse())


const livescoresGetHandler = async (event, context, callback) => {
  const { Item: { livescores } } = await dynamoDb.get({
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: 'livescores',
    },
  }).promise()

  return {
    statusCode: 200,
    body: {
      livescores: JSON.parse(livescores),
    },
  }
};

export const livescoresGet = middy(livescoresGetHandler)
  .use(httpHeaderNormalizer())
  .use(doNotWaitForEmptyEventLoop())
  .use(jsonBodyParser())
  .use(normalizedResponse())
