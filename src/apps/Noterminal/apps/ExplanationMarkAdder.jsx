import React, { forwardRef, useImperativeHandle } from 'react';

const ExplanationMarkAdder = forwardRef(({ output }, ref) => {
  // This method processes the input by appending an exclamation mark.
  const processInput = (input) => {
    if (output && output.current && output.current.writeln) {
      output.current.writeln(`${input}!`);
    }
  };

  useImperativeHandle(ref, () => ({
    processInput,
  }));

  return null;
});

export default ExplanationMarkAdder;
