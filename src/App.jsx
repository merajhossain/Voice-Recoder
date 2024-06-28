import { useState } from 'react';
import './App.css'
import AudioRecoder from './components/AudioRecoder'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="card">
        <AudioRecoder />
      </div>
    </>
  )
}

export default App
