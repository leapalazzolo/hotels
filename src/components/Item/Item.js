import React from "react";
import PropTypes from "prop-types";

const Item = ({ icon, data }) => {
  return (
    <div className="control">
      <div className={"tags has-addons"}>
        <span className="tag is-medium is-info">
          <i className={`fas fa-${icon}`}></i>
        </span>
        <span className="tag is-medium">{data}</span>
      </div>
    </div>
  );
};

Item.propTypes = {
  icon: PropTypes.string.isRequired,
  data: PropTypes.string,
};
export default Item;
