import {useRef, useState} from "react";
import {readEml} from "eml-parse-js";

const extractTextFromEmailHtml = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}


function App() {
  // if "key" in localStorage, use it, else empty string
  const [key, setKey] = useState(localStorage.getItem("key") || "");
  const [myName, setMyName] = useState(localStorage.getItem("myName") || "");
  const [theirEmailAddress, setTheirEmailAddress] = useState("");
  const [emlText, setEmlText] = useState("");
  const [emlHtml, setEmlHtml] = useState("");
  const [intention, setIntention] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emlEmailInputRef = useRef()

  // save apikey in localstorage
  const saveKey = (e) => {
    e.preventDefault();
    localStorage.setItem("key", key);
  }

  const saveMyName = (e) => {
    e.preventDefault();
    localStorage.setItem("myName", myName);
  }

  const handleEml = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const eml = e.target.result;
      readEml(eml, null, (err, data) => {
        const text = extractTextFromEmailHtml(data.html);

        setEmlHtml(data.html);

        setEmlText(`
        # subject: ${data.subject}
        
        # text: ${text}`);

        setTheirEmailAddress(data.from.email);
      });
    };
    reader.readAsText(file);
  };

  const clearEml = () => {
    setEmlText("");
    setTheirEmailAddress("");
    setEmlHtml("");
    emlEmailInputRef.current.value = "";
  }

  const instruction =
    `#### Write an email from the intention${emlText !== "" ? (`

## previous email text: ${emlText}`) : ""}

## intention: ${intention}

## from: ${myName}${theirEmailAddress !== "" ? (`

## to: ${theirEmailAddress}`) : ""}

## email:`

  const submit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const data = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-davinci-002',
        prompt: instruction,
        temperature: 0.7,
        max_tokens: 512,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    }).then(res => res.json())

    setOutput(data.choices[0].text.trim())

    setIsLoading(false);
  }

  return (
    <div style={{display: "flex"}}>
      <form
        onSubmit={submit}
        style={{display: "flex", flexDirection: "column", margin: "2rem", width: "50%"}}
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

        <label htmlFor="file">Previous emails (.eml)</label>

        <div style={{display: "flex", flexWrap: "nowrap"}}>
          <button type="button" onClick={clearEml}
                  disabled={emlEmailInputRef.current === undefined || emlEmailInputRef.current.value === ""}>
            clear
          </button>
          <input type="file" id="file" accept="application/vnd.sealed.eml" onChange={handleEml} ref={emlEmailInputRef}/>
        </div>

        <div style={{height: "2rem"}}/>

        <label htmlFor="intention">Intention</label>
        <textarea id="intention" rows={10} value={intention} onChange={(e) => setIntention(e.target.value)}/>

        <div style={{height: "2rem"}}/>

        <button type="submit" disabled={isLoading}>Submit</button>

        <div style={{height: "2rem"}}/>

        <label htmlFor="intention">Output</label>
        <textarea id="intention" rows={10} value={output} onChange={(e) => setOutput(e.target.value)}/>
      </form>
      <div style={{
        border: "1px solid black",
        margin: "2rem",
        width: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div
          style={{height: "3rem", backgroundColor: "black", color: "white", width: "100%"}}>Previous
          mail
        </div>
        <div style={{}}>
          <div dangerouslySetInnerHTML={{__html: emlHtml}}></div>
        </div>
      </div>
    </div>
  );
}

export default App;