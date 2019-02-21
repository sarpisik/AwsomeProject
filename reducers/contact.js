const INITIAL_STATE = {
  contacts: null
}

const applySetContact = (state, action) => ({
  ...state,
  contacts: action.contacts
})

function contactReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'CONTACT_SET': {
      return applySetContact(state, action)
    }
    default:
      return state
  }
}

export default contactReducer
