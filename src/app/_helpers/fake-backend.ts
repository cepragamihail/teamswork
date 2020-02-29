import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

import { User, Role, Chantier, Task, Material } from '../_models';

const users: User[] = [
    { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', role: Role.Admin },
    { id: 2, username: 'user', password: 'user', firstName: 'Normal', lastName: 'User', role: Role.User }
];

const materials: Material[] = [
  { id: 1, name: 'Material_name_001', link: 'https://en.wikipedia.org/wiki/Brick', image: 'https://previews.123rf.com/images/fotoall/fotoall1711/fotoall171100556/90812246-a-pile-of-bricks-background-building-materials.jpg', toDo: 123, done: 0, details: 'Material 001 details' },
  { id: 2, name: 'Material_name_002', link: 'https://en.wikipedia.org/wiki/Brick', image: 'https://previews.123rf.com/images/fotoall/fotoall1711/fotoall171100556/90812246-a-pile-of-bricks-background-building-materials.jpg', toDo: 345, done: 12, details: 'Material 002 details' },
  { id: 3, name: 'Material_name_003', link: 'https://en.wikipedia.org/wiki/Brick', image: 'https://previews.123rf.com/images/fotoall/fotoall1711/fotoall171100556/90812246-a-pile-of-bricks-background-building-materials.jpg', toDo: 567, done: 432, details: 'Material 003 details' },
];

const tasks: Task[] = [
  { id: 1, name: 'Task_001', details: 'Task 001 details',  materials: [ materials[0] ] },
  { id: 2, name: 'Task_002', details: 'Task 002 details',  materials: [ materials[1], materials[0] ]},
  { id: 3, name: 'Task_003', details: 'Task 003 details',  materials: [ materials[2], materials[1] ]},
];

const chantiers: Chantier[] = [
  { id: 1, name: 'Chantier_001', conductor: 'Conductor_001', address: 'Address_001', location: 'https://www.google.com/maps/search/?api=1&query=50.866759,4.320649', phone: '+40-730-394-930', details: 'Chantier 001 details', tasks: tasks },
  { id: 2, name: 'Chantier_002', conductor: 'Conductor_002', address: 'Address_002', location: 'https://www.google.com/maps/search/?api=1&query=50.866759,4.320649', phone: '+40-730-394-930', details: 'Chantier 002 details', tasks: tasks },
  { id: 3, name: 'Chantier_003', conductor: 'Conductor_003', address: 'Address_003', location: 'https://www.google.com/maps/search/?api=1&query=50.866759,4.320649', phone: '+40-730-394-930', details: 'Chantier 003 details', tasks: tasks },
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/users/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/users') && method === 'GET':
                    return getUsers();
                case url.match(/\/users\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match('/chantiers') && method === 'GET':
                    return getChantiers();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }

        }

        // route functions

        function authenticate() {
            const { username, password } = body;
            const user = users.find(x => x.username === username && x.password === password);
            if (!user) return error('Username or password is incorrect');
            return ok({
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                token: `fake-jwt-token.${user.id}`
            });
        }

        function getUsers() {
            if (!isAdmin()) return unauthorized();
            return ok(users);
        }

        function getChantiers() {
          return ok(chantiers);
        }

        function getUserById() {
            if (!isLoggedIn()) return unauthorized();

            // only admins can access other user records
            if (!isAdmin() && currentUser().id !== idFromUrl()) return unauthorized();

            const user = users.find(x => x.id === idFromUrl());
            return ok(user);
        }

        // helper functions

        function ok(body) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'unauthorized' } });
        }

        function error(message) {
            return throwError({ status: 400, error: { message } });
        }

        function isLoggedIn() {
            const authHeader = headers.get('Authorization') || '';
            return authHeader.startsWith('Bearer fake-jwt-token');
        }

        function isAdmin() {
            return isLoggedIn() && currentUser().role === Role.Admin;
        }

        function currentUser() {
            if (!isLoggedIn()) return;
            const id = parseInt(headers.get('Authorization').split('.')[1]);
            return users.find(x => x.id === id);
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};