import React from 'react';
import { Slot } from 'expo-router';
import ContextProvider from '../context/ContextProvider';

export default function App() {
    // bộc tất cả các đường dẫn thông qua slot tag
  return (
    <ContextProvider>    
      <Slot /> 
    </ContextProvider>
  );
}
