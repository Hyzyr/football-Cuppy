import React from "react";
import {
  testDataForVirtuoso,
  testDataForVirtuosoGroup,
} from "store/controllers/tetsData";
import SelectVirtuoso from "./SelectVirtuoso";
import SelectVirtuosoGroup from "./SelectVirtuosoGroup";

const Items = () => {
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
                <SelectVirtuosoGroup data={testDataForVirtuosoGroup} />
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
                <SelectVirtuoso data={testDataForVirtuoso} />
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Items;
