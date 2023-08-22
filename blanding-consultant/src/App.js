import { useState, useId } from 'react';
import './App.css';
import ScaleLoader from "react-spinners/ScaleLoader"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">The Blanding Consultant</h1>
        <h2 className="App-description">Wodehouse character generator</h2>
      </header>
      <div className="App-body">
        <NameTable />
      </div>
      <footer className="App-footer">
      Made by <a href="https://andyholt.github.io">Andy Holt</a> <span className="Separator-dot"></span> <a href="https://github.com/AndyHolt/the-blanding-consultant">Github</a>
      </footer>
    </div>
  );
}

function NameTable() {
  const [names, setNames] = useState([]);
  const [absurdity, setAbsurdity] = useState("Medium");
  const [prefix, setPrefix] = useState("");
  const [generating, setGenerating] = useState(false);
  
  function handleClick() {
    setGenerating(true);
    let url = new URL("http://127.0.0.1:5000");
    let params = new URLSearchParams(url);
    params.set("absurdity", absurdity);
    if (prefix !== "") {
      params.set("prefix", prefix);
    }
    let fullUrl = url.toString() + "?" + params.toString();
    fetch(fullUrl,{
      'methods': 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(response => addNewNameToList(response))
      .catch(error => console.log(error))
  }

  function addNewNameToList(newName) {
    const nextNames = [...names];
    nextNames.splice(0, 0, newName)
    while (nextNames.length > 5) {
      nextNames.pop()
    }
    setNames(nextNames);
    setGenerating(false);
  }

  function handlePrefixChange(e) {
    setPrefix(e.target.value);
  }

  function handleAbsurdityChange(e) {
    setAbsurdity(e.target.value);
  }

  return (
    <div className="Name-table">
      <UserControls
        onNameButtonClick={() => handleClick()}
        absurdity={absurdity}
        onAbsurdityChange={(e) => handleAbsurdityChange(e)}
        prefix={prefix}
        onPrefixChange={e => handlePrefixChange(e)}
        generating={generating}
      />
      <ResultTable className="Result-table" names={names} />
    </div>
  );
}

function UserControls({ onNameButtonClick, absurdity, onAbsurdityChange, prefix, onPrefixChange, generating }) {
  return (
    <>
      <button className="Name-button" onClick={onNameButtonClick} >
      {generating ? "Creating" : "Create Name"}
      <ScaleLoader
        className="Loading-display"
        loading={generating}
        color="#282c34"
        height={20}
        width={4}
        radius={2}
      />
      </button>
      <div className="Advanced-controls">
      <AdvancedUserControls
        className="Advanced-controls"
        absurdity={absurdity}
        onAbsurdityChange={onAbsurdityChange}
        prefix={prefix}
        onPrefixChange={onPrefixChange}
      />
      </div>
      </>
  );
}

function AdvancedUserControls({ absurdity, onAbsurdityChange, prefix, onPrefixChange }) {
  const [advancedControlsActive, setAdvancedControlsActive] = useState(false);

  function handleAdvancedClick() {
    setAdvancedControlsActive(!advancedControlsActive);
  }

  return (
      <div className="Advanced-user-options-container">
      <div className="Advanced-user-options-header" onClick={() => handleAdvancedClick()}>
      Advanced options {advancedControlsActive ? "⊖" : "⊕"}
        </div>
      {advancedControlsActive ? (
          <AdvancedUserOptions
        absurdity={absurdity}
        onAbsurdityChange={onAbsurdityChange}
        prefix={prefix}
        onPrefixChange={onPrefixChange}
          />
      ) : (
        <div className="Advanced-user-controls-hidden"></div>
      )
      }
      </div>
      );
}

function AdvancedUserOptions({ absurdity, onAbsurdityChange, prefix, onPrefixChange}) {
  const absurditySelectId = useId();
  const prefixInputId = useId();

  return (
      <form className="Advanced-user-controls-container">
      <div className="Absurdity-control">
      <label htmlFor={absurditySelectId}>Absurdity:</label>
      <select
    name="absurdity"
    id={absurditySelectId}
    value={absurdity}
    onChange={onAbsurdityChange}
      >
      <option value="Low">Low</option>
      <option value="Medium">Medium</option>
      <option value="High">High</option>
      </select>
      </div>
      <div className="Prefix-control">
      <label htmlFor={prefixInputId}> Begins with: </label>
      <input
    id={prefixInputId}
    name="prefix"
    type="text"
    value={prefix}
    onChange={onPrefixChange}
      />
      </div>
      </form>
  );
}

function ResultTable({ names }) {
  const resultTable = [];

  if (names.length > 0) {
    resultTable.push(
        <Result name={names[0]} isCurrent="True" />
    );
  }
  if (names.length > 1) {
    for (let i = 1; i < names.length ; i++) {
      resultTable.push(
          <Result name={names[i]} isCurrent="False" />
      );
    }
  }

  return (
    <div className="Result-table">
      {resultTable}
    </div>
  );
}

function Result({ name, isCurrent }) {
  let resultType = "";
  // let usePrefix = null;

  if (isCurrent === "True") {
    resultType = "Current-result";
  } else {
    resultType = "Previous-result";
  }
 
  return (
      <div className={resultType}>
      <div className="Result-name">{name.name}</div>
      <div className="Result-info">
      <div className="Result-absurdity">Absurdity: {name.absurdity}</div>
      <ResultPrefix prefix={name.prefix} />
      </div>
    </div>
  );
}

function ResultPrefix({ prefix }) {
  if (prefix === null) {
    return (
      <div className="Result-prefix"></div>
    );
  } else {
    return (
        <div className="Result-prefix">Prefix: {prefix}</div>
    );
  }
  
}

export default App;
