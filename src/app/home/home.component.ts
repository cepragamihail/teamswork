import { Component } from '@angular/core';
import { first } from 'rxjs/operators';

import { User, Chantier } from '../_models';
import { UserService, AuthenticationService, ChantierService } from '../_services';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

    loading = false;
    currentUser: User;
    userFromApi: User;
    chantiers: Chantier[] = [];
    panelOpenState = false;

    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private chantierService: ChantierService
    ) {
        this.currentUser = this.authenticationService.currentUserValue;
    }

    ngOnInit() {
        this.loading = true;
        this.userService.getById(this.currentUser.id).pipe(first()).subscribe(user => {
            this.loading = false;
            this.userFromApi = user;
        });

        this.chantierService.getAll().pipe(first()).subscribe(chantiers => {
            this.loading = false;
            this.chantiers = chantiers;
        });
    }

}