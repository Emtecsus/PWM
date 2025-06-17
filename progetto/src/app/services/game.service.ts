import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private API_URL = 'https://api.peppeponte.duckdns.org';

  constructor(private http: HttpClient) {}

  createGame(userId: string, vsCpu: boolean): Observable<any> {
    return this.http.post(`${this.API_URL}/create_game`, { user_id: userId, vs_cpu: vsCpu });
  }

  setSpecialCells(gameId: string, userId: string, cells: any): Observable<any> {
    return this.http.post(`${this.API_URL}/set_special_cells`, {
      game_id: gameId,
      user_id: userId,
      cells: cells
    });
  }

  generateRandomSpecialCells(gameId: string, userId: string, numCells: number): Observable<any> {
    return this.http.post(`${this.API_URL}/generate_random_special_cells`, {
      game_id: gameId,
      user_id: userId,
      num_cells: numCells
    });
  }
}
