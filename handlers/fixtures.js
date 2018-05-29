import middy from 'middy'
import { jsonBodyParser, doNotWaitForEmptyEventLoop, httpHeaderNormalizer } from 'middy/middlewares'
import normalizedResponse from '../middlewares/normalizedResponse'
import axios from 'axios'
import { doc as dynamoDb } from 'serverless-dynamodb-client'
import fetchRetry from '../utils/fetchRetry'

const fixturesHandler = async (event, context, callback) => {
  const { data: { data: { league: leagues } } } = await fetchRetry(() => axios.get('leagues/list.json', { params: { country: 85 }}))

  const leagueIds = leagues.map(o => o['id'])

  let countDone = 0
  let countTrying = 0
  const fixturesArray = await Promise.all(leagueIds.map(async id => {
    // TODO handle next_page
    countTrying++
    const { data: {data: { fixtures: result }}} = await fetchRetry(() => axios.get('fixtures/matches.json', { params: { league: id }}))
    countDone++
    return result
  }))

  const fixtures = [].concat.apply([], fixturesArray)
    .map(e => ({ ...e, dateObject: Date.parse(`${e.date}T${e.time}`)}))
    .sort((a,b) => a.dateObject - b.dateObject)
    .slice(0,10)


  await dynamoDb.put({
    TableName : process.env.DYNAMODB_TABLE,
    Item: {
      id: 'fixtures',
      timestamp: Date.now(),
      fixtures,
    }
  }).promise()

  return {
    statusCode: 200,
  }
};

export const fixtures = middy(fixturesHandler)
  .use(httpHeaderNormalizer())
  .use(doNotWaitForEmptyEventLoop())
  .use(jsonBodyParser())
  .use(normalizedResponse())


const fixturesGetHandler = async (event, context, callback) => {
  const { Item: { fixtures } } = await dynamoDb.get({
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: 'fixtures',
    },
  }).promise()

  return {
    statusCode: 200,
    body: {
      fixtures,
    },
  }
};

export const fixturesGet = middy(fixturesGetHandler)
  .use(httpHeaderNormalizer())
  .use(doNotWaitForEmptyEventLoop())
  .use(jsonBodyParser())
  .use(normalizedResponse())
