import React, { useEffect, useState, useRef } from "react";
import { Virtuoso } from "react-virtuoso";

const SelectVirtuoso = ({
  data = [],
  placeholder = `Placeholder`,
  isMulti = true,
  closeMenuOnSelect = false,
  hideSelectedOptions = false,
  customLabel = null,
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
  const clearValue = () => setValue("");
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
    setSelected([...selected, data]);
    updateOption(data.parentIndex, data.optionIndex, { selected: true });
  };
  const clearState = () => {
    setActive(false);
    setFocused(false);
    setValue("");
  };
  const deleteItem = (data) => {
    setSelected(selected.filter((item) => item?.value !== data?.value));
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
    if (isActive && selected.length === 0) {
      setActive(false);
      setValue("");
    }
  }, [selected]);
  useEffect(() => {
    if (value && value !== "") setActive(true);
    else setActive(false);
  }, [isFocused, value]);

  return (
    <div className={`select ${isActive ? "active" : ""}`} ref={selectRef}>
      <div className={`select__box ${isFocused || isActive ? "focused" : ""}`}>
        {selected &&
          selected.map((item, i) =>
            !customLabel ? (
              <Item
                key={item.value ?? i}
                title={item.label}
                deleteFunc={() => deleteItem(item)}
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
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        )}
        {value !== "" && (
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
      />
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
}) => {
  const [value, setValue] = valueState;
  const [listOptions, setListOptions] = useState(null);

  const updateList = () => {
    if (!data) return;

    const options = [];
    const labels = [];
    const amounts = data.map((element) => {
      labels.push(element.label);
      if (hasSelected && hideSelectedOptions) {
        let newData = element.options.filter((item) => {
          return item && item?.selected ? false : true;
        });
        options.push(...newData);
      } else options.push(...element.options);
      return element.options.length;
    });
    if (options.length > 0) {
      setListAmounts(amounts);
      setListLabels(labels);
      setListOptions(options);
    }
  };
  const searchList = () => {
    if (value && value !== "") {
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
      updateList();
    }
  };

  useEffect(() => {
    updateList();
  }, [data]);

  useEffect(() => {
    searchList();
  }, [value, data]);

  if (!listAmounts || !listLabels || !listOptions)
    return <div className="select__drop"></div>;

  return (
    <div className="select__drop">
      <Virtuoso
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
      className={`select__drop-option ${data.selected ? "active" : ""}`}
      onClick={onClick}
    >
      {data?.label}
    </div>
  );
};

export default SelectVirtuoso;
