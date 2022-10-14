import {useState} from "react";

const instruction = (intention, myName) =>
  `#### Write an email from the intention

## intention:

${intention}

## from: ${myName}

## email:`

function App() {
  // if "key" in localStorage, use it, else empty string
  const [key, setKey] = useState(localStorage.getItem("key") || "");
  const [myName, setMyName] = useState(localStorage.getItem("myName") || "");
  const [intention, setIntention] = useState("");
  const [output, setOutput] = useState("");

  // save apikey in localstorage
  const saveKey = (e) => {
    e.preventDefault();
    localStorage.setItem("key", key);
  }

  const saveMyName = (e) => {
    e.preventDefault();
    localStorage.setItem("myName", myName);
  }

  const submit = async (e) => {
    e.preventDefault();

    const data = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-davinci-002',
        prompt: instruction(intention, myName),
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    }).then(res => res.json())

    setOutput(data.choices[0].text.trim())
  }

  return (
    <form
      onSubmit={submit}
      style={{display: "flex", flexDirection: "column", maxWidth: 800, margin: "2rem"}}
    >

      <label htmlFor="api-key">Api Key</label>
      <div style={{display: "flex", flexWrap: "nowrap"}}>
        <input id="api-key" type="text" value={key} onChange={(e) => setKey(e.target.value)} style={{width: "100%"}}/>
        <button type="button" onClick={saveKey}>save</button>
      </div>

      <div style={{height: "2rem"}}/>

      <label htmlFor="my-name">My Name</label>
      <div style={{display: "flex", flexWrap: "nowrap"}}>
        <input id="my-name" type="text" value={myName} onChange={(e) => setMyName(e.target.value)}
               style={{width: "100%"}}/>
        <button type="button" onClick={saveMyName}>save</button>
      </div>

      <div style={{height: "2rem"}}/>

      <label htmlFor="intention">Intention</label>
      <textarea id="intention" rows={10} value={intention} onChange={(e) => setIntention(e.target.value)}/>

      <div style={{height: "2rem"}}/>

      <button type="submit">Submit</button>

      <div style={{height: "2rem"}}/>

      <label htmlFor="intention">Output</label>
      <textarea id="intention" rows={10} value={output} onChange={(e) => setOutput(e.target.value)}/>
    </form>
  );
}

export default App;
