import { interpret } from 'xstate'
import { toDoMachine } from '../machines/ToDoMachine'

const machine = toDoMachine.withConfig({
    // ..
})

export const ToDoService = interpret(
  machine,
  // {devTools: true}
)
ToDoService.start()
