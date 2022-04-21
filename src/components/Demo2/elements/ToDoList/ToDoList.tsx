import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { useActor } from '@xstate/react'
import { ToDoService } from '../../services/ToDoService'
import ToDo from '../ToDo';
import './ToDoList.css';
import { fetchToDos } from '../../../../services/api';
import ToDoForm from '../ToDoForm';


function ToDoList() {
  const [machineState, sendToMachine] = useActor(ToDoService);

  // set up react-query with `todos` query key
  const { status, data } = useQuery("todos", fetchToDos);

  /** respond to changes of the query data
   * NOTE: the onSuccess callback of react-query could also be used for this
   * but it will only be run when the data update is the result of a fetch,
   * not when the local queryCache has been updated by other means
   */
  useEffect(() => {
    if (status === "success") {
      sendToMachine({ type: "DATA_UPDATE", newToDoList: data });

    } else if (status === "error") {
      sendToMachine("DATA_LOAD_ERROR");
    }
  }, [data, status, sendToMachine]);

  return (
    <div className="demo-2">
      <h1>XState and react-query ToDo App</h1>

      {machineState.matches("initialising") && <div>loading...</div>}
      {machineState.matches("dataLoadingError") && (
        <div>Couldn't load ToDos from server. Will retry automatically ...</div>
      )}
      {machineState.matches("idle") && (
        <>
          {machineState.context.todos.map((item, index) =>
            <ToDo
              key={index}
              item={item}
            />
          )}
        </>
      )}
      <ToDoForm />
    </div>
  );
}

export default ToDoList;