import { assign } from "xstate";
import { createMachine } from 'xstate'
import {v4 as uuidv4} from 'uuid';
import { ToDo } from "../models/ToDo";
import { queryClient } from '../../../services/queryClient';

export interface DeleteToDoResponse {
    id: string
    success: boolean
}

const updateTodoDoneInApi = (context: ToDoMachineContext, event: any): Promise<ToDo> => {
  return new Promise(resolve => {
    console.log("changing todo status in API");
    const updatedToDo: ToDo = {
        ...event.toDoItem,
        done: !event.toDoItem.done
    }
    // setTimeout(() => 
    resolve(updatedToDo)
    // , 500);
  });
};

const deleteTodo = (context: ToDoMachineContext, event: any): Promise<DeleteToDoResponse> => {
  return new Promise(resolve => {
    console.log("deleting todo from API");
    const deleteToDoResponse: DeleteToDoResponse = {
        id: event.toDoItem.id,
        success: true
    }
    // setTimeout(() => 
    resolve(deleteToDoResponse)
    // , 500);
  });
};

const addTodo = (context: ToDoMachineContext, event: any): Promise<ToDo> => {
  return new Promise(resolve => {
    console.log("creating todo in API");
    const newToDo: ToDo = {
        id: uuidv4(),
        title: event.newToDoTitle,
        done: false
    }
    console.log(newToDo);
    // setTimeout(() =>
      resolve(newToDo)
      // , 500
    // );
  });
};


// Perso

export interface ToDoMachineContext {
  todos: ToDo[]
}
export type ToDoMachineEvents =
  | { type: 'DELETE' }
  | { type: 'ADD_TODO'; newToDoTitle: string; }
  | { type: 'DATA_UPDATE'; newToDoList: ToDo[]; }
  | { type: 'DATA_LOAD_ERROR' }
  | { type: 'TOGGLE_TODO_DONE', toDoItem: ToDo }
  | { type: 'TODO_DELETED', toDoItem: ToDo }

type ToDoTypedStates =
  | {
      value: 'initialising'
      context: ToDoMachineContext
    }
  | {
      value: 'idle'
      context: ToDoMachineContext
    }
  | {
      value: 'togglingTodoDone'
      context: ToDoMachineContext
    }
  | {
      value: 'deletingTodo'
      context: ToDoMachineContext
    }
  | {
      value: 'addingTodo'
      context: ToDoMachineContext
    }
  | {
      value: 'dataLoadingError'
      context: ToDoMachineContext
    }

export const toDoMachine = createMachine<ToDoMachineContext, ToDoMachineEvents, ToDoTypedStates>({
    id: "todoMachine",
    initial: "initialising",
    context: {
      todos: []
    },
    on: {
      // permanently listen to data updates from react-query
      DATA_UPDATE: { actions: "updateData" }
    },
    states: {
      initialising: {
        on: {
          // first data received from react-query will move machine to idle
          DATA_UPDATE: {
            actions: "updateData",
            target: "idle"
          },
          DATA_LOAD_ERROR: "dataLoadingError"
        }
      },
      idle: {
        on: {
          ADD_TODO: "addingTodo",
          TOGGLE_TODO_DONE: "togglingTodoDone",
          TODO_DELETED: "deletingTodo"
        }
      },
      togglingTodoDone: {
        invoke: {
          src: updateTodoDoneInApi,
          onDone: { target: "idle", actions: ["updateTodoInQueryCache"] },
          onError: "idle"
        }
      },
      deletingTodo: {
        invoke: {
          src: deleteTodo,
          onDone: { target: "idle", actions: ["deleteTodoFromQueryCache"] },
          onError: "idle"
        }
      },
      addingTodo: {
        invoke: {
          src: addTodo,
          onDone: { target: "idle", actions: ["addTodoInQueryCache"] },
          onError: "idle"
        }
      },
      dataLoadingError: {
        on: {
          DATA_UPDATE: {
            actions: "updateData",
            target: "idle"
          }
        }
      }
    }
  },
  {
    actions: {
      updateData: assign({
        todos: (_, event: any) => {
          console.log("storing data from react-query in state machine");
          return event.newToDoList;
        }
      }),
      /**
       * The actions below take what is returned from the API and directly
       * merge the changes into the local query cache. This prevents a double
       * fetch of the entire set of Todos.
       */
      updateTodoInQueryCache: (context: any, event: any) => {
        console.log("deleting todo in query cache");
        let todos = queryClient.getQueryData("todos") as ToDo[];
        todos = todos.map(t => t.id !== event.data.id ? t : event.data);

        queryClient.setQueryData("todos", todos);
      },
      deleteTodoFromQueryCache: (context: any, event: any) => {
        console.log("deleting todo in query cache");
        let todos = queryClient.getQueryData("todos") as ToDo[];
        todos = todos.filter(item => item.id !== event.data.id)

        queryClient.setQueryData("todos", todos);
      },
      addTodoInQueryCache: (context: any, event: any) => {
        console.log("adding todo in query cache");
        const todos = queryClient.getQueryData("todos") as ToDo[];
        todos.push(event.data)

        queryClient.setQueryData("todos", todos);
      }
    }
  }
);
