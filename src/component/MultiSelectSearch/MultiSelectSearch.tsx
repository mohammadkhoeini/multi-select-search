import React, { Ref, useEffect, useRef, useState } from "react";
import "./MultiSelectSearch.scss";
import useDebounce from "hooks/useDebounce";

type MultiSelectProps = {
  getDataFn: Function;
  placeholder?: string;
};

type ListItem = {
  name: string;
  id: number;
  img: string;
  episodes: number;
  checked: boolean;
};

type ListArray = ListItem[];

const MultiSelectSearch = (props: MultiSelectProps) => {
  const [cardIsOpen, setCardIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [inputText, setInputText] = useState<string>("");
  const [errorMessage, setErorrMessage] = useState<string | false>();

  const debouncedInputText = useDebounce(inputText);

  const [listOfOptions, setListOfOptions] = useState<ListArray>([]);
  const [selectedList, setSelectedList] = useState<ListArray>([]);

  // Used for Handling arrow keys
  const selectedItemsRef = useRef<any>([]);
  const inputRef = useRef<any>();
  const optionsListRef = useRef<any>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      let { data, error } = await props.getDataFn(debouncedInputText);
      console.log(data, error);
      setIsLoading(false);
      if (error === false) {
        const mapedData: ListArray = data.results.map((item: any): ListItem => {
          return {
            name: item.name,
            id: item.id,
            img: item.image,
            episodes: item.episode.length ?? 0,
            checked:
              selectedList.findIndex((selectedItem) => {
                return item.id === selectedItem.id;
              }) !== -1
                ? true
                : false,
          };
        });

        setListOfOptions([...mapedData]);
        setErorrMessage(false);
      } else {
        setErorrMessage(error);

        setListOfOptions([]);
      }
    };
    loadData();
  }, [debouncedInputText]);

  // Add if not check and remove if checked
  // then handle add or remove inside checked list as well
  const handleCheckBox = function (index: number) {
    listOfOptions[index].checked = !listOfOptions[index].checked;
    handleSelectedList(listOfOptions[index]);
    setListOfOptions([...listOfOptions]);
  };

  // handle add or remove from selected list
  const handleSelectedList = function (item: ListItem) {
    let indexOfRemovedItem = selectedList.findIndex((selectedItem) => {
      return item.id === selectedItem.id;
    });
    if (indexOfRemovedItem >= 0) {
      selectedList.splice(indexOfRemovedItem, 1);
      removeFromCheckedList(item);
      setSelectedList([...selectedList]);
    } else {
      setSelectedList([...selectedList, item]);
    }
  };

  // Handle uncheck from list of options
  // in case option exists in current data
  const removeFromCheckedList = function (item: ListItem) {
    let indexOfUncheckedItem = listOfOptions.findIndex(
      (uncheckedItem) => item.id === uncheckedItem.id
    );
    if (indexOfUncheckedItem < 0) return;
    listOfOptions[indexOfUncheckedItem].checked = false;
    setListOfOptions([...listOfOptions]);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  // get partial bolded text
  const boldedText = function (rawText: string) {
    const textToLowerCase: string = rawText.toLocaleLowerCase();
    const inputTextInLowercase = inputText.toLocaleLowerCase();
    if (inputText === "" || textToLowerCase.indexOf(inputTextInLowercase) < 0)
      return rawText;

    const val = (
      <>
        {rawText.slice(0, textToLowerCase.indexOf(inputTextInLowercase))}
        <b>
          {rawText.slice(
            textToLowerCase.indexOf(inputTextInLowercase),
            textToLowerCase.indexOf(inputTextInLowercase) +
              inputTextInLowercase.length
          )}
        </b>
        {rawText.slice(
          textToLowerCase.indexOf(inputTextInLowercase) +
            inputTextInLowercase.length,
          rawText.length
        )}
      </>
    );
    return val;
  };

  const handleKeyPressOnListOfOptions = function (
    e: React.KeyboardEvent<HTMLElement>,
    index: number
  ) {
    switch (e.code) {
      case "ArrowDown":
        if (index === optionsListRef.current.length - 1) return;
        optionsListRef.current[index + 1].focus();
        break;

      case "ArrowUp":
        if (index === 0) {
          inputRef.current.focus();
          break;
        }
        optionsListRef.current[index - 1].focus();
        break;

      case "Enter":
      case "Space":
        e.preventDefault();
        handleCheckBox(index);
        break;

      default:
        break;
    }
  };

  const handleKeyPressOnSelectedList = function (
    e: React.KeyboardEvent<HTMLElement>,
    index: number
  ) {
    switch (e.code) {
      case "ArrowDown":
      case "ArrowRight":
        if (index === selectedItemsRef.current.length - 1) {
          inputRef.current.focus();
          break;
        }
        selectedItemsRef.current[index + 1].focus();
        break;

      case "ArrowUp":
      case "ArrowLeft":
        if (index === 0) return;
        selectedItemsRef.current[index - 1].focus();
        break;

      case "Delete":
      case "Space":
        e.preventDefault();
        handleSelectedList(selectedList[index]);
        if (selectedItemsRef.current.length <= 1) {
          inputRef.current.focus();
        } else if (index === 0) {
          selectedItemsRef.current[1].focus();
        } else {
          selectedItemsRef.current[index - 1].focus();
        }
        break;

      default:
        break;
    }
  };

  const handleKeyPressOnInput = function (e: React.KeyboardEvent<HTMLElement>) {
    switch (e.code) {
      case "ArrowDown":
        optionsListRef.current[0].focus();
        break;

      case "ArrowUp":
        if (selectedItemsRef.current.length === 0) return;
        selectedItemsRef.current[selectedItemsRef.current.length - 1].focus();
        break;

      default:
        break;
    }
  };

  // update on change of selected List
  useEffect(() => {
    selectedItemsRef.current = selectedItemsRef.current.slice(
      0,
      selectedList.length
    );
  }, [selectedList]);

  // update on change of list of options
  useEffect(() => {
    optionsListRef.current = optionsListRef.current.slice(
      0,
      listOfOptions.length
    );
  }, [listOfOptions]);

  return (
    <div className="multi-select-search">
      <div
        className={
          "multi-select-input-container" + (cardIsOpen ? " card-open" : "")
        }
        onClick={() => setCardIsOpen(true)}
      >
        {selectedList?.map((item: ListItem, index: number) => {
          if (item.checked !== true) return null;
          return (
            <div
              ref={(el) => (selectedItemsRef.current[index] = el)}
              className="selected-items"
              key={"selected-" + item.id}
              tabIndex={0}
              onKeyDown={(e) => handleKeyPressOnSelectedList(e, index)}
            >
              {item.name}
              <span
                className="delete-btn"
                onClick={() => handleSelectedList(item)}
              >
                x
              </span>
            </div>
          );
        })}

        <input
          ref={inputRef}
          className="multi-select-input"
          type="text"
          onChange={handleInput}
          onFocus={() => setCardIsOpen(true)}
          onKeyDown={(e) => handleKeyPressOnInput(e)}
        />
      </div>

      {errorMessage !== false && (
        <div className="error-message">{errorMessage}</div>
      )}
      {cardIsOpen && !errorMessage && (
        <ul className="select-list">
          {isLoading && <span>Loading...</span>}
          {!isLoading &&
            listOfOptions?.map((item: ListItem, index: number) => {
              return (
                <li
                  ref={(el) => (optionsListRef.current[index] = el)}
                  onClick={() => handleCheckBox(index)}
                  key={item.id}
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyPressOnListOfOptions(e, index)}
                >
                  <input
                    type="checkbox"
                    name={item.name}
                    checked={item.checked}
                    tabIndex={-1}
                  />
                  <div className="checkbox-detail">
                    <img src={item.img} alt={item.name} />
                    <div className="checkbox-label">
                      {boldedText(item.name)} <br />
                      <span className="checkbox-label-episodes">
                        {item.episodes} Episodes
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
      {cardIsOpen && (
        <div className="overlap" onClick={() => setCardIsOpen(false)}></div>
      )}
    </div>
  );
};

export default MultiSelectSearch;
