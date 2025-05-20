import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);
  private API_URL = 'http://peppeponte.duckdns.org:5000';

  constructor(private http: HttpClient) {
    this.init();
  }

  init() {
    const userId = localStorage.getItem('user_id');
    this.authState.next(!!userId);
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, { username, password }).pipe(
      tap((res: any) => {
        if (res.user_id) {
          localStorage.setItem('user_id', res.user_id);
          this.authState.next(true);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.authState.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  getUserId(): string | null {
    return localStorage.getItem('user_id');
  }
}