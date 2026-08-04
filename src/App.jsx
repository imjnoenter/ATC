import { useAppReducer } from './hooks/useAppReducer.js'
import { useFlights } from './hooks/useFlights.js'
import { useTheme } from './hooks/useTheme.js'
import HomeScreen from './screens/HomeScreen.jsx'
import FormGuideScreen from './screens/FormGuideScreen.jsx'
import DoneScreen from './screens/DoneScreen.jsx'

export default function App() {
  const { state, dispatch } = useAppReducer()
  const { flights, warnings, loading, error, reload } = useFlights()
  const { dark, toggle } = useTheme()
  const { screen, nickname, selectedName, selectedFlight, progress } = state

  const themeProps = { onThemeToggle: toggle, dark }

  if (screen === 'home') {
    return (
      <HomeScreen
        flights={flights}
        warnings={warnings}
        loading={loading}
        error={error}
        reload={reload}
        progress={progress}
        nickname={nickname}
        selectedName={selectedName}
        onNicknameChange={v => dispatch({ type: 'SET_NICKNAME', payload: v })}
        onSelectName={name => dispatch({ type: 'SET_SELECTED_NAME', payload: name })}
        onClearName={() => dispatch({ type: 'CLEAR_NAME' })}
        onSelectFlight={flight => dispatch({ type: 'SELECT_FLIGHT', payload: flight })}
        onToggleDone={flightId => dispatch({ type: 'TOGGLE_DONE', payload: { flightId } })}
        themeProps={themeProps}
      />
    )
  }

  if (screen === 'formGuide') {
    return (
      <FormGuideScreen
        flight={selectedFlight}
        onComplete={() => dispatch({ type: 'COMPLETE' })}
        onBack={() => dispatch({ type: 'BACK_HOME' })}
        themeProps={themeProps}
      />
    )
  }

  if (screen === 'done') {
    return (
      <DoneScreen
        flight={selectedFlight}
        onBackHome={() => dispatch({ type: 'BACK_HOME' })}
        themeProps={themeProps}
      />
    )
  }

  return null
}
