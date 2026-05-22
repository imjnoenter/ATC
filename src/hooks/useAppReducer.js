import { useReducer } from 'react'

const initialState = {
  screen: 'home',       // 'home' | 'formGuide' | 'done'
  nickname: '',
  selectedFlight: null,
  progress: {},         // { [flightId]: 'inProgress' | 'done' }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload }

    case 'SELECT_FLIGHT': {
      const flight = action.payload
      return {
        ...state,
        selectedFlight: flight,
        screen: 'formGuide',
        progress: { ...state.progress, [flight.id]: 'inProgress' },
      }
    }

    case 'COMPLETE':
      return {
        ...state,
        screen: 'done',
        progress: { ...state.progress, [state.selectedFlight.id]: 'done' },
      }

    case 'BACK_HOME':
      return { ...state, screen: 'home', selectedFlight: null }

    default:
      return state
  }
}

export function useAppReducer() {
  const [state, dispatch] = useReducer(reducer, initialState)
  return { state, dispatch }
}
