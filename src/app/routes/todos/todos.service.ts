import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Todo } from './todos.store';

@Injectable({
  providedIn: 'root',
})
export class TodosService {
  todosUrl = 'https://jsonplaceholder.typicode.com/todos';

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.todosUrl);
  }

  constructor( private http: HttpClient){}
}
