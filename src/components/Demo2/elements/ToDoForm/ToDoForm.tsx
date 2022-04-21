import { useState } from 'react';
import { useActor } from '@xstate/react'
import { ToDoService } from '../../services/ToDoService'


function ToDoForm() {
  const [newToDoTitle, setNewToDoTitle] = useState("");
  const [, sendToMachine] = useActor(ToDoService)

  const onToDoTitleChange = (evt: any) => {
    setNewToDoTitle(evt.currentTarget.value);
  };

  const onToDoAddClick = () => {
    sendToMachine({ type: "ADD_TODO", newToDoTitle });
  };

  return (
    <div>
      <p>Add ToDo:</p>
      <input onChange={onToDoTitleChange} type="text" size={50} />
      <button onClick={onToDoAddClick}>Add</button>
    </div>
  );
}

export default ToDoForm;