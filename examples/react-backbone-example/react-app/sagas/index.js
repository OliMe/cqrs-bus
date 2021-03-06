import { takeLatest, takeEvery } from 'redux-saga/effects'
import Api from '../services/api'
import { Types as SettlementTypes } from '../redux/settlement'
import { Types as AppTypes } from '../redux/app'
import { Types as UserTypes } from '../redux/user'
import * as settlement from './settlement'
import * as user from './user'
import { appMountedSaga } from './app'

const api = Api.create()

/**
 * Sagas generator.
 */
export function * sagas () {
  yield [
    takeLatest(SettlementTypes.REQUEST, settlement.getSettlementList, api),
    takeLatest(UserTypes.SUCCESS, settlement.getSettlementList, api),
    takeLatest(UserTypes.REQUEST, user.requestUserIp, api),
    takeLatest(UserTypes.GET_USER_IP, user.getUserIp),
    takeEvery(UserTypes.QUERY_USER_IP, user.respondOnQueryUserIp),
    takeEvery(SettlementTypes.SET_CURRENT, settlement.sendSettlement),
    takeEvery(AppTypes.MOUNTED, appMountedSaga),
  ]
}
