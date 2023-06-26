import { createContext, useState } from "react";

import PropTypes from "prop-types";
import { useUpdatedStats } from "../../src/hooks/useUpdatedStats";

export const  SelectedContext = createContext();

export const  SelectedProvider = ({ children }) => {
  const [ selected, setSelected ] = useState(null);
  const stats = useUpdatedStats(selected);

  return (
    < SelectedContext.Provider
      value={{ stats, selected, setSelected }}
    >
      {children}
    </ SelectedContext.Provider>
  );
};
 SelectedProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
