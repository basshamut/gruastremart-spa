import {useState} from 'react'
import LoginForm from "./common/LoginForm.jsx";
import Location from "./Location.jsx";

function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <div className="text-red-950">Esto debería ser rojo</div>
            <Location/>
        </>
    )
}

export default App
