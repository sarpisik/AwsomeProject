const INITIAL_STATE = {
  messages: null,
  limit: 5
}

const applySetMessages = (state, action) => {
  let isMessagesExist =
    state.messages &&
    state.messages.filter(chatObj => chatObj.path !== action.messages.path)

  console.log('----isMessagesExist ,', isMessagesExist)
  // console.log('action from action ,', action, isActionExist)
  if (isMessagesExist) {
    isMessagesExist.push(action.messages)
    return {
      ...state,
      messages: isMessagesExist
    }
  }

  if (!isMessagesExist) {
    state.messages = [action.messages]
    return {
      ...state,
      messages: state.messages
    }
  }

  // if (!state.messages) {
  //   state.messages = []
  //   state.messages.push(action.messages)
  //   return {
  //     ...state
  //   }
  // }

  // state.messages.push(action.messages)
  // return {
  //   ...state
  // }
}

const applySetMessagesLimit = (state, action) => ({
  ...state,
  limit: action.limit
})

function messageReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'MESSAGES_SET': {
      return applySetMessages(state, action)
    }
    case 'MESSAGES_LIMIT_SET': {
      return applySetMessagesLimit(state, action)
    }
    case 'AUTH_USER_SET': {
      return { ...state, ...INITIAL_STATE }
    }
    default:
      return state
  }
}

export default messageReducer
