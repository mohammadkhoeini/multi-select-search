import React from "react";
import logo from "./logo.svg";
import "./App.scss";
import MultiSelectSearch from "./component/MultiSelectSearch/MultiSelectSearch";

function App() {
  const loadData = async function (param: string = "") {
    const params = param !== "" ? "?name=" + param : "";
    let data = [];
    let error: string | boolean = false;
    try {
      const response = await fetch(
        "https://rickandmortyapi.com/api/character" + params
      );
      console.log(response);
      if (!response.ok) {
        error = "no match found";
      } else {
        data = await response.json();
        error = false;
      }
    } catch (error: any) {
      error = `${error} Could not Fetch Data `;
    }

    return { data, error };
  };
  return (
    <div className="App">
      <MultiSelectSearch getDataFn={loadData}></MultiSelectSearch>
    </div>
  );
}

export default App;
