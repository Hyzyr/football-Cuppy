import React, { useEffect, useState, useRef } from "react";
import { GroupedVirtuoso } from "react-virtuoso";
import { keypress } from "./SelectVirtuoso";

const SelectVirtuosoGroup = ({
  data = [],
  placeholder = `Placeholder`,
  isMulti = true,
  closeMenuOnSelect = false,
  hideSelectedOptions = false,
  customLabel = null,
  closeAfterSelect = true,
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
  const onBlur = () => setFocused(false);
  const clearValue = () => {
    clearSelected();
    clearState();
  };

  const toggleActive = () => setActive(!isActive);
  const hasSelected = React.useMemo(
    () => selected && selected.length > 0,
    [selected]
  );
  const addItem = (data) => {
    if (closeMenuOnSelect) clearState();

    if (!isMulti) {
      let prevSelected = selected[0];
      setSelected([data]);
      updateOption(data.parentIndex, data.optionIndex, { selected: true });
      if (prevSelected)
        updateOption(prevSelected.parentIndex, prevSelected.optionIndex, {
          selected: false,
        });
      return;
    }
    if (value !== "" && closeAfterSelect) setValue("");

    setSelected([...selected, data]);
    updateOption(data.parentIndex, data.optionIndex, { selected: true });
  };
  const clearState = () => {
    setActive(false);
    setFocused(false);
    setValue("");
  };
  const clearSelected = () => {
    let newDataSet = [...dataSet];

    selected.forEach((item) => {
      newDataSet[item.parentIndex].options[item.optionIndex] = {
        ...newDataSet[item.parentIndex].options[item.optionIndex],
        ...item,
        selected: false,
      };
    });
    setDataSet(newDataSet);
    setSelected([]);
  };
  const deleteItem = (data) => {
    setSelected(selected.filter((item) => !isSameItem(item, data)));
    updateOption(data.parentIndex, data.optionIndex, { selected: false });
  };
  const updateOption = (parentIndex, optionIndex, data) => {
    let newDataSet = [...dataSet];
    newDataSet[parentIndex].options[optionIndex] = {
      ...newDataSet[parentIndex].options[optionIndex],
      ...data,
    };
    setDataSet(newDataSet);
  };
  const isSameItem = (item1, item2) =>
    item1.parentIndex === item2.parentIndex &&
    item1.optionIndex === item2.optionIndex &&
    item1.value === item2.value;

  const closeOnBlur = React.useCallback(
    (e) => {
      const maxDepth = 10;
      const isClosable = value === "";

      let parentElement = e.target;
      let outBox = true;
      for (let index = 0; index < maxDepth; index++) {
        parentElement = parentElement?.parentElement;
        if (!parentElement) break;
        else if (parentElement.classList?.length === 0) continue;
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
    if (isActive) document.addEventListener("click", closeOnBlur);
    else document.removeEventListener("click", closeOnBlur);
    return () => document.removeEventListener("click", closeOnBlur);
  }, [isActive, closeOnBlur]);

  useEffect(() => {
    const newData = data.map((element, parentIndex) => {
      let newElement = { ...element };
      newElement.options = element.options.map((element, optionIndex) => ({
        ...element,
        parentIndex,
        optionIndex,
      }));
      return newElement;
    });
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
    <div
      className={`select select--group ${isActive ? "active" : ""}`}
      ref={selectRef}
    >
      <div className={`select__box ${isFocused || isActive ? "focused" : ""}`}>
        {selected &&
          selected.map((item, i) =>
            !customLabel ? (
              <Item
                key={`${i}-${item.value}` ?? i}
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
  const [listAmounts, setListAmounts] = useState(null);
  const [listLabels, setListLabels] = useState(null);
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
    console.log("updateList");

    if (!data) return;

    const options = [];
    const labels = [];
    const amounts = data.map((element) => {
      labels.push(element.label);
      let optionsAmount = element.options.length;

      if (hasSelected && hideSelectedOptions) {
        let newData = element.options.filter((item) => {
          return item && item?.selected ? false : true;
        });
        options.push(...newData);
        return newData.length;
      }

      options.push(...element.options);
      return optionsAmount;
    });
    if (options.length > 0) {
      setListAmounts(amounts);
      setListLabels(labels);
      setListOptions(options);
    } else {
      setListAmounts([]);
      setListLabels([]);
      setListOptions([]);
    }
  };
  const searchList = () => {
    if (value && value !== "") {
      console.log("searchList > search");
      const labels = [];
      const options = [];
      const amounts = [];
      let trimmedValue = value.toString().trim();
      for (let index = 0; index < data.length; index++) {
        const element = data[index];
        const filterOptions = element.options.filter((item) => {
          if (hasSelected && hideSelectedOptions && item.selected) return false;
          if (value && value !== "") {
            let label = item.label?.toString() + "";
            label = label.toLowerCase();
            return label.startsWith(trimmedValue.toLowerCase());
          } else return item.selected ? false : true;
        });
        if (filterOptions.length > 0) {
          labels.push(element.label);
          options.push(...filterOptions);
          amounts.push(filterOptions.length);
        }
      }

      setListLabels(labels);
      setListOptions(options);
      setListAmounts(amounts);
    } else if (data) {
      console.log("searchList >> update >", value, value !== "");

      updateList();
    }
  };
  const dropStyle = React.useMemo(() => {
    if (!listOptions) return {};
    let style = {
      maxHeight: maxHeight,
    };
    if (listOptions.length < 15)
      style.height =
        listLabels.length * itemHeight + listOptions.length * itemHeight;

    return style;
    // eslint-disable-next-line
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
              scrollFunc();
            } else if (index < listOptions.length - 1) {
              updateOptions(index, { hover: false });
              let newData = updateOptions(index + 1, {
                hover: true,
              });
              setHoverItem([index + 1, newData]);
              document.removeEventListener("keydown", keyPressFunc);
              scrollFunc();
            }
          },
        ]);
    },
    // eslint-disable-next-line
    [hoverItem, listOptions?.length]
  );
  const scrollFunc = (addPixels = 0) => {
    if (!selectRef.current) return;
    const dropRef = selectRef.current.querySelector(".select__virtuoso");
    if (!dropRef) return;
    const hoverItemRef = dropRef.querySelector(".select__drop-option.hover");
    if (!hoverItemRef) return;
    let addN = addPixels >= 0 ? 0 : -itemHeight;
    const dropItemsArr = dropRef.querySelectorAll(".dropItem");
    for (let index = 0; index < dropItemsArr.length; index++) {
      const element = dropItemsArr[index];
      if (element === hoverItemRef) {
        if (
          addPixels >= 0 &&
          dropItemsArr[index + 1] &&
          dropItemsArr[index + 1].classList.contains("select__drop-title")
        ) {
          addN += itemHeight;
        } else if (
          addPixels < 0 &&
          dropItemsArr[index - 1] &&
          dropItemsArr[index - 1].classList.contains("select__drop-title")
        )
          addN += itemHeight * -1;

        break;
      }
    }

    dropRef.scrollTop = hoverItemRef?.offsetTop + addPixels + addN;
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
  }, [value, data]);

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
      <GroupedVirtuoso
        className="select__virtuoso"
        groupCounts={listAmounts}
        groupContent={(index) => <DropTitle text={listLabels[index]} />}
        itemContent={(index) => (
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
      className={
        `select__drop-option dropItem ` +
        `${data.selected ? " active" : ""}` +
        `${data.hover ? " hover" : ""}`
      }
      onClick={onClick}
    >
      {data?.label}
    </div>
  );
};
const DropTitle = ({ text }) => (
  <div className="select__drop-title dropItem">{text}</div>
);

export default SelectVirtuosoGroup;
