import React from 'react';
//higher order component
//taking in props and rendering out children of the props
// only render what's being wrapped
const Hoc = (props) => (
    props.children
)

export default Hoc; 