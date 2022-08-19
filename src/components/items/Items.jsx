import React from "react";
import {
  testDataForVirtuoso,
  testDataForVirtuosoGroup,
} from "store/controllers/tetsData";
import SelectVirtuoso from "./SelectVirtuoso";
import SelectVirtuosoGroup from "./SelectVirtuosoGroup";

const Items = () => {
  const numbersArr = [
    {
      label: "1",
      value: "1",
    },
    {
      label: "2",
      value: "2",
    },
    {
      label: "3",
      value: "3",
    },
    {
      label: "4",
      value: "4",
    },
    {
      label: "5",
      value: "5",
    },
  ];
  const groupNumbers = [
    {
      label: "group 1",
      options: numbersArr,
    },
    {
      label: "group 2",
      options: numbersArr,
    },
  ];

  return (
    <div className="wrapper">
      <div className="wrapper__bg">
        <img src={global.assetsFolder + "images/bg.png"} alt="bg" />
      </div>
      <div className="auto__container">
        <div className="wrapper__inner">
          <div className="form">
            <div className="form__row">
              <div className="form__column">
                <SelectVirtuosoGroup
                  data={testDataForVirtuosoGroup}
                  hideSelectedOptions={true}
                  closeAfterSelect={false}
                />
              </div>
              <div className="form__column">
                <SelectVirtuosoGroup
                  data={testDataForVirtuosoGroup}
                  placeholder={`Select Players`}
                  isMulti={false}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={true}
                  customLabel={(value) => `Player ${value} selected`}
                />
              </div>
            </div>
            <div className="form__row">
              <div className="form__column">
                <SelectVirtuoso
                  data={testDataForVirtuoso}
                  hideSelectedOptions={true}
                />
              </div>
              <div className="form__column">
                <SelectVirtuoso
                  data={testDataForVirtuoso}
                  placeholder={`Select Players`}
                  isMulti={false}
                  closeMenuOnSelect={true}
                  hideSelectedOptions={true}
                  customLabel={(value) => (
                    <>
                      Custom text &nbsp;<b>{value}</b>&nbsp;
                    </>
                  )}
                />
              </div>
            </div>
            <div className="form__row">
              <div className="form__column">
                <SelectVirtuosoGroup data={groupNumbers} />
              </div>
              <div className="form__column">
                <SelectVirtuosoGroup
                  data={groupNumbers}
                  placeholder={`Select Players`}
                  isMulti={false}
                  closeMenuOnSelect={true}
                  customLabel={(value) => `Player ${value} selected`}
                />
              </div>
            </div>

            <div className="form__row">
              <div className="form__column">
                <SelectVirtuoso data={numbersArr} hideSelectedOptions />
              </div>
              <div className="form__column">
                <SelectVirtuoso
                  data={numbersArr}
                  placeholder={`Select Players`}
                  isMulti={false}
                  closeMenuOnSelect={true}
                  customLabel={(value) => (
                    <>
                      Custom text &nbsp;<b>{value}</b>&nbsp;
                    </>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Items;
