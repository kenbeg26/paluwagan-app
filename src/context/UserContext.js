import React from 'react'

// easier access by avoiding the use of prop-drilling
const UserContext = React.createContext();

// component allows other components to consume/use the context object and supply the necessary information needed to the context object.
export const UserProvider = UserContext.Provider;

export default UserContext;