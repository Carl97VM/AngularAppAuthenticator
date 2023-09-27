import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environments } from 'src/environments/environments';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthStatus, CheckTokenResponse, LoginResponse, User } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl: string = environments.baseUrl;
  private http = inject(HttpClient);

  // Variables privadas
  private _currentUser = signal<User | null>(null);
  private _authStatus = signal<AuthStatus>( AuthStatus.checking );

  //! Varaible para el mundo externo
  public currentUser = computed( () => this._currentUser() );
  public authStatus = computed( () => this._authStatus() );

  constructor() {
    this.checkAuthStatus().subscribe();
  }
  private setAuthentication(user: User, token: string):boolean {
    this._currentUser.set( user );
    this._authStatus.set( AuthStatus.authenticated );
    localStorage.setItem('token', token );
    return true;
  }

  login(email: string, password: string): Observable<boolean> {

    const url = `${ this.baseUrl }/auth/login`
    const body = {
      email,
      password
    }

    return this.http.post<LoginResponse>( url, body )
    .pipe(
      // Refactorizacion
      // tap( ({user, token}) => {
      //   this._currentUser.set( user );
      //   this._authStatus.set( AuthStatus.authenticated );
      //   localStorage.setItem('token', token );
      //   console.log("Login",{user, token});

      // }),
      // map( () => true ),
      // Refactorizacion
      map(
        ({user, token}) => this.setAuthentication(user, token)
      ),
      catchError( err => throwError( () => err.error.message ) )
    );

    // falta manejar errores

  }

  checkAuthStatus(): Observable<boolean> {

    const url = `${this.baseUrl}/auth/check-token`;
    const token = localStorage.getItem('token');

    if(!token){
      this.Logout();
      return of(false);
    };

    const headers = new HttpHeaders()
    .set('Authorization',`Bearer ${token}`);

    return this.http.get<CheckTokenResponse>(url, {headers})
      .pipe(
        // map( ({ token, user }) => {
        //   this._currentUser.set( user );
        //   this._authStatus.set( AuthStatus.authenticated );
        //   localStorage.setItem('token', token );
        //   console.log("checAuthStatus",{user, token});
        //   return true;
        // } ),
        map(
          ({user, token}) => this.setAuthentication(user, token)
        ),
        catchError( () => {
          this._authStatus.set( AuthStatus.notAuthenticated );
          return of(false);
        } )
      );
  }
  Logout(){
    localStorage.removeItem('token') ;
    this._currentUser.set(null);
    this._authStatus.set( AuthStatus.notAuthenticated );
  }
}
