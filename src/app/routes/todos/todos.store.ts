
import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { v4 as uuidv4 } from 'uuid';
import {
  Store,
  createActionGroup,
  createFeature,
  createReducer,
  createSelector,
  emptyProps,
  on,
  props,
} from '@ngrx/store';
import { randomUUID } from 'crypto';
import { catchError, exhaustMap, map, of } from 'rxjs';
import { TodosService } from './todos.service';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type TodoState = {
  todos: Todo[];
};

export const initialState: TodoState = {
  todos: [],
};

export const todosActions = createActionGroup({
  source: 'Todos',
  events: {
    addTodo: props<{ title: string }>(), // [Todos] addTodo
    editTodo: props<{ id: string; title: string }>(),
    completeTodo: props<{ id: string }>(),
    removeTodo: props<{ id: string }>(),
    resetTodos: emptyProps(),
    loadTodos: emptyProps(),
    loadTodosSuccess: props<{ todos: Todo[] }>(),
    loadTodosFailure: props<{ error: string }>(),
  },
});

export const todosFeature = createFeature({
  name: 'todos',
  reducer: createReducer(
    initialState,
    on(todosActions.addTodo, (state, action) => ({
      ...state,
      todos: [
        { id: uuidv4(), title: action.title, completed: false },
        ...state.todos,
      ],
    })),

    on(todosActions.loadTodosSuccess, (state, action) => ({
      ...state,
      todos: action.todos,
      ...state.todos
    }))
  ),
  extraSelectors: ({ selectTodos }) => ({
    selectHasTodos: createSelector(selectTodos, (todos) => todos.length > 0),
    selectCompletedTodos: createSelector(selectTodos, (todos) =>
      todos.filter((todo) => todo.completed)
    ),
  }),
});

export const loadTodos$ = createEffect(
  () => {
    const todosService = inject(TodosService);

    return inject(Actions).pipe(
      ofType(todosActions.loadTodos),
      exhaustMap(() =>
        todosService.getTodos().pipe(
          map((todos) => todosActions.loadTodosSuccess({ todos })),
          catchError((error) => of(todosActions.loadTodosFailure(error)))
        )
      )
    );
  },
  { functional: true }
);

export function injectTodosFeature() {
  const store = inject(Store);

  return {
    addTodo: (title: string) => store.dispatch(todosActions.addTodo({ title })),
    removeTodo: (id: string) => store.dispatch(todosActions.removeTodo({ id })),
    resetTodos: () => store.dispatch(todosActions.resetTodos()),
    loadTodos: () => store.dispatch(todosActions.loadTodos()),
    todos: store.selectSignal(todosFeature.selectTodos),
    hasTodos: store.selectSignal(todosFeature.selectHasTodos),
    completedTodos: store.selectSignal(todosFeature.selectCompletedTodos),
  };
}
