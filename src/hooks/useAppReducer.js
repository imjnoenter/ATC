import { useReducer, useEffect } from 'react'

const STORAGE_KEY = 'atc-app-state'

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const { nickname, selectedName, progress } = JSON.parse(raw)
    return {
      nickname: typeof nickname === 'string' ? nickname : '',
      selectedName: typeof selectedName === 'string' ? selectedName : null,
      progress: progress && typeof progress === 'object' ? progress : {},
    }
  } catch {
    return {}
  }
}

const initialState = {
  screen: 'home',
  nickname: '',
  selectedName: null,
  selectedFlight: null,
  progress: {},
  ...loadPersisted(),
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NICKNAME':
      return { ...state, nickname: action.payload, selectedName: null }

    case 'SET_SELECTED_NAME':
      return { ...state, selectedName: action.payload, nickname: action.payload }

    case 'CLEAR_NAME':
      return { ...state, nickname: '', selectedName: null }

    case 'SELECT_FLIGHT': {
      const flight = action.payload
      return {
        ...state,
        selectedFlight: flight,
        screen: 'formGuide',
        progress: { ...state.progress, [flight.id]: 'inProgress' },
      }
    }

    case 'TOGGLE_DONE': {
      const { flightId } = action.payload
      const progress = { ...state.progress }
      if (progress[flightId] === 'done') {
        delete progress[flightId]
      } else {
        progress[flightId] = 'done'
      }
      return { ...state, progress }
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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        nickname: state.nickname,
        selectedName: state.selectedName,
        progress: state.progress,
      }))
    } catch {}
  }, [state.nickname, state.selectedName, state.progress])

  return { state, dispatch }
}
