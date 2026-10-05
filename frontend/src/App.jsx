import axios from "axios"
import { useState } from "react"
import './App.css'

function App(){
  const[prompt, setPrompt] = useState("")
  const [result,setResult] = useState("")

  function handleChange(event){
    setPrompt(event.target.value)  
  }
  async function handleClick(){
    const res = await axios.post("http://127.0.0.1:8000/send-prompt",{
      text: prompt
    })
    setResult(res.data.response)
  }
  return(
    <div className="container">
      <h1>Gemini API Project</h1>
      <textarea placeholder="Enter the Prompt"onChange={handleChange}/>
      <button onClick={handleClick}>Get Response</button>
      <p>{result}</p>
    </div>  
  ) 
}

export default App