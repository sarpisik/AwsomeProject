import { combineReducers } from 'redux'
import sessionReducer from './session'
import contactReducer from './contact'
import messageReducer from './message'

const rootReducer = combineReducers({
  sessionState: sessionReducer,
  contactState: contactReducer,
  messageState: messageReducer
})

export default rootReducer
