import { useActor } from "@xstate/react";
import { FC, ReactElement } from 'react'
import { ToDo as ToDoModel } from "../../models/ToDo";
import { ToDoService } from '../../services/ToDoService'

interface ToDoProps {
    item: ToDoModel
  }
  
const ToDo: FC<ToDoProps> = ({
  item
}): ReactElement => {

  const [, sendToMachine] = useActor(ToDoService)

  return (
    <div key={item.id}>
      <button
        onClick={() => {
          sendToMachine({
            type: "TOGGLE_TODO_DONE",
            toDoItem: item
          });
        }}
      >
        {item.done ? "Reopen " : "Done "}
        <span role="img" aria-label="done">
          {item.done ? "↩" : "✅"}
        </span>
      </button>
      <button
        onClick={() => {
          sendToMachine({
            type: "TODO_DELETED",
            toDoItem: item
          });
        }}
      >
        Delete
        <span role="img" aria-label="delete">
          ❌
        </span>
      </button>
      <span
        className={
          item.done
            ? "todoDone"
            : "todoOutstanding"
        }
      >
        {item.title}
      </span>
    </div>
  );
};

export default ToDo;