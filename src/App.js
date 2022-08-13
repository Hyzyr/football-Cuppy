import Loader from "components/items/Loader";
import React, { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { connect } from "react-redux";
import Items from "components/items/Items";

const App = ({ userLogged }) => {
  global.assetsFolder = process.env.PUBLIC_URL + "/assets/";

  const Login = React.lazy(() =>
    delayLazy(() => import("./components/login/Login"))
  );
  const Main = React.lazy(() =>
    delayLazy(() => import("./components/main/Main"))
  );

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {userLogged ? (
          <>
            <Route path={"/"} element={<Main />} />
            <Route path={"/*"} element={<Navigate to={"/"} />} />
          </>
        ) : (
          <>
            <Route path={"/login"} element={<Login />} />
            <Route path={"/*"} element={<Navigate to={"/login"} />} />
          </>
        )}
        <Route path="/components" element={<Items />} />
      </Routes>
    </Suspense>
  );
};
const delayLazy = (func) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(func()), 0);
  });
};

const mapStateToProps = (state) => ({
  userLogged: state.app.userLogged,
});

export default connect(mapStateToProps)(App);
