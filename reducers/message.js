const INITIAL_STATE = {
  messages: null
}

const applySetMessages = (state, action) => ({
  ...state,
  messages: {
    ...state.messages,
    [action.id]: action.messages
  }
})

function messageReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'MESSAGES_SET': {
      return applySetMessages(state, action)
    }
    default:
      return state
  }
}

export default messageReducer
