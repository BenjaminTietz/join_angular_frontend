import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private tasksUrl = `${environment.baseRefUrl}/task/`;
  private tasksSubject = new BehaviorSubject<any[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTasks();
  }

  private loadTasks() {
    this.http.get<any[]>(this.tasksUrl).subscribe((tasks) => {
      this.tasksSubject.next(tasks);
    });
  }

  public getTasks(): Observable<any[]> {
    return this.tasks$;
  }
}
