import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private API_URL = 'https://api.peppeponte.duckdns.org';

  constructor(private http: HttpClient) {}

  createGame(userId: string, vsCpu: boolean, options: any): Observable<any> {
    return this.http.post(`${this.API_URL}/create_game`, {
      user_id: userId,
      vs_cpu: vsCpu,
      ...options
    });
  }
  async checkCanCreate(gameId: string): Promise<boolean> {
    if (!gameId) return true;

    try {
      const res: any = await this.http.get(`${this.API_URL}/game_state/${gameId}`).toPromise();
      const status = res?.game?.status;
      if (status !== 'finished') {
        return false;
      } else {
        localStorage.removeItem('game_id');
        return true;
      }
    } catch (err) {
      console.error('Errore:', err);
      return true; // fallback: permetti creazione
    }
  }
  listGames(userId: string) {
    return this.http.get<any>(`${this.API_URL}/lista_games/${userId}`);
  }

  joinGame(userId: string) {
    return this.http.post<any>(`${this.API_URL}/join_game`, { user_id: userId });
  }


}
