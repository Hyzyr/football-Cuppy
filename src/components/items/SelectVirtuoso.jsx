import React, { useEffect, useState, useRef } from "react";
import { Virtuoso } from "react-virtuoso";

const SelectVirtuoso = ({
  data = [],
  placeholder = `Placeholder`,
  isMulti = true,
  closeMenuOnSelect = false,
  hideSelectedOptions = false,
  closeAfterSelect = true,
  customLabel = null,
  itemHeight = 40,
  maxHeight = "40vh",
  closeIfEmpty = false,
}) => {
  const selectRef = useRef(null);
  const [isActive, setActive] = useState(false);
  const [value, setValue] = useState("");
  const [isFocused, setFocused] = useState(false);
  const [selected, setSelected] = useState([]);
  const [dataSet, setDataSet] = useState(null);

  const onChange = (e) => setValue(e.target.value);
  const onFocus = () => setFocused(true);
  const onBlur = () => {
    if (value === "") setFocused(false);
  };
  const toggleActive = () => {
    setActive(!isActive);
  };
  const clearValue = () => {
    clearSelected();
    clearState();
  };
  const hasSelected = React.useMemo(
    () => selected && selected.length > 0,
    [selected]
  );
  const addItem = (data) => {
    if (closeMenuOnSelect) {
      clearState();
      if (value !== "" && closeAfterSelect) setValue("");
    }

    if (!isMulti) {
      let prevSelected = hasSelected ? selected[0] : null;
      setSelected([data]);
      updateOption(data.optionIndex, { selected: true });
      if (prevSelected) {
        updateOption(prevSelected.optionIndex, {
          selected: false,
        });
      }
      return;
    }
    setSelected([...selected, data]);
    updateOption(data.optionIndex, { selected: true });
  };
  const clearState = () => {
    setActive(false);
    setFocused(false);
    setValue("");
  };
  const clearSelected = () => {
    let newDataSet = [...dataSet];

    selected.forEach((item) => {
      newDataSet[item.optionIndex].selected = false;
    });
    setDataSet(newDataSet);
    setSelected([]);
  };
  const deleteItem = (data) => {
    setSelected(selected.filter((item) => !isSameItem(item, data)));
    updateOption(data.optionIndex, { selected: false });
  };
  const updateOption = (optionIndex, data) => {
    setDataSet((set) => {
      let newDataSet = [...set];
      newDataSet[optionIndex] = {
        ...newDataSet[optionIndex],
        ...data,
      };
      return newDataSet;
    });
  };
  const isSameItem = (item1, item2) =>
    item1.parentIndex === item2.parentIndex && item1.value === item2.value;

  const closeOnBlur = React.useCallback(
    (e) => {
      const maxDepth = 10;
      const isClosable = value === "";

      let parentElement = e.target ?? e.srcElement;
      let outBox = true;
      for (let index = 0; index < maxDepth; index++) {
        parentElement = parentElement?.parentElement;
        if (!parentElement) {
          break;
        } else if (parentElement.classList?.length === 0) continue;
        else if (parentElement === selectRef.current) {
          outBox = false;
          break;
        }
      }
      if (outBox && isClosable) {
        setActive(false);
      }
    },
    [value]
  );

  useEffect(() => {
    if (isActive) {
      document.addEventListener("click", closeOnBlur);
    } else {
      document.removeEventListener("click", closeOnBlur);
    }

    return () => {
      document.removeEventListener("click", closeOnBlur);
    };
  }, [isActive, closeOnBlur]);

  useEffect(() => {
    const newData = data.map((element, optionIndex) => ({
      ...element,
      optionIndex,
    }));
    setDataSet(newData);
  }, [data]);

  useEffect(() => {
    if (isActive && selected.length === 0 && closeIfEmpty) {
      setActive(false);
      setValue("");
    }
    // eslint-disable-next-line
  }, [selected, closeIfEmpty]);

  useEffect(() => {
    if (value && value !== "") setActive(true);
  }, [value]);

  const deleteWithDelay = (data) => () => {
    setTimeout(() => deleteItem(data), 10);
  };

  return (
    <div className={`select ${isActive ? "active" : ""}`} ref={selectRef}>
      <div className={`select__box ${isFocused || isActive ? "focused" : ""}`}>
        {selected &&
          selected.map((item, i) =>
            !customLabel ? (
              <Item
                key={item.value ?? i}
                title={item.label}
                deleteFunc={deleteWithDelay(item)}
              />
            ) : (
              <React.Fragment key={item.value}>
                {customLabel(item.label)}
              </React.Fragment>
            )
          )}

        {!(!isMulti && selected && selected?.length > 0) && (
          <div className="select__box-input">
            <input
              type="text"
              placeholder={!hasSelected ? placeholder : ""}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}
        {(value !== "" || hasSelected) && (
          <button
            type="button"
            className="select__box-clear"
            onClick={clearValue}
          >
            <span className="custIcon custIcon--cross"></span>
          </button>
        )}
        <button
          type="button"
          className="select__box-arrow"
          onClick={toggleActive}
        >
          <span className="custIcon custIcon--bottom"></span>
        </button>
      </div>
      {isActive && (
        <Drop
          valueState={[value, setValue]}
          data={dataSet}
          hasSelected={hasSelected}
          setSelected={setSelected}
          hideSelectedOptions={hideSelectedOptions}
          setActive={setActive}
          isMulti={isMulti}
          addItem={addItem}
          deleteItem={deleteItem}
          itemHeight={itemHeight}
          maxHeight={maxHeight}
          selectRef={selectRef}
        />
      )}
    </div>
  );
};

const Item = ({ title, deleteFunc }) => (
  <div className="select__box-selected">
    {title}
    <button type="button" onClick={deleteFunc}>
      <span className="custIcon custIcon--cross"></span>
    </button>
  </div>
);

const Drop = ({
  data,
  valueState,
  addItem,
  deleteItem,
  hasSelected,
  hideSelectedOptions,
  itemHeight,
  maxHeight,
  selectRef,
}) => {
  const [value] = valueState;
  const [listOptions, setListOptions] = useState(null);
  const [hoverItem, setHoverItem] = useState(null);

  const updateOptions = (index, data) => {
    let newData = null;
    setListOptions((set) => {
      let newDataSet = [...set];
      newDataSet[index] = {
        ...newDataSet[index],
        ...data,
      };
      newData = newDataSet[index];
      return newDataSet;
    });
    return newData;
  };
  const updateList = () => {
    if (!data) return;
    const options = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if (hasSelected && hideSelectedOptions && element?.selected) {
        continue;
      }

      options.push(element);
    }

    if (options.length > 0) {
      setListOptions(options);
    } else setListOptions([]);
  };
  const searchList = () => {
    if (value && value !== "") {
      const options = [];
      let trimmedValue = value.toString().trim();
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (hasSelected && hideSelectedOptions && element.selected) continue;
        let label = element.label?.toString() + "";
        label = label.toLowerCase();
        if (label.startsWith(trimmedValue.toLowerCase())) options.push(element);
      }

      setListOptions(options);
    } else if (data) {
      updateList();
    }
  };

  const dropStyle = React.useMemo(() => {
    if (!listOptions) return {};
    let style = {
      maxHeight: maxHeight,
    };
    if (listOptions.length < 15) style.height = listOptions.length * itemHeight;

    return style;
  }, [listOptions, maxHeight, itemHeight]);
  const keyPressFunc = React.useCallback(
    (event) => {
      let index = hoverItem && hoverItem[0] ? hoverItem[0] : 0;
      let data = listOptions ? listOptions[index] : null;

      if (listOptions.length > 0)
        keypress(event, [
          // enter key pressed
          () => {
            addItem(data);
          },
          // up key pressed
          () => {
            if (hoverItem === null) {
              let newData = updateOptions(index, {
                hover: true,
              });
              setHoverItem([index, newData]);
              document.removeEventListener("keydown", keyPressFunc);
              scrollFunc(-1 * itemHeight);
            } else if (index !== 0) {
              updateOptions(index, { hover: false });
              let newData = updateOptions(index - 1, {
                hover: true,
              });
              setHoverItem([index - 1, newData]);
              document.removeEventListener("keydown", keyPressFunc);
              scrollFunc(-1 * itemHeight);
            }
          },
          // down key pressed
          () => {
            if (hoverItem === null) {
              let newData = updateOptions(index, {
                hover: true,
              });
              setHoverItem([index, newData]);
              document.removeEventListener("keydown", keyPressFunc);
              scrollFunc(itemHeight);
            } else if (index < listOptions.length - 1) {
              updateOptions(index, { hover: false });
              let newData = updateOptions(index + 1, {
                hover: true,
              });
              setHoverItem([index + 1, newData]);
              document.removeEventListener("keydown", keyPressFunc);
              scrollFunc(itemHeight);
            }
          },
        ]);
    },
    // eslint-disable-next-line
    [hoverItem, listOptions?.length]
  );

  const scrollFunc = (addPixels) => {
    if (!selectRef.current) return;
    const dropRef = selectRef.current.querySelector(".select__virtuoso");
    if (!dropRef) return;
    const hoverItemRef = dropRef.querySelector(".select__drop-option.hover");
    if (!hoverItemRef) return;

    dropRef.scrollTop = hoverItemRef?.offsetTop + addPixels;
  };

  useEffect(() => {
    document.addEventListener("keydown", keyPressFunc);

    return () => {
      document.removeEventListener("keydown", keyPressFunc);
    };
  }, [keyPressFunc]);

  useEffect(() => {
    updateList();
    // eslint-disable-next-line
  }, [data]);

  useEffect(() => {
    searchList();
    // eslint-disable-next-line
  }, [value]);

  useEffect(() => {
    setHoverItem(null);
    // eslint-disable-next-line
  }, [value]);

  if (!listOptions || listOptions.length === 0)
    return (
      <div className="select__drop select__drop--empty">
        <div className="select__drop-empty">No options</div>
      </div>
    );

  return (
    <div className="select__drop" style={dropStyle}>
      <Virtuoso
        className="select__virtuoso"
        data={listOptions}
        totalCount={listOptions.length}
        itemContent={(index, a) => (
          <DropItem
            data={listOptions[index]}
            addOption={addItem}
            removeOption={deleteItem}
          />
        )}
      />
    </div>
  );
};

const DropItem = ({ data, addOption, removeOption }) => {
  const onClick = () => {
    if (data.selected) removeOption(data);
    else addOption(data);
  };
  return (
    <div
      className={`select__drop-option dropItem ${
        data.selected ? "active" : ""
      }  ${data.hover ? "hover" : ""}`}
      onClick={onClick}
    >
      {data?.label}
    </div>
  );
};

export const keypress = (event, functionsArray) => {
  const [enterFunc, upFunc, downFunc] = functionsArray;

  switch (event.keyCode) {
    case 13:
      enterFunc();
      break;
    case 38:
      upFunc();
      break;
    case 40:
      downFunc();
      break;
    default:
      break;
  }
};

export default SelectVirtuoso;
