const INITIAL_STATE = {
  messages: null,
  limit: 10
}

const applySetChats = (state, action) => {
  let newArray = state.messages ? state.messages.slice() : [].slice()
  newArray.splice(action.chat.index, 0, action.chat)
  return {
    ...state,
    messages: newArray
  }
}

const applySetMessages = (state, action) => {
  return {
    ...state,
    messages: state.messages.map(item => {
      if (item.index !== action.index) {
        return item
      }

      return {
        ...item,
        messagesList: [action.message, ...item.messagesList]
      }
    })
  }
}

const applyUpdateMessages = (state, action) => {
  action.messages.reverse()
  return {
    ...state,
    messages: state.messages.map(item => {
      if (item.path !== action.path) {
        return item
      }

      return {
        ...item,
        messagesList: [...item.messagesList, ...action.messages]
      }
    })
  }
}

const applyUpdateReadMessages = (state, action) => {
  return {
    ...state,
    messages: state.messages.map(item => {
      if (item.index !== action.index) {
        return item
      }

      return {
        ...item,
        messagesList: item.messagesList.map(message => {
          if (message.key !== action.key) {
            return message
          }

          return {
            ...message,
            isRead: action.isRead
          }
        })
      }
    })
  }
}

const applySetMessagesLimit = (state, action) => ({
  ...state,
  limit: action.limit
})

const removeSetMessagesLimit = state => ({
  ...state,
  limit: INITIAL_STATE.limit
})

function messageReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'CHATS_SET': {
      return applySetChats(state, action)
    }
    case 'MESSAGES_SET': {
      return applySetMessages(state, action)
    }
    case 'MESSAGES_UPDATE': {
      return applyUpdateMessages(state, action)
    }
    case 'MESSAGES_READ': {
      return applyUpdateReadMessages(state, action)
    }
    case 'RESET_CHATS': {
      return { ...state, ...INITIAL_STATE }
    }
    case 'AUTH_USER_SET': {
      return { ...state, ...INITIAL_STATE }
    }
    default:
      return state
  }
}

export default messageReducer
