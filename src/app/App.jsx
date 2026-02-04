import { useState } from 'react';
import Detour from '../features/detour/Detour';
import PlacesSuggest from '../features/suggest/PlacesSuggest';

function App() {
  const [view, setView] = useState('detour');

  if (view === 'suggest') {
    return <PlacesSuggest onBack={() => setView('detour')} />;
  }

  return <Detour onSuggest={() => setView('suggest')} />;
}

export default App;
