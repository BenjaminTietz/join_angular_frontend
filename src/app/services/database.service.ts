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

  private contactsUrl = `${environment.baseRefUrl}/contact/`;
  private contactsSubject = new BehaviorSubject<any[]>([]);
  public contacts$ = this.contactsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadTasks();
    this.loadContacts();
  }

  private loadTasks() {
    this.http.get<any[]>(this.tasksUrl).subscribe((tasks) => {
      this.tasksSubject.next(tasks);
    });
  }

  public getTasks(): Observable<any[]> {
    return this.tasks$;
  }

  private loadContacts() {
    this.http.get<any[]>(this.contactsUrl).subscribe((contacts) => {
      this.contactsSubject.next(contacts);
    });
  }

  public getContacts(): Observable<any[]> {
    return this.contacts$;
  }
}
